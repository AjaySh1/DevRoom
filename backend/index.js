const express = require("express");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.get("/", (req, res) => {
    res.send("Home Page");
});

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

app.post('/convert-code', async (req, res) => {
    try {
        const { code, targetLanguage } = req.body;
        const convertedCode = await processCodeWithGenerativeAI(code, `Convert the following code to ${targetLanguage}:   Provide only the converted code, no headings, no explanations, and no additional text. Ensure proper formatting and do not include any comments or other text.
`);
        res.json({ convertedCode });
    } catch (error) {
        console.error('Error converting code:', error.message);
        res.status(500).json({ error: 'Error converting code' });
    }
});

app.post('/debug-code', async (req, res) => {
    try {
        const { code } = req.body;
        const debuggedCode = await processCodeWithGenerativeAI(code, 'Debug the following code: give me the code with minimum explaination ');
        res.json({ debuggedCode });
    } catch (error) {
        console.error('Error debugging code:', error.message);
        res.status(500).json({ error: 'Error debugging code' });
    }
});

app.post('/check-code-quality', async (req, res) => {
    try {
        const { code } = req.body;
        const qualityReport = await processCodeWithGenerativeAI(code, 'give me the time &space complexity of the given code with explaination atmost 50 words.  :');
        res.json({ qualityReport });
    } catch (error) {
        console.error('Error checking code Complexity:', error.message);
        res.status(500).json({ error: 'Error checking code Complexity' });
    }
});

app.listen(process.env.PORT, () => {
    console.log("Server Running on PORT:", process.env.PORT);
});
