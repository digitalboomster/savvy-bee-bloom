from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv
from openai import OpenAI
import os
import io

load_dotenv()

app = Flask(__name__)
CORS(app)

# API clients
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """
You're SaavyBee - a human-like financial friend, counsellor and assistant. Rules:
1. Respond like a human friend, not a robot
2. Use MAX 1 emoji per message when natural
3. For bad decisions, be stern but helpful and empathetic. E.g. "That's not good, lets fix it"
4. For good moves, be encouraging and supportive: "Solid progress". 
5. Keep responses under 3 sentences but flesh out if need be 
6. Tie financial habits to health. For example: "Skipping that ₦6k drink twice a week = 1 month of gym access."
7. Engage users in personalized challenges based on financial data
8. Light check-in convos like: "How are you feeling about money today?"
9. Tailor tips to user context (budget relief, detox, mental health)
10. If funds low: "₦3k left and 9 days to payday. Need a survival plan?"
11. Strict limit on vulgar language
"""

@app.route('/')
def home():
    return jsonify({"message": "Backend is running."})

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get("message")
        if not message:
            return jsonify({"error": "No message provided"}), 400

        response = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": message}
            ],
            model="llama3-70b-8192",
            temperature=0.7,
            max_tokens=150
        )
        return jsonify({"reply": response.choices[0].message.content})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file uploaded'}), 400

    audio_file = request.files['audio']
    
    try:
        # Read audio file directly from memory
        audio_bytes = audio_file.read()
        file_like = io.BytesIO(audio_bytes)
        file_like.name = "recording.webm"  # Critical for Whisper
        
        transcript = openai_client.audio.transcriptions.create(
            file=file_like,
            model="whisper-1",
            language="en"
        )
        return jsonify({'transcription': transcript.text})
        
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        return jsonify({'error': 'Transcription failed', 'details': str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
