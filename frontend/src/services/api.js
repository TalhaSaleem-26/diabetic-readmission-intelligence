import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const predictPatientRisk = async (patientData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/predict`, patientData);
    return response.data;
  } catch (error) {
    console.error("Error making prediction request:", error);
    throw error;
  }
};