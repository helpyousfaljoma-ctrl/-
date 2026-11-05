/* LEAP — «اللي بتقول عليه عادي»  ·  لقطة وحدة في عالم ثاني (2.5D)
   الكاميرا تمشي بعالم عميق بلون الهوية (panel)، والنقطة المرجانية هي البطل من أول فريم لآخر فريم:
   مكتب بالليل ← الغوص في النقطة (iris) ← مدار المهام ← غيرك بعيد (القوس المنقّط) ← قفزة ضوئية للورقة
   ← 3 أسطر بقلم النقطة ← السطر يصير درجة ← السلّم والقفزة (صدى الحركة) ← السلّم يصير شعار LEAP.
   كل شي من t بس (حتمي). */

const W = 1080, H = 1920, F = 1000;

// ── ألوان الهوية (tokens.json — الثيم الداكن / البوستات على panel)
const C = {
  panel: '#0C3B3A', deep: '#082E2D', s200: '#103837', tint: '#1D5250', line: '#1F4846',
  mist: '#EEF4F3', muted: '#B7CFCB', growth: '#6FC3B3', coral: '#F08A7C', coralStrong: '#A93A2B', inkLight: '#0C3B3A',
};

// ── مسار الكاميرا [t, [x, y, z]]
const CAM = [
  [0.00, [0, 30, -1060]],
  [8.70, [0, 10, -860], 'sineInOut'],
  [9.05, [0, 10, -860]],
  // iris → عالم المدار (A2: z=3000)
  [9.06, [0, -50, 1720]],
  [12.6, [0, -40, 1830], 'sineInOut'],
  [17.6, [0, -30, 1900], 'sineInOut'],
  [21.9, [0, -30, 1950], 'sineInOut'],
  // «وغيرك»: سحبة للخلف تكشف الثاني
  [23.40, [-640, -170, 700], 'expoInOut'],
  [23.85, [-660, -175, 680], 'sineOut'],
  // قفزة ضوئية للورقة (A4: z=9000)
  [24.55, [0, 0, 7860], 'expoInOut'],
  [30.10, [0, 0, 7990], 'sineInOut'],
  [30.60, [0, 10, 8060], 'expoOut'],
  [33.00, [0, 10, 8040], 'sineInOut'],
  [34.70, [40, 40, 7930], 'sineInOut'],
  [36.70, [30, 20, 7960], 'sineInOut'],
  [37.30, [60, -40, 7980], 'expoOut'],
  [39.90, [0, -10, 7960], 'sineInOut'],
  [40.60, [0, 0, 8000], 'expoInOut'],
  [45.20, [0, 0, 8070], 'sineInOut'],
];

