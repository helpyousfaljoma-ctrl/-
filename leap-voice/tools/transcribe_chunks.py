#!/usr/bin/env python3
"""Split a clean voiceover at its pauses and transcribe each phrase with an offline
Whisper (sherpa-onnx). Word times inside a phrase are spread by letter count.

  python3 transcribe_chunks.py in.wav out.json [model_dir]
"""
import sys, json, re, subprocess
import numpy as np
import soundfile as sf
import sherpa_onnx

src, out = sys.argv[1], sys.argv[2]
mdir = sys.argv[3] if len(sys.argv) > 3 else '/tmp/claude-0/models/sherpa-onnx-whisper-medium'

x, sr = sf.read(src, dtype='float32')
if x.ndim > 1: x = x.mean(1)


def speech_chunks(x, sr, thr_db=-42, min_sil=0.10):
    hop = int(sr * 0.005)
    n = len(x) // hop
    e = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2) + 1e-12) for i in range(n)])
    db = 20 * np.log10(e)
    voiced = db > thr_db
    chunks, i = [], 0
    while i < n:
        if voiced[i]:
            j = i
            while j < n:
                if not voiced[j]:
                    k = j
                    while k < n and not voiced[k]: k += 1
                    if (k - j) * hop / sr >= min_sil or k >= n: break
                    j = k
                else: j += 1
            chunks.append([i * hop / sr, j * hop / sr]); i = j
        else: i += 1
    return [c for c in chunks if c[1] - c[0] > 0.08]


rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=f'{mdir}/medium-encoder.int8.onnx', decoder=f'{mdir}/medium-decoder.int8.onnx',
    tokens=f'{mdir}/medium-tokens.txt', language='ar', task='transcribe', num_threads=8, tail_paddings=2000)

chunks = speech_chunks(x, sr)
res = []
for a, b in chunks:
    pa, pb = max(0, a - 0.12), min(len(x) / sr, b + 0.12)
    seg = x[int(pa * sr):int(pb * sr)]
    if sr != 16000:
        import scipy.signal as ss
        seg = ss.resample_poly(seg, 16000, sr).astype('float32')
    seg = np.concatenate([np.zeros(8000, 'float32'), seg, np.zeros(24000, 'float32')])
    s = rec.create_stream(); s.accept_waveform(16000, seg); rec.decode_stream(s)
    txt = s.result.text.strip()
    words = [w for w in re.split(r'\s+', txt) if w]
    L = [max(1, len(re.sub(r'[^\w]', '', w))) for w in words]
    tot = sum(L) or 1; cur = a; ws = []
    for w, l in zip(words, L):
        d = (b - a) * l / tot; ws.append({'w': w, 's': round(cur, 3), 'e': round(cur + d, 3)}); cur += d
    res.append({'s': round(a, 3), 'e': round(b, 3), 'text': txt, 'words': ws})
    print(f'{a:6.2f}-{b:6.2f}  {txt}', flush=True)
json.dump(res, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
