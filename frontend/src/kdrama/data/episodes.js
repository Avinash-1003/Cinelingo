// ─────────────────────────────────────────────────────────────────────────────
// EPISODE DEFINITIONS — K-Drama style episodic story progression
// ─────────────────────────────────────────────────────────────────────────────

export const EPISODES = [
  {
    id: 1,
    title: '첫 만남',
    titlePhonetic: 'Cheot mannam',
    titleEn: 'First Meeting',
    subtitle: 'Every story begins with a single step into the unknown.',
    subtitleKorean: '모든 이야기는 한 걸음에서 시작됩니다.',
    subtitlePhonetic: 'Modeun iyagineun han georeumseo sijakdoemnida.',
    description: 'You discover a small café in the heart of Seoul. The barista speaks only Korean, but her warmth transcends language.',
    locations: ['cafe'],
    startDialogue: 'ep1_cafe_enter',
    unlockCondition: null, // Always unlocked
    keyNPCs: ['jisu', 'haeun'],
    rewards: {
      wordsLearned: ['v_hello', 'v_order', 'v_coffee', 'v_delicious', 'v_please'],
      achievementId: 'first_conversation',
    },
    coverColor: '#ff8fab',
    coverGradient: 'linear-gradient(135deg, #ff8fab 0%, #f0a050 100%)',
    duration: '~5 min',
    icon: '☕',
  },
  {
    id: 2,
    title: '거리의 음악',
    titlePhonetic: 'Georiui eumak',
    titleEn: 'Street Music',
    subtitle: 'The night belongs to those who listen.',
    subtitleKorean: '밤은 듣는 사람의 것입니다.',
    subtitlePhonetic: 'Bameun deutneun saramui geosimnida.',
    description: 'A mysterious guitarist plays under the neon lights of Hongdae. His music speaks what words cannot.',
    locations: ['street', 'cafe'],
    startDialogue: 'ep2_street_enter',
    unlockCondition: { type: 'episode', episode: 1 },
    keyNPCs: ['minjun'],
    rewards: {
      wordsLearned: ['v_music', 'v_beautiful', 'v_friend', 'v_together'],
      achievementId: 'street_encounter',
    },
    coverColor: '#7c8cf8',
    coverGradient: 'linear-gradient(135deg, #7c8cf8 0%, #5b4fff 100%)',
    duration: '~5 min',
    icon: '🎸',
  },
  {
    id: 3,
    title: '지하철 이야기',
    titlePhonetic: 'Jihacheol iyagi',
    titleEn: 'Subway Stories',
    subtitle: 'In the spaces between stations, lives intersect.',
    subtitleKorean: '역과 역 사이에서, 삶이 교차합니다.',
    subtitlePhonetic: 'Yeokgwa yeok saieseo, salmi gyochahamnida.',
    description: 'A chance encounter on the subway with a quiet literature student who opens up through poetry.',
    locations: ['subway'],
    startDialogue: 'ep3_subway_enter',
    unlockCondition: { type: 'episode', episode: 2 },
    keyNPCs: ['sua'],
    rewards: {
      wordsLearned: ['v_subway', 'v_next_station', 'v_careful', 'v_sorry'],
      achievementId: 'subway_meeting',
    },
    coverColor: '#a78bfa',
    coverGradient: 'linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)',
    duration: '~5 min',
    icon: '🚇',
  },
  {
    id: 4,
    title: '비밀',
    titlePhonetic: 'Bimil',
    titleEn: 'Secrets',
    subtitle: 'True bonds are forged in moments of vulnerability.',
    subtitleKorean: '진정한 유대는 약한 순간에 만들어집니다.',
    subtitlePhonetic: 'Jinjeonghan yudaeneun yakhan sungane mandeureojibida.',
    description: 'Haeun falls ill. The café needs help. Will your friendships prove strong enough?',
    locations: ['cafe', 'street', 'subway'],
    startDialogue: 'ep4_cafe_revisit',
    unlockCondition: { type: 'episodeAndTrust', episode: 3, npc: 'jisu', trust: 20 },
    keyNPCs: ['jisu', 'minjun', 'haeun'],
    rewards: {
      wordsLearned: ['v_worried', 'v_thankyou', 'v_together'],
      achievementId: 'bonds_of_trust',
    },
    coverColor: '#f0a050',
    coverGradient: 'linear-gradient(135deg, #f0a050 0%, #e8698d 100%)',
    duration: '~7 min',
    icon: '💛',
  },
  {
    id: 5,
    title: '선택',
    titlePhonetic: 'Seontaek',
    titleEn: 'The Choice',
    subtitle: 'Every goodbye is the seed of a new beginning.',
    subtitleKorean: '모든 이별은 새로운 시작의 씨앗입니다.',
    subtitlePhonetic: 'Modeun ibyeoreun saeroun sijakui ssiasimnida.',
    description: 'Your final week in Seoul. Cherry blossoms fall. It\'s time to say what matters most.',
    locations: ['cafe', 'street', 'subway'],
    startDialogue: 'ep5_dawn',
    unlockCondition: { type: 'episode', episode: 4 },
    keyNPCs: ['jisu', 'minjun', 'sua', 'haeun'],
    rewards: {
      wordsLearned: ['v_friend', 'v_goodbye'],
      achievementId: 'story_complete',
    },
    coverColor: '#e8698d',
    coverGradient: 'linear-gradient(135deg, #fda4af 0%, #e8698d 50%, #a78bfa 100%)',
    duration: '~5 min',
    icon: '🌸',
    isFinale: true,
  },
];

