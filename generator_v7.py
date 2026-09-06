from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import math, subprocess, shutil, os

W,H=900,520
ROOT=Path(__file__).resolve().parent
ASSETS=ROOT/"assets"/"v7"
AUDIO=ASSETS/"audio"
ASSETS.mkdir(parents=True,exist_ok=True)
AUDIO.mkdir(parents=True,exist_ok=True)

def bg(c1=(242,250,255),c2=(255,248,238)):
    img=Image.new("RGB",(W,H),c1); p=img.load()
    for y in range(H):
        t=y/(H-1); c=tuple(int(c1[i]*(1-t)+c2[i]*t) for i in range(3))
        for x in range(W): p[x,y]=c
    return img

def finish(img):
    d=ImageDraw.Draw(img)
    d.rounded_rectangle((14,14,W-14,H-14),28,outline=(190,215,235),width=4)
    return img

def floor(d,wall=(255,242,223),fc=(226,188,147)):
    d.rectangle((0,0,W,380),fill=wall); d.rectangle((0,380,W,H),fill=fc)
    for x in range(0,W,90): d.line((x,380,x+50,H),fill=(205,166,125),width=2)
    for y in range(420,H,45): d.line((0,y,W,y),fill=(205,166,125),width=2)

def window(d,x,y,w,h):
    d.rounded_rectangle((x,y,x+w,y+h),12,fill=(130,210,250),outline="white",width=8)
    d.line((x+w/2,y+5,x+w/2,y+h-5),fill="white",width=7); d.line((x+5,y+h/2,x+w-5,y+h/2),fill="white",width=7)
    d.ellipse((x+15,y+15,x+55,y+55),fill=(255,220,80)); d.rectangle((x+5,y+h*.68,x+w-5,y+h-5),fill=(130,205,110))

def bed(d,x=85,y=245,w=320,h=120):
    d.rounded_rectangle((x,y,x+w,y+h),20,fill=(75,128,210),outline=(55,90,150),width=3)
    d.rounded_rectangle((x,y-55,x+w,y+20),24,fill=(115,174,245),outline=(75,128,210),width=3)
    d.rounded_rectangle((x+25,y-42,x+135,y+2),15,fill=(250,250,250))
    d.rectangle((x+15,y+h,x+35,y+h+45),fill=(120,75,45)); d.rectangle((x+w-35,y+h,x+w-15,y+h+45),fill=(120,75,45))

def desk(d,x=560,y=250,w=220,computer=True):
    if computer:
        d.rounded_rectangle((x+55,y-125,x+165,y-45),8,fill=(70,90,110)); d.rounded_rectangle((x+67,y-113,x+153,y-60),5,fill=(85,195,245)); d.rectangle((x+103,y-45,x+117,y-15),fill=(70,90,110))
    d.rounded_rectangle((x,y,x+w,y+30),6,fill=(177,119,70)); d.rectangle((x+18,y+30,x+40,y+135),fill=(133,82,47)); d.rectangle((x+w-40,y+30,x+w-18,y+135),fill=(133,82,47))

def closet(d,x=570,y=75,w=230,h=300,open_=False):
    if open_:
        d.rounded_rectangle((x,y,x+w,y+h),12,fill=(170,105,55),outline=(120,72,40),width=4); d.rectangle((x+20,y+20,x+w-20,y+h-20),fill=(113,67,42)); d.line((x+45,y+65,x+w-45,y+65),fill=(220,190,160),width=5)
        d.polygon([(x,y+10),(x-55,y+45),(x-55,y+h-10),(x,y+h-5)],fill=(201,139,83),outline=(120,72,40)); d.polygon([(x+w,y+10),(x+w+55,y+45),(x+w+55,y+h-10),(x+w,y+h-5)],fill=(201,139,83),outline=(120,72,40))
    else:
        d.rounded_rectangle((x,y,x+w,y+h),12,fill=(196,139,83),outline=(135,87,48),width=4); d.rectangle((x+15,y+15,x+w/2-5,y+h-15),fill=(184,124,72)); d.rectangle((x+w/2+5,y+15,x+w-15,y+h-15),fill=(184,124,72))
        d.ellipse((x+w/2-14,y+h/2-6,x+w/2-4,y+h/2+4),fill=(245,211,91)); d.ellipse((x+w/2+4,y+h/2-6,x+w/2+14,y+h/2+4),fill=(245,211,91))

