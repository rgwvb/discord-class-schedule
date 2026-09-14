import json, os, pathlib, requests

WEBHOOK=os.environ['DISCORD_WEBHOOK_URL']
IMAGE=pathlib.Path(os.environ.get('SCHEDULE_IMAGE','schedule-card.png'))
STATE=pathlib.Path('data/last_message.json')
CONTENT=os.environ.get('DISCORD_CONTENT','📚 今日課表')
SAVE_STATE=os.environ.get('SAVE_STATE','1')!='0'

def main():
    payload={'content':CONTENT}
    with IMAGE.open('rb') as f:
        r=requests.post(
            WEBHOOK,
            params={'wait':'true'},
            data={'payload_json':json.dumps(payload,ensure_ascii=False)},
            files={'files[0]':(IMAGE.name,f,'image/png')},
            timeout=30,
        )
    r.raise_for_status()
    msg=r.json()
    if SAVE_STATE:
        STATE.parent.mkdir(parents=True,exist_ok=True)
        STATE.write_text(json.dumps({'id':msg['id']},ensure_ascii=False),encoding='utf-8')
    summary={
        'id':msg.get('id'),
        'channel_id':msg.get('channel_id'),
        'guild_id':msg.get('guild_id'),
        'content':msg.get('content'),
        'attachments':[{
            'id':a.get('id'),
            'filename':a.get('filename'),
            'size':a.get('size'),
            'url':a.get('url')
        } for a in msg.get('attachments',[])],
    }
    print(json.dumps(summary,ensure_ascii=False))

if __name__=='__main__':
    main()
