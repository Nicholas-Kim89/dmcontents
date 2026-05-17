from google import genai
from google.genai import types

try:
    print("Trying types.GoogleSearch()...")
    gs = types.GoogleSearch()
    print("Success!")
except Exception as e:
    print(f"Failed: {e}")

try:
    print("Trying types.GoogleSearchRetrieval()...")
    gsr = types.GoogleSearchRetrieval()
    print("Success!")
except Exception as e:
    print(f"Failed: {e}")

try:
    print("Trying types.ToolGoogleSearch()...")
    tgs = types.ToolGoogleSearch()
    print("Success!")
except Exception as e:
    print(f"Failed: {e}")
