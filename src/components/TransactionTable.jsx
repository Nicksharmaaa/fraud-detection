import { useState, useEffect } from 'react';

function TransactionTable({ 
  transactions, 
  loading, 
  error, 
  dateRange, 
  setDateRange, 
  filters, 
  setFilters, 
  searchTerm, 
  setSearchTerm 
}) {
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  
  useEffect(() => {
    if (!transactions.length) return;
    
    let filtered = [...transactions];
    
    // Apply date filters
    if (dateRange.startDate) {
      filtered = filtered.filter(transaction => {
        const txnDate = new Date(transaction.timestamp);
        return txnDate >= new Date(dateRange.startDate);
      });
    }
    
    if (dateRange.endDate) {
      filtered = filtered.filter(transaction => {
        const txnDate = new Date(transaction.timestamp);
        return txnDate <= new Date(dateRange.endDate);
      });
    }
    
    // Apply payer/payee filters
    if (filters.payerId) {
      filtered = filtered.filter(transaction => 
        transaction.payer_id.toLowerCase().includes(filters.payerId.toLowerCase())
      );
    }
    
    if (filters.payeeId) {
      filtered = filtered.filter(transaction => 
        transaction.payee_id.toLowerCase().includes(filters.payeeId.toLowerCase())
      );
    }
    
    // Apply search by transaction ID
    if (searchTerm) {
      filtered = filtered.filter(transaction => 
        transaction.transaction_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTransactions(filtered);
  }, [transactions, dateRange, filters, searchTerm]);
  
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const clearFilters = () => {
    setDateRange({ startDate: '', endDate: '' });
    setFilters({ payerId: '', payeeId: '' });
    setSearchTerm('');
  };
  
  if (loading) return <div className="loading">Loading transaction data...</div>;
  if (error) return <div className="error-message">{error}</div>;
  
  return (
    <div>
      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="startDate">Start Date</label>
          <input 
            type="date" 
            id="startDate" 
            name="startDate" 
            value={dateRange.startDate} 
            onChange={handleDateChange}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="endDate">End Date</label>
          <input 
            type="date" 
            id="endDate" 
            name="endDate" 
            value={dateRange.endDate} 
            onChange={handleDateChange}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="payerId">Payer ID</label>
          <input 
            type="text" 
            id="payerId" 
            name="payerId" 
            value={filters.payerId} 
            onChange={handleFilterChange} 
            placeholder="Filter by payer ID"
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="payeeId">Payee ID</label>
          <input 
            type="text" 
            id="payeeId" 
            name="payeeId" 
            value={filters.payeeId} 
            onChange={handleFilterChange} 
            placeholder="Filter by payee ID"
          />
        </div>
      </div>
      
      <div className="search-box">
        <input 
          type="text" 
          placeholder="Search by Transaction ID" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="filter-actions">
        <button className="secondary" onClick={clearFilters}>Clear Filters</button>
      </div>
      
      <div className="table-container">
        {filteredTransactions.length === 0 ? (
          <p>No transactions found matching your criteria.</p>
        ) : (
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Timestamp</th>
                <th>Amount</th>
                <th>Payer ID</th>
                <th>Payee ID</th>
                <th>Payment Mode</th>
                <th>Channel</th>
                <th>Bank</th>
                <th>Fraud Verdict</th>
                <th>Reported Fraud</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(transaction => (
                <tr key={transaction.transaction_id}>
                  <td>{transaction.transaction_id}</td>
                  <td>{new Date(transaction.timestamp).toLocaleString()}</td>
                  <td>${transaction.amount.toFixed(2)}</td>
                  <td>{transaction.payer_id}</td>
                  <td>{transaction.payee_id}</td>
                  <td>{transaction.payment_mode}</td>
                  <td>{transaction.transaction_channel}</td>
                  <td>{transaction.payment_gateway_bank || 'N/A'}</td>
                  <td className={transaction.is_fraud_predicted ? "fraud-verdict-yes" : "fraud-verdict-no"}>
                    {transaction.is_fraud_predicted ? "FRAUD" : "NOT FRAUD"}
                  </td>
                  <td className={transaction.is_fraud_reported ? "fraud-verdict-yes" : "fraud-verdict-no"}>
                    {transaction.is_fraud_reported ? "FRAUD" : "NOT FRAUD"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default TransactionTable; 