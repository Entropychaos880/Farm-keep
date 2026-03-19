const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Groq } = require("groq-sdk");
const axios = require('axios');
const Expense = require('../models/Expense');
const FarmLog = require('../models/FarmLog');
const User = require('../models/User');
const { getSystemPrompt } = require('../utils/prompts');

// Initialize Groq safely
let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// 1. Weather Cache Logic
let weatherCache = { data: null, timestamp: 0, region: '' };

const getForecastForAI = async (region) => {
  if (!region) return "Weather unavailable.";
  try {
    const now = Date.now();
    if (weatherCache.data && weatherCache.region === region && (now - weatherCache.timestamp < 900000)) {
      return weatherCache.data;
    }

    const geoRes = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(region)}&count=1&format=json`,
      { 
        timeout: 4000,
        headers: { 'User-Agent': 'FarmKeep/1.0 (stargenius@university.edu)' } 
      }
    );

    if (!geoRes.data.results) return "Weather unavailable.";
    const { latitude, longitude } = geoRes.data.results[0];
    
    const weatherRes = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,precipitation_probability_max&timezone=Africa%2FNairobi&forecast_days=3`,
      { timeout: 4000 }
    );

    const daily = weatherRes.data.daily;
    let forecast = `3-Day Forecast for ${region}:\n`;
    for (let i = 0; i < 3; i++) {
      forecast += `- Day ${i + 1}: ${daily.temperature_2m_max[i]}°C, Rain: ${daily.precipitation_probability_max[i]}%\n`;
    }

    weatherCache = { data: forecast, timestamp: now, region: region };
    return forecast;
  } catch (error) {
    return "Weather unavailable.";
  }
};

// --- MAIN DIAGNOSE & LOGGING FUNCTION ---
exports.diagnoseCrop = async (req, res) => {
  try {
    // 1. EXTRACT DATA FIRST
    const { userId, prompt: userMessage, context: farmContext } = req.body;
    const Product = require('../models/Product');

    // 2. RUN PRODUCT RECOMMENDATION LOGIC
    let recommendations = "";
    if (userMessage && (userMessage.toLowerCase().includes('treat') || userMessage.toLowerCase().includes('medicine'))) {
        try {
            const products = await Product.find({ inStock: true }).limit(5);
            recommendations = products.map(p => 
                `- ${p.name} (${p.activeIngredient}): KES ${p.estimatedPrice.min}-${p.estimatedPrice.max}. Link: ${p.productUrl}`
            ).join('\n');
        } catch (err) {
            console.error("Product fetch error:", err.message);
        }
    }

    // 3. FETCH USER & WEATHER
    const user = await User.findById(userId);
    const weatherData = user ? await getForecastForAI(user.region) : "Weather unavailable.";

    // 4. GENERATE MASTER PROMPT (Passing the new recommendations variable)
    const masterPrompt = getSystemPrompt(farmContext, weatherData, userMessage, recommendations);

    let responseText = "";
    let success = false;
    let usedModel = "";

    // PATH 1: Try Gemini 1.5 Flash
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([masterPrompt]);
        responseText = await result.response.text();
        success = true;
        usedModel = "Gemini";
      } catch (e) {
        console.log("Gemini fallback...");
      }
    }

    // PATH 2: Try Groq with Llama 3.3 70B
    if (!success && groq) {
      try {
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: masterPrompt }],
          model: "llama-3.3-70b-versatile",
        });
        responseText = completion.choices[0].message.content;
        success = true;
        usedModel = "Llama-70B";
      } catch (e) {
        console.error("Groq also failed:", e.message);
      }
    }

    if (!success) {
      return res.status(503).json({ success: false, error: "AI Busy." });
    }

    // --- ACTION PARSER ---
    const actionMatch = responseText.match(/\[ACTION:\s*([\s\S]*?)\s*\]/);
    let actionTaken = false;

    if (actionMatch && userId) {
      try {
        let cleanJson = actionMatch[1].trim();
        cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '').trim();

        const actionData = JSON.parse(cleanJson);
        
        if (actionData.type === 'FarmLog') {
          await FarmLog.create({ userId, activityType: actionData.activityType, description: actionData.description, date: new Date() });
        } 
        else if (actionData.type === 'Expense') {
          const cleanAmount = String(actionData.amount).replace(/[^0-9]/g, '');
          await Expense.create({ 
            userId, type: 'Expense', 
            amount: Number(cleanAmount) || 0, 
            category: actionData.category || 'General', 
            description: actionData.description, 
            date: new Date() 
          });
        }
        else if (actionData.type === 'Income' || actionData.type === 'Sale') {
          const cleanAmount = String(actionData.amount).replace(/[^0-9]/g, '');
          await Expense.create({ 
            userId, type: 'Income', 
            amount: Number(cleanAmount) || 0, 
            category: 'Harvest Sale', 
            description: actionData.description, 
            date: new Date() 
          });
        }
        
        actionTaken = true;
        responseText = responseText.replace(/\[ACTION:[\s\S]*?\]/g, '').trim();
        
        if (responseText === "") {
            responseText = "I have successfully logged that in your records.";
        }
      } catch (e) { 
        console.error("Action parse error:", e.message); 
      }
    }

    responseText = responseText.replace(/```[\s\S]*?```/g, '').trim();

    return res.status(200).json({ 
      success: true, 
      response: responseText, 
      actionTaken,
      usedModel
    });

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
// --- GENERATE INSIGHTS FUNCTION ---
exports.generateInsights = async (req, res) => {
  try {
    const id = req.query.userId || req.body.userId;

    if (!id) {
        return res.status(400).json({ success: false, error: "User ID is required for insights." });
    }

    const recentExpenses = await Expense.find({ userId: id }).sort({ date: -1 }).limit(10);
    const recentLogs = await FarmLog.find({ userId: id }).sort({ date: -1 }).limit(10);

    // 1. UPDATED PROMPT: Force the AI to return a JSON array
    const prompt = `
      You are an expert agricultural AI assistant. Analyze the farmer's recent data.
      Return EXACTLY a JSON array containing 1 to 3 insight objects. 
      Each object must have two keys: "title" (a short, punchy alert title) and "message" (1-2 sentences of actionable advice).
      Do not include any other text, markdown, or code blocks. Just the raw JSON array.
      
      Recent Finances: ${JSON.stringify(recentExpenses)}
      Recent Farm Activities: ${JSON.stringify(recentLogs)}
    `;

    let insightsText = "";
    let success = false;

    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([prompt]);
        insightsText = await result.response.text();
        success = true;
      } catch (e) {
        console.log("Gemini insights fallback...");
      }
    }

    if (!success && groq) {
      try {
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
        });
        insightsText = completion.choices[0].message.content;
        success = true;
      } catch (e) {
        console.error("Groq insights failed:", e.message);
      }
    }

    if (!success) {
      return res.status(503).json({ success: false, error: "AI Busy." });
    }

    // 2. PARSE THE JSON: Clean up any accidental markdown and convert to an array
    let parsedInsights = [];
    try {
      let cleanText = insightsText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedInsights = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse AI insights into JSON:", e.message);
      // Fallback just in case the AI messes up the format
      parsedInsights = [{ title: "Farm Update", message: insightsText.substring(0, 100) + "..." }];
    }

    // 3. SEND AS 'data' TO MATCH YOUR FRONTEND
    return res.status(200).json({ 
      success: true, 
      data: parsedInsights 
    });

  } catch (error) {
    console.error("Insights Error:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};