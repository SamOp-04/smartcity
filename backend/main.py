from flask import Flask, request, jsonify
from flask_cors import CORS
import ollama
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Endpoint to receive image and data from Flutter app
@app.route('/report-issue', methods=['POST'])
def report_issue():
    data = request.form
    image = request.files['image']

    # Save the image temporarily
    image_path = 'temp_image.jpg'
    image.save(image_path)

    # Use Ollama API to analyze the image
    analysis_result = ollama.analyze_image(image_path)

    # Determine priority based on analysis
    priority = determine_priority(analysis_result)

    # Save data to database (pseudo-code)
    save_to_database(data, analysis_result, priority)

    # Clean up
    os.remove(image_path)

    return jsonify({'status': 'success', 'priority': priority})
@app.route('/api/data', methods=['GET', 'POST'])
def test_data():
    if request.method == 'GET':
        return jsonify({'message': 'Hello from Flask GET!'})

    if request.method == 'POST':
        data = request.json
        msg = data.get('message', 'No message received')
        return jsonify({'message': f'Flask received: {msg}'})

# Endpoint to fetch data for Next.js website
@app.route('/get-issues', methods=['GET'])
def get_issues():
    # Fetch data from database (pseudo-code)
    issues = fetch_from_database()
    return jsonify(issues)

def determine_priority(analysis_result):
    # Implement your logic to determine priority
    return 'high'  # Example priority

def save_to_database(data, analysis_result, priority):
    # Implement your database logic here
    pass

def fetch_from_database():
    # Implement your database logic here
    return []  # Example data

if __name__ == '__main__':
    app.run(debug=True)
