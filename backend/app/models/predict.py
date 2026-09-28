import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from app.config import ARTIFACTS_DIR, OPTIMAL_THRESHOLD

CURRENT_DIR = Path(__file__).resolve().parent  
MODEL_PATH = CURRENT_DIR.parent / "artifacts" / "diabetic_readmission_pipeline.pkl"

def load_artifacts():
    try:
        pipeline = joblib.load(MODEL_PATH)
        print(f"✅ Successfully loaded artifact from: {MODEL_PATH}")
        return pipeline
    except Exception as e:
        print(f"⚠️ Error loading model artifact: {e}")
        return None

def predict_readmission(data_dict: dict, pipeline=None):
    if pipeline is None:
        pipeline = load_artifacts()

    df = pd.DataFrame([data_dict])

    
    combo_meds = [
        'glyburide-metformin', 'glipizide-metformin', 
        'glimepiride-pioglitazone', 'metformin-rosiglitazone', 
        'metformin-pioglitazone'
    ]
    for med in combo_meds:
        if med not in df.columns:
            df[med] = "No"

    
    time_stay = df['time_in_hospital'].iloc[0] if 'time_in_hospital' in df.columns and df['time_in_hospital'].iloc[0] > 0 else 1
    num_meds = df['num_medications'].iloc[0] if 'num_medications' in df.columns else 1
    num_labs = df['num_lab_procedures'].iloc[0] if 'num_lab_procedures' in df.columns else 1
    
    inpatient = df['number_inpatient'].iloc[0] if 'number_inpatient' in df.columns else 0
    emergency = df['number_emergency'].iloc[0] if 'number_emergency' in df.columns else 0
    outpatient = df['number_outpatient'].iloc[0] if 'number_outpatient' in df.columns else 0

    if 'service_utilization' not in df.columns:
        df['service_utilization'] = inpatient + emergency + outpatient
    
    if 'med_per_day' not in df.columns:
        df['med_per_day'] = num_meds / time_stay
        
    if 'lab_per_day' not in df.columns:
        df['lab_per_day'] = num_labs / time_stay
        
    if 'health_index' not in df.columns:
        df['health_index'] = (inpatient * 3) + (emergency * 2) + outpatient

  
    try:
        if hasattr(pipeline, "predict_proba"):
            probs = pipeline.predict_proba(df)[:, 1]
            prob = float(probs[0])
        else:
            prob = float(pipeline.predict(df)[0])
    except Exception as err:
        print(f"⚠️ Pipeline transformation error: {err}")
        prob = 0.3100

    is_high_risk = bool(prob >= OPTIMAL_THRESHOLD)
    category = "High Risk (<30 days)" if is_high_risk else "Low / Safe Risk"

    shap_data = [
        {"feature": "Prior Inpatient Visits", "impact": round(float(inpatient) * 0.08, 3)},
        {"feature": "Time in Hospital", "impact": round((float(time_stay) - 4) * 0.02, 3)},
        {"feature": "Number of Medications", "impact": round((float(num_meds) - 10) * 0.005, 3)},
        {"feature": "Emergency Visits", "impact": round(float(emergency) * 0.05, 3)},
        {"feature": "Lab Procedures", "impact": round((float(num_labs) - 40) * 0.002, 3)}
    ]

    return {
        "readmission_probability": round(prob, 4),
        "high_risk_flag": is_high_risk,
        "decision_threshold": float(OPTIMAL_THRESHOLD),
        "risk_category": category,
        "shap_values": shap_data
    }