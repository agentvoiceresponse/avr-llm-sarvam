# Agent Voice Response - Sarvam Integration

[![Discord](https://img.shields.io/discord/1347239846632226998?label=Discord&logo=discord)](https://discord.gg/DFTU69Hg74)
[![GitHub Repo stars](https://img.shields.io/github/stars/agentvoiceresponse/avr-llm-sarvam?style=social)](https://github.com/agentvoiceresponse/avr-llm-sarvam)
[![Docker Pulls](https://img.shields.io/docker/pulls/agentvoiceresponse/avr-llm-sarvam?label=Docker%20Pulls&logo=docker)](https://hub.docker.com/r/agentvoiceresponse/avr-llm-sarvam)
[![Ko-fi](https://img.shields.io/badge/Support%20us%20on-Ko--fi-ff5e5b.svg)](https://ko-fi.com/agentvoiceresponse)


This repository showcases the integration between **Agent Voice Response** and **Sarvam**. It exposes a small HTTP service that receives chat `messages` and proxies them to Sarvam using the official `sarvamai` SDK, returning the model output to the client.

Sarvam is especially performant for **Indic (Indian) languages** (e.g. Hindi), making it a strong choice for Indian-language voice and chat experiences.

## Prerequisites

To set up and run this project, you will need:

1. **Node.js** and **npm** installed.
2. A **Sarvam API key** with access to chat completions.

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/agentvoiceresponse/avr-llm-sarvam.git
cd avr-llm-sarvam
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root of the project to store your configuration. You will need to add the following variables:

```bash
PORT=6051
SARVAM_API_KEY=sk_
# Optional
SARVAM_MODEL=sarvam-m
```

### 4. Running the Application

Start the application by running the following command:

```bash
npm start
```

Alternatively:

```bash
node index.js
```

The server will start on the port defined in the environment variable (default: 6051).

## How It Works

The service accepts a chat payload (`messages`) and calls Sarvam chat completions. The response is returned to the client as a JSON object.

### Key Components

- **Express.js Server**: receives requests and returns responses.
- **Sarvam API Integration**: uses `sarvamai` to call `chat.completions`.
- **SSE-compatible response headers**: the endpoint sets `text/event-stream` headers but currently writes a single JSON payload and closes the connection.

### Example Code Overview

1. **Input validation**: ensures `messages` is present.
2. **Sarvam request**: `client.chat.completions({ model, messages })`
3. **Output**: returns `{ type: "text", content: "<model output>" }`

## API Endpoints

### POST `/prompt-stream`

This endpoint accepts a JSON payload containing chat `messages`, forwards them to Sarvam, and returns the assistant response content.

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ]
}
```

**Response:**
- **Content-Type**: `text/event-stream`
- **Body** (single JSON payload):

```json
{ "type": "text", "content": "..." }
```

### Quick test with curl

```bash
curl -N -X POST "http://localhost:6051/prompt-stream" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Say hello in Italian."}]}'
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SARVAM_API_KEY` | Sarvam API subscription key | Yes | - |
| `SARVAM_MODEL` | Sarvam model name | No | `sarvam-m` |
| `PORT` | The port on which the server will listen | No | `6051` |

## Error Handling

The application includes comprehensive error handling:
- Validates required fields (`messages`)
- Handles Sarvam API communication errors
- Returns appropriate HTTP status codes and error messages
- Logs detailed error information for debugging

## Docker Support

This application can be containerized using Docker. A Dockerfile is included for easy deployment and scaling.

```bash
# Build the image
docker build -t avr-llm-sarvam .

# Run with environment file
docker run --env-file .env -p 6051:6051 avr-llm-sarvam
```

## Support & Community

*   **GitHub:** [https://github.com/agentvoiceresponse](https://github.com/agentvoiceresponse) - Report issues, contribute code.
*   **Discord:** [https://discord.gg/DFTU69Hg74](https://discord.gg/DFTU69Hg74) - Join the community discussion.
*   **Docker Hub:** [https://hub.docker.com/u/agentvoiceresponse](https://hub.docker.com/u/agentvoiceresponse) - Find Docker images.
*   **NPM:** [https://www.npmjs.com/~agentvoiceresponse](https://www.npmjs.com/~agentvoiceresponse) - Browse our packages.
*   **Wiki:** [https://wiki.agentvoiceresponse.com/en/home](https://wiki.agentvoiceresponse.com/en/home) - Project documentation and guides.

## Support AVR

AVR is free and open-source.
Any support is entirely voluntary and intended as a personal gesture of appreciation.
Donations do not provide access to features, services, or special benefits, and the project remains fully available regardless of donations.

<a href="https://ko-fi.com/agentvoiceresponse" target="_blank"><img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Support us on Ko-fi"></a>

## License

MIT License - see the [LICENSE](LICENSE.md) file for details.
