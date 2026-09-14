const DAYS=['一','二','三','四','五','六'];
const $=s=>document.querySelector(s);
const sig=c=>JSON.stringify(c.map(x=>[x.time,x.title,x.teacher||'',x.room||'',x.credits??'']));

function dateForWeekday(dayIndex){
  const now=new Date();
  const cur=now.getDay()===0?7:now.getDay();
  const delta=dayIndex-cur;
  return new Date(now.getFullYear(),now.getMonth(),now.getDate()+delta);
}
function fmtDateObj(d){
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
}
function fmtDate(dayIndex){return fmtDateObj(dateForWeekday(dayIndex));}

function courseCard(c){
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
}

async function main(){
  const data=await fetch('data/schedule.json',{cache:'no-store'}).then(r=>r.json());
  $('#updated').textContent=`資料更新：${new Date(data.updated_at).toLocaleString('zh-TW')}`;

  const params=new URLSearchParams(location.search);
  const paramDay=Number(params.get('day'));
  const person=params.get('person')||'';
  const weekMode=params.get('week')==='1';
  const now=new Date();
  let day=(paramDay>=1&&paramDay<=6)?paramDay:now.getDay();
  day=(day>=1&&day<=6)?day:1;

  const tabs=$('#dayTabs');
  DAYS.forEach((d,i)=>{
    const b=document.createElement('button');
    b.textContent=`週${d}`;
    b.onclick=()=>renderDay(i+1,b);
    tabs.appendChild(b);
  });

  function renderWeek(){
    const root=$('#schedule');
    root.innerHTML='';
    $('#posterTitle').textContent=`${person}｜一週課表`;
    $('#posterDate').textContent=`${fmtDate(1)} ～ ${fmtDate(6)}`;
    const notice=$('#posterNotice');
    if(notice) notice.textContent='週一至週六｜課程、時間、老師、教室、學分';

    const days=data.people[person]||{};
    DAYS.forEach((label,i)=>{
      const dayIndex=i+1;
      const courses=days[String(dayIndex)]||[];
      const box=document.createElement('article');
      box.className='group week-day';
      const cards=courses.length?courses.map(courseCard).join(''):'<div class="day-empty">無課程</div>';
      box.innerHTML=`
        <div class="group-head">
          <h2><span class="person-icon">📅</span>週${label}</h2>
          <span class="count">${courses.length} 門課</span>
        </div>
        <div class="course-grid ${courses.length===1?'single':''}">${cards}</div>`;
      root.appendChild(box);
    });
  }

  function renderDay(dayIndex,btn){
    [...tabs.children].forEach(x=>x.classList.toggle('active',x===btn));
    $('#posterTitle').textContent=person?`${person}｜週${DAYS[dayIndex-1]}課表`:`今日課表｜週${DAYS[dayIndex-1]}`;
    $('#posterDate').textContent=fmtDate(dayIndex);
    const notice=$('#posterNotice');
    if(notice) notice.textContent=person?'個人課表｜課程、時間、老師、教室、學分':'當日課表不完全相同，以下依相同課表分組顯示';

    const groups=new Map();
    Object.entries(data.people).forEach(([name,days])=>{
      if(person && name!==person) return;
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
      const courseCards=g.courses.map(courseCard).join('');
      box.innerHTML=`
        <div class="group-head">
          <h2><span class="person-icon">${groupIcon}</span>${g.names.join('／')}</h2>
          <span class="count">${g.courses.length} 門課</span>
        </div>
        <div class="course-grid ${g.courses.length===1?'single':''}">${courseCards}</div>`;
      root.appendChild(box);
    });
  }

  if(weekMode && person){
    renderWeek();
  }else{
    renderDay(day,tabs.children[day-1]);
  }
}

main().catch(e=>{
  $('#schedule').innerHTML=`<div class="empty">課表載入失敗：${e.message}</div>`;
});