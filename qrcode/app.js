// CineAHO QR Code Generator - Premium Core JS Engine

// =====================================================================
// QR CODE GENERATION ENGINE (Self-Contained Pure JS)
// =====================================================================
const QREncoder = (function() {
  // Galois Field 256 math helper tables for Reed-Solomon ECC
  const EXP = new Uint8Array(512);
  const LOG = new Uint8Array(256);
  (function() {
    let val = 1;
    for (let i = 0; i < 255; i++) {
      EXP[i] = val;
      EXP[i + 255] = val;
      LOG[val] = i;
      val = (val << 1) ^ (val & 0x80 ? 0x11D : 0);
    }
  })();

  function gfMul(x, y) {
    if (x === 0 || y === 0) return 0;
    return EXP[LOG[x] + LOG[y]];
  }

  // Reed-Solomon generator polynomial generator
  function rsGenerator(degree) {
    let poly = new Uint8Array([1]);
    for (let i = 0; i < degree; i++) {
      let next = new Uint8Array(poly.length + 1);
      for (let j = 0; j < poly.length; j++) {
        next[j] ^= gfMul(poly[j], EXP[i]);
        next[j + 1] ^= poly[j];
      }
      poly = next;
    }
    return poly;
  }

  // Polynomial division remainder calculation
  function rsRemainder(data, eccLength) {
    const gen = rsGenerator(eccLength);
    const result = new Uint8Array(data.length + eccLength);
    result.set(data);
    for (let i = 0; i < data.length; i++) {
      const coef = result[i];
      if (coef !== 0) {
        for (let j = 0; j < gen.length; j++) {
          result[i + j] ^= gfMul(gen[j], coef);
        }
      }
    }
    return result.slice(data.length);
  }

  // QR Version capacity dictionary mapping (Version, EC_Level) -> { maxBytes, eccBytes }
  // L, M, Q, H levels
  const CAPACITY = {
    // Version 1 (21x21 modules)
    "1-L": { maxBytes: 19, ecc: 7 },   "1-M": { maxBytes: 16, ecc: 10 },
    "1-Q": { maxBytes: 13, ecc: 13 },  "1-H": { maxBytes: 9, ecc: 17 },
    // Version 2 (25x25 modules)
    "2-L": { maxBytes: 34, ecc: 10 },  "2-M": { maxBytes: 28, ecc: 16 },
    "2-Q": { maxBytes: 22, ecc: 22 },  "2-H": { maxBytes: 16, ecc: 28 },
    // Version 3 (29x29 modules)
    "3-L": { maxBytes: 55, ecc: 15 },  "3-M": { maxBytes: 44, ecc: 26 },
    "3-Q": { maxBytes: 34, ecc: 36 },  "3-H": { maxBytes: 26, ecc: 44 },
    // Version 4 (33x33 modules)
    "4-L": { maxBytes: 80, ecc: 20 },  "4-M": { maxBytes: 64, ecc: 36 },
    "4-Q": { maxBytes: 48, ecc: 52 },  "4-H": { maxBytes: 36, ecc: 64 },
    // Version 5 (37x37 modules)
    "5-L": { maxBytes: 108, ecc: 26 }, "5-M": { maxBytes: 86, ecc: 48 },
    "5-Q": { maxBytes: 62, ecc: 72 },  "5-H": { maxBytes: 46, ecc: 88 },
    // Version 6 (41x41 modules)
    "6-L": { maxBytes: 136, ecc: 36 }, "6-M": { maxBytes: 108, ecc: 64 },
    "6-Q": { maxBytes: 76, ecc: 96 },  "6-H": { maxBytes: 60, ecc: 112 },
    // Version 7 (45x45 modules)
    "7-L": { maxBytes: 156, ecc: 40 }, "7-M": { maxBytes: 124, ecc: 72 },
    "7-Q": { maxBytes: 88, ecc: 108 }, "7-H": { maxBytes: 66, ecc: 130 },
    // Version 8 (49x49 modules)
    "8-L": { maxBytes: 194, ecc: 48 }, "8-M": { maxBytes: 154, ecc: 88 },
    "8-Q": { maxBytes: 110, ecc: 130 },"8-H": { maxBytes: 86, ecc: 156 },
    // Version 9 (53x53 modules)
    "9-L": { maxBytes: 232, ecc: 54 }, "9-M": { maxBytes: 182, ecc: 110 },
    "9-Q": { maxBytes: 132, ecc: 150 },"9-H": { maxBytes: 100, ecc: 180 },
    // Version 10 (57x57 modules)
    "10-L": { maxBytes: 274, ecc: 62 },"10-M": { maxBytes: 216, ecc: 130 },
    "10-Q": { maxBytes: 154, ecc: 180 },"10-H": { maxBytes: 122, ecc: 224 }
  };

  // Find standard version that fits length
  function selectVersion(byteLength, ecLevel) {
    for (let v = 1; v <= 10; v++) {
      const cap = CAPACITY[`${v}-${ecLevel}`];
      if (cap && cap.maxBytes >= byteLength) {
        return v;
      }
    }
    return 10; // Fallback max capacity version 10
  }

  // Standard format information bitmasks for format patterns (15 bits)
  const FORMAT_INFO = {
    "L": [0x77C4, 0x72F3, 0x7DAA, 0x789D, 0x662F, 0x6318, 0x6C41, 0x6976],
    "M": [0x5412, 0x5125, 0x5E7C, 0x5B4B, 0x45F9, 0x40CE, 0x4B97, 0x4EA0],
    "Q": [0x355F, 0x3068, 0x3F31, 0x3A06, 0x24B4, 0x2183, 0x2ECA, 0x2BFD],
    "H": [0x1689, 0x13BE, 0x1CC7, 0x19F0, 0x0782, 0x02B5, 0x0DDC, 0x08EB]
  };

  // Alignment coordinates mapping for versions 1 to 10
  const ALIGNMENT_COORDS = [
    [],                      // V0
    [],                      // V1
    [6, 18],                 // V2
    [6, 22],                 // V3
    [6, 26],                 // V4
    [6, 30],                 // V5
    [6, 34],                 // V6
    [6, 22, 38],             // V7
    [6, 24, 42],             // V8
    [6, 26, 46],             // V9
    [6, 28, 50]              // V10
  ];

  return {
    encode: function(text, ecLevel = "M") {
      const utf8 = unescape(encodeURIComponent(text));
      const dataBytes = new Uint8Array(utf8.length);
      for (let i = 0; i < utf8.length; i++) {
        dataBytes[i] = utf8.charCodeAt(i);
      }

      const version = selectVersion(dataBytes.length, ecLevel);
      const cap = CAPACITY[`${version}-${ecLevel}`];
      
      // Pad byte indicators
      const headerLength = version >= 10 ? 2 : 1; // version size bits
      const totalCapacity = cap.maxBytes;
      
      const payload = new Uint8Array(totalCapacity);
      // Byte mode indicator is 0100 (4 bits)
      payload[0] = 0x40; 
      
      // Data length bits
      if (headerLength === 1) {
        payload[0] |= (dataBytes.length >> 4) & 0x0F;
        payload[1] = (dataBytes.length << 4) & 0xF0;
      } else {
        // Version >= 10 uses 16 bits length
        payload[0] |= (dataBytes.length >> 12) & 0x0F;
        payload[1] = (dataBytes.length >> 4) & 0xFF;
        payload[2] = (dataBytes.length << 4) & 0xF0;
      }

      // Fill data bytes shift logic
      let bitOffset = headerLength === 1 ? 12 : 20;
      for (let i = 0; i < dataBytes.length; i++) {
        const byte = dataBytes[i];
        const byteIndex = bitOffset >> 3;
        const shift = bitOffset & 7;
        payload[byteIndex] |= byte >> shift;
        if (shift > 0 && byteIndex + 1 < payload.length) {
          payload[byteIndex + 1] |= byte << (8 - shift);
        }
        bitOffset += 8;
      }

      // Terminator padding
      const termIdx = bitOffset >> 3;
      if (termIdx < payload.length) {
        // Add padding pattern 0xEC, 0x11 alternating
        let padState = true;
        for (let i = termIdx + 1; i < payload.length; i++) {
          payload[i] = padState ? 0xEC : 0x11;
          padState = !padState;
        }
      }

      // Reed Solomon ECC computation
      const eccBytes = rsRemainder(payload, cap.ecc);
      const finalBuffer = new Uint8Array(payload.length + eccBytes.length);
      finalBuffer.set(payload);
      finalBuffer.set(eccBytes, payload.length);

      // Initialize Matrix layout grid
      const matrixSize = 17 + version * 4;
      const matrix = Array(matrixSize).fill(null).map(() => Array(matrixSize).fill(0));
      const reserved = Array(matrixSize).fill(null).map(() => Array(matrixSize).fill(false));

      // 1. Draw Finder Patterns (7x7) at corners
      function drawFinder(rx, ry) {
        for (let y = -1; y <= 7; y++) {
          for (let x = -1; x <= 7; x++) {
            const mx = rx + x;
            const my = ry + y;
            if (mx >= 0 && mx < matrixSize && my >= 0 && my < matrixSize) {
              const border = (x === 0 || x === 6 || y === 0 || y === 6);
              const center = (x >= 2 && x <= 4 && y >= 2 && y <= 4);
              matrix[my][mx] = (border || center) ? 1 : -1;
              reserved[my][mx] = true;
            }
          }
        }
      }
      drawFinder(0, 0);
      drawFinder(matrixSize - 7, 0);
      drawFinder(0, matrixSize - 7);

      // 2. Draw Alignments (5x5) if present
      const aligns = ALIGNMENT_COORDS[version];
      for (let i = 0; i < aligns.length; i++) {
        for (let j = 0; j < aligns.length; j++) {
          const ax = aligns[i];
          const ay = aligns[j];
          // Skip corners already filled by Finder squares
          if (reserved[ay][ax]) continue;
          
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const border = Math.max(Math.abs(dx), Math.abs(dy)) === 2;
              const center = dx === 0 && dy === 0;
              matrix[ay + dy][ax + dx] = (border || center) ? 1 : -1;
              reserved[ay + dy][ax + dx] = true;
            }
          }
        }
      }

      // 3. Draw Timing Patterns (dotted lines row 6 & col 6)
      for (let i = 8; i < matrixSize - 8; i++) {
        if (matrix[6][i] === 0) {
          matrix[6][i] = (i % 2 === 0) ? 1 : -1;
          reserved[6][i] = true;
        }
        if (matrix[i][6] === 0) {
          matrix[i][6] = (i % 2 === 0) ? 1 : -1;
          reserved[i][6] = true;
        }
      }

      // 4. Reserve Format Info cells for masking step
      for (let i = 0; i < 9; i++) {
        reserved[8][i] = true;
        reserved[i][8] = true;
        reserved[matrixSize - 1 - i][8] = true;
        reserved[8][matrixSize - 1 - i] = true;
      }
      matrix[matrixSize - 8][8] = 1; // Dark module
      reserved[matrixSize - 8][8] = true;

      // 5. Place payload bits in zigzag pattern
      let bitIndex = 0;
      let col = matrixSize - 1;
      let rowDirection = -1; // up
      let row = matrixSize - 1;

      while (col > 0) {
        if (col === 6) col--; // Skip timing pattern column
        
        for (let i = 0; i < 2; i++) {
          const currCol = col - i;
          if (!reserved[row][currCol]) {
            let bit = 0;
            if (bitIndex < finalBuffer.length * 8) {
              const byteVal = finalBuffer[bitIndex >> 3];
              bit = (byteVal >> (7 - (bitIndex & 7))) & 1;
              bitIndex++;
            }
            matrix[row][currCol] = bit ? 1 : -1;
          }
        }

        row += rowDirection;
        if (row < 0 || row >= matrixSize) {
          rowDirection = -rowDirection;
          row += rowDirection;
          col -= 2;
        }
      }

      // 6. Apply Masking (Use standard Mask 0: (row + col) % 2 == 0)
      const maskId = 0;
      for (let r = 0; r < matrixSize; r++) {
        for (let c = 0; c < matrixSize; c++) {
          if (!reserved[r][c]) {
            const val = matrix[r][c];
            const mask = ((r + c) % 2 === 0);
            matrix[r][c] = mask ? -val : val;
          }
        }
      }

      // 7. Render final format info bits (Using selected Mask 0 format bits)
      const formatBits = FORMAT_INFO[ecLevel][maskId];
      for (let i = 0; i < 15; i++) {
        const bit = (formatBits >> i) & 1;
        // Upper left coordinates
        let mx, my;
        if (i < 6) {
          mx = i === 6 ? 7 : i; my = 8;
        } else if (i < 8) {
          mx = i === 6 ? 7 : 8; my = i === 6 ? 8 : 7;
        } else if (i === 8) {
          mx = 8; my = 5;
        } else {
          mx = 8; my = 14 - i;
        }
        
        // Match with reservation values mapping
        if (i < 6) {
          matrix[8][i < 6 ? i : i + 1] = bit ? 1 : -1;
        } else if (i < 8) {
          matrix[i === 6 ? 8 : 7][8] = bit ? 1 : -1;
        } else {
          matrix[14 - i][8] = bit ? 1 : -1;
        }

        // Secondary copies for redundancies
        if (i < 8) {
          matrix[8][matrixSize - 1 - i] = bit ? 1 : -1;
        } else {
          matrix[matrixSize - 15 + i][8] = bit ? 1 : -1;
        }
      }

      // Return unified representation
      return {
        size: matrixSize,
        modules: matrix.map(row => row.map(cell => cell === 1))
      };
    }
  };
})();

