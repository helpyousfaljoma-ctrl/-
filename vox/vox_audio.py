import json,sys,numpy as np,soundfile as sf
from numpy.fft import rfft,irfft,rfftfreq
d=sys.argv[1];DUR=float(sys.argv[2]);SR=48000;N=int(SR*DUR);rng=np.random.default_rng(9)
out=np.zeros(N)
def band(x,lo,hi):
    F=rfft(x);f=rfftfreq(len(x),1/SR);F*=((f>lo)&(f<hi));return irfft(F,len(x))
def put(t,sig,g):
    i=int(t*SR);j=min(N,i+len(sig))
    if i<0 or i>=N:return
    out[i:j]+=g*sig[:j-i]
def tt(sec):return np.arange(int(sec*SR))/SR
def pop():
    t=tt(0.09);f=700*np.exp(-t*18)+250;s=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*40);return s
def thud(big=False):
    t=tt(0.35);f=110*np.exp(-t*10)+45;s=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*(9 if big else 14))
    n=band(rng.standard_normal(len(t)),100,2500 if big else 1200)*np.exp(-t*30);n/=np.abs(n).max()+1e-9;return s+0.5*n
def swoosh(sec=0.4):
    t=tt(sec);n=rng.standard_normal(len(t));env=np.sin(np.pi*t/sec)**2
    # sweeping band via splitting into chunks
    s=np.zeros_like(n);K=8
    for k in range(K):
        a=k*len(t)//K;b=(k+1)*len(t)//K;s[a:b]=band(n,400+k*500,1500+k*900)[a:b]
    s/=np.abs(s).max()+1e-9;return s*env
def paper(sec=0.55):
    t=tt(sec);n=band(rng.standard_normal(len(t)),300,6000);n/=np.abs(n).max()
    crk=(rng.random(len(t))<0.004).astype(float);crk=np.convolve(crk,np.exp(-np.arange(200)/30),'same')
    env=np.sin(np.pi*t/sec)**1.5;return n*env*(0.5+0.8*np.clip(crk,0,1))
def marker(sec):
    t=tt(max(sec,0.05));n=band(rng.standard_normal(len(t)),1800,6500);n/=np.abs(n).max()
    return n*(0.6+0.4*np.abs(np.sin(2*np.pi*9*t)))*np.minimum(1,np.minimum(t/0.02,(t[-1]-t)/0.03+1e-3))
def click():
    t=tt(0.03);n=band(rng.standard_normal(len(t)),1500,8000);n/=np.abs(n).max();return n*np.exp(-t*220)
TL=json.load(open(d+'/timeline.json'))
for e in TL['sfx']:
    k=e['k'];t=e['t']
    if k=='pop':put(t,pop(),0.22)
    elif k=='thud':put(t+0.25*e.get('d',0.4),thud(),0.45)
    elif k=='stamp':put(t+0.8*e.get('d',0.24),thud(True),0.7)
    elif k=='swoosh':put(t-0.05,swoosh(0.45),0.22)
    elif k=='paper':put(t-0.05,paper(0.6),0.3);put(t,swoosh(0.5),0.15)
    elif k=='swipe':put(t,marker(e.get('d',0.3))*0.8,0.12)
    elif k=='marker':put(t,marker(e.get('d',0.3)),0.1)
    elif k=='type':
        for i in range(int(e.get('n',4))):put(t+i*0.15,click(),0.35)
    elif k=='tick':
        n=14;dd=e.get('d',0.75)
        for i in range(n):put(t+dd*(1-(1-i/n)**1.6),click(),0.18)
sf.write(d+'/sfx.wav',out.astype(np.float32),SR);print('sfx',np.abs(out).max())
