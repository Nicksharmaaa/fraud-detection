from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random  # Placeholder for AI model
from typing import List, Dict, Optional, Any
from sqlalchemy import create_engine, Column, String, Float, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime, timedelta
import uuid

# Database setup
DATABASE_URL = "sqlite:///./fraud_detection.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})  # For SQLite concurrency issues
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define database model
class FraudDetection(Base):
    __tablename__ = "fraud_detection"
    transaction_id = Column(String, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    payer_id = Column(String, nullable=False)
    payee_id = Column(String, nullable=False)
    payment_mode = Column(String, nullable=False)
    transaction_channel = Column(String, nullable=False)
    payment_gateway_bank = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.now)
    is_fraud_predicted = Column(Boolean, nullable=False)
    is_fraud_reported = Column(Boolean, nullable=False, default=False)
    fraud_source = Column(String, nullable=False)
    fraud_reason = Column(String, nullable=False)  
    fraud_score = Column(Float, nullable=False)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    transaction_id: Optional[str] = None
    amount: float
    payer_id: str
    payee_id: str
    payment_mode: str
    transaction_channel: str
    payment_gateway_bank: Optional[str] = None
    timestamp: Optional[datetime] = None

# Define fraud detection logic
def rule_based_check(transaction: Transaction) -> (bool, str):
    """Simple rule-based fraud detection with reason."""
    if transaction.amount > 10000:  # Example rule: High amount
        return True, "High amount"
    
    if transaction.payer_id.startswith("RISK_"):
        return True, "Risky payer identified"
        
    return False, ""

def ai_model_check(transaction: Transaction) -> float:
    """Placeholder AI model returning a random fraud score."""
    return round(random.uniform(0, 1), 2)

@app.post("/detect_fraud")
def detect_fraud(transaction: Transaction, db: Session = Depends(get_db)):
    # Generate transaction_id if not provided
    if not transaction.transaction_id:
        transaction.transaction_id = str(uuid.uuid4())
        
    # Set timestamp if not provided
    if not transaction.timestamp:
        transaction.timestamp = datetime.now()
    
    is_fraud_rule, fraud_reason = rule_based_check(transaction)
    fraud_score = ai_model_check(transaction)
    is_fraud = is_fraud_rule or (fraud_score > 0.7)  # Example threshold

    if not is_fraud_rule and is_fraud:
        fraud_reason = "AI model detected fraud"
    elif not is_fraud:
        fraud_reason = "Transaction is safe"

    fraud_source = "rule" if is_fraud_rule else "model" if is_fraud else "none"

    # Store in database
    fraud_record = FraudDetection(
        transaction_id=transaction.transaction_id,
        amount=transaction.amount,
        payer_id=transaction.payer_id,
        payee_id=transaction.payee_id,
        payment_mode=transaction.payment_mode,
        transaction_channel=transaction.transaction_channel,
        payment_gateway_bank=transaction.payment_gateway_bank,
        timestamp=transaction.timestamp,
        is_fraud_predicted=is_fraud,
        is_fraud_reported=False,
        fraud_source=fraud_source,
        fraud_reason=fraud_reason,
        fraud_score=fraud_score
    )
    db.add(fraud_record)
    db.commit()

    # Return response with explicit formatting
    return {
        "transaction_id": transaction.transaction_id,
        "amount": transaction.amount,
        "payer_id": transaction.payer_id,
        "payee_id": transaction.payee_id,
        "payment_mode": transaction.payment_mode,
        "transaction_channel": transaction.transaction_channel,
        "payment_gateway_bank": transaction.payment_gateway_bank,
        "timestamp": transaction.timestamp,
        "is_fraud_predicted": is_fraud,
        "is_fraud_reported": False,
        "fraud_source": fraud_source,
        "fraud_reason": fraud_reason,
        "fraud_score": fraud_score,
        "fraud_verdict": "FRAUD" if is_fraud else "NOT FRAUD" 
    }

@app.post("/detect_fraud_batch")
def detect_fraud_batch(transactions: List[Transaction], db: Session = Depends(get_db)) -> Dict[str, Dict]:
    """Batch fraud detection API."""
    results = {}
    for txn in transactions:
        result = detect_fraud(txn, db)
        results[txn.transaction_id] = result
    return results