// =====================================================================
// Dynamic Input Fields Generator Manager
// =====================================================================
const INPUT_TEMPLATES = {
  text: `
    <div class="form-group active-fields">
      <textarea id="input-text" placeholder="여기에 텍스트를 입력하세요..." maxlength="1435"></textarea>
      <div class="char-counter">일반 텍스트를 입력하세요 <span id="lbl-char-count">0/1435</span></div>
    </div>
  `,
  url: `
    <div class="form-group active-fields">
      <div class="form-item">
        <label for="input-url">웹사이트 링크 주소 (URL)</label>
        <input type="text" id="input-url" placeholder="https://example.com" value="https://">
      </div>
    </div>
  `,
  email: `
    <div class="form-group active-fields">
      <div class="form-item">
        <label for="input-email-to">수신자 이메일</label>
        <input type="text" id="input-email-to" placeholder="user@domain.com">
      </div>
      <div class="form-item">
        <label for="input-email-sub">제목 (Subject)</label>
        <input type="text" id="input-email-sub" placeholder="이메일 제목">
      </div>
      <div class="form-item">
        <label for="input-email-body">본문 내용 (Body)</label>
        <textarea id="input-email-body" placeholder="이메일 내용을 입력하세요..." style="min-height:70px;"></textarea>
      </div>
    </div>
  `,
  phone: `
    <div class="form-group active-fields">
      <div class="form-item">
        <label for="input-phone">전화번호</label>
        <input type="text" id="input-phone" placeholder="010-1234-5678">
      </div>
    </div>
  `,
  wifi: `
    <div class="form-group active-fields">
      <div class="form-row">
        <div class="form-item">
          <label for="input-wifi-ssid">네트워크 이름 (SSID)</label>
          <input type="text" id="input-wifi-ssid" placeholder="WiFi SSID">
        </div>
        <div class="form-item">
          <label for="input-wifi-type">암호화 타입</label>
          <select id="input-wifi-type" class="dropdown-select">
            <option value="WPA" selected>WPA/WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">없음 (Open)</option>
          </select>
        </div>
      </div>
      <div class="form-row" id="wifi-pass-group">
        <div class="form-item">
          <label for="input-wifi-pass">비밀번호</label>
          <input type="password" id="input-wifi-pass" placeholder="비밀번호 입력">
        </div>
      </div>
      <label class="checkbox-item">
        <input type="checkbox" id="input-wifi-hidden">
        <span>숨겨진 와이파이 네트워크 (Hidden SSID)</span>
      </label>
    </div>
  `,
  vcard: `
    <div class="form-group active-fields">
      <div class="form-row">
        <div class="form-item">
          <label for="input-card-name">이름 (Full Name)</label>
          <input type="text" id="input-card-name" placeholder="홍길동">
        </div>
        <div class="form-item">
          <label for="input-card-org">회사/소속</label>
          <input type="text" id="input-card-org" placeholder="CineAHO Inc.">
        </div>
      </div>
      <div class="form-row">
        <div class="form-item">
          <label for="input-card-tel">전화번호</label>
          <input type="text" id="input-card-tel" placeholder="010-1234-5678">
        </div>
        <div class="form-item">
          <label for="input-card-email">이메일</label>
          <input type="text" id="input-card-email" placeholder="user@domain.com">
        </div>
      </div>
      <div class="form-item">
        <label for="input-card-url">웹사이트 (URL)</label>
        <input type="text" id="input-card-url" placeholder="https://example.com">
      </div>
      <div class="form-item">
        <label for="input-card-addr">주소 (Address)</label>
        <input type="text" id="input-card-addr" placeholder="서울특별시 강남구 ...">
      </div>
    </div>
  `,
  sms: `
    <div class="form-group active-fields">
      <div class="form-item">
        <label for="input-sms-to">수신자 번호</label>
        <input type="text" id="input-sms-to" placeholder="010-1234-5678">
      </div>
      <div class="form-item">
        <label for="input-sms-msg">메시지 내용</label>
        <textarea id="input-sms-msg" placeholder="여기에 전송할 메시지 내용을 입력하세요..." style="min-height:80px;"></textarea>
      </div>
    </div>
  `,
  geo: `
    <div class="form-group active-fields">
      <div class="form-row">
        <div class="form-item">
          <label for="input-geo-lat">위도 (Latitude)</label>
          <input type="text" id="input-geo-lat" placeholder="37.5665" value="37.5665">
        </div>
        <div class="form-item">
          <label for="input-geo-lng">경도 (Longitude)</label>
          <input type="text" id="input-geo-lng" placeholder="126.9780" value="126.9780">
        </div>
      </div>
      <div style="font-size:0.75rem; color:var(--text-muted);">
        💡 서울시청 위도(37.5665), 경도(126.9780) 기본 기준
      </div>
    </div>
  `
};

