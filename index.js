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

    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: 'Messages is required' });
    }

    // Normalize and sanitize messages so the sequence is always:
    // system, user, assistant, user, assistant, ...
    const sanitized = messages
        .filter(
            (m) =>
                m &&
                typeof m === 'object' &&
                typeof m.role === 'string' &&
                typeof m.content === 'string'
        )
        .map((m) => ({
            role: m.role,
            content: m.content
        }));

    const systemPrompt =
        process.env.SYSTEM_PROMPT || "You are a helpful assistant.";

    // Pick a system message (prefer the first system found), otherwise use env.
    const clientSystem = sanitized.find((m) => m.role === 'system');
    const systemMessage = clientSystem || {
        role: 'system',
        content: systemPrompt
    };

    // Keep only user/assistant, drop other roles (tool/function/etc) and all system messages.
    const convo = sanitized.filter(
        (m) => m.role === 'user' || m.role === 'assistant'
    );

    // Merge consecutive messages with the same role (prevents user,user or assistant,assistant).
    const merged = [];
    for (const m of convo) {
        const last = merged[merged.length - 1];
        if (last && last.role === m.role) {
            last.content = `${last.content}\n\n${m.content}`;
        } else {
            merged.push({ role: m.role, content: m.content });
        }
    }

    // Ensure the first non-system message is user (drop any leading assistant).
    while (merged.length > 0 && merged[0].role !== 'user') {
        merged.shift();
    }

    // If after cleaning we have nothing, inject an empty user message
    // to satisfy providers that require a user turn after system.
    const finalMessages = [
        systemMessage,
        ...(merged.length > 0 ? merged : [{ role: 'user', content: '' }])
    ];

    console.log("Messages", finalMessages);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const client = new SarvamAIClient({ apiSubscriptionKey: process.env.SARVAM_API_KEY });
        const response = await client.chat.completions({
            model: process.env.SARVAM_MODEL || 'sarvam-m',
            messages: finalMessages
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
