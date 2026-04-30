import { useState } from "react";
import "./app.css";

type SentimentType = "Positive" | "Negative" | "Neutral" | "";

function Home() {
    const [text, setText] = useState<string>("");
    const [result, setResult] = useState<SentimentType>("");
    const [loading, setLoading] = useState<boolean>(false);

    const analyzeSentiment = () => {
    if (!text.trim()) return;

    setLoading(true);

    setTimeout(() => {
        const lowerText = text.toLowerCase();

    if (
        lowerText.includes("Good") ||
        lowerText.includes("Okay") ||
        lowerText.includes("Happy")
    ) {
        setResult("Positive");
    } else if (
        lowerText.includes("Bad") ||
        lowerText.includes("Ugly") ||
        lowerText.includes("Angry")
    ) {
        setResult("Negative");
    } else {
        setResult("Neutral");
    }

        setLoading(false);
    }, 800); // simulasi loading
    };

    const getResultClass = () => {
        switch (result) {
            case "Positive":
                return "result positive";
            case "Negative":
                return "result negative";
            case "Neutral":
                return "result neutral";
            default:
                return "result";
        }   
    };

    return (
    <div className="container">
        <div className="card">
            <h1>Sentiment Analysis</h1>

        <textarea
            placeholder="Input Teks Here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
        />

        <button onClick={analyzeSentiment}>Analyze</button>

        {loading && <p className="loading">Analyzing...</p>}

        {result && !loading && (
            <div className={getResultClass()}>
                {result === "Positive" && "😆 Positive"}
                {result === "Negative" && "😡 Negative"}
                {result === "Neutral" && "😐 Neutral"}
            </div>
        )}
        </div>
    </div>
    );
}

export default Home;