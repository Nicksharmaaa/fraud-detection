import { useState } from "react";
import Header from "./components/Header";
import TransactionForm from "./components/TransactionForm";
import Result from "./components/Result";
import "./App.css";

function App() {
    const [transactionDetails, setTransactionDetails] = useState({
        amount: "",
        type: "Credit",
        description: "",
    });
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const validateAndCheckFraud = () => {
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

        // Dummy Fraud Detection Logic: If amount > 10,000, consider it fraud
        if (parseFloat(amount) > 10000) {
            setResult("🚨 Fraudulent Transaction Detected!");
        } else {
            setResult("✅ Transaction is Safe.");
        }
    };

    return (
        <div className="container">
            <Header />
            <TransactionForm
                transactionDetails={transactionDetails}
                setTransactionDetails={setTransactionDetails}
                checkFraud={validateAndCheckFraud}
            />
            {error && <p className="error">{error}</p>}
            <Result result={result} />
        </div>
    );
}

export default App;

