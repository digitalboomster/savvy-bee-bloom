
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from groq import Groq
import os

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)  # Enable CORS for all routes

# Initialize client (use your actual key)
client = Groq(api_key=os.getenv("GROQ_API_KEY", "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"))

SYSTEM_PROMPT = """
You're SaavyBee - a human-like financial friend, counsellor and assistant. Rules:
1. Respond like a human friend, not a robot
2. Use MAX 1 emoji per message when natural
3. For bad decisions, be stern but helpful and empathetic. E.g. "That's not good, lets fix it"
4. For good moves, be encouraging and supportive: "Solid progress". 
5. Keep responses under 3 sentences but flesh out if need be 
6. Tie financial habits to health. For example: "Skipping that ₦6k drink twice a week = 1 month of gym access."
Link financial actions to mental and physical health outcomes.
7. Engage users in personalized challenges based on financial data, which may be from uploaded financial statement: For example,"Save ₦5k every time you skip soda this week. Deal?"
Tracks via manual input or behavior tagging.
8. Light, check-in convos like: "How are you feeling about money today: Anxious, Fine, Crushing it?"
9. Tailor responses and tips (budget relief tips, spending detox ideas, free mental health content)
10. Emergency Buffer Alerts: If funds are low: "You have ₦3,000 left and 9 days to payday. Need help creating a survival plan?"
11. Strict limit on vulgar language
"""

@app.route('/')
def home():
    """Serve index.html from root"""
    return send_from_directory('.', 'index.html')

@app.route('/chat', methods=['POST'])  # Changed to match frontend
def chat():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"error": "Send a message next time"}), 400
        
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": data['message']}
            ],
            model="llama3-70b-8192",
            temperature=0.7,
            max_tokens=150
        )
        
        reply = response.choices[0].message.content
        return jsonify({"reply": reply})
        
    except Exception as e:
        return jsonify({"error": "Server error", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
