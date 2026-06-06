// e:\Antigravity\workspace\Cineaho\ai-rss-news\data.js

const defaultRSSSources = [
  {
    id: "source-1",
    name: "GeekNews AI",
    url: "https://news.hada.io/rss",
    column: 1,
    category: "코딩·도구/AI"
  },
  {
    id: "source-2",
    name: "디지털투데이 IT·AI",
    url: "http://www.digitaltoday.co.kr/rss/all.xml",
    column: 1,
    category: "일반/AI"
  },
  {
    id: "source-3",
    name: "AWS Machine Learning Blog",
    url: "https://aws.amazon.com/blogs/machine-learning/feed/",
    column: 2,
    category: "코딩·도구/AI"
  },
  {
    id: "source-4",
    name: "The Guardian - AI",
    url: "https://www.theguardian.com/technology/artificialintelligenceai/rss",
    column: 2,
    category: "일반/AI"
  },
  {
    id: "source-5",
    name: "Reddit r/singularity",
    url: "https://www.reddit.com/r/singularity/.rss",
    column: 3,
    category: "일반/AI"
  },
  {
    id: "source-6",
    name: "Google News AI",
    url: "https://news.google.com/rss/search?q=artificial+intelligence&hl=en-US&gl=US&ceid=US:en",
    column: 3,
    category: "비즈니스·투자/AI"
  }
];

