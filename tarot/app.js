// CineAHO Tarot Reading App Logic

// ==========================================
// 1. Tarot Card Database (78 Cards)
// ==========================================

const MAJOR_ARCANA = [
  {
    id: 0,
    name: "바보",
    english: "The Fool",
    icon: "fa-solid fa-wind",
    upright_keywords: ["자유", "순수", "새로운 출발", "무한한 가능성"],
    reversed_keywords: ["경솔함", "위험", "무책임", "준비 부족"],
    upright_desc: "얽매이지 않은 자유로운 영혼을 뜻하며 새로운 모험이나 시작을 의미합니다. 순수한 마음으로 첫걸음을 내딛기에 좋은 시기이나 구체적인 계획이 다소 미흡할 수 있으니 긍정적인 열정을 유지하되 현실을 잃지 마세요.",
    reversed_desc: "구체적 계획이 없는 무모한 선택이나 경솔한 행동을 주의해야 할 때입니다. 충동적인 결정을 내려 금전적, 심리적인 위기를 초래할 수 있으니 한 번 더 돌이켜보고 현실적인 위험 요소를 점검하세요."
  },
  {
    id: 1,
    name: "마법사",
    english: "The Magician",
    icon: "fa-solid fa-wand-magic-sparkles",
    upright_keywords: ["창조력", "능력", "자신감", "새로운 프로젝트"],
    reversed_keywords: ["속임수", "재능 낭비", "의지 부족", "사기성"],
    upright_desc: "원하는 것을 이룰 수 있는 탁월한 지혜와 재능, 소통 능력을 갖추었음을 상징합니다. 자신감을 갖고 창의적인 일이나 비즈니스를 주도해 나가면 놀라운 성과를 거둘 수 있는 운수 좋은 때입니다.",
    reversed_desc: "자신의 능력을 과신하여 실수를 저지르거나 다른 이에게 속임수를 쓰는 것을 경계해야 합니다. 의지 부족으로 시작만 거창하고 마무리가 안 될 수 있으니 진실된 마음으로 내면을 다지세요."
  },
  {
    id: 2,
    name: "고위 여사제",
    english: "The High Priestess",
    icon: "fa-solid fa-book",
    upright_keywords: ["직관", "비밀", "지혜", "내적 평화"],
    reversed_keywords: ["비밀 폭로", "표면적 판단", "히스테리", "단절"],
    upright_desc: "통찰력과 직관이 극대화되어 차분히 내면의 목소리에 귀를 기울여야 할 때를 말합니다. 겉으로 드러나지 않는 숨겨진 진실을 꿰뚫어 보고 있으며, 충동적 행동보다는 침묵과 공부가 약이 됩니다.",
    reversed_desc: "감정이 메말라 타인과의 소통이 단절되거나 냉소적으로 변하기 쉬운 때입니다. 마음속에 품어둔 비밀이 뜻하지 않게 누출되거나 그릇된 직관으로 오판할 수 있으니 타인의 조언을 수용하세요."
  },
  {
    id: 3,
    name: "여황제",
    english: "The Empress",
    icon: "fa-solid fa-crown",
    upright_keywords: ["풍요", "모성애", "번창", "예술적 감성"],
    reversed_keywords: ["정체", "낭비", "독점욕", "지나친 보호"],
    upright_desc: "정신적, 물질적으로 대단히 풍요롭고 평화로운 상태를 뜻합니다. 대인관계와 사업에서 결실이 맺히며, 임신이나 결혼 등 새로운 가족 구성원이나 창조물 탄생에 매우 긍정적인 에너지를 줍니다.",
    reversed_desc: "풍요로움에 취해 나태해지거나 과소비와 사치에 빠질 우려가 있습니다. 대인관계에서 지나치게 간섭하고 독점하려는 마음이 불화를 부를 수 있으니 적당한 거리를 유지하는 지혜가 필요합니다."
  },
  {
    id: 4,
    name: "황제",
    english: "The Emperor",
    icon: "fa-solid fa-shield",
    upright_keywords: ["권위", "지배력", "질서", "안정적 리더십"],
    reversed_keywords: ["독재", "융통성 없음", "무력감", "지배욕"],
    upright_desc: "강력한 리더십과 확고한 질서를 바탕으로 성공을 쟁취하는 시기입니다. 굳건한 안정을 유지하며 어려운 상황 속에서도 확실한 통제권을 발휘해 조직이나 가정을 안전하게 이끕니다.",
    reversed_desc: "지나치게 고집을 부려 주변 사람들을 지치게 하거나 융통성 없는 태도로 일을 그르칠 수 있습니다. 때로는 권위를 내려놓고 소통해야 고립에서 탈출할 수 있습니다."
  },
  {
    id: 5,
    name: "교황",
    english: "The Hierophant",
    icon: "fa-solid fa-hands-praying",
    upright_keywords: ["전통", "중재자", "가르침", "도덕적 신념"],
    reversed_keywords: ["반역", "고정관념", "그릇된 지도", "신뢰 하락"],
    upright_desc: "존경받을 만한 귀인이나 멘토로부터 귀중한 조언을 얻거나 스스로 중재자 역할을 맡게 됩니다. 사회적 규범과 전통적 가치를 존중하며 바른길로 걸어갈 때 우호적인 귀인들이 찾아옵니다.",
    reversed_desc: "낡은 생각이나 규칙에 얽매여 새로운 기회를 놓치거나 그릇된 리더의 감언이설에 속아 피해를 입을 수 있습니다. 비합리적인 규범에 대해 비판적으로 점검해 볼 필요가 있습니다."
  },
  {
    id: 6,
    name: "연인",
    english: "The Lovers",
    icon: "fa-solid fa-heart-pulse",
    upright_keywords: ["사랑", "조화", "선택", "결속"],
    reversed_keywords: ["불화", "유혹", "잘못된 선택", "갈등"],
    upright_desc: "마음이 잘 맞는 파트너와의 돈독한 관계 형성이나 인생의 중대한 긍정적 선택을 상징합니다. 연애운에 있어서는 깊은 교감과 결실을, 비즈니스에서는 만족스러운 협력 계약을 의미합니다.",
    reversed_desc: "달콤한 유혹에 넘어가 관계의 균형이 깨지거나, 마음의 불화로 인해 잘못된 결정을 내릴 수 있습니다. 눈앞의 일시적인 쾌락 대신 진정성 있는 신뢰 관계가 무엇인지 자문해 보세요."
  },
  {
    id: 7,
    name: "전차",
    english: "The Chariot",
    icon: "fa-solid fa-horse-head",
    upright_keywords: ["돌진", "승리", "통제력", "장애물 극복"],
    reversed_keywords: ["조급함", "통제 상실", "방향성 상실", "패배"],
    upright_desc: "서로 다른 성향의 힘들을 강한 의지력으로 통제하며 목표를 향해 무섭게 돌진하는 모습입니다. 경쟁에서 반드시 승리하고 난관을 극복할 수 있으니 주저하지 말고 밀어붙이세요.",
    reversed_desc: "열정만 앞서 방향을 잃고 폭주하다 일을 그르치기 쉽습니다. 갈등이나 조급함 때문에 스스로 무너질 수 있으니 속도를 한 템포 늦추고 브레이크를 밟아야 할 때입니다."
  },
  {
    id: 8,
    name: "힘",
    english: "Strength",
    icon: "fa-solid fa-lion", // Will fall back gracefully
    upright_keywords: ["용기", "인내", "부드러운 통제", "내면의 강인함"],
    reversed_keywords: ["유약함", "자기불신", "분노 폭발", "남용"],
    upright_desc: "맹수를 부드럽게 다스리는 여인처럼, 거친 외부 요소를 물리적 압박이 아닌 따뜻한 포용력과 인내심으로 조율하는 진정한 정신적 승리를 가리킵니다. 진정성 어린 끈기가 빛을 발할 것입니다.",
    reversed_desc: "스트레스를 이기지 못해 감정적인 분노를 폭발시키거나 반대로 무력감에 빠져 자신을 불신할 수 있습니다. 억누르는 힘 대신 자비로운 마음으로 자신을 달래야 합니다."
  },
  {
    id: 9,
    name: "은둔자",
    english: "The Hermit",
    icon: "fa-solid fa-sun-plant-wilt", // Light / wisdom lantern helper
    upright_keywords: ["탐색", "고독", "성찰", "신중함"],
    reversed_keywords: ["외로움", "고립", "아집", "피해망상"],
    upright_desc: "등불을 들고 진리를 찾는 수행자처럼 번잡한 세상사에서 잠시 벗어나 자기 성찰과 내적 탐구에 몰두하는 시기입니다. 외적 성공보다는 내면의 지혜를 구하는 깊은 공부가 필요합니다.",
    reversed_desc: "홀로 생각에 갇혀 아집을 부리거나 사회에서 지나치게 고립되어 외로움을 자초하기 쉽습니다. 자신의 세계에만 매몰되지 말고 타인을 신뢰해 세상 밖으로 등불을 꺼내놓으세요."
  },
  {
    id: 10,
    name: "운명의 수레바퀴",
    english: "Wheel of Fortune",
    icon: "fa-solid fa-arrows-spin",
    upright_keywords: ["운명적 전환점", "기회", "변화", "해결"],
    reversed_keywords: ["정체기", "악운", "저항", "예측 불허"],
    upright_desc: "정체되어 있던 운의 흐름이 갑작스레 풀리며 기분 좋은 변화와 기회가 찾아오는 운명적인 상승기입니다. 예상치 못한 행운이 깃들고 막혔던 문제가 물 흐르듯 원만히 풀려나갑니다.",
    reversed_desc: "계획했던 일들이 알 수 없는 외부 방해나 타이밍 불일치로 지체되는 하강 국면입니다. 흐름에 억지로 저항하려 들지 말고, 고통스러운 주기가 끝나길 차분히 기다리며 내실을 기하세요."
  },
  {
    id: 11,
    name: "정의",
    english: "Justice",
    icon: "fa-solid fa-scale-balanced",
    upright_keywords: ["공정성", "합리적 결정", "인과관계", "정직"],
    reversed_keywords: ["불공정", "편견", "의사결정 보류", "소송 패소"],
    upright_desc: "사사로운 감정에 휘둘리지 않고 저울과 칼로 공정하게 상황을 판단하는 시기입니다. 정직한 노력의 대가를 완벽히 돌려받게 되며, 계약이나 법적 절차에서 아주 합리적 결과가 매듭지어집니다.",
    reversed_desc: "편견이나 욕심에 눈이 멀어 편파적인 결정을 내려 신뢰를 저버릴 수 있습니다. 불공정한 일을 당하거나 대인관계에서 억울한 시비에 휘말릴 수 있으니 행동을 엄격히 검토하세요."
  },
  {
    id: 12,
    name: "매달린 사람",
    english: "The Hanged Man",
    icon: "fa-solid fa-child-reaching", // upside down theme
    upright_keywords: ["희생", "인내", "새로운 관점", "자발적 정체"],
    reversed_keywords: ["무의미한 희생", "정체 탈출", "도피", "에너지 고갈"],
    upright_desc: "나무에 거꾸로 매달려 세상을 뒤집어 보듯, 당장의 외적인 이득을 포기하고 미래를 위해 희생하며 상황을 다르게 보기 시작하는 정체기입니다. 기다림 끝에 새로운 깨달음이 보상으로 올 것입니다.",
    reversed_desc: "상황이 개선되지 않는데 억지로 버티며 무의미한 에너지 소모만 하고 있는 상태일 수 있습니다. 혹은 변화를 두려워해 회피 중이니 묶인 줄을 과감히 풀고 나아갈 용기가 필요합니다."
  },
  {
    id: 13,
    name: "죽음",
    english: "Death",
    icon: "fa-solid fa-skull",
    upright_keywords: ["종결", "해방", "필연적 변화", "환골탈태"],
    reversed_keywords: ["저항", "정체 유지", "악순환 반복", "지연"],
    upright_desc: "하나의 막이 완전히 내리고 무덤 위에서 새 생명이 태어나듯, 쓸모없어진 관계나 과거를 깨끗이 종결하고 홀가분하게 새 출발을 하는 소멸과 재생의 극적인 과정입니다.",
    reversed_desc: "이미 끝나 수명을 다한 일이나 관계를 억지로 붙잡고 있어 고통이 연장되고 있습니다. 과거에 집착하지 말고 낡은 것을 미련 없이 버려야 비로소 새로운 시작을 맞이할 수 있습니다."
  },
  {
    id: 14,
    name: "절제",
    english: "Temperance",
    icon: "fa-solid fa-vial", // chemical mix / balance
    upright_keywords: ["조화", "균형 유지", "연합", "치유"],
    reversed_keywords: ["불화", "불균형", "감정 과잉", "소통 불능"],
    upright_desc: "양손에 든 컵에 물을 흐트러짐 없이 번갈아 부으며 타협과 균형을 맞추듯, 대립하는 일들이 순조롭게 융합되고 마음의 상처가 치유되는 지극히 평온하고 순조로운 기운입니다.",
    reversed_desc: "마음의 균형이 무너져 어느 한쪽으로 과도하게 치우쳐 있거나 이성을 잃고 감정적인 사치를 부릴 우려가 있습니다. 소통에 차질이 빚어지니 냉정하게 삶의 조화를 수복해야 합니다."
  },
  {
    id: 15,
    name: "악마",
    english: "The Devil",
    icon: "fa-solid fa-mask", // dark shadow
    upright_keywords: ["구속", "집착", "물질적 욕망", "중독"],
    reversed_keywords: ["구속 해방", "새출발", "각성", "욕망 제어"],
    upright_desc: "돈, 성욕, 술, 권력 등 달콤하지만 파괴적인 유혹에 강박적으로 집착하여 묶여 있는 위태로운 국면입니다. 당장 편안할지 몰라도 영혼을 갉아먹고 있으니 강한 의지로 고리를 끊어내야 합니다.",
    reversed_desc: "마침내 집착과 구속에서 벗어나 영적으로 각성하고 해방을 맞이하는 긍정적 시기입니다. 억압받던 환경을 과감히 청산하고 맑고 주체적인 삶의 통제권을 되찾게 됩니다."
  },
  {
    id: 16,
    name: "탑",
    english: "The Tower",
    icon: "fa-solid fa-bolt",
    upright_keywords: ["갑작스러운 붕괴", "충격", "진실 폭로", "재난"],
    reversed_keywords: ["피할 수 없는 위기", "서서히 몰락", "상처 후 재건", "정리"],
    upright_desc: "벼락이 내리쳐 인위적으로 높이 쌓은 탑이 한순간에 와르르 무너져 내리는 것처럼, 감당하기 어려운 갑작스러운 변화나 해고, 이별, 충격적 소식이 삶을 흔드는 매우 조심해야 할 운세입니다.",
    reversed_desc: "재난의 충격은 지나갔으나 파편이 남아 서서히 구조조정이 계속되거나, 위태로운 상태가 위태롭게 지속되는 모습입니다. 아프더라도 거짓된 기반을 털어내야 온전한 재건이 가능합니다."
  },
  {
    id: 17,
    name: "별",
    english: "The Star",
    icon: "fa-solid fa-star-and-crescent",
    upright_keywords: ["희망", "영감", "낙관주의", "내적 정화"],
    reversed_keywords: ["실망", "절망감", "기회 상실", "자신감 결여"],
    upright_desc: "어두운 밤하늘을 밝히는 북극성처럼, 험난한 고비를 넘기고 마침내 마음속에 밝은 희망과 영감이 찾아와 앞날을 안내해 줍니다. 정신적인 상처가 씻겨 나가며 소원이 이루어질 조짐이 보입니다.",
    reversed_desc: "현실적 기대를 저버리는 실망을 겪거나 앞날이 캄캄하게 흐려지는 절망감을 느껴 주저앉기 쉽습니다. 지나치게 높은 비현실적 이상을 버리고 발끝의 현실을 밝히는 지혜가 필요합니다."
  },
  {
    id: 18,
    name: "달",
    english: "The Moon",
    icon: "fa-solid fa-moon",
    upright_keywords: ["불안", "미궁", "혼란", "잠재의식"],
    reversed_keywords: ["불안 해소", "안개 걷힘", "오해 해결", "사실 규명"],
    upright_desc: "달빛 아래 어스름한 안개 속을 걷는 듯, 앞날을 예측하기 어렵고 사소한 일에도 마음속 깊이 불안과 두려움, 오해가 피어오르는 혼란한 시기입니다. 섣부른 의심을 가라앉히고 관망하세요.",
    reversed_desc: "마침내 혼란스럽던 불안의 안개가 걷히고 가려졌던 진실과 음모가 만천하에 드러나 속을 태우던 오해가 말끔히 해결됩니다. 두려움을 내려놓고 이성적으로 눈을 뜨게 됩니다."
  },
  {
    id: 19,
    name: "태양",
    english: "The Sun",
    icon: "fa-solid fa-sun",
    upright_keywords: ["성공", "기쁨", "활력", "명확함"],
    reversed_keywords: ["일시적 정체", "과장된 성공", "에너지 약화", "경솔함"],
    upright_desc: "따사로운 햇살을 한몸에 받아 만물이 춤추듯, 활력과 긍정적 에너지가 충만하여 모든 일에서 최고의 기쁨과 성과를 누리는 최고의 대길(大吉) 카드입니다. 연애, 재물, 명예 모두 대단히 길합니다.",
    reversed_desc: "기운이 꺾이지는 않았으나 지나친 기대나 성급함으로 결실을 맺는 시기가 일시 지체되거나, 자랑하고 싶은 마음이 앞설 수 있습니다. 여전히 긍정적이니 겸손한 태도를 견지하세요."
  },
  {
    id: 20,
    name: "심판",
    english: "Judgement",
    icon: "fa-solid fa-bullhorn",
    upright_keywords: ["부활", "보상", "결단", "중요한 각성"],
    reversed_keywords: ["기회 놓침", "후회", "결단 보류", "자기 징벌"],
    upright_desc: "하늘의 나팔 소리를 듣고 죽은 영혼들이 깨어나듯, 오랫동안 노력해 왔던 일에 대해 하늘이 정당한 결론을 내려 보상하는 시기입니다. 재도전의 성공이나 기적적인 화해, 부활이 따릅니다.",
    reversed_desc: "결정적인 변화와 제안의 기회가 눈앞에 도래했음에도 미적거리거나 과거 후회에 발목 잡혀 좋은 타이밍을 통째로 놓칠 우려가 큽니다. 과감한 용기로 지난 과오를 떨쳐내세요."
  },
  {
    id: 21,
    name: "세계",
    english: "The World",
    icon: "fa-solid fa-earth-asia",
    upright_keywords: ["완성", "완벽", "성공적 결말", "통합"],
    reversed_keywords: ["미완성", "지연", "불완전한 결말", "정체"],
    upright_desc: "0번 바보의 기나긴 여정이 비로소 끝맺음을 맺고 우주의 완성된 형태를 조화롭게 구성하는 최고봉의 상태입니다. 목표의 완전한 달성, 조화로운 승리, 해피엔딩을 마주하게 됩니다.",
    reversed_desc: "거의 다 성공해 왔으나 마지막 2%의 부족함 때문에 매듭이 지어지지 않고 살짝 겉도는 아쉬운 형국입니다. 포기하지 말고 디테일을 철저히 챙겨서 마무리를 지어야 할 때입니다."
  }
];

