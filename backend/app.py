
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from groq import Groq
import os
import re
import base64
from io import BytesIO
import json

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

When analyzing receipts or financial statements:
1. Extract and summarize key information: date, total amount, merchant, individual items
2. Categorize spending into: Food, Transport, Entertainment, Utilities, Shopping, Health, etc.
3. Compare spending to average patterns and suggest areas to reduce expenses
4. Calculate total monthly spending and compare to previous months if data available
5. Suggest specific actionable savings strategies
6. Find recurring subscriptions that could be canceled
7. Link spending to long-term financial goals
8. Highlight unusual or potentially fraudulent transactions
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

@app.route('/analyze-receipt', methods=['POST'])
def analyze_receipt():
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"error": "No image data provided"}), 400
        
        # Process the image data
        image_data = data['image']
        # Remove the data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',', 1)[1]
        
        # Sample analysis result - in a real implementation we would use OCR to extract text
        # and then analyze the content with a financial model or AI
        analysis_prompt = """
        Analyze this receipt image. Extract:
        1. Store/merchant name
        2. Date of purchase
        3. Total amount
        4. Individual items and their prices if visible
        5. Category of spending
        6. Any discounts or savings
        7. Payment method if shown
        
        Then provide a brief financial analysis with:
        - How this purchase fits into typical spending patterns
        - Whether prices seem higher than average
        - A specific tip to save money related to this purchase
        - A health-related insight related to the purchase
        
        Format as JSON with these fields: merchantName, date, totalAmount, items (array), 
        category, savings, paymentMethod, spendingInsight, savingTip, healthInsight
        """
        
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a financial receipt analyzer. Extract key information from receipts and provide insights. Format response as valid JSON."},
                {"role": "user", "content": analysis_prompt}
            ],
            model="llama3-70b-8192",
            temperature=0.4,
            max_tokens=500
        )
        
        # Extract JSON from the response
        result_text = response.choices[0].message.content
        
        # Find JSON pattern in the response
        json_match = re.search(r'```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})', result_text)
        if json_match:
            json_str = json_match.group(1) if json_match.group(1) else json_match.group(2)
            try:
                result = json.loads(json_str)
                return jsonify(result)
            except json.JSONDecodeError:
                pass
        
        # Fallback if JSON parsing fails
        return jsonify({
            "merchantName": "Receipt Analysis",
            "date": "Recent",
            "totalAmount": "Unknown",
            "category": "General",
            "spendingInsight": "Could not extract detailed information from the receipt. Please try with a clearer image.",
            "savingTip": "Consider using digital receipts when available for better tracking.",
            "healthInsight": "Remember to balance your budget for both necessities and self-care."
        })
            
    except Exception as e:
        print(f"Error processing receipt: {str(e)}")
        return jsonify({"error": "Failed to analyze receipt", "details": str(e)}), 500

@app.route('/financial-summary', methods=['POST'])
def financial_summary():
    try:
        data = request.get_json()
        user_data = data.get('userData', {})
        
        # In a real implementation, this would analyze actual user financial data
        # For now, we'll return a sample financial summary
        
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": "Create a comprehensive financial summary with spending patterns, saving opportunities, and upcoming payments. Format as JSON with these categories: spendingPatterns (array), savingOpportunities (array), upcomingPayments (array), monthlyTrends, healthImpact, goalProgress."}
            ],
            model="llama3-70b-8192",
            temperature=0.6,
            max_tokens=500
        )
        
        # Extract JSON from the response
        result_text = response.choices[0].message.content
        
        # Find JSON pattern in the response
        json_match = re.search(r'```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})', result_text)
        if json_match:
            json_str = json_match.group(1) if json_match.group(1) else json_match.group(2)
            try:
                result = json.loads(json_str)
                return jsonify(result)
            except json.JSONDecodeError:
                pass
        
        # Fallback if JSON parsing fails
        return jsonify({
            "spendingPatterns": [
                {"category": "Food", "amount": 450, "trend": "up", "percentage": 25},
                {"category": "Transport", "amount": 200, "trend": "stable", "percentage": 15},
                {"category": "Entertainment", "amount": 180, "trend": "down", "percentage": 10}
            ],
            "savingOpportunities": [
                {"type": "Subscription", "description": "Reduce streaming services", "amount": 30},
                {"type": "Food", "description": "Meal prep vs takeout", "amount": 120},
                {"type": "Utilities", "description": "Energy saving", "amount": 45}
            ],
            "upcomingPayments": [
                {"description": "Rent", "amount": 950, "dueIn": 3},
                {"description": "Electricity", "amount": 85, "dueIn": 7},
                {"description": "Internet", "amount": 60, "dueIn": 14}
            ],
            "monthlyTrends": {
                "totalSpending": 1850,
                "previousMonth": 1920,
                "difference": -70,
                "topCategory": "Food"
            },
            "healthImpact": "Reducing takeout would save $120/month and reduce sodium intake by approximately 30%.",
            "goalProgress": {
                "name": "Emergency Fund",
                "current": 2500,
                "target": 5000,
                "percentage": 50
            }
        })
        
    except Exception as e:
        return jsonify({"error": "Failed to generate financial summary", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
