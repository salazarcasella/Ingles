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
[0,"Where do you sleep?",["kitchen","bedroom","bathroom"],1],
[0,"Where do we cook food?",["living room","kitchen","bedroom"],1],
[0,"Where do you take a bath?",["bathroom","kitchen","living room"],0],
[0,"Where do you sit on a sofa?",["bedroom","living room","bathroom"],1],
[1,"The ball is ____ the table.",["in","on","under"],1],
[1,"The rabbit is ____ the chair.",["on","under","in"],1],
[1,"The rabbit is ____ the bag.",["under","in","on"],1],
[1,"The rabbit is ____ the closet.",["on","under","in"],2],
[2,"Where's the computer?",["It's on the desk.","They're on the desk.","It's under the desk."],0],
[2,"Where are the shoes?",["It's under the bed.","They're under the bed.","They're in the bag."],1],
[2,"Where's the ball?",["It's in the closet.","It's on the closet.","They're in the closet."],0],
[2,"Where are the books?",["They're on the bed.","It's on the bed.","They're under the bed."],0],
[3,"His pants are _____.",["green","brown","yellow"],0],
[3,"His shoes are _____.",["red","brown","green"],1],
[3,"Her dress is _____.",["yellow","red","blue"],0],
[3,"Her shoes are _____.",["brown","yellow","red"],2],
[4,"Complete: Her _____ is orange.",["shirt","shoes","pants"],0],
[4,"Complete: His _____ are black.",["shirt","shoes","dress"],1],
[4,"Where are the pants?",["They're in the closet.","They're under the closet.","It's in the closet."],0],
[4,"Look at the room. Which sentence is correct?",["The computer is on the desk.","The cat is on the bed.","The book is under the chair."],0]
];

let i=0, sel=null, score=0, started=-1, lock=false, currentAudio=null;

function show(id){
  stopAudio();
  screens.forEach(x=>x.classList.toggle("active",x.id===id));
  window.scrollTo({top:0,behavior:"smooth"});
}
function imagePath(){return `assets/v7/q${String(i+1).padStart(2,"0")}.jpg?v=7.3`;}
function audioPath(){return `assets/v7/audio/q${String(i+1).padStart(2,"0")}.mp3?v=7.3`;}

function stopAudio(){
  if(currentAudio){
    try{currentAudio.pause(); currentAudio.currentTime=0;}catch(e){}
    currentAudio=null;
  }
}
async function playFile(src,statusTarget=null){
  stopAudio();
  const a=new Audio(src);
  currentAudio=a;
  a.preload="auto";
  a.onplay=()=>{if(statusTarget)statusTarget.textContent="🔊 Playing audio...";};
  a.onended=()=>{if(statusTarget)statusTarget.textContent="✅ Audio finished!";currentAudio=null;};
  a.onerror=()=>{if(statusTarget)statusTarget.textContent="Audio could not load. Please refresh the page.";currentAudio=null;};
  try{
    await a.play();
    return true;
  }catch(err){
    if(statusTarget)statusTarget.textContent="Tap the audio button again. Your browser blocked autoplay.";
    return false;
  }
}
function playQuestion(){playFile(audioPath());}

function prog(){
  $("#count").textContent=`${i} / ${Q.length}`;
  $("#bar").style.width=`${i/Q.length*100}%`;
  $("#sec").textContent=i<Q.length?sections[Q[i][0]][0]:"Finished!";
}
function buildTopics(){
  $("#topicGrid").innerHTML=sections.map((s,n)=>`<div class="topicCard"><div class="ti">${s[1]}</div><div><h3>${n+1}. ${s[0]}</h3><p>${s[2]}</p></div></div>`).join("");
}
function intro(s){
  const a=sections[s];
  $("#sectionInfo").innerHTML=`<div class="big">${a[1]}</div><h1>Section ${s+1}: ${a[0]}</h1><p>${a[2]}</p><div class="stars">⭐ ⭐ ⭐ ⭐</div>`;
  started=s; show("section");
}
function render(){
  const q=Q[i],s=q[0];
  if(started!==s)return intro(s);
  sel=null;lock=false;
  $("#qsec").textContent=`${sections[s][1]} ${sections[s][0]}`;
  $("#qnum").textContent=`Question ${i-s*4+1} of 4`;
  $("#question").textContent=q[1];
  $("#picture").innerHTML=`<img class="questionImage" src="${imagePath()}" alt="Illustration for question ${i+1}" loading="eager">`;
  $("#feedback").className="feedback";$("#feedback").textContent="";
  $("#check").disabled=true;$("#check").classList.remove("hide");$("#next").classList.add("hide");
  const box=$("#answers");box.innerHTML="";
  q[2].forEach((t,n)=>{
    const b=document.createElement("button");b.className="ans";b.type="button";
    b.innerHTML=`<span>${String.fromCharCode(65+n)}</span>${t}`;
    b.addEventListener("click",()=>{if(lock)return;sel=n;[...box.children].forEach((x,j)=>x.classList.toggle("sel",j===n));$("#check").disabled=false;});
    box.appendChild(b);
  });
  prog();show("quiz");
}
function check(){
  if(sel===null||lock)return;
  const q=Q[i],bs=[...$("#answers").children],f=$("#feedback");
  if(sel===q[3]){
    lock=true;score++;bs[sel].classList.add("ok");
    f.className="feedback show good";f.textContent="✅ Correct! Great job! ⭐";
    $("#check").classList.add("hide");$("#next").classList.remove("hide");
  }else{
    const wrong=sel;bs[wrong].classList.add("no");
    f.className="feedback show bad";f.textContent="❌ Not yet. Look carefully and try again!";
    setTimeout(()=>{bs[wrong]?.classList.remove("no","sel");sel=null;$("#check").disabled=true;},650);
  }
}
function finish(){
  prog();show("result");
  const n=$("#name").value.trim()||"Student",p=Math.round(score/Q.length*100),st=p>=90?5:p>=75?4:p>=60?3:p>=40?2:1;
  $("#who").textContent=`${n}, you finished the adventure!`;
  $("#score").textContent=`${score} / 20 • ${p}%`;
  $("#stars").textContent="⭐".repeat(st);
  $("#finalMsg").textContent=p>=90?"Excellent! You are an English star! 🌟":p>=75?"Very good! Keep shining! 🎉":p>=60?"Good job! Keep practicing! 👍":"Keep practicing. You can do it! 💪";
}

$("#go").addEventListener("click",()=>show("help"));
$("#testAudio").addEventListener("click",()=>playFile("assets/v7/audio/test.mp3?v=7.3",$("#audioMsg")));
$("#ready").addEventListener("click",()=>{buildTopics();show("topics")});
$("#startTopics").addEventListener("click",()=>intro(0));
$("#begin").addEventListener("click",render);
$("#listen").addEventListener("click",playQuestion);
$("#check").addEventListener("click",check);
$("#next").addEventListener("click",()=>{i++;i>=Q.length?finish():render()});
$("#again").addEventListener("click",()=>{i=0;sel=null;score=0;started=-1;lock=false;$("#name").value="";prog();show("start")});

window.__EXAM_TEST__={questions:Q,imagePath,audioPath,getIndex:()=>i};
prog();
})();