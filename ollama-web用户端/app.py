from flask import Flask, render_template, Response, request
import requests
import json

app = Flask(__name__)
OLLAMA_BASE_URL = "http://localhost:11434"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/models')
def get_models():
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/ps")
        models = response.json()
        # 确保返回的是列表格式，并提取所需的模型信息
        if isinstance(models, dict) and 'models' in models:
            return {"models": models['models']}
        elif isinstance(models, list):
            return {"models": [{"name": model.get("model", "")} for model in models]}
        return {"models": []}
    except Exception as e:
        return {"error": str(e)}, 500

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    headers = {'Content-Type': 'application/json'}
    
    def generate():
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": data["model"],
                "prompt": data["message"],
                "stream": True
            },
            headers=headers,
            stream=True
        )
        
        for line in response.iter_lines():
            if line:
                yield f"data: {line.decode('utf-8')}\n\n"
    
    return Response(generate(), mimetype='text/event-stream')

if __name__ == '__main__':
    app.run(debug=True)