@app.post("/upload_transactions")
def upload_transactions(transactions: List[Dict[str, Any]], db: Session = Depends(get_db)):
    """Handle uploaded transaction data from JSON file."""
    processed_count = 0
    results = []
    
    try:
        for txn_data in transactions:
            # Convert dictionary to Transaction model
            try:
                # Handle potential missing fields by setting defaults
                transaction = Transaction(
                    transaction_id=txn_data.get("transaction_id", str(uuid.uuid4())),
                    amount=float(txn_data.get("amount", 0)),
                    payer_id=txn_data.get("payer_id", "unknown"),
                    payee_id=txn_data.get("payee_id", "unknown"),
                    payment_mode=txn_data.get("payment_mode", "unknown"),
                    transaction_channel=txn_data.get("transaction_channel", "unknown"),
                    payment_gateway_bank=txn_data.get("payment_gateway_bank"),
                    timestamp=txn_data.get("timestamp", datetime.now())
                )
                
                # Process the transaction
                is_fraud_rule, fraud_reason = rule_based_check(transaction)
                fraud_score = ai_model_check(transaction)
                is_fraud = is_fraud_rule or (fraud_score > 0.7)  # Example threshold

                if not is_fraud_rule and is_fraud:
                    fraud_reason = "AI model detected fraud"
                elif not is_fraud:
                    fraud_reason = "Transaction is safe"

                fraud_source = "rule" if is_fraud_rule else "model" if is_fraud else "none"

                # Store in database
                fraud_record = FraudDetection(
                    transaction_id=transaction.transaction_id,
                    amount=transaction.amount,
                    payer_id=transaction.payer_id,
                    payee_id=transaction.payee_id,
                    payment_mode=transaction.payment_mode,
                    transaction_channel=transaction.transaction_channel,
                    payment_gateway_bank=transaction.payment_gateway_bank,
                    timestamp=transaction.timestamp,
                    is_fraud_predicted=is_fraud,
                    is_fraud_reported=False,
                    fraud_source=fraud_source,
                    fraud_reason=fraud_reason,
                    fraud_score=fraud_score
                )
                db.add(fraud_record)
                db.commit()
                
                # Add to results with explicit fraud verdict
                results.append({
                    "transaction_id": transaction.transaction_id,
                    "amount": transaction.amount,
                    "is_fraud_predicted": is_fraud,
                    "fraud_reason": fraud_reason,
                    "fraud_score": fraud_score,
                    "fraud_verdict": "FRAUD" if is_fraud else "NOT FRAUD"
                })
                
                processed_count += 1
                
            except Exception as e:
                # Log the error but continue processing other transactions
                print(f"Error processing transaction: {str(e)}")
                continue
        
        return {
            "status": "success",
            "processed_count": processed_count,
            "results": results[:10] if results else []  # Return first 10 results for preview
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing upload: {str(e)}")

@app.post("/report_fraud")
def report_fraud(transaction_id: str = Body(...), fraud_details: str = Body(...), db: Session = Depends(get_db)):
    """Fraud reporting API. Updates fraud reason in the database."""
    fraud_entry = db.query(FraudDetection).filter(FraudDetection.transaction_id == transaction_id).first()

    if not fraud_entry:
        raise HTTPException(status_code=404, detail="Transaction not found")

    fraud_entry.is_fraud_reported = True
    fraud_entry.fraud_reason = fraud_details
    db.commit()

    return {
        "transaction_id": transaction_id,
        "fraud_reason_updated": fraud_details,
        "status": "Fraud report acknowledged"
    }

@app.get("/transactions")
def get_transactions(db: Session = Depends(get_db)):
    """Get all transactions with fraud detection data."""
    transactions = db.query(FraudDetection).all()
    
    return [
        {
            "transaction_id": txn.transaction_id,
            "amount": txn.amount,
            "payer_id": txn.payer_id,
            "payee_id": txn.payee_id,
            "payment_mode": txn.payment_mode,
            "transaction_channel": txn.transaction_channel,
            "payment_gateway_bank": txn.payment_gateway_bank,
            "timestamp": txn.timestamp,
            "is_fraud_predicted": txn.is_fraud_predicted,
            "is_fraud_reported": txn.is_fraud_reported,
            "fraud_source": txn.fraud_source,
            "fraud_reason": txn.fraud_reason,
            "fraud_score": txn.fraud_score
        }
        for txn in transactions
    ]

@app.get("/generate_test_data")
def generate_test_data(db: Session = Depends(get_db)):
    """Generate test data for the application."""
    # First, clear existing data
    db.query(FraudDetection).delete()
    db.commit()
    
    # Sample data parameters
    payer_ids = ["payer_001", "payer_002", "payer_003", "RISK_004", "payer_005"]
    payee_ids = ["payee_001", "payee_002", "payee_003", "payee_004", "payee_005"]
    payment_modes = ["credit_card", "debit_card", "netbanking", "upi", "wallet"]
    channels = ["web", "mobile", "pos", "atm", "branch"]
    banks = ["HDFC", "ICICI", "SBI", "Axis", "Citibank", None]
    
    # Generate data for the last 90 days
    transactions = []
    current_time = datetime.now()
    
    for i in range(100):
        # Random timestamp within the last 90 days
        random_days = random.randint(0, 90)
        random_hours = random.randint(0, 23)
        random_minutes = random.randint(0, 59)
        timestamp = current_time - timedelta(days=random_days, hours=random_hours, minutes=random_minutes)
        
        # Create transaction
        txn = Transaction(
            transaction_id=f"TXN{i+1000}",
            amount=random.uniform(100, 20000),
            payer_id=random.choice(payer_ids),
            payee_id=random.choice(payee_ids),
            payment_mode=random.choice(payment_modes),
            transaction_channel=random.choice(channels),
            payment_gateway_bank=random.choice(banks),
            timestamp=timestamp
        )
        
        # Process the transaction
        detect_fraud(txn, db)
        
        # Randomly mark some transactions as reported fraud
        if random.random() < 0.2:  # 20% chance
            report_fraud(txn.transaction_id, "Fraud reported by customer", db)
    
    return {"message": "Test data generated successfully", "count": 100}
