from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn.functional as F
import pickle
 
app = Flask(__name__)
CORS(app)  # biar frontend React bisa hit backend ini
 
# ============================================================
# LOAD MODEL (dijalankan sekali waktu server start)
# ============================================================
MODEL_PATH = "./model/model.pkl"
 
print("Loading model...")
with open(MODEL_PATH, "rb") as f:
    bundle = pickle.load(f)
 
model = bundle["model"]
tokenizer = bundle["tokenizer"]
model.eval()  # set ke inference mode
print("Model loaded!")
 
# Urutan label sesuai waktu training
# 0 = negative, 1 = neutral, 2 = positive (cek config.json kalau ragu)
LABEL_MAP = {0: "negative", 1: "neutral", 2: "positive"}
 
 
# ============================================================
# ENDPOINT: POST /predict
# ============================================================
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
 
    # Validasi input
    if not data or "text" not in data:
        return jsonify({"error": "Field 'text' wajib diisi"}), 400
 
    text = data["text"].strip()
    if not text:
        return jsonify({"error": "Text tidak boleh kosong"}), 400
 
    # Tokenize
    inputs = tokenizer(
        text,
        return_tensors="pt",
        max_length=128,
        truncation=True,
        padding="max_length"
    )
 
    # Inferensi
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
 
    # Hitung probabilitas tiap kelas
    probs = F.softmax(logits, dim=1).squeeze().tolist()
 
    # Ambil label dengan prob tertinggi
    pred_idx = torch.argmax(logits, dim=1).item()
    pred_label = LABEL_MAP[pred_idx]
 
    return jsonify({
        "label": pred_label,
        "scores": {
            "negative": round(probs[0] * 100, 1),
            "neutral":  round(probs[1] * 100, 1),
            "positive": round(probs[2] * 100, 1),
        }
    })
 
 
# ============================================================
# ENDPOINT: GET /health  (opsional, buat cek server hidup)
# ============================================================
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})
 
 
if __name__ == "__main__":
    app.run(debug=True, port=5000)