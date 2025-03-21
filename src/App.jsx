import { useState, useEffect } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import SingleFraudCheck from './components/SingleFraudCheck';
import TransactionTable from './components/TransactionTable';
import ComparisonGraph from './components/ComparisonGraph';
import TimeSeriesGraph from './components/TimeSeriesGraph';
import EvaluationMetrics from './components/EvaluationMetrics';
import axios from 'axios';
import './App.css';

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [filters, setFilters] = useState({ payerId: '', payeeId: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(null);
  
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      console.log("Fetching transactions from:", `${API_URL}/transactions`);
      const response = await axios.get(`${API_URL}/transactions`);
      console.log("API Response:", response);
      setTransactions(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transaction data. Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (data) => {
    setUploadSuccess({
      message: `Successfully processed ${data.processed_count} transactions`,
      timestamp: new Date().toLocaleTimeString()
    });
    fetchTransactions(); // Refresh the transaction list
  };

  return (
    <div className="app">
      <Header />
      <main className="dashboard">
        <section className="dashboard-section upload-section">
          <h2>Upload Transactions</h2>
          <FileUpload onUploadSuccess={handleUploadSuccess} />
          {uploadSuccess && (
            <div className="success-message">
              {uploadSuccess.message} at {uploadSuccess.timestamp}
            </div>
          )}
        </section>

        <section className="dashboard-section check-section">
          <h2>Fraud Check Tool</h2>
          <SingleFraudCheck />
        </section>

        <section className="dashboard-section">
          <h2>Transaction Data</h2>
          <TransactionTable 
            transactions={transactions} 
            loading={loading}
            error={error}
            dateRange={dateRange}
            setDateRange={setDateRange}
            filters={filters}
            setFilters={setFilters}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </section>

        <section className="dashboard-section">
          <h2>Fraud Comparison</h2>
          <ComparisonGraph transactions={transactions} />
        </section>

        <section className="dashboard-section">
          <h2>Fraud Detection Trends</h2>
          <TimeSeriesGraph transactions={transactions} />
        </section>

        <section className="dashboard-section">
          <h2>Model Evaluation</h2>
          <EvaluationMetrics transactions={transactions} />
        </section>
      </main>
    </div>
  );
}

export default App;
