from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn.functional as F
import pickle
import io

app = Flask(__name__)
CORS(app)

# ============================================================
# LOAD MODEL
# ============================================================
MODEL_DIR = "./model"

# Custom unpickler untuk handle model yang di-train di GPU
# tapi dijalankan di CPU
class CPUUnpickler(pickle.Unpickler):
    def find_class(self, module, name):
        if module == 'torch.storage' and name == '_load_from_bytes':
            return lambda b: torch.load(io.BytesIO(b), map_location='cpu', weights_only=False)
        return super().find_class(module, name)

print("Loading model...")
with open(f"{MODEL_DIR}/indobert_model.pkl", "rb") as f:
    model = CPUUnpickler(f).load()

with open(f"{MODEL_DIR}/indobert_tokenizer.pkl", "rb") as f:
    tokenizer = pickle.load(f)

with open(f"{MODEL_DIR}/indobert_label_encoder.pkl", "rb") as f:
    label_encoder = pickle.load(f)

model.eval()
print("Model loaded!")


# ============================================================
# ENDPOINT: POST /predict
# ============================================================
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "Field 'text' wajib diisi"}), 400

    text = data["text"].strip()
    if not text:
        return jsonify({"error": "Text tidak boleh kosong"}), 400

    inputs = tokenizer(
        text,
        return_tensors="pt",
        max_length=128,
        truncation=True,
        padding="max_length"
    )

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits

    probs = F.softmax(logits, dim=1).squeeze().tolist()

    pred_idx = torch.argmax(logits, dim=1).item()
    pred_label = label_encoder.inverse_transform([pred_idx])[0]

    classes = label_encoder.classes_.tolist()
    scores = {cls: round(probs[i] * 100, 1) for i, cls in enumerate(classes)}

    return jsonify({
        "label": pred_label,
        "scores": {
            "positive": scores.get("positive", 0),
            "neutral":  scores.get("neutral", 0),
            "negative": scores.get("negative", 0),
        }
    })


# ============================================================
# ENDPOINT: GET /health
# ============================================================
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)