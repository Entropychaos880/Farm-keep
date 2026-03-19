const axios = require('axios');

const API_KEY = "AIzaSyClHsLgTpux0i8Rm_D-IjFHAuABTGQKe-8"; // Put your working key here

async function listAvailableModels() {
  try {
    console.log("🔍 Asking Google what models are active...");
    
    const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    
    const models = response.data.models;
    
    console.log("\n✅ AVAILABLE MODELS FOR IMAGE/TEXT GENERATION:");
    console.log("-------------------------------------------------");
    
    // Filter to only show models that support text/image generation
    models.forEach(model => {
      if (model.supportedGenerationMethods.includes("generateContent")) {
        // We slice off the "models/" part to give you the exact string to use
        console.log(`➡️  ${model.name.replace('models/', '')}`);
      }
    });
    
    console.log("-------------------------------------------------\n");
    console.log("Copy one of the names above into your aiController.js!");

  } catch (error) {
    console.error("❌ Failed to list models:");
    console.error(error.response ? error.response.data : error.message);
  }
}

listAvailableModels();