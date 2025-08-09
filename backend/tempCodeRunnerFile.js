app.post('/convert-code', async (req, res) => {
    try {
        const { code, targetLanguage } = req.body;
        const convertedCode = await processCodeWithGenerativeAI(code, `Convert the following code to ${targetLanguage}:   Provide only the converted code, no headings, no explanations, and no additional text. Ensure proper formatting and do not include any comments or other text.
`);