const prePopulatedArticles = [
  // COLUMN 1: 한국 (국내 매체 RSS)
  {
    id: "c1-1",
    title: "EU, 클라우드 조달 기준 강화 추진...美 클라우드 배제 가능성",
    link: "https://www.digitaltoday.co.kr/news/articleView.html?idxno=671150",
    source: "디지털투데이 - IT·AI·금융·크립토 종합 뉴스",
    category: "정책·규제/AI",
    pubDate: "2026-06-02T02:25:00.000Z",
    column: 1
  },
  {
    id: "c1-2",
    title: "앤트로픽 \"미토스 도입 두 달도 안 돼 고위험 취약점 1만건 넘게 찾아\"",
    link: "https://www.digitaltoday.co.kr/news/articleView.html?idxno=668864",
    source: "디지털투데이 - IT·AI·금융·크립토 종합 뉴스",
    category: "일반/AI",
    pubDate: "2026-06-02T02:09:00.000Z",
    column: 1
  },
  {
    id: "c1-3",
    title: "앤트로픽, 美 SEC IPO 증권신고서 비공개 제출... 오픈AI보다 먼저",
    link: "https://www.digitaltoday.co.kr/news/articleView.html?idxno=671148",
    source: "디지털투데이 - IT·AI·금융·크립토 종합 뉴스",
    category: "비즈니스·투자/AI",
    pubDate: "2026-06-02T02:04:00.000Z",
    column: 1
  },
  {
    id: "c1-4",
    title: "데이터 플랫폼으로 큰 스노우플레이크, 기업AI에이전트 첫 진입로 노린다",
    link: "https://www.digitaltoday.co.kr/news/articleView.html?idxno=671147",
    source: "디지털투데이 - IT·AI·금융·크립토 종합 뉴스",
    category: "코딩·도구/AI",
    pubDate: "2026-06-02T01:58:00.000Z",
    column: 1
  },
  {
    id: "c1-5",
    title: "Codexplain: Codex를 Claude Code처럼 말하게 하기 프로젝트",
    link: "https://news.hada.io/topic?id=30079",
    source: "GeekNews (긱뉴스) - 개발·AI·테크 커뮤니티",
    category: "코딩·도구/AI",
    pubDate: "2026-06-02T01:32:00.000Z",
    column: 1
  },
  {
    id: "c1-6",
    title: "\"이란, 美와 협상 중단하고 호르무즈 완전 봉쇄\"...유가 급등",
    link: "https://www.bloter.net/news/articleView.html?idxno=664160",
    source: "블로터 - 디지털 경제·테크 뉴스",
    category: "정책·규제/AI",
    pubDate: "2026-06-02T00:46:00.000Z",
    column: 1
  },
  {
    id: "c1-7",
    title: "Chuwi Minibook X - 극도로 컴팩트한 미니 노트북 사용기",
    link: "https://news.hada.io/topic?id=30078",
    source: "GeekNews (긱뉴스) - 개발·AI·테크 커뮤니티",
    category: "일반/AI",
    pubDate: "2026-06-02T00:39:00.000Z",
    column: 1
  },
  {
    id: "c1-8",
    title: "젠슨 황 CEO \"AI는 생성형 AI에서 에이전트 AI로 넘어갔다\"",
    link: "https://www.digitaltoday.co.kr/news/articleView.html?idxno=671144",
    source: "디지털투데이 - IT·AI·금융·크립토 종합 뉴스",
    category: "일반/AI",
    pubDate: "2026-06-02T00:15:00.000Z",
    column: 1
  },
  {
    id: "c1-9",
    title: "엔비디아, PC용 AI 칩 출시…인텔·AMD에 도전장",
    link: "https://www.bloter.net/news/articleView.html?idxno=664161",
    source: "블로터 - 디지털 경제·테크 뉴스",
    category: "일반/AI",
    pubDate: "2026-06-01T23:45:00.000Z",
    column: 1
  },
  {
    id: "c1-10",
    title: "$300/월 AI 비용을 절반으로 줄인 OSS — claude-ns-hub",
    link: "https://news.hada.io/topic?id=30069",
    source: "GeekNews (긱뉴스) - 개발·AI·테크 커뮤니티",
    category: "비즈니스·투자/AI",
    pubDate: "2026-06-01T22:12:00.000Z",
    column: 1
  },

  // COLUMN 2: 외국 ① (빅테크·연구기관·주요 테크/과학 미디어)
  {
    id: "c2-1",
    title: "Anthropic Files Confidentially for US IPO as AI Boom Tests Public Markets",
    link: "https://www.theguardian.com/technology/2026/jun/01/anthropic-ai-ipo",
    source: "The Guardian - Artificial Intelligence",
    category: "비즈니스·투자/AI",
    pubDate: "2026-06-02T03:12:00.000Z",
    translation: "Anthropic가 미국 증시에서 비공개로 상장 신청을 했다 (AI 붐의 공개시장 테스트)",
    column: 2
  },
  {
    id: "c2-2",
    title: "Florida Sues OpenAI Over Chatbot Safety and Child Protection Concerns",
    link: "https://www.nytimes.com/2026/06/01/technology/florida-sues-openai.html",
    source: "The New York Times - Technology (AI 포함)",
    category: "정책·규제/AI",
    pubDate: "2026-06-02T03:08:00.000Z",
    translation: "플로리다 주가 챗봇 안전 및 아동 보호 문제로 OpenAI를 고소했다",
    column: 2
  },
  {
    id: "c2-3",
    title: "Use AI to Enhance Design, Not to Replace Human Creativity",
    link: "https://www.fastcompany.com/91104245/use-ai-to-enhance-design-not-replace",
    source: "Fast Company - AI",
    category: "일반/AI",
    pubDate: "2026-06-02T03:02:00.000Z",
    translation: "AI를 활용해 디자인을 보강하라, 인간의 창의성을 대체하지 말라",
    column: 2
  },
  {
    id: "c2-4",
    title: "Ghanaian Students Excel in the 2026 Robotics for Good Youth Challenge",
    link: "https://aiforgood.itu.int/ghanaian-students-robotics-2026/",
    source: "AI for Good Blog (ITU)",
    category: "로봇/AI",
    pubDate: "2026-06-02T02:57:00.000Z",
    translation: "가나 국제학교 학생들이 2026년 Robotics for Good Youth Challenge에서 뛰어난 활약을 펼치다",
    column: 2
  },
  {
    id: "c2-5",
    title: "Secure AI Agents with Policy and Lambda Interceptors in Amazon Bedrock AgentCore",
    link: "https://aws.amazon.com/blogs/machine-learning/secure-ai-agents-with-policy-and-lambda-interceptors-in-amazon-bedrock-agentcore-gateway/",
    source: "AWS Machine Learning Blog",
    category: "보안·프라이버시/AI",
    pubDate: "2026-06-02T02:54:00.000Z",
    translation: "Amazon Bedrock AgentCore 게이트웨이에서 정책 및 Lambda 인터셉터로 AI 에이전트를 보호하는 방법",
    column: 2
  },
  {
    id: "c2-6",
    title: "From 15 Hours to 1 Minute: How AI/ML Accelerates GM's Development Speed",
    link: "https://arstechnica.com/cars/2026/06/gm-ai-ml-acceleration-development/",
    source: "Ars Technica - AI",
    category: "일반/AI",
    pubDate: "2026-06-02T02:41:00.000Z",
    translation: "15시간에서 1분으로: AI/ML이 GM의 차량 개발 속도를 가속화하는 방법",
    column: 2
  },
  {
    id: "c2-7",
    title: "Microsoft and OpenAI Plan $100 Billion Stargate Supercomputer in Quest for AGI",
    link: "https://www.ft.com/content/openai-microsoft-stargate-supercomputer",
    source: "Financial Times - Artificial Intelligence",
    category: "비즈니스·투자/AI",
    pubDate: "2026-06-01T21:10:00.000Z",
    translation: "마이크로소프트와 오픈AI, AGI 정복을 위한 1,000억 달러 규모의 '스타게이트' 슈퍼컴퓨터 기획 중",
    column: 2
  },

  // COLUMN 3: 외국 ② (뉴스레터·교육·딥러닝·개인 블로그·커뮤니티)
  {
    id: "c3-1",
    title: "Meta AI Is Very Easy to Convince That Mark Zuckerberg Is Not From Earth",
    link: "https://www.reddit.com/r/singularity/comments/meta_ai_zuckerberg_earth",
    source: "Reddit - r/singularity",
    category: "일반/AI",
    pubDate: "2026-06-02T03:20:00.000Z",
    translation: "Meta AI가 마크 저커버그가 지구 출신이 아니라고 말하도록 설득하는 것은 매우 쉽다",
    column: 3
  },
  {
    id: "c3-2",
    title: "How Much Published AI Research is Broken Due to Data Leakage Issues?",
    link: "https://www.reddit.com/r/artificial/comments/ai_research_data_leakage",
    source: "Reddit - r/artificial (Artificial Intelligence)",
    category: "연구·논문/AI",
    pubDate: "2026-06-02T03:15:00.000Z",
    translation: "데이터 누출 문제로 인해 기존에 출판된 AI 연구 중 얼마나 많은 부분이 잘못되었는가?",
    column: 3
  },
  {
    id: "c3-3",
    title: "Claude Creator Anthropic Confidentially Files for IPO, Preparing for Valuation Test",
    link: "https://news.google.com/rss/articles/anthropic-valuation-ipo-cbs",
    source: "Google News - Artificial Intelligence",
    category: "비즈니스·투자/AI",
    pubDate: "2026-06-02T03:09:00.000Z",
    translation: "Claude 제작사 Anthropic가 비밀리에 기업공개(IPO)를 신청해 가치 테스트를 준비한다 - CBS 뉴스",
    column: 3
  },
  {
    id: "c3-4",
    title: "Florida Lawsuit Claims OpenAI's Technology is Inherently Dangerous to Minors",
    link: "https://www.reddit.com/r/artificial/comments/florida_lawsuit_openai_dangerous",
    source: "Reddit - r/artificial (Artificial Intelligence)",
    category: "정책·규제/AI",
    pubDate: "2026-06-02T03:07:00.000Z",
    translation: "플로리다 법원 소송, OpenAI의 기술이 미성년자에게 근본적으로 위험하다고 주장",
    column: 3
  },
  {
    id: "c3-5",
    title: "Qwen 3.7 Plus Has Been Officially Released, Outperforming Models Twice Its Size",
    link: "https://www.reddit.com/r/singularity/comments/qwen_3_7_plus_released",
    source: "Reddit - r/singularity",
    category: "일반/AI",
    pubDate: "2026-06-02T03:03:00.000Z",
    translation: "Qwen 3.7 Plus 모델 공식 출시: 자사 크기 대비 2배 무거운 다른 모델보다 우수한 성능 기록",
    column: 3
  },
  {
    id: "c3-6",
    title: "Anthropic Preparing for Massive IPO in Mid-2026",
    link: "https://www.reddit.com/r/artificial/comments/anthropic_ipo_2026",
    source: "Reddit - r/artificial (Artificial Intelligence)",
    category: "비즈니스·투자/AI",
    pubDate: "2026-06-02T02:49:00.000Z",
    translation: "Anthropic, 2026년 중반 대규모 IPO 상장 준비 돌입",
    column: 3
  },
  {
    id: "c3-7",
    title: "Are We Running Out of High Quality Text Data to Train the Next Frontier Models?",
    link: "https://www.reddit.com/r/singularity/comments/running_out_of_text_data",
    source: "Reddit - r/singularity",
    category: "일반/AI",
    pubDate: "2026-06-02T02:10:00.000Z",
    translation: "차세대 대형 언어 모델 학습을 위한 고품질 텍스트 데이터가 고갈되어 가고 있는가?",
    column: 3
  }
];

// Exporting so it can be loaded in browsers without modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { defaultRSSSources, prePopulatedArticles };
}
