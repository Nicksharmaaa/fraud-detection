import { useState, useEffect } from 'react';

function TimeSeriesGraph({ transactions }) {
  const [timeData, setTimeData] = useState([]);
  const [timeRange, setTimeRange] = useState('month');
  const [zoomLevel, setZoomLevel] = useState(1);
  
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
    
    // Determine time granularity based on range and zoom level
    let timeUnit = 'day';
    if (timeRange === 'all' || timeRange === 'year') {
      timeUnit = 'month';
    } else if (timeRange === 'quarter') {
      timeUnit = zoomLevel <= 1 ? 'month' : 'week';
    } else if (timeRange === 'month') {
      timeUnit = zoomLevel <= 1 ? 'week' : 'day';
    } else if (timeRange === 'week') {
      timeUnit = 'day';
    }
    
    // Group transactions by time unit
    const groupedData = {};
    
    filteredTransactions.forEach(txn => {
      const date = new Date(txn.timestamp);
      let key;
      
      switch (timeUnit) {
        case 'month':
          key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          break;
        case 'week':
          // Get start of the week (Sunday)
          const day = date.getDay();
          const diff = date.getDate() - day;
          const weekStart = new Date(date);
          weekStart.setDate(diff);
          key = `${weekStart.getFullYear()}-${weekStart.getMonth() + 1}-${weekStart.getDate()}`;
          break;
        case 'day':
        default:
          key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      }
      
      if (!groupedData[key]) {
        groupedData[key] = {
          timeLabel: key,
          predictedFrauds: 0,
          reportedFrauds: 0,
          date: new Date(date) // Keep the date for sorting
        };
      }
      
      if (txn.is_fraud_predicted) {
        groupedData[key].predictedFrauds += 1;
      }
      
      if (txn.is_fraud_reported) {
        groupedData[key].reportedFrauds += 1;
      }
    });
    
    // Sort data points chronologically
    const sortedData = Object.values(groupedData).sort((a, b) => a.date - b.date);
    
    // Format date labels based on time unit
    sortedData.forEach(point => {
      const date = point.date;
      switch (timeUnit) {
        case 'month':
          point.timeLabel = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
          break;
        case 'week':
          const endOfWeek = new Date(date);
          endOfWeek.setDate(date.getDate() + 6);
          point.timeLabel = `${date.getDate()}-${endOfWeek.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
          break;
        case 'day':
        default:
          point.timeLabel = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
      }
    });
    
    setTimeData(sortedData);
  }, [transactions, timeRange, zoomLevel]);
  
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
    setZoomLevel(1); // Reset zoom when changing time range
  };
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 1, 3));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 1, 1));
  };
  
  // Calculate maximum value for chart scaling
  const maxValue = timeData.length 
    ? Math.max(...timeData.map(item => 
        Math.max(item.predictedFrauds, item.reportedFrauds)
      )) 
    : 0;
  
  // Plot line graph
  const renderGraph = () => {
    if (!timeData.length) return null;
    
    const graphWidth = 800;
    const graphHeight = 200;
    const paddingX = 40;
    const paddingY = 20;
    const pointSpacing = Math.min((graphWidth - paddingX * 2) / (timeData.length - 1), 80);
    const adjustedWidth = paddingX * 2 + pointSpacing * (timeData.length - 1);
    
    // Generate points for line paths
    const predictedPoints = timeData.map((point, index) => {
      const x = paddingX + index * pointSpacing;
      const y = graphHeight - paddingY - (point.predictedFrauds / maxValue * (graphHeight - paddingY * 2) || 0);
      return `${x},${y}`;
    }).join(' ');
    
    const reportedPoints = timeData.map((point, index) => {
      const x = paddingX + index * pointSpacing;
      const y = graphHeight - paddingY - (point.reportedFrauds / maxValue * (graphHeight - paddingY * 2) || 0);
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg width="100%" height={graphHeight} viewBox={`0 0 ${adjustedWidth} ${graphHeight}`} className="time-graph">
        {/* X and Y axis */}
        <line x1={paddingX} y1={graphHeight - paddingY} x2={adjustedWidth - paddingX} y2={graphHeight - paddingY} stroke="#d1d5db" strokeWidth="1" />
        <line x1={paddingX} y1={paddingY} x2={paddingX} y2={graphHeight - paddingY} stroke="#d1d5db" strokeWidth="1" />
        
        {/* Plot lines */}
        <polyline 
          points={predictedPoints} 
          fill="none" 
          stroke="#3b82f6" 
          strokeWidth="2"
        />
        
        <polyline 
          points={reportedPoints} 
          fill="none" 
          stroke="#ef4444" 
          strokeWidth="2"
        />
        
        {/* Data points */}
        {timeData.map((point, index) => {
          const x = paddingX + index * pointSpacing;
          const predictedY = graphHeight - paddingY - (point.predictedFrauds / maxValue * (graphHeight - paddingY * 2) || 0);
          const reportedY = graphHeight - paddingY - (point.reportedFrauds / maxValue * (graphHeight - paddingY * 2) || 0);
          
          return (
            <g key={index}>
              {/* X-axis labels - show every nth label depending on zoom */}
              {(index % Math.max(Math.floor(timeData.length / 8), 1) === 0 || index === timeData.length - 1) && (
                <text x={x} y={graphHeight - 5} fontSize="10" textAnchor="middle">{point.timeLabel}</text>
              )}
              
              {/* Data points */}
              <circle cx={x} cy={predictedY} r="3" fill="#3b82f6" />
              <circle cx={x} cy={reportedY} r="3" fill="#ef4444" />
              
              {/* Tooltips */}
              <title>{`${point.timeLabel}: Predicted=${point.predictedFrauds}, Reported=${point.reportedFrauds}`}</title>
            </g>
          );
        })}
      </svg>
    );
  };
  
  return (
    <div>
      <div className="controls">
        <div className="filter-group">
          <label htmlFor="timeRange">Time Period:</label>
          <select 
            id="timeRange"
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
        
        <div className="zoom-controls">
          <button className="secondary" onClick={handleZoomOut} disabled={zoomLevel <= 1}>
            Zoom Out
          </button>
          <button className="secondary" onClick={handleZoomIn} disabled={zoomLevel >= 3}>
            Zoom In
          </button>
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
        
        {timeData.length === 0 ? (
          <p>No time series data available to display.</p>
        ) : (
          <div className="graph-container">
            {renderGraph()}
          </div>
        )}
      </div>
    </div>
  );
}

export default TimeSeriesGraph; 