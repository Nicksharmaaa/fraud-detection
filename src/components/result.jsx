const Result = ({ result }) => {
    return (
        <div>
            {result && (
                <div>
                    <h2>Fraud Detection Result</h2>
                    <p><strong>Transaction ID:</strong> {result.transaction_id}</p>
                    <p><strong>Fraudulent:</strong> {result.is_fraud ? "🚨 Yes" : "✅ No"}</p>
                    <p><strong>Detection Source:</strong> {result.fraud_source}</p>
                    <p><strong>Fraud Score:</strong> {result.fraud_score}</p>
                </div>
            )}
        </div>
    );
};

export default Result;
