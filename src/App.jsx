import { useState } from "react";
import "./App.css";

function App() {
    const [transaction, setTransaction] = useState("");
    const [result, setResult] = useState(null);

    const handleCheck = () => {
        // Dummy check: Mark transactions above 10000 as fraud (for demo)
        if (parseFloat(transaction) > 10000) {
            setResult("🚨 Fraudulent Transaction Detected!");
        } else {
            setResult("✅ Transaction is Safe.");
        }
    };

    return (
        <div className="container">
            <h1>Fraud Transaction Detection</h1>
            <p>Enter the transaction amount to check if it is fraudulent.</p>

            <input
                type="number"
                placeholder="Enter Amount"
                value={transaction}
                onChange={(e) => setTransaction(e.target.value)}
            />
            <button onClick={handleCheck}>Check Transaction</button>

            {result && <h2 className="result">{result}</h2>}
        </div>
    );
}

export default App;

