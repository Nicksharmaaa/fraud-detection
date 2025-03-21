import { useState } from "react";
import Header from "./components/Header";
import TransactionForm from "./components/TransactionForm";
import Result from "./components/Result";
import ReportFraud from "./components/ReportFraud";
import UploadTransaction from "./components/UploadTransaction";
import "./App.css";

function App() {
    const [transactionDetails, setTransactionDetails] = useState({
        amount: "",
        type: "Credit",
        description: "",
    });
    const [result, setResult] = useState(null);
    const [batchResult, setBatchResult] = useState(null);
    const [error, setError] = useState("");

    const validateAndCheckFraud = async () => {
        const { amount, description } = transactionDetails;

        if (!amount || amount <= 0) {
            setError("⚠ Please enter a valid transaction amount!");
            setResult(null);
            return;
        }

        if (!description.trim()) {
            setError("⚠ Transaction description cannot be empty!");
            setResult(null);
            return;
        }

        setError("");

        // Send transaction details to FastAPI for fraud detection
        try {
            const transactionData = {
                transaction_id: "TXN" + Math.floor(Math.random() * 100000), // Generate random ID
                amount: parseFloat(amount),
                payer_id: "payer123",
                payee_id: "payee456",
                payment_mode: "Credit Card",
                transaction_channel: "Online",
            };

            const response = await fetch("http://127.0.0.1:8000/detect_fraud", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(transactionData),
            });

            const resultData = await response.json();
            setResult(resultData);
        } catch (error) {
            setError("⚠ Error connecting to fraud detection service.");
        }
    };

    return (
        <div className="container">
            <Header />
            <h1>Fraud Transaction Detection</h1>

            {/* Manual Transaction Form */}
            <TransactionForm
                transactionDetails={transactionDetails}
                setTransactionDetails={setTransactionDetails}
                checkFraud={validateAndCheckFraud}
            />
            {error && <p className="error">{error}</p>}
            <Result result={result} />
            {result && result.is_fraud && <ReportFraud transactionId={result.transaction_id} />}

            {/* JSON File Upload for Batch Fraud Detection */}
            <UploadTransaction setTransactionResult={setBatchResult} />
            {batchResult && (
                <div className="result">
                    <h2>Batch Fraud Detection Result</h2>
                    <pre>{JSON.stringify(batchResult, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default App;
