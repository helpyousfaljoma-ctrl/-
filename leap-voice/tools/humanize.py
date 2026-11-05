#!/usr/bin/env python3
"""Build the final voiceover from the original ElevenLabs take.

1. Split the ORIGINAL take at the middle of each pause (never inside speech).
2. Speed each phrase with rubberband (pitch + formants preserved). The tempo varies
   per phrase (key lines a touch slower, lists/connectors a touch faster), and the
   speech-weighted mean is held at exactly 1.12.
3. Re-pace: each pause gets its own target length (0.20-0.30 s, longer at the
   dramatic beats), with a little seeded jitter so no two gaps are identical.
Outputs voice_final.wav (48 kHz) + chunks_final.json (phrase times in the final file).
"""
import json, subprocess, os, sys
import numpy as np
import soundfile as sf

W = os.path.dirname(os.path.abspath(__file__)) + '/..'
TEMPO = 1.12
ch = json.load(open(f'{W}/chunks_fast.json', encoding='utf-8'))
TEXT = json.load(open(f'{W}/script_lines.json', encoding='utf-8'))  # per chunk: text, tempo tag, gap
assert len(TEXT) == len(ch), (len(TEXT), len(ch))

x, sr = sf.read(f'{W}/voice_orig_48k.wav', dtype='float32')
# chunk times in the ORIGINAL take
oc = [(c['s'] * TEMPO, c['e'] * TEMPO) for c in ch]

# tempo per phrase
tag = {'slow': 1.085, 'mid': 1.12, 'fast': 1.15}
raw = np.array([tag[T['pace']] for T in TEXT])
dur = np.array([e - s for s, e in oc])
# scale so that total speech time == orig speech / 1.12
k = (dur / TEMPO).sum() / (dur / raw).sum()
tempos = raw / k
print('tempo range %.3f–%.3f, weighted mean %.4f' % (tempos.min(), tempos.max(), dur.sum() / (dur / tempos).sum()))

# cut points: middle of each gap
cuts = [0] + [int((oc[i][1] + oc[i + 1][0]) / 2 * sr) for i in range(len(oc) - 1)] + [len(x)]
tmp = f'{W}/_seg'; os.makedirs(tmp, exist_ok=True)
segs, new_chunks, t0 = [], [], 0.0
for i in range(len(oc)):
    a, b = cuts[i], cuts[i + 1]
    seg = x[a:b]
    sf.write(f'{tmp}/i.wav', seg, sr, subtype='FLOAT')
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', f'{tmp}/i.wav', '-af',
                    f'rubberband=tempo={tempos[i]:.5f}:pitch=1:formant=preserved:pitchq=quality:transients=mixed',
                    '-c:a', 'pcm_f32le', f'{tmp}/o.wav'], check=True)
    y, _ = sf.read(f'{tmp}/o.wav', dtype='float32')
    # speech position inside this segment, scaled by the segment's own stretch
    f = len(y) / max(1, len(seg))
    s_in, e_in = (oc[i][0] * sr - a) * f / sr, (oc[i][1] * sr - a) * f / sr
    new_chunks.append({'s': t0 + s_in, 'e': t0 + e_in})
    segs.append(y); t0 += len(y) / sr

# join with tiny crossfades at the cut points (all inside silence)
XF = int(0.008 * sr)
def join(A, B):
    q = np.linspace(0, np.pi / 2, XF, dtype='float32')
    return np.concatenate([A[:-XF], A[-XF:] * np.cos(q) + B[:XF] * np.sin(q), B[XF:]])
y = segs[0]; shift = 0
for i in range(1, len(segs)):
    y = join(y, segs[i]); shift += XF
    new_chunks[i]['s'] -= shift / sr; new_chunks[i]['e'] -= shift / sr
sf.write(f'{W}/_stretched.wav', y, sr, subtype='FLOAT')
json.dump(new_chunks, open(f'{W}/_stretched_chunks.json', 'w'), indent=1)

# pause plan with seeded jitter
rng = np.random.default_rng(7)
gaps = []
for i, T in enumerate(TEXT[:-1]):
    g = T['gap']
    if g is None: gaps.append(None); continue
    j = rng.uniform(-0.018, 0.018) if g < 0.4 else rng.uniform(-0.03, 0.03)
    gaps.append(round(g + j, 3))
json.dump({'gaps': gaps}, open(f'{W}/_plan.json', 'w'), indent=1)
print('gaps:', gaps)
