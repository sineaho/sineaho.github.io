/**
 * CineAHO Hidden Object Search Pro - 50 Procedural Stages Dataset & Renderers
 */

// Simple deterministic PRNG
function SeededRandom(seed) {
  return function() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

// Shape display names mapping
const ShapeNames = {
  key: "열쇠",
  star: "별",
  heart: "하트",
  clover: "클로버",
  magnifier: "돋보기",
  crown: "왕관",
  bell: "종",
  note: "음표",
  apple: "사과",
  feather: "깃털",
  anchor: "닻",
  ring: "반지",
  diamond: "다이아몬드",
  fish: "물고기",
  umbrella: "우산",
  balloon: "풍선",
  mug: "머그컵",
  moon: "초승달",
  scissors: "가위",
  butterfly: "나비"
};

// 10 Theme Names
const ThemeNames = [
  "신비로운 숲 (Mystic Forest)",
  "끝없는 우주 (Endless Space)",
  "심해의 세계 (Deep Ocean)",
  "야간 메트로 (Night City)",
  "황금빛 사막 (Golden Desert)",
  "겨울 동화 (Winter Tale)",
  "달콤한 사탕 (Sweet Candy)",
  "마법의 성 (Magic Castle)",
  "연구원의 방 (Science Lab)",
  "하늘 정원 (Sky Garden)"
];

// Master shape path drawer
function drawShapePath(ctx, type, r) {
  ctx.beginPath();
  switch (type) {
    case 'key':
      // Loop head
      ctx.arc(-r * 0.4, 0, r * 0.4, 0, Math.PI * 2);
      // Shaft
      ctx.moveTo(0, 0);
      ctx.lineTo(r, 0);
      // Teeth
      ctx.lineTo(r, r * 0.4);
      ctx.lineTo(r - r * 0.2, r * 0.4);
      ctx.lineTo(r - r * 0.2, 0);
      ctx.lineTo(r - r * 0.4, 0);
      ctx.lineTo(r - r * 0.4, r * 0.3);
      ctx.lineTo(r - r * 0.6, r * 0.3);
      ctx.lineTo(r - r * 0.6, 0);
      break;

    case 'star':
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * r, -Math.sin((18 + i * 72) * Math.PI / 180) * r);
        ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (r * 0.4), -Math.sin((54 + i * 72) * Math.PI / 180) * (r * 0.4));
      }
      ctx.closePath();
      break;

    case 'heart':
      // Draw bezier heart centered at 0,0
      ctx.moveTo(0, -r * 0.3);
      ctx.bezierCurveTo(-r * 0.5, -r * 0.8, -r, -r * 0.3, -r * 0.1, r * 0.4);
      ctx.lineTo(0, r * 0.8);
      ctx.lineTo(r * 0.1, r * 0.4);
      ctx.bezierCurveTo(r, -r * 0.3, r * 0.5, -r * 0.8, 0, -r * 0.3);
      break;

    case 'clover':
      // 4 lobes
      ctx.arc(0, -r * 0.3, r * 0.3, 0, Math.PI * 2);
      ctx.arc(-r * 0.3, 0, r * 0.3, 0, Math.PI * 2);
      ctx.arc(r * 0.3, 0, r * 0.3, 0, Math.PI * 2);
      ctx.arc(0, r * 0.3, r * 0.3, 0, Math.PI * 2);
      // Stem
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(r * 0.2, r * 0.5, 0, r * 0.9);
      break;

    case 'magnifier':
      // Frame ring
      ctx.arc(-r * 0.25, -r * 0.25, r * 0.45, 0, Math.PI * 2);
      // Handle
      ctx.moveTo(0, 0);
      ctx.lineTo(r * 0.8, r * 0.8);
      break;

    case 'crown':
      ctx.moveTo(-r * 0.8, r * 0.6);
      ctx.lineTo(r * 0.8, r * 0.6);
      ctx.lineTo(r * 0.7, -r * 0.3);
      ctx.lineTo(r * 0.35, r * 0.15);
      ctx.lineTo(0, -r * 0.6);
      ctx.lineTo(-r * 0.35, r * 0.15);
      ctx.lineTo(-r * 0.7, -r * 0.3);
      ctx.closePath();
      break;

    case 'bell':
      ctx.moveTo(-r * 0.7, r * 0.5);
      ctx.bezierCurveTo(-r * 0.6, -r * 0.7, r * 0.6, -r * 0.7, r * 0.7, r * 0.5);
      ctx.quadraticCurveTo(0, r * 0.6, -r * 0.7, r * 0.5);
      ctx.closePath();
      // clapper
      ctx.moveTo(0, r * 0.55);
      ctx.arc(0, r * 0.7, r * 0.18, 0, Math.PI * 2);
      break;

    case 'note':
      // Dual eighth note
      ctx.arc(-r * 0.4, r * 0.4, r * 0.25, 0, Math.PI * 2);
      ctx.moveTo(-r * 0.15, r * 0.4);
      ctx.lineTo(-r * 0.15, -r * 0.5);
      ctx.lineTo(r * 0.45, -r * 0.3);
      ctx.lineTo(r * 0.45, r * 0.4);
      ctx.arc(r * 0.2, r * 0.4, r * 0.25, 0, Math.PI * 2);
      ctx.moveTo(r * 0.45, r * 0.4);
      ctx.lineTo(r * 0.45, -r * 0.3);
      ctx.moveTo(-r * 0.15, -r * 0.5);
      ctx.lineTo(r * 0.45, -r * 0.3);
      break;

    case 'apple':
      ctx.arc(-r * 0.25, 0, r * 0.45, 0, Math.PI * 2);
      ctx.arc(r * 0.25, 0, r * 0.45, 0, Math.PI * 2);
      ctx.closePath();
      // stem
      ctx.moveTo(0, -r * 0.2);
      ctx.quadraticCurveTo(r * 0.15, -r * 0.6, 0, -r * 0.75);
      // leaf
      ctx.moveTo(r * 0.05, -r * 0.6);
      ctx.quadraticCurveTo(r * 0.4, -r * 0.7, r * 0.3, -r * 0.4);
      ctx.quadraticCurveTo(r * 0.05, -r * 0.45, r * 0.05, -r * 0.6);
      break;

    case 'feather':
      ctx.moveTo(-r, r * 0.3);
      ctx.quadraticCurveTo(0, -r * 0.5, r, -r * 0.7);
      ctx.quadraticCurveTo(r * 0.2, r * 0.4, -r, r * 0.3);
      // shaft
      ctx.moveTo(-r * 1.1, r * 0.4);
      ctx.lineTo(r * 0.8, -r * 0.6);
      break;

    case 'anchor':
      // Ring
      ctx.arc(0, -r * 0.6, r * 0.18, 0, Math.PI * 2);
      // Main shaft
      ctx.moveTo(0, -r * 0.42);
      ctx.lineTo(0, r * 0.5);
      // Crossbar
      ctx.moveTo(-r * 0.4, -r * 0.2);
      ctx.lineTo(r * 0.4, -r * 0.2);
      // Bottom hooks
      ctx.moveTo(0, r * 0.4);
      ctx.quadraticCurveTo(-r * 0.8, r * 0.3, -r * 0.7, -r * 0.1);
      ctx.lineTo(-r * 0.8, -r * 0.05);
      ctx.lineTo(-r * 0.7, -r * 0.1);
      ctx.lineTo(-r * 0.6, -r * 0.05);
      ctx.moveTo(0, r * 0.4);
      ctx.quadraticCurveTo(r * 0.8, r * 0.3, r * 0.7, -r * 0.1);
      ctx.lineTo(r * 0.8, -r * 0.05);
      ctx.lineTo(r * 0.7, -r * 0.1);
      ctx.lineTo(r * 0.6, -r * 0.05);
      break;

    case 'ring':
      // Ring band
      ctx.arc(0, r * 0.15, r * 0.45, 0, Math.PI * 2);
      // Gem top
      ctx.moveTo(-r * 0.2, -r * 0.3);
      ctx.lineTo(r * 0.2, -r * 0.3);
      ctx.lineTo(r * 0.35, -r * 0.55);
      ctx.lineTo(0, -r * 0.85);
      ctx.lineTo(-r * 0.35, -r * 0.55);
      ctx.closePath();
      break;

    case 'diamond':
      ctx.moveTo(-r * 0.4, -r * 0.6);
      ctx.lineTo(r * 0.4, -r * 0.6);
      ctx.lineTo(r * 0.8, -r * 0.1);
      ctx.lineTo(0, r * 0.8);
      ctx.lineTo(-r * 0.8, -r * 0.1);
      ctx.closePath();
      // Cuts lines
      ctx.moveTo(-r * 0.4, -r * 0.6);
      ctx.lineTo(-r * 0.2, -r * 0.1);
      ctx.lineTo(0, r * 0.8);
      ctx.lineTo(r * 0.2, -r * 0.1);
      ctx.lineTo(r * 0.4, -r * 0.6);
      ctx.moveTo(-r * 0.8, -r * 0.1);
      ctx.lineTo(-r * 0.2, -r * 0.1);
      ctx.lineTo(r * 0.2, -r * 0.1);
      ctx.lineTo(r * 0.8, -r * 0.1);
      break;

    case 'fish':
      // Body
      ctx.moveTo(r * 0.7, 0);
      ctx.quadraticCurveTo(r * 0.1, -r * 0.4, -r * 0.4, 0);
      ctx.quadraticCurveTo(r * 0.1, r * 0.4, r * 0.7, 0);
      // Tail
      ctx.lineTo(r * 0.9, -r * 0.35);
      ctx.lineTo(r * 0.78, 0);
      ctx.lineTo(r * 0.9, r * 0.35);
      ctx.closePath();
      // Eye
      ctx.moveTo(-r * 0.15, -r * 0.05);
      ctx.arc(-r * 0.15, -r * 0.05, r * 0.06, 0, Math.PI*2);
      break;

    case 'umbrella':
      // Canopy
      ctx.arc(0, -r * 0.05, r * 0.6, Math.PI, 0);
      ctx.lineTo(-r * 0.6, -r * 0.05);
      // Shaft
      ctx.moveTo(0, -r * 0.65);
      ctx.lineTo(0, r * 0.5);
      // Handle loop J
      ctx.arc(r * 0.15, r * 0.5, r * 0.15, Math.PI, 0, true);
      break;

    case 'balloon':
      // Balloon bulb
      ctx.moveTo(0, -r * 0.5);
      ctx.bezierCurveTo(-r * 0.6, -r * 0.9, -r * 0.7, -r * 0.1, 0, r * 0.4);
      ctx.bezierCurveTo(r * 0.7, -r * 0.1, r * 0.6, -r * 0.9, 0, -r * 0.5);
      // Knot
      ctx.moveTo(0, r * 0.4);
      ctx.lineTo(-r * 0.1, r * 0.48);
      ctx.lineTo(r * 0.1, r * 0.48);
      ctx.closePath();
      // String
      ctx.moveTo(0, r * 0.48);
      ctx.quadraticCurveTo(-r * 0.15, r * 0.7, 0, r * 0.9);
      break;

    case 'mug':
      // Cup body
      ctx.moveTo(-r * 0.45, -r * 0.5);
      ctx.lineTo(-r * 0.45, r * 0.4);
      ctx.quadraticCurveTo(-r * 0.4, r * 0.6, 0, r * 0.6);
      ctx.quadraticCurveTo(r * 0.4, r * 0.6, r * 0.45, r * 0.4);
      ctx.lineTo(r * 0.45, -r * 0.5);
      ctx.closePath();
      // Handle loop
      ctx.moveTo(r * 0.45, -r * 0.2);
      ctx.bezierCurveTo(r * 0.8, -r * 0.2, r * 0.8, r * 0.3, r * 0.45, r * 0.3);
      break;

    case 'moon':
      ctx.arc(-r * 0.2, 0, r * 0.7, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.arc(0, 0, r * 0.65, Math.PI * 0.35, -Math.PI * 0.35, true);
      ctx.closePath();
      break;

    case 'scissors':
      // Two blade lines
      ctx.moveTo(-r * 0.8, -r * 0.1);
      ctx.lineTo(r * 0.6, r * 0.2);
      ctx.moveTo(-r * 0.8, r * 0.1);
      ctx.lineTo(r * 0.6, -r * 0.2);
      // Finger rings
      ctx.moveTo(r * 0.6, r * 0.2);
      ctx.arc(r * 0.72, r * 0.3, r * 0.18, 0, Math.PI * 2);
      ctx.moveTo(r * 0.6, -r * 0.2);
      ctx.arc(r * 0.72, -r * 0.3, r * 0.18, 0, Math.PI * 2);
      break;

    case 'butterfly':
      // Center body
      ctx.ellipse(0, 0, r * 0.08, r * 0.5, 0, 0, Math.PI*2);
      // Top wings
      ctx.moveTo(0, -r * 0.1);
      ctx.bezierCurveTo(-r * 0.5, -r * 0.8, -r * 0.9, -r * 0.3, 0, -r * 0.1);
      ctx.bezierCurveTo(r * 0.5, -r * 0.8, r * 0.9, -r * 0.3, 0, -r * 0.1);
      // Bottom wings
      ctx.bezierCurveTo(-r * 0.4, r * 0.6, -r * 0.7, r * 0.2, 0, r * 0.1);
      ctx.bezierCurveTo(r * 0.4, r * 0.6, r * 0.7, r * 0.2, 0, r * 0.1);
      // Antennae
      ctx.moveTo(0, -r * 0.4);
      ctx.quadraticCurveTo(-r * 0.2, -r * 0.7, -r * 0.25, -r * 0.75);
      ctx.moveTo(0, -r * 0.4);
      ctx.quadraticCurveTo(r * 0.2, -r * 0.7, r * 0.25, -r * 0.75);
      break;
  }
}

