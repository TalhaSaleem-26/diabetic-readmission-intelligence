import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from xgboost import XGBClassifier

# Correct Imports as per your folder structure
from app.config import DATA_PATH, ARTIFACTS_DIR, EXPIRED_DISPOSITION_IDS, COLUMNS_TO_DROP, NUMERICAL_COLS, DOMAIN_NUMERICAL_COLS
from app.pipeline.preprocessor import map_icd9_to_category, add_domain_features

def run_training():
    df = pd.read_csv(DATA_PATH).replace('?', pd.NA)
    df = df.drop(columns=COLUMNS_TO_DROP)
    
    df['medical_specialty'] = df['medical_specialty'].fillna('Missing')
    df['max_glu_serum'] = df['max_glu_serum'].fillna('Not Tested')
    df['A1Cresult'] = df['A1Cresult'].fillna('Not Tested')
    
    df = df[~df['discharge_disposition_id'].isin(EXPIRED_DISPOSITION_IDS)]
    
    for col in ['diag_1', 'diag_2', 'diag_3']:
        df[col] = df[col].apply(map_icd9_to_category)
        
    df['target'] = (df['readmitted'] == '<30').astype(int)
    df = df.drop(columns=['readmitted'])
    
    X = df.drop(columns=['target'])
    y = df['target']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
    
    X_train_fe = add_domain_features(X_train)
    cat_cols = [col for col in X_train.columns if col not in NUMERICAL_COLS]
    
    num_pipeline = Pipeline([('imputer', SimpleImputer(strategy='median')), ('scaler', StandardScaler())])
    cat_pipeline = Pipeline([('imputer', SimpleImputer(strategy='constant', fill_value='Missing')), ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))])
    
    preprocessor = ColumnTransformer(transformers=[
        ('num', num_pipeline, DOMAIN_NUMERICAL_COLS),
        ('cat', cat_pipeline, cat_cols)
    ])
    
    imbalance_ratio = (y_train == 0).sum() / (y_train == 1).sum()
    
    full_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', XGBClassifier(
            n_estimators=200, learning_rate=0.03, max_depth=7, 
            subsample=0.7, colsample_bytree=0.6, scale_pos_weight=imbalance_ratio, 
            random_state=42, n_jobs=-1
        ))
    ])
    
    full_pipeline.fit(X_train_fe, y_train)
    
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(full_pipeline, ARTIFACTS_DIR / "diabetic_readmission_pipeline.pkl")
    print(" Training Complete! Model saved in artifacts folder successfully.")

if __name__ == "__main__":
    run_training()