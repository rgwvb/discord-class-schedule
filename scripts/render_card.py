import argparse, pathlib, threading, http.server, socketserver
from urllib.parse import urlencode
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--day', type=int, choices=range(1,7), default=1)
    p.add_argument('--person', default='')
    p.add_argument('--week', action='store_true')
    p.add_argument('--output', default='schedule-card.png')
    args=p.parse_args()
    handler=lambda *a, **kw: QuietHandler(*a, directory=str(ROOT), **kw)
    with socketserver.TCPServer(('127.0.0.1',0),handler) as httpd:
        port=httpd.server_address[1]
        t=threading.Thread(target=httpd.serve_forever,daemon=True)
        t.start()
        with sync_playwright() as pw:
            browser=pw.chromium.launch()
            page=browser.new_page(viewport={'width':1086,'height':2200},device_scale_factor=1)
            query={'day':args.day}
            if args.person:
                query['person']=args.person
            if args.week:
                query['week']='1'
            page.goto(f'http://127.0.0.1:{port}/?{urlencode(query)}',wait_until='networkidle')
            page.locator('#poster').screenshot(path=args.output)
            browser.close()
        httpd.shutdown()

if __name__=='__main__':
    main()
