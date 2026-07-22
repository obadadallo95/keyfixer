import urllib.request
import json
import re

url = "https://en.wikipedia.org/wiki/Arabic_keyboard"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        print(html.count("Apple"))
        print(html.count("Mac"))
except Exception as e:
    print(e)