const TOC_ARTICLES = {
  1: {
    title: "QR 코드 개요",
    badge: "가이드 01: 개요",
    icon: "fa-circle-info",
    content: `
      <p><strong>QR 코드(Quick Response Code)</strong>는 1994년 일본 덴소 웨이브(Denso Wave) 사가 개발한 2차원 매트릭스 형태의 바코드 규격입니다.</p>
      <p>기존 1차원 바코드가 가로 방향으로만 정보를 기록하여 수십 자 내외의 제한적인 문자만 보관할 수 있었던 것과 달리, QR코드는 가로와 세로 두 방향 모두에 바 형태로 정보를 패턴 밀도화하여 최대 7,000자 이상의 대용량 문자, 기호, 이메일, 와이파이 계정 암호 정보 등을 보관할 수 있는 획기적인 오프라인-온라인 O2O 브리지 기술입니다.</p>
    `
  },
  2: {
    title: "역사와 인코딩 원리",
    badge: "가이드 02: 인코딩 이론",
    icon: "fa-clock-rotate-left",
    content: `
      <p>QR코드는 도요타 자동차 공장에서 부품 유통 및 물류 추적 속도를 혁신적으로 단축시키기 위해 고안되었습니다. 인코딩은 크게 다음과 같은 내부 알고리즘 단계를 거쳐 생성됩니다.</p>
      <ul>
        <li><strong>데이터 모드 분기</strong>: 입력 문자의 범위를 판별하여 숫자 모드(4비트), 알파뉴메릭(대문자/특수문자, 9비트), 바이트 모드(UTF-8 한글, 8비트) 중 가장 효율적인 데이터 비트 배열로 분배합니다.</li>
        <li><strong>블록 분할 및 패딩</strong>: 인코딩할 텍스트 비트열 끝에 종료 지시자(0000)를 붙이고 규격에 맞게 8비트씩 잘라 버퍼를 만든 뒤, 남는 잔여 비트열에 패딩 바이트(0xEC와 0x11 번갈아 대입)를 가득 채워 블록을 형성합니다.</li>
        <li><strong>리드 솔로몬 에러 보정</strong>: Galois Field 수학 이론에 의거하여 데이터 코드를 기반으로 한 다항식 나눗셈 연산을 돌려 에러 체크용 리드 솔로몬 ECC 바이트를 산출해 내고 데이터 블록 꼬리에 병합합니다.</li>
      </ul>
    `
  },
  3: {
    title: "오류 복원력(EC)의 기작",
    badge: "가이드 03: 에러 복원 메커니즘",
    icon: "fa-shield-halved",
    content: `
      <p>QR코드의 가장 강력한 강점은 코드의 일부가 찢어지거나 오염되어 유실되더라도 온전히 전체 데이터 내용을 복원하여 정상 스캔을 해내는 <strong>오류 복원(Error Correction)</strong> 능력입니다.</p>
      <p>이는 수학적 다항식 코드 설계인 리드 솔로몬 에러 정정(Reed-Solomon Error Correction) 부호 체계 덕분이며, 복원 수준에 따라 4가지 레벨을 지원합니다.</p>
      <ul>
        <li><strong>L 레벨 (Low)</strong>: 약 7% 유실 복원력. 인코딩 밀도가 낮아 도트가 굵고 멀리서도 인식이 잘 됨.</li>
        <li><strong>M 레벨 (Medium)</strong>: 약 15% 유실 복원력. 일반적인 오리지널 기본 표준 환경.</li>
        <li><strong>Q 레벨 (Quality)</strong>: 약 25% 유실 복원력. 약간의 스크래치가 예상되는 인쇄물용.</li>
        <li><strong>H 레벨 (High)</strong>: 약 30% 유실 복원력. <strong>중앙 로고 삽입 시 권장</strong>. 로고가 약 20% 공간을 가려 가리는 부분에 대한 오류 정정을 H레벨 부호가 완벽하게 복구해 내기 때문입니다.</li>
      </ul>
    `
  },
  4: {
    title: "8대 데이터 스키마 규격",
    badge: "가이드 04: 스키마 프로토콜",
    icon: "fa-list-check",
    content: `
      <p>스마트폰 카메라 앱이나 리더기 앱이 QR코드를 찍었을 때, 특정 동작을 자동으로 수행하도록 설계된 글로벌 스키마 규격입니다.</p>
      <ul>
        <li><strong>URL 링크</strong>: 주소창을 자동 인식함 (` + "`" + `https://주소` + "`" + `).</li>
        <li><strong>WiFi 연결</strong>: 와이파이 자동 스캔 및 비번 입력 생략 연동 (` + "`" + `WIFI:T:WPA;S:이름;P:비번;;` + "`" + `).</li>
        <li><strong>vCard 연락처</strong>: 주소록 인적 사항 일괄 등록 (` + "`" + `BEGIN:VCARD\\nFN:이름\\nTEL:번호\\nEND:VCARD` + "`" + `).</li>
        <li><strong>SMS/이메일</strong>: 수신인과 내용이 기재된 전송 팝업 (` + "`" + `SMSTO:번호:메시지` + "`" + `, ` + "`" + `mailto:메일?subject=제목&body=본문` + "`" + `).</li>
        <li><strong>지리 정보</strong>: 구글 맵이나 지도 앱 자동 좌표 핀 지정 (` + "`" + `geo:위도,경도` + "`" + `).</li>
      </ul>
    `
  },
  5: {
    title: "디자인 커스텀 가이드",
    badge: "가이드 05: 디자인 커스텀",
    icon: "fa-palette",
    content: `
      <p>QR코드도 인쇄 디자인 요소에 맞춰 훌륭한 디자인 요소로 변모할 수 있습니다.</p>
      <ul>
        <li><strong>그라데이션 색상</strong>: 단색 검은색을 피하고, 캔버스 선형 그라데이션 API를 적용하여 좌상단에서 우하단까지 유기적으로 색상이 변화하는 네온 그라디언트를 이식합니다.</li>
        <li><strong>도트 스타일 커스텀</strong>: 기본적인 사각형 도트 외에, Canvas 드로잉에서 반경 R을 이용한 원호(` + "`" + `arc` + "`" + `) 및 모서리를 둥글게 다듬는 R값 필터를 활용해 써클 도트, 둥글둥글한 도트로 변모시킬 수 있습니다.</li>
        <li><strong>아이 마커 분리</strong>: 3곳의 커다란 '아이(Eye)' 파인더라고 불리는 7x7 패턴은 인식 정렬에 핵심 요소이므로, 내부 도트 형태가 바뀌어도 마커의 원형 정돈을 훼손하지 않게 분리 코딩해야 리더기 인식이 깨지지 않습니다.</li>
      </ul>
    `
  },
  6: {
    title: "템플릿 프리셋 활용",
    badge: "가이드 06: 템플릿",
    icon: "fa-border-all",
    content: `
      <p>언제든 사용 가능한 5대 프리셋 스타일을 클릭 한 번으로 제공합니다.</p>
      <ul>
        <li><strong>클래식 블랙</strong>: 종이 인쇄 및 팩스 등 기본 출력에 어울리는 전통적인 고대비 단색 스키마입니다.</li>
        <li><strong>네온 사이버</strong>: 보라색과 블루 그라디언트가 결합된 트렌디한 IT 감성의 테마입니다.</li>
        <li><strong>에메랄드</strong>: 자연스럽고 청량한 에코/친환경적인 분위기를 자아냅니다.</li>
        <li><strong>사쿠라 핑크</strong>: 감성적인 이벤트, 카페, 기념품 링크에 배치하기 좋은 연분홍 그라데이션입니다.</li>
        <li><strong>썬셋 골드</strong>: 프리미엄 멤버십, 고급 호텔, 위스키 바 코드용 금빛 그라데이션 프리셋입니다.</li>
      </ul>
    `
  },
  7: {
    title: "내보내기 포맷 비교 (PNG/SVG)",
    badge: "가이드 07: 파일 포맷",
    icon: "fa-file-export",
    content: `
      <p>제작한 QR코드를 내보낼 때 상황에 가장 적절한 파일 포맷 선택 요령입니다.</p>
      <ul>
        <li><strong>PNG (픽셀 래스터)</strong>: 모바일 웹사이트 업로드, 파워포인트 슬라이드 기입, 웹 이벤트 배너 등 모니터용 해상도에 최적화되어 간편하게 쓰입니다.</li>
        <li><strong>SVG (벡터 포맷)</strong>: <strong>전문 인쇄 및 대형 간판용 필수</strong>. 도트 격자들을 XML 코드 형태로 하나하나 연산하여 그린 백터 파일이므로, 가로 폭을 수십 미터 크기로 늘려 출력하더라도 도트 계단 현상이 전혀 없이 칼날처럼 깨끗하게 출력됩니다.</li>
      </ul>
    `
  },
  8: {
    title: "스캔 오류 해결 기법",
    badge: "가이드 08: 스캔 해결법",
    icon: "fa-triangle-exclamation",
    content: `
      <p>QR코드 생성 후 스마트폰에서 스캔이 제대로 안 된다면 다음 수칙들을 검증해 보십시오.</p>
      <ul>
        <li><strong>명도 대비 부족</strong>: QR코드는 배경색과 전경색 간의 대비율이 가장 중요합니다. 배경색을 어두운 청색으로 하고 전경색을 보라색으로 할 경우 카메라 렌즈 조리개가 모듈 경계를 분간하지 못합니다. 배경은 가능한 한 아주 밝은 흰색/아이보리 톤으로 하고 코드는 짙은 색으로 대비를 주십시오.</li>
        <li><strong>중앙 로고 과다 점유</strong>: 로고 크기가 QR코드 전체 면적의 20%를 넘거나, 3곳의 Finder Eye 마커를 가리면 에러 정정 레벨을 H로 설정했더라도 복구 한계를 초과하여 무한 로딩 상태가 될 수 있으므로 로고 비율을 15% 이내로 유지하십시오.</li>
      </ul>
    `
  },
  9: {
    title: "비즈니스 마케팅 활용",
    badge: "가이드 09: 마케팅 활용",
    icon: "fa-chart-line",
    content: `
      <p>현대 오프라인 마케팅 캠페인의 성공적인 QR코드 접목 방식입니다.</p>
      <ul>
        <li><strong>오프라인 홍보물</strong>: 브로셔, 배너, 매장 윈도우에 부착하여 터치 한 번으로 쇼핑몰 결제창에 진입시킬 수 있습니다.</li>
        <li><strong>WiFi 원터치 코드</strong>: 호텔 객실이나 카페 테이블에 부착해 두어 손님이 일일이 암호를 입력하는 수고를 덜고 즉각 와이파이를 개방합니다.</li>
        <li><strong>연락처 명함 기입</strong>: 종이 명함 구석에 vCard 포맷의 QR코드를 새기면, 비즈니스 상대방이 카메라를 비춰 3초 만에 휴대폰 주소록에 내 이름, 번호, 이메일을 통째로 입력할 수 있어 네트워킹 속도가 비약적으로 올라갑니다.</li>
      </ul>
    `
  },
  10: {
    title: "모바일 접근성 시너지",
    badge: "가이드 10: 접근성 시너지",
    icon: "fa-mobile",
    content: `
      <ul>
        <li><strong>디지털 소외 계층 배려</strong>: 복잡하고 긴 URL 주소를 자판으로 오탈자 없이 치기 힘든 노년층이나 디지털 기기 조작 취약 계층도 기본 카메라만 대면 원터치로 해당 관공서/신청 페이지로 점프할 수 있어 모바일 정보 접근성 편의를 대폭 향상시킵니다.</li>
        <li><strong>키패드 오타 전소</strong>: vCard 및 이메일 서식 입력이 자동화되므로, 입력 오타로 인한 메일 전송 오류나 번호 등록 실수를 0%로 소멸시킵니다.</li>
      </ul>
    `
  },
  11: {
    title: "자주 묻는 질문 (FAQ)",
    badge: "가이드 11: FAQ",
    icon: "fa-question-circle",
    content: `
      <p><strong>Q. 이 생성기로 만든 QR코드에도 유효기간이 존재하나요?</strong><br>A. 아니요! 본 생성기는 데이터 문자열을 QR코드로 규격화해 주는 독립 실행 툴이므로 유효기간이 전혀 없는 영구적인 스캔 코드를 출력합니다.</p>
      <p><strong>Q. 커스텀 이미지 로고를 올렸는데 이미지가 흐릿합니다.</strong><br>A. 로고 이미지 원본이 지나치게 클 경우 캔버스 리사이징 처리로 인해 픽셀이 흐려 보일 수 있으나 실제 스캔에는 문제가 없습니다. 고품질 출력을 원하신다면 'SVG 파일 저장'을 사용하여 인쇄하십시오.</p>
      <p><strong>Q. WiFi 암호가 없을 땐 어떻게 만드나요?</strong><br>A. 암호화 타입을 '없음 (Open)'으로 선택하시면 암호 입력 칸이 사라지고 바로 개방형 접속 코드가 생성됩니다.</p>
    `
  }
};

