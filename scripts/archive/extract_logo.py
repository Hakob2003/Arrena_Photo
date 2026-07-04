import json

transcript_path = r"C:\Users\hakob\.gemini\antigravity-ide\brain\73ce1f69-2971-4632-8231-5fddbfa8e0b9\.system_generated\logs\transcript.jsonl"
with open(transcript_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for line in lines[-50:]:
    if '"type":"USER_INPUT"' in line:
        data = json.loads(line)
        content = data.get('content', '')
        print("CONTENT:", content[:300])