// Suit attributes for generating Minor Arcana
const SUITS = {
  wands: { name: "완드", element: "불", meaning: "열정, 행동, 일/업무, 커리어 갈망", icon: "fa-solid fa-wand-magic-sparkles" },
  cups: { name: "컵", element: "물", meaning: "감정, 관계, 인간관계, 사랑/치유", icon: "fa-solid fa-glass-water" },
  swords: { name: "소드", element: "공기", meaning: "생각, 이성, 이별/갈등, 결정력", icon: "fa-solid fa-shield-halved" },
  pentacles: { name: "펜타클", element: "흙", meaning: "물질, 금전, 결과물, 현실적 안정", icon: "fa-solid fa-coins" }
};

const NUMBERS = {
  1: { name: "에이스", eng: "Ace", concept: "시작, 순수한 씨앗, 최초의 강렬한 기회" },
  2: { name: "2", eng: "Two", concept: "균형, 선택의 갈림길, 조율" },
  3: { name: "3", eng: "Three", concept: "성장, 최초의 결실, 동료와의 조화" },
  4: { name: "4", eng: "Four", concept: "안정적 울타리, 휴식, 일시 정체" },
  5: { name: "5", eng: "Five", concept: "갈등, 상실의 아픔, 극복 과제" },
  6: { name: "6", eng: "Six", concept: "회복, 극복, 나눔과 승리" },
  7: { name: "7", eng: "Seven", concept: "노력, 신중한 선택, 인내와 도전" },
  8: { name: "8", eng: "Eight", concept: "신속함, 기술 연마, 집중적인 성과" },
  9: { name: "9", eng: "Nine", concept: "자급자족, 최종 완성 전 경계, 풍요" },
  10: { name: "10", eng: "Ten", concept: "축적의 정점, 고통스러운 마침표, 완전한 끝" },
  11: { name: "시종", eng: "Page", concept: "어린 호기심, 소식, 배우는 단계" },
  12: { name: "기사", eng: "Knight", concept: "적극적 행동, 추진력, 다소 조급한 진전" },
  13: { name: "여왕", eng: "Queen", concept: "내면의 영향력, 수용적 리더십, 모성" },
  14: { name: "왕", eng: "King", concept: "최종 지배자, 통제력과 강한 주권, 책임감" }
};