// =====================================================================
// Global Application State Manager
// =====================================================================
let currentDataType = "text";
let qrSize = 300;
let ecLevel = "M";
let dotStyle = "square";
let colorType = "solid";

let fgColorSingle = "#000000";
let fgColorGradStart = "#a855f7";
let fgColorGradEnd = "#3b82f6";
let bgColor = "#ffffff";

let selectedPreset = "classic";
let logoPreset = "none";
let customLogoImage = null; // Holds uploaded logo Image object

// DOM Elements
const dynamicInputsContainer = document.getElementById("dynamic-inputs");
const dataTypeTabs = document.querySelectorAll(".btn-type-tab");
const actionTabs = document.querySelectorAll(".btn-action-tab");
const drawerPanels = document.querySelectorAll(".drawer-panel");
const qrCanvas = document.getElementById("qr-canvas");
const qrPlaceholder = document.getElementById("qr-placeholder");
const qrSizeSlider = document.getElementById("slider-qr-size");
const qrSizeLabel = document.getElementById("lbl-qr-size");
const previewBadge = document.getElementById("lbl-preview-badge");

// Customs
const selectColorType = document.getElementById("select-color-type");
const pickerFgColor = document.getElementById("picker-fg-color");
const txtFgColor = document.getElementById("txt-fg-color");
const pickerGradStart = document.getElementById("picker-grad-start");
const pickerGradEnd = document.getElementById("picker-grad-end");
const pickerBgColor = document.getElementById("picker-bg-color");
const txtBgColor = document.getElementById("txt-bg-color");
const selectDotStyle = document.getElementById("select-dot-style");
const selectEcLevel = document.getElementById("select-ec-level");
const selectLogoPreset = document.getElementById("select-logo-preset");
const inputLogoFile = document.getElementById("input-logo-file");