def ball(d,cx,cy,r=45):
    d.ellipse((cx-r,cy-r,cx+r,cy+r),fill="white",outline=(40,55,70),width=5)
    pts=[(cx+18*math.cos(-math.pi/2+k*2*math.pi/5),cy+18*math.sin(-math.pi/2+k*2*math.pi/5)) for k in range(5)]
    d.polygon(pts,fill=(40,55,70))
    for a in [0,72,144,216,288]:
        rad=math.radians(a-90); d.line((cx+18*math.cos(rad),cy+18*math.sin(rad),cx+.78*r*math.cos(rad),cy+.78*r*math.sin(rad)),fill=(40,55,70),width=4)

def rabbit(d,cx,cy,s=1):
    d.ellipse((cx-33*s,cy-100*s,cx-7*s,cy-25*s),fill=(225,218,207),outline=(150,140,130),width=max(1,int(3*s))); d.ellipse((cx+7*s,cy-100*s,cx+33*s,cy-25*s),fill=(225,218,207),outline=(150,140,130),width=max(1,int(3*s)))
    d.ellipse((cx-45*s,cy-10*s,cx+45*s,cy+85*s),fill=(225,218,207),outline=(150,140,130),width=max(1,int(3*s))); d.ellipse((cx-42*s,cy-55*s,cx+42*s,cy+25*s),fill=(235,228,218),outline=(150,140,130),width=max(1,int(3*s)))
    d.ellipse((cx-18*s,cy-25*s,cx-10*s,cy-17*s),fill=(45,45,45)); d.ellipse((cx+10*s,cy-25*s,cx+18*s,cy-17*s),fill=(45,45,45)); d.ellipse((cx-5*s,cy-8*s,cx+5*s,cy+2*s),fill=(225,125,150))

def chair(d,x,y,w=160,h=185):
    d.rounded_rectangle((x,y+60,x+w,y+95),8,fill=(90,143,205)); d.rectangle((x+20,y+95,x+40,y+h),fill=(70,110,160)); d.rectangle((x+w-40,y+95,x+w-20,y+h),fill=(70,110,160)); d.rectangle((x+5,y,x+30,y+65),fill=(70,110,160)); d.rounded_rectangle((x+10,y,x+w-10,y+30),8,fill=(100,155,215))

def bag(d,cx,cy,w=260,h=190):
    x=cx-w/2; y=cy-h/2; d.polygon([(x+25,y+40),(x+w-25,y+40),(x+w,y+h),(x,y+h)],fill=(245,183,57),outline=(150,100,30)); d.arc((x+70,y-70,x+w-70,y+90),180,360,fill=(150,100,30),width=12); d.rounded_rectangle((x+55,y+80,x+w-55,y+130),12,fill=(230,145,45))

def shoes(d,cx,cy,color=(210,65,65)):
    for dx in (-45,45):
        d.ellipse((cx+dx-42,cy-16,cx+dx+42,cy+16),fill=color,outline=(100,50,50),width=3); d.rectangle((cx+dx-15,cy-35,cx+dx+30,cy),fill=color); d.line((cx+dx-10,cy-24,cx+dx+18,cy-24),fill="white",width=3)

def books(d,x,y):
    for i,c in enumerate([(225,80,80),(70,130,220),(245,190,60)]): d.rounded_rectangle((x,y+i*28,x+150,y+20+i*28),4,fill=c,outline=(80,80,80),width=2)

def person(d,gender="boy",pants=None,shirt=None,dress=None,shoe=None):
    cx=450; skin=(242,191,153); hair=(95,55,35) if gender=="boy" else (115,65,48)
    d.ellipse((300,430,600,475),fill=(220,230,240))
    if dress:
        d.rectangle((395,330,425,425),fill=skin); d.rectangle((475,330,505,425),fill=skin)
    else:
        pc=pants or (65,115,185); d.polygon([(380,285),(445,285),(435,420),(385,420)],fill=pc); d.polygon([(455,285),(520,285),(515,420),(465,420)],fill=pc)
    sc=shoe or (60,65,75); d.ellipse((360,405,445,445),fill=sc); d.ellipse((455,405,540,445),fill=sc)
    if dress:
        d.polygon([(390,190),(510,190),(570,355),(330,355)],fill=dress,outline=(180,120,50))
    else:
        sh=shirt or (75,145,225); d.rounded_rectangle((385,185,515,315),25,fill=sh); d.polygon([(385,205),(320,265),(350,290),(420,235)],fill=sh); d.polygon([(515,205),(580,265),(550,290),(480,235)],fill=sh)
    d.ellipse((385,70,515,200),fill=skin,outline=(210,160,125),width=3)
    if gender=="boy":
        d.pieslice((365,45,535,175),180,355,fill=hair); d.polygon([(395,80),(430,45),(450,82),(475,45),(510,90)],fill=hair)
    else:
        d.ellipse((365,50,535,210),fill=hair); d.ellipse((385,70,515,200),fill=skin); d.polygon([(500,70),(545,45),(535,95)],fill=(245,80,150)); d.polygon([(500,70),(470,45),(480,95)],fill=(245,80,150))
    d.ellipse((420,125,430,135),fill=(30,30,30)); d.ellipse((470,125,480,135),fill=(30,30,30)); d.arc((425,145,475,175),0,180,fill=(150,70,70),width=4)

