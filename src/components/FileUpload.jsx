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
      <h3>Upload Transaction Data</h3>
      <p className="upload-info">
        Upload a JSON file containing transaction data for fraud analysis.
      </p>
      
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
          {file ? file.name : 'Choose JSON File'}
        </label>
        
        <button 
          onClick={handleUpload} 
          disabled={!file || loading}
          className={file ? 'primary' : 'secondary'}
        >
          {loading ? 'Uploading...' : 'Upload Data'}
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
        <div className="error-message">{error}</div>
      )}
      
      {uploadResults && uploadResults.results && uploadResults.results.length > 0 && (
        <div className="upload-results">
          <h4>Analysis Results:</h4>
          <div className="results-summary">
            <strong>Processed {uploadResults.processed_count} transactions</strong>
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
        <h4>Expected JSON Format:</h4>
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