// Preset template items
const templateItems = document.querySelectorAll(".template-item");

// Downloader buttons
const btnDownloadPng = document.getElementById("btn-download-png");
const btnDownloadJpeg = document.getElementById("btn-download-jpeg");
const btnDownloadSvg = document.getElementById("btn-download-svg");
const btnCopyClipboard = document.getElementById("btn-copy-clipboard");

// TOC items
const explanationBoardContent = document.getElementById("explanation-board-content");
const explanationTitleBadge = document.getElementById("explanation-title-badge");
const explanationDisplayTitle = document.getElementById("explanation-display-title");
const explanationDisplayText = document.getElementById("explanation-display-text");
const tocListItems = document.querySelectorAll(".explanation-index-list li");

// Preset template colors configuration mapping
const PRESETS = {
  classic: {
    colorType: "solid",
    fg: "#000000",
    bg: "#ffffff",
    dot: "square"
  },
  neon: {
    colorType: "gradient",
    start: "#a855f7",
    end: "#3b82f6",
    bg: "#ffffff",
    dot: "rounded"
  },
  emerald: {
    colorType: "gradient",
    start: "#10b981",
    end: "#047857",
    bg: "#ffffff",
    dot: "rounded"
  },
  sakura: {
    colorType: "gradient",
    start: "#f43f5e",
    end: "#f472b6",
    bg: "#ffffff",
    dot: "circle"
  },
  sunset: {
    colorType: "gradient",
    start: "#f97316",
    end: "#eab308",
    bg: "#ffffff",
    dot: "square"
  }
};

// Preset vector logo symbols paths for center inserts
const LOGO_PATH_PRESETS = {
  link: "M4.22 18.22a.75.75 0 0 0 1.06 1.06l1.22-1.22L6.16 20h.09A7.5 7.5 0 0 0 13.5 12.5v-.09L12.28 11.2a.75.75 0 0 0-1.06 1.06l1.22 1.22v.02c0 2.48-2.02 4.5-4.5 4.5h-.02L6.7 16.78a.75.75 0 0 0-1.06 1.06l1.22 1.22a.75.75 0 0 0 1.06 0l2.3-2.3a.75.75 0 0 0 0-1.06l-.59-.59a.75.75 0 0 0-1.06 0l-2.3 2.3Z",
  wifi: "M12 21a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm-6-5.2a8.5 8.5 0 0 1 9 0 .75.75 0 1 0 .9-1.2 10 10 0 0 0-10.8 0 .75.75 0 1 0 .9 1.2Zm-3-4.3a14.5 14.5 0 0 1 15 0 .75.75 0 1 0 .9-1.2 16 16 0 0 0-16.8 0 .75.75 0 1 0 .9 1.2Z",
  phone: "M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
};

// -------------------------------------------------------------
// Initialization
// -------------------------------------------------------------
function init() {
  setupDataTypeTab(currentDataType);
  setupListeners();
  
  // Set default TOC explanation text
  switchTOCArticle(1);

  // Trigger default QR code preview logic
  generateQR();
}

