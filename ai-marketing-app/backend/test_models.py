import os
import time
import base64
import json
from google import genai
from google.genai import types

API_KEY = "xxxxxxxxxxx"
client = genai.Client(api_key=API_KEY)

# Define models to test
llm_models = [
    "gemini-3.1-pro-preview",
    "gemini-3.1-flash-lite",
    "gemini-3-flash-preview"
]

image_models = [
    "gemini-2.5-flash-image",
    "gemini-3.1-flash-image-preview",
    "gemini-3-pro-image-preview"
]

results = {}

def test_llm_model(model_name):
    print(f"\n==========================================")
    print(f"Testing LLM Model: {model_name}")
    print(f"==========================================")
    
    model_results = []
    for i in range(1, 4):
        print(f"[{model_name}] Call {i}/3...")
        start_time = time.time()
        try:
            response = client.models.generate_content(
                model=model_name,
                contents="Hello, please respond with a short greeting in 5 words."
            )
            elapsed = time.time() - start_time
            text_response = response.text.strip() if response.text else "No text returned."
            print(f"  Success (Time: {elapsed:.2f}s): {text_response}")
            model_results.append({
                "call": i,
                "status": "Success",
                "latency": round(elapsed, 2),
                "response": text_response
            })
        except Exception as e:
            elapsed = time.time() - start_time
            err_msg = str(e)
            print(f"  Failed (Time: {elapsed:.2f}s): {err_msg}")
            model_results.append({
                "call": i,
                "status": "Failed",
                "latency": round(elapsed, 2),
                "error": err_msg
            })
        
        # Sleep to avoid overloading
        if i < 3:
            time.sleep(5)
            
    results[model_name] = model_results

def test_image_model(model_name):
    print(f"\n==========================================")
    print(f"Testing Image Model: {model_name}")
    print(f"==========================================")
    
    model_results = []
    for i in range(1, 4):
        print(f"[{model_name}] Call {i}/3...")
        start_time = time.time()
        try:
            modalities = ["TEXT", "IMAGE"] if model_name == "gemini-3-pro-image-preview" else ["IMAGE"]
            response = client.models.generate_content(
                model=model_name,
                contents="A cute small teddy bear sitting on a desk",
                config=types.GenerateContentConfig(
                    response_modalities=modalities
                )
            )
            elapsed = time.time() - start_time
            
            # Check for image data in the response candidates
            image_found = False
            image_len = 0
            mime_type = "unknown"
            
            for candidate in response.candidates:
                if candidate.content and candidate.content.parts:
                    for part in candidate.content.parts:
                        if hasattr(part, 'inline_data') and part.inline_data:
                            image_data = part.inline_data.data
                            image_len = len(image_data)
                            mime_type = part.inline_data.mime_type or "image/png"
                            
                            # Save image to file
                            filename = f"test_{model_name.replace('.', '_')}_{i}.png"
                            with open(filename, "wb") as f:
                                f.write(image_data)
                            image_found = True
                            break
                    if image_found:
                        break
            
            if image_found:
                msg = f"Generated image saved as test_{model_name.replace('.', '_')}_{i}.png (Size: {image_len} bytes)"
                print(f"  Success (Time: {elapsed:.2f}s): {msg}")
                model_results.append({
                    "call": i,
                    "status": "Success",
                    "latency": round(elapsed, 2),
                    "response": msg,
                    "image_size": image_len,
                    "mime_type": mime_type
                })
            else:
                # If no image but didn't throw exception
                text_resp = response.text if response.text else "No content returned"
                msg = f"Model executed but no image found. Response: {text_resp}"
                print(f"  Partial/Failed (Time: {elapsed:.2f}s): {msg}")
                model_results.append({
                    "call": i,
                    "status": "NoImageFound",
                    "latency": round(elapsed, 2),
                    "response": msg
                })
                
        except Exception as e:
            elapsed = time.time() - start_time
            err_msg = str(e)
            print(f"  Failed (Time: {elapsed:.2f}s): {err_msg}")
            model_results.append({
                "call": i,
                "status": "Failed",
                "latency": round(elapsed, 2),
                "error": err_msg
            })
        
        # Sleep to avoid overloading
        if i < 3:
            time.sleep(5)
            
    results[model_name] = model_results

# Run tests
print("Starting Gemini Model Call Tests...")

# Run LLM tests
for m in llm_models:
    test_llm_model(m)
    time.sleep(5) # Delay between models

# Run Image tests
for m in image_models:
    test_image_model(m)
    time.sleep(5) # Delay between models

# Save overall results to a json file
with open("test_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=4, ensure_ascii=False)

print("\n==========================================")
print("Tests completed. Summary saved to test_results.json")
print("==========================================")
