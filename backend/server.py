from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

class GenerateRequest(BaseModel):
    prompt: str

class GenerateResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    prompt: str
    response: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    quality_warnings: List[str] = []

class EvaluationCreate(BaseModel):
    response_id: str
    prompt: str
    model_response: str
    evaluator_id: str
    helpfulness: int
    accuracy: int
    clarity: int
    has_hallucination: bool
    has_unsafe_content: bool
    improved_response: str

class Evaluation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    response_id: str
    prompt: str
    model_response: str
    evaluator_id: str
    helpfulness: int
    accuracy: int
    clarity: int
    has_hallucination: bool
    has_unsafe_content: bool
    improved_response: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnalyticsResponse(BaseModel):
    avg_helpfulness: float
    avg_accuracy: float
    avg_clarity: float
    hallucination_rate: float
    safety_issue_rate: float
    total_evaluations: int
    avg_original_length: float
    avg_improved_length: float
    evaluator_stats: dict

def check_quality(text: str, prompt: str) -> List[str]:
    warnings = []
    words = text.split()
    
    if len(words) < 20:
        warnings.append("Response is too short (less than 20 words)")
    
    sentences = re.split(r'[.!?]+', text)
    for i, sentence in enumerate(sentences):
        for j, other in enumerate(sentences):
            if i != j and sentence.strip() and other.strip():
                if sentence.strip().lower() == other.strip().lower():
                    warnings.append("Contains repeated phrases")
                    break
        if "Contains repeated phrases" in warnings:
            break
    
    prompt_words = set(prompt.lower().split())
    response_words = set(text.lower().split())
    overlap = len(prompt_words.intersection(response_words))
    if overlap < 2 and len(prompt_words) > 3:
        warnings.append("May not directly address the prompt")
    
    return warnings

@api_router.post("/generate", response_model=GenerateResponse)
async def generate_response(request: GenerateRequest):
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=str(uuid.uuid4()),
            system_message="You are a helpful AI assistant. Provide clear, accurate, and helpful responses."
        )
        chat.with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=request.prompt)
        response_text = await chat.send_message(user_message)
        
        quality_warnings = check_quality(response_text, request.prompt)
        
        response_obj = GenerateResponse(
            prompt=request.prompt,
            response=response_text,
            quality_warnings=quality_warnings
        )
        
        doc = response_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.responses.insert_one(doc)
        
        return response_obj
    except Exception as e:
        logging.error(f"Error generating response: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")

@api_router.post("/evaluations", response_model=Evaluation)
async def create_evaluation(evaluation: EvaluationCreate):
    try:
        eval_obj = Evaluation(**evaluation.model_dump())
        doc = eval_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.evaluations.insert_one(doc)
        return eval_obj
    except Exception as e:
        logging.error(f"Error creating evaluation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/evaluations", response_model=List[Evaluation])
async def get_evaluations():
    evaluations = await db.evaluations.find({}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    for eval in evaluations:
        if isinstance(eval['timestamp'], str):
            eval['timestamp'] = datetime.fromisoformat(eval['timestamp'])
    return evaluations

@api_router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics():
    evaluations = await db.evaluations.find({}, {"_id": 0}).to_list(1000)
    
    if not evaluations:
        return AnalyticsResponse(
            avg_helpfulness=0,
            avg_accuracy=0,
            avg_clarity=0,
            hallucination_rate=0,
            safety_issue_rate=0,
            total_evaluations=0,
            avg_original_length=0,
            avg_improved_length=0,
            evaluator_stats={}
        )
    
    total = len(evaluations)
    avg_helpfulness = sum(e['helpfulness'] for e in evaluations) / total
    avg_accuracy = sum(e['accuracy'] for e in evaluations) / total
    avg_clarity = sum(e['clarity'] for e in evaluations) / total
    hallucination_rate = (sum(1 for e in evaluations if e['has_hallucination']) / total) * 100
    safety_issue_rate = (sum(1 for e in evaluations if e['has_unsafe_content']) / total) * 100
    avg_original_length = sum(len(e['model_response'].split()) for e in evaluations) / total
    avg_improved_length = sum(len(e['improved_response'].split()) for e in evaluations) / total
    
    evaluator_stats = {}
    for e in evaluations:
        eid = e['evaluator_id']
        if eid not in evaluator_stats:
            evaluator_stats[eid] = {'count': 0, 'avg_scores': []}
        evaluator_stats[eid]['count'] += 1
        evaluator_stats[eid]['avg_scores'].append(
            (e['helpfulness'] + e['accuracy'] + e['clarity']) / 3
        )
    
    for eid in evaluator_stats:
        scores = evaluator_stats[eid]['avg_scores']
        evaluator_stats[eid]['avg_rating'] = sum(scores) / len(scores)
        del evaluator_stats[eid]['avg_scores']
    
    return AnalyticsResponse(
        avg_helpfulness=round(avg_helpfulness, 2),
        avg_accuracy=round(avg_accuracy, 2),
        avg_clarity=round(avg_clarity, 2),
        hallucination_rate=round(hallucination_rate, 2),
        safety_issue_rate=round(safety_issue_rate, 2),
        total_evaluations=total,
        avg_original_length=round(avg_original_length, 2),
        avg_improved_length=round(avg_improved_length, 2),
        evaluator_stats=evaluator_stats
    )

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()