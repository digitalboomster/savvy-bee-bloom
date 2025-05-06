
# Savvy Bee Backend

This folder contains the backend code for the Savvy Bee financial wellness chatbot.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install flask flask-cors groq
```

3. Set your Groq API key:
```bash
# Linux/Mac
export GROQ_API_KEY=your_api_key_here

# Windows
set GROQ_API_KEY=your_api_key_here
```

4. Run the backend server:
```bash
python app.py
```

The server will start on http://localhost:5000.

## API Endpoints

- `POST /chat` - Send a user message and receive a response from the AI
  - Request body: `{ "message": "Your message here" }`
  - Response: `{ "reply": "AI response here" }`