// Programmatic Generator for 56 Minor Arcana
function generateMinorArcana() {
  const deck = [];
  let cardId = 22;
  
  for (const [suitKey, suit] of Object.entries(SUITS)) {
    for (const [numKey, num] of Object.entries(NUMBERS)) {
      const numVal = parseInt(numKey);
      
      const uprightKeywords = [
        `${suit.name}의 ${num.concept.split(',')[0].trim()}`,
        suit.meaning.split(',')[0].trim(),
        num.concept.split(',')[1] ? num.concept.split(',')[1].trim() : "흐름"
      ];
      
      const reversedKeywords = [
        `불균형한 ${suit.name}`,
        `정체된 ${num.name}`,
        "조율 필요"
      ];

      // Build rich interpretations based on suit + number logic
      const uprightDesc = `${suit.name}의 기운이 ${num.name}의 형태와 만나게 됨을 가리킵니다. 이는 질문을 둘러싸고 ${suit.meaning} 영역에서 ${num.concept}라는 핵심 기조가 흘러가고 있음을 나타내며, 조화를 가꿔나가는 긍정적 조언의 메시지입니다.`;
      const reversedDesc = `해당 기조의 과부하 또는 방향성 상실을 주의하라는 엄중한 신호입니다. ${suit.name}(${suit.meaning})과 관련된 행동 영역에서 균형이 흔들리거나 정체기가 올 수 있으니 무리한 결정을 내리기보단 내면을 재점검하세요.`;

      deck.push({
        id: cardId,
        name: `${suit.name} ${num.name}`,
        english: `${num.eng} of ${suitKey.charAt(0).toUpperCase() + suitKey.slice(1)}`,
        icon: suit.icon,
        upright_keywords: uprightKeywords,
        reversed_keywords: reversedKeywords,
        upright_desc: uprightDesc,
        reversed_desc: reversedDesc
      });
      
      cardId++;
    }
  }
  return deck;
}

