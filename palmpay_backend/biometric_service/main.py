# biometric_api.py (Production Service)
import os
import json
import cv2
import numpy as np
import base64
import pickle
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import mediapipe as mp
from sklearn.metrics.pairwise import cosine_similarity
import tensorflow as tf

# Initialize Flask
app = Flask(__name__)
CORS(app)  # Allow all origins

# ==========================================
#               CONFIGURATION
# ==========================================
# --- NEW PORTABLE CODE ---
# Get the directory where main.py is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Default to a 'models' folder inside the biometric_service directory
DEFAULT_MODEL_PATH = os.path.join(BASE_DIR, "models", "best_hybrid_model.h5")

# Prioritize the environment variable, then the relative path
HYBRID_MODEL_PATH = os.getenv("MODEL_PATH", DEFAULT_MODEL_PATH)

print(f"📂 Loading model from: {HYBRID_MODEL_PATH}")
SQLITE_DB_PATH = os.getenv("DB_PATH", "./palmpay_biometrics.db")
IMG_SIZE = (128, 128)
GEOM_FEATURE_SIZE = 486
THRESHOLD = 0.95  # Ultra secure

# ==========================================
#         LOAD MODEL (Singleton)
# ==========================================
print("🚀 Loading TensorFlow model...")
model = tf.keras.models.load_model(HYBRID_MODEL_PATH, compile=False)
print("✅ Model loaded successfully!")

# Initialize MediaPipe
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.8
)

# Initialize SQLite
def init_db():
    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            phone_number TEXT UNIQUE,
            name TEXT,
            embeddings BLOB,
            hand_side TEXT,
            threshold REAL DEFAULT 0.95,
            registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()
    print("✅ Database initialized")

init_db()