MOTION.scene({
  id: 's1', start: 0, end: 45.1,
  blur: [[23.30, 23.48], [23.86, 24.62], [36.70, 37.32]],

  setup(ctx) {
    const r = ctx.rng('dust');
    this.dust = [];
    for (let i = 0; i < 420; i++) {
      const z = r.range(-1400, 11500);
      this.dust.push({ x: r.range(-2600, 2600), y: r.range(-3200, 3200), z, s: r.range(0.8, 2.6), a: r.range(0.25, 0.85), ph: r.range(0, 6.283), mist: r() < 0.82 });
    }
    // زملا الزوم (A1): 6 مربعات
    this.tiles = [0, 1, 2, 3, 4, 5].map(i => ({ c: i % 3, rw: Math.floor(i / 3), leave: 1.86 + [0.05, 0.32, 0.14, 0.44, 0.22, 0.56][i], dx: r.range(-1, 1), dz: r.range(900, 2200) }));
    this.o = document.createElement('canvas');
  },

  draw(t, lt, ctx) {
    const { X, E, at, prog, kf, clamp, lerp } = ctx;
    const ws = (l, i) => ctx.wordTime(l, i).s;
    const span = l => ctx.lineSpan(l);

    // ── الكاميرا + تنفّس خفيف (هاند هيلد ناعم)
    const cam = (tt) => {
      const c = kf(tt, CAM);
      const n = 1 - at(tt, 23.86, 24.1) * (1 - at(tt, 24.5, 24.9));     // يثبت بالقفزة الضوئية
      return [c[0] + 7 * ctx.noise1(tt * 0.35, 1) * n, c[1] + 6 * ctx.noise1(tt * 0.3, 2) * n, c[2]];
    };
    const K = cam(t), Kp = cam(t - 1 / 60);
    const proj = (x, y, z, k = K) => { const d = z - k[2]; if (d < 30) return null; const s = F / d; return { x: W / 2 + (x - k[0]) * s, y: H / 2 + (y - k[1]) * s, s, d }; };

    // ── أدوات رسم
    const rr = (Y, x, y, w, h, rad, fill) => { Y.fillStyle = fill; Y.beginPath(); Y.roundRect(x - w / 2, y - h / 2, w, h, rad); Y.fill(); };
    const dot = (Y, x, y, rad, col, a = 1) => { if (rad <= 0 || a <= 0) return; Y.globalAlpha = a; Y.fillStyle = col; Y.beginPath(); Y.arc(x, y, rad, 0, 6.2832); Y.fill(); Y.globalAlpha = 1; };
    const qpt = (p0, p1, p2, k) => [(1 - k) * (1 - k) * p0[0] + 2 * (1 - k) * k * p1[0] + k * k * p2[0], (1 - k) * (1 - k) * p0[1] + 2 * (1 - k) * k * p1[1] + k * k * p2[1]];
    // قوس منقّط (توقيع الهوية: نقطة كل 11 وحدة)
    const dottedArc = (Y, p0, p1, p2, k, gap, rad, col, a = 1) => {
      let len = 0, pv = p0; for (let i = 1; i <= 60; i++) { const q = qpt(p0, p1, p2, i / 60); len += Math.hypot(q[0] - pv[0], q[1] - pv[1]); pv = q; }
      const n = Math.floor(len / gap);
      for (let i = 0; i <= n; i++) { const u = i / n; if (u > k) break; const q = qpt(p0, p1, p2, u); const pop = clamp((k - u) * n / 2.2, 0, 1); dot(Y, q[0], q[1], rad * (0.4 + 0.6 * pop), col, a * pop); }
    };

    // ── الكلام على الشاشة: كل كلمة تطلع بتوقيتها، والجملة تقعد بعد صوتها 0.45 وتطلع بهدوء 0.4
    const say = (Y, l, o) => {
      const sp = span(l), out = (o.out ?? sp.e + 0.45), n = o.upto || ctx.wordsOf(l).length;
      if (t < sp.s - 0.6 || t > out + 0.05) return;
      const fo = 1 - at(t, out - 0.4, out, 'sineInOut');
      const lead = o.lead || 0, words = sp.text.split(' ');
      const parts = lead ? [[0, lead], [lead, n]] : [[0, n]];
      let y = o.y;
      parts.forEach(([a, b], pi) => {
        const small = lead && pi === 0 && !o.leadBig;
        const size = (lead && pi === 0) ? (o.leadSize || 50) : o.size;
        const str = words.slice(a, b).join(' ');
        const L = ctx.text.layout(Y, str, { family: small ? 'body' : 'display', weight: small ? 500 : 700, size, maxWidth: o.maxWidth || 900, lineHeight: small ? 1.5 : 1.38 });
        Y.save(); Y.globalAlpha = fo;
        ctx.text.drawLayout(Y, L, 540, y, { align: 'center', perWord: (i) => {
          const wi = a + i, w0 = ws(l, wi), k = at(t, w0 - 0.07, w0 + 0.30, 'cubicOut');
          const dim = o.reveal ? 0.16 * at(t, ws(l, 0) - 0.3, ws(l, 0)) : 0;       // scrollReveal: الجملة باهتة وكل كلمة تصحى
          const al = Math.max(dim, k);
          if (al <= 0.002) return { skip: true };
          const col = (o.accent && o.accent[wi]) || (small ? C.muted : C.mist);
          return { alpha: al, dy: (1 - k) * size * 0.42 - (1 - fo) * 26, scale: 0.965 + 0.035 * k, clipUp: o.reveal ? undefined : 1, color: k > 0.5 ? col : (small ? C.muted : C.mist) };
        } });
        Y.restore();
        y += (lead && pi === 0) ? L.height - L.size + L.size * 0.5 + o.size * 1.02 : L.height;
      });
    };

    // ════════════════════════════════════════ العالم
    const world = (Y, k) => {
      Y.fillStyle = C.panel; Y.fillRect(0, 0, W, H);

      // ── غبار عميق (يمتد خطوط لما الكاميرا تسرع)
      const kp = [Kp[0] + (k[0] - K[0]), Kp[1] + (k[1] - K[1]), Kp[2] + (k[2] - K[2])];
      const v = Math.abs(k[2] - kp[2]);
      Y.lineCap = 'round';
      for (const p of this.dust) {
        const a = proj(p.x, p.y, p.z, k); if (!a || a.d > 7000) continue;
        const fade = clamp((7000 - a.d) / 2500, 0, 1) * clamp((a.d - 60) / 400, 0, 1);
        const tw = 0.75 + 0.25 * Math.sin(t * 1.3 + p.ph);
        const rad = Math.max(0.7, p.s * a.s * 2.2);
        const al = p.a * fade * tw * 0.8;
        if (al < 0.01 || a.x < -60 || a.x > W + 60 || a.y < -60 || a.y > H + 60) continue;
        if (v > 25) {
          const b = proj(p.x, p.y, p.z, kp);
          if (b) { Y.globalAlpha = al; Y.strokeStyle = p.mist ? C.mist : C.growth; Y.lineWidth = rad * 1.6; Y.beginPath(); Y.moveTo(b.x, b.y); Y.lineTo(a.x, a.y); Y.stroke(); Y.globalAlpha = 1; continue; }
        }
        dot(Y, a.x, a.y, rad, p.mist ? C.mist : C.growth, al);
      }

      // ═══ A1 — المكتب بالليل (z ≈ 0)
      if (k[2] < 0) {
        const S = proj(0, -60, 0, k);
        if (S) {
          const s = S.s, sw = 600 * s, sh = 380 * s;
          // ظل الشاشة على الفراغ (كتلة)
          rr(Y, S.x, S.y + 222 * s, 150 * s, 50 * s, 10 * s, C.tint);
          rr(Y, S.x, S.y + 252 * s, 300 * s, 14 * s, 7 * s, C.tint);
          rr(Y, S.x, S.y, sw + 30 * s, sh + 30 * s, 26 * s, C.tint);
          // الشاشة منورة: تومض شوي على «منورة»
          const glow = 0.92 + 0.08 * Math.sin(t * 2.1) * (1 - at(t, 3.4, 3.9)) + 0.08 * at(t, 3.5, 3.75) * (1 - at(t, 3.75, 4.3));
          Y.globalAlpha = clamp(glow, 0, 1); rr(Y, S.x, S.y, sw, sh, 16 * s, C.mist); Y.globalAlpha = 1;
          // مربعات الزوم (3×2)
          const tw = 176 * s, th = 150 * s;
          this.tiles.forEach(T => {
            const cx = S.x + (T.c - 1) * (tw + 12 * s), cy = S.y + (T.rw - 0.5) * (th + 12 * s) - 4 * s;
            rr(Y, cx, cy, tw, th, 10 * s, '#DCE7E5');
            const g = prog(t, T.leave, T.leave + 1.6), e = E.cubicIn(g);
            if (g < 1) {
              // الزميل يطلع من المربع ويطير بعيد بالفراغ
              const P0 = proj((cx - S.x) / s + T.dx * 380 * e, (cy - S.y) / s - 60 - 900 * e, 0 + T.dz * e, k);
              if (P0) { dot(Y, P0.x, P0.y, 34 * P0.s, C.inkLight, 1 - E.cubicIn(clamp(g * 1.3, 0, 1)) * 0.0 - g * 0.6); rr(Y, P0.x, P0.y + 56 * P0.s, 74 * P0.s, 26 * P0.s, 13 * P0.s, g > 0 ? 'rgba(12,59,58,' + (0.55 * (1 - g)) + ')' : 'rgba(12,59,58,.55)'); }
            }
            // مربع فاضي: علامة «غادر» خفيفة
            if (g > 0.15) { Y.globalAlpha = 0.5 * at(t, T.leave + 0.3, T.leave + 0.8); rr(Y, cx, cy, 46 * s, 8 * s, 4 * s, '#BCD0CC'); Y.globalAlpha = 1; }
          });
          // شريط تحكم الزوم
          rr(Y, S.x, S.y + sh / 2 - 26 * s, 210 * s, 26 * s, 13 * s, '#CFE0DD');
          // أنت: النقطة المرجانية قدّام الشاشة على درجة منخفضة
          const D = proj(0, 330, -60, k);
          if (D) {
            rr(Y, D.x, D.y + 40 * D.s, 150 * D.s, 22 * D.s, 11 * D.s, C.tint);
            const breathe = 1 + 0.035 * Math.sin(t * 2.2);
            const dim = 1 - 0.22 * at(t, 8.0, 8.6) * (1 - at(t, 8.85, 9.0));    // «ما فيش حاجة مميزة» تطفّيه شوي
            const lift = 26 * E.cubicOut(at(t, 8.85, 9.05));
            this.dotA1 = [D.x, D.y - lift * D.s, 26 * D.s * breathe];
            dot(Y, D.x, D.y - lift * D.s, 26 * D.s * breathe * dim, C.coral);
            // «في دماغك سؤال»: خيط منقّط يطلع من النقطة لفوق
            const q = at(t, 4.25, 5.1, 'sineInOut') * (1 - at(t, 8.4, 8.9));
            if (q > 0) dottedArc(Y, [D.x, D.y - 40 * D.s], [D.x + 120, D.y - 330], [D.x + 20, S.y - sh / 2 - 60 * s], q, 24, 4.2, C.mist, 0.75);
          }
        }
      }

      // ═══ A2 — مدار المهام (z = 3000)
      const A2 = { x: 0, y: 140, z: 3000 };
      if (k[2] > 600 && k[2] < 6500) {
        const spin = 0.22 * t + 1.25 * E.cubicInOut(prog(t, 16.2, 17.9)) + 0.5 * E.sineInOut(prog(t, 17.9, 21.8));   // «من غير ما تفكر»: يلف بسرعة لحاله
        const grey = at(t, 18.75, 19.4, 'sineInOut') * (1 - at(t, 22.0, 22.8));
        const ringsIn = at(t, 9.25, 10.3, 'expoOut');
        const tilt = 0.40;
        // 3 مدارات منقّطة
        [[280, 24], [440, 28], [610, 32]].forEach(([R, gap], ri) => {
          const n = Math.floor(R * 6.283 / gap);
          for (let i = 0; i < n; i++) {
            const th = i / n * 6.283 + spin * (ri % 2 ? -0.35 : 0.45) + ri;
            const P0 = proj(A2.x + R * ringsIn * Math.cos(th), A2.y + R * ringsIn * Math.sin(th) * tilt, A2.z + R * ringsIn * Math.sin(th), k);
            if (P0) dot(Y, P0.x, P0.y, 3.4 * P0.s * 2.6, C.mist, (0.22 + 0.25 * (Math.sin(th) + 1) / 2) * ringsIn);
          }
        });
        // الكروت: تطير من العمق لمكانها بالمدار
        const tasks = [['ترتيب ملف', ws('l6', 0)], ['صياغة رسالة', ws('l6', 2)], ['حل مشكلة صغيرة', ws('l6', 4)]];
        const items = tasks.map(([txt, s0], i) => {
          const th = spin + i * 2.094 - 1.2;
          const kin = at(t, s0 - 0.18, s0 + 0.55, 'expoOut');
          const R = 440;
          const ox = A2.x + R * Math.cos(th), oy = A2.y + R * Math.sin(th) * tilt - 30, oz = A2.z + R * Math.sin(th);
          return { txt, i, kin, x: lerp(ox * 0.3, ox, kin), y: lerp(oy - 500, oy, kin), z: lerp(oz + 4200, oz, kin) };
        });
        // صدى الحركة (motionEcho): نسخ شبح متأخرة وقت ما يلف بسرعة
        const echo = at(t, 16.3, 16.7) * (1 - at(t, 17.7, 18.3));
        const drawCard = (it, P0, a, ghost) => {
          const s = P0.s, w = (it.txt.length * 33 + 110) * s, h = 128 * s;
          Y.globalAlpha = a;
          rr(Y, P0.x, P0.y, w, h, 64 * s, ghost ? C.growth : (grey > 0.5 ? C.s200 : C.tint));
          if (!ghost) {
            if (grey > 0) { Y.globalAlpha = a * grey; Y.strokeStyle = C.line; Y.lineWidth = 3 * s; Y.beginPath(); Y.roundRect(P0.x - w / 2, P0.y - h / 2, w, h, 64 * s); Y.stroke(); Y.globalAlpha = a; }
            ctx.text(Y, it.txt, P0.x, P0.y + 19 * s, { family: 'body', weight: 600, size: 56 * s, color: grey > 0.5 ? C.muted : C.mist, align: 'center', alpha: a * (1 - 0.45 * grey) });
          }
          Y.globalAlpha = 1;
        };
        const order = [];
        items.forEach(it => { if (it.kin <= 0) return; order.push(it); });
        // النقطة (أنت) بالنص
        const Dp = proj(A2.x, A2.y, A2.z, k);
        const sorted = order.slice().sort((a, b) => b.z - a.z);
        const behind = sorted.filter(it => it.z > A2.z), front = sorted.filter(it => it.z <= A2.z);
        const drawItems = list => list.forEach(it => {
          if (echo > 0.01) for (let g = 4; g >= 1; g--) {
            const th = spin - g * 0.075 * 1.25 * 3 + it.i * 2.094 - 1.2, R = 440;
            const Pg = proj(A2.x + R * Math.cos(th), A2.y + R * Math.sin(th) * tilt - 30, A2.z + R * Math.sin(th), k);
            if (Pg) drawCard(it, Pg, echo * 0.16 * (5 - g) / 4, true);
          }
          const P0 = proj(it.x, it.y, it.z, k); if (P0) drawCard(it, P0, clamp(it.kin * 1.4, 0, 1), false);
        });
        drawItems(behind);
        if (Dp) {
          const grow = 1 + 0.06 * Math.sin(t * 2.4);
          this.dotA2 = [Dp.x, Dp.y, 30 * Dp.s];
          dot(Y, Dp.x, Dp.y, 30 * Dp.s * grow * (1 - 0.3 * grey), C.coral);
        }
        drawItems(front);

        // ═══ A3 — «وغيرك»: واحد ثاني بعيد بالظلمة
        const O = { x: -1750, y: -420, z: 3700 };
        const Op = proj(O.x, O.y, O.z, k);
        const seen = at(t, 22.2, 22.9);
        if (Op && seen > 0 && Dp) {
          rr(Y, Op.x, Op.y + 60 * Op.s, 170 * Op.s, 24 * Op.s, 12 * Op.s, C.tint);
          const lit = at(t, 23.2, 23.55, 'expoOut');
          dot(Y, Op.x, Op.y, 30 * Op.s, lit > 0.5 ? C.growth : C.muted, seen * (0.55 + 0.45 * lit));
          // نبضة لما يوصله
          const pr = prog(t, 23.25, 24.0); if (pr > 0 && pr < 1) { Y.globalAlpha = (1 - pr) * 0.7; Y.strokeStyle = C.growth; Y.lineWidth = 4; Y.beginPath(); Y.arc(Op.x, Op.y, (30 + 90 * E.cubicOut(pr)) * Op.s * 1.6, 0, 6.283); Y.stroke(); Y.globalAlpha = 1; }
          const ka = at(t, 22.55, 23.25, 'sineInOut');
          dottedArc(Y, [Dp.x, Dp.y - 36 * Dp.s], [(Dp.x + Op.x) / 2, Math.min(Dp.y, Op.y) - 300], [Op.x, Op.y - 36 * Op.s], ka, 20, 4.6, C.mist, seen);
        }
      }

      // ═══ A4 — الورقة (z = 9000) + A5 السلّم + الشعار
      if (k[2] > 5000) {
        const PZ = 9000;
        const flip = at(t, ws('l11', 1) - 0.25, ws('l11', 1) + 0.55, 'expoOut');            // «خد ورقة»
        const paperOut = at(t, 33.55, 34.5, 'cubicIn');                                     // الورقة تطيح وتختفي
        const rowY = [-210, -10, 190];
        const rowTxt = ['ترتيب ملف', 'صياغة رسالة', 'حل مشكلة صغيرة'];
        const rowT = [[26.35, 27.2], [27.35, 28.35], [28.6, 29.55]];
        const lifted = at(t, 33.2, 34.0, 'expoInOut');                                      // «دي» السطر يطلع من الورقة
        const pc = proj(0, 90 + 900 * paperOut, PZ + 300 * paperOut, k);
        if (pc && flip > 0 && paperOut < 1) {
          const s = pc.s;
          Y.save(); Y.translate(pc.x, pc.y); Y.rotate((-0.035 + 0.25 * paperOut) * 1 + (1 - flip) * 0.2); Y.scale(Math.max(0.001, flip), 1);
          Y.globalAlpha = 1 - paperOut;
          rr(Y, 0, 0, 640 * s, 840 * s, 14 * s, C.mist);
          // سطور خفيفة بالورقة
          Y.globalAlpha = (1 - paperOut) * 0.5; for (let i = 0; i < 9; i++) rr(Y, 0, (-330 + i * 84) * s, 520 * s, 2 * s, 1, '#BCD0CC');
          Y.globalAlpha = 1 - paperOut;
          rowY.forEach((ry, i) => {
            const n0 = at(t, ws('l11', 5) - 0.1 + i * 0.14, ws('l11', 5) + 0.3 + i * 0.14, 'expoOut');            // 1 2 3 مع «3»
            if (n0 > 0) { Y.globalAlpha = (1 - paperOut) * n0; ctx.text(Y, String(i + 1), 236 * s, (ry + 18) * s, { family: 'display', weight: 700, size: 54 * s, color: '#1F6B63', align: 'center' }); Y.globalAlpha = 1 - paperOut; }
            if (i === 2 && lifted > 0) return;   // السطر الثالث يتحرك لحاله
            const w = at(t, rowT[i][0], rowT[i][1], 'sineInOut');
            if (w > 0) {
              Y.save(); const tw = ctx.text.layout(Y, rowTxt[i], { family: 'body', weight: 600, size: 50 * s }).width;
              const x0 = 190 * s; Y.beginPath(); Y.rect(x0 - tw * w, (ry - 50) * s, tw * w + 4, 90 * s); Y.clip();
              ctx.text(Y, rowTxt[i], x0, (ry + 16) * s, { family: 'body', weight: 600, size: 50 * s, color: C.inkLight, align: 'right' }); Y.restore();
            }
            // «بص»: تمرير على الأسطر
            const sc = at(t, 31.0 + i * 0.42, 31.25 + i * 0.42) * (1 - at(t, 31.5 + i * 0.42, 31.9 + i * 0.42));
            if (sc > 0) { Y.globalAlpha = 0.35 * sc; rr(Y, 0, (ry + 4) * s, 560 * s, 76 * s, 14 * s, '#CFE0DD'); Y.globalAlpha = 1 - paperOut; }
          });
          // دائرة بخط اليد حول الثالث على «تفكير؟»
          const cir = at(t, ws('l13', 8) - 0.05, ws('l13', 8) + 0.5, 'sineInOut') * (1 - lifted);
          if (cir > 0) {
            const pts = []; for (let i = 0; i <= 48; i++) { const a = -1.4 + i / 48 * 6.9; pts.push([(-20 + 300 * Math.cos(a)) * s, (rowY[2] + 4 + 64 * Math.sin(a) + 4 * Math.sin(a * 3)) * s]); }
            ctx.drawPath(Y, pts, cir, { width: 6 * s, color: C.coralStrong, cap: 'round', smooth: true });
          }
          Y.restore();
        }
        // القلم = النقطة المرجانية تكتب (RTL)
        const penOn = at(t, 26.1, 26.35) * (1 - at(t, 29.6, 29.9));
        let pen = null;
        for (let i = 0; i < 3; i++) if (t >= rowT[i][0] - 0.3 && t < rowT[i][1] + 0.35) {
          const w = at(t, rowT[i][0], rowT[i][1], 'sineInOut'); const L = rowTxt[i].length * 27;
          pen = [190 - L * w, rowY[i] + 10 + 8 * Math.sin(t * 26)];
          if (t > rowT[i][1]) { const u = prog(t, rowT[i][1], rowT[i][1] + 0.35); const nx = i < 2 ? [190, rowY[i + 1] + 10] : [190 - L, rowY[i] + 10]; pen = [lerp(190 - L, nx[0], E.cubicInOut(u)), lerp(rowY[i] + 10, nx[1], E.cubicInOut(u)) - 40 * Math.sin(u * 3.14)]; }
        }

        // ═══ A5 — السلّم (نفس مكان الورقة)
        const st = at(t, ws('l15', 0) - 0.1, ws('l15', 0) + 0.7, 'expoOut');
        const merge = at(t, 40.0, 40.75, 'expoInOut');                                      // السلّم يصير الشعار
        const u = 3.6, LG = (x, y) => [(x - 100) * u, (y - 100) * u - 200];                // إحداثيات الشعار (viewBox 28 48 144 104)
        const steps = [
          { x: -330, top: 300, col: C.tint }, { x: -110, top: 150, col: C.growth },
          { x: 110, top: 0, col: C.mist }, { x: 330, top: -150, col: C.coral },
        ];
        const stepGeom = (i) => {
          const S0 = steps[i], rise = E.cubicOut(clamp((st * 1.6 - i * 0.18), 0, 1));
          let x = S0.x, top = S0.top + (1 - rise) * 700, w = 200, h = 560 - S0.top, a = rise;
          if (merge > 0) {
            if (i === 0) { const [lx, ly] = LG(62, 134); x = lerp(x, lx, merge); top = lerp(top, ly - 6 * u, merge); w = lerp(w, 48 * u, merge); h = lerp(h, 12 * u, merge); }
            else if (i === 3) { const [lx, ly] = LG(138, 98); x = lerp(x, lx, merge); top = lerp(top, ly - 6 * u, merge); w = lerp(w, 48 * u, merge); h = lerp(h, 12 * u, merge); }
            else { a *= 1 - merge; top += 400 * merge; }
          }
          return { x, top, w, h, a, col: merge > 0.5 ? C.mist : S0.col };
        };
        if (st > 0) {
          for (let i = 0; i < 4; i++) {
            const g = stepGeom(i); if (g.a <= 0) continue;
            const P0 = proj(g.x, g.top + g.h / 2, PZ, k); if (!P0) continue;
            Y.globalAlpha = g.a; rr(Y, P0.x, P0.y, g.w * P0.s, g.h * P0.s, Math.min(20, g.h / 2) * P0.s, g.col); Y.globalAlpha = 1;
          }
        }
        // السطر الثالث: يطلع من الورقة ويصير الدرجة الأولى
        if (lifted > 0 && st < 1) {
          const tx = lerp(0, -330, lifted), ty = lerp(rowY[2] + 90 + 6, 300 + 30, lifted);
          const P0 = proj(tx, ty, PZ - 260 * Math.sin(lifted * 3.14), k);
          if (P0) {
            const s = P0.s, a = 1 - at(t, 34.9, 35.4);
            Y.globalAlpha = a; rr(Y, P0.x, P0.y, lerp(560, 200, lifted) * s, lerp(76, 60, lifted) * s, 20 * s, lerp(0, 1, lifted) > 0.5 ? C.tint : '#E0EBE9');
            ctx.text(Y, rowTxt[2], P0.x + lerp(190 - 280 + 280, 0, lifted) * s * 0, P0.y + 16 * s, { family: 'body', weight: 600, size: lerp(50, 36, lifted) * s, color: lifted > 0.5 ? C.mist : C.inkLight, align: 'center', alpha: a * (1 - at(t, 34.6, 35.0)) });
            Y.globalAlpha = 1;
          }
        }

        // ── النقطة بالعالم الأخير: قلم ← على السطر ← على الدرجة الأولى ← القفزة ← قمة القوس (الشعار)
        let dp = null, dr = 13;
        if (pen && penOn > 0) { dp = [pen[0], pen[1]]; dr = 12; }
        else if (t >= 29.6 && t < 33.2) { dp = [190 - rowTxt[2].length * 27 - 30, rowY[2] + 10]; dr = 13 + 8 * at(t, 30.1, 30.3) * (1 - at(t, 30.45, 30.9)); }
        else if (t >= 33.2 && t < 35.0) { const q = lifted; dp = [lerp(190 - rowTxt[2].length * 27 - 30, -330, q), lerp(rowY[2] + 10, 300 - 30, q) - 120 * Math.sin(q * 3.14)]; dr = lerp(13, 28, q); }
        let ghosts = [];
        const L0 = ws('l15', 6), J0 = L0 - 0.02, J1 = J0 + 0.62;
        const jumpPos = (tt) => { const q = E.sineInOut(prog(tt, J0, J1)); return qpt([-330, 300 - 30], [0, -560], [330, -150 - 30], q); };
        if (t >= 35.0 && t < 40.0) {
          const crouch = at(t, J0 - 0.25, J0 - 0.02) * (1 - at(t, J0, J0 + 0.06));
          dp = jumpPos(t); dp[1] += 8 * crouch; dr = 28 * (1 - 0.12 * crouch);
          if (t > J0 && t < J1 + 0.25) for (let g = 1; g <= 5; g++) ghosts.push([jumpPos(t - g * 0.045), g]);
          // هبوط: ضغطة + حلقة
          const land = prog(t, J1, J1 + 0.5);
          if (land > 0 && land < 1) { const P0 = proj(330, -150, PZ, k); if (P0) { Y.globalAlpha = (1 - land) * 0.8; Y.strokeStyle = C.coral; Y.lineWidth = 5; Y.beginPath(); Y.ellipse(P0.x, P0.y, (120 + 160 * E.cubicOut(land)) * P0.s, (26 + 30 * E.cubicOut(land)) * P0.s, 0, 0, 6.283); Y.stroke(); Y.globalAlpha = 1; } }
          // القوس المنقّط يرتسم ورا القفزة
          const ka = at(t, J0, J1, 'sineInOut') * (1 - at(t, 39.6, 40.1));
          const A = proj(-330, 300 - 30, PZ, k), B = proj(0, -560, PZ, k), Cc = proj(330, -180, PZ, k);
          if (A && B && Cc && ka > 0) dottedArc(Y, [A.x, A.y], [B.x, B.y], [Cc.x, Cc.y], ka, 30, 5.5, C.mist, 0.7);
        }
        if (t >= 40.0) {
          // الشعار: النقطة ترجع على القوس وتثبت بالقمة
          const q = at(t, 40.15, 40.95, 'expoInOut');
          const p1 = [330, -180], apex = LG(100, 71);
          dp = [lerp(lerp(330, LG(138, 98)[0], merge), apex[0], q), lerp(lerp(-180, LG(138, 98)[1] - 13 * u, merge), apex[1], q) - 90 * Math.sin(q * 3.14)];
          dr = lerp(28, 13 * u, q);
          const A = proj(...LG(62, 120), PZ, k), B = proj(...LG(100, 40), PZ, k), Cc = proj(...LG(138, 84), PZ, k);
          const ka = at(t, 40.35, 41.0, 'sineInOut');
          if (A && B && Cc) dottedArc(Y, [A.x, A.y], [B.x, B.y], [Cc.x, Cc.y], ka, 11 * u * A.s, 2.5 * u * A.s, C.mist, 1);
          // كلمة LEAP ترتسم بخطوطها (من leap-wordmark-dark.svg)
          const wk = at(t, 40.85, 41.9, 'sineInOut');
          if (wk > 0) {
            const W0 = proj(0, 150, PZ, k);
            if (W0) {
              const wu = 2.3 * W0.s; Y.save(); Y.translate(W0.x - 100 * wu, W0.y - 32 * wu); Y.scale(wu, wu);
              const P = ['M8 8V56H40', 'M96 8H64V56H96', 'M64 32H90', 'M112 56L128 8L144 56', 'M118 38H138', 'M160 56V8H178A14 14 0 0 1 178 36H160'];
              P.forEach((d, i) => { const kk = clamp(wk * 6 - i * 0.85, 0, 1); if (kk > 0) ctx.drawPath(Y, d, kk, { width: 8, color: C.mist, cap: 'round' }); });
              Y.restore();
            }
          }
        }
        // رسم الأشباح (صدى الحركة) ثم النقطة
        ghosts.forEach(([g, i]) => { const P0 = proj(g[0], g[1], PZ, k); if (P0) dot(Y, P0.x, P0.y, 28 * P0.s * (1 - i * 0.08), C.coral, 0.32 * (1 - i / 6)); });
        if (dp) { const P0 = proj(dp[0], dp[1], PZ, k); if (P0) dot(Y, P0.x, P0.y, dr * P0.s, C.coral); }
      }
    };

    // ════════════════════════════════════════ الفريم
    const IR = 9.05, IRD = 0.62;          // iris: الغوص في النقطة
    const kA0 = kf(IR - 0.001, CAM), dA = proj(0, 330 - 26, -60, kA0), irisC = [dA.x, dA.y, 26 * dA.s];
    if (t < IR - 0.02 || t > IR + IRD + 0.9) {
      world(X, K);
    } else if (t > IR + IRD) {   // بعد الحلقة: يكمّل الزوم الناعم لين 1
      const kB = cam(t), c = irisC;
      const z = 1.22 - 0.22 * at(t, IR + 0.15, IR + IRD + 0.9, 'expoOut');
      X.save(); X.translate(c[0], c[1]); X.scale(z, z); X.translate(-c[0], -c[1]); world(X, kB); X.restore();
    } else {
      // A = المكتب (الكاميرا الأولى)، B = عالم المدار
      const kA = kf(IR - 0.001, CAM), kB = cam(Math.max(t, IR + 0.01));
      world(X, kA);
      const c = irisC;
      const r = c[2] + 2300 * at(t, IR, IR + IRD, 'expoIn');
      dot(X, c[0], c[1], r, C.coral);
      if (r > 70) {
        X.save(); X.beginPath(); X.arc(c[0], c[1], Math.max(0, r - 70), 0, 6.283); X.clip();
        const z = 1.22 - 0.22 * at(t, IR + 0.15, IR + IRD + 0.9, 'expoOut');
        X.translate(c[0], c[1]); X.scale(z, z); X.translate(-c[0], -c[1]);
        world(X, kB); X.restore();
      }

    }

    // ════════════════════════════════════════ الكلام (منطقة فوق آمنة)
    const TY = 380;
    say(X, 'l1', { y: TY, size: 92 });
    say(X, 'l2', { y: TY, size: 84 });
    say(X, 'l3', { y: TY - 40, size: 120, lead: 3, accent: { 5: C.coral } });
    say(X, 'l4', { y: TY - 40, size: 104, lead: 3, out: 8.98 });
    say(X, 'l5', { y: 300, size: 78, lead: 5, reveal: true, maxWidth: 940 });
    say(X, 'l6', { y: TY, size: 80, out: 16.25 });
    say(X, 'l7', { y: 1420, size: 76, out: 18.0 });
    say(X, 'l8', { y: TY, size: 96, accent: { 4: C.muted } });
    say(X, 'l9', { y: TY - 20, size: 90, accent: { 5: C.coral } });
    say(X, 'l10', { y: 1380, size: 92, accent: { 0: C.growth } });
    say(X, 'l11', { y: 260, size: 64, lead: 0, maxWidth: 940, out: 27.95 });
    say(X, 'l12', { y: 300, size: 80, out: 30.0 });
    say(X, 'l13', { y: 340, size: 74, lead: 1, leadSize: 150, leadBig: true, maxWidth: 960, out: 33.25 });
    say(X, 'l14', { y: 300, size: 88, accent: { 4: C.coral } });
    say(X, 'l15', { y: 300, size: 84, accent: { 3: C.muted, 5: C.growth } });
    say(X, 'l16', { y: 270, size: 96, lead: 2, leadSize: 54, accent: { 5: C.coral } });
    say(X, 'l17', { y: 300, size: 80, upto: 4, out: 45.3 });
    // «احفظ البوست» زر (leap-strong على panel) + «وارجع له بعد ما تنفذ»
    {
      const s0 = ws('l17', 4), k = at(t, s0 - 0.08, s0 + 0.4, 'expoOut');
      if (k > 0) {
        const pulse = 1 + 0.04 * at(t, ws('l17', 5), ws('l17', 5) + 0.12) * (1 - at(t, ws('l17', 5) + 0.12, ws('l17', 5) + 0.4));
        X.save(); X.globalAlpha = k; X.translate(540, 1385 + 30 * (1 - k)); X.scale((0.95 + 0.05 * k) * pulse, (0.95 + 0.05 * k) * pulse);
        X.fillStyle = C.coral; X.beginPath(); X.roundRect(-230, -54, 460, 108, 54); X.fill();
        ctx.text(X, 'احفظ البوست', 0, 18, { family: 'display', weight: 700, size: 54, color: '#0C2F2E', align: 'center' });
        X.restore();
      }
      const s1 = ws('l17', 6), k2 = at(t, s1 - 0.08, s1 + 0.35, 'cubicOut');
      if (k2 > 0) ctx.text(X, 'وارجع له بعد ما تنفذ', 540, 1505 + 20 * (1 - k2), { family: 'body', weight: 500, size: 44, color: C.muted, align: 'center', alpha: k2 });
    }
  },
});