const MINOR_ARCANA = generateMinorArcana();
const FULL_DECK = [...MAJOR_ARCANA, ...MINOR_ARCANA];

// ==========================================
// 2. Spread Config Configurations
// ==========================================

const SPREADS_CONFIG = {
  today: {
    name: "오늘의 운세",
    cardCount: 1,
    positions: [
      { id: 1, name: "오늘의 핵심 카드", desc: "오늘 하루 나에게 찾아올 가장 강력한 기운이자 조언" }
    ]
  },
  "three-cards": {
    name: "과거 - 현재 - 미래",
    cardCount: 3,
    positions: [
      { id: 1, name: "과거", desc: "이 고민이나 사건이 어디서 시작되었는지 배경 상황을 짚어봅니다." },
      { id: 2, name: "현재", desc: "현재 내가 처해 있는 핵심 갈등 요인과 나의 내면 상태입니다." },
      { id: 3, name: "미래", desc: "현재의 에너지가 이어졌을 때 도달하게 될 가까운 미래의 결론입니다." }
    ]
  },
  love: {
    name: "연애운 / 관계 흐름",
    cardCount: 5,
    positions: [
      { id: 1, name: "나의 마음", desc: "상대방에 대한 나의 진심 어린 생각과 현재 감정의 깊이" },
      { id: 2, name: "상대방의 마음", desc: "상대방이 나를 바라보는 태도와 마음에 숨긴 속사정" },
      { id: 3, name: "관계의 현황", desc: "두 사람이 지금 형성하고 있는 상호작용의 에너지와 실상" },
      { id: 4, name: "장애물 및 조언", desc: "두 사람이 원만한 소통을 나누기 위해 극복해야 할 문제와 해결책" },
      { id: 5, name: "최종 결과", desc: "상호작용 끝에 도달하게 될 연애운의 해피엔딩 지점" }
    ]
  },
  career: {
    name: "직장운 / 커리어 진로",
    cardCount: 5,
    positions: [
      { id: 1, name: "업무 환경", desc: "현재 내가 직장이나 학업에서 마주하고 있는 외적인 조건" },
      { id: 2, name: "나의 진로 갈망", desc: "성취하고 싶은 마음의 목표와 가슴을 짓누르는 업무적 스트레스" },
      { id: 3, name: "동료 관계", desc: "주변 부서 사람들과의 협동력 및 나를 바라보는 외부의 눈빛" },
      { id: 4, name: "가까운 변화", desc: "진로에 영향을 미칠 이직, 이사, 프로젝트 변화 등의 찬스" },
      { id: 5, name: "성공 조언", desc: "원하는 성공에 안착하기 위해 내가 반드시 발휘해야 할 조언" }
    ]
  },
  "yes-no": {
    name: "예 / 아니오 (Yes or No)",
    cardCount: 1,
    positions: [
      { id: 1, name: "결정의 이정표", desc: "질문하신 행동에 대한 명쾌한 예/아니오 시그널 및 동기 부여" }
    ]
  },
  "celtic-cross": {
    name: "켈틱 크로스 (Celtic Cross)",
    cardCount: 10,
    positions: [
      { id: 1, name: "현재 상태 (Present)", desc: "질문자가 당면해 있는 가장 직관적인 현 상황" },
      { id: 2, name: "당면 과제 (Obstacle)", desc: "그 상황을 뚫어내기 위해 가로막고 있는 결정적 장애물" },
      { id: 3, name: "의식적 조언 (Conscious)", desc: "내가 명확하게 인지하고 지향하고 있는 목표와 가치관" },
      { id: 4, name: "무의식적 기반 (Subconscious)", desc: "내면 깊숙한 곳에서 행동을 규정하는 무의식적인 원인" },
      { id: 5, name: "과거의 그림자 (Past)", desc: "얼마 전 일어나서 현재 상황에 강력한 기운을 미친 사건" },
      { id: 6, name: "가까운 미래 (Near Future)", desc: "상황이 흘러감에 따라 다가오는 자연스러운 미래 경로" },
      { id: 7, name: "나의 자세 (Attitude)", desc: "이 고민을 대하는 나 자신의 마인드와 심리 상태" },
      { id: 8, name: "주변 환경 (Environment)", desc: "나를 감싸고 있는 타인들의 눈빛과 통제하기 힘든 조건" },
      { id: 9, name: "희망과 두려움 (Hopes/Fears)", desc: "이 사건에 대해 바라는 소원과 동시에 품은 깊은 두려움" },
      { id: 10, name: "최종 결론 (Outcome)", desc: "모든 조언과 상호작용 끝에 찾아오는 궁극적인 수확 결과" }
    ]
  }
};

// ==========================================
// 3. 14-part Encyclopedia Dataset
// ==========================================

