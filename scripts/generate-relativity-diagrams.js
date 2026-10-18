import { mkdirSync, writeFileSync } from "node:fs";

// Editable vector diagrams. Coordinates are schematic unless an explicit scale is shown.
const directory = new URL("../public/images/relativity/", import.meta.url);
mkdirSync(directory, { recursive: true });
const colors = {
  ink: "#172033",
  muted: "#526078",
  blue: "#2563eb",
  teal: "#0f766e",
  amber: "#b45309",
  red: "#b91c1c",
  line: "#d6dfeb",
};
const escape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
for (const language of ["en", "jp"]) {
  const t = (en, jp) => (language === "jp" ? jp : en);
  const text = (
    x,
    y,
    value,
    size = 22,
    color = colors.ink,
    anchor = "start",
    weight = 400,
  ) =>
    `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-weight="${weight}">${escape(value)}</text>`;
  const rect = (
    x,
    y,
    width,
    height,
    fill = "#f3f6fb",
    stroke = colors.line,
    radius = 16,
  ) =>
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" stroke="${stroke}"/>`;
  const line = (
    x1,
    y1,
    x2,
    y2,
    color = colors.blue,
    width = 3,
    arrow = false,
    dash = false,
  ) =>
    `<path d="M${x1},${y1} L${x2},${y2}" fill="none" stroke="${color}" stroke-width="${width}"${arrow ? ' marker-end="url(#arrow)"' : ""}${dash ? ' stroke-dasharray="7 6"' : ""}/>`;
  const path = (d, color = colors.blue, width = 3, fill = "none") =>
    `<path d="${d}" fill="${fill}" stroke="${color}" stroke-width="${width}"/>`;
  const circle = (x, y, r, fill = colors.blue, stroke = "none") =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`;
  const clock = (x, y, color = colors.blue) =>
    circle(x, y, 30, "white", color) +
    line(x, y, x, y - 19, color) +
    line(x, y, x + 14, y + 8, color);
  const label = (
    x,
    y,
    en,
    jp,
    size = 22,
    color = colors.ink,
    anchor = "start",
  ) => text(x, y, t(en, jp), size, color, anchor);
  function save(name, title, description, body, height = 420) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="${height}" viewBox="0 0 960 ${height}" role="img" aria-labelledby="title description"><title id="title">${escape(title)}</title><desc id="description">${escape(description)}</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="context-stroke"/></marker></defs><rect width="960" height="${height}" rx="18" fill="#ffffff"/><g font-family="Inter, 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif">${text(32, 43, title, 27, colors.ink, "start", 650)}${body}</g></svg>\n`;
    writeFileSync(
      new URL(`${name}${language === "jp" ? "_jp" : ""}.svg`, directory),
      svg,
    );
  }

  {
    let body = label(
      32,
      78,
      "80% c · 1 planet-year per ramp · 4.24 light-years",
      "光速の80%・加速と減速は各1年（惑星側）・4.24光年",
      20,
      colors.muted,
    );
    const phases = [
      [t("Accelerate", "加速"), "0 → 0.8c", "0.824", "1"],
      [t("Cruise", "巡航"), "0.8c", "2.430", "4.05"],
      [t("Brake", "減速"), "0.8c → 0", "0.824", "1"],
    ];
    phases.forEach(([name, speed, ship, planet], i) => {
      const x = 32 + 310 * i;
      body +=
        rect(x, 103, 276, 185) +
        text(x + 20, 137, name, 23, colors.ink, "start", 600) +
        text(x + 20, 177, speed, 26, colors.blue);
      body += text(
        x + 20,
        220,
        `${t("Ship", "船内")}  ${ship} ${t("yr", "年")}`,
        21,
        colors.teal,
      );
      body += text(
        x + 20,
        255,
        `${t("Planet", "惑星側")}  ${planet} ${t("yr", "年")}`,
        21,
      );
      if (i < 2)
        body += line(x + 282, 185, x + 302, 185, colors.muted, 2, true);
    });
    body +=
      label(
        32,
        337,
        "Ship: 4.078 years",
        "船内の合計：4.078年",
        26,
        colors.teal,
      ) +
      label(
        480,
        337,
        "Destination: 6.05 years",
        "目的地の合計：6.05年",
        26,
        colors.blue,
      );
    body += label(
      32,
      383,
      "Constant proper acceleration; phase boxes are not to scale.",
      "固有加速度は一定。各区間の箱の幅は時間や距離の比ではない。",
      18,
      colors.muted,
    );
    save(
      "travel",
      t("One journey, two elapsed times", "同じ旅でも、経過時間は二つ"),
      t(
        "A worked journey showing acceleration, cruise and braking times on the ship and planets.",
        "加速・巡航・減速の各区間について、船内と惑星側の経過時間を比較。",
      ),
      body,
    );
  }

  {
    let body = rect(32, 85, 432, 260) + rect(496, 85, 432, 260);
    body +=
      label(56, 125, "Special relativity", "特殊相対論", 25, colors.blue) +
      label(520, 125, "General relativity", "一般相対論", 25, colors.teal);
    for (let i = 0; i < 5; i++) {
      body +=
        line(70 + i * 85, 155, 70 + i * 85, 265, colors.line, 1) +
        line(70, 155 + i * 27.5, 410, 155 + i * 27.5, colors.line, 1);
      const x = 535 + i * 85;
      body += path(
        `M${x},155 Q${705 + (x - 705) * 0.45},210 ${x},265`,
        colors.line,
        1,
      );
      body += path(
        `M535,${155 + i * 27.5} Q705,${155 + i * 27.5 + 25 * Math.sin(i)} 875,${155 + i * 27.5}`,
        colors.line,
        1,
      );
    }
    body +=
      line(90, 245, 390, 175, colors.blue, 4, true) +
      path("M550,245 Q650,260 720,210 Q800,155 865,170", colors.teal, 4);
    body +=
      label(
        56,
        310,
        "Flat spacetime · changing frames",
        "平坦な時空・基準系の違い",
        20,
      ) +
      label(
        520,
        310,
        "Curvature · clocks and free fall",
        "時空の曲がり・時計と自由落下",
        20,
      );
    body += label(
      32,
      389,
      "Conceptual grids, not literal pictures of spacetime.",
      "格子は概念図。時空そのものの形を描いたものではない。",
      19,
      colors.muted,
    );
    save(
      "overview",
      t("Motion and gravity", "運動と重力"),
      t(
        "Flat and curved conceptual grids distinguish the scope of special and general relativity.",
        "平坦な格子と曲がった概念上の格子で、特殊相対論と一般相対論を区別。",
      ),
      body,
    );
  }

  {
    let body = label(
      32,
      78,
      "Relative speed 0.6c → γ = 1.25",
      "相対速度0.6c → γ = 1.25",
      21,
      colors.muted,
    );
    body += rect(32, 101, 432, 245) + rect(496, 101, 432, 245);
    body += label(
      56,
      138,
      "Time between the same events",
      "同じ二つの出来事の間の時間",
      22,
    );
    body += clock(115, 205, colors.blue) + clock(325, 205, colors.teal);
    body +=
      label(
        115,
        270,
        "Earth: 5 years",
        "地球側：5年",
        23,
        colors.blue,
        "middle",
      ) +
      label(325, 270, "Ship: 4 years", "船内：4年", 23, colors.teal, "middle");
    body += text(248, 321, "Δt = γΔτ", 24, colors.muted, "middle");
    body += label(520, 138, "Length along the motion", "運動方向の長さ", 22);
    body +=
      rect(525, 177, 350, 24, "#dbeafe", colors.blue, 4) +
      rect(525, 260, 280, 24, "#ccfbf1", colors.teal, 4);
    body +=
      label(525, 232, "At rest: 100 m", "静止系：100 m", 22, colors.blue) +
      label(525, 321, "Earth frame: 80 m", "地球の系：80 m", 22, colors.teal);
    body += label(
      32,
      389,
      "Length: both endpoints measured at the same Earth-frame time.",
      "長さは地球の系で両端を同時に測定。手元の時計は普通に進む。",
      18,
      colors.muted,
    );
    save(
      "time-length",
      t("Moving clocks and rulers", "動く時計と定規"),
      t(
        "At 0.6c, four ship years correspond to five Earth years, and a 100 metre proper length contracts to 80 metres.",
        "0.6cでは船内4年が地球側5年に対応し、固有長100 mは地球の系で80 m。",
      ),
      body,
    );
  }

  {
    let body = rect(32, 83, 432, 280) + rect(496, 83, 432, 280);
    body +=
      label(56, 120, "Beacon frame S", "装置の基準系 S", 24, colors.blue) +
      label(
        520,
        120,
        "Ship frame S′ · v = 0.6c",
        "船の基準系 S′・v = 0.6c",
        24,
        colors.teal,
      );
    [0, 480].forEach((offset) => {
      body +=
        line(105 + offset, 309, 105 + offset, 146, colors.muted, 2, true) +
        line(83 + offset, 202, 420 + offset, 202, colors.muted, 2, true) +
        text(111 + offset, 160, t("time", "時刻"), 18, colors.muted) +
        text(410 + offset, 227, "x", 19, colors.muted);
    });
    body += line(105, 202, 315, 202, colors.blue, 2, false, true);
    body += circle(105, 202, 6, colors.blue) + circle(245, 202, 6, colors.blue);
    body +=
      text(133, 182, "A (0, 0)", 20, colors.blue) +
      text(245, 250, "B (0, 1)", 20, colors.blue);
    body +=
      circle(585, 202, 6, colors.teal) +
      circle(760, 307, 6, colors.teal) +
      text(613, 181, "A (0, 0)", 20, colors.teal) +
      text(736, 341, "B (−0.75, 1.25)", 20, colors.teal);
    body +=
      label(
        56,
        336,
        "A and B flash simultaneously.",
        "AとBは同時に発光。",
        20,
      ) + label(520, 255, "B happens earlier.", "Bの発光が先。", 20);
    body += label(
      32,
      400,
      "Coordinates: (years, light-years). Event times, not light arrival times.",
      "座標は（年、光年）。光の受信時刻ではなく、発光自体の時刻。",
      18,
      colors.muted,
    );
    save(
      "simultaneity",
      t(
        "Two frames, different distant “now”",
        "基準系によって違う、遠くの「今」",
      ),
      t(
        "The same two flashes are simultaneous in S but separated by minus 0.75 years in S prime.",
        "同じ二つの発光がSでは同時、S′ではBが0.75年先になる。",
      ),
      body,
    );
  }

  {
    let body =
      path("M250,300 L50,100 L450,100 Z", "none", 0, "#dbeafe") +
      path("M250,300 L50,100 M250,300 L450,100", colors.amber, 3);
    body +=
      line(250, 350, 250, 74, colors.muted, 2, true) +
      line(35, 300, 470, 300, colors.muted, 2, true);
    body +=
      text(270, 90, "cΔt", 20, colors.muted) +
      text(465, 330, "Δx", 20, colors.muted) +
      text(225, 330, "A", 22);
    body +=
      circle(275, 160, 7, colors.blue) +
      circle(390, 160, 7, colors.amber) +
      circle(425, 268, 7, colors.red) +
      text(292, 158, "T", 21, colors.blue) +
      text(405, 156, "L", 21, colors.amber) +
      text(439, 265, "X", 21, colors.red);
    body += text(520, 119, "Δs² = c²Δt² − Δx²", 27);
    body += label(
      520,
      171,
      "T: positive · slower-than-light path",
      "T：正・光速未満の経路で結べる",
      21,
      colors.blue,
    );
    body += label(
      520,
      220,
      "L: zero · light connects the events",
      "L：ゼロ・光で結べる",
      21,
      colors.amber,
    );
    body += label(
      520,
      269,
      "X: negative · no causal signal",
      "X：負・光速以下の信号では結べない",
      21,
      colors.red,
    );
    body += label(
      520,
      324,
      "Signs use the +time convention.",
      "時間の項を正とする符号の約束。",
      19,
      colors.muted,
    );
    body += label(
      32,
      393,
      "Time and position depend on the frame; the interval does not.",
      "時間差と位置の差は基準系で変わるが、時空間隔は変わらない。",
      20,
      colors.muted,
    );
    save(
      "interval",
      t("Spacetime interval and causal reach", "時空間隔と、信号が届く範囲"),
      t(
        "A light cone separates timelike, lightlike and spacelike events relative to event A; transverse separation is zero.",
        "Aから見た光円錐で時間的・光的・空間的な出来事を区別。横方向以外の位置の差はゼロ。",
      ),
      body,
    );
  }

  {
    let body = rect(32, 85, 896, 125) + rect(32, 235, 896, 125);
    body += label(
      56,
      121,
      "Probe launched forward",
      "前方へ探査機を発射",
      23,
      colors.blue,
    );
    body +=
      text(56, 175, t("Ship: 0.6c", "船：0.6c"), 23) +
      line(225, 167, 290, 167, colors.blue, 3, true) +
      label(310, 175, "Probe: 0.6c in ship frame", "探査機：船の系で0.6c", 22) +
      line(630, 167, 695, 167, colors.blue, 3, true) +
      text(715, 175, "0.882c", 29, colors.blue);
    body += label(
      56,
      271,
      "Light emitted forward",
      "前方へ光を放出",
      23,
      colors.teal,
    );
    body +=
      text(56, 325, t("Ship: 0.6c", "船：0.6c"), 23) +
      line(225, 317, 290, 317, colors.teal, 3, true) +
      label(310, 325, "Light: c in ship frame", "光：船の系でc", 22) +
      line(630, 317, 695, 317, colors.teal, 3, true) +
      text(715, 325, "c", 29, colors.teal);
    body += label(
      32,
      401,
      "Results at right are planet-frame speeds. Collinear motion.",
      "右端は惑星側の基準系での速度。同一直線上の運動。",
      18,
      colors.muted,
    );
    save(
      "velocity",
      t("Velocities do not simply add", "速度は単純な足し算にならない"),
      t(
        "A probe's two 0.6c velocities combine to 0.882c, while light remains at c.",
        "0.6c同士の速度の合成は0.882c。光速はcのまま。",
      ),
      body,
    );
  }

  {
    let body = label(
      32,
      80,
      "Massive particle · same invariant mass m",
      "質量のある粒子・不変質量mは同じ",
      20,
      colors.muted,
    );
    const scale = 100;
    [
      [0, 1, "0"],
      [0.6, 1.25, "0.25"],
      [0.8, 5 / 3, "0.667"],
    ].forEach(([speed, gamma, kinetic], i) => {
      const x = 65 + i * 170,
        base = 306;
      body += rect(x, base - scale, 100, scale, "#dbeafe", colors.blue, 0);
      if (gamma > 1)
        body += rect(
          x,
          base - scale * gamma,
          100,
          scale * (gamma - 1),
          "#ccfbf1",
          colors.teal,
          0,
        );
      body +=
        text(
          x + 50,
          base - scale * gamma - 18,
          `${gamma.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")} mc²`,
          20,
          colors.ink,
          "middle",
        ) + text(x + 50, 340, `${speed}c`, 21, colors.muted, "middle");
      body += text(
        x + 50,
        375,
        `K = ${kinetic} mc²`,
        17,
        colors.teal,
        "middle",
      );
    });
    body +=
      rect(610, 101, 318, 235) +
      label(635, 139, "Photon", "光子", 24, colors.amber) +
      text(635, 187, "m = 0", 27) +
      text(635, 235, "E = pc", 30, colors.amber) +
      text(635, 280, "p = E/c ≠ 0", 26, colors.amber);
    body += label(
      635,
      315,
      "No photon rest frame.",
      "光子の静止系はない。",
      19,
      colors.muted,
    );
    body += label(
      32,
      421,
      "Blue: rest energy mc². Teal: kinetic energy K. For m > 0, v → c needs K → ∞.",
      "青：静止エネルギーmc²、緑：運動エネルギーK。質量があればv → cでK → ∞。",
      18,
      colors.muted,
    );
    save(
      "energy",
      t(
        "Energy grows; invariant mass stays fixed",
        "増えるのはエネルギー、不変質量は一定",
      ),
      t(
        "Stacked energy bars at three speeds distinguish rest and kinetic energy; a separate photon panel shows zero rest mass with nonzero momentum.",
        "三つの速度のエネルギーを静止分と運動分に分け、光子では質量ゼロでも運動量があることを表示。",
      ),
      body,
      448,
    );
  }

  {
    let body = rect(32, 85, 432, 275) + rect(496, 85, 432, 275);
    body +=
      circle(248, 223, 97, "#eff6ff", colors.blue) +
      `<ellipse cx="248" cy="223" rx="97" ry="32" fill="none" stroke="${colors.line}" stroke-width="2"/><ellipse cx="248" cy="223" rx="35" ry="97" fill="none" stroke="${colors.line}" stroke-width="2"/>`;
    body +=
      path("M151,223 A97,50 0 0 1 345,223", colors.teal, 5) +
      circle(151, 223, 6, colors.teal) +
      circle(345, 223, 6, colors.teal);
    body += label(
      56,
      120,
      "Geodesic: straightest available path",
      "測地線：その幾何学でのまっすぐな経路",
      20,
    );
    body += label(
      56,
      339,
      "Sphere surface: spatial analogy only",
      "球面は空間の比喩。時空の絵ではない。",
      18,
      colors.muted,
    );
    body +=
      circle(710, 224, 41, "#dbeafe", colors.blue) +
      label(710, 232, "Earth", "地球", 20, colors.blue, "middle");
    body +=
      `<ellipse cx="710" cy="224" rx="155" ry="74" fill="none" stroke="${colors.line}" stroke-width="3"/>` +
      circle(710, 150, 9, colors.teal) +
      line(710, 150, 795, 150, colors.teal, 3, true) +
      line(710, 163, 710, 180, colors.blue, 3, true);
    body +=
      label(
        520,
        120,
        "Orbit: continuous free fall",
        "軌道運動：落ち続ける自由落下",
        22,
      ) +
      label(810, 157, "velocity", "速度", 18, colors.teal) +
      label(
        520,
        339,
        "Gravity changes the direction of motion.",
        "重力によって進行方向が変わり続ける。",
        19,
        colors.muted,
      );
    body += label(
      32,
      400,
      "A curved spatial orbit can be a free-fall geodesic through spacetime.",
      "空間では曲がる軌道も、時空では自由落下の測地線になる。",
      20,
      colors.muted,
    );
    save(
      "geometry",
      t(
        "Geometry determines free-fall paths",
        "自由落下の経路は、幾何学に沿う",
      ),
      t(
        "A sphere gives a limited spatial analogy for a geodesic; an orbiting satellite falls freely around Earth.",
        "球面上の経路は測地線の空間的な比喩。人工衛星は地球の周囲を自由落下する。",
      ),
      body,
    );
  }

  {
    let body = "";
    const labels = [
      ["Drifting in deep space", "遠方を漂う部屋"],
      ["Freely falling near Earth", "地球付近を自由落下"],
      ["Supported on the ground", "地面に支えられた部屋"],
    ];
    labels.forEach(([en, jp], i) => {
      const x = 32 + i * 310;
      body +=
        rect(x, 87, 276, 266) +
        label(x + 138, 124, en, jp, 20, colors.ink, "middle") +
        rect(x + 58, 150, 160, 110, "white", colors.muted, 2) +
        circle(x + 138, 193, 9, colors.blue);
      if (i === 1)
        body += line(x + 240, 160, x + 240, 235, colors.blue, 3, true);
      if (i === 2)
        body +=
          line(x + 138, 211, x + 138, 245, colors.blue, 3, true) +
          line(x + 88, 296, x + 88, 264, colors.teal, 3, true) +
          label(x + 116, 291, "support", "支持力", 19, colors.teal);
      else
        body += label(
          x + 138,
          291,
          "Object floats beside cabin.",
          "物は部屋と一緒に浮かぶ。",
          18,
          colors.muted,
          "middle",
        );
      body += text(
        x + 138,
        331,
        t("Accelerometer: ", "加速度計：") +
          (i === 2 ? t("nonzero", "ゼロではない") : "0"),
        19,
        i === 2 ? colors.teal : colors.blue,
        "middle",
      );
    });
    body += label(
      32,
      399,
      "Local comparison only; tidal differences reveal curvature over larger regions.",
      "局所的な比較。広い範囲では潮汐効果から時空の曲がりが分かる。",
      18,
      colors.muted,
    );
    save(
      "free-fall",
      t(
        "Weightlessness is shared free fall",
        "無重量は、一緒に自由落下している状態",
      ),
      t(
        "Drifting and freely falling cabins both have floating objects and zero accelerometer readings. A supported cabin has a nonzero reading.",
        "漂う部屋と自由落下する部屋では物が浮き、加速度計はゼロ。地面に支えられた部屋ではゼロにならない。",
      ),
      body,
    );
  }

  {
    let body = rect(32, 85, 432, 275) + rect(496, 85, 432, 275);
    body += label(
      56,
      122,
      "Stationary clocks near Earth",
      "地表付近に静止させた時計",
      21,
    );
    body +=
      clock(103, 182, colors.teal) +
      clock(103, 282, colors.blue) +
      line(60, 329, 430, 329, colors.muted, 3);
    body +=
      label(
        155,
        177,
        "Higher: runs faster",
        "高い位置：速く進む",
        22,
        colors.teal,
      ) +
      label(
        155,
        211,
        "higher gravitational potential",
        "重力ポテンシャルが高い",
        18,
        colors.muted,
      );
    body += label(
      155,
      282,
      "Lower: runs slower",
      "低い位置：遅く進む",
      22,
      colors.blue,
    );
    body += label(
      520,
      122,
      "Light follows curved spacetime",
      "光も曲がった時空に沿って進む",
      21,
    );
    body +=
      path(
        "M535,225 C610,225 650,137 714,170 C780,200 805,225 883,225",
        colors.amber,
        3,
      ) +
      path(
        "M535,225 C610,225 650,313 714,280 C780,250 805,225 883,225",
        colors.amber,
        3,
      );
    body +=
      circle(535, 225, 7, colors.amber) +
      circle(706, 225, 29, "#dbeafe", colors.blue) +
      circle(883, 225, 7, colors.teal);
    body +=
      label(535, 329, "source", "光源", 19, colors.amber, "middle") +
      label(706, 329, "mass", "質量", 19, colors.blue, "middle") +
      label(874, 329, "observer", "観測者", 19, colors.teal, "middle");
    body += label(
      32,
      400,
      "Clock-rate comparison is relative. Locally measured vacuum light speed remains c.",
      "時計の進み方は比較したときの差。局所的な真空中の光速はcのまま。",
      18,
      colors.muted,
    );
    save(
      "clocks-light",
      t(
        "Gravity affects clocks and light paths",
        "重力は時計と光の経路にも影響する",
      ),
      t(
        "A higher clock runs faster than a lower stationary clock near Earth; two schematic light paths bend around a foreground mass.",
        "地表付近では高い位置の静止時計ほど速い。右は質量の周囲を曲がる光の経路の概念図。",
      ),
      body,
    );
  }

  {
    let body = "";
    const cards = [
      [
        "GPS navigation",
        "GPSの測位",
        "Clock correction → accurate timing",
        "時計の補正 → 正しい時刻比較",
        "GR +45 μs/day · SR −7 → net +38",
        "一般 +45 μs/日・特殊 −7 → 差 +38",
      ],
      [
        "Precision clocks / geodesy",
        "精密時計・測地",
        "Clock-rate difference → potential",
        "時計の進み方の差 → ポテンシャル差",
        "Optical-clock surveying is research.",
        "光時計を使う測地への応用は研究段階。",
      ],
      [
        "Gravitational lenses",
        "重力レンズ",
        "Distorted light → mass distribution",
        "光のゆがみ → 質量分布",
        "Also magnifies distant galaxies.",
        "遠くの銀河を拡大する効果もある。",
      ],
      [
        "Gravitational waves",
        "重力波",
        "Waveform → merging-object masses",
        "波形 → 合体する天体の質量",
        "Detects systems even without light.",
        "光を出さない系も観測できる。",
      ],
    ];
    cards.forEach(([en, jp, subEn, subJp, noteEn, noteJp], i) => {
      const x = 32 + (i % 2) * 464,
        y = 83 + Math.floor(i / 2) * 170;
      body +=
        rect(x, y, 432, 146) +
        label(x + 22, y + 34, en, jp, 23, i < 2 ? colors.blue : colors.teal) +
        label(x + 22, y + 76, subEn, subJp, 20) +
        label(x + 22, y + 114, noteEn, noteJp, 17, colors.muted);
    });
    body += label(
      32,
      444,
      "Timing technology on Earth; new ways to measure Earth and observe the universe.",
      "地上の時刻技術から、地球の測定や宇宙を観測する手段まで。",
      18,
      colors.muted,
    );
    save(
      "applications",
      t(
        "From spacetime effects to useful measurements",
        "時空の効果を、測定の道具にする",
      ),
      t(
        "Four applications connect relativistic effects to GPS, geodesy, lensing and gravitational-wave astronomy.",
        "相対論の効果がGPS・測地・重力レンズ・重力波観測にどうつながるかを整理。",
      ),
      body,
      470,
    );
  }
}
