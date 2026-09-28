import pandas as pd
import numpy as np

def map_icd9_to_category(code):
    if pd.isna(code) or code == 'Missing':
        return 'Missing'
    code_str = str(code).strip()
    if code_str.startswith(('V', 'E')):
        return 'Other'
    try:
        val = float(code_str)
    except ValueError:
        return 'Other'
        
    if (390 <= val <= 459) or val == 785:
        return 'Circulatory'
    elif (460 <= val <= 519) or val == 786:
        return 'Respiratory'
    elif (520 <= val <= 579) or val == 787:
        return 'Digestive'
    elif 250 <= val < 251:
        return 'Diabetes'
    elif 800 <= val <= 999:
        return 'Injury'
    elif 710 <= val <= 739:
        return 'Musculoskeletal'
    elif (580 <= val <= 629) or val == 788:
        return 'Genitourinary'
    elif 140 <= val <= 239:
        return 'Neoplasms'
    else:
        return 'Other'

def add_domain_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df['service_utilization'] = df['number_outpatient'] + df['number_emergency'] + df['number_inpatient']
    df['med_per_day'] = df['num_medications'] / (df['time_in_hospital'] + 1e-5)
    df['lab_per_day'] = df['num_lab_procedures'] / (df['time_in_hospital'] + 1e-5)
    df['health_index'] = df['service_utilization'] * df['number_diagnoses']
    return df