// Complete drawing wrapper: draws shape filled and stroked OR strokeOnly outline
function drawHiddenItem(ctx, type, x, y, r, rotation, color, strokeOnly) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  
  drawShapePath(ctx, type, r);

  if (strokeOnly) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    ctx.stroke();
  } else {
    // Hidden camo coloring: fill with low opacity or matches background shades
    ctx.fillStyle = color;
    ctx.fill();
    // Subtle borders
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}

// 10 Vector Thematic Background Generators
const BackgroundThemes = {
  // Theme 0: Mystic Forest (숲속)
  0(ctx, rand) {
    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, 500);
    sky.addColorStop(0, "#bae6fd");
    sky.addColorStop(1, "#fef08a");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 500, 500);

    // Sun
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.arc(430, 70, 45, 0, Math.PI * 2);
    ctx.fill();

    // Clouds
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    for (let i = 0; i < 4; i++) {
      const cx = 80 + rand() * 320;
      const cy = 60 + rand() * 80;
      ctx.beginPath();
      ctx.arc(cx, cy, 25, 0, Math.PI * 2);
      ctx.arc(cx + 20, cy - 10, 30, 0, Math.PI * 2);
      ctx.arc(cx + 40, cy, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mountains
    ctx.fillStyle = "#475569";
    ctx.beginPath();
    ctx.moveTo(0, 350);
    ctx.lineTo(150, 180);
    ctx.lineTo(300, 350);
    ctx.lineTo(420, 220);
    ctx.lineTo(500, 350);
    ctx.lineTo(500, 500);
    ctx.lineTo(0, 500);
    ctx.closePath();
    ctx.fill();

    // Hills
    ctx.fillStyle = "#15803d";
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.quadraticCurveTo(120, 380, 260, 440);
    ctx.quadraticCurveTo(390, 400, 500, 460);
    ctx.lineTo(500, 500);
    ctx.closePath();
    ctx.fill();

    // Forest green bushes/pines
    ctx.fillStyle = "#166534";
    for (let i = 0; i < 15; i++) {
      const tx = rand() * 500;
      const ty = 430 + rand() * 60;
      const th = 30 + rand() * 40;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - th * 0.4, ty + th);
      ctx.lineTo(tx + th * 0.4, ty + th);
      ctx.closePath();
      ctx.fill();
    }
  },

  // Theme 1: Endless Space (우주)
  1(ctx, rand) {
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, 500, 500);

    // Nebulas
    for (let i = 0; i < 3; i++) {
      const nx = rand() * 500;
      const ny = rand() * 500;
      const nr = 100 + rand() * 150;
      const gradient = ctx.createRadialGradient(nx, ny, 10, nx, ny, nr);
      gradient.addColorStop(0, i === 0 ? "rgba(168, 85, 247, 0.25)" : "rgba(6, 182, 212, 0.25)");
      gradient.addColorStop(1, "rgba(2, 6, 23, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(nx, ny, nr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stars
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    for (let i = 0; i < 60; i++) {
      ctx.fillRect(rand() * 500, rand() * 500, 2 + rand() * 2, 2 + rand() * 2);
    }

    // Big Planets
    for (let i = 0; i < 2; i++) {
      const px = 100 + rand() * 300;
      const py = 100 + rand() * 300;
      const pr = 30 + rand() * 40;
      const pgrad = ctx.createRadialGradient(px - pr*0.2, py - pr*0.2, pr * 0.1, px, py, pr);
      pgrad.addColorStop(0, i === 0 ? "#ec4899" : "#eab308");
      pgrad.addColorStop(1, "#311042");
      ctx.fillStyle = pgrad;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();

      // Saturn Rings
      if (i === 1) {
        ctx.strokeStyle = "rgba(234, 179, 8, 0.4)";
        ctx.lineWidth = 8;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(-Math.PI / 6);
        ctx.scale(1.8, 0.35);
        ctx.beginPath();
        ctx.arc(0, 0, pr * 1.1, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  },

  // Theme 2: Deep Ocean (심해)
  2(ctx, rand) {
    const sea = ctx.createLinearGradient(0, 0, 0, 500);
    sea.addColorStop(0, "#0c4a6e");
    sea.addColorStop(1, "#030712");
    ctx.fillStyle = sea;
    ctx.fillRect(0, 0, 500, 500);

    // Light rays
    ctx.fillStyle = "rgba(14, 165, 233, 0.08)";
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(80 + i * 100, 0);
      ctx.lineTo(130 + i * 100, 0);
      ctx.lineTo(200 + i * 120, 500);
      ctx.lineTo(80 + i * 120, 500);
      ctx.fill();
    }

    // Bubbles
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 25; i++) {
      const bx = rand() * 500;
      const by = 100 + rand() * 400;
      const br = 4 + rand() * 12;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Seaweed strands
    ctx.strokeStyle = "#0d9488";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    for (let i = 0; i < 8; i++) {
      const sx = 30 + i * 65 + rand() * 20;
      ctx.beginPath();
      ctx.moveTo(sx, 500);
      ctx.bezierCurveTo(sx - 30, 400, sx + 30, 300, sx - 20, 220);
      ctx.stroke();
    }

    // Sea ground rocks
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.lineTo(0, 460);
    ctx.quadraticCurveTo(80, 440, 150, 470);
    ctx.quadraticCurveTo(300, 430, 400, 480);
    ctx.lineTo(500, 450);
    ctx.lineTo(500, 500);
    ctx.closePath();
    ctx.fill();
  },

  // Theme 3: Night City (도시 야경)
  3(ctx, rand) {
    const cityBg = ctx.createLinearGradient(0, 0, 0, 500);
    cityBg.addColorStop(0, "#020617");
    cityBg.addColorStop(1, "#1e1b4b");
    ctx.fillStyle = cityBg;
    ctx.fillRect(0, 0, 500, 500);

    // Skyline moon
    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.arc(100, 100, 30, 0, Math.PI * 2);
    ctx.fill();

    // Silhouettes of background buildings
    ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
    for (let i = 0; i < 7; i++) {
      const bw = 50 + rand() * 40;
      const bh = 150 + rand() * 200;
      const bx = i * 70 + rand() * 10;
      ctx.fillRect(bx, 500 - bh, bw, bh);
    }

    // Foreground buildings with windows
    ctx.fillStyle = "#0f172a";
    for (let i = 0; i < 5; i++) {
      const bw = 70 + rand() * 30;
      const bh = 220 + rand() * 180;
      const bx = i * 100 - 10 + rand() * 10;
      ctx.fillRect(bx, 500 - bh, bw, bh);

      // Windows
      ctx.fillStyle = "#fbbf24";
      const rows = Math.floor(bh / 35);
      const cols = Math.floor(bw / 25);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (rand() > 0.45) { // randomized yellow lights
            ctx.fillRect(bx + 8 + c * 22, 500 - bh + 12 + r * 30, 10, 14);
          }
        }
      }
    }
  },

  // Theme 4: Golden Desert (사막)
  4(ctx, rand) {
    // Sunset
    const sunset = ctx.createLinearGradient(0, 0, 0, 500);
    sunset.addColorStop(0, "#ea580c");
    sunset.addColorStop(0.5, "#f97316");
    sunset.addColorStop(1, "#fde047");
    ctx.fillStyle = sunset;
    ctx.fillRect(0, 0, 500, 500);

    // Burning big sun
    ctx.fillStyle = "#b91c1c";
    ctx.beginPath();
    ctx.arc(250, 180, 70, 0, Math.PI * 2);
    ctx.fill();

    // Pyramids
    ctx.fillStyle = "#ca8a04";
    ctx.beginPath();
    ctx.moveTo(40, 360);
    ctx.lineTo(160, 200);
    ctx.lineTo(280, 360);
    ctx.closePath();
    ctx.fill();
    
    // Pyramid shadow side
    ctx.fillStyle = "#a16207";
    ctx.beginPath();
    ctx.moveTo(160, 200);
    ctx.lineTo(280, 360);
    ctx.lineTo(220, 360);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#eab308";
    ctx.beginPath();
    ctx.moveTo(200, 380);
    ctx.lineTo(310, 240);
    ctx.lineTo(420, 380);
    ctx.closePath();
    ctx.fill();

    // Dunes
    ctx.fillStyle = "#ca8a04";
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.quadraticCurveTo(150, 340, 320, 420);
    ctx.quadraticCurveTo(430, 390, 500, 430);
    ctx.lineTo(500, 500);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#b45309";
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.quadraticCurveTo(250, 420, 500, 480);
    ctx.lineTo(500, 500);
    ctx.closePath();
    ctx.fill();
  },

  // Theme 5: Winter Tale (겨울왕국)
  5(ctx, rand) {
    // Sky
    const winterSky = ctx.createLinearGradient(0, 0, 0, 500);
    winterSky.addColorStop(0, "#0891b2");
    winterSky.addColorStop(1, "#bae6fd");
    ctx.fillStyle = winterSky;
    ctx.fillRect(0, 0, 500, 500);

    // Snowy Mountains
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.moveTo(0, 400);
    ctx.lineTo(100, 220);
    ctx.lineTo(220, 400);
    ctx.lineTo(360, 180);
    ctx.lineTo(500, 400);
    ctx.lineTo(500, 500);
    ctx.lineTo(0, 500);
    ctx.fill();

    // Snow Ground
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.quadraticCurveTo(100, 410, 260, 450);
    ctx.quadraticCurveTo(400, 430, 500, 470);
    ctx.lineTo(500, 500);
    ctx.closePath();
    ctx.fill();

    // Pine trees covered in snow
    ctx.fillStyle = "#0f766e";
    for (let i = 0; i < 8; i++) {
      const px = 40 + i * 60 + rand() * 20;
      const py = 420 + rand() * 40;
      const ph = 50 + rand() * 40;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - ph * 0.35, py + ph);
      ctx.lineTo(px + ph * 0.35, py + ph);
      ctx.closePath();
      ctx.fill();
      // snow cap
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - ph * 0.12, py + ph * 0.3);
      ctx.lineTo(px + ph * 0.12, py + ph * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#0f766e";
    }
  },

  // Theme 6: Sweet Candy (디저트)
  6(ctx, rand) {
    const candyBg = ctx.createLinearGradient(0, 0, 0, 500);
    candyBg.addColorStop(0, "#fbcfe8");
    candyBg.addColorStop(1, "#fce7f3");
    ctx.fillStyle = candyBg;
    ctx.fillRect(0, 0, 500, 500);

    // Candy Canes
    ctx.strokeStyle = "#f43f5e";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const cx = 100 + i * 150 + rand() * 50;
      ctx.beginPath();
      ctx.moveTo(cx, 500);
      ctx.lineTo(cx, 320);
      ctx.arc(cx - 30, 320, 30, 0, Math.PI, true);
      ctx.stroke();
    }

    // Ice cream hill ground
    ctx.fillStyle = "#fff1f2";
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.arc(120, 500, 140, Math.PI, 0);
    ctx.arc(380, 500, 160, Math.PI, 0);
    ctx.closePath();
    ctx.fill();

    // Sprinkles scattered
    const colors = ["#fbbf24", "#60a5fa", "#34d399", "#c084fc", "#f472b6"];
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = colors[Math.floor(rand() * colors.length)];
      ctx.save();
      ctx.translate(rand() * 500, 380 + rand() * 120);
      ctx.rotate(rand() * Math.PI);
      ctx.fillRect(-5, -2, 10, 4);
      ctx.restore();
    }
  },

  // Theme 7: Magic Castle (마법의 성)
  7(ctx, rand) {
    // Mystical twilight
    const twilight = ctx.createLinearGradient(0, 0, 0, 500);
    twilight.addColorStop(0, "#2e1065");
    twilight.addColorStop(1, "#0f172a");
    ctx.fillStyle = twilight;
    ctx.fillRect(0, 0, 500, 500);

    // Giant full moon
    ctx.fillStyle = "rgba(254, 240, 138, 0.15)";
    ctx.beginPath();
    ctx.arc(250, 200, 120, 0, Math.PI * 2);
    ctx.fill();

    // Clouds blocking moon
    ctx.fillStyle = "rgba(71, 85, 105, 0.4)";
    ctx.beginPath();
    ctx.arc(170, 220, 50, 0, Math.PI*2);
    ctx.arc(240, 210, 60, 0, Math.PI*2);
    ctx.arc(320, 230, 45, 0, Math.PI*2);
    ctx.fill();

    // Castle towers silhouette
    ctx.fillStyle = "#1e1b4b";
    // Left tower
    ctx.fillRect(80, 250, 50, 250);
    ctx.beginPath();
    ctx.moveTo(70, 250);
    ctx.lineTo(105, 170);
    ctx.lineTo(140, 250);
    ctx.closePath();
    ctx.fill();

    // Central castle structure
    ctx.fillRect(180, 200, 140, 300);
    ctx.fillStyle = "#ef4444"; // flag on central spire
    ctx.fillRect(245, 120, 20, 14);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(245, 120);
    ctx.lineTo(245, 200);
    ctx.stroke();

    ctx.fillStyle = "#1e1b4b";
    // Right tower
    ctx.fillRect(370, 230, 60, 270);
    ctx.beginPath();
    ctx.moveTo(360, 230);
    ctx.lineTo(400, 160);
    ctx.lineTo(440, 230);
    ctx.closePath();
    ctx.fill();
  },

  // Theme 8: Science Lab (연구소)
  8(ctx, rand) {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, 500, 500);

    // Wall grid tiles
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < 500; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 500);
      ctx.stroke();
    }
    for (let y = 0; y < 500; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(500, y);
      ctx.stroke();
    }

    // Shelves structure
    ctx.fillStyle = "#334155";
    ctx.fillRect(40, 150, 420, 15);
    ctx.fillRect(40, 300, 420, 15);

    // Desk at the bottom
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 430, 500, 70);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(40, 430, 420, 6);

    // Flask shapes and books drawn on shelves
    ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
    ctx.beginPath();
    ctx.arc(100, 270, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(94, 235, 12, 20);

    ctx.fillStyle = "rgba(59, 130, 246, 0.25)";
    ctx.beginPath();
    ctx.moveTo(350, 285);
    ctx.lineTo(330, 250);
    ctx.lineTo(370, 250);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(346, 235, 8, 20);

    // Stack of books
    const bookColors = ["#ef4444", "#eab308", "#c084fc"];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = bookColors[i % 3];
      ctx.fillRect(200 + i * 22, 255, 18, 45);
    }
  },

  // Theme 9: Sky Garden (하늘 정원)
  9(ctx, rand) {
    // Beautiful sunset sky
    const sky = ctx.createLinearGradient(0, 0, 0, 500);
    sky.addColorStop(0, "#a855f7");
    sky.addColorStop(0.5, "#f472b6");
    sky.addColorStop(1, "#ffedd5");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 500, 500);

    // Distant floating island
    ctx.fillStyle = "#854d0e";
    ctx.beginPath();
    ctx.moveTo(150, 320);
    ctx.lineTo(350, 320);
    ctx.lineTo(320, 380);
    ctx.lineTo(180, 380);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#22c55e"; // green island top
    ctx.fillRect(150, 310, 200, 10);

    // Big foreground floating island
    ctx.fillStyle = "#451a03";
    ctx.beginPath();
    ctx.moveTo(0, 440);
    ctx.lineTo(500, 420);
    ctx.lineTo(440, 500);
    ctx.lineTo(60, 500);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#166534";
    ctx.beginPath();
    ctx.moveTo(0, 440);
    ctx.lineTo(500, 420);
    ctx.lineTo(500, 450);
    ctx.lineTo(0, 450);
    ctx.fill();

    // Ancient stone pillars on the side
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(40, 240, 35, 180);
    ctx.fillRect(30, 230, 55, 15);
    ctx.fillRect(425, 200, 40, 220);
    ctx.fillRect(415, 190, 60, 15);
  }
};

