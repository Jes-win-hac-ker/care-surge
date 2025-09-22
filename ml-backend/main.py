from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
import pandas as pd
import joblib
import os

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

MODEL_PATH = "model.joblib"

class PredictRequest(BaseModel):
    MedInc: float
    HouseAge: float
    AveRooms: float
    AveBedrms: float
    Population: float
    AveOccup: float
    Latitude: float
    Longitude: float

class PredictResponse(BaseModel):
    prediction: float

# Load and train model if not already trained
@app.on_event("startup")
def train_model():
    if os.path.exists(MODEL_PATH):
        return
    # Load California housing dataset from scikit-learn
    dataset = fetch_california_housing()
    X = pd.DataFrame(dataset.data, columns=dataset.feature_names)
    y = dataset.target
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    joblib.dump(model, MODEL_PATH)
    # Optionally print test error
    y_pred = model.predict(X_test)
    print("Test RMSE:", mean_squared_error(y_test, y_pred, squared=False))

# Prediction endpoint
@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    model = joblib.load(MODEL_PATH)
    # Create a DataFrame with the same feature names used during training
    feature_names = ['MedInc', 'HouseAge', 'AveRooms', 'AveBedrms', 'Population', 'AveOccup', 'Latitude', 'Longitude']
    features = pd.DataFrame(
        [[
            req.MedInc, req.HouseAge, req.AveRooms, req.AveBedrms,
            req.Population, req.AveOccup, req.Latitude, req.Longitude
        ]],
        columns=feature_names
    )
    pred = model.predict(features)[0]
    return PredictResponse(prediction=pred)
