#!/usr/bin/env python3
"""polish_voice.py — يحوّل تعليقاً صوتياً مولّداً (ElevenLabs وغيره) لصوت أقرب للبشري.

الخطوات: كشف الوقفات ← تسريع كل عبارة بنبرة ثابتة وبسرعة متفاوتة (المتوسط = الهدف)
← إعادة ضبط كل وقفة بطول مختلف (القصير يقصر والطويل يبقى أطول) ← صوت غرفة خفيف ← معايرة LUFS.
الكلام نفسه ما ينقص منه عيّنة: القص كله داخل السكتات.

  python3 polish_voice.py in.mp3 out_dir [--tempo 1.12] [--lufs -14] [--seed 7]
         [--gap-overrides ov.json] [--no-room-tone] [--thr-db -42]

ov.json: {"3": 0.45, "9": 0.40}  ← رقم الوقفة (من 0، بترتيب التقرير) : طولها بالثواني
المخرجات: out_dir/voice_final.wav (24-bit) + voice_final.mp3 + report.json
"""
import argparse, json, os, subprocess, sys, tempfile
import numpy as np
import soundfile as sf

SR = 48000
ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('out')
ap.add_argument('--tempo', type=float, default=1.12)
ap.add_argument('--lufs', type=float, default=-14.0)
ap.add_argument('--tp', type=float, default=-1.5)
ap.add_argument('--seed', type=int, default=7)
ap.add_argument('--thr-db', type=float, default=None, help='عتبة الصمت (افتراضي: تلقائي)')
ap.add_argument('--min-sil', type=float, default=0.10)
ap.add_argument('--gap-overrides')
ap.add_argument('--no-room-tone', action='store_true')
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)
rng = np.random.default_rng(a.seed)


