import sys, numpy as np, soundfile as sf, scipy.signal as ss, sherpa_onnx
m='/tmp/claude-0/models/sherpa-onnx-whisper-medium'
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f'{m}/medium-encoder.onnx',decoder=f'{m}/medium-decoder.onnx',tokens=f'{m}/medium-tokens.txt',language='ar',task='transcribe',num_threads=8,tail_paddings=2000)
x,sr=sf.read(sys.argv[1],dtype='float32')
for w in sys.argv[2:]:
  a,b=map(float,w.split('-')); seg=ss.resample_poly(x[int(a*sr):int(b*sr)],16000,sr).astype('float32')
  seg=np.concatenate([np.zeros(8000,'float32'),seg,np.zeros(24000,'float32')])
  s=rec.create_stream(); s.accept_waveform(16000,seg); rec.decode_stream(s); print(w, '|', s.result.text, flush=True)
