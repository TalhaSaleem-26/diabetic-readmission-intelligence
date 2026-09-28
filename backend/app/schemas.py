from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class PatientDataInput(BaseModel):
    race: str = "Caucasian"
    gender: str = "Female"
    age: str = "[70-80)"
    admission_type_id: int = 1
    discharge_disposition_id: int = 1
    admission_source_id: int = 7
    time_in_hospital: int = 4
    medical_specialty: str = "InternalMedicine"
    num_lab_procedures: int = 45
    num_procedures: int = 1
    num_medications: int = 15
    number_outpatient: int = 0
    number_emergency: int = 0
    number_inpatient: int = 0
    diag_1: str = "250.8"
    diag_2: str = "401"
    diag_3: str = "272"
    number_diagnoses: int = 9
    max_glu_serum: str = "None"
    A1Cresult: str = ">8"
    metformin: str = "No"
    repaglinide: str = "No"
    nateglinide: str = "No"
    chlorpropamide: str = "No"
    glimepiride: str = "No"
    acetohexamide: str = "No"
    glipizide: str = "Steady"
    glyburide: str = "No"
    tolbutamide: str = "No"
    pioglitazone: str = "No"
    rosiglitazone: str = "No"
    acarbose: str = "No"
    miglitol: str = "No"
    troglitazone: str = "No"
    tolazamide: str = "No"
    insulin: str = "Up"
    glyburide_metformin: str = "No"
    glipizide_metformin: str = "No"
    glimepiride_pioglitazone: str = "No"
    metformin_rosiglitazone: str = "No"
    metformin_pioglitazone: str = "No"
    change: str = "Ch"
    diabetesMed: str = "Yes"

class PredictionOutput(BaseModel):
    readmission_probability: float
    high_risk_flag: bool
    decision_threshold: float
    risk_category: str
    shap_values: Optional[List[Dict[str, Any]]] = None