// Procedural Stage Builder Engine
const StageGenerator = {
  // Generates complete configuration of targets & decoys for a given index (0 to 49)
  generateStage(index) {
    const rand = SeededRandom(index + 3251);
    const themeIndex = index % 10;
    
    // Choose 5 unique types from the 20 master shape list
    const shapesList = ['key', 'star', 'heart', 'clover', 'magnifier', 'crown', 'bell', 'note', 'apple', 'feather', 'anchor', 'ring', 'diamond', 'fish', 'umbrella', 'balloon', 'mug', 'moon', 'scissors', 'butterfly'];
    
    // Seeded shuffle shapes list
    for (let i = shapesList.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const temp = shapesList[i];
      shapesList[i] = shapesList[j];
      shapesList[j] = temp;
    }

    const targetTypes = shapesList.slice(0, 5);

    // Define colors list depending on theme to camouflage targets
    // We choose 5 distinct colors matching the theme palette
    let camoColors = [];
    switch (themeIndex) {
      case 0: // Forest: greens/browns/yellows
        camoColors = ["#15803d", "#166534", "#ca8a04", "#78350f", "#854d0e"];
        break;
      case 1: // Space: purples/cyans/blues
        camoColors = ["#a855f7", "#06b6d4", "#3b82f6", "#1e1b4b", "#6366f1"];
        break;
      case 2: // Ocean: deep blues/teals/sea foam
        camoColors = ["#0284c7", "#0d9488", "#0f766e", "#38bdf8", "#115e59"];
        break;
      case 3: // City: dark slate/yellow/purple lights
        camoColors = ["#334155", "#475569", "#1e293b", "#a855f7", "#ca8a04"];
        break;
      case 4: // Desert: warm red/orange/yellow
        camoColors = ["#b45309", "#ea580c", "#ca8a04", "#b91c1c", "#f97316"];
        break;
      case 5: // Winter: light slate/ice cyan/dark pine
        camoColors = ["#94a3b8", "#0891b2", "#38bdf8", "#0f766e", "#64748b"];
        break;
      case 6: // Candy: pastel pink/rose red/magenta
        camoColors = ["#f43f5e", "#ec4899", "#db2777", "#fb7185", "#be185d"];
        break;
      case 7: // Castle: dark indigo/royal gold/stone gray
        camoColors = ["#1e1b4b", "#c084fc", "#eab308", "#64748b", "#312e81"];
        break;
      case 8: // Lab: chemical cyan/beaker outline green/wood brown
        camoColors = ["#10b981", "#3b82f6", "#334155", "#b45309", "#059669"];
        break;
      case 9: // Sky Garden: soft purple/sunset gold/green grass
        camoColors = ["#a855f7", "#ea580c", "#166534", "#22c55e", "#db2777"];
        break;
    }

    // Generate 5 target items configurations
    const targets = [];
    for (let i = 0; i < 5; i++) {
      // Pick random location avoiding extreme borders
      const tx = 50 + Math.floor(rand() * 400);
      const ty = 50 + Math.floor(rand() * 400);
      const tr = 14 + Math.floor(rand() * 8); // radius
      const rotation = rand() * Math.PI * 2;
      const color = camoColors[i % camoColors.length];
      const type = targetTypes[i];

      targets.push({
        id: i,
        type: type,
        x: tx,
        y: ty,
        r: tr,
        rotation: rotation,
        color: color,
        label: ShapeNames[type]
      });
    }

    // Generate 35 decoy items that blend in
    const decoys = [];
    for (let i = 0; i < 35; i++) {
      // Pick shapes NOT in targetTypes
      const decoyType = shapesList[5 + Math.floor(rand() * 15)];
      const dx = 40 + Math.floor(rand() * 420);
      const dy = 40 + Math.floor(rand() * 420);
      const dr = 12 + Math.floor(rand() * 10);
      const drot = rand() * Math.PI * 2;
      const dcolor = camoColors[Math.floor(rand() * camoColors.length)];

      decoys.push({
        type: decoyType,
        x: dx,
        y: dy,
        r: dr,
        rotation: drot,
        color: dcolor
      });
    }

    return {
      id: index,
      name: `STAGE ${String(index + 1).padStart(2, '0')}`,
      themeIndex: themeIndex,
      themeName: ThemeNames[themeIndex],
      targets: targets,
      decoys: decoys
    };
  }
};