# ==========================================
#         BIOMETRIC FUNCTIONS
# ==========================================
def base64_to_image(base64_str):
    """Convert base64 string to OpenCV image"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_str:
            base64_str = base64_str.split(',')[1]
        
        img_data = base64.b64decode(base64_str)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print(f"Error decoding base64: {e}")
        return None

def get_texture_signature(roi):
    """Extract palm texture signature"""
    if len(roi.shape) == 3:
        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    else:
        gray = roi

    # Check image quality
    variance = cv2.Laplacian(gray, cv2.CV_64F).var()
    if variance < 100:
        return None

    # Enhance contrast
    clahe = cv2.createCLAHE(clipLimit=5.0, tileGridSize=(4, 4))
    enhanced = clahe.apply(gray)
    return cv2.cvtColor(enhanced, cv2.COLOR_GRAY2RGB)

def extract_normalized_roi(image, hand_landmarks):
    """Extract palm ROI from hand landmarks"""
    h, w, _ = image.shape
    lm = hand_landmarks.landmark
    
    # Get key points
    wrist = np.array([lm[0].x * w, lm[0].y * h])
    index_base = np.array([lm[5].x * w, lm[5].y * h])
    pinky_base = np.array([lm[17].x * w, lm[17].y * h])
    
    # Calculate center and rotation
    center = np.mean([wrist, index_base, pinky_base], axis=0)
    delta = pinky_base - index_base
    angle = np.degrees(np.arctan2(delta[1], delta[0]))
    
    # Rotate image
    M = cv2.getRotationMatrix2D((float(center[0]), float(center[1])), angle, 1.0)
    rotated = cv2.warpAffine(image, M, (w, h))
    
    # Calculate ROI size
    dist = np.linalg.norm(index_base - pinky_base)
    roi_size = int(dist * 1.5)
    
    cx, cy = int(center[0]), int(center[1])
    x1, y1 = cx - roi_size // 2, cy - roi_size // 2
    
    # Safe crop
    x1, y1 = max(0, x1), max(0, y1)
    roi = rotated[y1:y1+roi_size, x1:x1+roi_size]
    
    if roi.size == 0 or roi.shape[0] < 50:
        return None
    
    # Resize and get texture
    roi_resized = cv2.resize(roi, IMG_SIZE)
    return get_texture_signature(roi_resized)

def is_palm_open(hand_landmarks):
    """Check if palm is open for scanning"""
    lm = hand_landmarks.landmark
    tips = [8, 12, 16, 20]  # Finger tips
    bases = [5, 9, 13, 17]  # Finger bases
    
    open_count = 0
    for t, b in zip(tips, bases):
        if lm[t].y < lm[b].y:  # Tip above base = finger extended
            open_count += 1
    
    return open_count >= 3  # At least 3 fingers extended

def get_embedding(roi, landmarks):
    """Generate embedding from palm image"""
    # Preprocess image
    img_input = np.expand_dims(roi, axis=0).astype(np.float32) / 255.0
    
    # Extract geometry features
    coords = []
    for lm in landmarks.landmark:
        coords.extend([lm.x, lm.y, lm.z])
    
    geom_input = np.array(coords, dtype=np.float32)
    geom_input = np.pad(geom_input, (0, GEOM_FEATURE_SIZE - len(geom_input)), 'constant')
    geom_input = np.expand_dims(geom_input[:GEOM_FEATURE_SIZE], axis=0)
    
    # Get prediction
    prediction = model.predict([img_input, geom_input], verbose=0)
    embedding = prediction[0][0] if isinstance(prediction, list) else prediction[0]
    
    # Normalize
    return embedding / (np.linalg.norm(embedding) + 1e-9)

def find_best_match(embedding, hand_side):
    """Find matching user in database"""
    conn = sqlite3.connect(SQLITE_DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT user_id, phone_number, name, embeddings FROM users WHERE hand_side = ?",
        (hand_side,)
    )
    
    best_match = None
    highest_score = 0
    
    for row in cursor.fetchall():
        user_id, phone, name, stored_emb = row
        stored_embedding = pickle.loads(stored_emb)
        
        # Calculate similarity
        score = cosine_similarity([embedding], [stored_embedding])[0][0]
        
        if score > highest_score and score >= THRESHOLD:
            highest_score = score
            best_match = {
                'user_id': user_id,
                'phone_number': phone,
                'name': name,
                'confidence': float(score)
            }
    
    conn.close()
    return best_match, highest_score

# ==========================================
#              API ENDPOINTS
# ==========================================
@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'palm-biometric-api',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/register', methods=['POST'])
def register_user():
    """Register user with palm biometric"""
    try:
        data = request.json
        user_id = data.get('user_id')
        phone_number = data.get('phone_number')
        name = data.get('name')
        image_base64 = data.get('image')
        
        if not all([user_id, phone_number, name, image_base64]):
            return jsonify({
                'success': False,
                'error': 'Missing required fields'
            }), 400
        
        # Convert base64 to image
        image = base64_to_image(image_base64)
        if image is None:
            return jsonify({
                'success': False,
                'error': 'Invalid image format'
            }), 400
        
        # Process image
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = hands.process(image_rgb)
        
        if not results.multi_hand_landmarks:
            return jsonify({
                'success': False,
                'error': 'No hand detected. Please show your palm clearly.'
            }), 400
        
        # Get first hand
        hand_landmarks = results.multi_hand_landmarks[0]
        hand_side = results.multi_handedness[0].classification[0].label
        
        # Check palm is open
        if not is_palm_open(hand_landmarks):
            return jsonify({
                'success': False,
                'error': 'Please open your palm completely for scanning.'
            }), 400
        
        # Extract ROI and get embedding
        roi = extract_normalized_roi(image, hand_landmarks)
        if roi is None:
            return jsonify({
                'success': False,
                'error': 'Could not extract palm region. Try again.'
            }), 400
        
        embedding = get_embedding(roi, hand_landmarks)
        
        # Store in database
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.execute("""
            INSERT OR REPLACE INTO users 
            (user_id, phone_number, name, embeddings, hand_side)
            VALUES (?, ?, ?, ?, ?)
        """, (
            user_id,
            phone_number,
            name,
            pickle.dumps(embedding),
            hand_side
        ))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'data': {
                'user_id': user_id,
                'phone_number': phone_number,
                'name': name,
                'hand_side': hand_side,
                'registered_at': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({
            'success': False,
            'error': f'Registration failed: {str(e)}'
        }), 500

@app.route('/verify', methods=['POST'])
def verify_palm():
    """Verify palm for payment"""
    try:
        data = request.json
        image_base64 = data.get('image')
        
        if not image_base64:
            return jsonify({
                'success': False,
                'error': 'Image is required'
            }), 400
        
        # Convert base64 to image
        image = base64_to_image(image_base64)
        if image is None:
            return jsonify({
                'success': False,
                'error': 'Invalid image format'
            }), 400
        
        # Process image
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = hands.process(image_rgb)
        
        if not results.multi_hand_landmarks:
            return jsonify({
                'success': False,
                'error': 'No hand detected'
            }), 400
        
        # Get hand details
        hand_landmarks = results.multi_hand_landmarks[0]
        hand_side = results.multi_handedness[0].classification[0].label
        
        # Extract ROI and get embedding
        roi = extract_normalized_roi(image, hand_landmarks)
        if roi is None:
            return jsonify({
                'success': False,
                'error': 'Could not extract palm region'
            }), 400
        
        embedding = get_embedding(roi, hand_landmarks)
        
        # Find match
        match, score = find_best_match(embedding, hand_side)
        
        if match:
            return jsonify({
                'success': True,
                'verified': True,
                'data': match
            })
        else:
            return jsonify({
                'success': True,
                'verified': False,
                'confidence': float(score),
                'message': 'Palm not recognized'
            })
            
    except Exception as e:
        print(f"Verification error: {e}")
        return jsonify({
            'success': False,
            'error': f'Verification failed: {str(e)}'
        }), 500

@app.route('/payment', methods=['POST'])
def process_payment():
    """Process biometric payment"""
    try:
        data = request.json
        image_base64 = data.get('image')
        amount = data.get('amount')
        
        if not all([image_base64, amount]):
            return jsonify({
                'success': False,
                'error': 'Image and amount are required'
            }), 400
        
        # Verify palm
        verify_response = verify_palm()
        verify_data = verify_response.get_json()
        
        if not verify_data['success']:
            return jsonify(verify_data), 400
        
        if not verify_data['verified']:
            return jsonify({
                'success': False,
                'verified': False,
                'error': 'Biometric authentication failed',
                'confidence': verify_data.get('confidence', 0)
            }), 401
        
        # Payment processing would happen here
        # In production, you would:
        # 1. Get user from verify_data
        # 2. Check balance
        # 3. Process transaction
        
        return jsonify({
            'success': True,
            'verified': True,
            'message': 'Payment authorized',
            'data': {
                **verify_data['data'],
                'amount': amount,
                'transaction_id': f"TXN{int(datetime.now().timestamp())}",
                'timestamp': datetime.now().isoformat(),
                'status': 'authorized'
            }
        })
        
    except Exception as e:
        print(f"Payment error: {e}")
        return jsonify({
            'success': False,
            'error': f'Payment processing failed: {str(e)}'
        }), 500

# ==========================================
#                 MAIN
# ==========================================
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    print(f"🚀 Starting Palm Biometric API on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)