def save(img,n):
    finish(img).save(ASSETS/f"q{n:02d}.jpg",quality=88,optimize=True)

im=bg((255,244,236),(255,252,245)); d=ImageDraw.Draw(im); floor(d); window(d,70,55,140,110); bed(d,70,245,350,120); desk(d,585,250,210,True); closet(d,470,75,180,285,True); rabbit(d,510,300,.5); save(im,1)
im=bg((255,247,225),(255,252,245)); d=ImageDraw.Draw(im); floor(d,(255,240,210),(228,191,145)); window(d,655,50,120,100)
d.rectangle((70,210,690,340),fill=(115,180,100)); d.rectangle((70,190,690,215),fill=(225,185,130)); d.rectangle((100,90,250,190),fill=(150,205,125)); d.rectangle((280,90,430,190),fill=(150,205,125)); d.rectangle((470,90,620,190),fill=(150,205,125))
d.rounded_rectangle((110,225,250,335),10,fill=(115,125,140)); d.rectangle((145,245,215,315),fill=(55,65,75)); d.ellipse((150,230,165,245),fill=(35,35,35)); d.ellipse((195,230,210,245),fill=(35,35,35))
d.rounded_rectangle((520,210,660,340),10,fill=(210,220,230)); d.line((590,210,590,340),fill=(165,175,185),width=5); d.ellipse((405,260,520,350),fill=(230,80,65)); save(im,2)
im=bg((232,248,255),(255,255,255)); d=ImageDraw.Draw(im); floor(d,(225,246,252),(215,235,235)); window(d,80,55,140,115); d.rounded_rectangle((100,250,500,360),45,fill=(250,252,253),outline=(170,195,210),width=6); d.arc((430,155,560,300),180,300,fill=(120,150,170),width=13); d.rounded_rectangle((620,245,735,350),25,fill=(245,247,249),outline=(180,195,205),width=4); d.ellipse((635,215,720,275),fill=(245,247,249),outline=(180,195,205),width=4); d.rounded_rectangle((570,70,740,175),16,fill=(160,215,240),outline=(255,255,255),width=6); save(im,3)
im=bg((255,241,250),(255,253,245)); d=ImageDraw.Draw(im); floor(d,(255,235,244),(230,197,160)); window(d,610,55,140,115); d.rounded_rectangle((110,240,520,350),32,fill=(198,139,213),outline=(160,100,180),width=4); d.rounded_rectangle((130,190,255,275),26,fill=(220,168,230)); d.rounded_rectangle((370,190,495,275),26,fill=(220,168,230)); d.ellipse((170,365,520,430),fill=(105,85,140)); d.rounded_rectangle((575,210,760,330),12,fill=(55,70,85)); d.rectangle((595,230,740,310),fill=(75,160,210)); save(im,4)
im=bg(); d=ImageDraw.Draw(im); floor(d,(245,250,255),(230,205,175)); d.rounded_rectangle((220,245,680,285),8,fill=(181,119,70)); d.rectangle((250,285,280,410),fill=(130,80,45)); d.rectangle((620,285,650,410),fill=(130,80,45)); ball(d,450,195,48); save(im,5)
im=bg(); d=ImageDraw.Draw(im); floor(d,(245,250,255),(230,205,175)); chair(d,330,145,240,210); rabbit(d,450,395,.75); save(im,6)
im=bg(); d=ImageDraw.Draw(im); floor(d,(255,247,230),(230,205,175)); bag(d,450,300,340,250); rabbit(d,450,280,.65); save(im,7)
im=bg(); d=ImageDraw.Draw(im); floor(d,(248,240,255),(230,205,175)); closet(d,300,55,300,330,True); rabbit(d,450,310,.7); save(im,8)
im=bg(); d=ImageDraw.Draw(im); floor(d); desk(d,330,280,260,True); save(im,9)
im=bg(); d=ImageDraw.Draw(im); floor(d); bed(d,210,230,480,135); shoes(d,450,430,(215,70,70)); save(im,10)
im=bg(); d=ImageDraw.Draw(im); floor(d,(250,245,255),(230,198,160)); closet(d,290,55,320,335,True); ball(d,450,300,40); save(im,11)
im=bg(); d=ImageDraw.Draw(im); floor(d); bed(d,210,235,480,135); books(d,370,170); save(im,12)
for n,args in [(13,("boy",(70,180,85),(215,75,65),None,(65,85,110))),(14,("boy",(70,180,85),(215,75,65),None,(130,85,50))),(15,("girl",None,None,(250,205,55),(210,65,75))),(16,("girl",None,None,(250,205,55),(220,55,65))),(17,("girl",(80,125,190),(245,145,45),None,(210,65,75))),(18,("boy",(75,120,190),(80,165,225),None,(35,40,45)))]:
    im=bg((245,250,255),(255,247,245)); d=ImageDraw.Draw(im); person(d,*args); save(im,n)
