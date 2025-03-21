import { useState, useEffect } from 'react';

function EvaluationMetrics({ transactions }) {
  const [evalData, setEvalData] = useState({
    truePositives: 0,
    falsePositives: 0,
    trueNegatives: 0,
    falseNegatives: 0,
    precision: 0,
    recall: 0,
    f1Score: 0,
    accuracy: 0
  });
  
  const [timeRange, setTimeRange] = useState('month');
  
  const timeRanges = [
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'quarter', label: 'Last Quarter' },
    { value: 'year', label: 'Last Year' },
    { value: 'all', label: 'All Time' }
  ];
  
  useEffect(() => {
    if (!transactions.length) return;
    
    // Calculate date range based on selected time range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        // Find earliest transaction date
        startDate = transactions.reduce((earliest, txn) => {
          const txnDate = new Date(txn.timestamp);
          return txnDate < earliest ? txnDate : earliest;
        }, new Date());
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }
    
    // Filter transactions within the selected time range
    const filteredTransactions = transactions.filter(txn => {
      const txnDate = new Date(txn.timestamp);
      return txnDate >= startDate && txnDate <= now;
    });
    
    // Calculate confusion matrix values
    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;
    
    filteredTransactions.forEach(txn => {
      if (txn.is_fraud_predicted && txn.is_fraud_reported) {
        truePositives++;
      } else if (txn.is_fraud_predicted && !txn.is_fraud_reported) {
        falsePositives++;
      } else if (!txn.is_fraud_predicted && !txn.is_fraud_reported) {
        trueNegatives++;
      } else if (!txn.is_fraud_predicted && txn.is_fraud_reported) {
        falseNegatives++;
      }
    });
    
    // Calculate metrics
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = 2 * ((precision * recall) / (precision + recall) || 0);
    const accuracy = (truePositives + trueNegatives) / filteredTransactions.length || 0;
    
    setEvalData({
      truePositives,
      falsePositives,
      trueNegatives,
      falseNegatives,
      precision,
      recall,
      f1Score,
      accuracy
    });
  }, [transactions, timeRange]);
  
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };
  
  // Format percentage values
  const formatPercentage = (value) => {
    return (value * 100).toFixed(2) + '%';
  };
  
  return (
    <div>
      <div className="controls">
        <div className="filter-group">
          <label htmlFor="evalTimeRange">Evaluation Period:</label>
          <select 
            id="evalTimeRange"
            value={timeRange}
            onChange={handleTimeRangeChange}
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{formatPercentage(evalData.precision)}</div>
          <div className="metric-label">Precision</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{formatPercentage(evalData.recall)}</div>
          <div className="metric-label">Recall</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{formatPercentage(evalData.f1Score)}</div>
          <div className="metric-label">F1 Score</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{formatPercentage(evalData.accuracy)}</div>
          <div className="metric-label">Accuracy</div>
        </div>
      </div>
      
      <h3>Confusion Matrix</h3>
      <div className="confusion-matrix">
        <div className="matrix-cell matrix-header"></div>
        <div className="matrix-cell matrix-header">Predicted Fraud</div>
        <div className="matrix-cell matrix-header">Predicted Non-Fraud</div>
        
        <div className="matrix-cell matrix-header">Actual Fraud</div>
        <div className="matrix-cell matrix-value true-positive">{evalData.truePositives}</div>
        <div className="matrix-cell matrix-value false-negative">{evalData.falseNegatives}</div>
        
        <div className="matrix-cell matrix-header">Actual Non-Fraud</div>
        <div className="matrix-cell matrix-value false-positive">{evalData.falsePositives}</div>
        <div className="matrix-cell matrix-value true-negative">{evalData.trueNegatives}</div>
      </div>
      
      <div className="metrics-explanation">
        <h4>Metrics Explanation</h4>
        <ul>
          <li><strong>Precision:</strong> When model predicts fraud, how often is it correct?</li>
          <li><strong>Recall:</strong> Out of all actual frauds, how many did the model catch?</li>
          <li><strong>F1 Score:</strong> Harmonic mean of precision and recall</li>
          <li><strong>Accuracy:</strong> Overall correctness of all predictions</li>
        </ul>
      </div>
    </div>
  );
}

export default EvaluationMetrics; 