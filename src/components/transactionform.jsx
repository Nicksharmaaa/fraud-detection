const TransactionForm = ({ transactionDetails, setTransactionDetails, checkFraud }) => {
    return (
        <div className="transaction-form">
            <label>Transaction Amount (₹):</label>
            <input
                type="number"
                placeholder="Enter Amount"
                value={transactionDetails.amount}
                onChange={(e) => setTransactionDetails({ ...transactionDetails, amount: e.target.value })}
            />

            <label>Transaction Type:</label>
            <select
                value={transactionDetails.type}
                onChange={(e) => setTransactionDetails({ ...transactionDetails, type: e.target.value })}
            >
                <option value="Credit">Credit</option>
                <option value="Debit">Debit</option>
            </select>

            <label>Description:</label>
            <input
                type="text"
                placeholder="Enter Description"
                value={transactionDetails.description}
                onChange={(e) => setTransactionDetails({ ...transactionDetails, description: e.target.value })}
            />

            <button onClick={checkFraud}>Check Transaction</button>
        </div>
    );
};

export default TransactionForm;
