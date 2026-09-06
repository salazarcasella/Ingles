(()=> {
const $=s=>document.querySelector(s), screens=[...document.querySelectorAll(".screen")];

const sections=[
["My House","🏠","bedroom • kitchen • bathroom • living room"],
["Prepositions of Place","📍","in • on • under"],
["Where's...? / Where are...?","🔎","It's... • They're... • singular and plural"],
["Clothes, Colors, His & Her","👕","pants • shoes • dress • shirt • colors • his • her"],
["Review 9","⭐","mixed practice from all the topics"]
];

const Q=[
[0,"Where do you sleep?","Where do you sleep?",["kitchen","bedroom","bathroom"],1],
[0,"Where do we cook food?","Where do we cook food?",["living room","kitchen","bedroom"],1],
[0,"Where do you take a bath?","Where do you take a bath?",["bathroom","kitchen","living room"],0],
[0,"Where do you sit on a sofa?","Where do you sit on a sofa?",["bedroom","living room","bathroom"],1],

[1,"The ball is ____ the table.","Complete the sentence. The ball is blank the table.",["in","on","under"],1],
[1,"The rabbit is ____ the chair.","Complete the sentence. The rabbit is blank the chair.",["on","under","in"],1],
[1,"The rabbit is ____ the bag.","Complete the sentence. The rabbit is blank the bag.",["under","in","on"],1],
[1,"The rabbit is ____ the closet.","Complete the sentence. The rabbit is blank the closet.",["on","under","in"],2],

[2,"Where's the computer?","Where is the computer?",["It's on the desk.","They're on the desk.","It's under the desk."],0],
[2,"Where are the shoes?","Where are the shoes?",["It's under the bed.","They're under the bed.","They're in the bag."],1],
[2,"Where's the ball?","Where is the ball?",["It's in the closet.","It's on the closet.","They're in the closet."],0],
[2,"Where are the books?","Where are the books?",["They're on the bed.","It's on the bed.","They're under the bed."],0],

[3,"His pants are _____.","Complete the sentence. His pants are blank.",["green","brown","yellow"],0],
[3,"His shoes are _____.","Complete the sentence. His shoes are blank.",["red","brown","green"],1],
[3,"Her dress is _____.","Complete the sentence. Her dress is blank.",["yellow","red","blue"],0],
[3,"Her shoes are _____.","Complete the sentence. Her shoes are blank.",["brown","yellow","red"],2],

[4,"Complete: Her _____ is orange.","Complete the sentence. Her blank is orange.",["shirt","shoes","pants"],0],
[4,"Complete: His _____ are black.","Complete the sentence. His blank are black.",["shirt","shoes","dress"],1],
[4,"Where are the shoes?","Where are the shoes?",["They're in the closet.","They're on the bed.","They're under the chair."],0],
[4,"Which sentence is correct?","Look at the room. Which sentence is correct?",["The computer is on the desk.","The cat is on the bed.","The book is under the chair."],0]
];

let i=0, sel=null, score=0, started=-1, lock=false, currentUtterance=null;

function show(id){
  screens.forEach(x=>x.classList.toggle("active",x.id===id));
  window.scrollTo({top:0,behavior:"smooth"});
}
function imagePath(){ return `assets/q${String(i+1).padStart(2,"0")}.jpg?v=6`; }

function getVoice(){
  const voices=window.speechSynthesis ? speechSynthesis.getVoices() : [];
  return voices.find(v=>/^en-US/i.test(v.lang)) || voices.find(v=>/^en/i.test(v.lang)) || null;
}
function stopAudio(){
  if(!("speechSynthesis" in window)) return;
  try{ speechSynthesis.cancel(); }catch(e){}
  currentUtterance=null;
}
function speakText(text, statusTarget=null){
  window.__LAST_SPEECH_TEXT=text;
  if(!("speechSynthesis" in window)){
    if(statusTarget) statusTarget.textContent="Audio is not available in this browser.";
    return false;
  }
  stopAudio();
  const u=new SpeechSynthesisUtterance(text);
  currentUtterance=u;
  u.lang="en-US";
  u.rate=.76;
  u.pitch=1.02;
  u.volume=1;
  const v=getVoice(); if(v)u.voice=v;
  u.onstart=()=>{ if(statusTarget) statusTarget.textContent="🔊 Playing audio..."; };
  u.onend=()=>{ if(statusTarget) statusTarget.textContent="✅ Audio finished!"; currentUtterance=null; };
  u.onerror=()=>{ if(statusTarget) statusTarget.textContent="Audio stopped. Tap Listen again."; currentUtterance=null; };
  setTimeout(()=>speechSynthesis.speak(u),180);
  return true;
}
function speechForQuestion(){
  const q=Q[i], o=q[3];
  return `Ready. Listen. ${q[2]} Option A. ${o[0]} Option B. ${o[1]} Option C. ${o[2]}`;
}
function speakQuestion(){ speakText(speechForQuestion()); }

if("speechSynthesis" in window){
  speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged=()=>speechSynthesis.getVoices();
}

function prog(){
  $("#count").textContent=`${i} / ${Q.length}`;
  $("#bar").style.width=`${i/Q.length*100}%`;
  $("#sec").textContent=i<Q.length?sections[Q[i][0]][0]:"Finished!";
}
function buildTopics(){
  $("#topicGrid").innerHTML=sections.map((s,n)=>`<div class="topicCard"><div class="ti">${s[1]}</div><div><h3>${n+1}. ${s[0]}</h3><p>${s[2]}</p></div></div>`).join("");
}
function intro(s){
  stopAudio();
  const a=sections[s];
  $("#sectionInfo").innerHTML=`<div class="big">${a[1]}</div><h1>Section ${s+1}: ${a[0]}</h1><p>${a[2]}</p><div class="stars">⭐ ⭐ ⭐ ⭐</div>`;
  started=s; show("section");
}
function render(){
  stopAudio();
  const q=Q[i], s=q[0];
  if(started!==s) return intro(s);
  sel=null; lock=false;
  $("#qsec").textContent=`${sections[s][1]} ${sections[s][0]}`;
  $("#qnum").textContent=`Question ${i-s*4+1} of 4`;
  $("#question").textContent=q[1];
  const bx=((i%4)/3*100).toFixed(4), by=(Math.floor(i/4)/4*100).toFixed(4);
  $("#picture").innerHTML=`<div id="qImage" class="qSprite" role="img" aria-label="Illustration for question ${i+1}" style="background-position:${bx}% ${by}%"></div>`;
  $("#feedback").className="feedback"; $("#feedback").textContent="";
  $("#check").disabled=true; $("#check").classList.remove("hide"); $("#next").classList.add("hide");
  const box=$("#answers"); box.innerHTML="";
  q[3].forEach((t,n)=>{
    const b=document.createElement("button");
    b.className="ans"; b.type="button";
    b.innerHTML=`<span>${String.fromCharCode(65+n)}</span>${t}`;
    b.addEventListener("click",()=>{
      if(lock)return;
      sel=n; [...box.children].forEach((x,j)=>x.classList.toggle("sel",j===n));
      $("#check").disabled=false;
    });
    box.appendChild(b);
  });
  prog(); show("quiz");
}
function check(){
  if(sel===null||lock)return;
  const q=Q[i], bs=[...$("#answers").children], f=$("#feedback");
  if(sel===q[4]){
    lock=true; score++;
    bs[sel].classList.add("ok");
    f.className="feedback show good"; f.textContent="✅ Correct! Great job! ⭐";
    $("#check").classList.add("hide"); $("#next").classList.remove("hide");
    speakText("Great job. Correct.");
  }else{
    const wrong=sel;
    bs[wrong].classList.add("no");
    f.className="feedback show bad"; f.textContent="❌ Not yet. Look carefully and try again!";
    speakText("Not yet. Try again.");
    setTimeout(()=>{
      bs[wrong]?.classList.remove("no","sel");
      sel=null; $("#check").disabled=true;
    },650);
  }
}
function finish(){
  stopAudio(); prog(); show("result");
  const n=$("#name").value.trim()||"Student", p=Math.round(score/Q.length*100), st=p>=90?5:p>=75?4:p>=60?3:p>=40?2:1;
  $("#who").textContent=`${n}, you finished the adventure!`;
  $("#score").textContent=`${score} / 20 • ${p}%`;
  $("#stars").textContent="⭐".repeat(st);
  $("#finalMsg").textContent=p>=90?"Excellent! You are an English star! 🌟":p>=75?"Very good! Keep shining! 🎉":p>=60?"Good job! Keep practicing! 👍":"Keep practicing. You can do it! 💪";
  speakText(`Great job ${n}. You finished the English test.`);
}

$("#go").addEventListener("click",()=>show("help"));
$("#testAudio").addEventListener("click",()=>speakText("Ready. Listen. Hello! Welcome to your English adventure. The audio is working.",$("#audioMsg")));
$("#ready").addEventListener("click",()=>{buildTopics();show("topics")});
$("#startTopics").addEventListener("click",()=>intro(0));
$("#begin").addEventListener("click",render);
$("#listen").addEventListener("click",speakQuestion);
$("#check").addEventListener("click",check);
$("#next").addEventListener("click",()=>{i++; i>=Q.length?finish():render()});
$("#again").addEventListener("click",()=>{stopAudio();i=0;sel=null;score=0;started=-1;lock=false;$("#name").value="";prog();show("start")});

window.__EXAM_TEST__={getQuestionIndex:()=>i,getSpeechText:speechForQuestion,getQuestions:()=>Q.map(x=>({section:x[0],question:x[1],speech:x[2],options:x[3],correct:x[4]}))};
prog();
})();
