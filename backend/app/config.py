from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = BASE_DIR / "data" / "raw" / "diabetic_data.csv"


ARTIFACTS_DIR = BASE_DIR / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "diabetic_readmission_pipeline.pkl"

OPTIMAL_THRESHOLD = 0.2845
EXPIRED_DISPOSITION_IDS = [11, 13, 14, 19, 20, 21]
COLUMNS_TO_DROP = ['weight', 'payer_code', 'encounter_id', 'patient_nbr', 'examide', 'citoglipton']

NUMERICAL_COLS = [
    'time_in_hospital', 'num_lab_procedures', 'num_procedures', 
    'num_medications', 'number_outpatient', 'number_emergency', 
    'number_inpatient', 'number_diagnoses'
]

DOMAIN_NUMERICAL_COLS = NUMERICAL_COLS + [
    'service_utilization', 'med_per_day', 'lab_per_day', 'health_index'
]