/**
 * index.js
 * Entry point for the Sarvam LLM streaming application.
 * This server handles real-time streaming of LLM responses to the client.      
 *
 * @author Agent Voice Response <info@agentvoiceresponse.com>
 * @see https://www.agentvoiceresponse.com
 */
const express = require('express');
const { SarvamAIClient } = require("sarvamai");

require('dotenv').config();

const app = express();

app.use(express.json());

/**
 * Handles a prompt stream from the client and uses the Sarvam API to generate
 * a response. The response is sent back to the client as a JSON object.
 *
 * @param {Object} req - The Express request object
 * @param {Object} res - The Express response object
 */
const handlePromptStream = async (req, res) => {
    const { messages } = req.body;

    if (!messages) {
        return res.status(400).json({ message: 'Messages is required' });
    }

    console.log("Messages", messages);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const client = new SarvamAIClient({ apiSubscriptionKey: process.env.SARVAM_API_KEY });
        const response = await client.chat.completions({
            model: process.env.SARVAM_MODEL || 'sarvam-m',
            messages
        });

        console.log("Response", response.choices[0].message);

        res.write(JSON.stringify({ type: 'text', content: response.choices[0].message.content }));
        res.end();
    } catch (error) {
        console.error('Error calling Sarvam API:', error.message);
        res.status(500).json({ message: 'Error communicating with Sarvam' });
    }
}

app.post('/prompt-stream', handlePromptStream);

const port = process.env.PORT || 6051;
app.listen(port, () => {
    console.log(`Sarvam LLM streaming listening on port ${port}`);
});
