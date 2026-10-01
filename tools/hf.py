# hf.py — pip install higgsfield-client
import sys, higgsfield_client  # reads HF_KEY="<key_id>:<key_secret>"

result = higgsfield_client.subscribe(
    sys.argv[1],                                  # model path, e.g. higgsfield-ai/soul/v2/standard
    arguments={"prompt": sys.argv[2]},
)
print(result["images"][0]["url"])
