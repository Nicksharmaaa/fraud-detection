import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

const FraudDetectionUI = () => {
    const [transactions, setTransactions] = useState("[{\"transaction_id\": \"123\", \"amount\": 5000, \"payer_id\": \"payer_001\", \"payee_id\": \"payee_002\", \"payment_mode\": \"credit_card\", \"transaction_channel\": \"web\"}]");
    const [rules, setRules] = useState({ high_amount_threshold: 10000 });
    const [result, setResult] = useState(null);
    
    const handleBatchDetection = async () => {
        try {
            const parsedTransactions = JSON.parse(transactions);
            const response = await axios.post(`${API_URL}/detect_fraud_batch`, parsedTransactions);
            setResult(response.data);
        } catch (error) {
            console.error("Error detecting fraud:", error);
            alert("Failed to process transactions.");
        }
    };
    
    const updateRules = async () => {
        try {
            await axios.post(`${API_URL}/update_rules`, rules);
            alert("Rules updated successfully");
        } catch (error) {
            console.error("Error updating rules:", error);
            alert("Failed to update rules");
        }
    };
    
    return (
        <div>
            <h2>Batch Fraud Detection</h2>
            <textarea
                rows="5"
                cols="50"
                value={transactions}
                onChange={(e) => setTransactions(e.target.value)}
            />
            <br />
            <button onClick={handleBatchDetection}>Detect Fraud</button>
            <h3>Detection Results</h3>
            <pre>{result && JSON.stringify(result, null, 2)}</pre>
            
            <h2>Update Rule-Based Checks</h2>
            <label>
                High Amount Threshold:
                <input
                    type="number"
                    value={rules.high_amount_threshold}
                    onChange={(e) => setRules({ ...rules, high_amount_threshold: Number(e.target.value) })}
                />
            </label>
            <br />
            <button onClick={updateRules}>Update Rules</button>
        </div>
    );
};

export default FraudDetectionUI;