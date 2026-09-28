# 🩺 Diabetic Patient 30-Day Readmission Risk Predictor

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100.0+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![XGBoost](https://img.shields.io/badge/XGBoost-Latest-FF6F00?style=flat&logo=xgboost)](https://xgboost.readthedocs.io/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED?style=flat&logo=docker)](https://www.docker.com/)

An end-to-end, production-grade Machine Learning Web Application designed for **Clinical Decision Support**. This platform predicts the 30-day readmission risk of diabetic patients using an optimized **XGBoost Classifier** served via a **FastAPI** REST backend and an interactive **React (Vite + Tailwind CSS)** dashboard.

---

## 📌 Executive Summary & Clinical Context

Hospital readmissions within 30 days of discharge represent a significant challenge in healthcare, causing financial penalties for institutions and adverse health outcomes for patients. 

This system processes **40+ clinical, demographic, diagnostic (ICD-9), and medication features** from diabetic patient records to estimate readmission risk. 

- **Custom Decision Threshold:** Set at **`0.2845`** (optimized via Precision-Recall AUC analysis to maximize sensitivity/recall for high-risk clinical identification).
- **Explainable AI (XAI):** Integrated feature-impact breakdown to provide clinicians with clear insights into risk factors.

---

## 🏗️ System Architecture

```text
 hospital-readmission-ml/
 ├── backend/
 │   ├── app/
 │   │   ├── models/            # Model loading & inference logic
 │   │   ├── pipeline/          # Custom Preprocessing & Feature Engineering
 │   │   ├── config.py          # Global configurations & paths
 │   │   ├── main.py            # FastAPI Application routes & CORS
 │   │   └── schemas.py         # Pydantic data schemas for validation
 │   ├── artifacts/             # Serialized pipeline & XGBoost models (.pkl)
 │   ├── Dockerfile             # Backend Containerization Script
 │   └── requirements.txt       # Python dependencies
 │
 ├── frontend/
 │   ├── src/
 │   │   ├── components/        # PatientForm, RiskGauge, ShapPlot, AnalyticsPanel
 │   │   ├── services/          # Axios API communication modules
 │   │   ├── App.jsx            # Main Dashboard Application Layout
 │   │   └── main.jsx           # Vite React Entrypoint
 │   ├── Dockerfile             # Multi-stage Frontend Containerization
 │   └── package.json           # Node modules & scripts
 │
 ├── docker-compose.yml         # Multi-container orchestrator
 ├── .gitignore                 # Excluded environments and caches
 └── README.md                  # Project Documentation