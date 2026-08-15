import os
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import wraps
import time
from dotenv import load_dotenv

# Load .env (local dev)
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ─── Register RAG Blueprint ───────────────────────────────────────────────────
from rag import rag_bp
from rag.store import start_cleanup_thread

app.register_blueprint(rag_bp)
start_cleanup_thread(interval_seconds=1800)  # cleanup every 30 min

# ─── Rate Limiter ─────────────────────────────────────────────────────────────
_rate_limit_store = {}  # ip -> [timestamps]
RATE_LIMIT_REQUESTS = 30   # max requests
RATE_LIMIT_WINDOW = 60     # per 60 seconds

def rate_limit(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        ip = request.remote_addr or "unknown"
        now = time.time()
        window_start = now - RATE_LIMIT_WINDOW
        # Clean old entries
        _rate_limit_store[ip] = [t for t in _rate_limit_store.get(ip, []) if t > window_start]
        if len(_rate_limit_store[ip]) >= RATE_LIMIT_REQUESTS:
            retry_after = int(RATE_LIMIT_WINDOW - (now - _rate_limit_store[ip][0]))
            resp = jsonify({"error": "Rate limit exceeded. Please wait before retrying.", "retry_after": retry_after})
            resp.status_code = 429
            resp.headers["Retry-After"] = str(retry_after)
            return resp
        _rate_limit_store[ip].append(now)
        return f(*args, **kwargs)
    return decorated


# ─── Model Loading ────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

possible_paths = [
    os.environ.get("THEME_MODEL_PATH"),
    os.path.join(BASE_DIR, "theme_model.pkl"),
    os.path.join(BASE_DIR, "..", "theme_model.pkl")
]

MODEL_PATH = None
for p in possible_paths:
    if p and os.path.exists(p):
        MODEL_PATH = p
        break

if not MODEL_PATH:
    MODEL_PATH = os.path.join(BASE_DIR, "theme_model.pkl")

# Theme model
model = None
model_load_attempted = False
model_load_error = None

# Structure model
structure_model = None
structure_model_load_attempted = False
structure_model_load_error = None

def get_model():
    global model, model_load_attempted, model_load_error
    if not model_load_attempted:
        model_load_attempted = True
        try:
            print(f"Attempting to load model from {MODEL_PATH}")
            model = joblib.load(MODEL_PATH)
            print(f"Model loaded successfully from {MODEL_PATH}")
        except Exception as e:
            model_load_error = str(e)
            print(f"Warning: Failed to load model from {MODEL_PATH}. Error: {e}")
    return model

def get_structure_model():
    global structure_model, structure_model_load_attempted, structure_model_load_error
    if not structure_model_load_attempted:
        structure_model_load_attempted = True
        try:
            struct_path = os.environ.get("STRUCTURE_MODEL_PATH") or os.path.join(BASE_DIR, "topics_structures.pkl")
            if not os.path.exists(struct_path):
                struct_path = os.path.join(BASE_DIR, "..", "topics_structures.pkl")
            print(f"Attempting to load structure model from {struct_path}")
            structure_model = joblib.load(struct_path)
            print(f"Structure Model loaded successfully from {struct_path}")
        except Exception as e:
            structure_model_load_error = str(e)
            print(f"Warning: Failed to load structure model. Error: {e}")
    return structure_model


# ─── Existing Routes ──────────────────────────────────────────────────────────

@app.route('/predict-theme', methods=['POST'])
def predict_theme():
    m = get_model()
    if m is None:
        return jsonify({"error": f"Model not loaded properly. Path: {MODEL_PATH}, Error: {model_load_error}"}), 500

    data = request.get_json()
    if not data or 'prompt' not in data:
        return jsonify({"error": "No prompt provided"}), 400

    prompt = data['prompt']
    
    try:
        prediction = m.predict([prompt])
        theme_name = str(prediction[0])
        return jsonify({
            "success": True,
            "theme": theme_name
        })
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

@app.route('/predict-structure', methods=['POST'])
def predict_structure():
    m = get_structure_model()
    if m is None:
        return jsonify({"error": f"Structure Model not loaded properly. Error: {structure_model_load_error}"}), 500

    data = request.get_json()
    if not data or 'prompt' not in data:
        return jsonify({"error": "No prompt provided"}), 400

    prompt = data['prompt']
    
    try:
        prediction = m.predict([prompt])
        structure_name = str(prediction[0])
        return jsonify({
            "success": True,
            "structure": structure_name
        })
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health():
    from rag.store import get_store_stats
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
        "load_attempted": model_load_attempted,
        "load_error": model_load_error,
        "structure_model_loaded": structure_model is not None,
        "structure_load_attempted": structure_model_load_attempted,
        "structure_load_error": structure_model_load_error,
        "rag_store": get_store_stats(),
        "groq_configured": bool(os.environ.get("GROQ_API_KEY"))
    })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