const EXPLANATION_DATA = {
  1: {
    title: "타로란 무엇인가",
    badge: "가이드 01: 타로란 무엇인가",
    content: `
      <p>타로카드는 78장으로 이루어진 인류 무의식의 상징 체계입니다. 단순한 미래의 기계적 예측이 아닌, 질문자가 직면한 내면의 무의식을 고스란히 비춰주는 <strong>'영혼의 거울'</strong> 역할을 합니다.</p>
      <p>카드의 심오한 이미지와 도상을 감상하며, 질문자는 잊고 있던 본질을 직면하고 스스로 삶의 해답을 이끌어 낼 수 있는 내면의 통찰과 지혜를 얻게 됩니다.</p>
    `
  },
  2: {
    title: "타로카드의 기원과 역사",
    badge: "가이드 02: 타로카드의 기원과 역사",
    content: `
      <p>타로카드는 15세기 이탈리아 밀라노와 볼로냐 귀족 사회에서 카드 게임용으로 개발된 비스콘티-스포르차 덱이 그 효시로 알려져 있습니다.</p>
      <p>이후 18세기 프랑스를 기점으로 연금술, 점성학 등 서양 오컬트 신비주의와 융합되며 인간 심층 심리를 해독하는 정밀 점술 도구로 격상되었습니다. 1909년 라이더 출판사에서 간행한 <strong>'라이더-웨이트 덱'</strong>에 이르러 전 세계 표준 타로 체계로 완전히 안착했습니다.</p>
    `
  },
  3: {
    title: "메이저 아르카나 상징체계",
    badge: "가이드 03: 메이저 아르카나 상징체계",
    content: `
      <p>메이저 아르카나(Major Arcana)는 0번 '바보(The Fool)'부터 21번 '세계(The World)'까지 총 22장으로 구성됩니다.</p>
      <p>이 22장의 도정은 인간 영혼이 성장하면서 부딪히는 커다란 사건들(탄생, 심판, 붕괴, 영적 교감)을 가리키는 <strong>'바보의 인생 여정(Fool's Journey)'</strong>을 보여줍니다. 배열법 분석 시 메이저가 대거 등장했다면 인생의 중대한 변곡점을 통과하고 있음을 상징합니다.</p>
    `
  },
  4: {
    title: "마이너 아르카나 원소구조",
    badge: "가이드 04: 마이너 아르카나 원소구조",
    content: `
      <p>마이너 아르카나(Minor Arcana)는 총 56장으로, 비교적 일상 속에서 일어나는 잔잔한 감정과 소동, 사건을 다룹니다.</p>
      <p>마이너 카드는 4대 수트와 원소 체계에 밀접하게 대응됩니다:</p>
      <ul>
        <li><strong>완드(Wands) - 불(Fire):</strong> 행동, 정밀한 일, 직장 업무, 열정과 도전을 뜻합니다.</li>
        <li><strong>컵(Cups) - 물(Water):</strong> 연애적 교감, 대인 관계, 직관적 감수성을 다룹니다.</li>
        <li><strong>소드(Swords) - 공기(Air):</strong> 논리적 사유, 생각의 고통, 과감한 이성적 결단을 주도합니다.</li>
        <li><strong>펜타클(Pentacles) - 흙(Earth):</strong> 일상적인 보상, 현금, 축적물, 육체적 안정을 가리킵니다.</li>
      </ul>
    `
  },
  5: {
    title: "정방향과 역방향의 해석차이",
    badge: "가이드 05: 정방향과 역방향의 해석차이",
    content: `
      <p>타로카드를 셔플하고 뽑을 때 약 50% 확률로 상하가 거꾸로 서는 <strong>역방향(Reversed)</strong> 상태가 될 수 있습니다.</p>
      <ul>
        <li><strong>정방향(Upright):</strong> 카드가 내포한 본연의 에너지가 바깥으로 자연스럽고 활기차게 분출됨을 뜻합니다.</li>
        <li><strong>역방향(Reversed):</strong> 기운의 과잉 또는 결핍, 내밀하게 억누르고 있는 상태, 혹은 정체와 지연을 의미합니다. 단순히 파괴를 뜻하는 악(惡)이 아니며, 질문자가 극복해야 할 소중한 숨은 힌트를 전합니다.</li>
      </ul>
    `
  },
  6: {
    title: "오늘의 운세 (1장) 가이드",
    badge: "가이드 06: 오늘의 운세 가이드",
    content: `
      <p>오늘의 운세는 1장의 카드만을 뽑아 하루 동안 질문자를 지켜봐 줄 수호의 흐름을 확인하는 기법입니다.</p>
      <p>매일 오전에 한 번씩 뽑아서 조언을 마음에 품고 하루를 보내는 방식으로, 복잡한 공식 없이 가장 명료하게 심리 지표를 확립할 수 있는 실용적인 훈련법입니다.</p>
    `
  },
  7: {
    title: "과거-현재-미래 (3장) 가이드",
    badge: "가이드 07: 과거-현재-미래 가이드",
    content: `
      <p>역사적으로 가장 널리 쓰여온 3단 선형 배열 방식입니다.</p>
      <ul>
        <li><strong>1번 (과거):</strong> 일련의 사건이 잉태되거나 스트레스가 처음 시작된 과거 배경을 비춥니다.</li>
        <li><strong>2번 (현재):</strong> 지금 나를 둘러싼 외적 갈등 요인 및 내 마음의 방향을 읽어냅니다.</li>
        <li><strong>3번 (미래):</strong> 현재 상태를 고수할 때 예상되는 가까운 타임라인의 변화와 조언을 제안합니다.</li>
      </ul>
    `
  },
  8: {
    title: "연애운 (5장) 배열 가이드",
    badge: "가이드 08: 연애운 배열 가이드",
    content: `
      <p>두 사람 사이에 존재하는 감정의 교감 온도 차와 관계의 실질적 전개 양상을 해석하는 스페셜 배열법입니다.</p>
      <p>나의 진짜 감정(1번)과 상대의 감정(2번)을 대조하여 오해를 사전에 포착하고, 조언(4번)을 통해 현명하게 소통할 기회를 가르쳐 줍니다.</p>
    `
  },
  9: {
    title: "직장운 (5장) 배열 가이드",
    badge: "가이드 09: 직장운 배열 가이드",
    content: `
      <p>이직, 연봉 인상, 승진, 퇴사 등 일터에서의 갈등을 치밀하게 분석합니다.</p>
      <p>부서 내 협동(3번)이나 다가올 가까운 기회(4번)를 융합 판단하여, 경제적 안정과 커리어 상승을 실체화할 수 있는 영리한 행동 가이드를 처방합니다.</p>
    `
  },
  10: {
    title: "예/아니오 (1장) 질문 가이드",
    badge: "가이드 10: 예/아니오 가이드",
    content: `
      <p>'할까, 말까?'처럼 이분법적인 의사결정이 필요할 때 1장의 카드로 시그널을 확인합니다.</p>
      <p>다만 타로카드는 운명을 결정짓는 절대적 기계가 아니므로, 예(Yes) 혹은 아니오(No) 신호 뒤에 붙는 속뜻과 조언 문맥을 살펴 현명하게 수용해야 합니다.</p>
    `
  },
  11: {
    title: "켈틱 크로스 (10장) 가이드",
    badge: "가이드 11: 켈틱 크로스 가이드",
    content: `
      <p>타로 리더들이 인정하는 가장 심도 있고 권위 있는 종합 점술 스프레드입니다.</p>
      <p>십자형 프레임과 기둥 프레임에 걸쳐 10장의 카드를 빼곡히 배치하여 질문자의 환경, 희망/두려움, 깊은 무의식적 원인까지 입체적으로 파고듭니다. 복잡한 장기 미래 진단에 아주 제격입니다.</p>
    `
  },
  12: {
    title: "타로 대국을 위한 호흡과 명상",
    badge: "가이드 12: 대국 전 호흡과 명상",
    content: `
      <p>타로는 무의식의 주파수를 맞춰가는 작업이기에 잡념이 많거나 지나치게 긴장한 상태에서는 해독이 빗나가기 쉽습니다.</p>
      <p>카드 셔플 전, 호흡을 크게 세 번 반복하며 뇌의 잡다한 잔상을 지워내고 <strong>'내가 진정 알고 싶은 질문 하나'</strong>에 정신적 불꽃을 뚜렷이 세우는 습관을 들여보세요.</p>
    `
  },
  13: {
    title: "카드 점괘를 일상에 적용하는 법",
    badge: "가이드 13: 카드 점괘의 일상 적용",
    content: `
      <p>점판 위에 무서운 경고 카드가 나왔다고 주저앉을 까닭은 전혀 없습니다.</p>
      <p>타로는 결정된 숙명을 확정하는 도구가 아닌, <strong>'현재 에너지를 고수했을 때의 위험경고'</strong>를 주는 내비게이션입니다. 부정적 점괘는 지혜로운 액땜 조언으로 삼고, 긍정적 점괘는 더 큰 돌파력을 위한 자신감으로 삼으십시오.</p>
    `
  },
  14: {
    title: "타로카드 무료 점술 FAQ",
    badge: "가이드 14: 타로카드 무료 점술 FAQ",
    content: `
      <p>사용자들이 가장 궁금해하는 핵심 문항을 모았습니다:</p>
      <ul>
        <li><strong>Q. 같은 날 동일한 주제를 연달아 봐도 되나요?</strong><br>A. 권장하지 않습니다. 불안감이 개입되어 괘만 어지럽혀질 뿐입니다. 최소 1~2주의 시간이 지나거나 상황에 실질적 변화가 왔을 때 보세요.</li>
        <li><strong>Q. 역방향 카드가 가득한데 무조건 흉조인가요?</strong><br>A. 아닙니다. 내면의 에너지가 수렴하는 시기이거나, 신중을 다해 성찰하라는 중요한 브레이크 신호입니다.</li>
        <li><strong>Q. 점괘의 유통기한은 얼마 정도인가요?</strong><br>A. 대체로 오늘 하루부터 3개월 이내, 길어야 6개월 이내의 운세를 가장 세밀하게 가시화합니다.</li>
      </ul>
    `
  }
};

