# Fraud Detection Dashboard

A comprehensive dashboard for analyzing and visualizing fraud transaction data.

## Features

- **Transaction Data Upload**
  - Upload JSON files containing transaction data for batch processing
  - Automatic fraud detection for all uploaded transactions
  - Process status and summary reporting

- **Transaction Data Table**
  - View raw transaction data with fraud prediction and reporting indicators
  - Filter by date range, payer ID, and payee ID
  - Search by transaction ID

- **Fraud Comparison Graph**
  - Compare predicted vs. reported frauds across multiple dimensions:
    - Transaction Channel
    - Payment Mode
    - Payment Gateway Bank
    - Payer ID
    - Payee ID

- **Time Series Analysis**
  - Track fraud trends over time
  - Adjustable time periods (week, month, quarter, year)
  - Dynamic granularity based on zoom level

- **Model Evaluation Metrics**
  - Confusion matrix visualization
  - Precision, recall, F1 score, and accuracy metrics
  - Selectable time periods for evaluation

## Getting Started

### Prerequisites

- Node.js (v14+)
- Python (v3.7+)
- pip

### Installation

1. **Clone the repository**

   ```
   git clone https://github.com/your-username/fraud-detection.git
   cd fraud-detection
   ```

2. **Install frontend dependencies**

   ```
   npm install
   ```

3. **Install backend dependencies**

   ```
   pip install fastapi uvicorn sqlalchemy
   ```

### Running the Application

Run the application with the provided start script:

```
start.bat
```

Or start the components separately:

**Backend:**
```
cd fraud_backend
uvicorn main:app --reload
```

**Frontend:**
```
npm run dev
```

### Generating Test Data

Before using the dashboard, you can generate sample test data by visiting:

```
http://localhost:8000/generate_test_data
```

This will populate the database with 100 sample transactions with various fraud patterns.

### JSON Upload Format

The JSON file for upload should match the following format:

```json
[
  {
    "amount": 1000,
    "payer_id": "payer_001",
    "payee_id": "payee_002",
    "payment_mode": "credit_card",
    "transaction_channel": "web", 
    "payment_gateway_bank": "HDFC"
  },
  ...
]
```

Optional fields:
- `transaction_id` - will be auto-generated if not provided
- `timestamp` - will default to current time if not provided

## Technologies Used

- **Frontend**
  - React
  - Vite
  - CSS Grid / Flexbox

- **Backend**
  - FastAPI
  - SQLAlchemy
  - SQLite

## License

This project is licensed under the MIT License.
