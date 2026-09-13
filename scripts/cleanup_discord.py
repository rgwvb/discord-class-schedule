import json, os, pathlib, requests

WEBHOOK=os.environ['DISCORD_WEBHOOK_URL'].rstrip('/')
STATE=pathlib.Path('data/last_message.json')

def main():
    if not STATE.exists():
        return
    data=json.loads(STATE.read_text(encoding='utf-8'))
    mid=data.get('id')
    if not mid:
        return
    r=requests.delete(f'{WEBHOOK}/messages/{mid}',timeout=30)
    if r.status_code not in (204,404):
        r.raise_for_status()
    STATE.unlink(missing_ok=True)

if __name__=='__main__':
    main()
