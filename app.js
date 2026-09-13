const DAYS=['一','二','三','四','五','六'];
const $=s=>document.querySelector(s);
const sig=c=>JSON.stringify(c.map(x=>[x.time,x.title,x.teacher||'',x.room||'',x.credits??'']));
async function main(){
  const data=await fetch('data/schedule.json',{cache:'no-store'}).then(r=>r.json());
  $('#updated').textContent=`資料更新：${new Date(data.updated_at).toLocaleString('zh-TW')}`;
  const paramDay=Number(new URLSearchParams(location.search).get('day'));
  const now=new Date(); let day=(paramDay>=1&&paramDay<=6)?paramDay:now.getDay(); day=(day>=1&&day<=6)?day:1;
  const tabs=$('#dayTabs');
  DAYS.forEach((d,i)=>{const b=document.createElement('button');b.textContent=`週${d}`;b.onclick=()=>render(i+1,b);tabs.appendChild(b)});
  function render(dayIndex,btn){
    [...tabs.children].forEach(x=>x.classList.toggle('active',x===btn));
    const groups=new Map();
    Object.entries(data.people).forEach(([name,days])=>{const courses=days[String(dayIndex)]||[];const key=sig(courses);if(!groups.has(key))groups.set(key,{names:[],courses});groups.get(key).names.push(name)});
    const root=$('#schedule');root.innerHTML='';
    const nonempty=[...groups.values()].filter(g=>g.courses.length);
    if(!nonempty.length){root.innerHTML='<div class="empty">今天沒有課程</div>';return}
    nonempty.forEach(g=>{
      const box=document.createElement('article');box.className='group';
      box.innerHTML=`<h2 class="names">👤 ${g.names.join('／')}</h2>`+g.courses.map(c=>`<div class="course"><div class="time">${c.time}</div><div><div class="title">${c.title}</div><div class="meta">${c.teacher?`老師：${c.teacher}`:'老師：未填'}　${c.room?`教室：${c.room}`:'教室：未填'}　${c.credits!==null&&c.credits!==''&&c.credits!==undefined?`${c.credits} 學分`:'學分：未填'}</div></div></div>`).join('');
      root.appendChild(box);
    });
  }
  render(day,tabs.children[day-1]);
}
main().catch(e=>{$('#schedule').innerHTML=`<div class="empty">課表載入失敗：${e.message}</div>`});