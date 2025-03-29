import os
import datetime
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from openai import OpenAI

app = Flask(__name__)
CORS(app)


# API Key Configuration
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("API key not found. Set 'OPENAI_API_KEY' as an environment variable.")

client = OpenAI(api_key=api_key)

# Configure File Uploads
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'docx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Time-Based Greeting
def get_greeting():
    current_hour = datetime.datetime.now().hour
    if current_hour < 12:
        return "Good morning!"
    elif current_hour < 18:
        return "Good afternoon!"
    else:
        return "Good evening!"

# AI Chatbot API
@app.route('/ai_teacher', methods=['POST'])
def ai_teacher():
    data = request.json
    user_prompt = data.get("prompt", "")

    system_message = {"role": "system", "content": "You are an AI assistant for teachers."}
    response = client.chat.completions.create(
        model="gpt-4o-2024-05-13",
        messages=[system_message, {"role": "user", "content": user_prompt}]
    )

    ai_response = response.choices[0].message.content
    greeting = get_greeting()

    return jsonify({"response": f"{greeting} {ai_response}"})

# Paper Grading (Text Input)
@app.route('/grade_paper', methods=['POST'])
def grade_paper():
    data = request.json
    essay_text = data.get("essay", "")

    system_prompt = "You are an AI that grades essays based on structure, grammar, argument strength, and clarity."
    response = client.chat.completions.create(
        model="gpt-4o-2024-05-13",
        messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": essay_text}]
    )

    return jsonify({"grade": response.choices[0].message.content})

# Paper Grading (File Upload)
@app.route('/upload_paper', methods=['POST'])
def upload_paper():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        with open(file_path, 'r', encoding='utf-8') as f:
            essay_text = f.read()

        system_prompt = "You are an AI that grades essays based on structure, grammar, argument strength, and clarity."
        response = client.chat.completions.create(
            model="gpt-4o-2024-05-13",
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": essay_text}]
        )

        return jsonify({"grade": response.choices[0].message.content})

    return jsonify({"error": "Invalid file type"}), 400

# Speech-to-Text API
@app.route('/speech_to_text', methods=['POST'])
def speech_to_text():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    transcript = client.audio.transcriptions.create(model="whisper-1", file=audio_file)

    return jsonify({"transcription": transcript.text})

# Serve Uploaded Files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)
