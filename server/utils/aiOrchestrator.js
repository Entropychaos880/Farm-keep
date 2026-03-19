const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Groq } = require("groq-sdk");
const axios = require('axios');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const providers = [
  {
    name: "Gemini",
    call: async (prompt) => {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    }
  },
  {
    name: "Groq-Smarter",
    call: async (prompt) => {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile", // The "smart" one
      });
      return completion.choices[0].message.content;
    }
  },
  {
    name: "Groq-Fast",
    call: async (prompt) => {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant", // The "snappy" one
      });
      return completion.choices[0].message.content;
    }
  }
];

exports.askAI = async (prompt) => {
  for (const provider of providers) {
    try {
      console.log(`🤖 Trying ${provider.name}...`);
      const response = await provider.call(prompt);
      return { text: response, model: provider.name };
    } catch (err) {
      console.error(`❌ ${provider.name} failed/quota hit. Moving to next...`);
      continue; // Try the next provider in the list
    }
  }
  throw new Error("All AI providers are currently exhausted.");
};