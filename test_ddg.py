import urllib.request
import urllib.parse
import json

def search(q):
    url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(q)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        from html.parser import HTMLParser
        class MyHTMLParser(HTMLParser):
            def __init__(self):
                super().__init__()
                self.in_a = False
                self.results = []
                self.snippet = False
            def handle_starttag(self, tag, attrs):
                if tag == 'a' and ('class', 'result__snippet') in attrs:
                    self.snippet = True
            def handle_endtag(self, tag):
                if tag == 'a':
                    self.snippet = False
            def handle_data(self, data):
                if self.snippet:
                    self.results.append(data)
        parser = MyHTMLParser()
        parser.feed(html)
        for r in parser.results:
            print(r.strip())
    except Exception as e:
        print(e)

search("Mac Arabic keyboard layout keys bottom row z x c v b n m")
