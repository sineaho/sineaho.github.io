# CineAHO's SandBox (cineaho-portal-dashboard)

> **다채로운 웹 도구, 3D 웹 게임, AI 유틸리티, 인지 심리 검사를 한곳에 모은 통합 웹 포털 샌드박스**

[![Live Demo](https://img.shields.io/badge/Demo-sineaho.github.io-blue?style=for-the-badge&logo=github)](https://sineaho.github.io)
[![Cloudflare Workers](https://img.shields.io/badge/Host-Cloudflare%20Workers-orange?style=for-the-badge&logo=cloudflare)](https://cineaho-sandbox.sineaho.workers.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## 🌐 서비스 개요

**CineAHO's SandBox**는 실생활 유틸리티, 생산성 도구, 인지 심리 검사, 클래식 3D 웹 게임, AI 기반 콘텐츠 생성기를 직관적이고 세련된 다크 글래스모피즘(Glassmorphism) UI로 제공하는 종합 웹 포털입니다.

* **GitHub Pages 배포**: [https://sineaho.github.io](https://sineaho.github.io)
* **Cloudflare Workers 배포**: [https://cineaho-sandbox.sineaho.workers.dev](https://cineaho-sandbox.sineaho.workers.dev)
* **네이버 공식 블로그**: [잡다한 지식의 샌드박스 (sineaho)](https://blog.naver.com/sineaho)

---

## 🚀 주요 카테고리 및 수록 도구

### 🤖 1. AI & 데이터 인텔리전스 (AI & Data)
* **AI 유튜브 블로그 요약기 (`youtube-blog`)**: 유튜브 영상 URL을 분석하여 핵심 요약 및 블로그 포스팅용 원고 자동 생성
* **AI RSS 뉴스 리더 (`ai-rss-news`)**: 주요 글로벌 IT 및 테크 트렌드 RSS 피드 집계 및 실시간 다국어 번역 요약
* **AI 비디오 생성기 (`ai-video-generator`)**: 텍스트 프롬프트를 통한 인터랙티브 영상 및 스토리텔링 생성기
* **네이버 블로그 종합 진단기 (`naver-blog-evaluator`)**: 블로그 지수, 품질 분석, 방문자 동향 및 키워드 노출도 진단
* **네이버 블로그 SEO 분석기 (`naver-seo`)**: 검색엔진 최적화를 위한 키워드 밀도 및 스마트 봇 검색 친화도 점검
* **KOSIS 국가통계 뷰어 (`kosis`)**: 국내 경제, 물가, 인구 등 통계청 공공데이터를 동적 차트로 시각화
* **JSON 변환기 & 포맷터 (`json-converter`)**: 복잡한 데이터 구조를 정렬, 검증, CSV/XML로 변환

### 🧠 2. 인지 심리 & 헬스케어 (Cognitive & Health)
* **종합 ADHD 인지 검사기 (`adhd-test`)**: 주의력 결핍 및 충동성 조기 발견을 위한 자가 진단 스크리닝
* **웩슬러 지능검사 간이 테스트 (`k-wais-test`)**: 언어이해, 지각추론, 작업기억 등 다각도 인지 능력 평가
* **혈압 관리기 (`blood-pressure`)**: 일일 수축기/이완기 혈압 기록 및 단계별 위험도 트래킹
* **체질량(BMI) & 기초대사량(BMR) 계산기 (`bmi`, `bmr`)**: 개인 신체 지표에 맞춘 칼로리 소모량 산출
* **운동 칼로리 & 영양소 매니저 (`exercise-calories`, `food-nutrition`)**: 운동 종목별 소모 열량 및 식단 관리
* **아이 예상 키 계산기 (`child-height`)**: 유전적 요인 및 성장 곡선 기반 예상 신장 예측

### 🎮 3. 3D 보드게임 & 클래식 아케이드 (3D Games & Arcade)
* **3D 배틀쉽 (`battleship-3d`)**: 해상 함대 배치 및 포격전을 즐기는 전략 3D 보드게임
* **3D 핀볼 아케이드 (`pinball-3d`)**: 현실적인 물리 엔진과 네온 조명이 어우러진 클래식 핀볼
* **3D 당구 / 포켓볼 (`billiards-3d`)**: 정밀한 각도와 큐 스핀을 구현한 3D 당구 시뮬레이션
* **카탄 3D (`catan-3d`)**: 자원 채취, 거래, 정착지 건설을 겨루는 전략 보드게임
* **쿼리도 3D & 루두스 코리오발리 (`quoridor`, `ludus-coriovalli`)**: 고전 멘사 추천 공간 지각 전략 보드게임
* **전통 장기 & 오목 (`janggi`, `omok`)**: 한국 고전 장기 및 인공지능 렌주룰 오목
* **클래식 아케이드**: 2048, 지뢰찾기, 갤러그, 벽돌깨기(알카노이드), 블랙잭, 경마 게임, 신필드(Godfield)

### 🛠️ 4. 생산성 & 라이프스타일 (Productivity & Tools)
* **실시간 환율 & 다중 통화 계산기 (`calculator`)**: 주요국 통화 실시간 환율 조회 및 환전 계산
* **이모티콘 메이커 (`emoticon-maker`)**: 귀엽고 재치 있는 텍스트 아트 및 이모티콘 조합기
* **로또 번호 생성기 (`lotto`)**: 가중치 및 번호 조합 통계 기반 행운의 번호 추출
* **체크리스트 & 일정 매크로 (`checklist`, `macros`)**: 업무 체크리스트 관리 및 반복 작업 자동화
* **JW 다운로더 & PDF 도구 (`jw-downloader`, `pdf`)**: 미디어 추출 및 PDF 뷰어/변환 기능

---

## 🛠️ 기술 스택 (Tech Stack)

* **Frontend**: HTML5, CSS3 (Glassmorphism & Flex/Grid), Vanilla JavaScript (ES6+), FontAwesome Icons
* **Backend**: Node.js, Express.js (`server.js`)
* **Libraries & APIs**:
  * `@google/generative-ai` (Gemini API 연동)
  * `cheerio`, `axios` (RSS 및 웹 데이터 크롤링 & 스크레이핑)
  * `youtube-transcript` (유튜브 자막 데이터 추출)
  * `Three.js` (3D 게임 엔진 및 렌더링)
* **Data Sources**: Naver Blog RSS, KOSIS 공공통계 API, 한국수출입은행 환율 API 등
* **Deployment & Hosting**: GitHub Pages, Cloudflare Workers

---

## 📂 프로젝트 구조

```
Cineaho/
├── index.html              # 포털 메인 대시보드
├── app.js                  # 메인 프론트엔드 제어 (블로그 RSS 로더, 다국어 전환, 도구 검색)
├── styles.css              # 메인 스타일시트 (다크 테마, 글래스모피즘 UI)
├── server.js               # Node.js Express 백엔드 API 서버
├── translations.json       # 한/영/일 다국어 번역 사전
├── deploy.bat              # 원클릭 GitHub 자동 커밋 & 푸시 스크립트
├── scripts/
│   ├── git-push.js         # Git 자동 커밋 & 푸시 자동화 스크립트
│   └── collect-stocks.js   # 금융/주식 통계 수집기
├── [각종 서브앱 폴더]/      # 2048, adhd-test, battleship-3d, youtube-blog 등 50+ 서브앱
└── README.md               # 프로젝트 안내 문서
```

---

## 💻 로컬 실행 방법 (Local Development)

### 1. 저장소 클론 및 패키지 설치
```bash
git clone https://github.com/sineaho/sineaho.github.io.git
cd sineaho.github.io
npm install
```

### 2. 로컬 백엔드 서버 실행
```bash
npm start
# 또는
node server.js
```
브라우저에서 `http://localhost:3000` (기본 포트)로 접속합니다.

### 3. 원클릭 배포 (Deploy)
```bash
npm run deploy
# 또는 deploy.bat 실행
```

---

## 📄 라이선스 (License)

This project is licensed under the MIT License.
