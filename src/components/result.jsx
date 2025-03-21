const Result = ({ result }) => {
    return (
        result && <h2 className={`result ${result.includes("Fraudulent") ? "fraud" : "safe"}`}>{result}</h2>
    );
};

export default Result;
