import json,sys,numpy as np,soundfile as sf
from numpy.fft import rfft,irfft,rfftfreq
d=sys.argv[1];DUR=float(sys.argv[2]);SR=48000;N=int(SR*DUR);rng=np.random.default_rng(4)
def band(x,lo,hi):
    F=rfft(x);f=rfftfreq(len(x),1/SR);F*=((f>lo)&(f<hi));return irfft(F,len(x))
def tt(sec):return np.arange(int(sec*SR))/SR
# ---------- music: driving but light (A minor, 104 bpm) ----------
bpm=110;beat=60/bpm;bar=4*beat;mus=np.zeros(N);t=np.arange(N)/SR
hz=lambda m:440*2**((m-69)/12);prog=[[62,65,69],[58,62,65],[53,57,60],[60,64,67]]
def add(i0,sig,g):
    j=min(N,i0+len(sig))
    if 0<=i0<N:mus[i0:j]+=g*sig[:j-i0]
start=0.0
nb=int(DUR/bar)+1
for b in range(nb):
    ch=prog[b%4];st=start+b*bar
    x=tt(bar+0.4);env=np.minimum(1,x/0.4)*np.minimum(1,np.maximum(0,(bar+0.4-x)/0.5))
    pad=sum(np.sin(2*np.pi*hz(m)*x)+0.2*np.sin(2*np.pi*2*hz(m)*x) for m in ch)
    add(int(st*SR),pad*env,0.035)
    for k in range(8):  # bass eighths
        x=tt(beat/2*0.9);add(int((st+k*beat/2)*SR),np.sin(2*np.pi*hz(ch[0]-24)*x)*np.exp(-x*6)*(1 if k%2==0 else .6),0.18)
    for k in range(16): # pluck arp 16ths
        x=tt(0.4);m=[ch[0]+12,ch[1]+12,ch[2]+12,ch[1]+24][k%4];add(int((st+k*beat/4)*SR),np.sin(2*np.pi*hz(m)*x)*np.exp(-x*12),0.03 if k%2 else 0.045)
    for k in range(4):  # kick
        x=tt(0.3);add(int((st+k*beat)*SR),np.sin(2*np.pi*np.cumsum(50+90*np.exp(-x*35))/SR)*np.exp(-x*9),0.3)
    for k in range(8):  # hats offbeat
        x=tt(0.06);h=band(rng.standard_normal(len(x)),7000,16000);h/=np.abs(h).max();add(int((st+k*beat/2+beat/4)*SR),h*np.exp(-x*60),0.05)
    for k in (1,3):  # clap/snare
        x=tt(0.2);n=band(rng.standard_normal(len(x)),900,6000);n/=np.abs(n).max();add(int((st+k*beat)*SR),n*np.exp(-x*22),0.09)
mus*=np.minimum(1,np.maximum(0,(DUR-t)/2.0))
TL=json.load(open(d+'/timeline3.json'))
# drop the music out briefly under the summary + a breath before the CTA
# ---------- sfx ----------
out=np.zeros(N)
def put(t0,sig,g):
    i=int(t0*SR);j=min(N,i+len(sig))
    if 0<=i<N:out[i:j]+=g*sig[:j-i]
def pop():x=tt(0.09);f=700*np.exp(-x*18)+250;return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-x*40)
def thud(big=False):
    x=tt(0.35);s=np.sin(2*np.pi*np.cumsum(110*np.exp(-x*10)+45)/SR)*np.exp(-x*(9 if big else 14))
    n=band(rng.standard_normal(len(x)),100,2500 if big else 1200)*np.exp(-x*30);n/=np.abs(n).max()+1e-9;return s+0.5*n
def boom():
    x=tt(1.2);s=np.sin(2*np.pi*np.cumsum(38+80*np.exp(-x*8))/SR)*np.exp(-x*3.2)
    n=band(rng.standard_normal(len(x)),60,4000)*np.exp(-x*14);n/=np.abs(n).max();return s+0.6*n
def swoosh(sec=0.4):
    x=tt(sec);n=rng.standard_normal(len(x));s=np.zeros_like(n);K=8
    for k in range(K):a=k*len(x)//K;b=(k+1)*len(x)//K;s[a:b]=band(n,400+k*500,1500+k*900)[a:b]
    s/=np.abs(s).max()+1e-9;return s*np.sin(np.pi*x/sec)**2
def paper(sec=0.55):
    x=tt(sec);n=band(rng.standard_normal(len(x)),300,6000);n/=np.abs(n).max();return n*np.sin(np.pi*x/sec)**1.5
def marker(sec):
    x=tt(max(sec,0.05));n=band(rng.standard_normal(len(x)),1800,6500);n/=np.abs(n).max();return n*(0.6+0.4*np.abs(np.sin(2*np.pi*9*x)))
def click():x=tt(0.03);n=band(rng.standard_normal(len(x)),1500,8000);n/=np.abs(n).max();return n*np.exp(-x*220)
def ping():x=tt(0.5);return (np.sin(2*np.pi*1318*x)+0.6*np.sin(2*np.pi*1975*x))*np.exp(-x*9)
def coin():x=tt(0.4);return (np.sin(2*np.pi*2093*x)+np.sin(2*np.pi*2637*x)*0.7)*np.exp(-x*10)
def ding():x=tt(0.9);return (np.sin(2*np.pi*880*x)+0.5*np.sin(2*np.pi*1320*x)+0.3*np.sin(2*np.pi*1760*x))*np.exp(-x*4)
def riser(sec):
    x=tt(sec);f=300+2200*(x/sec)**2;s=np.sin(2*np.pi*np.cumsum(f)/SR)*0.3;n=band(rng.standard_normal(len(x)),2000,9000);n/=np.abs(n).max()
    return (s+0.7*n)*(x/sec)**2
for e in TL['sfx']:
    k=e['k'];t0=e['t'];dd=e.get('d',0.4)
    if k=='pop':put(t0,pop(),0.22)
    elif k=='thud':put(t0+0.25*dd,thud(),0.45)
    elif k=='stamp':put(t0+0.8*dd,thud(True),0.7)
    elif k=='boom':put(max(0,t0),boom(),0.85);put(max(0,t0),thud(True),0.4)
    elif k=='swoosh':put(t0-0.05,swoosh(0.45),0.22)
    elif k=='paper':put(t0-0.05,paper(0.6),0.3);put(t0,swoosh(0.5),0.15)
    elif k in('swipe','marker'):put(t0,marker(dd),0.1)
    elif k=='type':
        for i in range(int(e.get('n',4))):put(t0+i*0.13,click(),0.35)
    elif k=='tick':
        for i in range(14):put(t0+dd*(1-(1-i/14)**1.6),click(),0.18)
    elif k=='ping':put(t0,ping(),0.18)
    elif k=='coin':put(t0+0.3,coin(),0.16)
    elif k=='ding':put(t0+0.15,ding(),0.3);put(t0+0.18,thud(True),0.5)
    elif k=='riser':put(t0,riser(dd),0.35)
sf.write(d+'/music3.wav',mus.astype(np.float32),SR);sf.write(d+'/sfx3.wav',out.astype(np.float32),SR);print('ok',np.abs(mus).max(),np.abs(out).max())