function setupListeners() {
  // Data Type Tabs clicks
  dataTypeTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      dataTypeTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      const type = tab.getAttribute("data-type");
      currentDataType = type;
      setupDataTypeTab(type);
      generateQR();
    });
  });

  // Action Tabs toggle configs drawers
  actionTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      actionTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      const targetId = tab.getAttribute("data-target");
      drawerPanels.forEach(panel => {
        if (panel.id === targetId) {
          panel.classList.add("active");
        } else {
          panel.classList.remove("active");
        }
      });
    });
  });

  // Hex color updates
  pickerFgColor.addEventListener("input", (e) => {
    fgColorSingle = e.target.value;
    txtFgColor.value = fgColorSingle.toUpperCase();
    generateQR();
  });
  txtFgColor.addEventListener("change", (e) => {
    let val = e.target.value;
    if (!val.startsWith("#")) val = "#" + val;
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      fgColorSingle = val;
      pickerFgColor.value = val;
      generateQR();
    }
  });

  pickerGradStart.addEventListener("input", (e) => {
    fgColorGradStart = e.target.value;
    generateQR();
  });
  pickerGradEnd.addEventListener("input", (e) => {
    fgColorGradEnd = e.target.value;
    generateQR();
  });

  pickerBgColor.addEventListener("input", (e) => {
    bgColor = e.target.value;
    txtBgColor.value = bgColor.toUpperCase();
    generateQR();
  });
  txtBgColor.addEventListener("change", (e) => {
    let val = e.target.value;
    if (!val.startsWith("#")) val = "#" + val;
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      bgColor = val;
      pickerBgColor.value = val;
      generateQR();
    }
  });

  // Customs dropdown selects
  selectColorType.addEventListener("change", (e) => {
    colorType = e.target.value;
    document.getElementById("fg-color-single-group").style.display = colorType === "solid" ? "flex" : "none";
    document.getElementById("fg-color-grad-group").style.display = colorType === "gradient" ? "flex" : "none";
    generateQR();
  });

  selectDotStyle.addEventListener("change", (e) => {
    dotStyle = e.target.value;
    generateQR();
  });

  selectEcLevel.addEventListener("change", (e) => {
    ecLevel = e.target.value;
    generateQR();
  });

  selectLogoPreset.addEventListener("change", (e) => {
    logoPreset = e.target.value;
    document.getElementById("logo-upload-group").style.display = logoPreset === "custom" ? "flex" : "none";
    generateQR();
  });

  // Custom Logo upload parser
  inputLogoFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
          customLogoImage = img;
          generateQR();
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Size slider controls
  qrSizeSlider.addEventListener("input", (e) => {
    qrSize = parseInt(e.target.value, 10);
    qrSizeLabel.textContent = `${qrSize}px`;
    
    // adjust canvas size
    qrCanvas.width = qrSize;
    qrCanvas.height = qrSize;
    generateQR();
  });

  // Template Presets clicks
  templateItems.forEach(item => {
    item.addEventListener("click", () => {
      templateItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      
      const presetId = item.getAttribute("data-preset");
      applyPresetTemplate(presetId);
    });
  });

  // Downloader clicks
  btnDownloadPng.addEventListener("click", () => {
    triggerDownload("png");
  });
  btnDownloadJpeg.addEventListener("click", () => {
    triggerDownload("jpeg");
  });
  btnDownloadSvg.addEventListener("click", () => {
    triggerDownload("svg");
  });
  btnCopyClipboard.addEventListener("click", () => {
    copyCanvasToClipboard();
  });

  // Floating menus
  document.getElementById("btn-scroll-top").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.getElementById("btn-scroll-bottom").addEventListener("click", () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  });

  // TOC navigation index list
  tocListItems.forEach((li) => {
    li.addEventListener("click", () => {
      tocListItems.forEach(item => item.classList.remove("active"));
      li.classList.add("active");
      
      const idx = parseInt(li.getAttribute("data-index"), 10);
      switchTOCArticle(idx);
    });
  });
}

// -------------------------------------------------------------
// Form Layout Switcher (8 tabs)
// -------------------------------------------------------------
function setupDataTypeTab(type) {
  dynamicInputsContainer.innerHTML = INPUT_TEMPLATES[type];
  
  // Trigger binding inputs listeners
  bindDynamicInputsListeners(type);
}

// Binds live triggers to form fields
function bindDynamicInputsListeners(type) {
  if (type === "text") {
    const textEl = document.getElementById("input-text");
    const countEl = document.getElementById("lbl-char-count");
    
    textEl.addEventListener("input", (e) => {
      const len = e.target.value.length;
      countEl.textContent = `${len}/1435`;
      generateQR();
    });
  } 
  
  else if (type === "url") {
    document.getElementById("input-url").addEventListener("input", () => generateQR());
  } 
  
  else if (type === "email") {
    document.getElementById("input-email-to").addEventListener("input", () => generateQR());
    document.getElementById("input-email-sub").addEventListener("input", () => generateQR());
    document.getElementById("input-email-body").addEventListener("input", () => generateQR());
  } 
  
  else if (type === "phone") {
    document.getElementById("input-phone").addEventListener("input", () => generateQR());
  } 
  
  else if (type === "wifi") {
    const ssidEl = document.getElementById("input-wifi-ssid");
    const typeEl = document.getElementById("input-wifi-type");
    const passEl = document.getElementById("input-wifi-pass");
    const hideEl = document.getElementById("input-wifi-hidden");
    
    ssidEl.addEventListener("input", () => generateQR());
    passEl.addEventListener("input", () => generateQR());
    hideEl.addEventListener("change", () => generateQR());
    
    typeEl.addEventListener("change", (e) => {
      const val = e.target.value;
      // Hide password field if Open Wifi
      document.getElementById("wifi-pass-group").style.display = val === "nopass" ? "none" : "block";
      generateQR();
    });
  } 
  
  else if (type === "vcard") {
    document.getElementById("input-card-name").addEventListener("input", () => generateQR());
    document.getElementById("input-card-org").addEventListener("input", () => generateQR());
    document.getElementById("input-card-tel").addEventListener("input", () => generateQR());
    document.getElementById("input-card-email").addEventListener("input", () => generateQR());
    document.getElementById("input-card-url").addEventListener("input", () => generateQR());
    document.getElementById("input-card-addr").addEventListener("input", () => generateQR());
  } 
  
  else if (type === "sms") {
    document.getElementById("input-sms-to").addEventListener("input", () => generateQR());
    document.getElementById("input-sms-msg").addEventListener("input", () => generateQR());
  } 
  
  else if (type === "geo") {
    document.getElementById("input-geo-lat").addEventListener("input", () => generateQR());
    document.getElementById("input-geo-lng").addEventListener("input", () => generateQR());
  }
}

// -------------------------------------------------------------
// Preset Template Application
// -------------------------------------------------------------
function applyPresetTemplate(presetId) {
  const preset = PRESETS[presetId];
  if (!preset) return;
  
  selectedPreset = presetId;
  colorType = preset.colorType;
  selectColorType.value = colorType;
  
  if (colorType === "solid") {
    fgColorSingle = preset.fg;
    pickerFgColor.value = fgColorSingle;
    txtFgColor.value = fgColorSingle.toUpperCase();
    
    document.getElementById("fg-color-single-group").style.display = "flex";
    document.getElementById("fg-color-grad-group").style.display = "none";
  } else {
    fgColorGradStart = preset.start;
    fgColorGradEnd = preset.end;
    pickerGradStart.value = fgColorGradStart;
    pickerGradEnd.value = fgColorGradEnd;
    
    document.getElementById("fg-color-single-group").style.display = "none";
    document.getElementById("fg-color-grad-group").style.display = "flex";
  }
  
  bgColor = preset.bg;
  pickerBgColor.value = bgColor;
  txtBgColor.value = bgColor.toUpperCase();
  
  dotStyle = preset.dot;
  selectDotStyle.value = dotStyle;
  
  generateQR();
}

