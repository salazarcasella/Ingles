(()=>{
'use strict';
const $=s=>document.querySelector(s);
const screens=[...document.querySelectorAll('.screen')];

const sections=[
  {name:'My House',icon:'🏠',desc:'bedroom • kitchen • bathroom • living room',words:['bedroom','kitchen','bathroom','living room']},
  {name:'Prepositions',icon:'📍',desc:'in • on • under',words:['in','on','under']},
  {name:"Where's / Where are",icon:'🔎',desc:"It's • They're • singular • plural",words:["Where's...?","Where are...?","It's...","They're..."]},
  {name:'Clothes & Colors',icon:'👕',desc:'pants • shoes • dress • shirt • his • her',words:['pants','shoes','dress','shirt','his','her']},
  {name:'Review 9',icon:'⭐',desc:'mixed challenge from all topics',words:['house','prepositions','clothes','review']}
];

const Q=[
  [0,'Where do you sleep?',['kitchen','bedroom','bathroom'],1],
  [0,'Where do we cook food?',['living room','kitchen','bedroom'],1],
  [0,'Where do you take a bath?',['bathroom','kitchen','living room'],0],
  [0,'Where do you sit on a sofa?',['bedroom','living room','bathroom'],1],
  [1,'The ball is ____ the table.',['in','on','under'],1],
  [1,'The rabbit is ____ the chair.',['on','under','in'],1],
  [1,'The rabbit is ____ the bag.',['under','in','on'],1],
  [1,'The rabbit is ____ the closet.',['on','under','in'],2],
  [2,"Where's the computer?",["It's on the desk.","They're on the desk.","It's under the desk."],0],
  [2,'Where are the shoes?',["It's under the bed.","They're under the bed.","They're in the bag."],1],
  [2,"Where's the ball?",["It's in the closet.","It's on the closet.","They're in the closet."],0],
  [2,'Where are the books?',["They're on the bed.","It's on the bed.","They're under the bed."],0],
  [3,'His pants are _____.',['green','brown','yellow'],0],
  [3,'His shoes are _____.',['red','brown','green'],1],
  [3,'Her dress is _____.',['yellow','red','blue'],0],
  [3,'Her shoes are _____.',['brown','yellow','red'],2],
  [4,'Complete: Her _____ is orange.',['shirt','shoes','pants'],0],
  [4,'Complete: His _____ are black.',['shirt','shoes','dress'],1],
  [4,'Where are the pants?',["They're in the closet.","They're under the closet.","It's in the closet."],0],
  [4,'Look at the room. Which sentence is correct?',["The computer is on the desk.","The cat is on the bed.","The book is under the chair."],0]
];

let i=0,selected=null,locked=false,firstAttempt=true,firstTryScore=0,xp=0,currentAudio=null;
const firstTryFlags=Array(Q.length).fill(null);
const completedSections=new Set();
const VERSION='8.0';

function show(id){stopAudio();screens.forEach(s=>s.classList.toggle('active',s.id===id));window.scrollTo({top:0,behavior:'smooth'});}
function imagePath(index=i){return `assets/v7/q${String(index+1).padStart(2,'0')}.jpg?v=${VERSION}`;}
function audioPath(index=i){return `assets/v8/audio/q${String(index+1).padStart(2,'0')}.mp3?v=${VERSION}`;}
function stopAudio(){if(currentAudio){try{currentAudio.pause();currentAudio.currentTime=0;}catch(_){}currentAudio=null;}}
async function playFile(src,rate=1,statusEl=$('#audioStatus')){
  stopAudio();
  const a=new Audio(src);currentAudio=a;a.preload='auto';a.playbackRate=rate;
  if('preservesPitch' in a)a.preservesPitch=true;
  if('mozPreservesPitch' in a)a.mozPreservesPitch=true;
  if('webkitPreservesPitch' in a)a.webkitPreservesPitch=true;
  a.onplaying=()=>{if(statusEl)statusEl.textContent=rate<1?'🐢 Playing slowly...':'🔊 Playing...';};
  a.onended=()=>{if(statusEl)statusEl.textContent='✅ Finished';currentAudio=null;};
  a.onerror=()=>{if(statusEl)statusEl.textContent='⚠️ Audio could not load. Refresh and try again.';currentAudio=null;};
  try{await a.play();return true;}catch(err){if(statusEl)statusEl.textContent='Tap the button again to play the audio.';return false;}
}
function playQuestion(rate=1){playFile(audioPath(),rate,$('#audioStatus'));}
function playFx(name){playFile(`assets/v8/audio/${name}.mp3?v=${VERSION}`,1,null);}

function rail(){
  $('#railLevels').innerHTML=sections.map((s,n)=>{
    const current=i<20?Q[i][0]:5;
    const done=completedSections.has(n);
    const locked=n>current && !done;
    return `<div class="railLevel ${n===current?'active':''} ${done?'done':''} ${locked?'locked':''}"><span class="li">${done?'✅':s.icon}</span><div><b>${n+1}. ${s.name}</b><small>${done?'Completed':n===current?'Current mission':'Locked'}</small></div></div>`;
  }).join('');
}
function hud(){
  const section=i<20?sections[Q[i][0]].name:'Finished';
  $('#hudSection').textContent=section;
  $('#hudCount').textContent=`${Math.min(i,20)} / 20`;
  $('#progressBar').style.width=`${Math.min(100,(i/20)*100)}%`;
  $('#starCount').textContent=firstTryScore;
  $('#xpCount').textContent=xp;
  rail();
}
function buildTopics(){
  $('#topicGrid').innerHTML=sections.map((s,n)=>`<div class="topicCard"><span class="missionNum">${n+1}</span><div class="ti">${s.icon}</div><div><h3>Mission ${n+1}: ${s.name}</h3><p>${s.desc}</p></div></div>`).join('');
}
function intro(sectionIndex){
  const s=sections[sectionIndex];
  $('#sectionInfo').innerHTML=`<div class="sectionHero"><div class="big">${s.icon}</div><span class="eyebrow">MISSION ${sectionIndex+1} OF 5</span><h1>${s.name}</h1><p>${s.desc}</p><div class="sectionMini">${s.words.map(w=>`<span>${w}</span>`).join('')}</div><div class="sectionDots">⭐ ⭐ ⭐ ⭐</div></div>`;
  $('#mascotText').textContent=sectionIndex===0?'Find the right room!':sectionIndex===1?'Think: in, on or under?':sectionIndex===2?'One thing or many things?':sectionIndex===3?'Look at clothes and colors!':'Final challenge!';
  show('section');
}
function decorFor(index,text){
  const lower=text.toLowerCase();
  if(index<=3){if(lower.includes('kitchen'))return '🍳';if(lower.includes('bedroom'))return '🛏️';if(lower.includes('bathroom'))return '🛁';if(lower.includes('living'))return '🛋️';}
  if(index>=4&&index<=7){if(lower==='in')return '📦';if(lower==='on')return '⬆️';if(lower==='under')return '⬇️';}
  if(index>=12&&index<=15){const map={green:'🟢',brown:'🟤',yellow:'🟡',red:'🔴',blue:'🔵'};return map[lower]||'';}
  if(index===16||index===17){if(lower==='shirt')return '👕';if(lower==='shoes')return '👟';if(lower==='pants')return '👖';if(lower==='dress')return '👗';}
  return '';
}
function preloadNext(){
  if(i+1>=Q.length)return;
  const img=new Image();img.src=imagePath(i+1);
  const aud=new Audio();aud.preload='metadata';aud.src=audioPath(i+1);
}
function render(){
  const q=Q[i],s=q[0];selected=null;locked=false;firstAttempt=true;
  $('#qsec').textContent=`${sections[s].icon} Mission ${s+1}: ${sections[s].name}`;
  $('#qnum').textContent=`Question ${(i%4)+1} of 4`;
  $('#question').textContent=q[1];
  $('#audioStatus').textContent='';
  $('#picture').innerHTML=`<img class="questionImage" src="${imagePath()}" alt="Picture for question ${i+1}" loading="eager">`;
  $('#feedback').className='feedback';$('#feedback').textContent='';
  $('#check').disabled=true;$('#check').classList.remove('hide');$('#next').classList.add('hide');
  $('#encourage').textContent=s===0?'Which room matches the picture?':s===1?'Where is the object?':s===2?'Singular or plural?':s===3?'Look at the clothes and color.':'Use everything you learned!';
  const box=$('#answers');box.innerHTML='';
  q[2].forEach((text,n)=>{
    const b=document.createElement('button');b.className='ans';b.type='button';
    const decor=decorFor(i,text);
    b.innerHTML=`<span class="letter">${String.fromCharCode(65+n)}</span>${text}${decor?`<span class="decor">${decor}</span>`:''}`;
    b.addEventListener('click',()=>{
      if(locked)return;
      selected=n;[...box.children].forEach((x,j)=>x.classList.toggle('sel',j===n));$('#check').disabled=false;
    });
    box.appendChild(b);
  });
  hud();show('quiz');preloadNext();
}
function confetti(count=55){
  const root=$('#confetti');const colors=['#ff5c9e','#248ef4','#31b967','#ffd95b','#8f6ef2','#ff9f43'];
  for(let n=0;n<count;n++){
    const p=document.createElement('i');p.className='confettiPiece';p.style.left=`${Math.random()*100}%`;p.style.background=colors[n%colors.length];p.style.setProperty('--drift',`${(Math.random()-.5)*260}px`);p.style.animationDuration=`${1.7+Math.random()*1.6}s`;p.style.animationDelay=`${Math.random()*.25}s`;root.appendChild(p);setTimeout(()=>p.remove(),3600);
  }
}
function check(){
  if(selected===null||locked)return;
  const q=Q[i],buttons=[...$('#answers').children],feedback=$('#feedback');
  if(selected===q[3]){
    locked=true;
    if(firstAttempt){if(firstTryFlags[i]===null){firstTryFlags[i]=true;firstTryScore++;}xp+=10;}else{xp+=5;}
    buttons[selected].classList.add('ok');buttons[selected].classList.remove('sel');
    feedback.className='feedback show good';feedback.textContent=firstAttempt?'✅ Correct on the first try! ⭐ +10 XP':'✅ Correct! Nice comeback! +5 XP';
    $('#check').classList.add('hide');$('#next').classList.remove('hide');
    $('#encourage').textContent='Great job! Keep going! 🌟';$('#mascotText').textContent='Woo-hoo! Nice work!';
    confetti(firstAttempt?32:18);playFx('correct');hud();
  }else{
    const wrong=selected;if(firstAttempt){firstAttempt=false;if(firstTryFlags[i]===null)firstTryFlags[i]=false;}
    buttons[wrong].classList.add('no');
    feedback.className='feedback show bad';feedback.textContent='❌ Almost! Look at the picture and try again.';
    $('#encourage').textContent='Mistakes help us learn. Try once more! 💪';$('#mascotText').textContent='You can fix it! Look again.';playFx('tryagain');
    setTimeout(()=>{buttons[wrong]?.classList.remove('no','sel');selected=null;$('#check').disabled=true;},650);
  }
}
function next(){
  const oldSection=Q[i][0];i++;
  if(i>=Q.length){completedSections.add(oldSection);showBadge(oldSection);hud();return;}
  const newSection=Q[i][0];
  if(newSection!==oldSection){completedSections.add(oldSection);showBadge(oldSection);hud();return;}
  render();
}
function showBadge(sectionIndex){
  const s=sections[sectionIndex];
  const start=sectionIndex*4,end=start+4;
  const stars=firstTryFlags.slice(start,end).filter(Boolean).length;
  $('#badgeBurst').textContent=['🏠','🎯','🔎','👕','🏆'][sectionIndex];
  $('#badgeTitle').textContent=`${s.name} complete!`;
  $('#badgeText').textContent=sectionIndex<4?'You unlocked the next mission. Keep collecting stars!':'You completed all five missions!';
  $('#badgeStars').textContent=stars?('⭐'.repeat(stars)+'☆'.repeat(4-stars)):'☆☆☆☆';
  $('#badgeNext').textContent=sectionIndex<4?'Next mission ➜':'See results ➜';
  $('#badgeNext').onclick=()=>sectionIndex<4?intro(sectionIndex+1):finish();
  confetti(60);show('badge');
}
function finish(){
  hud();show('result');confetti(90);
  const name=$('#name').value.trim()||'Explorer';const pct=Math.round(firstTryScore/20*100);
  $('#who').textContent=`${name}, you completed all five missions!`;
  $('#score').textContent=`${firstTryScore} / 20`;
  $('#finalXp').textContent=xp;
  $('#accuracy').textContent=`${pct}%`;
  const starRating=pct>=90?5:pct>=75?4:pct>=60?3:pct>=40?2:1;
  $('#stars').textContent='⭐'.repeat(starRating);
  $('#finalMsg').textContent=pct>=90?'Fantastic! Your house, prepositions, questions and clothes vocabulary are super strong.':pct>=75?'Very good! Review the questions you needed to retry and play again.':pct>=60?'Good progress! Play one more round to collect more first-try stars.':'Keep practicing. The pictures and audio can help you improve each round.';
  const oldBest=Number(localStorage.getItem('englishAdventureBest')||0);const best=Math.max(oldBest,firstTryScore);localStorage.setItem('englishAdventureBest',String(best));$('#bestScore').textContent=`${best} / 20`;
}
function reset(){
  stopAudio();i=0;selected=null;locked=false;firstAttempt=true;firstTryScore=0;xp=0;firstTryFlags.fill(null);completedSections.clear();$('#name').value='';$('#mascotText').textContent='You can do it! 🌟';hud();show('start');
}

$('#go').addEventListener('click',()=>show('help'));
$('#testAudioStart').addEventListener('click',()=>playFile(`assets/v8/audio/test.mp3?v=${VERSION}`,1,$('#startAudioMsg')));
$('#ready').addEventListener('click',()=>{buildTopics();show('topics');});
$('#startTopics').addEventListener('click',()=>intro(0));
$('#begin').addEventListener('click',render);
$('#listen').addEventListener('click',()=>playQuestion(1));
$('#slow').addEventListener('click',()=>playQuestion(.84));
$('#check').addEventListener('click',check);
$('#next').addEventListener('click',next);
$('#again').addEventListener('click',reset);
window.__EXAM_TEST__={Q,sections,imagePath,audioPath,render,check,next,getState:()=>({i,firstTryScore,xp,firstAttempt,firstTryFlags:[...firstTryFlags]})};
hud();rail();
})();
