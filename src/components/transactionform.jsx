import { useState } from "react";

function TransactionForm({ setResult }) {
    const [transactionDetails, setTransactionDetails] = useState({
        amount: "",
        type: "Credit",
        description: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTransactionDetails((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                console.log("Parsed JSON:", jsonData);
                sendToBackend(jsonData);
            } catch (error) {
                console.error("Invalid JSON file:", error);
                alert("Invalid JSON file. Please upload a valid JSON.");
            }
        };

        reader.readAsText(file);
    };

    const sendToBackend = async (jsonData) => {
        try {
            const response = await fetch("http://127.0.0.1:8000/detect_fraud", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(jsonData),
            });

            if (!response.ok) throw new Error("Failed to process transaction");

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("Error:", error);
            alert("Error processing transaction.");
        }
    };

    return (
        <div>
            <h2>Transaction Form</h2>
            <input
                type="number"
                name="amount"
                value={transactionDetails.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
            />
            <input type="file" accept=".json" onChange={handleFileUpload} />
            <button onClick={() => sendToBackend(transactionDetails)}>
                Check Fraud
            </button>
        </div>
    );
}

export default TransactionForm;
