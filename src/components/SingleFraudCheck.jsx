import { useState } from 'react';
import axios from 'axios';

function SingleFraudCheck() {
  const [transaction, setTransaction] = useState({
    amount: '',
    payer_id: '',
    payee_id: '',
    payment_mode: 'credit_card',
    transaction_channel: 'web',
    payment_gateway_bank: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  const paymentModes = [
    'credit_card', 'debit_card', 'netbanking', 'upi', 'wallet'
  ];
  
  const channels = [
    'web', 'mobile', 'pos', 'atm', 'branch'
  ];
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransaction(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!transaction.amount || !transaction.payer_id || !transaction.payee_id) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      // Prepare the data
      const data = {
        ...transaction,
        amount: parseFloat(transaction.amount)
      };
      
      console.log("Sending transaction data to API:", data);
      
      // Send to backend
      const response = await axios.post('http://127.0.0.1:8000/detect_fraud', data);
      
      console.log("API Response:", response.data);
      
      setResult(response.data);
    } catch (err) {
      console.error("Error checking transaction:", err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response error data:", err.response.data);
        console.error("Response error status:", err.response.status);
        setError(`Error processing transaction: ${err.response.status} - ${err.response.data.detail || err.message}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error("No response received:", err.request);
        setError('Network error: No response from server. Please check if the backend is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Error processing transaction: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="single-transaction-check">
      <h3>Check Single Transaction</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="amount">Amount*</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={transaction.amount}
              onChange={handleInputChange}
              placeholder="Enter transaction amount"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="payer_id">Payer ID*</label>
            <input
              type="text"
              id="payer_id"
              name="payer_id"
              value={transaction.payer_id}
              onChange={handleInputChange}
              placeholder="Enter payer ID"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="payee_id">Payee ID*</label>
            <input
              type="text"
              id="payee_id"
              name="payee_id"
              value={transaction.payee_id}
              onChange={handleInputChange}
              placeholder="Enter payee ID"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="payment_mode">Payment Mode</label>
            <select 
              id="payment_mode" 
              name="payment_mode"
              value={transaction.payment_mode}
              onChange={handleInputChange}
            >
              {paymentModes.map(mode => (
                <option key={mode} value={mode}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="transaction_channel">Transaction Channel</label>
            <select 
              id="transaction_channel" 
              name="transaction_channel"
              value={transaction.transaction_channel}
              onChange={handleInputChange}
            >
              {channels.map(channel => (
                <option key={channel} value={channel}>
                  {channel.charAt(0).toUpperCase() + channel.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="payment_gateway_bank">Gateway Bank (Optional)</label>
            <input
              type="text"
              id="payment_gateway_bank"
              name="payment_gateway_bank"
              value={transaction.payment_gateway_bank}
              onChange={handleInputChange}
              placeholder="Enter bank name"
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Check Transaction'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      {result && (
        <div className="fraud-check-result">
          <h4>Fraud Check Result:</h4>
          <div className="result-card">
            <div className="result-header">
              <div className="transaction-id">Transaction ID: {result.transaction_id}</div>
              <div className="transaction-amount">${result.amount.toFixed(2)}</div>
            </div>
            
            <div className="fraud-verdict-container">
              <div className={result.is_fraud_predicted ? "big-fraud-verdict fraud" : "big-fraud-verdict safe"}>
                {result.is_fraud_predicted ? "FRAUD DETECTED" : "NO FRAUD DETECTED"}
              </div>
            </div>
            
            <div className="fraud-details">
              <div className="detail-item">
                <span className="detail-label">Reason:</span>
                <span className="detail-value">{result.fraud_reason}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Detection Source:</span>
                <span className="detail-value">{result.fraud_source.toUpperCase()}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Risk Score:</span>
                <span className="detail-value">{(result.fraud_score * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SingleFraudCheck; 