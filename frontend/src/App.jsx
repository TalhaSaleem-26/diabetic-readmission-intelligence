import React, { useState } from 'react';
import { PatientForm } from './components/PatientForm';
import { RiskGauge } from './components/RiskGauge';
import { ShapPlot } from './components/ShapPlot';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { predictPatientRisk } from './services/api';

export default function App() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async (patientData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await predictPatientRisk(patientData);
      setPrediction(result);
    } catch (err) {
      setError("Failed to connect to FastAPI Backend. Make sure Uvicorn server is running!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Diabetic Readmission Risk Intelligence</h1>
          <p className="text-slate-500 text-sm mt-1">Clinical Decision Support System powered by XGBoost & FastAPI</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live ML Pipeline
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <PatientForm onSubmit={handlePredict} loading={loading} />
          {prediction && <AnalyticsPanel />}
        </div>

        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">
              {error}
            </div>
          )}

          {prediction ? (
            <>
              <RiskGauge 
                probability={prediction.readmission_probability}
                isHighRisk={prediction.high_risk_flag}
                threshold={prediction.decision_threshold}
              />
              <ShapPlot shapValues={prediction.shap_values} />
            </>
          ) : (
            <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 text-center text-gray-400">
              Fill patient details or click <strong>"🎲 Random Profile"</strong> / <strong>"⚠️ High-Risk Preset"</strong> to run live evaluation.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}