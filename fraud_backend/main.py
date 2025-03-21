from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import random  # Placeholder for AI model
from typing import List, Dict
from sqlalchemy import create_engine, Column, String, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Database setup
DATABASE_URL = "sqlite:///./fraud_detection.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})  # For SQLite concurrency issues
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define database model
class FraudDetection(Base):
    __tablename__ = "fraud_detection"
    transaction_id = Column(String, primary_key=True, index=True)
    is_fraud = Column(Boolean, nullable=False)
    fraud_source = Column(String, nullable=False)
    fraud_reason = Column(String, nullable=False)  # Added fraud reason
    fraud_score = Column(Float, nullable=False)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def home():
    return {"message": "Welcome to the Fraud Detection API"}

# Define request model
class Transaction(BaseModel):
    transaction_id: str
    amount: float
    payer_id: str
    payee_id: str
    payment_mode: str
    transaction_channel: str

# Define fraud detection logic
def rule_based_check(transaction: Transaction) -> (bool, str):
    """Simple rule-based fraud detection with reason."""
    if transaction.amount > 10000:  # Example rule: High amount
        return True, "High amount"
    return False, ""

def ai_model_check(transaction: Transaction) -> float:
    """Placeholder AI model returning a random fraud score."""
    return round(random.uniform(0, 1), 2)

@app.post("/detect_fraud")
def detect_fraud(transaction: Transaction, db: Session = Depends(get_db)):
    is_fraud_rule, fraud_reason = rule_based_check(transaction)
    fraud_score = ai_model_check(transaction)
    is_fraud = is_fraud_rule or (fraud_score > 0.7)  # Example threshold

    if not is_fraud_rule:
        fraud_reason = "AI model detected fraud" if is_fraud else "Transaction is safe"

    fraud_source = "rule" if is_fraud_rule else "model" if is_fraud else "none"

    # Store in database
    fraud_record = FraudDetection(
        transaction_id=transaction.transaction_id,
        is_fraud=is_fraud,
        fraud_source=fraud_source,
        fraud_reason=fraud_reason,
        fraud_score=fraud_score
    )
    db.add(fraud_record)
    db.commit()

    return {
        "transaction_id": transaction.transaction_id,
        "is_fraud": is_fraud,
        "fraud_source": fraud_source,
        "fraud_reason": fraud_reason,
        "fraud_score": fraud_score
    }

@app.post("/detect_fraud_batch")
def detect_fraud_batch(transactions: List[Transaction], db: Session = Depends(get_db)) -> Dict[str, Dict]:
    """Batch fraud detection API."""
    results = {}
    for txn in transactions:
        result = detect_fraud(txn, db)
        results[txn.transaction_id] = result
    return results

@app.post("/report_fraud")
def report_fraud(transaction_id: str, fraud_details: str, db: Session = Depends(get_db)):
    """Fraud reporting API. Updates fraud reason in the database."""
    fraud_entry = db.query(FraudDetection).filter(FraudDetection.transaction_id == transaction_id).first()

    if not fraud_entry:
        raise HTTPException(status_code=404, detail="Transaction not found")

    fraud_entry.fraud_reason = fraud_details
    db.commit()

    return {
        "transaction_id": transaction_id,
        "fraud_reason_updated": fraud_details,
        "status": "Fraud report acknowledged"
    }
