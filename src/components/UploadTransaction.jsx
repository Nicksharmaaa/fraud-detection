import { useState } from "react";

const UploadTransaction = ({ setTransactionResult }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setError("");
    };

    const handleUpload = async () => {
        if (!file) {
            setError("⚠ Please select a JSON file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const jsonData = JSON.parse(event.target.result);

                const response = await fetch("http://127.0.0.1:8000/detect_fraud", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(jsonData),
                });

                const result = await response.json();
                setTransactionResult(result);
            } catch (err) {
                setError("⚠ Invalid JSON file format.");
            }
        };

        reader.readAsText(file);
    };

    return (
        <div className="upload-container">
            <h2>Upload Transaction JSON</h2>
            <input type="file" accept=".json" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload & Detect Fraud</button>
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default UploadTransaction;