def run(*c):
    subprocess.run(c, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


tmp = tempfile.mkdtemp()
run('ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', a.src, '-ac', '1', '-ar', str(SR),
    '-c:a', 'pcm_f32le', f'{tmp}/src.wav')
x, _ = sf.read(f'{tmp}/src.wav', dtype='float32')

# ── 1) كشف عبارات الكلام
hop = int(SR * 0.005); n = len(x) // hop
db = 20 * np.log10(np.sqrt(np.mean(x[:n * hop].reshape(n, hop) ** 2, axis=1)) + 1e-9)
thr = a.thr_db if a.thr_db is not None else max(-55.0, float(np.percentile(db, 8)) + 14)
voiced = db > thr
chunks, i = [], 0
while i < n:
    if not voiced[i]: i += 1; continue
    j = i
    while j < n:
        if voiced[j]: j += 1; continue
        k = j
        while k < n and not voiced[k]: k += 1
        if (k - j) * 0.005 >= a.min_sil or k >= n: break
        j = k
    chunks.append([i * 0.005, j * 0.005]); i = j
chunks = [c for c in chunks if c[1] - c[0] > 0.08]
if len(chunks) < 2: sys.exit('❌ ما لقيت وقفات — جرّب --thr-db أعلى (مثلاً -38)')
orig_gaps = [chunks[i + 1][0] - chunks[i][1] for i in range(len(chunks) - 1)]

# ── 2) سرعة متفاوتة لكل عبارة، والمتوسط الموزون = الهدف بالضبط
raw = 1 + (a.tempo - 1) * rng.uniform(0.72, 1.28, len(chunks))
dur = np.array([c[1] - c[0] for c in chunks])
tempos = raw * ((dur / raw).sum() * a.tempo / dur.sum())      # المتوسط الموزون بالكلام = الهدف بالضبط
cuts = [0] + [int((chunks[i][1] + chunks[i + 1][0]) / 2 * SR) for i in range(len(chunks) - 1)] + [len(x)]
XF = int(0.008 * SR); q = np.linspace(0, np.pi / 2, XF, dtype='float32')


def xfade(A, B, xf):
    qq = np.linspace(0, np.pi / 2, xf, dtype='float32')
    return np.concatenate([A[:-xf], A[-xf:] * np.cos(qq) + B[:xf] * np.sin(qq), B[xf:]])


segs, st_chunks, pos = [], [], 0.0
for i, c in enumerate(chunks):
    s0, s1 = cuts[i], cuts[i + 1]
    sf.write(f'{tmp}/i.wav', x[s0:s1], SR, subtype='FLOAT')
    run('ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', f'{tmp}/i.wav', '-af',
        f'rubberband=tempo={tempos[i]:.5f}:pitch=1:formant=preserved:pitchq=quality:transients=mixed',
        '-c:a', 'pcm_f32le', f'{tmp}/o.wav')
    y, _ = sf.read(f'{tmp}/o.wav', dtype='float32')
    f = len(y) / max(1, s1 - s0)
    st_chunks.append([pos + (c[0] * SR - s0) * f / SR, pos + (c[1] * SR - s0) * f / SR])
    segs.append(y); pos += len(y) / SR
y = segs[0]; shift = 0
for i in range(1, len(segs)):
    y = xfade(y, segs[i], XF); shift += XF
    st_chunks[i][0] -= shift / SR; st_chunks[i][1] -= shift / SR

# ── 3) أطوال الوقفات: القصير يقصر، والطويل (لحظة درامية) يبقى أطول
ov = {int(k_): float(v) for k_, v in json.load(open(a.gap_overrides)).items()} if a.gap_overrides else {}
targets = []
for gi, g in enumerate(orig_gaps):
    if gi in ov: targets.append(ov[gi]); continue
    if g < 0.35: lo, hi = 0.20, 0.26
    elif g < 0.55: lo, hi = 0.24, 0.30
    elif g < 0.80: lo, hi = 0.30, 0.40
    else: lo, hi = 0.40, 0.50
    targets.append(float(rng.uniform(lo, hi)))

HEAD, TAIL = 0.07, 0.05
keep, cur = [], 0
for gi in range(len(st_chunks) - 1):
    e, ns = int(st_chunks[gi][1] * SR), int(st_chunks[gi + 1][0] * SR)
    g = (ns - e) / SR; tgt = targets[gi]
    if g - tgt <= 0.02: targets[gi] = round(g, 3); continue            # ما نطوّل أبداً
    h = min(HEAD, tgt * 0.55); tl = min(TAIL, tgt - h)
    a_end, b_start = e + int(h * SR), ns - int(tl * SR)
    room = int((tgt - h - tl) * SR); m0 = max(a_end, (a_end + b_start) // 2 - room // 2 - XF)
    keep += [(cur, a_end), (m0, m0 + room + 2 * XF)]; cur = b_start
keep.append((cur, len(y)))
out, mapping = np.zeros(0, 'float32'), []
for s0, s1 in keep:
    seg = y[s0:s1]
    if len(out) >= XF and len(seg) >= XF:
        d = len(out) - XF; out = xfade(out, seg, XF)
    else: d = len(out); out = np.concatenate([out, seg])
    mapping.append((s0, s1, d))


def remap(t):
    s = int(t * SR)
    for s0, s1, d in mapping:
        if s0 <= s < s1: return (d + s - s0) / SR
    return len(out) / SR


final_chunks = [[round(remap(c[0]), 3), round(remap(c[1] - 1e-4), 3)] for c in st_chunks]
sf.write(f'{tmp}/paced.wav', out, SR, subtype='FLOAT')

# ── 4) صوت غرفة خفيف + معايرة LUFS (ممرّين، خطي)
D = len(out) / SR
if a.no_room_tone:
    run('ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', f'{tmp}/paced.wav', '-af', 'highpass=f=60',
        '-c:a', 'pcm_f32le', f'{tmp}/toned.wav')
else:
    run('ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', f'{tmp}/paced.wav', '-f', 'lavfi', '-i',
        f'anoisesrc=color=pink:amplitude=0.0016:seed={a.seed}:sample_rate={SR}:duration={D}',
        '-filter_complex', '[1]highpass=f=90,lowpass=f=5200[n];[0][n]amix=inputs=2:normalize=0:duration=first,'
        'highpass=f=60,equalizer=f=220:t=q:w=1:g=1.2,equalizer=f=7500:t=q:w=2:g=-1.5[a]',
        '-map', '[a]', '-c:a', 'pcm_f32le', f'{tmp}/toned.wav')
p = subprocess.run(['ffmpeg', '-hide_banner', '-i', f'{tmp}/toned.wav', '-af',
                    f'loudnorm=I={a.lufs}:TP={a.tp}:LRA=11:print_format=json', '-f', 'null', '-'],
                   capture_output=True, text=True).stderr
m = json.loads(p[p.rindex('{'):p.rindex('}') + 1])
run('ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', f'{tmp}/toned.wav', '-af',
    f'loudnorm=I={a.lufs}:TP={a.tp}:LRA=11:measured_I={m["input_i"]}:measured_TP={m["input_tp"]}:'
    f'measured_LRA={m["input_lra"]}:measured_thresh={m["input_thresh"]}:offset={m["target_offset"]}:linear=true,'
    f'aresample={SR}', '-c:a', 'pcm_s24le', f'{a.out}/voice_final.wav')
run('ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', f'{a.out}/voice_final.wav', '-c:a', 'libmp3lame',
    '-b:a', '256k', f'{a.out}/voice_final.mp3')

rep = {'src_duration': round(len(x) / SR, 2), 'final_duration': round(D, 2), 'tempo_target': a.tempo,
       'tempo_range': [round(float(tempos.min()), 3), round(float(tempos.max()), 3)],
       'tempo_weighted_mean': round(float(dur.sum() / (dur / tempos).sum()), 4),
       'phrases': len(chunks), 'orig_gaps': [round(g, 2) for g in orig_gaps],
       'target_gaps': [round(g, 2) for g in targets], 'chunks': final_chunks}
json.dump(rep, open(f'{a.out}/report.json', 'w'), indent=1)
print(f"{rep['src_duration']}s → {rep['final_duration']}s · {len(chunks)} عبارة · سرعة {rep['tempo_range'][0]}–{rep['tempo_range'][1]} (متوسط {rep['tempo_weighted_mean']})")
print('وقفات الأصل :', rep['orig_gaps']); print('وقفات النتيجة:', rep['target_gaps'])
