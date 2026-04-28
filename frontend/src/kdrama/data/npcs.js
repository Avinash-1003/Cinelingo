// ─────────────────────────────────────────────────────────────────────────────
// NPC DEFINITIONS — Characters with personalities, relationship arcs, visuals
// ─────────────────────────────────────────────────────────────────────────────

export const NPCS = {
  jisu: {
    id: 'jisu',
    name: '지수',
    nameRomanized: 'Jisu',
    role: 'Café Barista',
    roleKorean: '카페 바리스타',
    location: 'cafe',
    age: 24,
    personality: 'Warm, mentoring, patient',
    description: 'The welcoming barista who\'s always happy to help you practice Korean. She dreams of opening her own café someday.',
    descriptionKorean: '항상 한국어 연습을 도와주는 따뜻한 바리스타',
    descriptionPhonetic: 'Hangsang hangugeo yeonseupul dowajuneun ttatteutan barisuta',
    color: '#ff8fab',
    accentColor: '#ff6b8a',
    greeting: {
      korean: '어서오세요! 오늘도 오셨네요!',
      phonetic: 'Eoseooseyo! Oneuldo osyeonneyo!',
    },
    personalityTraits: ['friendly', 'patient', 'encouraging'],
    interests: ['coffee', 'K-pop', 'teaching'],
    avatar: '👩‍🍳',
    bodyColor: 0xff8fab,
    hairColor: 0x2c1810,
    outfitColor: 0x8b4513,

    // Relationship arc thresholds
    arcs: [
      { threshold: 0,  title: '낯선 손님',     titlePhonetic: 'Natseom sonnim',     titleEn: 'Stranger Customer' },
      { threshold: 20, title: '단골 손님',     titlePhonetic: 'Dangol sonnim',      titleEn: 'Regular Customer' },
      { threshold: 40, title: '아는 사이',     titlePhonetic: 'Aneun sai',          titleEn: 'Acquaintance' },
      { threshold: 60, title: '좋은 친구',     titlePhonetic: 'Joheun chingu',      titleEn: 'Good Friend' },
      { threshold: 80, title: '소중한 친구',   titlePhonetic: 'Sojunghan chingu',   titleEn: 'Close Friend' },
      { threshold: 95, title: '특별한 사람',   titlePhonetic: 'Teukbyeolhan saram', titleEn: 'Special Person' },
    ],
  },

  minjun: {
    id: 'minjun',
    name: '민준',
    nameRomanized: 'Minjun',
    role: 'Street Musician',
    roleKorean: '거리의 음악가',
    location: 'street',
    age: 27,
    personality: 'Cool, mysterious, artistic',
    description: 'A talented guitarist who plays on the streets of Hongdae. He seems to know more about the city than he lets on.',
    descriptionKorean: '홍대 거리에서 연주하는 재능 있는 기타리스트',
    descriptionPhonetic: 'Hongdae georieseo yeonjuhaneun jaeneung inneun gitariseuteu',
    color: '#7c8cf8',
    accentColor: '#5b6ef0',
    greeting: {
      korean: '음... 또 왔어? 반갑다.',
      phonetic: 'Eum... tto wasseo? Bangapda.',
    },
    personalityTraits: ['artistic', 'reserved', 'insightful'],
    interests: ['music', 'poetry', 'night walks'],
    avatar: '🎸',
    bodyColor: 0x7c8cf8,
    hairColor: 0x1a1a2e,
    outfitColor: 0x2d2d44,

    arcs: [
      { threshold: 0,  title: '지나가는 사람', titlePhonetic: 'Jinaganeun saram',   titleEn: 'Passerby' },
      { threshold: 20, title: '관객',         titlePhonetic: 'Gwangaek',           titleEn: 'Audience Member' },
      { threshold: 40, title: '음악 친구',     titlePhonetic: 'Eumak chingu',       titleEn: 'Music Friend' },
      { threshold: 60, title: '진짜 친구',     titlePhonetic: 'Jinjja chingu',      titleEn: 'Real Friend' },
      { threshold: 80, title: '동료',         titlePhonetic: 'Dongryo',            titleEn: 'Companion' },
      { threshold: 95, title: '영혼의 친구',   titlePhonetic: 'Yeonghonui chingu',  titleEn: 'Soulmate' },
    ],
  },

  sua: {
    id: 'sua',
    name: '수아',
    nameRomanized: 'Sua',
    role: 'University Student',
    roleKorean: '대학생',
    location: 'subway',
    age: 22,
    personality: 'Shy, intellectual, curious',
    description: 'A literature student who reads on the subway every day. She\'s quiet but has the most fascinating insights about life in Seoul.',
    descriptionKorean: '매일 지하철에서 책을 읽는 문학과 학생',
    descriptionPhonetic: 'Maeil jihacheoleseo chaegul ingneun munhakgwa haksaeng',
    color: '#a78bfa',
    accentColor: '#8b6cf7',
    greeting: {
      korean: '아... 안녕하세요. 또 만났네요.',
      phonetic: 'A... annyeonghaseyo. Tto mannanneyo.',
    },
    personalityTraits: ['shy', 'bookish', 'observant'],
    interests: ['literature', 'philosophy', 'journaling'],
    avatar: '📚',
    bodyColor: 0xa78bfa,
    hairColor: 0x0d0d15,
    outfitColor: 0x4a3f6b,

    arcs: [
      { threshold: 0,  title: '모르는 사람',   titlePhonetic: 'Moreuneun saram',    titleEn: 'Unknown Person' },
      { threshold: 20, title: '아는 얼굴',     titlePhonetic: 'Aneun eolgul',       titleEn: 'Familiar Face' },
      { threshold: 40, title: '대화 상대',     titlePhonetic: 'Daehwa sangdae',     titleEn: 'Conversation Partner' },
      { threshold: 60, title: '의지할 친구',   titlePhonetic: 'Uijihal chingu',     titleEn: 'Reliable Friend' },
      { threshold: 80, title: '마음을 여는 사이', titlePhonetic: 'Maeumeul yeoneun sai', titleEn: 'Heart Opened' },
      { threshold: 95, title: '소울메이트',     titlePhonetic: 'Soulmeitu',          titleEn: 'Soulmate' },
    ],
  },

  haeun: {
    id: 'haeun',
    name: '하은',
    nameRomanized: 'Haeun',
    role: 'Café Owner',
    roleKorean: '카페 사장님',
    location: 'cafe',
    age: 45,
    personality: 'Strict, wise, caring underneath',
    description: 'The owner of the café where Jisu works. She seems tough but has a heart of gold. She\'s been in Seoul for decades.',
    descriptionKorean: '지수가 일하는 카페의 사장님. 엄격하지만 따뜻한 마음을 가진 분',
    descriptionPhonetic: 'Jisuga ilhaneun kapeui sajangnim. Eomgyeokhajiman ttatteutan maeumeul gajin bun',
    color: '#f0a050',
    accentColor: '#e08940',
    greeting: {
      korean: '손님, 뭐 드릴까요?',
      phonetic: 'Sonnim, mwo deurilkkayo?',
    },
    personalityTraits: ['strict', 'wise', 'protective'],
    interests: ['tradition', 'cooking', 'history'],
    avatar: '👩‍💼',
    bodyColor: 0xf0a050,
    hairColor: 0x3d2b1f,
    outfitColor: 0x5c3d2e,

    arcs: [
      { threshold: 0,  title: '손님',         titlePhonetic: 'Sonnim',             titleEn: 'Customer' },
      { threshold: 20, title: '인사하는 사이', titlePhonetic: 'Insahaneun sai',     titleEn: 'Greeting Terms' },
      { threshold: 40, title: '신뢰',         titlePhonetic: 'Silloe',             titleEn: 'Trusted' },
      { threshold: 60, title: '존경',         titlePhonetic: 'Jongyeong',          titleEn: 'Respected' },
      { threshold: 80, title: '가족 같은',     titlePhonetic: 'Gajok gateun',       titleEn: 'Like Family' },
      { threshold: 95, title: '은인',         titlePhonetic: 'Eunin',              titleEn: 'Benefactor' },
    ],
  },
};

export const NPC_LIST = Object.values(NPCS);

export function getNPCsByLocation(location) {
  return NPC_LIST.filter(npc => npc.location === location);
}

export function getNPCArc(npcId, score) {
  const npc = NPCS[npcId];
  if (!npc) return null;
  let currentArc = npc.arcs[0];
  for (const arc of npc.arcs) {
    if (score >= arc.threshold) currentArc = arc;
  }
  return currentArc;
}
