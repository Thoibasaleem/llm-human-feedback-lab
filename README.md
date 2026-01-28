```markdown
# LLM Human Feedback Lab

A full‑stack web app that simulates a human‑in‑the‑loop evaluation workflow for Large Language Models (LLMs). It lets users submit prompts, see LLM‑style responses, collect structured human feedback, and visualize basic analytics over the evaluations.

---

## 1. Overview

This project is designed to mirror real‑world **post‑training / RLHF** style workflows used to improve LLMs: users send prompts, models return responses, and human reviewers score and correct those responses. The collected evaluations can then be used for quality monitoring and future model improvement.

---

## 2. Features

- **Prompt & response interface**
  - Enter a prompt and view an LLM‑style generated answer.
  - Simple layout focused on human evaluation rather than chat.

- **Human evaluation panel**
  - Rate each response on helpfulness, accuracy, and clarity.
  - Flag hallucinations and unsafe content.
  - Optionally provide an improved response written by the human reviewer.

- **Evaluation history**
  - View previously evaluated prompts and responses.
  - Inspect the associated scores and flags.

- **Analytics dashboard**
  - Display average scores across evaluations.
  - Show hallucination and safety‑issue rates.
  - Compare original vs improved response length.

---

## 3. Tech Stack

- **Frontend**
  - React (JavaScript)
  - Page‑based layout for Prompt Lab, Evaluation Panel, History, and Analytics

- **Backend**
  - FastAPI (Python)
  - REST endpoints for creating and fetching evaluations

- **Database**
  - MongoDB at `mongodb://localhost:27017` (expected by the backend for persistence)

---

## 4. Project Structure

```text
llm-human-feedback-lab/
  backend/
    server.py
    requirements.txt
    ...
  frontend/
    package.json
    src/
      pages/
        PromptLab.js
        EvaluationPanel.js
        History.js
        Analytics.js
      apiConfig.js
    ...
  screenshots/
    prompt-lab.jpg
    evaluation-panel.jpg
    analytics-dashboard.jpg
```

---

## 5. Screenshots

### Prompt Lab

![Prompt Lab](screenshots/prompt-lab.jpg)

### Evaluation Panel

![Evaluation Panel](screenshots/evaluation-panel.jpg)

### Analytics Dashboard

![Analytics Dashboard](screenshots/analytics-dashboard.jpg)

---

## 6. Running the Project Locally

### 6.1. Backend (FastAPI)

1. Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

2. Ensure MongoDB is running on `localhost:27017` (or update the connection string in the backend code).  
3. Start the FastAPI server:

```bash
uvicorn server:app --reload
```

The backend will be available at `http://127.0.0.1:8000`.

### 6.2. Frontend (React)

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the dev server:

```bash
npm run dev
```

The frontend will be available at the URL shown in the terminal (commonly `http://localhost:5173` or similar).

---

## 7. Notes and Limitations

- The backend expects a running MongoDB instance at `localhost:27017`.  
  - If MongoDB is not running, API calls that create evaluations (for example `POST /api/evaluations`) will return a 500 error.
- The goal of this project is to demonstrate:
  - An end‑to‑end LLM evaluation **workflow**.  
  - How to capture structured human feedback for LLM outputs.  
  - A starting point for analytics and dashboards over evaluation data.

---

## 8. Possible Extensions

- Add authentication so multiple reviewers have separate IDs.  
- Enhance analytics with charts for score distributions and trends over time.  
- Integrate with a real LLM API for dynamic responses.  
- Deploy the app using a managed database (e.g., MongoDB Atlas) and a cloud platform.
```