// ==========================================
// 4. Tarot App Controller Class
// ==========================================

class TarotApp {
  constructor() {
    this.currentSpread = null;
    this.drawnCards = [];
    this.deck = [];
    this.shuffled = false;
    this.revealed = false;
    this.currentViewIndex = 0;

    this.initDOM();
    this.initEvents();
    this.loadExplanation(1);
  }

  initDOM() {
    // Buttons & Elements
    this.spreadCards = document.querySelectorAll('.spread-card');
    this.tarotBoard = document.getElementById('tarot-board');
    this.boardSpreadName = document.getElementById('board-spread-name');
    this.btnCancelSpread = document.getElementById('btn-cancel-spread');
    this.boardStatusText = document.getElementById('board-status-text');
    this.spreadSlotsLayout = document.getElementById('spread-slots-layout');
    this.tarotDeck = document.getElementById('tarot-deck');
    this.btnShuffle = document.getElementById('btn-shuffle');
    this.btnDrawAuto = document.getElementById('btn-draw-auto');
    this.btnRevealResults = document.getElementById('btn-reveal-results');

    // Results panel
    this.tarotResultsSection = document.getElementById('tarot-results-section');
    this.drawnCardsNav = document.getElementById('drawn-cards-nav');
    this.viewerCardFlip = document.getElementById('viewer-card-flip');
    this.viewerCardFront = document.getElementById('viewer-card-front');
    this.viewerCardDirectionText = document.getElementById('viewer-card-direction-text');
    this.viewerPositionTitle = document.getElementById('viewer-position-title');
    this.viewerPositionDesc = document.getElementById('viewer-position-desc');
    this.viewerCardTitle = document.getElementById('viewer-card-title');
    this.viewerKeywords = document.getElementById('viewer-keywords');
    this.viewerReadingText = document.getElementById('viewer-reading-text');
    this.adviceMasterText = document.getElementById('advice-master-text');

    // TOC Board
    this.tocItems = document.querySelectorAll('.explanation-index-list li');
    this.explanationBoardContent = document.getElementById('explanation-board-content');
    this.explanationTitleBadge = document.getElementById('explanation-title-badge');
    this.explanationDisplayTitle = document.getElementById('explanation-display-title');
    this.explanationDisplayText = document.getElementById('explanation-display-text');

    // Scroll buttons
    this.btnScrollTop = document.getElementById('btn-scroll-top');
    this.btnScrollBottom = document.getElementById('btn-scroll-bottom');
  }

