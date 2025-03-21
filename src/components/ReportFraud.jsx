import axios from "axios";

const ReportFraud = ({ transactionId }) => {
    const reportFraud = async () => {
        try {
            const response = await axios.post("http://127.0.0.1:8000/report_fraud", {
                transaction_id: transactionId,
                fraud_details: "User-reported fraud"
            });
            alert("Fraud Reported Successfully");
        } catch (error) {
            console.error("Error reporting fraud:", error);
        }
    };

    return (
        <button onClick={reportFraud}>Report Fraud</button>
    );
};

export default ReportFraud;
