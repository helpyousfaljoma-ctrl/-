import cv2,numpy as np,sys
d=sys.argv[1]; im=cv2.imread(d+'/src.jpg'); h,w=im.shape[:2]
poly=np.array([(150,705),(185,665),(250,655),(300,640),(340,560),(420,480),(500,420),(560,392),(625,398),(680,460),(720,560),(820,680),(1000,730),(1100,760),(1180,860),(1210,1000),(1215,1200),(1235,1500),(1300,1700),(1430,1880),(1496,1960),(1496,1995),(780,1995),(700,1880),(600,1760),(520,1640),(420,1460),(330,1300),(260,1150),(200,950),(165,830)],np.int32)
hole=np.array([(395,750),(470,690),(530,690),(560,745),(470,790)],np.int32)
P=np.zeros((h,w),np.uint8); cv2.fillPoly(P,[poly],255); cv2.fillPoly(P,[hole],0)
k=lambda r:cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(r,r))
m=np.full((h,w),cv2.GC_BGD,np.uint8)
m[cv2.dilate(P,k(81))>0]=cv2.GC_PR_BGD
m[P>0]=cv2.GC_PR_FGD
m[cv2.erode(P,k(71))>0]=cv2.GC_FGD
s=0.5; ims=cv2.resize(im,None,fx=s,fy=s); ms=cv2.resize(m,(ims.shape[1],ims.shape[0]),interpolation=cv2.INTER_NEAREST)
bg=np.zeros((1,65));fg=np.zeros((1,65)); cv2.grabCut(ims,ms,None,bg,fg,8,cv2.GC_INIT_WITH_MASK)
fgm=np.where((ms==1)|(ms==3),255,0).astype(np.uint8); fgm=cv2.resize(fgm,(w,h))
n,l,st,_=cv2.connectedComponentsWithStats((fgm>127).astype(np.uint8)); kk=1+np.argmax(st[1:,4]); mk=(l==kk).astype(np.uint8)*255
mk=cv2.morphologyEx(mk,cv2.MORPH_OPEN,k(9)); mk=cv2.bitwise_and(mk,cv2.dilate(P,k(15))); mk=cv2.GaussianBlur(mk,(0,0),2.5)
rgba=cv2.cvtColor(im,cv2.COLOR_BGR2BGRA); rgba[...,3]=mk; cv2.imwrite(d+'/hand_full.png',rgba)
prev=im.copy(); prev[mk<128]=(255,0,255); cv2.imwrite(d+'/prev.jpg',cv2.resize(prev,None,fx=0.35,fy=0.35))
