// ─────────────────────────────────────────────────────────────────────────────
// DIALOGUE TREES — Branching dialogues for all NPCs across episodes
// Each node: id, speaker, korean, phonetic, narration, choices[]
// Each choice: text, korean, phonetic, next, effects {}
// ─────────────────────────────────────────────────────────────────────────────

export const DIALOGUES = {

  // ═══════════════════════════════════════════════════════════════════════════
  // EPISODE 1 — 첫 만남 (First Meeting) — Café
  // ═══════════════════════════════════════════════════════════════════════════

  ep1_cafe_enter: {
    id: 'ep1_cafe_enter',
    type: 'narration',
    narration: 'You push open the glass door of a small café. The warm aroma of freshly roasted coffee fills the air. A bell chimes softly above you.',
    narrationKorean: '카페의 유리문을 열고 들어갑니다.',
    narrationPhonetic: 'Kapeui yurimuneul yeolgo deureogamnida.',
    next: 'ep1_jisu_greet',
    learnWords: ['v_hello'],
  },

  ep1_jisu_greet: {
    id: 'ep1_jisu_greet',
    type: 'dialogue',
    speaker: 'jisu',
    korean: '어서오세요! 처음 오셨죠? 환영합니다!',
    phonetic: 'Eoseooseyo! Cheoeum osyeotjyo? Hwanyeonghamnida!',
    highlightWords: ['어서오세요', '환영합니다'],
    emotion: 'happy',
    choices: [
      {
        id: 'c1_greet_formal',
        text: 'Bow politely and greet formally',
        korean: '안녕하세요. 네, 처음이에요.',
        phonetic: 'Annyeonghaseyo. Ne, cheoeumieyo.',
        next: 'ep1_jisu_impressed',
        effects: { jisu: { friendship: 8, trust: 5 }, flags: ['greeted_formally'] },
      },
      {
        id: 'c1_greet_casual',
        text: 'Wave casually',
        korean: '안녕! 여기 좋은 곳이네.',
        phonetic: 'Annyeong! Yeogi joheun gosine.',
        next: 'ep1_jisu_casual',
        effects: { jisu: { friendship: 5, trust: 2 } },
      },
      {
        id: 'c1_greet_shy',
        text: 'Nod shyly and look around',
        korean: '... 네.',
        phonetic: '... Ne.',
        next: 'ep1_jisu_gentle',
        effects: { jisu: { friendship: 3, trust: 3 } },
      },
    ],
  },

  ep1_jisu_impressed: {
    id: 'ep1_jisu_impressed',
    type: 'dialogue',
    speaker: 'jisu',
    korean: '우와, 한국어 하시네요! 너무 잘하셨어요!',
    phonetic: 'Uwa, hangugeo hasineyo! Neomu jalhasyeosseoyo!',
    highlightWords: ['한국어', '잘하셨어요'],
    emotion: 'excited',
    next: 'ep1_jisu_offer',
    learnWords: ['v_hello', 'v_thankyou'],
  },

  ep1_jisu_casual: {
    id: 'ep1_jisu_casual',
    type: 'dialogue',
    speaker: 'jisu',
    korean: '하하, 편하게 말해줘서 좋아요. 뭐 마실래요?',
    phonetic: 'Haha, pyeonhage malhaejwoseo joayo. Mwo masillaeyo?',
    highlightWords: ['마실래요'],
    emotion: 'amused',
    next: 'ep1_jisu_offer',
  },

  ep1_jisu_gentle: {
    id: 'ep1_jisu_gentle',
    type: 'dialogue',
    speaker: 'jisu',
    korean: '괜찮아요, 긴장하지 마세요! 저는 지수예요.',
    phonetic: 'Gwaenchanayo, ginjangaji maseyo! Jeoneun Jisuyeyo.',
    highlightWords: ['괜찮아요'],
    emotion: 'gentle',
    next: 'ep1_jisu_offer',
    learnWords: ['v_okay'],
  },

  ep1_jisu_offer: {
    id: 'ep1_jisu_offer',
    type: 'dialogue',
    speaker: 'jisu',
    korean: '주문하시겠어요? 오늘 아메리카노가 특히 맛있어요!',
    phonetic: 'Jumun hasigesseoyo? Oneul Amerikano-ga teukhi masisseoyo!',
    highlightWords: ['주문하시겠어요', '아메리카노', '맛있어요'],
    emotion: 'happy',
    learnWords: ['v_order', 'v_americano', 'v_delicious'],
    choices: [
      {
        id: 'c1_order_americano',
        text: 'Order an Americano',
        korean: '아메리카노 한 잔 주세요!',
        phonetic: 'Amerikano han jan juseyo!',
        next: 'ep1_jisu_americano',
        effects: { jisu: { friendship: 5 }, flags: ['ordered_americano'] },
      },
      {
        id: 'c1_order_latte',
        text: 'Ask for a latte',
        korean: '라떼 주세요.',
        phonetic: 'Latte juseyo.',
        next: 'ep1_jisu_latte',
        effects: { jisu: { friendship: 5 }, flags: ['ordered_latte'] },
      },
      {
        id: 'c1_order_help',
        text: 'Ask for a recommendation',
        korean: '뭐가 맛있어요?',
        phonetic: 'Mwoga masisseoyo?',
        next: 'ep1_jisu_recommend',
        effects: { jisu: { friendship: 7, trust: 3 }, flags: ['asked_recommendation'] },
      },
    ],
  },

  ep1_jisu_americano: {
    id: 'ep1_jisu_americano',
    type: 'dialogue',
    speaker: 'jisu',
    korean: '좋은 선택! 뜨거운 거요, 차가운 거요?',
    phonetic: 'Joheun seontaek! Tteugeoun geoyo, chagaun geoyo?',
    highlightWords: ['뜨거운', '차가운'],
    emotion: 'happy',
    learnWords: ['v_hot', 'v_cold'],
    choices: [
      {
        id: 'c1_hot',
        text: 'Hot',
        korean: '뜨거운 거요!',
        phonetic: 'Tteugeoun geoyo!',
        next: 'ep1_jisu_making',
        effects: { flags: ['chose_hot'] },
      },
      {
        id: 'c1_cold',
        text: 'Cold',
        korean: '차가운 거요!',
        phonetic: 'Chagaun geoyo!',
        next: 'ep1_jisu_making',
        effects: { flags: ['chose_cold'] },
      },
    ],
  },

  ep1_jisu_latte: {
    id: 'ep1_jisu_latte',
    type: 'dialogue',
    speaker: 'jisu',
    korean: '라떼 좋아하시는구나! 저도 라떼 좋아해요.',
    phonetic: 'Latte joahasineuguna! Jeodo latte joahaeyo.',
    emotion: 'happy',
    next: 'ep1_jisu_making',
    effects: { jisu: { friendship: 3 } },
  },

  ep1_jisu_recommend: {
    id: 'ep1_jisu_recommend',
    type: 'dialogue',
    speaker: 'jisu',
    korean: '오늘은... 꿀 아메리카노 추천해요! 사장님 특제 레시피에요.',
    phonetic: 'Oneureun... kkul Amerikano chucheonhaeyo! Sajangnim teukje resipieyo.',
    highlightWords: ['추천해요'],
    emotion: 'excited',
    next: 'ep1_jisu_making',
    effects: { jisu: { friendship: 5 } },
  },

  ep1_jisu_making: {
    id: 'ep1_jisu_making',
    type: 'narration',
    narration: 'Jisu smiles and begins preparing your drink with practiced hands. The espresso machine hums. You take a seat at a wooden table by the window.',
    narrationKorean: '지수가 웃으며 음료를 만들기 시작합니다.',
    narrationPhonetic: 'Jisuga useumyeo eumryoreul mandeulgi sijakamnida.',
    next: 'ep1_haeun_appear',
  },

  ep1_haeun_appear: {
    id: 'ep1_haeun_appear',
    type: 'dialogue',
    speaker: 'haeun',
    korean: '새로운 손님이네. 한국어를 배우고 있어?',
    phonetic: 'Saeroun sonnimine. Hangugeoreul baeugo isseo?',
    highlightWords: ['한국어', '배우고'],
    emotion: 'neutral',
    learnWords: ['v_name'],
    choices: [
      {
        id: 'c1_haeun_yes',
        text: 'Yes, I\'m learning Korean',
        korean: '네, 한국어를 배우고 있어요!',
        phonetic: 'Ne, hangugeoreul baeugo isseoyo!',
        next: 'ep1_haeun_approve',
        effects: { haeun: { friendship: 8, trust: 5 }, flags: ['told_haeun_learning'] },
      },
      {
        id: 'c1_haeun_no',
        text: 'Just visiting Seoul',
        korean: '서울 여행 중이에요.',
        phonetic: 'Seoul yeohaeng jungieyo.',
        next: 'ep1_haeun_okay',
        effects: { haeun: { friendship: 3, trust: 2 } },
      },
    ],
  },

  ep1_haeun_approve: {
    id: 'ep1_haeun_approve',
    type: 'dialogue',
    speaker: 'haeun',
    korean: '좋아. 열심히 하면 도와줄게. 우리 카페에서 많이 배울 수 있어.',
    phonetic: 'Joa. Yeolsimhi hamyeon dowajulge. Uri kapeseo mani baeul su isseo.',
    highlightWords: ['도와줄게', '배울 수 있어'],
    emotion: 'approving',
    next: 'ep1_end',
    effects: { haeun: { friendship: 5 } },
  },

  ep1_haeun_okay: {
    id: 'ep1_haeun_okay',
    type: 'dialogue',
    speaker: 'haeun',
    korean: '그래? 서울이 마음에 들면 좋겠다.',
    phonetic: 'Geurae? Seouri maeume deulmyeon jokgetda.',
    emotion: 'neutral',
    next: 'ep1_end',
  },

  ep1_end: {
    id: 'ep1_end',
    type: 'narration',
    narration: 'You finish your coffee as the evening light filters through the window. The café feels warm and welcoming. You feel you\'ll come back here again. Episode 1 Complete.',
    narrationKorean: '에피소드 1 완료',
    narrationPhonetic: 'Episodeu 1 wallyo',
    isEpisodeEnd: true,
    episode: 1,
    next: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EPISODE 2 — 거리의 음악 (Street Music) — Street + Café
  // ═══════════════════════════════════════════════════════════════════════════

  ep2_street_enter: {
    id: 'ep2_street_enter',
    type: 'narration',
    narration: 'The Seoul night is alive. Neon signs paint the wet pavement in shades of pink and blue. You hear the faint sound of a guitar somewhere ahead.',
    narrationKorean: '서울의 밤거리를 걷습니다. 기타 소리가 들립니다.',
    narrationPhonetic: 'Seourui bamgeorireul geotseumnida. Gita soriga deullimnida.',
    next: 'ep2_minjun_playing',
    learnWords: ['v_music', 'v_night'],
  },

  ep2_minjun_playing: {
    id: 'ep2_minjun_playing',
    type: 'narration',
    narration: 'A young man sits on a plastic crate under a street lamp, fingers dancing across guitar strings. A small crowd gathers. The melody is hauntingly beautiful.',
    next: 'ep2_minjun_notice',
  },

  ep2_minjun_notice: {
    id: 'ep2_minjun_notice',
    type: 'dialogue',
    speaker: 'minjun',
    korean: '... 음악 좋아해?',
    phonetic: '... Eumak joahae?',
    highlightWords: ['음악', '좋아해'],
    emotion: 'curious',
    learnWords: ['v_music'],
    choices: [
      {
        id: 'c2_music_love',
        text: 'Tell him you love his music',
        korean: '네! 아름다워요, 이 음악.',
        phonetic: 'Ne! Areumdawoyo, i eumak.',
        next: 'ep2_minjun_smile',
        effects: { minjun: { friendship: 10, trust: 5 }, flags: ['praised_minjun'] },
      },
      {
        id: 'c2_music_ask',
        text: 'Ask what song it is',
        korean: '이 노래 뭐예요?',
        phonetic: 'I norae mwoyeyo?',
        next: 'ep2_minjun_song',
        effects: { minjun: { friendship: 7, trust: 3 } },
      },
      {
        id: 'c2_music_silent',
        text: 'Just listen silently',
        korean: '...',
        phonetic: '...',
        next: 'ep2_minjun_respect',
        effects: { minjun: { friendship: 5, trust: 8 }, flags: ['silent_listener'] },
      },
    ],
  },

  ep2_minjun_smile: {
    id: 'ep2_minjun_smile',
    type: 'dialogue',
    speaker: 'minjun',
    korean: '고마워. 오랜만에 진심으로 듣는 사람을 만났어.',
    phonetic: 'Gomawo. Oraenmane jinsimeuro deutneun sarameul mannasseo.',
    highlightWords: ['고마워', '진심으로'],
    emotion: 'touched',
    next: 'ep2_minjun_introduce',
    learnWords: ['v_thanks'],
  },

  ep2_minjun_song: {
    id: 'ep2_minjun_song',
    type: 'dialogue',
    speaker: 'minjun',
    korean: '내가 만든 곡이야. 제목은... 아직 없어.',
    phonetic: 'Naega mandeun gogiya. Jemoneun... ajik eopseo.',
    emotion: 'thoughtful',
    next: 'ep2_minjun_introduce',
  },

  ep2_minjun_respect: {
    id: 'ep2_minjun_respect',
    type: 'dialogue',
    speaker: 'minjun',
    korean: '말없이 듣는 거... 좋아. 음악을 이해하는 사람이야.',
    phonetic: 'Maropsi deutneun geo... joa. Eumageul ihaehaneun saramiya.',
    highlightWords: ['이해하는'],
    emotion: 'respectful',
    next: 'ep2_minjun_introduce',
    learnWords: ['v_understand'],
  },

  ep2_minjun_introduce: {
    id: 'ep2_minjun_introduce',
    type: 'dialogue',
    speaker: 'minjun',
    korean: '나는 민준. 이름이 뭐야?',
    phonetic: 'Naneun Minjun. Ireumi mwoya?',
    highlightWords: ['이름이 뭐야'],
    emotion: 'neutral',
    learnWords: ['v_name', 'v_myname'],
    choices: [
      {
        id: 'c2_name_korean',
        text: 'Introduce yourself in Korean',
        korean: '만나서 반갑습니다! 제 이름은...',
        phonetic: 'Mannaseo bangapseumnida! Je ireumeun...',
        next: 'ep2_minjun_impressed',
        effects: { minjun: { friendship: 8, trust: 5 } },
      },
      {
        id: 'c2_name_simple',
        text: 'Give a simple introduction',
        korean: '반가워.',
        phonetic: 'Bangawo.',
        next: 'ep2_minjun_cool',
        effects: { minjun: { friendship: 5, trust: 3 } },
      },
    ],
  },

  ep2_minjun_impressed: {
    id: 'ep2_minjun_impressed',
    type: 'dialogue',
    speaker: 'minjun',
    korean: '한국어 꽤 잘하네. 이 근처 카페 알아? 거기 커피 괜찮아.',
    phonetic: 'Hangugeo kkwae jalhane. I geuncheo kape ara? Geogi keopi gwaenchana.',
    emotion: 'impressed',
    next: 'ep2_cafe_mention',
    learnWords: ['v_coffee'],
  },

  ep2_minjun_cool: {
    id: 'ep2_minjun_cool',
    type: 'dialogue',
    speaker: 'minjun',
    korean: '쿨하네. 이 근처에 괜찮은 카페가 있어. 가본 적 있어?',
    phonetic: 'Kulhane. I geuncheoe gwaenchaneun kapega isseo. Gabon jeok isseo?',
    emotion: 'casual',
    next: 'ep2_cafe_mention',
  },

  ep2_cafe_mention: {
    id: 'ep2_cafe_mention',
    type: 'dialogue',
    speaker: 'minjun',
    korean: '지수네 카페. 가끔 거기서 연주해. 같이 갈래?',
    phonetic: 'Jisune kape. Gakkeum geogiseo yeonjuhae. Gachi gallae?',
    highlightWords: ['같이', '갈래'],
    emotion: 'inviting',
    learnWords: ['v_together'],
    choices: [
      {
        id: 'c2_go_together',
        text: 'Go to the café together',
        korean: '좋아, 같이 가자!',
        phonetic: 'Joa, gachi gaja!',
        next: 'ep2_end',
        effects: { minjun: { friendship: 10 }, jisu: { friendship: 3 }, flags: ['went_with_minjun'] },
      },
      {
        id: 'c2_later',
        text: 'Say maybe another time',
        korean: '다음에 같이 가자.',
        phonetic: 'Daeume gachi gaja.',
        next: 'ep2_end',
        effects: { minjun: { friendship: 3, trust: 2 } },
      },
    ],
  },

  ep2_end: {
    id: 'ep2_end',
    type: 'narration',
    narration: 'The night deepens, and the neon glow wraps around the city like a blanket. You\'ve made a new connection in Seoul. The streets feel a little less foreign now. Episode 2 Complete.',
    narrationKorean: '에피소드 2 완료',
    narrationPhonetic: 'Episodeu 2 wallyo',
    isEpisodeEnd: true,
    episode: 2,
    next: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EPISODE 3 — 지하철 이야기 (Subway Stories) — Subway
  // ═══════════════════════════════════════════════════════════════════════════

  ep3_subway_enter: {
    id: 'ep3_subway_enter',
    type: 'narration',
    narration: 'The subway doors slide open with a pneumatic hiss. You step into the car. It\'s the evening commute — most seats are taken. The LED display reads: 다음 역 — 강남.',
    narrationKorean: '지하철에 탑니다. 다음 역은 강남입니다.',
    narrationPhonetic: 'Jihacheore tamnida. Daeum yeogeun Gangnamimnida.',
    next: 'ep3_sua_reading',
    learnWords: ['v_subway', 'v_next_station'],
  },

  ep3_sua_reading: {
    id: 'ep3_sua_reading',
    type: 'narration',
    narration: 'A young woman with round glasses sits alone, completely absorbed in a book. Her bookmark has a tiny pressed flower in it. She doesn\'t notice you.',
    next: 'ep3_sua_choice',
  },

  ep3_sua_choice: {
    id: 'ep3_sua_choice',
    type: 'narration',
    narration: 'The seat next to her is empty. Do you sit nearby?',
    choices: [
      {
        id: 'c3_sit_next',
        text: 'Sit next to her',
        korean: '옆자리에 앉습니다.',
        phonetic: 'Yeop jarie anjseumnida.',
        next: 'ep3_sua_notice',
        effects: { sua: { friendship: 3 } },
      },
      {
        id: 'c3_stand',
        text: 'Stand nearby and hold the rail',
        korean: '서서 갑니다.',
        phonetic: 'Seoseo gamnida.',
        next: 'ep3_sua_bump',
        effects: { sua: { trust: 3 } },
      },
    ],
  },

  ep3_sua_notice: {
    id: 'ep3_sua_notice',
    type: 'dialogue',
    speaker: 'sua',
    korean: '아... 죄송합니다, 자리 좁죠?',
    phonetic: 'A... joesonghamnida, jari jopjyo?',
    highlightWords: ['죄송합니다'],
    emotion: 'shy',
    learnWords: ['v_sorry', 'v_seat'],
    choices: [
      {
        id: 'c3_book_ask',
        text: 'Ask about her book',
        korean: '그 책 재미있어요?',
        phonetic: 'Geu chaek jaemiisseoyo?',
        next: 'ep3_sua_book',
        effects: { sua: { friendship: 8, trust: 5 }, flags: ['asked_about_book'] },
      },
      {
        id: 'c3_its_okay',
        text: 'Say it\'s totally fine',
        korean: '아니에요, 괜찮아요!',
        phonetic: 'Anieyo, gwaenchanayo!',
        next: 'ep3_sua_relieved',
        effects: { sua: { friendship: 5, trust: 3 } },
      },
    ],
  },

  ep3_sua_bump: {
    id: 'ep3_sua_bump',
    type: 'narration',
    narration: 'The subway suddenly brakes. You stumble slightly. The woman looks up from her book.',
    next: 'ep3_sua_concerned',
  },

  ep3_sua_concerned: {
    id: 'ep3_sua_concerned',
    type: 'dialogue',
    speaker: 'sua',
    korean: '조심하세요! 괜찮아요?',
    phonetic: 'Josimhaseyo! Gwaenchanayo?',
    highlightWords: ['조심하세요', '괜찮아요'],
    emotion: 'concerned',
    learnWords: ['v_careful', 'v_okay'],
    choices: [
      {
        id: 'c3_thankher',
        text: 'Thank her for the concern',
        korean: '감사합니다. 괜찮아요!',
        phonetic: 'Gamsahamnida. Gwaenchanayo!',
        next: 'ep3_sua_book',
        effects: { sua: { friendship: 7, trust: 5 } },
      },
      {
        id: 'c3_embarrassed',
        text: 'Feel embarrassed and apologize',
        korean: '죄송합니다...!',
        phonetic: 'Joesonghamnida...!',
        next: 'ep3_sua_smile',
        effects: { sua: { friendship: 5, trust: 3 } },
      },
    ],
  },

  ep3_sua_smile: {
    id: 'ep3_sua_smile',
    type: 'dialogue',
    speaker: 'sua',
    korean: '괜찮아요, 지하철이 가끔 그래요. 외국 분이세요?',
    phonetic: 'Gwaenchanayo, jihacheori gakkeum geuraeyo. Oeguk buniseyo?',
    emotion: 'gentle',
    next: 'ep3_sua_book',
  },

  ep3_sua_book: {
    id: 'ep3_sua_book',
    type: 'dialogue',
    speaker: 'sua',
    korean: '이 책은... 한국 시집이에요. 좋아하는 시인이 있어요.',
    phonetic: 'I chaegeun... hanguk sijibeyo. Joahaneun siini isseoyo.',
    emotion: 'passionate',
    next: 'ep3_sua_poem',
  },

  ep3_sua_poem: {
    id: 'ep3_sua_poem',
    type: 'dialogue',
    speaker: 'sua',
    korean: '"별이 떠오르면, 마음도 떠오른다" — 아름답지 않아요?',
    phonetic: '"Byeoli tteooreumyeon, maeumdo tteoorunda" — areumdapji anayo?',
    highlightWords: ['아름답지'],
    emotion: 'dreamy',
    learnWords: ['v_beautiful'],
    choices: [
      {
        id: 'c3_poem_beautiful',
        text: 'Say it\'s beautiful',
        korean: '정말 아름다워요.',
        phonetic: 'Jeongmal areumdawoyo.',
        next: 'ep3_sua_happy',
        effects: { sua: { friendship: 10, trust: 8 }, flags: ['liked_poem'] },
      },
      {
        id: 'c3_poem_dontunderstand',
        text: 'Admit you didn\'t fully understand',
        korean: '조금... 모르겠어요.',
        phonetic: 'Jogeum... moreugesseoyo.',
        next: 'ep3_sua_teach',
        effects: { sua: { friendship: 5, trust: 10 }, flags: ['honest_about_korean'] },
      },
    ],
  },

  ep3_sua_happy: {
    id: 'ep3_sua_happy',
    type: 'dialogue',
    speaker: 'sua',
    korean: '정말요? 이런 이야기 할 수 있는 사람이 많지 않아요...',
    phonetic: 'Jeongmalyo? Ireon iyagi hal su inneun sarami manji anayo...',
    highlightWords: ['정말요'],
    emotion: 'happy',
    next: 'ep3_sua_exchange',
    learnWords: ['v_really'],
  },

  ep3_sua_teach: {
    id: 'ep3_sua_teach',
    type: 'dialogue',
    speaker: 'sua',
    korean: '솔직하네요. 제가 도와줄게요. "별" 은 star, "마음" 은 heart.',
    phonetic: 'Soljikhaelneyo. Jega dowajulgeyo. "Byeol" eun star, "maeum" eun heart.',
    highlightWords: ['도와줄게요'],
    emotion: 'teaching',
    next: 'ep3_sua_exchange',
    learnWords: ['v_help'],
  },

  ep3_sua_exchange: {
    id: 'ep3_sua_exchange',
    type: 'dialogue',
    speaker: 'sua',
    korean: '저는 수아예요. 다음에도 이 시간 지하철 타요.',
    phonetic: 'Jeoneun Suayeyo. Daeumedo i sigan jihacheol tayo.',
    highlightWords: ['다음에'],
    emotion: 'hopeful',
    next: 'ep3_announcement',
  },

  ep3_announcement: {
    id: 'ep3_announcement',
    type: 'narration',
    narration: 'The subway announcement plays: "문이 닫힙니다. 다음 역은 강남역입니다." Sua smiles and waves goodbye.',
    narrationKorean: '문이 닫힙니다. 다음 역은 강남역입니다.',
    narrationPhonetic: 'Muni dathimnida. Daeum yeogeun Gangnam yeogimnida.',
    learnWords: ['v_door_closing', 'v_next_station'],
    next: 'ep3_end',
  },

  ep3_sua_relieved: {
    id: 'ep3_sua_relieved',
    type: 'dialogue',
    speaker: 'sua',
    korean: '다행이에요... 저는 수아예요.',
    phonetic: 'Dahaengieyo... jeoneun Suayeyo.',
    emotion: 'relieved',
    next: 'ep3_announcement',
  },

  ep3_end: {
    id: 'ep3_end',
    type: 'narration',
    narration: 'The doors close and the subway pulls away. Through the glass, Sua gives a small wave. Seoul is full of fleeting connections. Episode 3 Complete.',
    narrationKorean: '에피소드 3 완료',
    narrationPhonetic: 'Episodeu 3 wallyo',
    isEpisodeEnd: true,
    episode: 3,
    next: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EPISODE 4 — 비밀 (Secrets) — All locations
  // ═══════════════════════════════════════════════════════════════════════════

  ep4_cafe_revisit: {
    id: 'ep4_cafe_revisit',
    type: 'narration',
    narration: 'You return to the café. Something feels different today. Jisu looks troubled. Haeun is nowhere to be seen.',
    narrationKorean: '카페에 돌아왔지만, 뭔가 다릅니다.',
    narrationPhonetic: 'Kapee dorawatjiman, mwonga dareubnida.',
    next: 'ep4_jisu_worried',
  },

  ep4_jisu_worried: {
    id: 'ep4_jisu_worried',
    type: 'dialogue',
    speaker: 'jisu',
    korean: '사장님이 아파요... 요즘 많이 걱정돼요.',
    phonetic: 'Sajangnimi apayo... yojeum mani geokjeongdwaeyo.',
    highlightWords: ['걱정돼요'],
    emotion: 'worried',
    learnWords: ['v_worried'],
    choices: [
      {
        id: 'c4_comfort',
        text: 'Comfort Jisu',
        korean: '괜찮을 거예요. 제가 도와줄게요.',
        phonetic: 'Gwaenchaneul geoyeyo. Jega dowajulgeyo.',
        next: 'ep4_jisu_grateful',
        effects: { jisu: { friendship: 12, trust: 10 }, flags: ['comforted_jisu'] },
      },
      {
        id: 'c4_ask_details',
        text: 'Ask what happened',
        korean: '무슨 일이에요?',
        phonetic: 'Museun irieyo?',
        next: 'ep4_jisu_explain',
        effects: { jisu: { friendship: 7, trust: 5 } },
      },
    ],
  },

  ep4_jisu_grateful: {
    id: 'ep4_jisu_grateful',
    type: 'dialogue',
    speaker: 'jisu',
    korean: '정말 고마워요... 친구가 있어서 다행이에요.',
    phonetic: 'Jeongmal gomawoyo... chinguga isseoseo dahaengieyo.',
    highlightWords: ['친구', '고마워요'],
    emotion: 'grateful',
    next: 'ep4_minjun_arrives',
    learnWords: ['v_friend', 'v_thanks'],
  },

  ep4_jisu_explain: {
    id: 'ep4_jisu_explain',
    type: 'dialogue',
    speaker: 'jisu',
    korean: '사장님이 병원에 계세요. 카페를 혼자 운영해야 해요...',
    phonetic: 'Sajangnimi byeongwone gyeseyo. Kapereul honja unyeonghaeya haeyo...',
    emotion: 'sad',
    next: 'ep4_minjun_arrives',
  },

  ep4_minjun_arrives: {
    id: 'ep4_minjun_arrives',
    type: 'narration',
    narration: 'The café door opens. Minjun walks in with his guitar case slung over his shoulder.',
    next: 'ep4_minjun_check',
  },

  ep4_minjun_check: {
    id: 'ep4_minjun_check',
    type: 'dialogue',
    speaker: 'minjun',
    korean: '지수야, 괜찮아? 사장님 소식 들었어.',
    phonetic: 'Jisuya, gwaenchana? Sajangnim sosik deureosseo.',
    emotion: 'concerned',
    next: 'ep4_group_decision',
  },

  ep4_group_decision: {
    id: 'ep4_group_decision',
    type: 'narration',
    narration: 'Jisu looks between you and Minjun. A silent understanding passes between you all. The café needs help.',
    choices: [
      {
        id: 'c4_help_cafe',
        text: 'Offer to help run the café',
        korean: '같이 도와요! 우리가 할 수 있어요.',
        phonetic: 'Gachi dowayo! Uriga hal su isseoyo.',
        next: 'ep4_teamwork',
        effects: { jisu: { friendship: 15, trust: 12 }, minjun: { friendship: 8, trust: 5 }, flags: ['helped_cafe'] },
      },
      {
        id: 'c4_visit_haeun',
        text: 'Suggest visiting Haeun at the hospital',
        korean: '사장님을 먼저 보러 가요.',
        phonetic: 'Sajangnimeul meonjeo boreo gayo.',
        next: 'ep4_hospital_mention',
        effects: { haeun: { friendship: 15, trust: 10 }, jisu: { friendship: 8 }, flags: ['visited_haeun'] },
      },
    ],
  },

  ep4_teamwork: {
    id: 'ep4_teamwork',
    type: 'dialogue',
    speaker: 'jisu',
    korean: '정말요? 같이 하면... 할 수 있을 거예요! 감사합니다!',
    phonetic: 'Jeongmalyo? Gachi hamyeon... hal su isseul geoyeyo! Gamsahamnida!',
    highlightWords: ['같이', '감사합니다'],
    emotion: 'hopeful',
    next: 'ep4_end',
    learnWords: ['v_together', 'v_thankyou'],
  },

  ep4_hospital_mention: {
    id: 'ep4_hospital_mention',
    type: 'narration',
    narration: 'You all decide to visit Haeun first. Together, you leave the café and head towards the hospital.',
    next: 'ep4_end',
  },

  ep4_end: {
    id: 'ep4_end',
    type: 'narration',
    narration: 'The bonds between you grow stronger with each shared moment. In Seoul, friends become family. Episode 4 Complete.',
    narrationKorean: '에피소드 4 완료',
    narrationPhonetic: 'Episodeu 4 wallyo',
    isEpisodeEnd: true,
    episode: 4,
    next: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EPISODE 5 — 선택 (The Choice) — Multiple endings
  // ═══════════════════════════════════════════════════════════════════════════

  ep5_dawn: {
    id: 'ep5_dawn',
    type: 'narration',
    narration: 'Weeks have passed. The cherry blossoms are in full bloom. It\'s your last week in Seoul. Choices made along the way have led you here.',
    narrationKorean: '서울에서의 마지막 주입니다.',
    narrationPhonetic: 'Seouleseoui majimak juimnida.',
    next: 'ep5_gather',
  },

  ep5_gather: {
    id: 'ep5_gather',
    type: 'narration',
    narration: 'Everyone gathers at the café one last time. Jisu, Minjun, Sua, and Haeun — each one a chapter of your Seoul story.',
    next: 'ep5_final_choice',
  },

  ep5_final_choice: {
    id: 'ep5_final_choice',
    type: 'narration',
    narration: 'As the sun sets over the café, each friend has something to say. Who do you speak with first?',
    choices: [
      {
        id: 'c5_jisu_ending',
        text: 'Talk to Jisu about the future',
        korean: '지수야, 이야기하자.',
        phonetic: 'Jisuya, iyagihaja.',
        next: 'ep5_jisu_final',
        effects: { flags: ['chose_jisu_ending'] },
      },
      {
        id: 'c5_minjun_ending',
        text: 'Listen to Minjun\'s new song',
        korean: '민준아, 새 노래 들려줘.',
        phonetic: 'Minjuna, sae norae deullyeojwo.',
        next: 'ep5_minjun_final',
        effects: { flags: ['chose_minjun_ending'] },
      },
      {
        id: 'c5_sua_ending',
        text: 'Read with Sua one last time',
        korean: '수아야, 같이 읽자.',
        phonetic: 'Suaya, gachi ikja.',
        next: 'ep5_sua_final',
        effects: { flags: ['chose_sua_ending'] },
      },
      {
        id: 'c5_group_ending',
        text: 'Gather everyone together',
        korean: '다 같이 이야기해요.',
        phonetic: 'Da gachi iyagihaeyo.',
        next: 'ep5_group_final',
        effects: { flags: ['chose_group_ending'] },
      },
    ],
  },

  ep5_jisu_final: {
    id: 'ep5_jisu_final',
    type: 'dialogue',
    speaker: 'jisu',
    korean: '서울이 항상 여기 있을 거예요. 그리고... 나도.',
    phonetic: 'Seouri hangsang yeogi isseul geoyeyo. Geurigo... nado.',
    emotion: 'emotional',
    next: 'ep5_ending',
  },

  ep5_minjun_final: {
    id: 'ep5_minjun_final',
    type: 'dialogue',
    speaker: 'minjun',
    korean: '이 노래... 네 이야기야. 제목은 "친구".',
    phonetic: 'I norae... ne iyagiya. Jemoneun "Chingu".',
    highlightWords: ['친구'],
    emotion: 'sincere',
    next: 'ep5_ending',
    learnWords: ['v_friend'],
  },

  ep5_sua_final: {
    id: 'ep5_sua_final',
    type: 'dialogue',
    speaker: 'sua',
    korean: '"만남은 끝이 아니라, 시작이에요." 다시 만나요.',
    phonetic: '"Mannameun kkeuchi anira, sijakieyo." Dasi mannayo.',
    emotion: 'tearful',
    next: 'ep5_ending',
  },

  ep5_group_final: {
    id: 'ep5_group_final',
    type: 'narration',
    narration: 'Everyone raises their coffee cups. Jisu shouts: "우리의 우정을 위해!" (Uri-ui ujeong-eul wihae!) — To our friendship! The café fills with laughter.',
    next: 'ep5_ending',
  },

  ep5_ending: {
    id: 'ep5_ending',
    type: 'narration',
    narration: 'The cherry blossoms drift past the café window. Seoul has become a second home. The language, once foreign, now sings in your heart. This isn\'t goodbye. It\'s "다음에 또 만나요" — until we meet again. ✨ THE END ✨',
    narrationKorean: '끝 — 다음에 또 만나요',
    narrationPhonetic: 'Kkeut — daeume tto mannayo',
    isEpisodeEnd: true,
    isGameEnd: true,
    episode: 5,
    next: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FREE ROAM DIALOGUES — Available anytime at locations
  // ═══════════════════════════════════════════════════════════════════════════

  free_jisu_chat: {
    id: 'free_jisu_chat',
    type: 'dialogue',
    speaker: 'jisu',
    korean: '오늘 뭐 마실래요? 새로운 메뉴도 있어요!',
    phonetic: 'Oneul mwo masillaeyo? Saeroun menyudo isseoyo!',
    highlightWords: ['마실래요', '메뉴'],
    emotion: 'cheerful',
    choices: [
      {
        id: 'free_jisu_coffee',
        text: 'Order coffee',
        korean: '커피 주세요!',
        phonetic: 'Keopi juseyo!',
        next: null,
        effects: { jisu: { friendship: 2 } },
      },
      {
        id: 'free_jisu_talk',
        text: 'Just chat',
        korean: '그냥 이야기하고 싶어요.',
        phonetic: 'Geunyang iyagihago sipeoyo.',
        next: null,
        effects: { jisu: { friendship: 3, trust: 2 } },
      },
    ],
  },

  free_minjun_chat: {
    id: 'free_minjun_chat',
    type: 'dialogue',
    speaker: 'minjun',
    korean: '또 왔네. 오늘은 뭐 하고 싶어?',
    phonetic: 'Tto wanne. Oneureun mwo hago sipeo?',
    emotion: 'casual',
    choices: [
      {
        id: 'free_minjun_music',
        text: 'Listen to music',
        korean: '음악 들려줘!',
        phonetic: 'Eumak deullyeojwo!',
        next: null,
        effects: { minjun: { friendship: 3 } },
      },
      {
        id: 'free_minjun_walk',
        text: 'Walk together',
        korean: '같이 걷자.',
        phonetic: 'Gachi geotja.',
        next: null,
        effects: { minjun: { friendship: 2, trust: 2 } },
      },
    ],
  },

  free_sua_chat: {
    id: 'free_sua_chat',
    type: 'dialogue',
    speaker: 'sua',
    korean: '오늘도 만났네요. 어디 가세요?',
    phonetic: 'Oneuldo mannanneyo. Eodi gaseyo?',
    highlightWords: ['어디'],
    emotion: 'shy',
    learnWords: ['v_where'],
    choices: [
      {
        id: 'free_sua_read',
        text: 'Read together',
        korean: '같이 읽을까요?',
        phonetic: 'Gachi ilgeulkkayo?',
        next: null,
        effects: { sua: { friendship: 3, trust: 3 } },
      },
      {
        id: 'free_sua_station',
        text: 'Ask about the next station',
        korean: '다음 역이 어디예요?',
        phonetic: 'Daeum yeogi eodiyeyo?',
        next: null,
        effects: { sua: { friendship: 2 } },
      },
    ],
  },

  free_haeun_chat: {
    id: 'free_haeun_chat',
    type: 'dialogue',
    speaker: 'haeun',
    korean: '열심히 하고 있구나. 잘하고 있어.',
    phonetic: 'Yeolsimhi hago itguna. Jalhago isseo.',
    emotion: 'approving',
    choices: [
      {
        id: 'free_haeun_advice',
        text: 'Ask for advice',
        korean: '사장님, 조언 해주세요.',
        phonetic: 'Sajangnim, joeon haejuseyo.',
        next: null,
        effects: { haeun: { friendship: 3, trust: 3 } },
      },
      {
        id: 'free_haeun_thanks',
        text: 'Thank her',
        korean: '감사합니다, 사장님.',
        phonetic: 'Gamsahamnida, sajangnim.',
        next: null,
        effects: { haeun: { friendship: 2 } },
      },
    ],
  },
};

// Get a dialogue node by ID
export function getDialogueNode(id) {
  return DIALOGUES[id] || null;
}

// Get the starting dialogue for an episode
export function getEpisodeStartDialogue(episodeNumber) {
  const starters = {
    1: 'ep1_cafe_enter',
    2: 'ep2_street_enter',
    3: 'ep3_subway_enter',
    4: 'ep4_cafe_revisit',
    5: 'ep5_dawn',
  };
  return starters[episodeNumber] || null;
}

// Get free roam dialogue for an NPC
export function getFreeRoamDialogue(npcId) {
  const freeDialogues = {
    jisu: 'free_jisu_chat',
    minjun: 'free_minjun_chat',
    sua: 'free_sua_chat',
    haeun: 'free_haeun_chat',
  };
  return freeDialogues[npcId] || null;
}
