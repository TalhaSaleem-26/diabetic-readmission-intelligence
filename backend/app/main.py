import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models.predict import load_artifacts, predict_readmission
from app.schemas import PatientDataInput, PredictionOutput

app = FastAPI(
    title="Hospital Readmission Prediction API",
    description="Production-grade ML Service for 30-day Diabetic Readmission Risk",
    version="1.0.0"
)

# Environment Variable se origins load karein (comma-separated origins support karta hai)
ALLOWED_ORIGINS_ENV = os.getenv(
    "ALLOWED_ORIGINS", 
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost"
)
origins = [origin.strip() for origin in ALLOWED_ORIGINS_ENV.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model_pipeline = None

@app.on_event("startup")
def startup_event():
    global model_pipeline
    try:
        model_pipeline = load_artifacts()
        print("✅ Model pipeline loaded successfully.")
    except Exception as e:
        print(f"⚠️ Pipeline loading failed: {e}")

@app.get("/")
def root():
    return {"status": "online", "service": "Diabetic Readmission ML API"}

@app.post("/predict", response_model=PredictionOutput)
def predict_patient_risk(patient_data: PatientDataInput):
    try:
        input_dict = patient_data.dict(by_alias=True)
        result = predict_readmission(input_dict, pipeline=model_pipeline)
        return result
    except Exception as e:
        print("❌ PREDICTION ERROR:", str(e))
        raise HTTPException(status_code=400, detail=str(e))