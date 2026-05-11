import { useState } from "react";
import "./app.css";

type SentimentType = "Positive" | "Negative" | "Neutral" | "";

function Home() {
    const [text, setText] = useState<string>("");
    const [result, setResult] = useState<SentimentType>("");
    const [loading, setLoading] = useState<boolean>(false);

    const [scores, setScores] = useState({
        positive: 0,
        neutral: 0,
        negative: 0,
    });

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

        setScores({
            positive: 85,
            neutral: 10,
            negative: 5,
        });

    } else if (
        lowerText.includes("Bad") ||
        lowerText.includes("Ugly") ||
        lowerText.includes("Angry")
    ) {
        setResult("Negative");

        setScores({
            positive: 5,
            neutral: 15,
            negative: 80,
        });

    } else {
        setResult("Neutral");

        setScores({
            positive: 20,
            neutral: 65,
            negative: 15,
        });
    }

        setLoading(false);
    }, 800); 
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

        {result && !loading && (
            <div className="score-box">
                <h3>Prediction Score</h3>

            <div className="score-item">
                <span>Positive</span>
                <span>{scores.positive}%</span>
            </div>

            <div className="score-item">
                <span>Neutral</span>
                <span>{scores.neutral}%</span>
            </div>

            <div className="score-item">
                <span>Negative</span>
                <span>{scores.negative}%</span>
            </div>
        </div>
)}
        </div> 
    </div>
    );
}

export default Home;