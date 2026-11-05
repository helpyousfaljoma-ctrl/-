#!/usr/bin/env python3
"""Re-pace a voiceover: every pause between phrases is set to a target length,
without touching a single sample of speech.

  python3 repace.py in.wav chunks.json plan.json out.wav out_chunks.json

chunks.json : [{s, e}]  speech phrases (seconds, in in.wav)
plan.json   : {"gaps": [g0, g1, ...]}  target pause after phrase i (null = keep)
Each pause keeps the decay of the word before and the onset of the next word; the
middle is shortened, joined with equal-power crossfades inside the room tone.
"""
import sys, json
import numpy as np
import soundfile as sf

src, cj, pj, out, oj = sys.argv[1:6]
x, sr = sf.read(src, dtype='float64')
if x.ndim > 1: x = x.mean(1)
ch = json.load(open(cj, encoding='utf-8'))
gaps = json.load(open(pj, encoding='utf-8'))['gaps']
XF = int(0.012 * sr)
HEAD, TAIL = 0.07, 0.05

# list of (a, b) source ranges to keep, in order
keep, cur = [], 0
for i in range(len(ch) - 1):
    e, ns = int(ch[i]['e'] * sr), int(ch[i + 1]['s'] * sr)
    g = (ns - e) / sr
    tgt = gaps[i] if i < len(gaps) and gaps[i] is not None else g
    if g - tgt <= 0.02: continue
    h = min(HEAD, tgt * 0.55); tl = min(TAIL, tgt - h)
    a_end = e + int(h * sr); b_start = ns - int(tl * sr)
    room = int((tgt - h - tl) * sr)            # fill from the middle of the gap
    m0 = max(a_end, (a_end + b_start) // 2 - room // 2 - XF)
    keep.append((cur, a_end))
    keep.append((m0, m0 + room + 2 * XF))
    cur = b_start
keep.append((cur, len(x)))

q = np.linspace(0, np.pi / 2, XF)
outp, pos, mapping = [], 0, []    # mapping: (src_a, dst_a) per kept range
y = np.zeros(0)
for a, b in keep:
    seg = x[a:b]
    if len(y) >= XF and len(seg) >= XF:
        dst = len(y) - XF
        y = np.concatenate([y[:-XF], y[-XF:] * np.cos(q) + seg[:XF] * np.sin(q), seg[XF:]])
    else:
        dst = len(y); y = np.concatenate([y, seg])
    mapping.append((a, b, dst))


def remap(t):
    s = int(t * sr)
    for a, b, d in mapping:
        if a <= s < b: return (d + s - a) / sr
    raise ValueError(t)


nc = [{'s': round(remap(c['s']), 4), 'e': round(remap(c['e'] - 1e-4), 4)} for c in ch]
sf.write(out, y.astype('float32'), sr, subtype='FLOAT')
json.dump(nc, open(oj, 'w'), indent=1)
print(f'{len(x)/sr:.2f}s → {len(y)/sr:.2f}s')
