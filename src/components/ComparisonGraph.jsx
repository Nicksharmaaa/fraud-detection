import { useState, useEffect } from 'react';

function ComparisonGraph({ transactions }) {
  const [chartData, setChartData] = useState([]);
  const [dimension, setDimension] = useState('transaction_channel');
  
  const dimensions = [
    { value: 'transaction_channel', label: 'Transaction Channel' },
    { value: 'payment_mode', label: 'Payment Mode' },
    { value: 'payment_gateway_bank', label: 'Gateway Bank' },
    { value: 'payer_id', label: 'Payer ID' },
    { value: 'payee_id', label: 'Payee ID' }
  ];
  
  useEffect(() => {
    if (!transactions.length) return;
    
    // Group transactions by the selected dimension
    const groupedData = {};
    
    transactions.forEach(transaction => {
      const key = transaction[dimension] || 'Unknown';
      
      if (!groupedData[key]) {
        groupedData[key] = {
          dimension: key,
          predictedFrauds: 0,
          reportedFrauds: 0,
          total: 0
        };
      }
      
      if (transaction.is_fraud_predicted) {
        groupedData[key].predictedFrauds += 1;
      }
      
      if (transaction.is_fraud_reported) {
        groupedData[key].reportedFrauds += 1;
      }
      
      groupedData[key].total += 1;
    });
    
    // Convert to array and sort by total count
    const sortedData = Object.values(groupedData)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Limit to top 10 for readability
    
    setChartData(sortedData);
  }, [transactions, dimension]);
  
  const handleDimensionChange = (e) => {
    setDimension(e.target.value);
  };
  
  // Calculate maximum value for chart scaling
  const maxValue = chartData.length 
    ? Math.max(...chartData.map(item => 
        Math.max(item.predictedFrauds, item.reportedFrauds)
      )) 
    : 0;
  
  // Generate bars dynamically for the chart
  const renderBars = () => {
    if (!chartData.length) return null;
    
    return chartData.map((item, index) => {
      const predictedHeight = (item.predictedFrauds / maxValue) * 200 || 0;
      const reportedHeight = (item.reportedFrauds / maxValue) * 200 || 0;
      
      return (
        <div key={index} className="chart-column">
          <div className="bars-container">
            <div 
              className="bar predicted" 
              style={{ height: `${predictedHeight}px` }}
              title={`Predicted Frauds: ${item.predictedFrauds}`}
            >
              {item.predictedFrauds > 0 && <span className="bar-value">{item.predictedFrauds}</span>}
            </div>
            <div 
              className="bar reported" 
              style={{ height: `${reportedHeight}px` }}
              title={`Reported Frauds: ${item.reportedFrauds}`}
            >
              {item.reportedFrauds > 0 && <span className="bar-value">{item.reportedFrauds}</span>}
            </div>
          </div>
          <div className="bar-label">{item.dimension}</div>
        </div>
      );
    });
  };
  
  // Add CSS for the chart
  const chartStyles = `
    .chart-container {
      padding: 20px 0;
      overflow-x: auto;
    }
    
    .bar-chart {
      display: flex;
      align-items: flex-end;
      height: 250px;
      gap: 30px;
      margin-top: 30px;
      padding-bottom: 30px;
    }
    
    .chart-column {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;
    }
    
    .bars-container {
      display: flex;
      gap: 10px;
      height: 200px;
      align-items: flex-end;
    }
    
    .bar {
      width: 30px;
      min-height: 1px;
      border-radius: 3px 3px 0 0;
      position: relative;
      transition: height 0.5s ease;
      display: flex;
      justify-content: center;
    }
    
    .bar.predicted {
      background-color: #3b82f6;
    }
    
    .bar.reported {
      background-color: #ef4444;
    }
    
    .bar-value {
      position: absolute;
      top: -25px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .bar-label {
      margin-top: 10px;
      text-align: center;
      font-size: 12px;
      max-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .chart-legend {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 14px;
    }
    
    .legend-color {
      width: 15px;
      height: 15px;
      border-radius: 3px;
    }
    
    .legend-predicted {
      background-color: #3b82f6;
    }
    
    .legend-reported {
      background-color: #ef4444;
    }
  `;
  
  return (
    <div>
      <style>{chartStyles}</style>
      <div className="controls">
        <div className="filter-group">
          <label htmlFor="dimension">Compare By:</label>
          <select 
            id="dimension" 
            value={dimension} 
            onChange={handleDimensionChange}
          >
            {dimensions.map(dim => (
              <option key={dim.value} value={dim.value}>
                {dim.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="chart-container">
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color legend-predicted"></div>
            <span>Predicted Frauds</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-reported"></div>
            <span>Reported Frauds</span>
          </div>
        </div>
        
        {chartData.length === 0 ? (
          <p>No data available to display chart.</p>
        ) : (
          <div className="bar-chart">
            {renderBars()}
          </div>
        )}
      </div>
    </div>
  );
}

export default ComparisonGraph; 