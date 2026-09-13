import json, os, pathlib, requests

WEBHOOK=os.environ['DISCORD_WEBHOOK_URL']
IMAGE=pathlib.Path(os.environ.get('SCHEDULE_IMAGE','schedule-card.png'))
STATE=pathlib.Path('data/last_message.json')

def main():
    payload={'content':'📚 今日課表'}
    with IMAGE.open('rb') as f:
        r=requests.post(WEBHOOK,params={'wait':'true'},data={'payload_json':json.dumps(payload,ensure_ascii=False)},files={'files[0]':(IMAGE.name,f,'image/png')},timeout=30)
    r.raise_for_status()
    msg=r.json()
    STATE.parent.mkdir(parents=True,exist_ok=True)
    STATE.write_text(json.dumps({'id':msg['id']},ensure_ascii=False),encoding='utf-8')
    print(msg['id'])

if __name__=='__main__':
    main()
