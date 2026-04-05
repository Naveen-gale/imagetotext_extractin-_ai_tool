import sys
import io
import json
import re

# Force UTF-8 encoding to prevent Windows cp1252 UnicodeDecodeError crashes
sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def fallback_extract(image_path):
    try:
        import pytesseract
        from PIL import Image
        text = pytesseract.image_to_string(Image.open(image_path))
        return text if text.strip() else "[NO TEXT FOUND]"
    except Exception as e:
        return f"[PYTHON FALLBACK ERROR] Failed to run OCR. Make sure Tesseract is installed. Details: {str(e)}"

def fallback_summarize(text):
    # Basic extractive summarization fallback (first 3 sentences)
    sentences = re.split(r'(?<=[.!?]) +', text)
    if len(sentences) <= 3:
        return text
    return " ".join(sentences[:3]) + "...\n\n(Note: This is a basic Python fallback summary because the Groq API failed.)"

def fallback_translate(text, target_language):
    try:
        from googletrans import Translator
        translator = Translator()
        result = translator.translate(text, dest=target_language[:2].lower()) # Approximate lang code
        return result.text
    except Exception as e:
        return f"Hello, this is a Python fallback translation simulation to {target_language}. (Actual translation failed because googletrans is not installed or failed: {str(e)})\n\nOriginal text:\n{text}"

def fallback_grammar(text):
    try:
        from textblob import TextBlob
        blob = TextBlob(text)
        return str(blob.correct())
    except Exception as e:
        return f"(Note: Python grammar fallback requires 'textblob' library. Returning original text.)\n\n{text}"

def fallback_extract_info(text):
    # Fallback uses basic regex
    emails = re.findall(r'[\w\.-]+@[\w\.-]+', text)
    numbers = re.findall(r'\b\d{3,}\b', text)
    dates = re.findall(r'\d{1,2}[-/]\d{1,2}[-/]\d{2,4}', text)
    
    result = "### Python Fallback Extraction Results ###\n\n"
    if emails: result += f"**Emails:**\n- " + "\n- ".join(emails) + "\n\n"
    if dates: result += f"**Dates found:**\n- " + "\n- ".join(dates) + "\n\n"
    if numbers: result += f"**Large Numbers/IDs:**\n- " + "\n- ".join(numbers[:10]) + "\n\n"
    
    if not emails and not dates and not numbers:
        result += "No obvious emails, dates, or large numbers found using regex fallback."
        
    return result

if __name__ == "__main__":
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input provided"}))
            sys.exit(1)
            
        data = json.loads(input_data)
        action = data.get("action")
        
        result = ""
        if action == "extractText":
            result = fallback_extract(data.get("imagePath"))
        elif action == "summarize":
            result = fallback_summarize(data.get("text"))
        elif action == "translate":
            result = fallback_translate(data.get("text"), data.get("targetLanguage"))
        elif action == "fixGrammar":
            result = fallback_grammar(data.get("text"))
        elif action == "extractInfo":
            result = fallback_extract_info(data.get("text"))
        else:
            result = f"Unknown action: {action}"
            
        print(json.dumps({"success": True, "result": result}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
