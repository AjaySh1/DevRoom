const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Google Generative AI model
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const processCodeWithGenerativeAI = async (code, prompt) => {
    try {
        const result = await model.generateContent(prompt + "\n\n" + code);
        const response = await result.response;
        const text = response.text();
        return text.trim();
    } catch (error) {
        console.error("Error processing code with Generative AI:", error);
        throw error;
    }
};

module.exports = processCodeWithGenerativeAI;