export const ACHIEVEMENTS = [
  { id: 'first_conversation', title: '첫 대화', phonetic: 'Cheot daehwa', titleEn: 'First Conversation', icon: '💬', description: 'Complete your first dialogue' },
  { id: 'street_encounter', title: '거리의 만남', phonetic: 'Georiui mannam', titleEn: 'Street Encounter', icon: '🎵', description: 'Meet Minjun on the street' },
  { id: 'subway_meeting', title: '지하철 인연', phonetic: 'Jihacheol inyeon', titleEn: 'Subway Connection', icon: '🚇', description: 'Connect with Sua on the subway' },
  { id: 'bonds_of_trust', title: '신뢰의 유대', phonetic: 'Silloeui yudae', titleEn: 'Bonds of Trust', icon: '🤝', description: 'Help your friends in their time of need' },
  { id: 'story_complete', title: '이야기의 끝', phonetic: 'Iyagiui kkeut', titleEn: 'Story Complete', icon: '🌸', description: 'Complete the full story' },
  { id: 'word_collector_10', title: '단어 수집가', phonetic: 'Daneo sujipga', titleEn: 'Word Collector', icon: '📖', description: 'Learn 10 Korean words' },
  { id: 'word_master_30', title: '단어 마스터', phonetic: 'Daneo maseuteo', titleEn: 'Word Master', icon: '📚', description: 'Learn 30 Korean words' },
  { id: 'social_butterfly', title: '사교적인', phonetic: 'Sagyojeogin', titleEn: 'Social Butterfly', icon: '🦋', description: 'Reach friendship 50 with all NPCs' },
  { id: 'trusted_friend', title: '신뢰 받는 친구', phonetic: 'Silloe banneun chingu', titleEn: 'Trusted Friend', icon: '💎', description: 'Reach trust 80 with any NPC' },
  { id: 'explorer', title: '탐험가', phonetic: 'Tamheomga', titleEn: 'Explorer', icon: '🗺️', description: 'Visit all 3 locations' },
];

// Check if an episode is unlocked
export function isEpisodeUnlocked(episode, completedEpisodes, npcRelationships) {
  if (!episode.unlockCondition) return true;

  const cond = episode.unlockCondition;

  if (cond.type === 'episode') {
    return completedEpisodes.includes(cond.episode);
  }

  if (cond.type === 'episodeAndTrust') {
    const epDone = completedEpisodes.includes(cond.episode);
    const npcData = npcRelationships[cond.npc];
    const trustMet = npcData ? npcData.trust >= cond.trust : false;
    return epDone && trustMet;
  }

  return false;
}