  initEvents() {
    // Select Spread Card
    this.spreadCards.forEach(card => {
      card.addEventListener('click', () => {
        const spreadKey = card.getAttribute('data-spread');
        this.startSpread(spreadKey);
      });
    });

    // Cancel / Exit Spread
    this.btnCancelSpread.addEventListener('click', () => {
      this.cancelSpread();
    });

    // Shuffle Button
    this.btnShuffle.addEventListener('click', () => {
      this.shuffleDeck();
    });

    // Auto Draw Button
    this.btnDrawAuto.addEventListener('click', () => {
      this.drawAuto();
    });

    // Reveal results Button
    this.btnRevealResults.addEventListener('click', () => {
      this.revealResults();
    });

    // TOC Items click
    this.tocItems.forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-index'));
        this.tocItems.forEach(li => li.classList.remove('active'));
        item.classList.add('active');
        this.loadExplanation(idx);
      });
    });

    // Scroll
    this.btnScrollTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    this.btnScrollBottom.addEventListener('click', () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
  }

  // ==========================================
  // Spread Flow Logic
  // ==========================================

  startSpread(spreadKey) {
    this.currentSpread = SPREADS_CONFIG[spreadKey];
    this.drawnCards = [];
    this.shuffled = false;
    this.revealed = false;
    this.currentViewIndex = 0;

    // Reset visibility
    this.tarotResultsSection.style.display = 'none';
    this.tarotBoard.style.display = 'block';
    
    // UI configs
    this.boardSpreadName.textContent = this.currentSpread.name;
    this.boardStatusText.textContent = "타로카드를 신비롭게 섞기 위해 아래 '카드 셔플하기' 버튼을 눌러주세요.";
    this.btnDrawAuto.style.display = 'none';
    this.btnRevealResults.style.display = 'none';
    this.btnShuffle.disabled = false;
    this.btnShuffle.style.display = 'inline-flex';

    // Populate empty layout frames
    this.renderSlotFrames(spreadKey);

    // Build fresh cards deck
    this.buildDeckUI();

    // Smooth scroll to board
    this.tarotBoard.scrollIntoView({ behavior: 'smooth' });
  }

  cancelSpread() {
    this.currentSpread = null;
    this.drawnCards = [];
    this.tarotBoard.style.display = 'none';
    this.tarotResultsSection.style.display = 'none';
    document.querySelector('.spread-selector-grid').scrollIntoView({ behavior: 'smooth' });
  }

  renderSlotFrames(spreadKey) {
    this.spreadSlotsLayout.innerHTML = '';
    const config = this.currentSpread;

    if (spreadKey === 'celtic-cross') {
      // Celtic Cross specific positioning layout map
      this.spreadSlotsLayout.className = 'spread-slots-container celtic-cross-map';
      
      config.positions.forEach((pos, idx) => {
        const frame = document.createElement('div');
        frame.className = `slot-frame slot-frame-cc cc-slot-${pos.id}`;
        frame.id = `slot-pos-${idx}`;
        frame.innerHTML = `
          <div class="slot-index">${pos.id}</div>
          <div class="slot-label">${pos.name}</div>
        `;
        this.spreadSlotsLayout.appendChild(frame);
      });
    } else {
      // General layout maps
      this.spreadSlotsLayout.className = 'spread-slots-container';
      
      config.positions.forEach((pos, idx) => {
        const frame = document.createElement('div');
        frame.className = 'slot-frame active';
        frame.id = `slot-pos-${idx}`;
        frame.innerHTML = `
          <div class="slot-index">${idx + 1}</div>
          <div class="slot-label">${pos.name}</div>
        `;
        this.spreadSlotsLayout.appendChild(frame);
      });
    }
  }

  buildDeckUI() {
    this.tarotDeck.innerHTML = '';
    this.deck = [...FULL_DECK]; // Get full copy

    // Render cards backs overlay stack (looks like a beautiful neat deck of cards)
    const totalOverlay = 12; // 12 layers feels like a deck
    for (let i = 0; i < totalOverlay; i++) {
      const cardBack = document.createElement('div');
      cardBack.className = 'deck-card-back';
      cardBack.style.left = `${i * 1.5}px`;
      cardBack.style.top = `${-i * 0.8}px`;
      cardBack.style.zIndex = i;
      this.tarotDeck.appendChild(cardBack);
    }
  }

  shuffleDeck() {
    this.btnShuffle.disabled = true;
    this.boardStatusText.textContent = "타로 마스터가 무의식과 주파수를 맞춰 신중하게 카드를 섞고 있습니다...";
    
    // Add shuffling CSS animations
    this.tarotDeck.classList.add('shuffling-animation');

    setTimeout(() => {
      this.tarotDeck.classList.remove('shuffling-animation');
      this.shuffled = true;
      this.boardStatusText.textContent = `카드 셔플 완료! 이제 아래 덱에서 카드 ${this.currentSpread.cardCount}장을 한 장씩 뽑아주세요.`;
      
      this.btnShuffle.style.display = 'none';
      this.btnDrawAuto.style.display = 'inline-flex';
      this.btnDrawAuto.disabled = false;

      // Make deck interactive to click draw
      const deckCards = this.tarotDeck.querySelectorAll('.deck-card-back');
      deckCards.forEach(c => {
        c.addEventListener('click', () => {
          this.drawCardClick();
        });
      });
    }, 1800);
  }

  drawCardClick() {
    if (!this.shuffled || this.drawnCards.length >= this.currentSpread.cardCount) return;
    this.executeSingleDraw();
  }

  drawAuto() {
    this.btnDrawAuto.disabled = true;
    
    const needed = this.currentSpread.cardCount - this.drawnCards.length;
    let count = 0;
    
    const interval = setInterval(() => {
      if (count >= needed) {
        clearInterval(interval);
        return;
      }
      this.executeSingleDraw();
      count++;
    }, 600);
  }

  executeSingleDraw() {
    if (this.drawnCards.length >= this.currentSpread.cardCount) return;

    const currentSlotIndex = this.drawnCards.length;
    const targetSlot = document.getElementById(`slot-pos-${currentSlotIndex}`);
    if (!targetSlot) return;

    // Pick card from deck randomly (and remove from stack)
    const randomIndex = Math.floor(Math.random() * this.deck.length);
    const selectedCard = this.deck.splice(randomIndex, 1)[0];

    // Determine direction (50% chance of Reversed)
    const isReversed = Math.random() < 0.5;

    const drawnData = {
      ...selectedCard,
      isReversed: isReversed,
      positionName: this.currentSpread.positions[currentSlotIndex].name,
      positionDesc: this.currentSpread.positions[currentSlotIndex].desc
    };
    this.drawnCards.push(drawnData);

    // Coordinate-based Fly animation
    this.animateFlyCard(targetSlot, drawnData, currentSlotIndex);
    
    // Update status text
    const remaining = this.currentSpread.cardCount - this.drawnCards.length;
    if (remaining > 0) {
      this.boardStatusText.textContent = `카드 ${currentSlotIndex + 1}장째 배치 완료! 남은 카드 ${remaining}장을 계속 뽑아주세요.`;
    } else {
      this.boardStatusText.textContent = "모든 카드를 뽑으셨습니다! 이제 아래 '결과 분석 및 해독 시작' 버튼을 눌러 점괘를 읽어보세요.";
      this.btnDrawAuto.style.display = 'none';
      this.btnRevealResults.style.display = 'inline-flex';
    }
  }

  animateFlyCard(targetSlot, cardData, index) {
    const deckRect = this.tarotDeck.getBoundingClientRect();
    const slotRect = targetSlot.getBoundingClientRect();

    // Create moving element
    const flyer = document.createElement('div');
    flyer.className = 'flying-card deck-card-back';
    flyer.style.left = `${deckRect.left + window.scrollX}px`;
    flyer.style.top = `${deckRect.top + window.scrollY}px`;
    document.body.appendChild(flyer);

    // Force reflow
    flyer.offsetWidth;

    // Fly to target
    flyer.style.left = `${slotRect.left + window.scrollX}px`;
    flyer.style.top = `${slotRect.top + window.scrollY}px`;
    flyer.style.transform = 'scale(1)';

    setTimeout(() => {
      // Remove flyer
      flyer.remove();

      // Render cards in target slot (face down initially)
      targetSlot.innerHTML = `
        <div class="tarot-card-item">
          <div class="card-inner" id="inner-card-${index}">
            <div class="card-back">
              <div class="deck-card-back" style="width: 100%; height: 100%; top: 0; left: 0;"></div>
            </div>
            <div class="card-front">
              <div class="card-front-border"></div>
              <span class="card-front-title-top">${cardData.english}</span>
              <div class="card-front-icon"><i class="${cardData.icon}"></i></div>
              <span class="card-front-title-bottom">${cardData.name}</span>
            </div>
          </div>
        </div>
        <div class="slot-label">${cardData.positionName}</div>
      `;

      // Highlight slot frame boundary
      targetSlot.classList.remove('active');
      targetSlot.style.borderColor = 'rgba(168, 85, 247, 0.4)';
    }, 600);
  }

  // ==========================================
  // Result Analysis Logic
  // ==========================================

  revealResults() {
    this.revealed = true;
    this.btnRevealResults.disabled = true;
    this.boardStatusText.textContent = "타로 마스터의 우주 에너지가 융합되며 뽑힌 카드를 한 장씩 앞면으로 뒤집습니다...";

    // Flip cards sequentially with interval
    this.drawnCards.forEach((c, idx) => {
      setTimeout(() => {
        const cardInner = document.getElementById(`inner-card-${idx}`);
        if (cardInner) {
          cardInner.classList.add('flipped');
          if (c.isReversed) {
            cardInner.classList.add('reversed');
          }
        }
      }, idx * 400);
    });

    // Show Results Panel after cards flip finish
    setTimeout(() => {
      this.tarotResultsSection.style.display = 'block';
      this.renderResultsTabs();
      this.loadCardDetail(0);
      this.generateMasterAdvice();
      this.tarotResultsSection.scrollIntoView({ behavior: 'smooth' });
    }, this.drawnCards.length * 400 + 400);
  }

  renderResultsTabs() {
    this.drawnCardsNav.innerHTML = '';
    this.drawnCards.forEach((c, idx) => {
      const chip = document.createElement('div');
      chip.className = `results-tab-chip ${idx === 0 ? 'active' : ''}`;
      chip.innerHTML = `
        <span class="tab-position-num">${idx + 1}</span>
        <span>${c.positionName}: ${c.name} (${c.isReversed ? '역' : '정'})</span>
      `;
      chip.addEventListener('click', () => {
        this.resultsTabClick(idx, chip);
      });
      this.drawnCardsNav.appendChild(chip);
    });
  }

  resultsTabClick(idx, chipEl) {
    const chips = this.drawnCardsNav.querySelectorAll('.results-tab-chip');
    chips.forEach(c => c.classList.remove('active'));
    chipEl.classList.add('active');
    this.loadCardDetail(idx);
  }

  loadCardDetail(idx) {
    this.currentViewIndex = idx;
    const data = this.drawnCards[idx];

    // Trigger viewer 3D flip reset & update front details
    this.viewerCardFlip.classList.remove('flipped', 'reversed');

    // Force redraw
    this.viewerCardFlip.offsetWidth;

    // Render Viewer Card Front Design
    this.viewerCardFront.innerHTML = `
      <div class="card-front-border"></div>
      <span class="card-3d-front-title-top" style="font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; font-family: var(--font-display);">${data.english}</span>
      <div class="card-front-icon" style="font-size: 3.5rem; color: #fbbf24; margin: auto; text-shadow: 0 0 15px rgba(251, 191, 36, 0.3);"><i class="${data.icon}"></i></div>
      <span class="card-title">${data.name}</span>
    `;

    // Apply flip delay
    setTimeout(() => {
      this.viewerCardFlip.classList.add('flipped');
      if (data.isReversed) {
        this.viewerCardFlip.classList.add('reversed');
        this.viewerCardDirectionText.textContent = "역방향 (Reversed)";
        this.viewerCardDirectionText.style.background = "rgba(249, 115, 22, 0.15)";
        this.viewerCardDirectionText.style.borderColor = "rgba(249, 115, 22, 0.3)";
        this.viewerCardDirectionText.style.color = "#fb923c";
      } else {
        this.viewerCardDirectionText.textContent = "정방향 (Upright)";
        this.viewerCardDirectionText.style.background = "rgba(168, 85, 247, 0.15)";
        this.viewerCardDirectionText.style.borderColor = "rgba(168, 85, 247, 0.3)";
        this.viewerCardDirectionText.style.color = "#c084fc";
      }
    }, 150);

    // Update Right content texts
    this.viewerPositionTitle.textContent = `${idx + 1}. 포지션 해석 : ${data.positionName}`;
    this.viewerPositionDesc.textContent = data.positionDesc;
    
    this.viewerCardTitle.textContent = `${data.name} (${data.english})`;

    // Keywords chips
    this.viewerKeywords.innerHTML = '';
    const keywords = data.isReversed ? data.reversed_keywords : data.upright_keywords;
    keywords.forEach(word => {
      const span = document.createElement('span');
      span.className = 'key-badge';
      span.textContent = word;
      this.viewerKeywords.appendChild(span);
    });

    // Interpretation body
    this.viewerReadingText.innerHTML = data.isReversed ? data.reversed_desc : data.upright_desc;
  }

  // ==========================================
  // Master Advice Synthesis Engine
  // ==========================================

  generateMasterAdvice() {
    let majorsCount = 0;
    let reversedCount = 0;
    let wandsCount = 0;
    let cupsCount = 0;
    let swordsCount = 0;
    let pentaclesCount = 0;

    this.drawnCards.forEach(c => {
      if (c.id < 22) majorsCount++;
      if (c.isReversed) reversedCount++;
      if (c.name.includes("완드")) wandsCount++;
      if (c.name.includes("컵")) cupsCount++;
      if (c.name.includes("소드")) swordsCount++;
      if (c.name.includes("펜타클")) pentaclesCount++;
    });

    let advice = "";

    // Step 1: Analyze General Energies
    if (majorsCount >= this.drawnCards.length / 2 && this.drawnCards.length > 1) {
      advice += "메이저 아르카나 카드의 강력한 상징들이 대거 출현한 것으로 보아, 현재 질문하신 사안은 단순한 일상의 해프닝을 넘어 평생에 남을 굵직한 정신적 교훈이나 인생 전반의 방향타를 바꾸는 영적 전환점의 시기를 지나고 있음을 가리킵니다. ";
    } else {
      advice += "마이너 아르카나 중심의 카드가 출현한 것으로 보아, 현재 질문은 급격한 운명의 변화보단 현실 속에서 마주하는 일상적인 대인관계, 구체적인 일의 진척 여부, 혹은 순간적인 마찰과 같은 소소한 행동 단계를 조명해 볼 필요가 있습니다. ";
    }

    // Step 2: Analyze Directions (Reversals)
    if (reversedCount >= this.drawnCards.length / 2) {
      advice += "또한 역방향 카드가 다수 점지되었습니다. 이는 현재 상황에서 외면적인 돌파를 서두르기보단, 과거에 발생했던 묵은 응어리나 해결하지 못한 심리적 장벽, 또는 내면의 과도한 집착이나 과부하를 스스로 내려놓고 재정비하는 성찰의 브레이크 타임이 약이 됨을 암시합니다. ";
    } else {
      advice += "대체로 정방향 카드가 우세하여 카드가 가진 상징 에너지가 방해 요소 없이 의식 바깥으로 솔직하고 힘차게 표출되고 있습니다. 고민에 대해 피하지 말고 내디딜 수 있는 현실적 찬스나 열정이 눈앞에 당도해 있으니 주도적으로 밀어붙여 보세요. ";
    }

    // Step 3: Analyze Suit Dominance (Minor suits)
    const suitCounts = { 완드: wandsCount, 컵: cupsCount, 소드: swordsCount, 펜타클: pentaclesCount };
    const dominantSuit = Object.keys(suitCounts).reduce((a, b) => suitCounts[a] > suitCounts[b] ? a : b);
    
    if (suitCounts[dominantSuit] >= 2) {
      if (dominantSuit === "완드") {
        advice += "특히 '완드(불)'의 에너지가 강하게 쏠린 것으로 보아 신속한 실천력, 진로 개척, 또는 무언가 행동을 옮기고 성과를 얻고자 하는 활활 타오르는 도전과 열정이 이 사안의 최종적인 핵심 열쇠가 될 것입니다.";
      } else if (dominantSuit === "컵") {
        advice += "특히 '컵(물)'의 에너지가 주도적인 흐름을 이끄는 것으로 보아, 이번 고민의 열쇠는 차갑고 이성적인 계산보다는 상호 간의 돈독한 감정 교감, 타인을 보듬는 마음, 혹은 상처 입은 내 마음의 깊은 정화와 치유가 선행되어야 함을 말해 줍니다.";
      } else if (dominantSuit === "소드") {
        advice += "특히 '소드(공기)'의 에너지가 우세하게 흐르고 있어 냉정한 현실 직시, 군더더기 없는 논리적 이성, 그리고 차가운 이별이나 결단력을 내는 것이 어중간하게 상황을 유지하는 것보다 훨씬 유리합니다.";
      } else if (dominantSuit === "펜타클") {
        advice += "특히 '펜타클(흙)'의 에너지가 굳건히 박혀 있는 형국으로, 실현 불가능한 공상보단 실질적인 재무 계획, 건강 증진, 혹은 현실성 높은 안정적 성실함에 입각하여 한 땀 한 땀 다져갈 때 비로소 원하는 목표에 정확하게 닿게 될 것입니다.";
      }
    } else {
      advice += "다양한 원소가 골고루 조화를 이루어 특정 기운의 치우침 없이 차분히 전반적 조율을 취하기에 적절한 때입니다.";
    }

    this.adviceMasterText.textContent = advice;
  }

  // ==========================================
  // Explanation switcher logic (TOC)
  // ==========================================

  loadExplanation(idx) {
    const data = EXPLANATION_DATA[idx];
    if (!data) return;

    // Soft fade transition
    this.explanationBoardContent.classList.add('fade-out');

    setTimeout(() => {
      this.explanationTitleBadge.textContent = data.badge;
      this.explanationDisplayTitle.textContent = data.title;
      this.explanationDisplayText.innerHTML = data.content;
      this.explanationBoardContent.classList.remove('fade-out');
    }, 200);
  }
}

// Instantiate App on DomLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.tarotApp = new TarotApp();
});