// -------------------------------------------------------------
// Data Parser matching standard schemas
// -------------------------------------------------------------
function parseInputPayload() {
  let parsed = { text: "", badge: "텍스트: 입력 대기 중" };
  
  if (currentDataType === "text") {
    const val = document.getElementById("input-text") ? document.getElementById("input-text").value.trim() : "";
    parsed.text = val;
    parsed.badge = val ? `📄 텍스트: ${val.substring(0, 10)}${val.length > 10 ? "..." : ""}` : "텍스트: 입력 대기 중";
  } 
  
  else if (currentDataType === "url") {
    const val = document.getElementById("input-url") ? document.getElementById("input-url").value.trim() : "";
    parsed.text = val;
    parsed.badge = val && val !== "https://" ? `🔗 링크: ${val.substring(0, 15)}...` : "URL: 주소 대기 중";
  } 
  
  else if (currentDataType === "email") {
    const to = document.getElementById("input-email-to") ? document.getElementById("input-email-to").value.trim() : "";
    const sub = document.getElementById("input-email-sub") ? document.getElementById("input-email-sub").value.trim() : "";
    const body = document.getElementById("input-email-body") ? document.getElementById("input-email-body").value.trim() : "";
    
    if (to) {
      parsed.text = `mailto:${to}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
      parsed.badge = `✉️ 이메일: ${to}`;
    }
  } 
  
  else if (currentDataType === "phone") {
    const val = document.getElementById("input-phone") ? document.getElementById("input-phone").value.trim() : "";
    if (val) {
      parsed.text = `tel:${val}`;
      parsed.badge = `📞 전화: ${val}`;
    }
  } 
  
  else if (currentDataType === "wifi") {
    const ssid = document.getElementById("input-wifi-ssid") ? document.getElementById("input-wifi-ssid").value : "";
    const type = document.getElementById("input-wifi-type") ? document.getElementById("input-wifi-type").value : "WPA";
    const pass = document.getElementById("input-wifi-pass") ? document.getElementById("input-wifi-pass").value : "";
    const isHidden = document.getElementById("input-wifi-hidden") ? document.getElementById("input-wifi-hidden").checked : false;
    
    if (ssid) {
      parsed.text = `WIFI:S:${ssid};T:${type};P:${type === "nopass" ? "" : pass};H:${isHidden ? "true" : "false"};;`;
      parsed.badge = `📶 와이파이 SSID: ${ssid}`;
    }
  } 
  
  else if (currentDataType === "vcard") {
    const n = document.getElementById("input-card-name") ? document.getElementById("input-card-name").value.trim() : "";
    const org = document.getElementById("input-card-org") ? document.getElementById("input-card-org").value.trim() : "";
    const tel = document.getElementById("input-card-tel") ? document.getElementById("input-card-tel").value.trim() : "";
    const mail = document.getElementById("input-card-email") ? document.getElementById("input-card-email").value.trim() : "";
    const url = document.getElementById("input-card-url") ? document.getElementById("input-card-url").value.trim() : "";
    const addr = document.getElementById("input-card-addr") ? document.getElementById("input-card-addr").value.trim() : "";
    
    if (n) {
      parsed.text = `BEGIN:VCARD\nVERSION:3.0\nFN:${n}\nORG:${org}\nTEL:${tel}\nEMAIL:${mail}\nURL:${url}\nADR:${addr}\nEND:VCARD`;
      parsed.badge = `📇 연락처 vCard: ${n}`;
    }
  } 
  
  else if (currentDataType === "sms") {
    const to = document.getElementById("input-sms-to") ? document.getElementById("input-sms-to").value.trim() : "";
    const msg = document.getElementById("input-sms-msg") ? document.getElementById("input-sms-msg").value.trim() : "";
    
    if (to) {
      parsed.text = `SMSTO:${to}:${msg}`;
      parsed.badge = `💬 문자 번호: ${to}`;
    }
  } 
  
  else if (currentDataType === "geo") {
    const lat = document.getElementById("input-geo-lat") ? document.getElementById("input-geo-lat").value.trim() : "";
    const lng = document.getElementById("input-geo-lng") ? document.getElementById("input-geo-lng").value.trim() : "";
    
    if (lat && lng) {
      parsed.text = `geo:${lat},${lng}`;
      parsed.badge = `📍 위치 좌표: ${lat}, ${lng}`;
    }
  }
  
  return parsed;
}

// -------------------------------------------------------------
// Canvas Drawing & Styling Renderer
// -------------------------------------------------------------
function generateQR() {
  const payload = parseInputPayload();
  
  // Update badge UI
  previewBadge.innerHTML = `<i class="fa-solid fa-align-left text-blue"></i> ${payload.badge}`;

  if (!payload.text) {
    // Show placeholder overlay if empty
    qrPlaceholder.style.display = "flex";
    return;
  }
  
  qrPlaceholder.style.display = "none";
  
  try {
    const qr = QREncoder.encode(payload.text, ecLevel);
    drawMatrixOnCanvas(qr);
  } catch(e) {
    console.error("QR Encoding failed:", e);
  }
}

// Draws QR matrix blocks with colors and styling options on HTML5 canvas
function drawMatrixOnCanvas(qr) {
  const canvasCtx = qrCanvas.getContext("2d");
  const size = qr.size;
  const modules = qr.modules;

  // Clear background
  canvasCtx.fillStyle = bgColor;
  canvasCtx.fillRect(0, 0, qrSize, qrSize);

  // Leave a 4 modules quiet zone margin around the code
  const marginModules = 3;
  const totalModules = size + marginModules * 2;
  const cellSize = qrSize / totalModules;

  // Create gradient if enabled
  let fillStyle = fgColorSingle;
  if (colorType === "gradient") {
    const grad = canvasCtx.createLinearGradient(0, 0, qrSize, qrSize);
    grad.addColorStop(0, fgColorGradStart);
    grad.addColorStop(1, fgColorGradEnd);
    fillStyle = grad;
  }
  canvasCtx.fillStyle = fillStyle;

  // Check if cell is part of the 3 Finder eye patterns at corners to draw them standard square/round
  function isFinderEye(r, c) {
    if (r < 7 && c < 7) return true; // top-left
    if (r < 7 && c >= size - 7) return true; // top-right
    if (r >= size - 7 && c < 7) return true; // bottom-left
    return false;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (modules[r][c]) {
        // Position coordinates
        const mx = (c + marginModules) * cellSize;
        const my = (r + marginModules) * cellSize;
        
        // Skip normal drawing for finder eye patterns for separate custom styling
        if (isFinderEye(r, c)) {
          // Standard Square finder drawing
          canvasCtx.fillStyle = fillStyle;
          canvasCtx.fillRect(mx, my, cellSize + 0.5, cellSize + 0.5);
          continue;
        }

        // Draw normal dot styled modules
        canvasCtx.fillStyle = fillStyle;
        
        if (dotStyle === "square") {
          // Normal block
          canvasCtx.fillRect(mx, my, cellSize + 0.5, cellSize + 0.5);
        } 
        
        else if (dotStyle === "rounded") {
          // Draw round block
          drawRoundRect(canvasCtx, mx + 0.5, my + 0.5, cellSize - 1, cellSize - 1, cellSize * 0.35, true);
        } 
        
        else if (dotStyle === "circle") {
          // Draw circle
          canvasCtx.beginPath();
          canvasCtx.arc(mx + cellSize/2, my + cellSize/2, cellSize * 0.4, 0, Math.PI * 2);
          canvasCtx.fill();
        }
      }
    }
  }

  // Draw eye finders outlines separately for design aesthetics
  drawSpecialFinderOutlines(canvasCtx, marginModules, size, cellSize, fillStyle);

  // Overlay central logo preset icons or images
  drawCentralLogo(canvasCtx, cellSize, totalModules, fillStyle);
}

// Draws premium round finder eyes
function drawSpecialFinderOutlines(canvasCtx, margin, size, cellSize, fillStyle) {
  canvasCtx.fillStyle = fillStyle;
  const eyes = [
    { r: 0, c: 0 },
    { r: 0, c: size - 7 },
    { r: size - 7, c: 0 }
  ];

  eyes.forEach(eye => {
    const mx = (eye.c + margin) * cellSize;
    const my = (eye.r + margin) * cellSize;
    const w = cellSize * 7;
    
    // Draw outer eye ring: we draw outer rect, and fill center space with background color
    canvasCtx.fillStyle = fillStyle;
    canvasCtx.fillRect(mx, my, w, w);
    
    canvasCtx.fillStyle = bgColor;
    canvasCtx.fillRect(mx + cellSize, my + cellSize, cellSize * 5, cellSize * 5);
    
    canvasCtx.fillStyle = fillStyle;
    canvasCtx.fillRect(mx + cellSize * 2, my + cellSize * 2, cellSize * 3, cellSize * 3);
  });
}

// Round rect drawing helper
function drawRoundRect(cCtx, x, y, width, height, radius, fill) {
  cCtx.beginPath();
  cCtx.moveTo(x + radius, y);
  cCtx.lineTo(x + width - radius, y);
  cCtx.quadraticCurveTo(x + width, y, x + width, y + radius);
  cCtx.lineTo(x + width, y + height - radius);
  cCtx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  cCtx.lineTo(x + radius, y + height);
  cCtx.quadraticCurveTo(x, y + height, x, y + height - radius);
  cCtx.lineTo(x, y + radius);
  cCtx.quadraticCurveTo(x, y, x + radius, y);
  cCtx.closePath();
  if (fill) {
    cCtx.fill();
  } else {
    cCtx.stroke();
  }
}

// Center logo composer
function drawCentralLogo(cCtx, cellSize, totalModules, fillStyle) {
  if (logoPreset === "none") return;
  
  // Calculate center coordinates
  const logoModules = Math.floor(totalModules * 0.18);
  const logoSize = logoModules * cellSize;
  const lx = (qrSize - logoSize) / 2;
  const ly = (qrSize - logoSize) / 2;
  
  // 1. Draw rounded background cover mask to prevent scanning overlaps
  cCtx.fillStyle = bgColor;
  drawRoundRect(cCtx, lx - 2, ly - 2, logoSize + 4, logoSize + 4, logoSize * 0.25, true);
  
  // 2. Insert Preset vector icons
  if (logoPreset !== "custom") {
    const dPath = LOGO_PATH_PRESETS[logoPreset];
    if (dPath) {
      cCtx.save();
      // scale path to logo dimensions
      cCtx.translate(lx + logoSize * 0.1, ly + logoSize * 0.1);
      const scale = (logoSize * 0.8) / 24; // standard SVGs have viewbox 24x24
      cCtx.scale(scale, scale);
      
      cCtx.fillStyle = fillStyle;
      cCtx.beginPath();
      // path2d drawing fallback
      const path2d = new Path2D(dPath);
      cCtx.fill(path2d);
      
      cCtx.restore();
    }
  } 
  // 3. Uploaded custom image logo drawing
  else if (logoPreset === "custom" && customLogoImage) {
    try {
      cCtx.save();
      // mask canvas image round
      cCtx.beginPath();
      drawRoundRect(cCtx, lx, ly, logoSize, logoSize, logoSize * 0.25, false);
      cCtx.clip();
      
      cCtx.drawImage(customLogoImage, lx, ly, logoSize, logoSize);
      cCtx.restore();
    } catch(e) {
      console.error("Custom logo image drawing failed:", e);
    }
  }
}

// -------------------------------------------------------------
// SVG / Image Exporters
// -------------------------------------------------------------
function triggerDownload(format) {
  const payload = parseInputPayload();
  if (!payload.text) return;
  
  if (format === "png" || format === "jpeg") {
    const mime = format === "png" ? "image/png" : "image/jpeg";
    const dataUrl = qrCanvas.toDataURL(mime, 0.95);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `qrcode_${Date.now()}.${format}`;
    link.click();
  } 
  
  else if (format === "svg") {
    const svgString = buildSVGString();
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `qrcode_${Date.now()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Builds vector SVG code representation from matrix
function buildSVGString() {
  const payload = parseInputPayload();
  const qr = QREncoder.encode(payload.text, ecLevel);
  const size = qr.size;
  const modules = qr.modules;
  
  const margin = 3;
  const total = size + margin * 2;
  const svgSize = 300;
  const cell = svgSize / total;
  
  let fill = fgColorSingle;
  let gradientDecl = "";
  
  if (colorType === "gradient") {
    fill = "url(#qr-gradient)";
    gradientDecl = `
      <defs>
        <linearGradient id="qr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${fgColorGradStart}" />
          <stop offset="100%" stop-color="${fgColorGradEnd}" />
        </linearGradient>
      </defs>
    `;
  }
  
  let paths = "";
  
  // finder check helper for SVG path creation
  function isFinderEye(r, c) {
    if (r < 7 && c < 7) return true;
    if (r < 7 && c >= size - 7) return true;
    if (r >= size - 7 && c < 7) return true;
    return false;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (modules[r][c]) {
        if (isFinderEye(r, c)) continue; // drawn separately
        
        const mx = (c + margin) * cell;
        const my = (r + margin) * cell;
        
        if (dotStyle === "square") {
          paths += `<rect x="${mx}" y="${my}" width="${cell}" height="${cell}" fill="${fill}" />\n`;
        } else if (dotStyle === "rounded") {
          const rx = cell * 0.35;
          paths += `<rect x="${mx}" y="${my}" width="${cell}" height="${cell}" rx="${rx}" fill="${fill}" />\n`;
        } else if (dotStyle === "circle") {
          const cx = mx + cell/2;
          const cy = my + cell/2;
          const rad = cell * 0.4;
          paths += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${fill}" />\n`;
        }
      }
    }
  }

  // Draw 3 Finder outer/inner rings
  const eyes = [{ r: 0, c: 0 }, { r: 0, c: size - 7 }, { r: size - 7, c: 0 }];
  eyes.forEach(eye => {
    const mx = (eye.c + margin) * cell;
    const my = (eye.r + margin) * cell;
    const w = cell * 7;
    const wInner = cell * 5;
    const wCore = cell * 3;
    
    // SVG shapes layered
    paths += `
      <rect x="${mx}" y="${my}" width="${w}" height="${w}" fill="${fill}" />
      <rect x="${mx + cell}" y="${my + cell}" width="${wInner}" height="${wInner}" fill="${bgColor}" />
      <rect x="${mx + cell * 2}" y="${my + cell * 2}" width="${wCore}" height="${wCore}" fill="${fill}" />
    `;
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgSize} ${svgSize}" width="${svgSize}" height="${svgSize}">
      ${gradientDecl}
      <rect width="${svgSize}" height="${svgSize}" fill="${bgColor}" />
      <g>
        ${paths}
      </g>
    </svg>
  `.trim();
}

// Copy to Clipboard feature for user convenience
function copyCanvasToClipboard() {
  const payload = parseInputPayload();
  if (!payload.text) return;
  
  try {
    qrCanvas.toBlob(blob => {
      const item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard.write([item]).then(() => {
        alert("QR 코드가 클립보드에 이미지로 복사되었습니다!");
      });
    }, "image/png");
  } catch(e) {
    alert("브라우저 보안 제약으로 클립보드 복사에 실패했습니다. PNG 이미지 저장 버튼을 이용해 주세요.");
  }
}

// -------------------------------------------------------------
// TOC Page Switcher
// -------------------------------------------------------------
function switchTOCArticle(index) {
  const article = TOC_ARTICLES[index];
  if (!article) return;
  
  explanationBoardContent.classList.add("fade-out");
  
  setTimeout(() => {
    explanationTitleBadge.innerHTML = `<i class="fa-solid ${article.icon} text-blue"></i> <span>${article.badge}</span>`;
    explanationDisplayTitle.textContent = article.title;
    explanationDisplayText.innerHTML = article.content;
    
    explanationBoardContent.classList.remove("fade-out");
  }, 300);
}

// -------------------------------------------------------------
// Page Bootstrap
// -------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  init();
});
