import { useState } from "react";
import axios from "axios";

const TransactionForm = ({ setResult }) => {
    const [transaction, setTransaction] = useState({
        transaction_id: "",
        amount: "",
        payer_id: "",
        payee_id: "",
        payment_mode: "",
        transaction_channel: ""
    });

    const handleChange = (e) => {
        setTransaction({ ...transaction, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("http://127.0.0.1:8000/detect_fraud", transaction);
            setResult(response.data);
        } catch (error) {
            console.error("Error detecting fraud:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="transaction_id" placeholder="Transaction ID" onChange={handleChange} required />
            <input type="number" name="amount" placeholder="Amount" onChange={handleChange} required />
            <input type="text" name="payer_id" placeholder="Payer ID" onChange={handleChange} required />
            <input type="text" name="payee_id" placeholder="Payee ID" onChange={handleChange} required />
            <input type="text" name="payment_mode" placeholder="Payment Mode" onChange={handleChange} required />
            <input type="text" name="transaction_channel" placeholder="Transaction Channel" onChange={handleChange} required />
            <button type="submit">Check Fraud</button>
        </form>
    );
};

export default TransactionForm;
