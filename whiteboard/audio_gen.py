import json,sys,numpy as np,soundfile as sf
d=sys.argv[1]; SR=48000; DUR=float(sys.argv[2]); N=int(SR*DUR); rng=np.random.default_rng(3)
t=np.arange(N)/SR
    # vectorised one-pole via lfilter-like loop in chunks
# ---------- music ----------
bpm=96; beat=60/bpm; bar=4*beat
def hz(m): return 440*2**((m-69)/12)
prog=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]  # Am F C G
mus=np.zeros(N)
for b in range(int(DUR/bar)+1):
    ch=prog[b%4]; st=b*bar
    i0=int(st*SR); i1=min(N,int((st+bar+0.6)*SR))
    if i0>=N: break
    tt=np.arange(i1-i0)/SR; env=np.minimum(1,tt/0.9)*np.minimum(1,np.maximum(0,(bar+0.6-tt)/0.8))
    for m in ch+[ch[0]-12]:
        f=hz(m); mus[i0:i1]+=0.05*env*(np.sin(2*np.pi*f*tt)+0.25*np.sin(2*np.pi*2*f*tt+0.3)+0.1*np.sin(2*np.pi*3*f*tt))
    # pluck arpeggio eighth notes
    arp=[ch[0]+12,ch[1]+12,ch[2]+12,ch[1]+12]
    for k in range(8):
        ps=st+k*beat/2; j0=int(ps*SR)
        if j0>=N: break
        L=int(0.9*SR); j1=min(N,j0+L); tt=np.arange(j1-j0)/SR; f=hz(arp[k%4])
        mus[j0:j1]+=0.035*np.exp(-tt*5)*(np.sin(2*np.pi*f*tt)+0.3*np.sin(2*np.pi*2*f*tt))*(1 if k%2==0 else 0.7)
    # soft kick on 1 and 3 from bar 2
    if b>=1:
        for k in (0,2):
            j0=int((st+k*beat)*SR); j1=min(N,j0+int(0.25*SR))
            if j0<N: tt=np.arange(j1-j0)/SR; mus[j0:j1]+=0.12*np.exp(-tt*18)*np.sin(2*np.pi*(55+60*np.exp(-tt*30))*tt)
fade=np.minimum(1,t/1.5)*np.minimum(1,np.maximum(0,(DUR-t)/1.8))
mus*=fade
# ---------- marker sfx ----------
TL=json.load(open(d+'/timeline.json'));tl=TL['els']; sfx=np.zeros(N)
noise=rng.standard_normal(N)
# band-pass ~1.5-6k: highpass by subtracting lowpass, done once with simple FIR approx
from numpy.fft import rfft,irfft,rfftfreq
F=rfft(noise); fr=rfftfreq(N,1/SR); F*=((fr>1800)&(fr<7000))*1.0; bn=irfft(F,N); bn/=np.abs(bn).max()
for e in tl:
    j0=int(e['t0']*SR); j1=min(N,int((e['t0']+e['dur'])*SR))
    if j1<=j0: continue
    tt=np.arange(j1-j0)/SR; rate=13 if e['k']=='t' else 7
    mod=0.55+0.45*np.abs(np.sin(np.pi*rate*tt+rng.random()*3))
    env=np.minimum(1,tt/0.02)*np.minimum(1,(tt[-1]-tt+1e-4)/0.03)
    sfx[j0:j1]+=0.10*bn[j0:j1]*mod*env
# whooshes at scene changes
for s in TL['scenes'][1:]:
    j0=int(s*SR); L=int(0.4*SR); tt=np.arange(L)/SR; env=np.sin(np.pi*tt/0.4)**2
    F2=rfft(rng.standard_normal(L)); fr2=rfftfreq(L,1/SR); F2*=np.exp(-fr2/1500); w=irfft(F2,L); w/=np.abs(w).max()
    sfx[j0:j0+L]+=0.18*w*env
sf.write(d+'/music.wav',mus.astype(np.float32),SR); sf.write(d+'/sfx.wav',sfx.astype(np.float32),SR)
print('ok',np.abs(mus).max(),np.abs(sfx).max())
