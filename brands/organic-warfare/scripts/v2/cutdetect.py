import subprocess, numpy as np, sys
f=sys.argv[1]
out=subprocess.run(['ffmpeg','-loglevel','error','-i',f,'-vf','scale=64:114,format=gray','-f','rawvideo','-'],capture_output=True).stdout
fr=np.frombuffer(out,np.uint8).reshape(-1,114,64).astype(np.float32)
d=np.abs(np.diff(fr,axis=0)).mean(axis=(1,2))
med=np.median(d)
print(f, 'frames',len(fr),'median diff %.2f'%med)
for i,v in enumerate(d):
    if v>max(4*med,6): print('  possible cut at frame %d (t=%.2fs) diff=%.1f'%(i+1,(i+1)/30,v))