im=bg(); d=ImageDraw.Draw(im); floor(d,(248,240,255),(230,198,160)); closet(d,300,55,300,335,True); d.line((385,115,515,115),fill=(230,230,230),width=4); d.polygon([(405,140),(495,140),(515,320),(465,325),(450,230),(435,325),(385,320)],fill=(70,180,85),outline=(45,120,60)); save(im,19)
im=bg(); d=ImageDraw.Draw(im); floor(d); bed(d,60,250,360,120); closet(d,470,70,220,300,False); desk(d,660,255,180,True); d.ellipse((195,390,285,455),fill=(190,180,170),outline=(120,110,100),width=3); chair(d,420,295,120,150); d.rounded_rectangle((445,300,515,335),5,fill=(225,70,70)); save(im,20)

texts=[("Where do you sleep?",["kitchen","bedroom","bathroom"]),("Where do we cook food?",["living room","kitchen","bedroom"]),("Where do you take a bath?",["bathroom","kitchen","living room"]),("Where do you sit on a sofa?",["bedroom","living room","bathroom"]),("The ball is blank the table.",["in","on","under"]),("The rabbit is blank the chair.",["on","under","in"]),("The rabbit is blank the bag.",["under","in","on"]),("The rabbit is blank the closet.",["on","under","in"]),("Where is the computer?",["It's on the desk.","They're on the desk.","It's under the desk."]),("Where are the shoes?",["It's under the bed.","They're under the bed.","They're in the bag."]),("Where is the ball?",["It's in the closet.","It's on the closet.","They're in the closet."]),("Where are the books?",["They're on the bed.","It's on the bed.","They're under the bed."]),("His pants are blank.",["green","brown","yellow"]),("His shoes are blank.",["red","brown","green"]),("Her dress is blank.",["yellow","red","blue"]),("Her shoes are blank.",["brown","yellow","red"]),("Her blank is orange.",["shirt","shoes","pants"]),("His blank are black.",["shirt","shoes","dress"]),("Where are the pants?",["They're in the closet.","They're under the closet.","It's in the closet."]),("Look at the room. Which sentence is correct?",["The computer is on the desk.","The cat is on the bed.","The book is under the chair."])]
for i,(q,opts) in enumerate(texts,1):
    t="Listen carefully. "+q+" "+f"Option A. {opts[0]} Option B. {opts[1]} Option C. {opts[2]}"
    wav=AUDIO/f"q{i:02d}.wav"; mp3=AUDIO/f"q{i:02d}.mp3"
    subprocess.run(["espeak","-v","en-us","-s","135","-p","45","-a","180","-w",str(wav),t],check=True)
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",str(wav),"-ac","1","-ar","24000","-b:a","32k",str(mp3)],check=True); wav.unlink()
wav=AUDIO/"test.wav"; mp3=AUDIO/"test.mp3"
subprocess.run(["espeak","-v","en-us","-s","135","-p","45","-a","180","-w",str(wav),"Hello! Welcome to your English adventure. The audio is working."],check=True)
subprocess.run(["ffmpeg","-y","-loglevel","error","-i",str(wav),"-ac","1","-ar","24000","-b:a","32k",str(mp3)],check=True); wav.unlink()
print("Generated",len(list(ASSETS.glob("q*.jpg"))),"images and",len(list(AUDIO.glob("*.mp3"))),"audio files")
