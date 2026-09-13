const DAYS=['一','二','三','四','五','六'];
const $=s=>document.querySelector(s);
const sig=c=>JSON.stringify(c.map(x=>[x.time,x.title,x.teacher||'',x.room||'',x.credits??'']));

function fmtDate(dayIndex){
  const now=new Date();
  const cur=now.getDay();
  const delta=dayIndex-cur;
  const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+delta);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
}

async function main(){
  const data=await fetch('data/schedule.json',{cache:'no-store'}).then(r=>r.json());
  $('#updated').textContent=`資料更新：${new Date(data.updated_at).toLocaleString('zh-TW')}`;

  const paramDay=Number(new URLSearchParams(location.search).get('day'));
  const now=new Date();
  let day=(paramDay>=1&&paramDay<=6)?paramDay:now.getDay();
  day=(day>=1&&day<=6)?day:1;

  const tabs=$('#dayTabs');
  DAYS.forEach((d,i)=>{
    const b=document.createElement('button');
    b.textContent=`週${d}`;
    b.onclick=()=>render(i+1,b);
    tabs.appendChild(b);
  });

  function render(dayIndex,btn){
    [...tabs.children].forEach(x=>x.classList.toggle('active',x===btn));
    $('#posterTitle').textContent=`今日課表｜週${DAYS[dayIndex-1]}`;
    $('#posterDate').textContent=fmtDate(dayIndex);

    const groups=new Map();
    Object.entries(data.people).forEach(([name,days])=>{
      const courses=days[String(dayIndex)]||[];
      const key=sig(courses);
      if(!groups.has(key)) groups.set(key,{names:[],courses});
      groups.get(key).names.push(name);
    });

    const root=$('#schedule');
    root.innerHTML='';
    const nonempty=[...groups.values()].filter(g=>g.courses.length);
    if(!nonempty.length){
      root.innerHTML='<div class="empty">今天沒有課程</div>';
      return;
    }

    nonempty.forEach(g=>{
      const box=document.createElement('article');
      box.className='group';
      const groupIcon=g.names.length>1?'👥':'👤';
      const courseCards=g.courses.map(c=>{
        const teacher=c.teacher||'未填';
        const room=c.room||'未填';
        const credits=(c.credits!==null&&c.credits!==''&&c.credits!==undefined)?`${c.credits}學分`:'學分未填';
        return `<div class="course-card">
          <div class="course-title"><span class="book-icon">▰</span>${c.title}</div>
          <div class="course-meta">
            <span>◷ ${c.time}</span>
            <span>♟ ${teacher}</span>
            <span>◆ ${room}</span>
            <span>◆ ${credits}</span>
          </div>
        </div>`;
      }).join('');

      box.innerHTML=`
        <div class="group-head">
          <h2><span class="person-icon">${groupIcon}</span>${g.names.join('／')}</h2>
          <span class="count">${g.courses.length} 門課</span>
        </div>
        <div class="course-grid ${g.courses.length===1?'single':''}">${courseCards}</div>`;
      root.appendChild(box);
    });
  }

  render(day,tabs.children[day-1]);
}

main().catch(e=>{
  $('#schedule').innerHTML=`<div class="empty">課表載入失敗：${e.message}</div>`;
});