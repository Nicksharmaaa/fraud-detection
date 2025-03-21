import { useState } from 'react';
import axios from 'axios';

function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/json') {
      setFile(selectedFile);
      setError(null);
      setUploadResults(null);
    } else {
      setFile(null);
      setError('Please select a valid JSON file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a JSON file to upload');
      return;
    }

    try {
      setLoading(true);
      setProgress(0);
      setError(null);
      setUploadResults(null);

      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          console.log("File content:", event.target.result);
          
          // Try to parse the JSON data
          let jsonData;
          try {
            jsonData = JSON.parse(event.target.result);
          } catch (parseError) {
            console.error("JSON Parse error:", parseError);
            setError(`Invalid JSON format: ${parseError.message}. Please check your file.`);
            setLoading(false);
            return;
          }
          
          // Check if the JSON structure is correct (should be an array)
          if (!Array.isArray(jsonData)) {
            console.error("JSON data is not an array:", jsonData);
            setError('Invalid JSON format: Expected an array of transactions');
            setLoading(false);
            return;
          }

          console.log("Parsed JSON data:", jsonData);
          console.log("Sending data to server:", jsonData);
          
          // Upload the parsed data to the backend
          try {
            const response = await axios.post(
              'http://127.0.0.1:8000/upload_transactions', 
              jsonData,
              {
                onUploadProgress: (progressEvent) => {
                  const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                  setProgress(percentCompleted);
                }
              }
            );
            
            console.log("Server response:", response.data);
            
            setUploadResults(response.data);
            
            if (onUploadSuccess) {
              onUploadSuccess(response.data);
            }
            
            setProgress(100);
            setFile(null);
          } catch (apiError) {
            console.error("API error:", apiError);
            if (apiError.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              console.error("Response error data:", apiError.response.data);
              console.error("Response error status:", apiError.response.status);
              setError(`Error uploading file: ${apiError.response.status} - ${apiError.response.data.detail || apiError.message}`);
            } else if (apiError.request) {
              // The request was made but no response was received
              console.error("No response received:", apiError.request);
              setError('Network error: No response from server. Please check if the backend is running.');
            } else {
              // Something happened in setting up the request that triggered an Error
              setError('Error uploading file: ' + apiError.message);
            }
            setLoading(false);
          }
        } catch (generalError) {
          console.error("General error:", generalError);
          setError('Error processing file: ' + generalError.message);
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Error reading file');
        setLoading(false);
      };
      
      reader.readAsText(file);
      
    } catch (err) {
      console.error("Upload error:", err);
      setError('Error uploading file: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="file-upload">
      <div className="upload-container">
        <div className="upload-header">
          <div className="upload-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="upload-title">
            <h3>Upload Transaction Data</h3>
            <p className="upload-info">
              Upload a JSON file containing transaction data for fraud analysis.
            </p>
          </div>
        </div>
        
        <div className="upload-controls">
          <input 
            type="file" 
            accept=".json" 
            onChange={handleFileChange}
            disabled={loading}
            id="file-upload"
            className="file-input"
          />
          <label htmlFor="file-upload" className="file-label">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
            </svg>
            {file ? file.name : 'Choose JSON File'}
          </label>
          
          <button 
            onClick={handleUpload} 
            disabled={!file || loading}
            className={file ? 'primary' : 'secondary'}
          >
            {loading ? 'Processing...' : 'Upload & Analyze'}
            {!loading && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{marginLeft: '8px'}}>
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>}
            {loading && <div className="spinner"></div>}
          </button>
        </div>
        
        {loading && (
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${progress}%` }}
            />
            <span className="progress-text">{progress}%</span>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>
      
      {uploadResults && uploadResults.results && uploadResults.results.length > 0 && (
        <div className="upload-results">
          <div className="results-header">
            <h4>Analysis Results</h4>
            <span className="results-badge">{uploadResults.processed_count} Transactions</span>
          </div>
          <div className="results-table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Fraud Verdict</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {uploadResults.results.map((result, index) => (
                  <tr key={index}>
                    <td>{result.transaction_id}</td>
                    <td>${result.amount.toFixed(2)}</td>
                    <td className={result.is_fraud_predicted ? "fraud-verdict-yes" : "fraud-verdict-no"}>
                      {result.fraud_verdict || (result.is_fraud_predicted ? "FRAUD" : "NOT FRAUD")}
                    </td>
                    <td>{result.fraud_reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="file-format-help">
        <div className="format-header">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
          <h4>Expected JSON Format:</h4>
        </div>
        <pre>
{`[
  {
    "amount": 1000,
    "payer_id": "payer_001",
    "payee_id": "payee_002",
    "payment_mode": "credit_card",
    "transaction_channel": "web",
    "payment_gateway_bank": "HDFC"
  },
  ...
]`}
        </pre>
      </div>
    </div>
  );
}

export default FileUpload; 