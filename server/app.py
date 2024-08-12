from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import sys
import os
import json
from queue import Queue

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from graph.graph import process_user_input

app = Flask(__name__)
CORS(app)

status_queue = Queue()

def is_valid_input(text):
    return len(text) > 8

@app.route('/api/data', methods=['POST'])
def process_data():
    data = request.json
    print("Received data:", data)
    input_text = data['message']['text']
    print("Received input:", input_text)  
    if not is_valid_input(input_text):
        print('not validddddddd')
        return jsonify({"error": "Invalid input, must be more than 8 characters"}), 400
    
    try:
        processed_result = process_user_input(data['message'])
        print("Processed result:", processed_result) 

        return jsonify(processed_result)
    except Exception as e:
        print(f"Error processing input: {e}")  
        return jsonify({"error": "An error occurred during processing"}), 500

@app.route('/api/processed', methods=['POST'])
def receive_processed_data():
    data = request.json
    print("Received processed data:", data)
    status_queue.put(data)  # Add status updates to the queue
    return jsonify({"message": "Processed data received"}), 200

@app.route('/api/updates')
def updates():
    def generate():
        while True:
            status = status_queue.get()
            yield f'data: {json.dumps(status)}\n\n'

    return Response(generate(), mimetype='text/event-stream')

if __name__ == '__main__':
    app.run(debug=True)
