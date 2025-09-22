import { useState } from 'react';

// API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface PredictionRequest {
  MedInc: number;
  HouseAge: number;
  AveRooms: number;
  AveBedrms: number;
  Population: number;
  AveOccup: number;
  Latitude: number;
  Longitude: number;
}

interface PredictionResponse {
  prediction: number;
}

export const usePredictionApi = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getPrediction = async (data: PredictionRequest): Promise<number> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result: PredictionResponse = await response.json();
      return result.prediction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Prediction API error:', errorMessage);
      return 0;
    } finally {
      setIsLoading(false);
    }
  };

  // This function adapts our hospital data to the California housing model inputs
  // In a real app, you would have a model trained on actual hospital data
  const getPatientPrediction = async (
    hour: number, 
    day: number,
    currentPatients: number,
    isWeekend: boolean
  ): Promise<number> => {
    // Map our hospital parameters to the California housing model parameters
    // This is just a demo mapping - in a real app you'd use appropriate features
    const predictionRequest: PredictionRequest = {
      MedInc: currentPatients / 10, // Normalize current patients as "income"
      HouseAge: hour,  // Use hour as "house age"
      AveRooms: day,   // Use day of week as "average rooms"
      AveBedrms: isWeekend ? 1 : 0,  // Weekend as a feature
      Population: currentPatients * 3,  // Estimate population
      AveOccup: currentPatients / 5,  // Estimate occupancy
      Latitude: 37.77,  // Sample latitude
      Longitude: -122.42  // Sample longitude
    };
    
    // Get prediction (housing value) and scale to reasonable patient number
    const rawPrediction = await getPrediction(predictionRequest);
    // Scale and round the housing price prediction to a reasonable patient number
    return Math.round(rawPrediction * 2);
  };
  
  return {
    getPatientPrediction,
    getPrediction,
    isLoading,
    error
  };
};