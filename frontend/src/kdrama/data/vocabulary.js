// ─────────────────────────────────────────────────────────────────────────────
// KOREAN VOCABULARY DATABASE — Phonetic Romanization (NOT translations)
// Each entry: korean, phonetic, english (for internal reference), category
// ─────────────────────────────────────────────────────────────────────────────

export const VOCABULARY = {
  greetings: [
    { id: 'v_hello', korean: '안녕하세요', phonetic: 'Annyeonghaseyo', english: 'Hello (formal)', highlight: true },
    { id: 'v_hi', korean: '안녕', phonetic: 'Annyeong', english: 'Hi (casual)', highlight: false },
    { id: 'v_goodbye', korean: '안녕히 가세요', phonetic: 'Annyeonghi gaseyo', english: 'Goodbye (to one leaving)', highlight: true },
    { id: 'v_goodbye2', korean: '안녕히 계세요', phonetic: 'Annyeonghi gyeseyo', english: 'Goodbye (to one staying)', highlight: false },
    { id: 'v_thankyou', korean: '감사합니다', phonetic: 'Gamsahamnida', english: 'Thank you (formal)', highlight: true },
    { id: 'v_thanks', korean: '고마워', phonetic: 'Gomawo', english: 'Thanks (casual)', highlight: false },
    { id: 'v_sorry', korean: '죄송합니다', phonetic: 'Joesonghamnida', english: 'Sorry (formal)', highlight: true },
    { id: 'v_excuse', korean: '실례합니다', phonetic: 'Sillyehamnida', english: 'Excuse me', highlight: false },
    { id: 'v_nicetomeet', korean: '만나서 반갑습니다', phonetic: 'Mannaseo bangapseumnida', english: 'Nice to meet you', highlight: true },
  ],

  cafe: [
    { id: 'v_order', korean: '주문하시겠어요?', phonetic: 'Jumun hasigesseoyo?', english: 'Would you like to order?', highlight: true },
    { id: 'v_coffee', korean: '커피', phonetic: 'Keopi', english: 'Coffee', highlight: true },
    { id: 'v_americano', korean: '아메리카노', phonetic: 'Amerikano', english: 'Americano', highlight: false },
    { id: 'v_latte', korean: '라떼', phonetic: 'Latte', english: 'Latte', highlight: false },
    { id: 'v_hot', korean: '뜨거운', phonetic: 'Tteugeoun', english: 'Hot', highlight: true },
    { id: 'v_cold', korean: '차가운', phonetic: 'Chagaun', english: 'Cold', highlight: true },
    { id: 'v_water', korean: '물', phonetic: 'Mul', english: 'Water', highlight: false },
    { id: 'v_delicious', korean: '맛있어요', phonetic: 'Masisseoyo', english: 'It\'s delicious', highlight: true },
    { id: 'v_howmuch', korean: '얼마예요?', phonetic: 'Eolmayeyo?', english: 'How much?', highlight: true },
    { id: 'v_please', korean: '주세요', phonetic: 'Juseyo', english: 'Please give me', highlight: true },
    { id: 'v_onemoment', korean: '잠시만요', phonetic: 'Jamsimanyo', english: 'One moment please', highlight: false },
    { id: 'v_here', korean: '여기요', phonetic: 'Yeogiyo', english: 'Here (calling attention)', highlight: true },
    { id: 'v_takeout', korean: '포장해 주세요', phonetic: 'Pojanghae juseyo', english: 'To go please', highlight: false },
    { id: 'v_eat_here', korean: '여기서 먹을게요', phonetic: 'Yeogiseo meogeulgeyo', english: 'Eating here', highlight: false },
  ],

  street: [
    { id: 'v_where', korean: '어디', phonetic: 'Eodi', english: 'Where', highlight: true },
    { id: 'v_here2', korean: '여기', phonetic: 'Yeogi', english: 'Here', highlight: false },
    { id: 'v_there', korean: '거기', phonetic: 'Geogi', english: 'There', highlight: false },
    { id: 'v_station', korean: '역', phonetic: 'Yeok', english: 'Station', highlight: true },
    { id: 'v_subway', korean: '지하철', phonetic: 'Jihacheol', english: 'Subway', highlight: true },
    { id: 'v_left', korean: '왼쪽', phonetic: 'Oenjjok', english: 'Left', highlight: true },
    { id: 'v_right', korean: '오른쪽', phonetic: 'Oreunjjok', english: 'Right', highlight: true },
    { id: 'v_straight', korean: '직진', phonetic: 'Jikjin', english: 'Straight ahead', highlight: false },
    { id: 'v_music', korean: '음악', phonetic: 'Eumak', english: 'Music', highlight: true },
    { id: 'v_beautiful', korean: '아름다워요', phonetic: 'Areumdawoyo', english: 'It\'s beautiful', highlight: true },
    { id: 'v_weather', korean: '날씨', phonetic: 'Nalssi', english: 'Weather', highlight: false },
    { id: 'v_cold_weather', korean: '추워요', phonetic: 'Chuwoyo', english: 'It\'s cold', highlight: false },
    { id: 'v_night', korean: '밤', phonetic: 'Bam', english: 'Night', highlight: false },
  ],

  subway: [
    { id: 'v_next_station', korean: '다음 역', phonetic: 'Daeum yeok', english: 'Next station', highlight: true },
    { id: 'v_transfer', korean: '환승', phonetic: 'Hwanseung', english: 'Transfer', highlight: true },
    { id: 'v_exit', korean: '출구', phonetic: 'Chulgu', english: 'Exit', highlight: true },
    { id: 'v_seat', korean: '자리', phonetic: 'Jari', english: 'Seat', highlight: false },
    { id: 'v_careful', korean: '조심하세요', phonetic: 'Josimhaseyo', english: 'Be careful', highlight: true },
    { id: 'v_door_closing', korean: '문이 닫힙니다', phonetic: 'Muni dathimnida', english: 'Doors are closing', highlight: true },
    { id: 'v_which_line', korean: '몇 호선', phonetic: 'Myeot hoseon', english: 'Which line number', highlight: false },
    { id: 'v_crowded', korean: '사람이 많아요', phonetic: 'Sarami manayo', english: 'It\'s crowded', highlight: false },
  ],

  emotions: [
    { id: 'v_happy', korean: '기뻐요', phonetic: 'Gippeoyo', english: 'Happy', highlight: true },
    { id: 'v_sad', korean: '슬퍼요', phonetic: 'Seulpeoyo', english: 'Sad', highlight: false },
    { id: 'v_excited', korean: '신나요', phonetic: 'Sinnayo', english: 'Excited', highlight: false },
    { id: 'v_worried', korean: '걱정돼요', phonetic: 'Geokjeongdwaeyo', english: 'Worried', highlight: true },
    { id: 'v_tired', korean: '피곤해요', phonetic: 'Pigonhaeyo', english: 'Tired', highlight: false },
    { id: 'v_okay', korean: '괜찮아요', phonetic: 'Gwaenchanayo', english: 'It\'s okay', highlight: true },
  ],

  social: [
    { id: 'v_name', korean: '이름이 뭐예요?', phonetic: 'Ireumi mwoyeyo?', english: 'What is your name?', highlight: true },
    { id: 'v_myname', korean: '제 이름은', phonetic: 'Je ireumeun', english: 'My name is', highlight: true },
    { id: 'v_friend', korean: '친구', phonetic: 'Chingu', english: 'Friend', highlight: true },
    { id: 'v_together', korean: '같이', phonetic: 'Gachi', english: 'Together', highlight: false },
    { id: 'v_yes', korean: '네', phonetic: 'Ne', english: 'Yes', highlight: true },
    { id: 'v_no', korean: '아니요', phonetic: 'Aniyo', english: 'No', highlight: true },
    { id: 'v_really', korean: '정말요?', phonetic: 'Jeongmalyo?', english: 'Really?', highlight: false },
    { id: 'v_understand', korean: '이해해요', phonetic: 'Ihaehaeyo', english: 'I understand', highlight: true },
    { id: 'v_dontunderstand', korean: '모르겠어요', phonetic: 'Moreugesseoyo', english: 'I don\'t understand', highlight: true },
    { id: 'v_help', korean: '도와주세요', phonetic: 'Dowajuseyo', english: 'Please help', highlight: true },
  ],
};

// Flatten all vocabulary into a single searchable array
export const ALL_VOCABULARY = Object.entries(VOCABULARY).flatMap(
  ([category, words]) => words.map(w => ({ ...w, category }))
);

// Get vocabulary by ID
export function getWordById(id) {
  return ALL_VOCABULARY.find(w => w.id === id) || null;
}

// Get random words from a category
export function getRandomWords(category, count = 3) {
  const pool = VOCABULARY[category] || [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
