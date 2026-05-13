import { useState } from "react";
import "./app.css";

type SentimentType = "positive" | "negative" | "neutral" | "";

interface Scores {
    positive: number;
    neutral: number;
    negative: number;
}

function Home() {
    const [text, setText] = useState<string>("");
    const [result, setResult] = useState<SentimentType>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [scores, setScores] = useState<Scores>({
        positive: 0,
        neutral: 0,
        negative: 0,
    });

    const analyzeSentiment = async () => {
        if (!text.trim()) return;

        setLoading(true);
        setError("");
        setResult("");

        try {
            const response = await fetch("http://localhost:5000/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error("Server error");
            }

            const data = await response.json();

            setResult(data.label as SentimentType);
            setScores({
                positive: data.scores.positive,
                neutral: data.scores.neutral,
                negative: data.scores.negative,
            });
        } catch (err) {
            setError("Gagal menghubungi server. Pastikan backend sudah berjalan.");
        } finally {
            setLoading(false);
        }
    };

    const getResultClass = () => {
        switch (result) {
            case "positive": return "result positive";
            case "negative": return "result negative";
            case "neutral":  return "result neutral";
            default:         return "result";
        }
    };

    const getResultDisplay = () => {
        switch (result) {
            case "positive": return "😆 Positive";
            case "negative": return "😡 Negative";
            case "neutral":  return "😐 Neutral";
            default:         return "";
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

                <button onClick={analyzeSentiment} disabled={loading}>
                    {loading ? "Analyzing..." : "Analyze"}
                </button>

                {error && <p className="error">{error}</p>}

                {result && !loading && (
                    <div className={getResultClass()}>
                        {getResultDisplay()}
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
