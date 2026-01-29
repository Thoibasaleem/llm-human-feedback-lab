🧠 LLM Human Feedback Lab

A full-stack web app that simulates a human-in-the-loop evaluation workflow for Large Language Models (LLMs). Users submit prompts, see LLM-style responses, rate them, and view basic quality insights.

✨ Features

Prompt input and generated response view.

Human evaluation panel (helpfulness, accuracy, clarity, hallucination flag, safety flag, improved response).

Evaluation history page.

Analytics dashboard with average scores, issue rates, and response-length comparison.

🛠 Tech Stack

Frontend: React (JavaScript)

Backend: FastAPI (Python)

Database: MongoDB

mongodb://localhost:27017

🖼 Screenshots

Prompt Lab
<img src="screenshots/prompt-lab.jpeg" alt="Prompt Lab" width="800"/>


Evaluation Panel
<img src="screenshots/evaluation-panel.jpeg" alt="Evaluation Panel" width="800"/>


Analytics Dashboard
<img src="screenshots/analytics-dashboard.jpeg" alt="Analytics Dashboard" width="800"/>



⚙️ Running Locally
Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload


Backend runs on:
http://127.0.0.1:8000

Frontend
cd frontend
npm install
npm run dev


Frontend runs on the port shown in the terminal (commonly http://localhost:5173
).

The folder structure is:
project-root/
├── README.md
└── screenshots/
    ├── prompt-lab.jpeg
    ├── evaluation-panel.jpeg
    └── analytics-dashboard.jpeg


