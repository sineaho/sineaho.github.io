/**
 * CineAHO Spot the Difference - 30 Vector Stages Dataset
 */

const GameStages = [
  {
    name: "평화로운 숲 (Peaceful Forest)",
    differences: [
      { id: 0, x: 220, y: 70, r: 25, label: "하늘의 뭉게구름" },
      { id: 1, x: 380, y: 60, r: 20, label: "따스한 태양 크기" },
      { id: 2, x: 340, y: 220, r: 25, label: "집 굴뚝 연기" },
      { id: 3, x: 260, y: 275, r: 15, label: "집 창문 노란 불빛" },
      { id: 4, x: 70, y: 350, r: 20, label: "나무 옆 분홍색 꽃" }
    ],
    draw(ctx, isMod) {
      // 1. Sky
      drawSky(ctx, "#bae6fd", "#e0f2fe"); // soft cyan sky
      
      // 2. Sun
      drawSun(ctx, 380, 60, isMod ? 25 : 35, "#f59e0b");
      
      // 3. Clouds
      drawCloud(ctx, 100, 100, 30);
      if (!isMod) {
        drawCloud(ctx, 220, 70, 25); // diff 0: cloud missing
      }
      
      // 4. Ground
      drawGround(ctx, 330, "#4ade80", "#22c55e");
      
      // 5. Trees
      drawTree(ctx, 80, 320, 50, "#78350f", "#15803d");
      drawTree(ctx, 140, 330, 40, "#78350f", "#166534");
      
      // 6. Cabin
      drawHouse(ctx, 240, 240, 120, "#ef4444", "#fed7aa", !isMod); // diff 3: window yellow vs dark
      
      // 6a. Chimney Smoke
      if (isMod) {
        // diff 2: different colored smoke
        drawSmoke(ctx, 340, 220, 20, "rgba(239, 68, 68, 0.4)"); 
      } else {
        drawSmoke(ctx, 340, 220, 20, "rgba(226, 232, 240, 0.6)");
      }

      // 7. Flowers
      drawFlower(ctx, 180, 360, "#a855f7");
      if (!isMod) {
        drawFlower(ctx, 70, 350, "#f43f5e"); // diff 4: flower missing
      }
    }
  },
  {
    name: "우주 비행 (Space Voyage)",
    differences: [
      { id: 0, x: 340, y: 100, r: 35, label: "고리가 달린 붉은 토성" },
      { id: 1, x: 120, y: 120, r: 20, label: "하늘색 아기 외계 행성" },
      { id: 2, x: 220, y: 220, r: 25, label: "우주선 창문 개수" },
      { id: 3, x: 130, y: 320, r: 25, label: "우주선 불꽃 엔진 크기" },
      { id: 4, x: 280, y: 340, r: 15, label: "노란 별 크기" }
    ],
    draw(ctx, isMod) {
      // 1. Deep Space
      drawSky(ctx, "#020617", "#0f172a");
      
      // 2. Stars background
      drawStar(ctx, 60, 50, 4, "#ffffff");
      drawStar(ctx, 220, 40, 3, "#ffffff");
      drawStar(ctx, 80, 240, 5, "#ffffff");
      drawStar(ctx, 390, 260, 4, "#ffffff");
      drawStar(ctx, 280, 340, isMod ? 12 : 6, "#fbbf24"); // diff 4: star size
      
      // 3. Saturn
      drawSaturn(ctx, 340, 100, 30, isMod ? "#38bdf8" : "#f43f5e"); // diff 0: saturn ring color
      
      // 4. Baby Planet
      if (!isMod) {
        drawPlanet(ctx, 120, 120, 15, "#06b6d4"); // diff 1: planet missing
      }
      
      // 5. Rocket/UFO
      drawUfo(ctx, 200, 250, 100, "#cbd5e1", isMod ? 3 : 2); // diff 2: window counts
      
      // 6. Thrust fire
      drawFire(ctx, 130, 320, isMod ? 40 : 20); // diff 3: fire thrust
    }
  },
  {
    name: "바닷속 모험 (Deep Ocean)",
    differences: [
      { id: 0, x: 120, y: 150, r: 25, label: "지나가는 분홍색 물고기" },
      { id: 1, x: 230, y: 120, r: 15, label: "물 위에 피어난 물방울" },
      { id: 2, x: 340, y: 250, r: 35, label: "잠수함 노란 프로펠러" },
      { id: 3, x: 100, y: 380, r: 20, label: "해초 위에 숨은 빨간 불가사리" },
      { id: 4, x: 280, y: 390, r: 20, label: "보라색 산호 가지 개수" }
    ],
    draw(ctx, isMod) {
      // 1. Water gradient
      drawSky(ctx, "#0c4a6e", "#0284c7");
      
      // 2. Bubbles
      drawBubble(ctx, 80, 220, 8);
      drawBubble(ctx, 350, 160, 12);
      if (!isMod) {
        drawBubble(ctx, 230, 120, 10); // diff 1: bubble missing
      }

      // 3. Fish
      drawFish(ctx, 300, 80, 25, "#f97316");
      if (!isMod) {
        drawFish(ctx, 120, 150, 20, "#ec4899"); // diff 0: pink fish missing
      }

      // 4. Seaweed Ground
      drawGround(ctx, 360, "#14b8a6", "#0f766e");

      // 5. Coral & Starfish
      drawCoral(ctx, 280, 400, isMod ? 3 : 5, "#a855f7"); // diff 4: coral branch counts
      if (!isMod) {
        drawStarfish(ctx, 100, 380, 12, "#ef4444"); // diff 3: red starfish missing
      } else {
        drawStarfish(ctx, 100, 380, 12, "#facc15"); // yellow starfish
      }

      // 6. Submarine
      drawSubmarine(ctx, 220, 240, 80, "#eab308", isMod); // diff 2: propeller toggled
    }
  },
  {
    name: "활기찬 도시 (Bustling City)",
    differences: [
      { id: 0, x: 300, y: 80, r: 20, label: "하늘 위의 보름달" },
      { id: 1, x: 80, y: 250, r: 25, label: "파란 빌딩 안의 노란 불빛" },
      { id: 2, x: 380, y: 220, r: 30, label: "보랏빛 타워 안테나 수" },
      { id: 3, x: 190, y: 390, r: 25, label: "빨간 스포츠카 헤드라이트" },
      { id: 4, x: 320, y: 400, r: 15, label: "길가 노란 표지판" }
    ],
    draw(ctx, isMod) {
      // 1. Night Sky
      drawSky(ctx, "#090d16", "#1e1b4b");
      
      // 2. Moon
      if (!isMod) {
        drawSun(ctx, 300, 80, 25, "#fef08a"); // diff 0: Moon missing
      }

      // 3. Buildings
      drawBuilding(ctx, 50, 180, 80, 220, "#1d4ed8", !isMod); // diff 1: window lights
      drawBuilding(ctx, 160, 220, 90, 180, "#475569", true);
      drawBuilding(ctx, 270, 150, 70, 250, "#0f766e", true);
      
      // Broadcast antenna tower on the right
      drawAntennaTower(ctx, 380, 180, 40, 220, "#581c87", isMod ? 1 : 3); // diff 2: antenna wires

      // 4. Ground/Road
      drawGround(ctx, 380, "#334155", "#1e293b");

      // 5. Road decorations
      if (!isMod) {
        drawSignPost(ctx, 320, 380, "#eab308"); // diff 4: yellow sign missing
      }
      
      // 6. Car
      drawCarEntity(ctx, 150, 360, 70, "#ef4444", isMod); // diff 3: headlights on/off
    }
  },
  {
    name: "이집트 여행 (Egyptian Pyramids)",
    differences: [
      { id: 0, x: 100, y: 90, r: 20, label: "하늘에 떠다니는 구름" },
      { id: 1, x: 260, y: 60, r: 25, label: "붉은 불타는 태양" },
      { id: 2, x: 150, y: 220, r: 35, label: "왼쪽 큰 피라미드 금색 꼭대기" },
      { id: 3, x: 380, y: 350, r: 20, label: "오아시스 야자나무 열매" },
      { id: 4, x: 250, y: 370, r: 25, label: "모래사막 위 걷는 낙타" }
    ],
    draw(ctx, isMod) {
      // 1. Desert Sunset Sky
      drawSky(ctx, "#fdba74", "#f97316");

      // 2. Clouds
      if (!isMod) {
        drawCloud(ctx, 100, 90, 20); // diff 0: cloud missing
      }

      // 3. Sun
      drawSun(ctx, 260, 60, isMod ? 30 : 20, "#ef4444"); // diff 1: sun size
      
      // 4. Sandy ground
      drawGround(ctx, 320, "#eab308", "#ca8a04");

      // 5. Pyramids
      drawPyramid(ctx, 80, 180, 150, "#eab308", isMod ? "#fbbf24" : "#b45309"); // diff 2: gold cap vs brown
      drawPyramid(ctx, 230, 200, 110, "#ca8a04", "#b45309");

      // 6. Oasis Pond and Palms
      drawOasis(ctx, 350, 360, 80, "#0284c7");
      drawPalmTree(ctx, 380, 330, 45, isMod); // diff 3: coconuts on palm tree

      // 7. Camel
      if (!isMod) {
        drawCamel(ctx, 250, 350, 35, "#78350f"); // diff 4: camel missing
      }
    }
  },
  {
    name: "겨울 왕국 (Winter Wonderland)",
    differences: [
      { id: 0, x: 220, y: 260, r: 25, label: "눈사람 주황색 당근 코" },
      { id: 1, x: 235, y: 205, r: 20, label: "눈사람 신사 모자 리본 색" },
      { id: 2, x: 80, y: 150, r: 20, label: "소나무 위 하늘색 별 장식" },
      { id: 3, x: 380, y: 280, r: 25, label: "눈 덮인 통나무 집 굴뚝" },
      { id: 4, x: 340, y: 380, r: 15, label: "눈밭 위의 아기 썰매" }
    ],
    draw(ctx, isMod) {
      // 1. Winter sky
      drawSky(ctx, "#bae6fd", "#38bdf8");

      // 2. Pine Tree with Snow
      drawTree(ctx, 80, 280, 60, "#475569", "#065f46");
      if (!isMod) {
        drawStar(ctx, 80, 150, 8, "#38bdf8"); // diff 2: star decoration
      }

      // 3. Snowy Ground
      drawGround(ctx, 330, "#f8fafc", "#e2e8f0");

      // 4. Snowman
      drawSnowman(ctx, 220, 250, 60, isMod); // diff 0: carrot nose on/off, diff 1: hat ribbon color

      // 5. Snowy Cabin
      drawHouse(ctx, 340, 260, 90, "#991b1b", "#cbd5e1", true);
      if (!isMod) {
        // Draw Chimney
        drawChimneyRect(ctx, 380, 280, "#475569"); // diff 3: chimney missing
      }

      // 6. Sled
      if (isMod) {
        drawSled(ctx, 340, 370, 25, "#b91c1c"); // diff 4: sled color or present
      }
    }
  },
  {
    name: "하늘섬 (Floating Island)",
    differences: [
      { id: 0, x: 220, y: 80, r: 25, label: "아름다운 일곱빛깔 무지개" },
      { id: 1, x: 100, y: 120, r: 25, label: "하늘을 나는 노란 열기구" },
      { id: 2, x: 340, y: 200, r: 30, label: "절벽 위 성탑 깃발 색" },
      { id: 3, x: 150, y: 310, r: 20, label: "폭포수 물보라 크기" },
      { id: 4, x: 380, y: 320, r: 20, label: "날아가는 한 마리의 흰 갈매기" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#c084fc", "#e0f2fe"); // lavender sky
      
      if (!isMod) {
        drawRainbow(ctx, 220, 180, 140); // diff 0: rainbow missing
      }

      if (!isMod) {
        drawBalloon(ctx, 100, 120, "#eab308"); // diff 1: hot air balloon
      }

      // Floating Island Ground
      drawFloatingIsland(ctx, 220, 280, 280, "#854d0e");

      // Castle tower
      drawCastleTower(ctx, 330, 200, 40, 100, "#94a3b8", isMod ? "#ef4444" : "#3b82f6"); // diff 2: flag color

      // Waterfall
      drawWaterfall(ctx, 150, 290, 20, 80, isMod ? 35 : 15); // diff 3: splash size

      // Gull
      if (isMod) {
        drawGull(ctx, 380, 110, 12); // diff 4: gull in different spot or missing
      } else {
        drawGull(ctx, 380, 320, 12);
      }
    }
  },
  {
    name: "달콤한 디저트 (Sweet Desserts)",
    differences: [
      { id: 0, x: 120, y: 160, r: 25, label: "컵케이크 위 빨간 체리" },
      { id: 1, x: 340, y: 180, r: 25, label: "생일 케이크 초 개수" },
      { id: 2, x: 340, y: 130, r: 15, label: "케이크 초 노란 불꽃" },
      { id: 3, x: 220, y: 320, r: 20, label: "분홍 롤리팝 사탕 무늬" },
      { id: 4, x: 100, y: 340, r: 20, label: "마카롱 크림 두께" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#fce7f3", "#fbcfe8"); // sweet pink bg

      // 1. Cupcake
      drawCupcake(ctx, 120, 220, 80, "#f472b6");
      if (!isMod) {
        drawCherry(ctx, 120, 160, 12); // diff 0: cherry missing
      }

      // 2. Birthday Cake
      drawCake(ctx, 320, 240, 120, "#fde047", isMod ? 1 : 2, isMod); // diff 1: candle counts, diff 2: flame

      // 3. Candies & Macarons
      drawLollipop(ctx, 220, 320, 30, isMod ? "striped" : "solid", "#a855f7"); // diff 3: candy pattern
      drawMacaron(ctx, 100, 340, 40, isMod ? 16 : 6, "#67e8f9"); // diff 4: macaron filling thickness
    }
  },
  {
    name: "가을 단풍 (Autumn Park)",
    differences: [
      { id: 0, x: 360, y: 290, r: 20, label: "나무 둥지 안의 귀여운 다람쥐" },
      { id: 1, x: 120, y: 320, r: 20, label: "공원 나무 잎새 색상" },
      { id: 2, x: 220, y: 330, r: 25, label: "가을 단풍 아래 빨간 벤치" },
      { id: 3, x: 160, y: 380, r: 15, label: "나무 밑 주황색 호박" },
      { id: 4, x: 280, y: 370, r: 15, label: "바닥에 떨어진 은행잎 수" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#fed7aa", "#ffedd5"); // warm yellow-orange sky
      
      // Trees
      drawTree(ctx, 120, 300, 50, "#78350f", isMod ? "#ea580c" : "#ca8a04"); // diff 1: tree color
      drawTree(ctx, 340, 280, 60, "#78350f", "#c2410c");

      // Squirrel
      if (!isMod) {
        drawSquirrel(ctx, 360, 290, 15); // diff 0: squirrel missing
      }

      // Ground
      drawGround(ctx, 340, "#fbbf24", "#d97706");

      // Bench
      if (!isMod) {
        drawBench(ctx, 220, 330, 80, "#b91c1c"); // diff 2: bench missing
      } else {
        drawBench(ctx, 220, 330, 80, "#475569"); // slate bench
      }

      // Pumpkin
      drawPumpkin(ctx, 160, 380, 18, isMod ? "#ea580c" : "#ca8a04"); // diff 3: pumpkin color/presence

      // Falling Leaves
      drawLeaf(ctx, 260, 380, "#c2410c");
      drawLeaf(ctx, 290, 370, "#ca8a04");
      if (!isMod) {
        drawLeaf(ctx, 280, 390, "#ea580c"); // diff 4: extra leaf
      }
    }
  },
  {
    name: "농장 풍경 (Farm Barn)",
    differences: [
      { id: 0, x: 120, y: 80, r: 25, label: "하늘 높이 도는 바람개비 풍차" },
      { id: 1, x: 340, y: 220, r: 35, label: "빨간 헛간 지붕 풍향계 닭" },
      { id: 2, x: 180, y: 320, r: 25, label: "농장 초록색 트랙터 바퀴 크기" },
      { id: 3, x: 90, y: 350, r: 20, label: "울타리 옆 젖소 얼굴 얼룩무늬" },
      { id: 4, x: 280, y: 380, r: 20, label: "바닥에 놓인 황금 짚단" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#bae6fd", "#e0f2fe");

      // Windmill
      drawWindmill(ctx, 120, 150, 40, isMod); // diff 0: blades count or angle
      
      // Ground
      drawGround(ctx, 320, "#86efac", "#16a34a");

      // Barn house
      drawHouse(ctx, 330, 240, 100, "#dc2626", "#cbd5e1", true);
      if (!isMod) {
        drawWeatherCock(ctx, 340, 220, 12); // diff 1: rooster vane missing
      }

      // Fence
      drawFence(ctx, 200, 320, 240);

      // Cow
      drawCow(ctx, 90, 350, 30, isMod); // diff 3: cow spot toggled

      // Tractor
      drawTractor(ctx, 180, 340, 60, isMod ? 18 : 12); // diff 2: wheel size

      // Straw Hay
      if (!isMod) {
        drawHayStack(ctx, 280, 385, 20); // diff 4: haystack missing
      }
    }
  },
  {
    name: "할로윈 파티 (Halloween Night)",
    differences: [
      { id: 0, x: 100, y: 100, r: 30, label: "붉은 보름달과 노란 색상 차이" },
      { id: 1, x: 320, y: 120, r: 25, label: "하늘을 나는 아기 박쥐 마리수" },
      { id: 2, x: 120, y: 360, r: 20, label: "유령 눈동자 모양" },
      { id: 3, x: 260, y: 370, r: 25, label: "잭오랜턴 호박 조각 표정" },
      { id: 4, x: 360, y: 360, r: 20, label: "마녀의 보라색 모자" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#180828", "#0f0515"); // spooky dark purple

      // Moon
      drawSun(ctx, 100, 100, 40, isMod ? "#ea580c" : "#facc15"); // diff 0: Moon color yellow vs orange

      // Bats
      drawBat(ctx, 320, 120, 15);
      if (!isMod) {
        drawBat(ctx, 270, 90, 10); // diff 1: extra bat
      }

      // Spooky ground
      drawGround(ctx, 340, "#1e293b", "#0f172a");

      // Ghost
      drawGhost(ctx, 120, 340, 35, isMod ? "wink" : "normal"); // diff 2: ghost eyes

      // Pumpkin Lantern
      drawJackolantern(ctx, 260, 370, 25, isMod ? "happy" : "scary"); // diff 3: smile mouth shape

      // Witch Hat
      if (!isMod) {
        drawWitchHat(ctx, 360, 360, 20, "#7e22ce"); // diff 4: purple hat missing/color
      }
    }
  },
  {
    name: "크리스마스 트리 (Christmas Tree)",
    differences: [
      { id: 0, x: 220, y: 120, r: 20, label: "트리 꼭대기 금빛 왕별" },
      { id: 1, x: 170, y: 220, r: 15, label: "오른쪽 나무 가지 빨간 방울" },
      { id: 2, x: 260, y: 280, r: 15, label: "파란 선물 상자 리본 색" },
      { id: 3, x: 120, y: 350, r: 20, label: "벽난로 크리스마스 양말 개수" },
      { id: 4, x: 340, y: 340, r: 25, label: "자는 아기 고양이 잠든 꼬리" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#1e293b", "#0f172a"); // warm dark room

      // Fireplace Background
      drawFireplace(ctx, 100, 340, 100, isMod ? 1 : 2); // diff 3: stockings counts

      // Christmas Tree
      drawTree(ctx, 220, 260, 80, "#78350f", "#047857");
      if (!isMod) {
        drawStar(ctx, 220, 120, 15, "#eab308"); // diff 0: top star missing
      } else {
        drawStar(ctx, 220, 120, 15, "#ef4444"); // red star
      }

      // Ornaments
      drawOrnament(ctx, 200, 180, "#ef4444");
      drawOrnament(ctx, 240, 200, "#3b82f6");
      if (!isMod) {
        drawOrnament(ctx, 170, 220, "#eab308"); // diff 1: orange ornament
      }

      // Presents
      drawPresent(ctx, 180, 350, 35, "#3b82f6", isMod ? "#ef4444" : "#eab308"); // diff 2: ribbon color
      drawPresent(ctx, 260, 360, 25, "#10b981", "#ffffff");

      // Cat
      drawSleepingCat(ctx, 340, 370, 20, isMod ? "striped" : "solid"); // diff 4: cat pattern
    }
  },
  {
    name: "놀이공원 (Amusement Park)",
    differences: [
      { id: 0, x: 220, y: 160, r: 35, label: "대관람차 노란 캐빈 수" },
      { id: 1, x: 80, y: 100, r: 20, label: "날아가는 핑크색 풍선" },
      { id: 2, x: 380, y: 220, r: 25, label: "서커스 천막 지붕 깃발 모양" },
      { id: 3, x: 130, y: 350, r: 20, label: "팝콘 리어카 유리 바퀴 살 수" },
      { id: 4, x: 280, y: 370, r: 20, label: "벤치 위 빨간 모자" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#c084fc", "#fed7aa"); // magical sunset sky

      // Ferris Wheel
      drawFerrisWheel(ctx, 220, 180, 90, isMod ? 4 : 6); // diff 0: cabin counts

      // Balloons
      drawBalloon(ctx, 120, 80, "#3b82f6");
      if (!isMod) {
        drawBalloon(ctx, 80, 100, "#ec4899"); // diff 1: pink balloon missing
      }

      // Ground
      drawGround(ctx, 330, "#a7f3d0", "#059669");

      // Circus Tent
      drawCircusTent(ctx, 370, 260, 80, isMod ? "triangle" : "flag"); // diff 2: flag type

      // Popcorn cart
      drawCart(ctx, 130, 350, 45, isMod ? 6 : 4); // diff 3: wheel spokes count

      // Bench & Hat
      drawBench(ctx, 280, 360, 60, "#78350f");
      if (!isMod) {
        drawCap(ctx, 280, 345, 10, "#ef4444"); // diff 4: red hat on bench missing
      }
    }
  },
  {
    name: "과학 연구소 (Science Lab)",
    differences: [
      { id: 0, x: 120, y: 140, r: 20, label: "화학 플라스크 시험관 거품 색상" },
      { id: 1, x: 230, y: 200, r: 25, label: "디지털 현미경 받침대 높이" },
      { id: 2, x: 360, y: 160, r: 25, label: "모니터 화면 그래프 방향" },
      { id: 3, x: 280, y: 350, r: 20, label: "선반 위 알코올 버너 심지 불꽃" },
      { id: 4, x: 100, y: 380, r: 20, label: "노란 연구노트 필기구 볼펜" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#1e293b", "#0f172a");

      // Shelves
      drawShelf(ctx, 50, 260, 350);

      // Lab Equipment
      drawBeaker(ctx, 120, 220, 30, isMod ? "#3b82f6" : "#10b981"); // diff 0: chemical color
      drawMicroscope(ctx, 230, 210, 40, isMod ? "high" : "low"); // diff 1: stage height
      drawMonitor(ctx, 360, 180, 60, isMod ? "down" : "up"); // diff 2: chart graph line

      // Burner
      drawBurner(ctx, 280, 320, 25, !isMod); // diff 3: burner flame active

      // Notebook
      drawNotebook(ctx, 100, 350, 35, "#eab308");
      if (!isMod) {
        drawPen(ctx, 130, 370, 15, "#ef4444"); // diff 4: pen missing
      }
    }
  },
  {
    name: "서부 개척시대 (Wild West)",
    differences: [
      { id: 0, x: 100, y: 220, r: 20, label: "왼쪽 키 큰 선인장 가지 개수" },
      { id: 1, x: 350, y: 100, r: 20, label: "서부 언덕 너머 독수리 날개짓" },
      { id: 2, x: 260, y: 220, r: 35, label: "목조 보안관 사무실 간판 글자" },
      { id: 3, x: 140, y: 350, r: 25, label: "바람에 굴러다니는 회전 마른풀" },
      { id: 4, x: 320, y: 370, r: 20, label: "마차 나무 수레바퀴살 개수" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#fecaca", "#f97316"); // red desert sky

      // Eagle
      if (!isMod) {
        drawEagle(ctx, 350, 100, 15); // diff 1: eagle missing
      }

      // Ground
      drawGround(ctx, 320, "#ca8a04", "#854d0e");

      // Cactuses
      drawCactus(ctx, 100, 260, 40, isMod ? 1 : 2); // diff 0: branches count

      // Saloon building
      drawSaloon(ctx, 240, 240, 110, isMod ? "SHERIFF" : "SALOON"); // diff 2: sign board text

      // Tumbleweed
      if (!isMod) {
        drawTumbleweed(ctx, 140, 350, 20); // diff 3: tumbleweed missing
      }

      // Cartwheel
      drawCartWheel(ctx, 320, 350, 30, isMod ? 8 : 5); // diff 4: wheel spokes count
    }
  },
  {
    name: "해적선 (Pirate Ship)",
    differences: [
      { id: 0, x: 220, y: 110, r: 25, label: "해적 돛대 깃발 해골 상징" },
      { id: 1, x: 90, y: 120, r: 20, label: "하늘을 나는 애완 앵무새" },
      { id: 2, x: 380, y: 220, r: 20, label: "무인도 섬 위 야자수 이파리" },
      { id: 3, x: 150, y: 330, r: 20, label: "해적선 선체 포문 구멍 개수" },
      { id: 4, x: 280, y: 380, r: 25, label: "황금 보물 상자 잠금 장치 열쇠" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#38bdf8", "#bae6fd");

      // Parrot
      if (!isMod) {
        drawParrot(ctx, 90, 120, 15); // diff 1: parrot missing
      }

      // Sea
      drawGround(ctx, 300, "#0284c7", "#0369a1");

      // Island
      drawIsland(ctx, 380, 280, 60);
      drawPalmTree(ctx, 380, 240, 30, isMod); // diff 2: palm nuts

      // Ship
      drawPirateShip(ctx, 200, 260, 160, isMod); // diff 0: skull flag icon, diff 3: cannons count

      // Treasure Chest
      drawTreasureChest(ctx, 280, 370, 35, isMod ? "open" : "locked"); // diff 4: lock state
    }
  },
  {
    name: "공룡 시대 (Dinosaur Era)",
    differences: [
      { id: 0, x: 120, y: 150, r: 25, label: "화산 폭발 붉은 용암 분출구" },
      { id: 1, x: 340, y: 100, r: 25, label: "하늘을 나는 익룡 날개깃" },
      { id: 2, x: 220, y: 280, r: 35, label: "목이 긴 초식공룡 피부 얼룩" },
      { id: 3, x: 110, y: 350, r: 20, label: "강가의 뾰족한 공룡 알 껍질" },
      { id: 4, x: 320, y: 380, r: 20, label: "고사리 식물 잎사귀 모양" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#fecaca", "#fca5a5"); // prehistoric orange sky

      // Volcano
      drawVolcano(ctx, 120, 220, 90, isMod); // diff 0: lava active or smoke only

      // Pterodactyl
      if (!isMod) {
        drawPterodactyl(ctx, 340, 100, 20); // diff 1: pterosaur missing
      }

      // Ground
      drawGround(ctx, 330, "#4d7c0f", "#365314");

      // Dinosaur
      drawSauropod(ctx, 220, 280, 80, isMod); // diff 2: body spots on/off

      // Eggs
      drawEgg(ctx, 110, 345, 15);
      if (!isMod) {
        drawEgg(ctx, 130, 355, 12); // diff 3: extra egg
      }

      // Fern
      drawFern(ctx, 320, 370, 20, isMod ? "curled" : "open"); // diff 4: fern leaf shape
    }
  },
  {
    name: "달콤한 꿈나라 (Cloud Dream)",
    differences: [
      { id: 0, x: 220, y: 100, r: 30, label: "별 무리를 잡은 달 해먹" },
      { id: 1, x: 100, y: 220, r: 25, label: "구름 속 은하수 별자리 선" },
      { id: 2, x: 220, y: 250, r: 25, label: "달 위에서 자는 아기곰 베개" },
      { id: 3, x: 340, y: 220, r: 25, label: "구름 위 분홍빛 하트 모양" },
      { id: 4, x: 280, y: 360, r: 20, label: "분홍 젖병 안의 우유 양" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#1e1b4b", "#311042"); // sweet night

      // Moon hammock
      drawCrescentMoon(ctx, 220, 150, 60, isMod ? "#eab308" : "#fef08a"); // diff 0: moon color

      // Sleeping Bear
      drawSleepingBear(ctx, 220, 220, 40, isMod); // diff 2: pillow missing or pink

      // Clouds
      drawCloud(ctx, 100, 240, 40);
      drawCloud(ctx, 340, 240, 35);
      
      // Star constellation lines
      if (!isMod) {
        drawConstellation(ctx, 100, 200); // diff 1: constellation lines
      }

      // Heart
      if (!isMod) {
        drawHeart(ctx, 340, 200, 15, "#ec4899"); // diff 3: pink heart
      }

      // Milk bottle
      drawMilkBottle(ctx, 280, 350, 30, isMod ? 0.4 : 0.8); // diff 4: milk height
    }
  },
  {
    name: "동양의 정원 (Eastern Garden)",
    differences: [
      { id: 0, x: 220, y: 150, r: 35, label: "정원 기와 정각 처마 현판" },
      { id: 1, x: 100, y: 220, r: 25, label: "벚나무 붉은 등불 조명" },
      { id: 2, x: 340, y: 240, r: 25, label: "대나무 둥근 잎새 모양" },
      { id: 3, x: 180, y: 350, r: 20, label: "연못 속 노란 비단잉어" },
      { id: 4, x: 300, y: 360, r: 15, label: "돌다리 위 다리 난간 수" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#ffedd5", "#fed7aa"); // soft oriental sky

      // Pagoda Pavilion
      drawPagoda(ctx, 220, 180, 80, isMod); // diff 0: pavilion sign board

      // Cherry blossom tree and lantern
      drawTree(ctx, 100, 240, 50, "#451a03", "#fbcfe8");
      if (!isMod) {
        drawLantern(ctx, 100, 220, "#ef4444"); // diff 1: lantern hanging
      }

      // Bamboo
      drawBamboo(ctx, 340, 250, 40, isMod ? "broad" : "narrow"); // diff 2: bamboo leaf shape

      // Pond and Bridge
      drawOasis(ctx, 200, 360, 120, "#38bdf8");
      drawBridge(ctx, 280, 350, 80, isMod ? 3 : 5); // diff 4: bridge rails count

      // Koi Fish
      if (!isMod) {
        drawKoi(ctx, 180, 350, 15, "#f97316"); // diff 3: orange koi fish
      }
    }
  },
  {
    name: "중세 성 (Medieval Castle)",
    differences: [
      { id: 0, x: 220, y: 100, r: 25, label: "성 중앙 탑 푸른 깃발" },
      { id: 1, x: 110, y: 210, r: 25, label: "왼쪽 방어벽 성문 화살 창틀" },
      { id: 2, x: 330, y: 240, r: 25, label: "오른쪽 성벽 벽돌 줄눈 무늬" },
      { id: 3, x: 150, y: 360, r: 20, label: "성문 경비 기사의 붉은 방패" },
      { id: 4, x: 280, y: 350, r: 25, label: "하늘을 나는 아기 초록용" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#93c5fd", "#bae6fd");

      // Castle Wall & Towers
      drawCastle(ctx, 220, 240, 160, isMod); // diff 0: tower flag color blue vs red, diff 1: wall slits window counts

      // Brick pattern detail on right tower
      drawBrickPattern(ctx, 330, 240, 25, isMod); // diff 2: brick lines missing on right tower

      // Ground
      drawGround(ctx, 330, "#4ade80", "#15803d");

      // Knight
      drawKnight(ctx, 150, 340, 30);
      if (!isMod) {
        drawShield(ctx, 165, 360, 10, "#ef4444"); // diff 3: shield missing
      }

      // Dragon
      if (isMod) {
        drawDragon(ctx, 280, 140, 25, "#22c55e"); // diff 4: baby dragon in sky
      }
    }
  },
  {
    name: "사파리 투어 (Safari Tour)",
    differences: [
      { id: 0, x: 120, y: 210, r: 35, label: "사파리 얼룩말 목덜미 갈기" },
      { id: 1, x: 260, y: 160, r: 35, label: "기린 긴 목 갈색 반점" },
      { id: 2, x: 360, y: 240, r: 25, label: "아카시아 나무 그늘 이파리" },
      { id: 3, x: 160, y: 360, r: 25, label: "투어 지프차 예비 타이어" },
      { id: 4, x: 280, y: 380, r: 20, label: "바닥 풀숲의 망원경" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#fed7aa", "#ffedd5"); // savanna yellow sky

      // Acacia tree
      drawAcaciaTree(ctx, 360, 240, 60, isMod ? "thick" : "thin"); // diff 2: foliage shape

      // Ground
      drawGround(ctx, 330, "#eab308", "#ca8a04");

      // Animals
      drawZebra(ctx, 120, 260, 45, isMod); // diff 0: zebra stripes color/pattern
      drawGiraffe(ctx, 260, 220, 70, isMod); // diff 1: giraffe spots on/off

      // Safari Jeep
      drawJeep(ctx, 160, 340, 65, isMod); // diff 3: spare tire on back active/missing

      // Binoculars
      if (!isMod) {
        drawBinoculars(ctx, 280, 380, 12); // diff 4: binoculars missing
      }
    }
  },
  {
    name: "장난감 방 (Toy Room)",
    differences: [
      { id: 0, x: 130, y: 200, r: 25, label: "목마 인형 주황색 가죽 안장" },
      { id: 1, x: 240, y: 140, r: 25, label: "선반 위 테디베어 곰인형 귀" },
      { id: 2, x: 340, y: 240, r: 25, label: "인형의 집 빨간색 삼각 지붕" },
      { id: 3, x: 120, y: 350, r: 20, label: "바닥 장난감 기차 바퀴살 수" },
      { id: 4, x: 250, y: 370, r: 25, label: "별 모양 고무공 색상 패턴" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#e0f2fe", "#bae6fd"); // room wallpaper

      // Toy Shelf
      drawShelf(ctx, 80, 160, 280);

      // Bear on shelf
      drawTeddyBear(ctx, 240, 120, 25, isMod ? "one-ear" : "two-ears"); // diff 1: bear ear missing

      // Rocking Horse
      drawRockingHorse(ctx, 130, 240, 50, isMod ? "#3b82f6" : "#f97316"); // diff 0: saddle color orange vs blue

      // Dollhouse
      drawHouse(ctx, 340, 210, 60, isMod ? "#3b82f6" : "#ef4444", "#fef08a", true); // diff 2: roof color red vs blue

      // Floor Toys
      drawToyTrain(ctx, 120, 350, 40, isMod ? 3 : 5); // diff 3: wheel spokes count
      drawToyBall(ctx, 250, 370, 25, isMod ? "star" : "striped"); // diff 4: ball patterns
    }
  },
  {
    name: "빵빵한 베이커리 (Bakery Shop)",
    differences: [
      { id: 0, x: 140, y: 160, r: 25, label: "오븐 속의 갈색 크루아상 빵" },
      { id: 1, x: 320, y: 120, r: 25, label: "칠판 메뉴판 분필 글씨 무늬" },
      { id: 2, x: 230, y: 220, r: 25, label: "진열대 유리병 속 딸기잼 색" },
      { id: 3, x: 150, y: 350, r: 20, label: "바닥 빵 바구니 바게트 수" },
      { id: 4, x: 280, y: 380, r: 20, label: "테이블 위 요리사 모자" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#fef3c7", "#fde68a"); // warm shop atmosphere

      // Oven & Menu
      drawOven(ctx, 140, 180, 60, isMod ? "empty" : "bread"); // diff 0: oven bread missing
      drawMenuBoard(ctx, 320, 140, 50, isMod ? "icon" : "text"); // diff 1: blackboard text vs cup icon

      // Counters & Jars
      drawCounter(ctx, 60, 260, 320);
      drawJamJar(ctx, 230, 220, 20, isMod ? "#10b981" : "#ef4444"); // diff 2: jam color red vs green

      // Bread basket & Chef Hat
      drawBreadBasket(ctx, 150, 350, 40, isMod ? 2 : 3); // diff 3: baguettes count
      if (!isMod) {
        drawChefHat(ctx, 280, 370, 18); // diff 4: chef hat on counter missing
      }
    }
  },
  {
    name: "캠핑 스팟 (Camping Site)",
    differences: [
      { id: 0, x: 120, y: 260, r: 35, label: "노란 텐트의 출입문 모양" },
      { id: 1, x: 260, y: 340, r: 25, label: "캠프파이어 모닥불 불꽃 크기" },
      { id: 2, x: 80, y: 120, r: 20, label: "밤하늘의 은빛 보름달" },
      { id: 3, x: 380, y: 320, r: 20, label: "캠핑 의자 위의 초록 등받이" },
      { id: 4, x: 340, y: 150, r: 15, label: "나무 뒤 밤하늘 아기별 수" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#0f172a", "#1e1b4b"); // night sky

      // Moon
      drawSun(ctx, 80, 120, isMod ? 15 : 25, "#fef08a"); // diff 2: moon size

      // Stars
      drawStar(ctx, 340, 150, 6, "#ffffff");
      if (!isMod) {
        drawStar(ctx, 320, 130, 4, "#ffffff"); // diff 4: extra star
      }

      // Pines
      drawTree(ctx, 340, 280, 50, "#451a03", "#064e3b");

      // Ground
      drawGround(ctx, 330, "#166534", "#14532d");

      // Tent
      drawTent(ctx, 120, 300, 70, isMod ? "round" : "triangle"); // diff 0: tent door shape

      // Campfire
      drawCampfire(ctx, 260, 350, 30, isMod ? "high" : "low"); // diff 1: fire flame size

      // Camp chair
      drawCampChair(ctx, 380, 330, 25, isMod ? "#3b82f6" : "#10b981"); // diff 3: chair color green vs blue
    }
  },
  {
    name: "공항 터미널 (Airport Runway)",
    differences: [
      { id: 0, x: 180, y: 180, r: 35, label: "활주로 비행기 꼬리 날개 무늬" },
      { id: 1, x: 340, y: 140, r: 25, label: "관제탑 상단 레이더 회전 돔" },
      { id: 2, x: 70, y: 90, r: 20, label: "하늘에 흐르는 하얀 구름" },
      { id: 3, x: 100, y: 350, r: 20, label: "수하물 이동 수레 가방 개수" },
      { id: 4, x: 260, y: 370, r: 15, label: "활주로 유도등 노란 색깔" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#7dd3fc", "#bae6fd");

      // Clouds
      drawCloud(ctx, 220, 80, 20);
      if (!isMod) {
        drawCloud(ctx, 70, 90, 25); // diff 2: cloud missing
      }

      // Control tower
      drawControlTower(ctx, 340, 200, 30, 120, isMod ? "flat" : "dome"); // diff 1: radar shape

      // Runway
      drawGround(ctx, 300, "#475569", "#334155");

      // Airplane
      drawAirplane(ctx, 180, 240, 120, isMod); // diff 0: wing stripe markings

      // Luggage Cart
      drawCart(ctx, 100, 340, 35, isMod ? 1 : 3); // diff 3: bags count

      // Runway guide lights
      drawGuideLight(ctx, 220, 350, "#ef4444");
      drawGuideLight(ctx, 260, 370, isMod ? "#10b981" : "#eab308"); // diff 4: light color yellow vs green
    }
  },
  {
    name: "해변의 휴일 (Sunny Beach)",
    differences: [
      { id: 0, x: 140, y: 220, r: 35, label: "비치 파라솔 줄무늬 색상" },
      { id: 1, x: 350, y: 80, r: 25, label: "작열하는 뜨거운 주황 태양" },
      { id: 2, x: 280, y: 240, r: 30, label: "모래사장 위 예쁜 돗자리 무늬" },
      { id: 3, x: 90, y: 380, r: 15, label: "바닷가 모래 위 붉은 바다게" },
      { id: 4, x: 220, y: 350, r: 20, label: "모래 언덕 위 쌓인 모래성" }
    ],
    draw(ctx, isMod) {
      // Sea & Sky
      drawSky(ctx, "#0284c7", "#38bdf8");
      
      // Sun
      drawSun(ctx, 350, 80, isMod ? 30 : 20, "#ea580c"); // diff 1: sun size

      // Sandy shore
      drawGround(ctx, 280, "#fef08a", "#fef08a");

      // Parasol
      drawParasol(ctx, 140, 240, 60, isMod ? "#ef4444" : "#a855f7"); // diff 0: umbrella color red vs purple

      // Beach mat
      drawBeachMat(ctx, 280, 300, 50, isMod ? "striped" : "solid"); // diff 2: mat pattern

      // Sandcastle
      if (!isMod) {
        drawSandcastle(ctx, 220, 340, 22); // diff 4: sandcastle missing
      }

      // Crab
      if (!isMod) {
        drawCrab(ctx, 90, 380, 10); // diff 3: crab missing
      }
    }
  },
  {
    name: "음악 교실 (Music Class)",
    differences: [
      { id: 0, x: 120, y: 200, r: 30, label: "피아노 건반 위 악보 거치대" },
      { id: 1, x: 260, y: 160, r: 25, label: "바이올린 현 울림구 구멍 무늬" },
      { id: 2, x: 340, y: 240, r: 20, label: "칠판 위의 높은음자리표 기호" },
      { id: 3, x: 150, y: 340, r: 20, label: "바닥 기타 줄 감개 머리 수" },
      { id: 4, x: 260, y: 360, r: 15, label: "피아노 의자 아래 둥근 쿠션" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#ffedd5", "#fed7aa"); // room wallpaper

      // Metronome/Menu board
      drawMenuBoard(ctx, 340, 180, 45, isMod ? "notes" : "clef"); // diff 2: blackboard clef vs notes

      // Piano
      drawPiano(ctx, 100, 220, 70, isMod); // diff 0: sheet music stand active/missing

      // Violin & Guitar
      drawViolin(ctx, 260, 210, 35, isMod ? "solid" : "hollow"); // diff 1: violin body lines
      drawGuitar(ctx, 150, 320, 45, isMod ? 4 : 6); // diff 3: guitar tuner pegs count

      // Bench
      drawBench(ctx, 260, 350, 40, "#78350f");
      if (!isMod) {
        drawCushion(ctx, 260, 340, 6); // diff 4: seat cushion missing
      }
    }
  },
  {
    name: "화가 화실 (Artist Studio)",
    differences: [
      { id: 0, x: 150, y: 200, r: 35, label: "이젤 캔버스 위에 그려진 그림 색" },
      { id: 1, x: 280, y: 220, r: 25, label: "물감 팔레트 붓꽂이 붓 자루 수" },
      { id: 2, x: 100, y: 330, r: 20, label: "테이블 위 꽃병의 장미 꽃송이 수" },
      { id: 3, x: 340, y: 320, r: 25, label: "벽 조명 아래 액자 액자 프레임" },
      { id: 4, x: 230, y: 370, r: 15, label: "바닥 물감 튜브 마개 색깔" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#cbd5e1", "#cbd5e1");

      // Easel with Canvas painting
      drawEasel(ctx, 150, 220, 60, isMod ? "#3b82f6" : "#ef4444"); // diff 0: canvas painting color blue vs red

      // Table & Palette
      drawCounter(ctx, 50, 280, 350);
      drawPalette(ctx, 280, 230, 30, isMod ? 1 : 2); // diff 1: paintbrushes count

      // Vase and Picture Frame
      drawVase(ctx, 100, 320, 20, isMod ? 2 : 3); // diff 2: rose counts
      drawPictureFrame(ctx, 340, 160, 40, isMod ? "circle" : "square"); // diff 3: frame shape

      // Paint tube
      drawPaintTube(ctx, 230, 360, 12, isMod ? "#ef4444" : "#eab308"); // diff 4: tube cap yellow vs red
    }
  },
  {
    name: "아늑한 도서관 (Cozy Library)",
    differences: [
      { id: 0, x: 120, y: 150, r: 25, label: "책장 두 번째 선반 파란 책" },
      { id: 1, x: 260, y: 220, r: 25, label: "안락의자 등받이 격자 단추" },
      { id: 2, x: 360, y: 180, r: 20, label: "탁상 독서 스탠드 전등 불빛" },
      { id: 3, x: 140, y: 350, r: 20, label: "바닥에 쌓인 빨간 책 더미 수" },
      { id: 4, x: 280, y: 380, r: 15, label: "탁자 위 따뜻한 머그잔 찻잔 손잡이" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#451a03", "#292524"); // warm study walls

      // Bookshelves
      drawBookshelf(ctx, 120, 180, 80, isMod); // diff 0: blue book toggled missing

      // Armchair
      drawArmchair(ctx, 260, 240, 50, isMod ? "plain" : "tufted"); // diff 1: tufted buttons on chair

      // Desk & Lamp
      drawCounter(ctx, 220, 290, 180);
      drawLamp(ctx, 360, 240, 20, !isMod); // diff 2: lamp light active on original

      // Books pile
      drawBooksPile(ctx, 140, 360, 25, isMod ? 3 : 5); // diff 3: book stack counts

      // Mug cup
      drawMug(ctx, 280, 370, 10, isMod ? "left" : "right"); // diff 4: handle direction
    }
  },
  {
    name: "사이버펑크 거리 (Cyberpunk Alley)",
    differences: [
      { id: 0, x: 100, y: 80, r: 25, label: "네온 빌보드 간판 한자 광고" },
      { id: 1, x: 280, y: 120, r: 20, label: "공중에 떠 있는 아기 드론 눈알" },
      { id: 2, x: 360, y: 220, r: 25, label: "가로등 네온 바 전구 빛 색상" },
      { id: 3, x: 180, y: 340, r: 35, label: "하늘을 나는 호버카 후방 제트 엔진" },
      { id: 4, x: 280, y: 380, r: 15, label: "길가에 세워진 홀로그램 삼각 콘" }
    ],
    draw(ctx, isMod) {
      drawSky(ctx, "#090514", "#1b0a2a"); // neon midnight

      // Neon Sign
      drawNeonSign(ctx, 100, 80, 60, isMod ? "BAR" : "龍"); // diff 0: logo text Kanji vs English

      // Drone
      drawDrone(ctx, 280, 120, 15, isMod ? "red" : "blue"); // diff 1: drone lens color

      // Neon Street Lamp
      drawNeonLamp(ctx, 360, 200, 15, isMod ? "#ec4899" : "#06b6d4"); // diff 2: cyan vs pink neon light

      // Hovercar
      drawHovercar(ctx, 180, 320, 80, isMod); // diff 3: engine jet flames counts

      // Road cone
      if (!isMod) {
        drawRoadCone(ctx, 280, 380, 12, "#3b82f6"); // diff 4: holographic cone missing
      }
    }
  }
];

// --- Procedural Canvas Vector Drawing Utilities ---

function drawSky(ctx, c1, c2) {
  const grad = ctx.createLinearGradient(0, 0, 0, 450);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 450, 450);
}

function drawGround(ctx, y, c1, c2) {
  ctx.fillStyle = c1;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(450, y + 20);
  ctx.lineTo(450, 450);
  ctx.lineTo(0, 450);
  ctx.closePath();
  ctx.fill();

  // Grass / road variations
  ctx.fillStyle = c2;
  ctx.beginPath();
  ctx.ellipse(120, y + 40, 150, 30, 0.1, 0, Math.PI * 2);
  ctx.ellipse(340, y + 50, 180, 40, -0.1, 0, Math.PI * 2);
  ctx.fill();
}

function drawSun(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(x, y, r - 5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fill();
  ctx.shadowBlur = 0; // reset
}

function drawStar(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * size + x,
               Math.sin((18 + i * 72) * Math.PI / 180) * size + y);
    ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (size/2) + x,
               Math.sin((54 + i * 72) * Math.PI / 180) * (size/2) + y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawCloud(ctx, x, y, r) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.arc(x - r * 0.7, y + r * 0.2, r * 0.7, 0, Math.PI * 2);
  ctx.arc(x + r * 0.7, y + r * 0.2, r * 0.7, 0, Math.PI * 2);
  ctx.arc(x - r * 0.3, y - r * 0.5, r * 0.8, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

function drawTree(ctx, x, y, h, cTrunk, cLeaves) {
  // Trunk
  ctx.fillStyle = cTrunk;
  ctx.fillRect(x - h * 0.1, y - h * 0.3, h * 0.2, h * 0.6);

  // Leaves
  ctx.fillStyle = cLeaves;
  ctx.beginPath();
  ctx.arc(x, y - h * 0.6, h * 0.4, 0, Math.PI * 2);
  ctx.arc(x - h * 0.25, y - h * 0.45, h * 0.3, 0, Math.PI * 2);
  ctx.arc(x + h * 0.25, y - h * 0.45, h * 0.3, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

function drawHouse(ctx, x, y, size, roofColor, wallColor, lightOn) {
  // Walls
  ctx.fillStyle = wallColor;
  ctx.fillRect(x - size * 0.4, y - size * 0.1, size * 0.8, size * 0.6);

  // Roof
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y - size * 0.1);
  ctx.lineTo(x + size * 0.5, y - size * 0.1);
  ctx.lineTo(x, y - size * 0.5);
  ctx.closePath();
  ctx.fill();

  // Door
  ctx.fillStyle = "#78350f";
  ctx.fillRect(x - size * 0.1, y + size * 0.2, size * 0.2, size * 0.3);

  // Door handle
  ctx.fillStyle = "#eab308";
  ctx.beginPath();
  ctx.arc(x + size * 0.06, y + size * 0.35, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Window
  ctx.fillStyle = lightOn ? "#fef08a" : "#334155";
  ctx.fillRect(x - size * 0.3, y + size * 0.1, size * 0.18, size * 0.18);
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - size * 0.3, y + size * 0.1, size * 0.18, size * 0.18);
}

function drawSmoke(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.arc(x - 10, y - 20, r * 1.2, 0, Math.PI * 2);
  ctx.arc(x + 10, y - 40, r * 1.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlower(ctx, x, y, color) {
  ctx.fillStyle = "#22c55e"; // stem
  ctx.fillRect(x - 1, y, 2, 20);

  // Petals
  ctx.fillStyle = color;
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72) * Math.PI / 180;
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * 6 + x, Math.sin(angle) * 6 + y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Center
  ctx.fillStyle = "#eab308";
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawSaturn(ctx, x, y, r, color) {
  // Planet
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Ring
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 8;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(0.3);
  ctx.scale(2.2, 0.35);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.lineWidth = 1;
}

function drawPlanet(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // texture strip
  ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, r, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

function drawUfo(ctx, x, y, w, color, windows) {
  // Bottom thrust glow
  ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
  ctx.beginPath();
  ctx.ellipse(x, y + w * 0.1, w * 0.3, w * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Disc body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, w * 0.5, w * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cockpit dome
  ctx.fillStyle = "rgba(14, 165, 233, 0.6)";
  ctx.beginPath();
  ctx.arc(x, y - w * 0.05, w * 0.25, Math.PI, 0);
  ctx.closePath();
  ctx.fill();

  // Windows lights
  ctx.fillStyle = "#fbbf24";
  for (let i = 0; i < windows; i++) {
    const angle = Math.PI + ((i + 1) / (windows + 1)) * Math.PI;
    const wx = x + Math.cos(angle) * (w * 0.35);
    const wy = y + Math.sin(angle) * (w * 0.1);
    ctx.beginPath();
    ctx.arc(wx, wy, w * 0.035, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFire(ctx, x, y, h) {
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, "#fbbf24");
  grad.addColorStop(0.5, "#f97316");
  grad.addColorStop(1, "rgba(239, 68, 68, 0)");
  ctx.fillStyle = grad;
  
  ctx.beginPath();
  ctx.moveTo(x - 10, y);
  ctx.quadraticCurveTo(x - 15, y + h * 0.5, x, y + h);
  ctx.quadraticCurveTo(x + 15, y + h * 0.5, x + 10, y);
  ctx.closePath();
  ctx.fill();
}

function drawBubble(ctx, x, y, r) {
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // bubble light glint
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawFish(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  
  // Body
  ctx.beginPath();
  ctx.ellipse(x, y, size, size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x - size * 1.5, y - size * 0.6);
  ctx.lineTo(x - size * 1.5, y + size * 0.6);
  ctx.closePath();
  ctx.fill();

  // Eye
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x + size * 0.4, y - size * 0.15, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(x + size * 0.45, y - size * 0.15, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
}

function drawCoral(ctx, x, y, branches, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";

  // Base stem
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 30);
  ctx.stroke();

  // Branches
  for (let i = 0; i < branches; i++) {
    const dirX = (i % 2 === 0 ? 1 : -1) * (15 + i * 5);
    const heightY = 20 + i * 8;
    ctx.beginPath();
    ctx.moveTo(x, y - 15 - i * 5);
    ctx.quadraticCurveTo(x + dirX * 0.5, y - 20 - heightY, x + dirX, y - 25 - heightY);
    ctx.stroke();
  }
  ctx.lineWidth = 1;
}

function drawStarfish(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * r + x,
               Math.sin((18 + i * 72) * Math.PI / 180) * r + y);
    ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (r * 0.4) + x,
               Math.sin((54 + i * 72) * Math.PI / 180) * (r * 0.4) + y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawSubmarine(ctx, x, y, w, color, isMod) {
  // Hull body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, w * 0.5, w * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cockpit / window
  ctx.fillStyle = "rgba(6, 182, 212, 0.7)";
  ctx.beginPath();
  ctx.arc(x + w * 0.1, y - w * 0.05, w * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Periscope
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.15, y - w * 0.25);
  ctx.lineTo(x - w * 0.15, y - w * 0.45);
  ctx.lineTo(x - w * 0.05, y - w * 0.45);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Propeller on back
  ctx.fillStyle = isMod ? "#334155" : "#cbd5e1"; // diff 2: yellow vs gray propeller
  ctx.save();
  ctx.translate(x - w * 0.53, y);
  ctx.rotate(isMod ? 0.7 : 0);
  ctx.fillRect(-6, -w * 0.25, 12, w * 0.5);
  ctx.restore();
}

function drawBuilding(ctx, x, y, w, h, color, windowsOn) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);

  // windows
  if (windowsOn) {
    ctx.fillStyle = "#fef08a";
    const cols = Math.floor(w / 20);
    const rows = Math.floor(h / 30);
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        // randomly toggle light
        if ((c + r) % 2 === 0) {
          ctx.fillRect(x + 8 + c * 18, y + 10 + r * 25, 8, 12);
        }
      }
    }
  }
}

function drawAntennaTower(ctx, x, y, w, h, color, wires) {
  ctx.fillStyle = color;
  ctx.fillRect(x - 6, y, 12, h); // base post

  // spikes
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 2;
  for (let i = 0; i < wires; i++) {
    const wy = y + 10 + i * 20;
    ctx.beginPath();
    ctx.moveTo(x - 20, wy);
    ctx.lineTo(x + 20, wy);
    ctx.stroke();
  }
  ctx.lineWidth = 1;

  // beacon tip red light
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(x, y - 5, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawSignPost(ctx, x, y, color) {
  ctx.fillStyle = "#475569";
  ctx.fillRect(x - 3, y, 6, 40);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - 15, y);
  ctx.lineTo(x + 15, y);
  ctx.lineTo(x + 25, y + 10);
  ctx.lineTo(x + 15, y + 20);
  ctx.lineTo(x - 15, y + 20);
  ctx.closePath();
  ctx.fill();
}

function drawCarEntity(ctx, x, y, w, color, headlightsOn) {
  ctx.fillStyle = color;
  
  // Body
  ctx.fillRect(x, y + 12, w, 15);
  ctx.fillRect(x + w * 0.2, y, w * 0.6, 12);

  // Wheels
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(x + w * 0.25, y + 27, 8, 0, Math.PI * 2);
  ctx.arc(x + w * 0.75, y + 27, 8, 0, Math.PI * 2);
  ctx.fill();

  // Headlight beams
  if (headlightsOn) {
    const grad = ctx.createLinearGradient(x - 5, y + 15, x - 50, y + 15);
    grad.addColorStop(0, "rgba(251, 191, 36, 0.8)");
    grad.addColorStop(1, "rgba(251, 191, 36, 0)");
    ctx.fillStyle = grad;
    
    ctx.beginPath();
    ctx.moveTo(x, y + 12);
    ctx.lineTo(x - 50, y + 5);
    ctx.lineTo(x - 50, y + 30);
    ctx.lineTo(x, y + 22);
    ctx.closePath();
    ctx.fill();
  }
}

function drawPyramid(ctx, x, y, size, color, shadowColor) {
  // shadow side
  ctx.fillStyle = shadowColor;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.5, y + size * 0.8);
  ctx.lineTo(x, y);
  ctx.lineTo(x + size, y + size * 0.8);
  ctx.closePath();
  ctx.fill();

  // light side
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.8);
  ctx.lineTo(x, y);
  ctx.lineTo(x + size * 0.5, y + size * 0.8);
  ctx.closePath();
  ctx.fill();
}

function drawOasis(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawPalmTree(ctx, x, y, h, isMod) {
  // Trunk
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y + 40);
  ctx.quadraticCurveTo(x - 10, y + 20, x, y);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Fronds
  ctx.fillStyle = "#15803d";
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72) * Math.PI / 180;
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(angle) * 12, y + Math.sin(angle) * 5, 20, 6, angle, 0, Math.PI * 2);
    ctx.fill();
  }

  // Coconuts
  if (!isMod) {
    ctx.fillStyle = "#78350f";
    ctx.beginPath();
    ctx.arc(x - 3, y + 4, 3, 0, Math.PI * 2);
    ctx.arc(x + 3, y + 4, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCamel(ctx, x, y, h, color) {
  ctx.fillStyle = color;
  // body
  ctx.fillRect(x - h * 0.5, y - h * 0.2, h, h * 0.4);
  // hump
  ctx.beginPath();
  ctx.arc(x, y - h * 0.2, h * 0.35, Math.PI, 0);
  ctx.fill();
  // neck/head
  ctx.fillRect(x - h * 0.6, y - h * 0.7, h * 0.15, h * 0.6);
  ctx.fillRect(x - h * 0.8, y - h * 0.7, h * 0.3, h * 0.15);
  // legs
  ctx.fillRect(x - h * 0.4, y + h * 0.2, h * 0.1, h * 0.6);
  ctx.fillRect(x + h * 0.3, y + h * 0.2, h * 0.1, h * 0.6);
}

function drawSnowman(ctx, x, y, r, isMod) {
  // Lower body
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x, y + r * 0.3, r * 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#cbd5e1";
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.arc(x, y - r * 0.4, r * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eyes & smile
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(x - 5, y - r * 0.45, 3, 0, Math.PI * 2);
  ctx.arc(x + 5, y - r * 0.45, 3, 0, Math.PI * 2);
  ctx.fill();

  // Carrot Nose
  if (!isMod) {
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.moveTo(x, y - r * 0.38);
    ctx.lineTo(x + 15, y - r * 0.38);
    ctx.lineTo(x, y - r * 0.32);
    ctx.closePath();
    ctx.fill();
  }

  // Tophat
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(x - r * 0.35, y - r * 0.78, r * 0.7, r * 0.1);
  ctx.fillRect(x - r * 0.22, y - r * 1.15, r * 0.44, r * 0.38);

  // Hat ribbon
  ctx.fillStyle = isMod ? "#3b82f6" : "#ef4444"; // diff 1: ribbon color red vs blue
  ctx.fillRect(x - r * 0.22, y - r * 0.85, r * 0.44, r * 0.08);
}

function drawChimneyRect(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x - 6, y - 20, 12, 25);
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(x - 8, y - 25, 16, 5);
}

function drawSled(ctx, x, y, w, color) {
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.5, y + 10);
  ctx.lineTo(x + w * 0.5, y + 10);
  ctx.lineTo(x + w * 0.6, y + 2);
  ctx.stroke();
  ctx.lineWidth = 1;

  ctx.fillStyle = color;
  ctx.fillRect(x - w * 0.4, y, w * 0.8, 8);
}

function drawRainbow(ctx, x, y, r) {
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"];
  ctx.save();
  ctx.lineWidth = 4;
  colors.forEach((c, idx) => {
    ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, r - idx * 4, Math.PI, 0);
    ctx.stroke();
  });
  ctx.restore();
}

function drawBalloon(ctx, x, y, color) {
  // rope
  ctx.strokeStyle = "#64748b";
  ctx.beginPath();
  ctx.moveTo(x, y + 15);
  ctx.lineTo(x, y + 40);
  ctx.stroke();

  // balloon
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.fill();

  // knot
  ctx.beginPath();
  ctx.moveTo(x - 3, y + 15);
  ctx.lineTo(x + 3, y + 15);
  ctx.lineTo(x, y + 18);
  ctx.closePath();
  ctx.fill();
}

function drawFloatingIsland(ctx, x, y, w, color) {
  // Ground grass
  ctx.fillStyle = "#86efac";
  ctx.beginPath();
  ctx.ellipse(x, y, w * 0.5, w * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rock base underneath
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.5, y);
  ctx.quadraticCurveTo(x, y + w * 0.4, x + w * 0.5, y);
  ctx.lineTo(x + w * 0.4, y);
  ctx.lineTo(x - w * 0.4, y);
  ctx.closePath();
  ctx.fill();
}

function drawCastleTower(ctx, x, y, w, h, color, flagColor) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);

  // Battlement slots
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x + w * 0.2, y, w * 0.2, 10);
  ctx.fillRect(x + w * 0.6, y, w * 0.2, 10);

  // Roof flag pole
  ctx.strokeStyle = "#64748b";
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y);
  ctx.lineTo(x + w * 0.5, y - 25);
  ctx.stroke();

  // Flag
  ctx.fillStyle = flagColor;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y - 25);
  ctx.lineTo(x + w * 0.5 - 20, y - 18);
  ctx.lineTo(x + w * 0.5, y - 12);
  ctx.closePath();
  ctx.fill();
}

function drawWaterfall(ctx, x, y, w, h, splashSize) {
  ctx.fillStyle = "rgba(56, 189, 248, 0.8)";
  ctx.fillRect(x, y, w, h);

  // Splash circles
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.arc(x + w * 0.5, y + h, splashSize, 0, Math.PI * 2);
  ctx.fill();
}

function drawGull(ctx, x, y, w) {
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - w, y);
  ctx.quadraticCurveTo(x - w * 0.5, y - w * 0.5, x, y);
  ctx.quadraticCurveTo(x + w * 0.5, y - w * 0.5, x + w, y);
  ctx.stroke();
  ctx.lineWidth = 1;
}

function drawCupcake(ctx, x, y, w, color) {
  // Wrapper cup
  ctx.fillStyle = "#d97706";
  ctx.beginPath();
  ctx.moveTo(x - w * 0.4, y + w * 0.4);
  ctx.lineTo(x - w * 0.25, y + w * 0.9);
  ctx.lineTo(x + w * 0.25, y + w * 0.9);
  ctx.lineTo(x + w * 0.4, y + w * 0.4);
  ctx.closePath();
  ctx.fill();

  // Cream frosting
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y + w * 0.3, w * 0.35, 0, Math.PI * 2);
  ctx.arc(x - w * 0.25, y + w * 0.35, w * 0.25, 0, Math.PI * 2);
  ctx.arc(x + w * 0.25, y + w * 0.35, w * 0.25, 0, Math.PI * 2);
  ctx.arc(x, y + w * 0.1, w * 0.28, 0, Math.PI * 2);
  ctx.fill();
}

function drawCherry(ctx, x, y, r) {
  // Stem
  ctx.strokeStyle = "#16a34a";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + 10, y - 20, x + 20, y - 30);
  ctx.stroke();

  // Berry
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawCake(ctx, x, y, w, color, candles, isMod) {
  // Base Cake
  ctx.fillStyle = "#fbcfe8";
  ctx.fillRect(x - w * 0.5, y + w * 0.3, w, w * 0.5);

  // Frosting layer
  ctx.fillStyle = color;
  ctx.fillRect(x - w * 0.5, y + w * 0.3, w, w * 0.12);

  // Sprinkles decoration
  ctx.fillStyle = "#f43f5e";
  ctx.fillRect(x - w * 0.3, y + w * 0.5, 4, 10);
  ctx.fillStyle = "#3b82f6";
  ctx.fillRect(x + w * 0.2, y + w * 0.6, 10, 4);

  // Candles
  ctx.fillStyle = "#a855f7";
  for (let i = 0; i < candles; i++) {
    const cx = x - w * 0.2 + i * (w * 0.4);
    ctx.fillRect(cx - 3, y + w * 0.1, 6, w * 0.25);

    // Candle fire
    if (!isMod || i === 0) {
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.ellipse(cx, y + w * 0.04, 4, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawLollipop(ctx, x, y, r, type, color) {
  // Stick
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 60);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Candy body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Pattern
  if (type === "striped") {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.7, 0.5, Math.PI - 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, r * 0.4, 0.8, Math.PI - 0.8);
    ctx.stroke();
    ctx.lineWidth = 1;
  }
}

function drawMacaron(ctx, x, y, w, fillingThickness, color) {
  ctx.fillStyle = color;
  // Top shell
  ctx.beginPath();
  ctx.ellipse(x, y - 5, w * 0.5, 10, 0, Math.PI, 0);
  ctx.closePath();
  ctx.fill();

  // Bottom shell
  ctx.beginPath();
  ctx.ellipse(x, y + 5, w * 0.5, 10, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fill();

  // Cream filling
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - w * 0.45, y - 3, w * 0.9, fillingThickness);
}

function drawSquirrel(ctx, x, y, size) {
  ctx.fillStyle = "#b45309";
  // body
  ctx.beginPath();
  ctx.ellipse(x, y, size, size * 0.7, 0.4, 0, Math.PI*2);
  ctx.fill();
  // head
  ctx.beginPath();
  ctx.arc(x - size * 0.6, y - size * 0.4, size * 0.5, 0, Math.PI * 2);
  ctx.fill();
  // tail
  ctx.beginPath();
  ctx.ellipse(x + size * 0.8, y - size * 0.3, size * 0.7, size * 0.4, -0.6, 0, Math.PI * 2);
  ctx.fill();
}

function drawBench(ctx, x, y, w, color) {
  ctx.fillStyle = color;
  // seat
  ctx.fillRect(x - w * 0.5, y, w, 8);
  // legs
  ctx.fillRect(x - w * 0.4, y + 8, 6, 20);
  ctx.fillRect(x + w * 0.3, y + 8, 6, 20);
}

function drawPumpkin(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  // draws 3 overlapping ellipses for pumpkin rib texture
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.9, 0, 0, Math.PI * 2);
  ctx.ellipse(x - r * 0.3, y, r * 0.7, r * 0.9, 0, 0, Math.PI * 2);
  ctx.ellipse(x + r * 0.3, y, r * 0.7, r * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();

  // stem
  ctx.fillStyle = "#15803d";
  ctx.fillRect(x - 2, y - r - 4, 4, 6);
}

function drawLeaf(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(0.5);
  ctx.beginPath();
  ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawWindmill(ctx, x, y, size, isMod) {
  // Tower post
  ctx.fillStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.moveTo(x - 8, y + 60);
  ctx.lineTo(x - 4, y);
  ctx.lineTo(x + 4, y);
  ctx.lineTo(x + 8, y + 60);
  ctx.closePath();
  ctx.fill();

  // Spinning blades
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 3;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(isMod ? 0.8 : 0);
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -size);
    ctx.stroke();
    // sails
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(2, -size, 8, size * 0.7);
    ctx.rotate(Math.PI / 2);
  }
  ctx.restore();
  ctx.lineWidth = 1;
}

function drawWeatherCock(ctx, x, y, r) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(x - 2, y, 4, 15);
  // chicken silhouette
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawFence(ctx, x, y, w) {
  ctx.fillStyle = "#cbd5e1";
  ctx.fillRect(x - w * 0.5, y + 10, w, 4);
  ctx.fillRect(x - w * 0.5, y + 25, w, 4);

  // vertical pickets
  const pickets = Math.floor(w / 30);
  for (let i = 0; i < pickets; i++) {
    ctx.fillRect(x - w * 0.45 + i * 30, y, 5, 35);
  }
}

function drawCow(ctx, x, y, size, isMod) {
  ctx.fillStyle = "#ffffff";
  // body
  ctx.fillRect(x - size * 0.5, y - size * 0.3, size, size * 0.6);
  // legs
  ctx.fillRect(x - size * 0.4, y + size * 0.3, 5, size * 0.4);
  ctx.fillRect(x + size * 0.2, y + size * 0.3, 5, size * 0.4);

  // Cow spots
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(x - size * 0.2, y - size * 0.1, size * 0.15, 0, Math.PI * 2);
  ctx.arc(x + size * 0.2, y + size * 0.1, size * 0.12, 0, Math.PI * 2);
  if (!isMod) {
    ctx.arc(x, y - size * 0.2, size * 0.1, 0, Math.PI * 2); // diff 3: spot missing
  }
  ctx.fill();
}

function drawTractor(ctx, x, y, w, rearWheelR) {
  ctx.fillStyle = "#16a34a"; // green tractor body
  ctx.fillRect(x - w * 0.4, y - w * 0.2, w * 0.8, w * 0.3);
  ctx.fillRect(x - w * 0.1, y - w * 0.5, w * 0.4, w * 0.3);

  // Big rear wheel
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(x - w * 0.3, y + w * 0.1, rearWheelR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e2e8f0";
  ctx.beginPath();
  ctx.arc(x - w * 0.3, y + w * 0.1, rearWheelR * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Small front wheel
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(x + w * 0.3, y + w * 0.1, 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawHayStack(ctx, x, y, r) {
  ctx.fillStyle = "#eab308";
  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI, 0);
  ctx.lineTo(x + r, y + r * 0.5);
  ctx.lineTo(x - r, y + r * 0.5);
  ctx.closePath();
  ctx.fill();
}

function drawBat(ctx, x, y, w) {
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.moveTo(x, y);
  // wings
  ctx.quadraticCurveTo(x - w * 0.5, y - w * 0.4, x - w, y);
  ctx.quadraticCurveTo(x - w * 0.4, y + w * 0.3, x, y + w * 0.1);
  ctx.quadraticCurveTo(x + w * 0.4, y + w * 0.3, x + w, y);
  ctx.quadraticCurveTo(x + w * 0.5, y - w * 0.4, x, y);
  ctx.closePath();
  ctx.fill();
}

function drawGhost(ctx, x, y, size, eyesType) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.beginPath();
  ctx.arc(x, y, size * 0.4, Math.PI, 0);
  ctx.lineTo(x + size * 0.4, y + size * 0.6);
  // wave bottom
  ctx.lineTo(x + size * 0.2, y + size * 0.5);
  ctx.lineTo(x, y + size * 0.6);
  ctx.lineTo(x - size * 0.2, y + size * 0.5);
  ctx.lineTo(x - size * 0.4, y + size * 0.6);
  ctx.closePath();
  ctx.fill();

  // Ghost face
  ctx.fillStyle = "#000000";
  if (eyesType === "wink") {
    ctx.fillRect(x - 8, y - 4, 6, 2);
    ctx.beginPath();
    ctx.arc(x + 5, y - 3, 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(x - 5, y - 3, 3, 0, Math.PI * 2);
    ctx.arc(x + 5, y - 3, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Mouth
  ctx.beginPath();
  ctx.arc(x, y + 4, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawJackolantern(ctx, x, y, r, expression) {
  // Pumpkin body
  drawPumpkin(ctx, x, y, r, "#ea580c");

  // Carved eyes (Triangles)
  ctx.fillStyle = "#fde047"; // glowing light yellow
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 5);
  ctx.lineTo(x - 4, y - 5);
  ctx.lineTo(x - 8, y - 12);
  ctx.closePath();
  
  ctx.moveTo(x + 4, y - 5);
  ctx.lineTo(x + 12, y - 5);
  ctx.lineTo(x + 8, y - 12);
  ctx.closePath();
  ctx.fill();

  // Carved mouth
  ctx.beginPath();
  if (expression === "happy") {
    ctx.arc(x, y + 4, 8, 0, Math.PI);
  } else {
    // Scary jagged mouth
    ctx.moveTo(x - 12, y + 4);
    ctx.lineTo(x - 8, y + 10);
    ctx.lineTo(x - 4, y + 4);
    ctx.lineTo(x, y + 10);
    ctx.lineTo(x + 4, y + 4);
    ctx.lineTo(x + 8, y + 10);
    ctx.lineTo(x + 12, y + 4);
    ctx.closePath();
  }
  ctx.fill();
}

function drawWitchHat(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  // brim
  ctx.beginPath();
  ctx.ellipse(x, y + 10, r * 1.5, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // cone
  ctx.beginPath();
  ctx.moveTo(x - r * 0.8, y + 8);
  ctx.lineTo(x, y - r * 1.2);
  ctx.lineTo(x + r * 0.8, y + 8);
  ctx.closePath();
  ctx.fill();
}

function drawFireplace(ctx, x, y, w, stockings) {
  ctx.fillStyle = "#7c2d12"; // brick surround
  ctx.fillRect(x - w * 0.5, y, w, w * 0.8);
  
  // hearth opening
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(x - w * 0.3, y + w * 0.2, w * 0.6, w * 0.6);

  // fire
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(x, y + w * 0.65, 15, 0, Math.PI * 2);
  ctx.fill();

  // Stockings
  ctx.fillStyle = "#b91c1c";
  for (let i = 0; i < stockings; i++) {
    const sx = x - w * 0.2 + i * 20;
    ctx.fillRect(sx - 4, y + 5, 8, 12);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(sx - 6, y + 3, 12, 3);
    ctx.fillStyle = "#b91c1c";
  }
}

function drawOrnament(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawPresent(ctx, x, y, size, boxColor, ribbonColor) {
  ctx.fillStyle = boxColor;
  ctx.fillRect(x - size * 0.5, y, size, size);

  // Ribbon
  ctx.fillStyle = ribbonColor;
  ctx.fillRect(x - 3, y, 6, size);
  ctx.fillRect(x - size * 0.5, y + size * 0.4, size, 6);
}

function drawSleepingCat(ctx, x, y, r, type) {
  ctx.fillStyle = "#f97316";
  // curled body
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // head
  ctx.beginPath();
  ctx.arc(x + r * 0.5, y - r * 0.2, r * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // stripes
  if (type === "striped") {
    ctx.strokeStyle = "#7c3aed";
    ctx.beginPath();
    ctx.moveTo(x - r * 0.3, y - r * 0.6);
    ctx.lineTo(x - r * 0.3, y + r * 0.6);
    ctx.stroke();
  }
}

function drawFerrisWheel(ctx, x, y, r, cabins) {
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 3;
  
  // Outer wheel ring
  ctx.beginPath();
  ctx.arc(x, y, r * 0.8, 0, Math.PI * 2);
  ctx.stroke();

  // Spokes
  for (let i = 0; i < cabins; i++) {
    const angle = (i * (360 / cabins)) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * r * 0.8, y + Math.sin(angle) * r * 0.8);
    ctx.stroke();

    // Cabin pods
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(x + Math.cos(angle) * r * 0.8, y + Math.sin(angle) * r * 0.8, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Support posts
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 30, y + r);
  ctx.moveTo(x, y);
  ctx.lineTo(x + 30, y + r);
  ctx.stroke();
  ctx.lineWidth = 1;
}

function drawCircusTent(ctx, x, y, w, flagType) {
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(x - w * 0.4, y + w * 0.2, w * 0.8, w * 0.5);

  // striped patterns
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - w * 0.2, y + w * 0.2, w * 0.1, w * 0.5);
  ctx.fillRect(x + w * 0.1, y + w * 0.2, w * 0.1, w * 0.5);

  // Tent roof
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.moveTo(x - w * 0.45, y + w * 0.2);
  ctx.lineTo(x + w * 0.45, y + w * 0.2);
  ctx.lineTo(x, y - w * 0.2);
  ctx.closePath();
  ctx.fill();

  // top flag
  ctx.strokeStyle = "#475569";
  ctx.beginPath();
  ctx.moveTo(x, y - w * 0.2);
  ctx.lineTo(x, y - w * 0.2 - 15);
  ctx.stroke();

  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  if (flagType === "triangle") {
    ctx.moveTo(x, y - w * 0.2 - 15);
    ctx.lineTo(x - 10, y - w * 0.2 - 10);
    ctx.lineTo(x, y - w * 0.2 - 5);
  } else {
    ctx.rect(x - 10, y - w * 0.2 - 15, 10, 8);
  }
  ctx.closePath();
  ctx.fill();
}

function drawCart(ctx, x, y, w, spokes) {
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(x - w * 0.5, y - w * 0.3, w, w * 0.5);

  // Wheel
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y + w * 0.3, w * 0.3, 0, Math.PI * 2);
  ctx.stroke();

  // Spokes
  for (let i = 0; i < spokes; i++) {
    const angle = (i * (360 / spokes)) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(x, y + w * 0.3);
    ctx.lineTo(x + Math.cos(angle) * w * 0.3, y + w * 0.3 + Math.sin(angle) * w * 0.3);
    ctx.stroke();
  }
  ctx.lineWidth = 1;
}

function drawCap(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  
  // brim
  ctx.fillRect(x - r, y - 2, r * 2.2, 3);
}

function drawShelf(ctx, x, y, w) {
  ctx.fillStyle = "#78350f";
  ctx.fillRect(x, y, w, 10);
}

// Microscopic details
function drawBeaker(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x - size * 0.3, y + size * 0.2, size * 0.6, size * 0.6);

  // glass wall
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y);
  ctx.lineTo(x - size * 0.35, y + size * 0.8);
  ctx.lineTo(x + size * 0.35, y + size * 0.8);
  ctx.lineTo(x + size * 0.35, y);
  ctx.stroke();
  ctx.lineWidth = 1;
}

function drawMicroscope(ctx, x, y, size, stageHeight) {
  ctx.fillStyle = "#475569";
  // Arm
  ctx.fillRect(x - 5, y - size * 0.6, 10, size);
  ctx.fillRect(x - 15, y - size * 0.6, 20, 10);

  // Stage base
  const h = stageHeight === "high" ? y - size * 0.2 : y + size * 0.1;
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x - 18, h, 36, 6);
}

function drawMonitor(ctx, x, y, size, graphDir) {
  ctx.fillStyle = "#0f172a"; // stand
  ctx.fillRect(x - 5, y + size * 0.3, 10, size * 0.2);
  ctx.fillRect(x - 20, y + size * 0.45, 40, 6);

  // Screen
  ctx.fillStyle = "#334155";
  ctx.fillRect(x - size * 0.5, y - size * 0.3, size, size * 0.6);

  // Graph plot
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y + size * 0.1);
  if (graphDir === "up") {
    ctx.lineTo(x - size * 0.1, y - size * 0.15);
    ctx.lineTo(x + size * 0.3, y - size * 0.2);
  } else {
    ctx.lineTo(x - size * 0.1, y + size * 0.2);
    ctx.lineTo(x + size * 0.3, y + size * 0.05);
  }
  ctx.stroke();
  ctx.lineWidth = 1;
}

function drawBurner(ctx, x, y, size, flameOn) {
  ctx.fillStyle = "rgba(6, 182, 212, 0.4)";
  ctx.beginPath();
  ctx.arc(x, y + size * 0.5, size * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // wick
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(x - 2, y, 4, size * 0.4);

  // flame
  if (flameOn) {
    ctx.fillStyle = "#ea580c";
    ctx.beginPath();
    ctx.ellipse(x, y - 5, 5, 8, 0, 0, Math.PI*2);
    ctx.fill();
  }
}

function drawNotebook(ctx, x, y, w, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x - w * 0.5, y - w * 0.3, w, w * 0.6);
  // pages
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - w * 0.45, y - w * 0.25, w * 0.8, w * 0.5);
}

function drawPen(ctx, x, y, w, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.5, y + w * 0.5);
  ctx.lineTo(x + w * 0.5, y - w * 0.5);
  ctx.stroke();
  ctx.lineWidth = 1;
}

function drawEagle(ctx, x, y, w) {
  ctx.strokeStyle = "#451a03";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - w, y);
  ctx.quadraticCurveTo(x - w * 0.4, y - w * 0.6, x, y);
  ctx.quadraticCurveTo(x + w * 0.4, y - w * 0.6, x + w, y);
  ctx.stroke();
  ctx.lineWidth = 1;
}

function drawCactus(ctx, x, y, h, branches) {
  ctx.strokeStyle = "#166534";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";

  // trunk
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - h);
  ctx.stroke();

  // branches
  if (branches >= 1) {
    ctx.beginPath();
    ctx.moveTo(x, y - h * 0.4);
    ctx.lineTo(x - 15, y - h * 0.4);
    ctx.lineTo(x - 15, y - h * 0.7);
    ctx.stroke();
  }
  if (branches >= 2) {
    ctx.beginPath();
    ctx.moveTo(x, y - h * 0.6);
    ctx.lineTo(x + 15, y - h * 0.6);
    ctx.lineTo(x + 15, y - h * 0.9);
    ctx.stroke();
  }
  ctx.lineWidth = 1;
}

function drawSaloon(ctx, x, y, size, signTxt) {
  // Wood walls
  ctx.fillStyle = "#854d0e";
  ctx.fillRect(x - size * 0.5, y - size * 0.2, size, size * 0.7);

  // Roof board
  ctx.fillStyle = "#a16207";
  ctx.fillRect(x - size * 0.55, y - size * 0.35, size * 1.1, size * 0.18);

  // Sign text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  ctx.fillText(signTxt, x, y - size * 0.23);

  // Swing Door
  ctx.fillStyle = "#451a03";
  ctx.fillRect(x - size * 0.15, y + size * 0.2, size * 0.12, size * 0.3);
  ctx.fillRect(x + size * 0.03, y + size * 0.2, size * 0.12, size * 0.3);
}

function drawTumbleweed(ctx, x, y, r) {
  ctx.strokeStyle = "#78350f";
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    ctx.arc(x + Math.sin(i) * 5, y + Math.cos(i) * 5, r - i * 3, 0, Math.PI * 2);
  }
  ctx.stroke();
}

function drawCartWheel(ctx, x, y, r, spokes) {
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1;

  for (let i = 0; i < spokes; i++) {
    const angle = (i * (360 / spokes)) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
    ctx.stroke();
  }
}

function drawParrot(ctx, x, y, size) {
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  
  // green wing
  ctx.fillStyle = "#10b981";
  ctx.beginPath();
  ctx.ellipse(x - 2, y, size * 0.6, size * 0.9, -0.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawIsland(ctx, x, y, w) {
  ctx.fillStyle = "#eab308";
  ctx.beginPath();
  ctx.ellipse(x, y, w, w * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawPirateShip(ctx, x, y, w, isMod) {
  // Wood hull
  ctx.fillStyle = "#78350f";
  ctx.beginPath();
  ctx.moveTo(x - w * 0.5, y);
  ctx.lineTo(x + w * 0.5, y);
  ctx.lineTo(x + w * 0.3, y + w * 0.25);
  ctx.lineTo(x - w * 0.3, y + w * 0.25);
  ctx.closePath();
  ctx.fill();

  // Mast post
  ctx.fillRect(x - 4, y - w * 0.6, 8, w * 0.6);

  // Sail
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(x, y - w * 0.55);
  ctx.quadraticCurveTo(x - w * 0.25, y - w * 0.35, x, y - w * 0.15);
  ctx.quadraticCurveTo(x + w * 0.25, y - w * 0.35, x, y - w * 0.55);
  ctx.fill();

  // Flag
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(x - 20, y - w * 0.6, 20, 12);
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 8px Arial";
  ctx.textAlign = "center";
  ctx.fillText(isMod ? "X" : "☠", x - 10, y - w * 0.6 + 9); // diff 0: pirate skull symbol

  // Cannons
  ctx.fillStyle = "#475569";
  const cannons = isMod ? 1 : 2; // diff 3: cannons count
  for (let i = 0; i < cannons; i++) {
    ctx.fillRect(x - w * 0.2 + i * 40, y + 4, 15, 6);
  }
}

function drawTreasureChest(ctx, x, y, w, state) {
  ctx.fillStyle = "#b45309";
  ctx.fillRect(x - w * 0.5, y, w, w * 0.6);

  // metal banding
  ctx.fillStyle = "#eab308";
  ctx.fillRect(x - w * 0.45, y, 4, w * 0.6);
  ctx.fillRect(x + w * 0.35, y, 4, w * 0.6);

  if (state === "open") {
    // pile of gold inside
    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.arc(x, y, 10, Math.PI, 0);
    ctx.fill();
  } else {
    // lock plate
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(x - 4, y + w * 0.2, 8, 8);
  }
}

function drawVolcano(ctx, x, y, h, isMod) {
  ctx.fillStyle = "#475569";
  ctx.beginPath();
  ctx.moveTo(x - h * 0.8, y + h);
  ctx.lineTo(x - h * 0.2, y);
  ctx.lineTo(x + h * 0.2, y);
  ctx.lineTo(x + h * 0.8, y + h);
  ctx.closePath();
  ctx.fill();

  // Lava
  if (isMod) {
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.moveTo(x - h * 0.2, y);
    ctx.quadraticCurveTo(x, y + h * 0.4, x + h * 0.2, y);
    ctx.lineTo(x + h * 0.1, y + h * 0.4);
    ctx.lineTo(x - h * 0.1, y + h * 0.4);
    ctx.closePath();
    ctx.fill();
  }
}

function drawPterodactyl(ctx, x, y, w) {
  ctx.strokeStyle = "#b45309";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - w, y);
  ctx.quadraticCurveTo(x, y - w * 0.5, x + w, y);
  ctx.quadraticCurveTo(x + w * 0.4, y + w * 0.4, x, y + w * 0.1);
  ctx.stroke();
  ctx.lineWidth = 1;
}

function drawSauropod(ctx, x, y, h, isMod) {
  ctx.fillStyle = "#0284c7";
  // body
  ctx.beginPath();
  ctx.ellipse(x, y + h * 0.2, h * 0.5, h * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // long neck
  ctx.strokeStyle = "#0284c7";
  ctx.lineWidth = h * 0.25;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - h * 0.3, y + h * 0.1);
  ctx.quadraticCurveTo(x - h * 0.6, y - h * 0.4, x - h * 0.5, y - h * 0.6);
  ctx.stroke();
  ctx.lineWidth = 1;

  // head
  ctx.beginPath();
  ctx.ellipse(x - h * 0.6, y - h * 0.6, h * 0.15, h * 0.1, 0, 0, Math.PI*2);
  ctx.fill();

  // body spots
  if (!isMod) {
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(x - h * 0.1, y + h * 0.1, h * 0.08, 0, Math.PI * 2);
    ctx.arc(x + h * 0.15, y + h * 0.2, h * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawEgg(ctx, x, y, r) {
  ctx.fillStyle = "#f1f5f9";
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.8, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#cbd5e1";
  ctx.stroke();
}

function drawFern(ctx, x, y, r, state) {
  ctx.strokeStyle = "#4d7c0f";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y + r);
  if (state === "curled") {
    ctx.quadraticCurveTo(x - r * 0.8, y, x - r * 0.4, y - r * 0.4);
  } else {
    ctx.quadraticCurveTo(x - r * 0.8, y - r * 0.2, x - r, y - r * 0.8);
  }
  ctx.stroke();
  ctx.lineWidth = 1;
}

function drawCrescentMoon(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI * 0.3, Math.PI * 1.7);
  // inner curve
  ctx.arc(x + r * 0.4, y, r * 0.8, Math.PI * 1.6, Math.PI * 0.4, true);
  ctx.closePath();
  ctx.fill();
}

function drawSleepingBear(ctx, x, y, r, isMod) {
  ctx.fillStyle = "#d97706";
  // head
  ctx.beginPath();
  ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // snout
  ctx.fillStyle = "#fef08a";
  ctx.beginPath();
  ctx.arc(x, y + 2, r * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // sleeping eyes
  ctx.strokeStyle = "#000";
  ctx.beginPath();
  ctx.arc(x - 5, y - 2, 3, 0.2, Math.PI - 0.2);
  ctx.arc(x + 5, y - 2, 3, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Pillow
  if (isMod) {
    ctx.fillStyle = "#f472b6"; // pink pillow
    ctx.fillRect(x - r * 0.8, y + r * 0.35, r * 1.6, 8);
  }
}

function drawConstellation(ctx, x, y) {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 30, y + 15);
  ctx.lineTo(x + 10, y + 40);
  ctx.stroke();
}

function drawHeart(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + r * 0.5);
  ctx.bezierCurveTo(x - r, y - r * 0.5, x - r * 1.5, y + r * 0.5, x, y + r * 1.5);
  ctx.bezierCurveTo(x + r * 1.5, y + r * 0.5, x + r, y - r * 0.5, x, y + r * 0.5);
  ctx.fill();
}

function drawMilkBottle(ctx, x, y, h, milkLevel) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fillRect(x - 8, y, 16, h);

  // cap
  ctx.fillStyle = "#ec4899";
  ctx.fillRect(x - 10, y - 4, 20, 4);

  // milk
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 7, y + h * (1 - milkLevel), 14, h * milkLevel);
}

function drawPagoda(ctx, x, y, w, isMod) {
  // Pillars
  ctx.fillStyle = "#b91c1c";
  ctx.fillRect(x - w * 0.3, y, 6, w * 0.8);
  ctx.fillRect(x + w * 0.25, y, 6, w * 0.8);

  // Layer 1 Roof
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.moveTo(x - w * 0.5, y + w * 0.3);
  ctx.lineTo(x + w * 0.5, y + w * 0.3);
  ctx.quadraticCurveTo(x, y + w * 0.15, x - w * 0.5, y + w * 0.3);
  ctx.fill();

  // Top sign text tag
  if (!isMod) {
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(x - 12, y + 10, 24, 8); // sign panel
  }
}

function drawLantern(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fill();

  // yellow tassel
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(x - 1, y + 8, 2, 8);
}

function drawBamboo(ctx, x, y, h, leafType) {
  ctx.strokeStyle = "#16a53f";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.lineWidth = 1;

  // leaves
  ctx.fillStyle = "#15803d";
  if (leafType === "broad") {
    ctx.beginPath();
    ctx.ellipse(x - 10, y + 15, 12, 5, -0.4, 0, Math.PI*2);
    ctx.ellipse(x + 10, y + 25, 12, 5, 0.4, 0, Math.PI*2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.ellipse(x - 8, y + 15, 8, 2, -0.4, 0, Math.PI*2);
    ctx.ellipse(x + 8, y + 25, 8, 2, 0.4, 0, Math.PI*2);
    ctx.fill();
  }
}

function drawBridge(ctx, x, y, w, rails) {
  ctx.strokeStyle = "#ca8a04";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.5, y + 15);
  ctx.quadraticCurveTo(x, y - 5, x + w * 0.5, y + 15);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Rails pickets
  ctx.fillStyle = "#854d0e";
  for (let i = 0; i < rails; i++) {
    const rx = x - w * 0.4 + i * (w * 0.8 / (rails - 1));
    ctx.fillRect(rx - 2, y, 4, 15);
  }
}

function drawKoi(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, size, size * 0.4, 0.3, 0, Math.PI*2);
  ctx.fill();
}

function drawBrickPattern(ctx, x, y, size, isMod) {
  if (isMod) return; // diff 2: brick lines missing on right tower
  ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.moveTo(x - size * 0.5, y + 10);
  ctx.lineTo(x + size * 0.5, y + 10);
  ctx.stroke();
}

function drawKnight(ctx, x, y, h) {
  ctx.fillStyle = "#cbd5e1"; // armor body
  ctx.fillRect(x - 6, y, 12, h);

  // Helmet visor
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(x - 5, y + 3, 10, 3);
}

function drawShield(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - r, y);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x, y + r * 1.5);
  ctx.closePath();
  ctx.fill();
}

function drawDragon(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.5, -0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // tail
  ctx.beginPath();
  ctx.moveTo(x + r * 0.5, y);
  ctx.lineTo(x + r * 1.2, y - r * 0.5);
  ctx.lineTo(x + r * 0.4, y + r * 0.3);
  ctx.closePath();
  ctx.fill();
}

function drawZebra(ctx, x, y, size, isMod) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - size * 0.5, y - size * 0.3, size, size * 0.6);

  // legs
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - size * 0.4, y + size * 0.3, 4, size * 0.4);
  ctx.fillRect(x + size * 0.2, y + size * 0.3, 4, size * 0.4);

  // Zebra neck & stripes
  ctx.fillStyle = "#000000";
  ctx.fillRect(x - size * 0.5, y - size * 0.3, 4, size * 0.6);
  ctx.fillRect(x + size * 0.1, y - size * 0.3, 4, size * 0.6);

  if (!isMod) {
    // stripes on neck
    ctx.fillRect(x - size * 0.2, y - size * 0.3, 4, size * 0.6); // diff 0: stripe missing
  }
}

function drawGiraffe(ctx, x, y, size, isMod) {
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(x - size * 0.3, y - size * 0.2, size * 0.6, size * 0.4);

  // Neck
  ctx.fillRect(x + size * 0.1, y - size * 0.8, size * 0.18, size * 0.8);
  ctx.fillRect(x + size * 0.1, y - size * 0.8, size * 0.3, size * 0.18); // head

  // Legs
  ctx.fillRect(x - size * 0.2, y + size * 0.2, 5, size * 0.6);
  ctx.fillRect(x + size * 0.15, y + size * 0.2, 5, size * 0.6);

  // Spots
  if (!isMod) {
    ctx.fillStyle = "#b45309";
    ctx.fillRect(x - size * 0.1, y - size * 0.1, 6, 6);
    ctx.fillRect(x + size * 0.15, y - size * 0.5, 5, 8); // diff 1: spots missing
  }
}

function drawAcaciaTree(ctx, x, y, h, foliage) {
  ctx.strokeStyle = "#854d0e";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x, y + 40);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.lineWidth = 1;

  ctx.fillStyle = "#15803d";
  ctx.beginPath();
  if (foliage === "thick") {
    ctx.ellipse(x, y, 70, 15, 0, 0, Math.PI * 2);
  } else {
    ctx.ellipse(x, y, 40, 10, 0, 0, Math.PI * 2);
  }
  ctx.fill();
}

function drawJeep(ctx, x, y, w, isMod) {
  ctx.fillStyle = "#d97706";
  ctx.fillRect(x - w * 0.4, y, w * 0.8, w * 0.3);

  // wheels
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.arc(x - w * 0.2, y + w * 0.3, 10, 0, Math.PI * 2);
  ctx.arc(x + w * 0.25, y + w * 0.3, 10, 0, Math.PI * 2);
  ctx.fill();

  // Spare tire
  if (!isMod) {
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(x - w * 0.45, y + w * 0.1, 8, 0, Math.PI * 2); // diff 3: back spare wheel
    ctx.fill();
  }
}

function drawBinoculars(ctx, x, y, r) {
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x - r, y - r * 0.5, r, r * 1.5);
  ctx.fillRect(x + 2, y - r * 0.5, r, r * 1.5);
  ctx.fillStyle = "#cbd5e1";
  ctx.fillRect(x - r, y, r * 2.2, 4);
}

function drawTeddyBear(ctx, x, y, r, ears) {
  ctx.fillStyle = "#a16207";
  // head
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // ears
  ctx.beginPath();
  ctx.arc(x - r * 0.8, y - r * 0.8, r * 0.35, 0, Math.PI * 2);
  if (ears === "two-ears") {
    ctx.arc(x + r * 0.8, y - r * 0.8, r * 0.35, 0, Math.PI * 2); // diff 1: ear missing
  }
  ctx.fill();
}

function drawRockingHorse(ctx, x, y, size, color) {
  // rocking base curve
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y - 5, size * 1.2, Math.PI * 0.2, Math.PI * 0.8);
  ctx.stroke();
  ctx.lineWidth = 1;

  // saddle
  ctx.fillStyle = color;
  ctx.fillRect(x - size * 0.3, y - 6, size * 0.6, 12);
}

function drawToyTrain(ctx, x, y, w, wheels) {
  ctx.fillStyle = "#b91c1c";
  ctx.fillRect(x - w * 0.5, y - w * 0.3, w, w * 0.5);

  // Wheels
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 2;
  for (let i = 0; i < wheels; i++) {
    const wx = x - w * 0.3 + i * (w * 0.6 / (wheels - 1));
    ctx.beginPath();
    ctx.arc(wx, y + w * 0.2, 6, 0, Math.PI*2);
    ctx.stroke();
  }
  ctx.lineWidth = 1;
}

function drawToyBall(ctx, x, y, r, pattern) {
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fbbf24";
  if (pattern === "star") {
    drawStar(ctx, x, y, r * 0.5, "#fbbf24");
  } else {
    // stripes
    ctx.fillRect(x - r, y - r * 0.2, r * 2, r * 0.4);
  }
}

function drawOven(ctx, x, y, size, state) {
  ctx.fillStyle = "#475569";
  ctx.fillRect(x - size * 0.5, y - size * 0.4, size, size * 0.8);

  // glass door
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(x - size * 0.35, y - size * 0.25, size * 0.7, size * 0.5);

  // bread inside
  if (state === "bread") {
    ctx.fillStyle = "#ca8a04";
    ctx.beginPath();
    ctx.ellipse(x, y, 15, 6, 0, 0, Math.PI * 2); // diff 0: bread in oven
    ctx.fill();
  }
}

function drawMenuBoard(ctx, x, y, size, content) {
  ctx.fillStyle = "#1e293b"; // frame
  ctx.fillRect(x - size * 0.5, y - size * 0.6, size, size * 1.2);
  
  ctx.fillStyle = "#0f172a"; // blackboard
  ctx.fillRect(x - size * 0.42, y - size * 0.52, size * 0.84, size * 1.04);

  // chalk drawings
  ctx.fillStyle = "#ffffff";
  if (content === "text") {
    ctx.font = "8px Arial";
    ctx.textAlign = "center";
    ctx.fillText("BREAD", x, y);
  } else if (content === "notes") {
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("♬", x, y + 4);
  } else if (content === "clef") {
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("𝄞", x, y + 6);
  } else {
    // cup icon
    ctx.fillRect(x - 5, y - 2, 10, 8);
    ctx.fillRect(x + 5, y - 1, 3, 5); // handle
  }
}

function drawCounter(ctx, x, y, w) {
  ctx.fillStyle = "#b45309";
  ctx.fillRect(x, y, w, 15);
}

function drawJamJar(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x - size * 0.4, y, size * 0.8, size);

  // lid
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(x - size * 0.5, y - 3, size, 4);
}

function drawBreadBasket(ctx, x, y, w, count) {
  ctx.fillStyle = "#f59e0b"; // basket
  ctx.beginPath();
  ctx.ellipse(x, y + 8, w * 0.5, 8, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fill();

  // Baguettes
  ctx.fillStyle = "#a16207";
  for (let i = 0; i < count; i++) {
    ctx.save();
    ctx.translate(x - w * 0.2 + i * 15, y);
    ctx.rotate(-0.3 + i * 0.3);
    ctx.fillRect(-5, -20, 10, 22);
    ctx.restore();
  }
}

function drawChefHat(ctx, x, y, r) {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x, y, r * 0.7, 0, Math.PI * 2);
  ctx.arc(x - r * 0.5, y - r * 0.2, r * 0.6, 0, Math.PI * 2);
  ctx.arc(x + r * 0.5, y - r * 0.2, r * 0.6, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  
  // band
  ctx.fillRect(x - r * 0.8, y + r * 0.2, r * 1.6, r * 0.5);
}

function drawTent(ctx, x, y, size, door) {
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.moveTo(x - size, y + size * 0.6);
  ctx.lineTo(x + size, y + size * 0.6);
  ctx.lineTo(x, y - size * 0.6);
  ctx.closePath();
  ctx.fill();

  // Door
  ctx.fillStyle = "#7c2d12";
  ctx.beginPath();
  if (door === "round") {
    ctx.ellipse(x, y + size * 0.6, size * 0.3, size * 0.4, 0, Math.PI, 0);
  } else {
    // triangle
    ctx.moveTo(x - size * 0.3, y + size * 0.6);
    ctx.lineTo(x + size * 0.3, y + size * 0.6);
    ctx.lineTo(x, y + size * 0.1);
    ctx.closePath();
  }
  ctx.fill();
}

function drawCampfire(ctx, x, y, r, height) {
  ctx.fillStyle = "#78350f"; // logs
  ctx.fillRect(x - r * 0.8, y, r * 1.6, 6);
  ctx.fillRect(x - r * 0.6, y - 4, r * 1.2, 6);

  // Flame
  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  const fHeight = height === "high" ? r * 1.6 : r * 0.8;
  ctx.moveTo(x - r * 0.4, y);
  ctx.quadraticCurveTo(x, y - fHeight * 0.8, x, y - fHeight);
  ctx.quadraticCurveTo(x + r * 0.4, y - fHeight * 0.8, x + r * 0.4, y);
  ctx.closePath();
  ctx.fill();
}

function drawCampChair(ctx, x, y, size, color) {
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y + size * 0.5);
  ctx.lineTo(x + size * 0.5, y - size * 0.5);
  ctx.moveTo(x + size * 0.5, y + size * 0.5);
  ctx.lineTo(x - size * 0.5, y - size * 0.5);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Seat cloth
  ctx.fillStyle = color;
  ctx.fillRect(x - size * 0.4, y - size * 0.6, size * 0.8, size * 0.3);
}

function drawControlTower(ctx, x, y, w, h, radarType) {
  ctx.fillStyle = "#94a3b8"; // tower body
  ctx.fillRect(x - w * 0.4, y, w * 0.8, h);

  // cabin
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(x - w * 0.6, y, w * 1.2, 20);

  // radar rotating dome
  ctx.fillStyle = "#e2e8f0";
  ctx.beginPath();
  if (radarType === "dome") {
    ctx.arc(x, y - 4, w * 0.4, Math.PI, 0);
  } else {
    ctx.rect(x - w * 0.5, y - 6, w, 6);
  }
  ctx.closePath();
  ctx.fill();
}

function drawAirplane(ctx, x, y, size, isMod) {
  ctx.fillStyle = "#cbd5e1"; // wings
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.5, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // fuselage
  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.6, size * 0.08, 0.2, 0, Math.PI*2);
  ctx.fill();

  // tail
  ctx.fillStyle = "#e2e8f0";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.45, y - 5);
  ctx.lineTo(x - size * 0.58, y - 25);
  ctx.lineTo(x - size * 0.52, y - 5);
  ctx.closePath();
  ctx.fill();

  // Stripe detail on tail
  if (!isMod) {
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(x - size * 0.55, y - 20, 4, 15); // red stripe
  }
}

function drawGuideLight(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawParasol(ctx, x, y, r, color) {
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 60);
  ctx.stroke();
  ctx.lineWidth = 1;

  // umbrella canopy
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
}

function drawBeachMat(ctx, x, y, w, type) {
  ctx.fillStyle = "#3b82f6";
  ctx.fillRect(x - w * 0.5, y - w * 0.2, w, w * 0.4);

  if (type === "striped") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x - w * 0.2, y - w * 0.2, w * 0.1, w * 0.4);
    ctx.fillRect(x + w * 0.1, y - w * 0.2, w * 0.1, w * 0.4);
  }
}

function drawSandcastle(ctx, x, y, r) {
  ctx.fillStyle = "#ca8a04";
  ctx.fillRect(x - r, y, r * 2, r * 1.5);
  // peaks
  ctx.beginPath();
  ctx.moveTo(x - r, y);
  ctx.lineTo(x - r * 0.5, y - r * 0.5);
  ctx.lineTo(x, y);
  ctx.lineTo(x + r * 0.5, y - r * 0.5);
  ctx.lineTo(x + r, y);
  ctx.closePath();
  ctx.fill();
}

function drawCrab(ctx, x, y, size) {
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.ellipse(x, y, size, size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // claws
  ctx.fillRect(x - size * 0.8, y - size, size * 0.5, size * 0.8);
  ctx.fillRect(x + size * 0.3, y - size, size * 0.5, size * 0.8);
}

function drawPiano(ctx, x, y, w, isMod) {
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(x - w * 0.5, y, w, w * 0.8);

  // keys
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - w * 0.45, y + w * 0.4, w * 0.9, w * 0.35);

  // black keys
  ctx.fillStyle = "#000000";
  const num = 6;
  for (let i = 0; i < num; i++) {
    ctx.fillRect(x - w * 0.4 + i * 12, y + w * 0.4, 4, 15);
  }

  // stand
  if (!isMod) {
    ctx.fillStyle = "#475569";
    ctx.fillRect(x - 15, y - 10, 30, 10);
  }
}

function drawViolin(ctx, x, y, size, type) {
  ctx.fillStyle = "#ca8a04";
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.5, size, 0, 0, Math.PI * 2);
  ctx.fill();

  // inner indentations
  if (type === "solid") {
    ctx.strokeStyle = "#451a03";
    ctx.beginPath();
    ctx.arc(x - size * 0.5, y, size * 0.25, 0, Math.PI * 2);
    ctx.arc(x + size * 0.5, y, size * 0.25, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawGuitar(ctx, x, y, size, pegs) {
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.5, size * 0.8, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // neck
  ctx.fillStyle = "#78350f";
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.4);
  ctx.fillRect(-3, -size * 1.5, 6, size * 1.5);
  
  // tuner pegs
  ctx.fillStyle = "#cbd5e1";
  for (let i = 0; i < pegs; i++) {
    ctx.fillRect((i % 2 === 0 ? 4 : -7), -size * 1.4 + (i * 5), 3, 2);
  }
  ctx.restore();
}

function drawCushion(ctx, x, y, r) {
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.ellipse(x, y, 16, r, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawEasel(ctx, x, y, size, paintingColor) {
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 4;
  
  // tripod legs
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x - size * 0.6, y + size * 1.2);
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 0.6, y + size * 1.2);
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size * 1.2);
  ctx.stroke();
  ctx.lineWidth = 1;

  // canvas frame
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - size * 0.5, y - size * 0.4, size, size * 0.8);
  ctx.strokeStyle = "#451a03";
  ctx.strokeRect(x - size * 0.5, y - size * 0.4, size, size * 0.8);

  // mini painting inside canvas
  ctx.fillStyle = paintingColor;
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.fill();
}

function drawPalette(ctx, x, y, r, brushes) {
  ctx.fillStyle = "#fed7aa";
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.7, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // paint dabs
  ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(x - 10, y - 4, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3b82f6"; ctx.beginPath(); ctx.arc(x, y + 6, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#eab308"; ctx.beginPath(); ctx.arc(x + 10, y - 2, 4, 0, Math.PI * 2); ctx.fill();

  // brushes in jar
  ctx.fillStyle = "#64748b";
  for (let i = 0; i < brushes; i++) {
    ctx.fillRect(x + 12 + i * 5, y - 25, 3, 25);
  }
}

function drawVase(ctx, x, y, size, roses) {
  ctx.fillStyle = "#67e8f9"; // cyan glass vase
  ctx.fillRect(x - size * 0.4, y, size * 0.8, size * 1.2);

  // roses
  ctx.fillStyle = "#ef4444";
  for (let i = 0; i < roses; i++) {
    ctx.beginPath();
    ctx.arc(x - size * 0.3 + i * 12, y - 5, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPictureFrame(ctx, x, y, size, shape) {
  ctx.fillStyle = "#78350f"; // wood frame
  ctx.fillRect(x - size * 0.5, y - size * 0.4, size, size * 0.8);

  ctx.fillStyle = "#ffffff";
  if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(x - size * 0.3, y - size * 0.2, size * 0.6, size * 0.4);
  }
}

function drawPaintTube(ctx, x, y, size, capColor) {
  ctx.fillStyle = "#cbd5e1";
  ctx.fillRect(x - size * 0.4, y, size * 0.8, size * 1.5);
  
  // cap
  ctx.fillStyle = capColor;
  ctx.fillRect(x - size * 0.2, y - 4, size * 0.4, 4);
}

function drawBookshelf(ctx, x, y, w, isMod) {
  ctx.fillStyle = "#78350f"; // wood shelves
  ctx.fillRect(x - w * 0.5, y, w, 6);
  ctx.fillRect(x - w * 0.5, y + 25, w, 6);

  // Books
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(x - w * 0.3, y - 18, 8, 18);
  ctx.fillStyle = "#eab308";
  ctx.fillRect(x - w * 0.18, y - 16, 6, 16);
  
  if (!isMod) {
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(x - w * 0.08, y - 17, 7, 17); // diff 0: blue book
  }
}

function drawArmchair(ctx, x, y, size, type) {
  ctx.fillStyle = "#991b1b"; // red chair body
  ctx.fillRect(x - size * 0.5, y, size, size * 0.8);

  // cushion/backrest
  ctx.fillStyle = "#b91c1c";
  ctx.fillRect(x - size * 0.4, y - size * 0.6, size * 0.8, size * 0.6);

  if (type === "tufted") {
    ctx.fillStyle = "#7f1d1d";
    ctx.beginPath();
    ctx.arc(x - 8, y - size * 0.3, 2, 0, Math.PI * 2);
    ctx.arc(x + 8, y - size * 0.3, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLamp(ctx, x, y, size, isOn) {
  ctx.fillStyle = "#475569"; // pole
  ctx.fillRect(x - 2, y, 4, size * 2.2);

  // lampshade
  ctx.fillStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y);
  ctx.lineTo(x + size * 0.5, y);
  ctx.lineTo(x + size * 0.3, y - size * 0.6);
  ctx.lineTo(x - size * 0.3, y - size * 0.6);
  ctx.closePath();
  ctx.fill();

  // light glow
  if (isOn) {
    const grad = ctx.createLinearGradient(x, y, x, y + 60);
    grad.addColorStop(0, "rgba(254, 240, 138, 0.4)");
    grad.addColorStop(1, "rgba(254, 240, 138, 0)");
    ctx.fillStyle = grad;
    
    ctx.beginPath();
    ctx.moveTo(x - size * 0.5, y);
    ctx.lineTo(x - size * 1.5, y + 60);
    ctx.lineTo(x + size * 1.5, y + 60);
    ctx.lineTo(x + size * 0.5, y);
    ctx.closePath();
    ctx.fill();
  }
}

function drawBooksPile(ctx, x, y, size, count) {
  ctx.fillStyle = "#991b1b"; // bottom book
  ctx.fillRect(x - size * 0.5, y + 10, size, 6);

  ctx.fillStyle = "#10b981";
  ctx.fillRect(x - size * 0.45, y + 4, size * 0.9, 6);

  if (count > 3) {
    ctx.fillStyle = "#eab308";
    ctx.fillRect(x - size * 0.4, y - 2, size * 0.8, 6);
  }
}

function drawMug(ctx, x, y, r, handleDir) {
  ctx.fillStyle = "#06b6d4";
  ctx.fillRect(x - r, y, r * 2, r * 2);

  // handle
  ctx.strokeStyle = "#06b6d4";
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (handleDir === "right") {
    ctx.arc(x + r, y + r, r * 0.5, -Math.PI * 0.5, Math.PI * 0.5);
  } else {
    ctx.arc(x - r, y + r, r * 0.5, Math.PI * 0.5, -Math.PI * 0.5);
  }
  ctx.stroke();
  ctx.lineWidth = 1;
}

function drawNeonSign(ctx, x, y, size, txt) {
  // neon glow box
  ctx.strokeStyle = "#a855f7";
  ctx.lineWidth = 3;
  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 10;
  ctx.strokeRect(x - size * 0.5, y - size * 0.3, size, size * 0.6);
  ctx.shadowBlur = 0; // reset
  ctx.lineWidth = 1;

  // text
  ctx.fillStyle = "#ec4899";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(txt, x, y + 5);
}

function drawDrone(ctx, x, y, r, eyeColor) {
  ctx.fillStyle = "#64748b"; // metallic frame
  ctx.fillRect(x - r * 1.5, y - 2, r * 3, 4);

  // central capsule
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // lens eye
  ctx.fillStyle = eyeColor === "red" ? "#ef4444" : "#3b82f6";
  ctx.beginPath();
  ctx.arc(x, y, r * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawNeonLamp(ctx, x, y, size, neonColor) {
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(x - 3, y - 30, 6, 80);

  // glowing tube
  ctx.strokeStyle = neonColor;
  ctx.lineWidth = 4;
  ctx.shadowColor = neonColor;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(x, y - 10);
  ctx.lineTo(x, y + 20);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1;
}

function drawHovercar(ctx, x, y, w, isMod) {
  ctx.fillStyle = "#334155";
  ctx.beginPath();
  ctx.ellipse(x, y, w * 0.5, w * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // jet thrusters
  ctx.fillStyle = "#090514";
  ctx.fillRect(x - w * 0.45, y - 6, 10, 12);
  if (!isMod) {
    ctx.fillRect(x - w * 0.45, y + 10, 10, 12); // diff 3: dual thrusters count
  }
}

function drawRoadCone(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - size, y + size * 1.2);
  ctx.lineTo(x + size, y + size * 1.2);
  ctx.lineTo(x + 2, y);
  ctx.lineTo(x - 2, y);
  ctx.closePath();
  ctx.fill();

  // stripes
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - size * 0.5, y + size * 0.4, size, 4);
}
