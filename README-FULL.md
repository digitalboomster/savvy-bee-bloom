
# Savvy Bee - Financial Wellness Chatbot

Savvy Bee is a chatbot application designed to provide financial wellness guidance, combining AI-powered advice with tools for mental well-being.

## Project Structure

```
savvy-bee/
├── frontend/        # React frontend application
└── backend/         # Flask backend API
```

## Setting up the Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set your Groq API key:
```bash
# Linux/Mac
export GROQ_API_KEY=your_api_key_here

# Windows
set GROQ_API_KEY=your_api_key_here
```

5. Run the backend server:
```bash
python app.py
```

The backend will start running on http://localhost:5000.

## Setting up the Frontend

1. Create a `.env` file in the root of the project with:
```
VITE_API_URL=http://localhost:5000
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:8080.

## Docker Setup

You can use Docker to run the backend:

```bash
cd backend
docker build -t savvy-bee-backend .
docker run -p 5000:5000 -e GROQ_API_KEY=your_api_key_here savvy-bee-backend
```

## Deploying the Application

1. Build the frontend:
```bash
npm run build
```

2. Deploy the backend (Flask) to your preferred platform (Heroku, AWS, etc.)
3. Update the VITE_API_URL in your frontend environment variables to point to your deployed backend

## Sharing with Colleagues

To share this project with colleagues:

1. Make sure all code is committed to a git repository
2. Share the repository link with your colleagues
3. Provide them with the setup instructions from this README
4. Ensure they have access to create their own Groq API key or provide a shared one for testing

## Security Considerations

- Do not commit your GROQ_API_KEY to the repository
- Use environment variables for all sensitive information
- For production, implement proper authentication and rate limiting
