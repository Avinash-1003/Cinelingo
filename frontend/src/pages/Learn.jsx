import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import VoicePicker from '../components/VoicePicker';
import { speakKorean } from '../utils/voice';

const API = 'http://localhost:8080';
const tok = () => localStorage.getItem('cinelingo_token') || '';
const hdr = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` });



function fuzzyMatch(spoken, target) {
    const s = spoken.trim().toLowerCase().replace(/[!?.]/g, '').replace(/\s+/g, ' ');
    const t = target.trim().toLowerCase().replace(/[!?.]/g, '').replace(/\s+/g, ' ');
    if (s === t || s.includes(t) || t.includes(s)) return true;
    const sW = s.split(' '), tW = t.split(' ');
    let m = 0;
    for (const sw of sW) if (tW.some(tw => tw.includes(sw) || sw.includes(tw))) m++;
    return m / Math.max(sW.length, tW.length) > 0.5;
}

const LEARN_STORAGE_KEY = 'cinelingo_learned_lines';

function loadLearnedFromStorage() {
    try {
        const s = localStorage.getItem(LEARN_STORAGE_KEY);
        return s ? new Set(JSON.parse(s)) : new Set();
    } catch { return new Set(); }
}

function saveLearnedToStorage(learnedSet) {
    localStorage.setItem(LEARN_STORAGE_KEY, JSON.stringify([...learnedSet]));
}

async function saveLearnedWord(userId, wordKey, korean, english, level) {
    try {
        await fetch(`${API}/api/learn/mark-learned`, {
            method: 'POST', headers: hdr(),
            body: JSON.stringify({ userId, wordKey, korean, english, level, learnedAt: new Date().toISOString() })
        });
    } catch {/* silent — offline ok */ }
}

async function fetchLearnedWords(userId) {
    try {
        const r = await fetch(`${API}/api/learn/learned/${userId}`, { headers: hdr() });
        if (!r.ok) return [];
        return await r.json();
    } catch { return []; }
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const BEGINNER_SCENES = [
    {
        id: 'b1', youtubeId: null, title: 'Arriving in Seoul', subtitle: 'First things to say when you land',
        themeIcon: '✈️', genre: 'Travel', levelColor: '#4ade80',
        context: 'You just landed at Incheon Airport and are meeting your Korean host for the first time.',
        lines: [
            { id: 1, korean: '안녕하세요! 만나서 반갑습니다.', romanization: 'an-nyeong-ha-se-yo! man-na-seo ban-gap-seum-ni-da', englishPronunciation: 'ahn-NYONG-hah-seh-yo! mahn-NAH-suh bahn-GAHP-seum-nee-da', english: 'Hello! Nice to meet you.', usage: 'Your very first greeting in Korea — slightly bow your head as you say it.', tip: 'Koreans greet with a slight bow (15°). The more you respect someone, the deeper you bow.', words: ['안녕하세요 — Hello', '반갑습니다 — Nice to meet you'], phrases: ['Formal greeting used with strangers', 'Always paired: Hello + Nice to meet you'], grammarNote: 'In Korean, "hello" literally means "Are you at peace?" — 안녕 (annyeong) = peace/wellbeing.' },
            { id: 2, korean: '저는 [이름]이에요. 잘 부탁드립니다.', romanization: 'jeo-neun [name]-i-e-yo. jal bu-tak-deu-rim-ni-da', englishPronunciation: 'JUH-neun [name]-ee-eh-yo. jahl boo-TAHK-duh-rim-nee-da', english: 'My name is [your name]. Please take care of me.', usage: 'The standard Korean self-introduction — always say both sentences together.', tip: '"Please take care of me" has no direct English translation. Koreans say it at the start of every new relationship.', words: ['저는 — I (humble)', '잘 부탁드립니다 — Please take care of me'], phrases: ['Standard self-introduction formula', '"Take care of me" = I hope we have a good relationship'], grammarNote: 'The humble "I" in Korean is 저 (jeo), not 나 (na). 저 is used with people you just met.' },
            { id: 3, korean: '감사합니다.', romanization: 'gam-sa-ham-ni-da', englishPronunciation: 'gahm-SAH-hahm-nee-da', english: 'Thank you very much.', usage: 'Formal thank you — use with anyone older or in a formal setting.', tip: 'Bow slightly when you say thank you in Korea. The deeper the bow, the more grateful you seem.', words: ['감사합니다 — Thank you (formal)'], phrases: ['감사합니다 is formal', '고마워요 (go-ma-wo-yo) is casual for friends'], grammarNote: '감사 (gam-sa) means gratitude. 합니다 is the formal verb ending.' },
            { id: 4, korean: '이해가 안 돼요. 천천히 말씀해 주세요.', romanization: 'i-hae-ga an-dwae-yo. cheon-cheon-hi mal-sseum-hae-ju-se-yo', englishPronunciation: 'ee-heh-GA ahn-DWEH-yo. chun-chun-HEE mahl-SSEUM-heh-joo-seh-yo', english: 'I do not understand. Please say it again slowly.', usage: 'When you are lost in conversation — Koreans are very patient with learners.', tip: 'Koreans will appreciate that you are trying. Never feel embarrassed to ask for repetition.', words: ['이해가 안 돼요 — I do not understand', '천천히 — slowly', '말씀해 주세요 — please say it'], phrases: ['이해가 안 돼요 = I do not understand', '천천히 = slowly'], grammarNote: '주세요 (ju-se-yo) = "please give me / please do for me" — attaches to any request.' },
            { id: 5, korean: '실례합니다. 화장실이 어디에요?', romanization: 'sil-lye-ham-ni-da. hwa-jang-sil-i eo-di-e-yo', englishPronunciation: 'shil-LEH-hahm-nee-da. hwa-JAHNG-shil-ee UH-dee-eh-yo', english: 'Excuse me. Where is the bathroom?', usage: 'Saying excuse me before any question is polite in Korean culture.', tip: 'In Korea, bathrooms are called 화장실 (hwa-jang-shil), literally "makeup room."', words: ['실례합니다 — Excuse me', '화장실 — bathroom', '어디에요 — where is it'], phrases: ['실례합니다 = Excuse me (formal)', '어디에요? = Where is it?'], grammarNote: '어디 (eo-di) = where. Add 예요/이에요 to make it a question: "Where is X?"' },
            { id: 6, korean: '안녕히 가세요!', romanization: 'an-nyeong-hi ga-se-yo', englishPronunciation: 'ahn-NYONG-hee gah-seh-yo', english: 'Goodbye! (said to the person leaving)', usage: 'Goodbye said by the person who stays. The person leaving says a different version.', tip: 'There are two different goodbyes in Korean: one for the person leaving and one for the person staying.', words: ['안녕히 — peacefully', '가세요 — please go'], phrases: ['안녕히 가세요 = said to the person LEAVING', '안녕히 계세요 = said by the person LEAVING'], grammarNote: '가세요 = please go. 계세요 = please stay. This difference is unique to Korean!' },
        ],
    },
    {
        id: 'b2', youtubeId: null, title: 'At a Korean Restaurant', subtitle: 'Order food without pointing in silence',
        themeIcon: '🍜', genre: 'Daily Life', levelColor: '#4ade80',
        context: 'You walk into a Korean restaurant. The waiter approaches your table.',
        lines: [
            { id: 1, korean: '메뉴 주세요.', romanization: 'me-nyu ju-se-yo', englishPronunciation: 'meh-NYOO joo-seh-yo', english: 'Menu please.', usage: 'The very first thing to say when you sit down at a Korean restaurant.', tip: 'Many Korean restaurants have picture menus. Point and say "this one please" if needed.', words: ['메뉴 — menu', '주세요 — please give me'], phrases: ['주세요 = please give me', 'Works for anything: water please, bill please, more please'], grammarNote: '주세요 (ju-se-yo) literally means "please give." Attach it after any noun to make a polite request.' },
            { id: 2, korean: '이거 주세요.', romanization: 'i-geo ju-se-yo', englishPronunciation: 'ee-GUH joo-seh-yo', english: 'This one please.', usage: 'Point at the menu item and say this — works in every restaurant, shop, and market.', tip: 'This is the most universal phrase in Korea. Point at anything and add 주세요.', words: ['이거 — this one', '주세요 — please give me'], phrases: ['이거 = this one', '저거 주세요 = that one please (for things farther away)'], grammarNote: '이거 (i-geo) = this. 저거 (jeo-geo) = that (far). 그거 (geu-geo) = that (near the other person).' },
            { id: 3, korean: '얼마예요?', romanization: 'eol-ma-ye-yo', englishPronunciation: 'UL-mah-yeh-yo', english: 'How much is it?', usage: 'Ask the price anywhere — restaurants, shops, markets, taxis.', tip: 'Korean prices seem large because 1,000 won is about 75 cents. Do not panic at the numbers!', words: ['얼마 — how much', '예요 — is it'], phrases: ['얼마예요? = how much is it?', 'Add any item before it: "coffee 얼마예요?"'], grammarNote: '얼마 (eol-ma) = how much. Add 예요? to turn any word into a polite question.' },
            { id: 4, korean: '맛있어요!', romanization: 'ma-si-sseo-yo', englishPronunciation: 'mah-SHEE-ssuh-yo', english: 'It is delicious!', usage: 'Compliment the food — Korean cooks love hearing this. Say it genuinely.', tip: 'Saying "delicious" to a Korean host is one of the highest compliments. Their face will light up.', words: ['맛있어요 — delicious'], phrases: ['맛있어요 = it is delicious', '맛없어요 = it does not taste good (use carefully!)'], grammarNote: '맛 (mat) = taste/flavor. 있어요 = there is / it has. Together: "it has taste" = delicious!' },
            { id: 5, korean: '물 한 잔 더 주세요.', romanization: 'mul han jan deo ju-se-yo', englishPronunciation: 'mool hahn jahn DUH joo-seh-yo', english: 'One more glass of water please.', usage: 'Water refills are free in almost every Korean restaurant. Just ask!', tip: 'In Korea, water is always provided free. You can ask for refills as many times as you like.', words: ['물 — water', '한 잔 — one glass', '더 — more', '주세요 — please give me'], phrases: ['물 = water', '더 = more', '더 주세요 = more please (works for any item)'], grammarNote: '한 잔 (han jan) = one glass. 잔 is the counter word for glasses/cups in Korean.' },
            { id: 6, korean: '매워요?', romanization: 'mae-wo-yo', englishPronunciation: 'meh-WO-yo', english: 'Is it spicy?', usage: 'Korean food can be very spicy — always ask before ordering if you are sensitive.', tip: 'Korean spicy (매워요) is different from other Asian spicy. Even "mild" can be hot for newcomers!', words: ['매워요 — is it spicy'], phrases: ['매워요? = is it spicy?', '안 매워요? = is it not spicy?'], grammarNote: '안 (an) placed before any verb/adjective makes it negative: 안 매워요 = not spicy.' },
            { id: 7, korean: '계산해 주세요.', romanization: 'gye-san-hae ju-se-yo', englishPronunciation: 'gyeh-SAHN-heh joo-seh-yo', english: 'The bill please.', usage: 'Ask for the check when done eating. In Korea, you usually pay at the counter, not the table.', tip: 'Most Korean restaurants have you pay at the front register, not at your table.', words: ['계산 — calculation/bill', '해 주세요 — please do it for me'], phrases: ['계산 = calculation / bill', '해 주세요 = please do X for me'], grammarNote: '해 주세요 (hae ju-se-yo) = please do it for me. Attaches after any action verb.' },
        ],
    },
    {
        id: 'b3', youtubeId: null, title: 'Shopping at Myeongdong', subtitle: 'Buy things and bargain like a local',
        themeIcon: '🛍️', genre: 'Daily Life', levelColor: '#4ade80',
        context: "You are at the famous Myeongdong outdoor market in Seoul. Stalls everywhere, vendors calling out.",
        lines: [
            { id: 1, korean: '이거 얼마예요?', romanization: 'i-geo eol-ma-ye-yo', englishPronunciation: 'ee-GUH ul-MAH-yeh-yo', english: 'How much is this?', usage: 'Point at any item and say this — works at every market and shop in Korea.', tip: 'At Myeongdong outdoor stalls, prices are often negotiable. Start with this phrase.', words: ['이거 — this one', '얼마예요 — how much is it'], phrases: ['이거 얼마예요? = how much is this one?', 'Point and ask — works anywhere'], grammarNote: 'Combining 이거 (this) + 얼마 (how much) + 예요? (is it?) = the most useful shopping sentence.' },
            { id: 2, korean: '너무 비싸요.', romanization: 'neo-mu bi-ssa-yo', englishPronunciation: 'NUH-moo bee-SSA-yo', english: 'It is too expensive.', usage: 'The opening move in any price negotiation at a traditional Korean market.', tip: 'This phrase signals you want to bargain. The vendor expects it at outdoor markets.', words: ['너무 — too much', '비싸요 — it is expensive'], phrases: ['너무 = too much / so much', '너무 비싸요 = it is too expensive'], grammarNote: '너무 (neo-mu) intensifies: 너무 좋아요 = so good! 너무 매워요 = way too spicy!' },
            { id: 3, korean: '좀 깎아 주세요.', romanization: 'jom kka-kka ju-se-yo', englishPronunciation: 'jom KA-ka joo-seh-yo', english: 'Please give me a discount.', usage: 'The magic bargaining phrase. Use it with a smile at traditional outdoor markets.', tip: 'Only works at traditional markets (시장), NOT in department stores or convenience stores.', words: ['좀 — a little', '깎아 — cut the price', '주세요 — please give me'], phrases: ['좀 = a little / please (makes requests softer)', '깎아 주세요 = please cut the price'], grammarNote: '좀 (jom) before a request softens it. 좀 도와주세요 = please help me a little.' },
            { id: 4, korean: '다른 색 있어요?', romanization: 'da-reun saek i-sseo-yo', englishPronunciation: 'DAH-reun sek ee-SSUH-yo', english: 'Do you have another color?', usage: 'Ask for different color options when shopping for clothes or accessories.', tip: 'Korean fashion is very color-aware. Most items come in multiple colors — just ask!', words: ['다른 — different', '색 — color', '있어요 — do you have'], phrases: ['다른 = different / another', '있어요? = do you have? / is there?'], grammarNote: '있어요? (i-sseo-yo?) at the end of any noun = "do you have X?" or "is there X?"' },
            { id: 5, korean: '카드 돼요?', romanization: 'ka-deu dwae-yo', englishPronunciation: 'KAH-duh dweh-yo', english: 'Is card payment okay?', usage: 'Ask if they accept credit or debit cards before paying.', tip: 'Korea is extremely card-friendly. Almost everywhere accepts cards. Small outdoor stalls may be cash-only.', words: ['카드 — card', '돼요 — is it okay'], phrases: ['카드 = card', '돼요? = is it okay? / does it work?', '현금 = cash'], grammarNote: '돼요? (dwae-yo?) = "is it okay?" Versatile: 지금 돼요? = is now okay? 환불 돼요? = is refund okay?' },
        ],
    },
    {
        id: 'b4', youtubeId: null, title: 'Getting Around Seoul', subtitle: 'Subways, taxis, and asking directions',
        themeIcon: '🚇', genre: 'Travel', levelColor: '#4ade80',
        context: 'You are trying to get from Hongdae to Gangnam on the Seoul Metro. You need help.',
        lines: [
            { id: 1, korean: '지하철역이 어디예요?', romanization: 'ji-ha-cheol-yeok-i eo-di-ye-yo', englishPronunciation: 'jee-ha-CHUL-yuk-ee UH-dee-yeh-yo', english: 'Where is the subway station?', usage: 'Essential phrase for any Korean city.', tip: "Seoul's subway has 9 lines, is very safe, and all signs are in Korean AND English.", words: ['지하철 — subway', '역 — station', '어디예요 — where is it'], phrases: ['지하철 = subway', '역 = station', '어디예요? = where is it?'], grammarNote: 'Korean sentences end with the verb. "Subway station where is?" not "Where is subway station?"' },
            { id: 2, korean: '왼쪽으로 가세요.', romanization: 'oen-jjok-eu-ro ga-se-yo', englishPronunciation: 'wen-JJOK-eu-ro GAH-seh-yo', english: 'Go to the left.', usage: 'For giving or receiving directions anywhere in Korea.', tip: 'Koreans also use landmark-based directions: "Go past the convenience store, turn at the pharmacy."', words: ['왼쪽 — left', '으로 — towards', '가세요 — please go'], phrases: ['왼쪽 = left', '오른쪽 = right', '직진 = straight ahead', '뒤 = behind'], grammarNote: '으로 (eu-ro) = towards / in the direction of. 왼쪽으로 = towards the left.' },
            { id: 3, korean: '얼마나 걸려요?', romanization: 'eol-ma-na geol-lyeo-yo', englishPronunciation: 'ul-MAH-nah gul-LYUH-yo', english: 'How long does it take?', usage: 'Ask travel time before getting in a taxi or planning your route.', tip: 'Taxis in Korea use a meter. Knowing the time helps you estimate the fare (starting at about 3,800 won).', words: ['얼마나 — how long', '걸려요 — does it take'], phrases: ['얼마나 = how much / how long', '걸려요? = does it take?', '분 = minute, 시간 = hour'], grammarNote: '걸리다 (geol-li-da) means "to take time." 10분 걸려요 = it takes 10 minutes.' },
            { id: 4, korean: '택시 타고 갈까요?', romanization: 'taek-si ta-go gal-kka-yo', englishPronunciation: 'tek-SEE tah-go gahl-KAH-yo', english: 'Shall we take a taxi?', usage: 'Suggesting taxi as a transport option to someone you are with.', tip: "Kakao Taxi is South Korea's Uber. Download it before you arrive — you can pay by card.", words: ['택시 — taxi', '타고 — riding', '갈까요 — shall we go'], phrases: ['~고 갈까요? = shall we go by X?', '갈까요? = shall we go?'], grammarNote: '~ㄹ까요? (l-kka-yo?) at the end of a verb = "shall we...?" or "should we...?"' },
        ],
    },
    {
        id: 'b5', youtubeId: null, title: 'At a Korean Café', subtitle: 'Order coffee like a Seoul local',
        themeIcon: '☕', genre: 'Daily Life', levelColor: '#4ade80',
        context: 'You walk into a trendy café in Hongdae. There are 20 kinds of coffee on the menu.',
        lines: [
            { id: 1, korean: '아이스 아메리카노 하나 주세요.', romanization: 'a-i-seu a-me-ri-ka-no ha-na ju-se-yo', englishPronunciation: 'AH-ee-seu ah-meh-REE-ka-no HAH-nah joo-seh-yo', english: 'One iced americano please.', usage: "The most ordered drink in all of Korea — iced americano is a cultural institution.", tip: 'Korea has more coffee shops per capita than almost any country. Iced americano is what most Koreans drink daily.', words: ['아이스 — iced', '아메리카노 — americano', '하나 — one', '주세요 — please give me'], phrases: ['아이스 = iced/cold', '하나 = one (native Korean number)'], grammarNote: 'Korean numbers: 하나 (1), 둘 (2), 셋 (3), 넷 (4), 다섯 (5) — use these for counting items.' },
            { id: 2, korean: '따뜻한 라떼 주세요.', romanization: 'dda-ddeu-tan ra-tte ju-se-yo', englishPronunciation: 'DDA-duh-tahn rah-TEH joo-seh-yo', english: 'A hot latte please.', usage: 'Order any hot drink by putting the temperature word first.', tip: 'Hot drinks are called 따뜻한 (warm/hot). Cold drinks: 아이스 (iced) or 차가운 (cold).', words: ['따뜻한 — hot/warm', '라떼 — latte', '주세요 — please give me'], phrases: ['따뜻한 = hot/warm (placed before the drink)', '아이스 = iced (placed before the drink)'], grammarNote: 'Adjectives come BEFORE the noun in Korean: 따뜻한 라떼 (hot latte), not "라떼 따뜻한."' },
            { id: 3, korean: '테이크아웃이에요.', romanization: 'te-i-keu-a-ut-i-e-yo', englishPronunciation: 'teh-ee-kuh-ah-OOT-ee-eh-yo', english: "It is for takeout.", usage: "Tell the barista you want it to go. They will always ask if you are eating in or taking out.", tip: 'The barista will ask: "여기서 드세요?" (eating here?) Just say this phrase for takeout.', words: ['테이크아웃 — takeout', '이에요 — it is'], phrases: ['테이크아웃 = takeout / to go', '이에요/예요 = it is (polite)'], grammarNote: '이에요 attaches after consonants. 예요 attaches after vowels. Both mean "it is."' },
            { id: 4, korean: '설탕 빼 주세요.', romanization: 'seol-tang bbae ju-se-yo', englishPronunciation: 'sul-TANG bbeh joo-seh-yo', english: 'Please leave out the sugar.', usage: 'Customize your drink by removing ingredients.', tip: 'Many Korean cafés add syrup automatically. Say this to avoid extra sugar.', words: ['설탕 — sugar', '빼 주세요 — please take out'], phrases: ['빼다 = to remove/take out', '빼 주세요 = please take out / please remove', '설탕 = sugar, 시럽 = syrup'], grammarNote: 'Add 빼 주세요 after any ingredient to remove it: 설탕 빼 주세요, 시럽 빼 주세요.' },
        ],
    },

    // ── NEW BEGINNER SCENES ──────────────────────────────────────────────────

    {
        id: 'b6', youtubeId: null, title: 'At a Convenience Store', subtitle: 'GS25, CU, 7-Eleven — survive without a word of English',
        themeIcon: '🏪', genre: 'Daily Life', levelColor: '#4ade80',
        context: "You walk into a GS25 convenience store. You want snacks, a T-Money top-up, and a warm meal from the counter.",
        lines: [
            { id: 1, korean: '이거 데워 주세요.', romanization: 'i-geo de-wo ju-se-yo', englishPronunciation: 'ee-GUH deh-WO joo-seh-yo', english: 'Please heat this up for me.', usage: 'Ask the staff to microwave your cup noodles or ready meal at the counter.', tip: 'All Korean convenience stores have microwaves and boiling water dispensers for instant noodles. Just ask!', words: ['이거 — this', '데워 주세요 — please heat'], phrases: ['데우다 = to heat up', '이거 데워 주세요 = please heat this up for me'], grammarNote: '데워 주세요 = please heat it. The ~아/어 주세요 pattern turns any verb into a polite request.' },
            { id: 2, korean: '티머니 충전해 주세요. 만 원이요.', romanization: 'ti-meo-ni chung-jeon-hae ju-se-yo. man wo-ni-yo', englishPronunciation: 'TEE-muh-nee choong-JUN-heh joo-seh-yo. mahn WON-ee-yo', english: 'Please top up my T-Money. Ten thousand won.', usage: 'Top up your transit card at any convenience store counter.', tip: 'T-Money is the Seoul transit card — used for subway, buses, and even some taxis. Top it up at any convenience store.', words: ['티머니 — T-Money card', '충전 — top up / charge', '만 원 — 10,000 won'], phrases: ['충전해 주세요 = please charge/top up', '만 원 = 10,000 won (mahn won)'], grammarNote: 'Numbers + 이요 is how you naturally state amounts in Korean: 만 원이요 = ten thousand won.' },
            { id: 3, korean: '봉투 주세요.', romanization: 'bong-tu ju-se-yo', englishPronunciation: 'bong-TOO joo-seh-yo', english: 'A bag please.', usage: 'Ask for a plastic bag. They are not automatically given — you must request one.', tip: 'In Korea, plastic bags cost money (about 50 won). If you have a lot of items, always ask.', words: ['봉투 — bag', '주세요 — please give me'], phrases: ['봉투 = plastic bag', '영수증 주세요 = receipt please'], grammarNote: '봉투 (bong-tu) = bag. 영수증 (yeong-su-jeung) = receipt. Both + 주세요 for polite requests.' },
            { id: 4, korean: '포인트 있어요?', romanization: 'po-in-teu i-sseo-yo', englishPronunciation: 'POH-in-tuh ee-SSUH-yo', english: 'Do you have a points card?', usage: 'The cashier will ask if you have a loyalty card. If not, say 없어요 (no, I don\'t have one).', tip: 'Korean convenience stores all have loyalty apps. Download the GS25 or CU app to collect points.', words: ['포인트 — points', '있어요 — do you have'], phrases: ['포인트 있어요? = do you have points?', '없어요 = I don\'t have / no'], grammarNote: '있어요? = do you have? 없어요 = I don\'t have it. These two words are essential everywhere.' },
            { id: 5, korean: '영수증 괜찮아요.', romanization: 'yeong-su-jeung gwaen-cha-na-yo', englishPronunciation: 'yung-SOO-juhng gwen-CHAH-nah-yo', english: 'Receipt is fine / No need for a receipt.', usage: 'Tell the cashier you don\'t need a printed receipt — they always ask.', tip: 'Cashiers in Korea will ask 영수증 드릴까요? (shall I give you a receipt?). This is how to decline politely.', words: ['영수증 — receipt', '괜찮아요 — it\'s okay / no need'], phrases: ['괜찮아요 = it\'s okay / I\'m fine / no need', '영수증 = receipt'], grammarNote: '괜찮아요 (gwaen-cha-na-yo) = "it\'s okay / I\'m fine." One of the most useful words in Korean.' },
        ],
    },
    {
        id: 'b7', youtubeId: null, title: 'At the Hotel Check-in', subtitle: 'Getting your room key and everything you need',
        themeIcon: '🏨', genre: 'Travel', levelColor: '#4ade80',
        context: 'You arrive at your hotel in Seoul late at night. The receptionist greets you.',
        lines: [
            { id: 1, korean: '예약했어요. 홍길동이에요.', romanization: 'ye-yak-hae-sseo-yo. Hong Gil-dong-i-e-yo', englishPronunciation: 'yeh-YAHK-heh-SSUH-yo. Hong Gil-DONG-ee-eh-yo', english: 'I have a reservation. I am Hong Gil-dong.', usage: 'The very first thing to say at hotel check-in. State your reservation and name.', tip: 'Say 예약 (reservation) first — hotel staff will know exactly what you need before you finish the sentence.', words: ['예약했어요 — I made a reservation', '이에요 — I am'], phrases: ['예약했어요 = I have a reservation', '이름이 뭐예요? = What is your name?'], grammarNote: '했어요 = past tense of 하다 (to do). 예약했어요 = I did a reservation = I have a reservation.' },
            { id: 2, korean: '체크아웃이 몇 시예요?', romanization: 'che-keu-a-ut-i myeot si-ye-yo', englishPronunciation: 'cheh-kuh-ah-OOT-ee myut SHEE-yeh-yo', english: 'What time is checkout?', usage: 'Ask about checkout time when you check in so you can plan your morning.', tip: 'Standard checkout in Korean hotels is 11 AM or noon. Some places allow late checkout for a fee.', words: ['체크아웃 — checkout', '몇 시 — what time', '예요 — is it'], phrases: ['몇 시예요? = What time is it?', '체크아웃 = checkout'], grammarNote: '몇 시 (myeot si) = what time. Add 예요? to ask: 몇 시예요? = What time is it?' },
            { id: 3, korean: '와이파이 비밀번호가 뭐예요?', romanization: 'wa-i-pa-i bi-mil-beon-ho-ga mwo-ye-yo', englishPronunciation: 'WAH-ee-pah-ee bee-MIL-bun-hoh-gah mwuh-YEH-yo', english: 'What is the Wi-Fi password?', usage: 'Ask for the Wi-Fi password — always needed as soon as you get to your room.', tip: 'Korean hotels almost always have fast, free Wi-Fi. This is one of the first things to ask.', words: ['와이파이 — Wi-Fi', '비밀번호 — password', '뭐예요 — what is it'], phrases: ['비밀번호 = password', '뭐예요? = what is it?'], grammarNote: '뭐예요? (mwuh-yeh-yo?) = "what is it?" Attach after any noun to ask what something is.' },
            { id: 4, korean: '수건 더 주세요.', romanization: 'su-geon deo ju-se-yo', englishPronunciation: 'soo-GUN duh joo-seh-yo', english: 'More towels please.', usage: 'Request extra towels from hotel staff.', tip: 'In Korean hotels, you can request pretty much anything by saying the item + 더 주세요.', words: ['수건 — towel', '더 — more', '주세요 — please give me'], phrases: ['더 주세요 = more please', '수건 = towel, 베개 = pillow, 담요 = blanket'], grammarNote: '더 주세요 = "more please." Works for anything: 베개 더 주세요 = more pillows please.' },
            { id: 5, korean: '방이 너무 추워요.', romanization: 'bang-i neo-mu chu-wo-yo', englishPronunciation: 'bahng-ee NUH-moo choo-WO-yo', english: 'The room is too cold.', usage: 'Report that your room temperature is uncomfortable.', tip: 'Korean hotel rooms often have powerful air conditioning. Don\'t suffer — just call the front desk.', words: ['방 — room', '너무 — too', '추워요 — cold'], phrases: ['너무 추워요 = too cold', '너무 더워요 = too hot', '방 = room'], grammarNote: '너무 = too/so. 추워요 = cold. 더워요 = hot. Add 너무 before any adjective to say "too much."' },
            { id: 6, korean: '짐 맡아 주세요.', romanization: 'jim mat-a ju-se-yo', englishPronunciation: 'jim MAH-tah joo-seh-yo', english: 'Please keep my luggage.', usage: 'Ask the hotel to store your bags after checkout while you explore the city.', tip: 'Most Korean hotels offer free luggage storage on checkout day. Always ask!', words: ['짐 — luggage/bags', '맡아 주세요 — please keep/hold'], phrases: ['짐 = luggage / bags', '맡기다 = to entrust / to store', '맡아 주세요 = please hold it for me'], grammarNote: '맡기다 (mat-gi-da) = to leave something in someone\'s care. 맡아 주세요 = please take care of this.' },
        ],
    },
    {
        id: 'b8', youtubeId: null, title: 'At a Pharmacy', subtitle: 'Tell them what hurts in simple Korean',
        themeIcon: '💊', genre: 'Emergency', levelColor: '#4ade80',
        context: 'You wake up in Seoul with a headache and upset stomach. You find the nearest 약국 (pharmacy).',
        lines: [
            { id: 1, korean: '두통약 주세요.', romanization: 'du-tong-yak ju-se-yo', englishPronunciation: 'DOO-tong-yahk joo-seh-yo', english: 'Headache medicine please.', usage: 'Ask for the specific type of medicine you need by saying the ailment + 약 (medicine).', tip: 'Korean pharmacies are everywhere and pharmacists are very helpful. No prescription needed for basic medicine.', words: ['두통 — headache', '약 — medicine', '주세요 — please give me'], phrases: ['두통약 = headache medicine', '소화제 = digestive medicine', '감기약 = cold medicine'], grammarNote: 'Adding 약 (yahk) after any illness = that illness\'s medicine. 두통약 = headache medicine.' },
            { id: 2, korean: '배가 아파요.', romanization: 'bae-ga a-pa-yo', englishPronunciation: 'BEH-gah ah-PAH-yo', english: 'My stomach hurts.', usage: 'Tell the pharmacist where you are in pain so they can help you.', tip: 'Korean pharmacists are highly trained and can recommend OTC medicines for most common ailments.', words: ['배 — stomach', '아파요 — hurts / I am in pain'], phrases: ['아파요 = it hurts / I am in pain', '배 = stomach, 머리 = head, 목 = throat'], grammarNote: 'Body part + 가 아파요 = [body part] hurts. 머리가 아파요 = my head hurts. 목이 아파요 = my throat hurts.' },
            { id: 3, korean: '열이 있어요.', romanization: 'yeol-i i-sseo-yo', englishPronunciation: 'yul-ee ee-SSUH-yo', english: 'I have a fever.', usage: 'Report symptoms to a pharmacist or doctor. This triggers them to check your temperature.', tip: 'Korean pharmacies have digital thermometers. The pharmacist will offer to check your temperature.', words: ['열 — fever', '있어요 — I have'], phrases: ['열이 있어요 = I have a fever', '열이 없어요 = I don\'t have a fever'], grammarNote: '있어요 = "there is / I have." 없어요 = "there isn\'t / I don\'t have." Two essential opposites.' },
            { id: 4, korean: '하루에 몇 번 먹어요?', romanization: 'ha-ru-e myeot beon meog-eo-yo', englishPronunciation: 'hah-ROO-eh myut bun muh-GUH-yo', english: 'How many times a day do I take it?', usage: 'Ask about dosage instructions for your medicine.', tip: 'Korean medicine boxes often have instructions in Korean only. Always ask the pharmacist directly.', words: ['하루에 — per day', '몇 번 — how many times', '먹어요 — do I eat/take'], phrases: ['하루에 = per day', '몇 번 = how many times', '먹어요 = eat / take (medicine)'], grammarNote: 'In Korean, you "eat" medicine: 약을 먹어요 = I take medicine (literally "eat medicine").' },
            { id: 5, korean: '알레르기 있어요.', romanization: 'al-le-reugi i-sseo-yo', englishPronunciation: 'ahl-leh-REU-gee ee-SSUH-yo', english: 'I have an allergy.', usage: 'Alert the pharmacist to any allergies before they recommend medication.', tip: 'Always mention allergies, especially to penicillin, aspirin, or any specific ingredient.', words: ['알레르기 — allergy', '있어요 — I have'], phrases: ['알레르기 있어요 = I have an allergy', '페니실린 알레르기 = penicillin allergy'], grammarNote: 'To say what you\'re allergic to: [allergen] + 알레르기 있어요. 페니실린 알레르기 있어요 = I have a penicillin allergy.' },
        ],
    },
    {
        id: 'b9', youtubeId: null, title: 'At a Noraebang (Karaoke)', subtitle: 'Book a room and enjoy Seoul\'s favourite night out',
        themeIcon: '🎤', genre: 'Nightlife', levelColor: '#4ade80',
        context: 'It\'s 10 PM and your Korean friends want to go to noraebang. You walk up to the counter to book a room.',
        lines: [
            { id: 1, korean: '방 있어요?', romanization: 'bang i-sseo-yo', englishPronunciation: 'bahng ee-SSUH-yo', english: 'Do you have a room available?', usage: 'The first thing you ask at any noraebang, PC café, or study room.', tip: 'Noraebangs are private karaoke rooms — not public singing like in Western karaoke bars. Much more fun!', words: ['방 — room', '있어요 — do you have'], phrases: ['방 있어요? = do you have a room?', '몇 명이요? = how many people? (staff will ask)'], grammarNote: '있어요? = "is there? / do you have?" The simplest way to ask for availability in Korean.' },
            { id: 2, korean: '세 명이요.', romanization: 'se myeong-i-yo', englishPronunciation: 'seh MYUNG-ee-yo', english: 'Three people.', usage: 'Tell the staff how many people are in your group when booking any room-based service.', tip: 'Staff will ask 몇 명이요? (how many people?). Know your Korean numbers 1-10 before you go.', words: ['세 — three', '명 — people (counter)', '이요 — it is'], phrases: ['세 명 = three people', '명 = counter for people: 한 명, 두 명, 세 명...'], grammarNote: '명 (myeong) is the counter for people. 한 명 (1), 두 명 (2), 세 명 (3), 네 명 (4), 다섯 명 (5).' },
            { id: 3, korean: '한 시간 주세요.', romanization: 'han si-gan ju-se-yo', englishPronunciation: 'hahn shee-GAN joo-seh-yo', english: 'One hour please.', usage: 'Request the amount of time you want in a room-based service.', tip: 'Noraebang is usually charged by the hour. Add time easily by saying 한 시간 더 주세요 (one more hour).', words: ['한 시간 — one hour', '주세요 — please give me'], phrases: ['한 시간 = one hour', '두 시간 = two hours', '더 주세요 = more please'], grammarNote: '시간 (si-gan) = hour. 분 (bun) = minute. 한 시간 반 = one and a half hours.' },
            { id: 4, korean: '탬버린 있어요?', romanization: 'taem-beo-rin i-sseo-yo', englishPronunciation: 'tem-BUH-rin ee-SSUH-yo', english: 'Do you have a tambourine?', usage: 'Ask for noraebang extras — tambourines, maracas, and extra microphones are usually available.', tip: 'Korean noraebangs often have fun extras: tambourines, maracas, and even wigs. Just ask at the counter!', words: ['탬버린 — tambourine', '있어요 — do you have'], phrases: ['있어요? = do you have?', '마이크 = microphone, 탬버린 = tambourine'], grammarNote: 'Item + 있어요? = "do you have [item]?" Works everywhere: 영어 메뉴 있어요? = do you have an English menu?' },
            { id: 5, korean: '시간 연장해 주세요.', romanization: 'si-gan yeon-jang-hae ju-se-yo', englishPronunciation: 'shee-GAN yun-JAHNG-heh joo-seh-yo', english: 'Please extend our time.', usage: 'Ask to add more time when your noraebang session is ending.', tip: 'You can extend your time in 30-minute or 1-hour increments. Staff usually knock on the door to warn you.', words: ['시간 — time', '연장 — extension', '해 주세요 — please do'], phrases: ['연장해 주세요 = please extend', '시간 연장 = time extension'], grammarNote: '해 주세요 = please do X for me. Attach after any noun/verb: 연장해 주세요, 취소해 주세요 (please cancel).' },
        ],
    },
    {
        id: 'b10', youtubeId: null, title: 'Asking for Help on the Street', subtitle: 'When you\'re completely lost in Seoul',
        themeIcon: '🗺️', genre: 'Emergency', levelColor: '#4ade80',
        context: 'You are in Insadong and your phone battery is dead. You have no idea where you are. You need to find your hotel.',
        lines: [
            { id: 1, korean: '저 좀 도와주세요!', romanization: 'jeo jom do-wa-ju-se-yo', englishPronunciation: 'JUH jom doh-WAH-joo-seh-yo', english: 'Please help me!', usage: 'The essential distress phrase. Say it loudly and clearly to get someone\'s attention.', tip: 'Koreans are generally very willing to help lost tourists. Do not be afraid to ask strangers.', words: ['저 — I / me', '좀 — a little / please', '도와주세요 — please help me'], phrases: ['도와주세요 = please help me (urgent)', '도움이 필요해요 = I need help'], grammarNote: '도와주세요 combines 돕다 (to help) + 주세요 (please do for me). Very commonly used in emergencies.' },
            { id: 2, korean: '길을 잃어버렸어요.', romanization: 'gi-reul il-eo-beo-ryeo-sseo-yo', englishPronunciation: 'GEE-reul il-uh-buh-RYUH-ssuh-yo', english: 'I am lost.', usage: 'Tell someone you have lost your way so they understand the situation immediately.', tip: 'Point to your phone or a map when you say this — visual aids help enormously when language barriers exist.', words: ['길 — road / way', '잃어버렸어요 — I have lost'], phrases: ['길을 잃어버렸어요 = I got lost', '길을 모르겠어요 = I don\'t know the way'], grammarNote: '잃어버리다 = to lose something. 잃어버렸어요 = I lost it (past tense). Very useful verb pattern!' },
            { id: 3, korean: '여기가 어디예요?', romanization: 'yeo-gi-ga eo-di-ye-yo', englishPronunciation: 'YUH-gee-gah UH-dee-yeh-yo', english: 'Where is this place?', usage: 'Ask where you currently are — essential when you have no phone signal or map.', tip: 'Show the person your hotel\'s name written down or on a card — this will help them direct you.', words: ['여기 — here', '어디예요 — where is'], phrases: ['여기가 어디예요? = where is this place?', '여기 = here, 저기 = over there'], grammarNote: '여기 (yeo-gi) = here. 거기 = there. 저기 = over there. Three location words you must know.' },
            { id: 4, korean: '이 주소로 어떻게 가요?', romanization: 'i ju-so-ro eo-tteo-ke ga-yo', englishPronunciation: 'ee JOO-so-ro UH-duh-keh GAH-yo', english: 'How do I get to this address?', usage: 'Show your hotel address or destination on paper and ask this to get directions.', tip: 'Always carry your hotel\'s address in Korean. Korean locals cannot help without the Korean address.', words: ['이 주소 — this address', '어떻게 — how', '가요 — do I go'], phrases: ['어떻게 가요? = how do I go? / how do I get there?', '주소 = address'], grammarNote: '어떻게 (uh-dduh-keh) = how. 어떻게 가요? = how do I go? 어떻게 해요? = how do I do it?' },
            { id: 5, korean: '영어 할 줄 아세요?', romanization: 'yeong-eo hal jul a-se-yo', englishPronunciation: 'yung-UH hahl jool ah-SEH-yo', english: 'Do you know how to speak English?', usage: 'Ask politely if the person can switch to English to help you.', tip: 'Many young Koreans in Seoul speak some English. Ask politely — older Koreans likely won\'t speak English.', words: ['영어 — English', '할 줄 아세요 — do you know how to speak'], phrases: ['영어 = English', '할 줄 알아요 = I know how to do', '~할 줄 아세요? = do you know how to do?'], grammarNote: '~ㄹ 줄 알다 = to know how to do. 한국어 할 줄 알아요? = do you know how to speak Korean?' },
            { id: 6, korean: '경찰서가 어디예요?', romanization: 'gyeong-chal-seo-ga eo-di-ye-yo', englishPronunciation: 'gyung-CHAL-suh-gah UH-dee-yeh-yo', english: 'Where is the police station?', usage: 'A critical emergency phrase if you need to report something or get help.', tip: 'Korean police stations (파출소 or 경찰서) are everywhere in Seoul. Officers are helpful to tourists.', words: ['경찰서 — police station', '어디예요 — where is'], phrases: ['경찰서 = police station', '병원 = hospital, 대사관 = embassy'], grammarNote: 'Replace 경찰서 with any building type: 병원이 어디예요? = where is the hospital?' },
        ],
    },
    {
        id: 'b11', youtubeId: null, title: 'Using Public Transport', subtitle: 'Buses, T-Money cards, and transfer gates',
        themeIcon: '🚌', genre: 'Travel', levelColor: '#4ade80',
        context: 'You need to take a bus from Hongdae to a museum. This is your first time using Seoul\'s bus system.',
        lines: [
            { id: 1, korean: '이 버스 명동 가요?', romanization: 'i beo-seu myeong-dong ga-yo', englishPronunciation: 'ee BUH-seu MYUNG-dong GAH-yo', english: 'Does this bus go to Myeongdong?', usage: 'Before boarding any bus, confirm its destination with a fellow passenger or the driver.', tip: 'Seoul buses are color-coded: Blue = trunk routes, Green = local, Red = express, Yellow = circular.', words: ['이 버스 — this bus', '명동 — Myeongdong', '가요 — does it go'], phrases: ['~가요? = does it go to ~?', '이 버스 = this bus'], grammarNote: 'Destination + 가요? = "does it go to [place]?" 공항 가요? = does it go to the airport?' },
            { id: 2, korean: '다음 역이 어디예요?', romanization: 'da-eum yeok-i eo-di-ye-yo', englishPronunciation: 'DAH-eum yuk-ee UH-dee-yeh-yo', english: 'What is the next station?', usage: 'Ask a fellow passenger which stop is coming next when you are unsure.', tip: 'Seoul Metro announces every stop in Korean, English, Chinese, and Japanese. Listen for your stop name!', words: ['다음 — next', '역 — station', '어디예요 — where is / what is'], phrases: ['다음 = next', '역 = station', '다음 역 = next station'], grammarNote: '다음 (da-eum) = next. 이전 (i-jeon) = previous. 마지막 (ma-ji-mak) = last/final.' },
            { id: 3, korean: '내려 주세요.', romanization: 'nae-ryeo ju-se-yo', englishPronunciation: 'neh-RYUH joo-seh-yo', english: 'Please let me off here.', usage: 'Tell the bus driver you want to get off at the next stop.', tip: 'On Seoul buses, press the stop button before your stop AND say this if the driver seems to be passing it.', words: ['내려 — let off / get off', '주세요 — please'], phrases: ['내려 주세요 = please let me off', '내리다 = to get off / descend'], grammarNote: '내리다 = to get off (transport). 타다 = to get on (transport). 타 주세요 = please pick me up.' },
            { id: 4, korean: '환승이 되나요?', romanization: 'hwan-seung-i doe-na-yo', englishPronunciation: 'hwahn-SEUNG-ee dweh-NAH-yo', english: 'Is a transfer available?', usage: 'Ask if you can transfer to another bus or subway line without paying again.', tip: 'Seoul\'s transfer system is one of the best in the world — transferring within 30 minutes is usually FREE with T-Money.', words: ['환승 — transfer', '되나요 — is it possible'], phrases: ['환승 = transfer', '환승 되나요? = is transfer possible?'], grammarNote: '되나요? = "is it possible? / does it work?" A polite version of 돼요? Used to ask about policies.' },
            { id: 5, korean: '막차가 몇 시예요?', romanization: 'mak-cha-ga myeot si-ye-yo', englishPronunciation: 'mak-CHAH-gah myut SHEE-yeh-yo', english: 'What time is the last train?', usage: 'Check when the last subway or bus leaves — crucial for late nights out in Seoul.', tip: 'Seoul Metro last train is usually around midnight. After that, night buses (올빼미 버스) run all night.', words: ['막차 — last train/bus', '몇 시 — what time', '예요 — is it'], phrases: ['막차 = last train/bus', '첫차 = first train/bus', '몇 시예요? = what time is it?'], grammarNote: '막 (mak) = last/final. 첫 (cheot) = first. 막차 = last train. 첫차 = first train.' },
        ],
    },
    {
        id: 'b12', youtubeId: null, title: 'At a Jjimjilbang (Korean Spa)', subtitle: 'Survive Seoul\'s famous all-night public baths',
        themeIcon: '♨️', genre: 'Culture', levelColor: '#4ade80',
        context: 'You\'ve decided to try a 찜질방 (Korean spa/sauna). You walk in with no idea how it works.',
        lines: [
            { id: 1, korean: '입장료가 얼마예요?', romanization: 'ip-jang-ryo-ga eol-ma-ye-yo', englishPronunciation: 'ip-JAHNG-ryoh-gah ul-MAH-yeh-yo', english: 'How much is the entrance fee?', usage: 'Ask the entrance price at any attraction, spa, or museum.', tip: 'Jjimjilbangs typically cost 8,000–15,000 won and you can stay overnight! Includes towels and shorts.', words: ['입장료 — entrance fee', '얼마예요 — how much is it'], phrases: ['입장료 = entrance fee', '이용료 = usage fee'], grammarNote: '입장 (ip-jang) = entrance. 료 (ryo) = fee. 입장료 = entrance fee. Works for any venue.' },
            { id: 2, korean: '수영복 필요해요?', romanization: 'su-yeong-bok pil-yo-hae-yo', englishPronunciation: 'soo-yung-BOK pil-YOH-heh-yo', english: 'Do I need a swimsuit?', usage: 'Confirm dress code before entering the bathing area.', tip: 'Traditional jjimjilbang: NO swimsuits — you bathe gender-separated and naked. The common area is mixed and you wear provided shorts.', words: ['수영복 — swimsuit', '필요해요 — do I need'], phrases: ['필요해요 = I need / is it needed?', '필요 없어요 = no need / not necessary'], grammarNote: '필요하다 (pil-yo-ha-da) = to need / to be necessary. 필요해요? = do I need it? / is it needed?' },
            { id: 3, korean: '사물함이 어디에 있어요?', romanization: 'sa-mul-ham-i eo-di-e i-sseo-yo', englishPronunciation: 'sah-MOOL-hahm-ee UH-dee-eh ee-SSUH-yo', english: 'Where are the lockers?', usage: 'Find where to store your belongings before bathing.', tip: 'Jjimjilbangs provide a locker key wristband that also works as payment inside — so you don\'t need cash!', words: ['사물함 — locker', '어디에 있어요 — where is it'], phrases: ['어디에 있어요? = where is it?', '사물함 = locker'], grammarNote: '어디에 있어요? = "where is it?" (location of a fixed thing). 어디예요? = "where is it?" (more casual).' },
            { id: 4, korean: '때밀이 해 주세요.', romanization: 'ttae-mi-ri hae ju-se-yo', englishPronunciation: 'DEH-mee-ree heh joo-seh-yo', english: 'Please do the body scrub for me.', usage: 'Request the famous Korean body scrub service — a must-try cultural experience.', tip: '때밀이 (body scrubbing) is a famous Korean spa service. An attendant uses a special mitt to scrub your entire body. Very intense but loved by regulars!', words: ['때밀이 — body scrub service', '해 주세요 — please do for me'], phrases: ['때밀이 = body scrub service', '해 주세요 = please do X for me'], grammarNote: '때 = dirt/grime. 밀다 = to push/scrub. 때밀이 = the act of scrubbing off dead skin. A unique Korean spa tradition.' },
            { id: 5, korean: '찜질방에서 잘 수 있어요?', romanization: 'jjim-jil-bang-e-seo jal su i-sseo-yo', englishPronunciation: 'jjim-jil-BANG-eh-suh jahl soo ee-SSUH-yo', english: 'Can I sleep at the jjimjilbang?', usage: 'Ask if overnight stays are allowed — most jjimjilbangs serve as budget hotels.', tip: 'Many Koreans sleep at jjimjilbangs after missing the last subway. It\'s safe, comfortable, and costs less than a hotel.', words: ['찜질방에서 — at the jjimjilbang', '잘 수 있어요 — can I sleep'], phrases: ['잘 수 있어요? = can I sleep?', '~ㄹ 수 있어요? = can I do X?'], grammarNote: '~ㄹ 수 있어요? = can I do X? 먹을 수 있어요? = can I eat? 들어갈 수 있어요? = can I enter?' },
        ],
    },
    {
        id: 'b13', youtubeId: null, title: 'At a Korean BBQ Restaurant', subtitle: 'Grill, wrap, and eat like a Seoul local',
        themeIcon: '🥩', genre: 'Daily Life', levelColor: '#4ade80',
        context: 'You sit down at a samgyeopsal (pork belly BBQ) restaurant. There is a grill in the middle of the table.',
        lines: [
            { id: 1, korean: '삼겹살 이 인분 주세요.', romanization: 'sam-gyeop-sal i in-bun ju-se-yo', englishPronunciation: 'sahm-GYUP-sahl ee IN-bun joo-seh-yo', english: 'Two portions of pork belly please.', usage: 'Order by number of 인분 (portions) — each portion is usually 200g.', tip: 'At Korean BBQ, you order by 인분 (portions per person). Two people = 이 인분. Three people = 삼 인분.', words: ['삼겹살 — pork belly', '이 인분 — two portions', '주세요 — please give me'], phrases: ['인분 = portion (per person)', '한 인분, 이 인분, 삼 인분 = 1, 2, 3 portions'], grammarNote: '인분 (in-bun) = portion (serving for one person). 이 (ee) = two in Sino-Korean numbers.' },
            { id: 2, korean: '고기 좀 잘라 주세요.', romanization: 'go-gi jom jal-la ju-se-yo', englishPronunciation: 'goh-GEE jom jahl-LAH joo-seh-yo', english: 'Please cut the meat for me.', usage: 'Ask the server to cut the grilled meat into bite-sized pieces — this is normal and expected.', tip: 'At many Korean BBQ places, the server will cut the meat for you automatically. But if they don\'t, just ask!', words: ['고기 — meat', '잘라 주세요 — please cut'], phrases: ['고기 = meat', '잘라 주세요 = please cut', '구워 주세요 = please grill it'], grammarNote: '잘라 주세요 = please cut. 구워 주세요 = please grill. ~아/어 주세요 = please do X for me.' },
            { id: 3, korean: '상추 더 주세요.', romanization: 'sang-chu deo ju-se-yo', englishPronunciation: 'sahng-CHOO duh joo-seh-yo', english: 'More lettuce please.', usage: 'Request more of the free side items — lettuce, garlic, kimchi are always refillable at no cost.', tip: 'Side dishes (반찬) at Korean BBQ are always FREE and you can ask for unlimited refills!', words: ['상추 — lettuce', '더 — more', '주세요 — please give me'], phrases: ['상추 = lettuce (for BBQ wrapping)', '더 주세요 = more please', '반찬 = side dishes'], grammarNote: '더 주세요 = "more please." Works for any side dish: 김치 더 주세요 = more kimchi please.' },
            { id: 4, korean: '잘 먹겠습니다!', romanization: 'jal meok-get-seum-ni-da', englishPronunciation: 'jahl muk-GHET-seum-nee-da', english: 'I will eat well! (said before eating)', usage: 'The Korean phrase said before every meal — like the French "bon appétit" but said by the person eating.', tip: 'Say this before every Korean meal, especially when someone has cooked for you. It expresses gratitude for the food.', words: ['잘 — well', '먹겠습니다 — I will eat'], phrases: ['잘 먹겠습니다 = said BEFORE eating', '잘 먹었습니다 = said AFTER eating (I ate well)'], grammarNote: '겠 adds intention/future to a verb. 먹겠습니다 = I will eat (polite). A set phrase used before every meal.' },
            { id: 5, korean: '불판 갈아 주세요.', romanization: 'bul-pan ga-ra ju-se-yo', englishPronunciation: 'bool-PAHN gah-rah joo-seh-yo', english: 'Please change the grill plate.', usage: 'Ask the server to replace the charred grill plate with a fresh one mid-meal.', tip: 'Servers routinely change grill plates at Korean BBQ. If yours looks burnt, just say this!', words: ['불판 — grill plate', '갈아 주세요 — please change/replace'], phrases: ['불판 = grill plate', '갈아 주세요 = please change/replace'], grammarNote: '갈다 (gal-da) = to change/replace. 갈아 주세요 = please change it for me. Also: 기저귀 갈아 주세요 = please change the diaper.' },
        ],
    },
    {
        id: 'b14', youtubeId: null, title: 'Making Friends with Locals', subtitle: 'Small talk that opens every door in Seoul',
        themeIcon: '🤝', genre: 'Social', levelColor: '#4ade80',
        context: 'You\'re at a café when the person next to you notices your language guide book and smiles. Time to make a Korean friend!',
        lines: [
            { id: 1, korean: '한국어 배우고 있어요.', romanization: 'han-gu-geo bae-u-go i-sseo-yo', englishPronunciation: 'hahn-GOO-guh beh-OO-go ee-SSUH-yo', english: 'I am learning Korean.', usage: 'Tell people you are learning Korean — this immediately charms every Korean you meet.', tip: 'Koreans are incredibly proud of their language. Saying you are learning Korean will get you smiles, encouragement, and often a new friend.', words: ['한국어 — Korean language', '배우고 있어요 — I am learning'], phrases: ['배우다 = to learn', '배우고 있어요 = I am currently learning'], grammarNote: '~고 있어요 = "I am currently doing X" (present progressive). 먹고 있어요 = I am eating. 보고 있어요 = I am watching.' },
            { id: 2, korean: '한국이 너무 좋아요!', romanization: 'han-gu-gi neo-mu jo-a-yo', englishPronunciation: 'hahn-GOO-gee NUH-moo joh-AH-yo', english: 'I love Korea so much!', usage: 'Express genuine enthusiasm for Korea — this phrase will make every Korean beam with pride.', tip: 'Koreans love hearing foreigners appreciate their country. Be genuine and specific about what you love.', words: ['한국이 — Korea', '너무 좋아요 — I love it so much'], phrases: ['너무 좋아요 = I love it so much', '한국 음식이 너무 좋아요 = I love Korean food so much'], grammarNote: '좋아요 = "I like it / it\'s good." 너무 좋아요 = "I really really like it." 너무 adds intensity.' },
            { id: 3, korean: '어디서 왔어요?', romanization: 'eo-di-seo wa-sseo-yo', englishPronunciation: 'UH-dee-suh wa-SSUH-yo', english: 'Where are you from?', usage: 'Ask someone where they are from — one of the most common small talk questions in Korea.', tip: 'Koreans will ask you this in the first 30 seconds. Have your answer ready: 저는 [country]에서 왔어요!', words: ['어디서 — from where', '왔어요 — did you come'], phrases: ['어디서 왔어요? = where are you from?', '저는 인도에서 왔어요 = I am from India'], grammarNote: '에서 (e-seo) = from. 어디에서 = from where. 한국에서 왔어요 = I came from Korea.' },
            { id: 4, korean: '한국 음식 중에 뭐가 제일 좋아요?', romanization: 'han-guk eum-sik jung-e mwo-ga je-il jo-a-yo', englishPronunciation: 'hahn-GOOK eum-SHIK joong-eh mwuh-GAH jeh-EEL joh-AH-yo', english: 'What is your favourite Korean food?', usage: 'A perfect conversation starter that leads naturally to restaurant recommendations.', tip: 'Answering this question well will lead to Koreans giving you their best restaurant recommendations. Have an honest answer!', words: ['음식 중에 — among foods', '뭐가 — what', '제일 좋아요 — is most liked'], phrases: ['중에 = among / out of', '제일 좋아요 = is my favourite', '뭐가 = what (as the subject)'], grammarNote: '중에 (jung-e) = among / from a group. 음식 중에 = among foods. 친구 중에 = among friends.' },
            { id: 5, korean: '연락처 알려 주세요.', romanization: 'yeol-lak-cheo al-lyeo ju-se-yo', englishPronunciation: 'yul-LAHK-chuh ahl-LYUH joo-seh-yo', english: 'Please give me your contact info.', usage: 'Exchange contact information after meeting someone — Koreans exchange KakaoTalk IDs, not phone numbers.', tip: 'KakaoTalk is the #1 messaging app in Korea. Koreans exchange KakaoTalk IDs, not phone numbers. Download it!', words: ['연락처 — contact information', '알려 주세요 — please let me know / please give me'], phrases: ['연락처 = contact info', '카카오톡 ID가 뭐예요? = what is your KakaoTalk ID?'], grammarNote: '알려 주세요 = "please tell me / please let me know." 알리다 = to inform. 알려 줘요 = tell me (casual).' },
            { id: 6, korean: '또 만나요!', romanization: 'ddo man-na-yo', englishPronunciation: 'DDO mahn-NAH-yo', english: 'See you again!', usage: 'A warm way to say goodbye to someone you hope to see again.', tip: '또 만나요 is warmer and more hopeful than 안녕히 가세요. Use it with new friends!', words: ['또 — again', '만나요 — let\'s meet / see you'], phrases: ['또 만나요 = see you again!', '또 봐요 = see you again (very casual)'], grammarNote: '또 (ddo) = again. 만나다 = to meet. 또 만나요 = let\'s meet again / see you again.' },
        ],
    },
    {
        id: 'b15', youtubeId: null, title: 'Numbers & Essential Counting', subtitle: 'Prices, ages, floors — master Korean numbers',
        themeIcon: '🔢', genre: 'Basics', levelColor: '#4ade80',
        context: 'You\'re at a market trying to understand prices, tell your age, and find what floor your shop is on.',
        lines: [
            { id: 1, korean: '일, 이, 삼, 사, 오, 육, 칠, 팔, 구, 십', romanization: 'il, i, sam, sa, o, yuk, chil, pal, gu, sip', englishPronunciation: 'eel, ee, sahm, sah, oh, yook, chil, pahl, goo, ship', english: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10 (Sino-Korean — for money & floors)', usage: 'Use these numbers for prices, floor numbers, dates, phone numbers, and minutes/seconds.', tip: 'Korea has TWO number systems. Sino-Korean (these) are used for money, floors, dates, and minutes.', words: ['일 — 1', '이 — 2', '삼 — 3', '사 — 4', '오 — 5', '육 — 6', '칠 — 7', '팔 — 8', '구 — 9', '십 — 10'], phrases: ['오천 원 = 5,000 won', '삼 층 = 3rd floor', '십 분 = 10 minutes'], grammarNote: 'Sino-Korean numbers: 십 (10), 백 (100), 천 (1,000), 만 (10,000). 오만 원 = 50,000 won.' },
            { id: 2, korean: '하나, 둘, 셋, 넷, 다섯, 여섯, 일곱, 여덟, 아홉, 열', romanization: 'ha-na, dul, set, net, da-seot, yeo-seot, il-gop, yeo-deol, a-hop, yeol', englishPronunciation: 'hah-NAH, dool, set, net, dah-SUT, yuh-SUT, il-GOP, yuh-DUL, ah-HOP, yul', english: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10 (Native Korean — for people, bottles, age)', usage: 'Use these numbers when counting people, items, hours, and stating your age.', tip: 'Native Korean numbers are used with counters: 한 명 (1 person), 두 병 (2 bottles), 세 살 (age 3).', words: ['하나 — 1', '둘 — 2', '셋 — 3', '넷 — 4', '다섯 — 5', '여섯 — 6', '일곱 — 7', '여덟 — 8', '아홉 — 9', '열 — 10'], phrases: ['두 명 = 2 people', '세 병 = 3 bottles', '스물다섯 살 = 25 years old'], grammarNote: 'Native numbers change slightly before counters: 하나 → 한 명, 둘 → 두 명, 셋 → 세 명, 넷 → 네 명.' },
            { id: 3, korean: '저는 스물다섯 살이에요.', romanization: 'jeo-neun seu-mul-da-seot sal-i-e-yo', englishPronunciation: 'JUH-neun seu-mul-DAH-sut SAHL-ee-eh-yo', english: 'I am 25 years old.', usage: 'State your age using native Korean numbers + 살 (years old).', tip: 'Koreans will ask your age early in a conversation — it helps them know how to address you (formal vs casual).', words: ['스물다섯 — 25 (native Korean)', '살 — years of age', '이에요 — I am'], phrases: ['살 = years old (age counter)', '몇 살이에요? = how old are you?'], grammarNote: 'Age in Korean uses native numbers + 살. 스물 = 20, 서른 = 30, 마흔 = 40, 쉰 = 50.' },
            { id: 4, korean: '사 층이에요.', romanization: 'sa cheung-i-e-yo', englishPronunciation: 'sah CHUNG-ee-eh-yo', english: 'It is the 4th floor.', usage: 'Tell someone which floor something is on using Sino-Korean numbers + 층.', tip: 'Korean buildings number floors the same way as Western buildings. 일 층 = 1st floor (ground floor).', words: ['사 — 4 (Sino-Korean)', '층 — floor', '이에요 — it is'], phrases: ['층 = floor (of a building)', '일 층 = 1F, 이 층 = 2F, 지하 = basement'], grammarNote: '층 (cheung) = floor/level. 지하 1층 = basement 1. 옥상 = rooftop. Used with Sino-Korean numbers.' },
            { id: 5, korean: '오만 원이에요.', romanization: 'o-man won-i-e-yo', englishPronunciation: 'oh-MAHN WON-ee-eh-yo', english: 'It is 50,000 won.', usage: 'Understand and say prices confidently in Korean.', tip: 'Korean uses 만 (10,000) as its base unit — not 1,000. 오만 원 = 5 × 10,000 won = 50,000 won.', words: ['오 — 5', '만 — ten thousand', '원 — Korean currency'], phrases: ['만 원 = 10,000 won', '오천 원 = 5,000 won', '십만 원 = 100,000 won'], grammarNote: '만 (mahn) = 10,000. 이만 = 20,000. 삼만 = 30,000. 사만 = 40,000. 오만 = 50,000.' },
        ],
    },
];

const INTERMEDIATE_SCENES = [
    {
        id: 'i1', youtubeId: 'KXljXfj0Q4c', title: 'Made in Korea — Police Station', subtitle: 'A foreigner navigates a Korean police station',
        themeIcon: '🚔', drama: 'Made in Korea (Netflix India)', genre: 'Comedy Drama', levelColor: '#fb923c',
        context: 'Real scene: A foreign woman is brought to a Korean police station after a street incident.',
        lines: [
            { id: 1, timestamp: '0:05', korean: '이걸 샀어요?', romanization: 'i-geol sa-sseo-yo', englishPronunciation: 'ee-GUL sa-SSUH-yo', english: 'Did you buy this?', usage: 'Asking if someone purchased something — past tense polite question.', tip: '"Did you buy this?" — the officer is checking if the item was legitimately purchased.', words: ['이걸 — this (object)', '샀어요 — did you buy'], phrases: ['샀어요? = did you buy? (past tense)', '사다 = to buy'], grammarNote: 'Past tense in Korean: add 았어요/었어요 to the verb stem. 사다 → 샀어요 (bought).' },
            { id: 2, timestamp: '0:08', korean: '네. 이거요.', romanization: 'ne. i-geo-yo', englishPronunciation: 'neh. ee-GUH-yo', english: 'Yeah. This one right here.', usage: 'Confirming something while pointing — very natural spoken Korean.', tip: 'Adding 요 (yo) to the end of almost any word makes it polite.', words: ['네 — yes', '이거요 — this one (politely)'], phrases: ['네 = yes', '이거요 = this one (politely)', '요 at the end = politeness marker'], grammarNote: 'The 요 ending is the simplest way to be polite in Korean.' },
            { id: 3, timestamp: '0:23', korean: '공공장소에서 사람을 때리면 안 되죠.', romanization: 'gong-gong-jang-so-e-seo sa-ram-eul ttae-ri-myeon an-doe-jyo', englishPronunciation: 'gong-gong-JAHNG-so-eh-suh sah-RAM-ul DEH-ri-myun ahn-DWEH-jyo', english: "You can't go around hitting people in a public place.", usage: 'Expressing that something is not allowed — the "must not" grammar pattern.', tip: '"You must not" (면 안 되다) is one of the most important patterns in Korean.', words: ['공공장소 — public place', '때리면 — if you hit', '안 되죠 — must not'], phrases: ['공공장소 = public place', '때리다 = to hit', '~면 안 돼요 = must not do X'], grammarNote: '~면 안 되다 = if you do X, it is not okay = you must not do X.' },
            { id: 4, timestamp: '1:29', korean: '사인하면 나가실 수 있어요. 안 하시면 여기 계셔야 해요.', romanization: 'sa-in-ha-myeon na-ga-sil su i-sseo-yo. an ha-si-myeon yeo-gi gye-syeo-ya hae-yo', englishPronunciation: 'sa-een-hah-MYUN nah-GA-shil soo ee-SSUH-yo. ahn ha-SHEE-myun yuh-GEE gyeh-SHUH-ya heh-yo', english: 'If you sign, you can leave. If you do not sign, you will stay here.', usage: 'Conditional sentences — "if you do X, then Y will happen."', tip: 'Notice the three grammar patterns in one sentence!', words: ['사인하면 — if you sign', '나가실 수 있어요 — you can leave', '안 하시면 — if you do not', '여기 계셔야 해요 — you must stay here'], phrases: ['~면 = if', '~ㄹ 수 있어요 = can do', '~아야 해요 = must do'], grammarNote: 'Three key patterns: ~면 (if), ~ㄹ 수 있다 (can), ~아야 하다 (must).' },
            { id: 5, timestamp: '1:38', korean: '어디에 사인해요?', romanization: 'eo-di-e sa-in-hae-yo', englishPronunciation: 'UH-dee-eh sa-een-HEH-yo', english: 'Where do I sign?', usage: 'Asking where to sign a document.', tip: '"I will do X" (할게요) expresses a decision you are making right now.', words: ['어디에 — where', '사인해요 — do I sign'], phrases: ['어디에 = where (at)', '사인하다 = to sign'], grammarNote: '~(으)ㄹ게요 expresses a decision made in the moment. 할게요 = I will do it (I have decided).' },
        ],
    },
    {
        id: 'i2', youtubeId: 'eYSH7kLGtGo', title: 'The Doctors — Old Friends Reunite', subtitle: 'Two friends meet unexpectedly after a long separation',
        themeIcon: '🏥', drama: 'The Doctors (닥터스) — SBS Drama', genre: 'Medical Drama', levelColor: '#fb923c',
        context: 'Real scene from The Doctors: Two old friends run into each other outside a large hospital.',
        lines: [
            { id: 1, timestamp: '0:08', korean: '알아요? 제 친구예요.', romanization: 'a-ra-yo? je chin-gu-ye-yo', englishPronunciation: 'ah-RAH-yo? jeh CHIN-goo-yeh-yo', english: "Do you know her? She's my friend.", usage: 'Asking if someone recognizes someone else, then a simple introduction.', tip: 'Short, natural sentences like this are the backbone of real Korean conversation.', words: ['알아요 — do you know', '제 친구 — my friend', '예요 — is'], phrases: ['알아요? = do you know? (casual-polite)', '제 친구 = my friend', '예요 = is/are'], grammarNote: '알다 (al-da) = to know. 알아요? = do you know? 몰라요 = I do not know.' },
            { id: 2, timestamp: '0:16', korean: '왜 이제야 왔어요?', romanization: 'wae i-je-ya wa-sseo-yo', englishPronunciation: 'weh ee-JEH-ya wa-SSUH-yo', english: 'Why are you here only now?', usage: 'Expressing frustration that someone came late. A slightly accusatory but friendly tone.', tip: '이제야 adds the emotion of "finally after all this time" — very K-Drama!', words: ['왜 — why', '이제야 — only now / finally', '왔어요 — did you come'], phrases: ['이제야 = only now / finally (implies frustration)', '왜 이제야? = why only now?'], grammarNote: '이제야 adds emotional intensity: "after all this time, only NOW?"' },
            { id: 3, timestamp: '0:27', korean: '더 잘생겨졌네요. 수염도 났네요. 울버린 같아요.', romanization: 'deo jal-saeng-gyeo-jyeot-ne-yo. su-yeom-do nat-ne-yo. ul-beo-rin ga-ta-yo', englishPronunciation: 'DUH jahl-seng-gyuh-JYUT-neh-yo. soo-YUHM-do naht-NEH-yo. ul-BUH-rin GAH-ta-yo', english: "You have become more handsome. You have a beard. You look like Wolverine.", usage: 'Commenting on appearance changes — Koreans openly comment on looks, it is not rude!', tip: 'In Korea, commenting on appearance (you look thinner, more handsome) is a normal compliment.', words: ['더 잘생겨졌네요 — became more handsome', '수염도 났네요 — beard appeared', '울버린 같아요 — looks like Wolverine'], phrases: ['~졌네요 = has become X (I notice)', '~같아요 = looks like / resembles', '더 = more'], grammarNote: '~아/어지다 = to become X. 잘생겨졌어요 = became more handsome. ~같아요 = looks like.' },
            { id: 4, timestamp: '0:47', korean: '왜 나한테 화났어요?', romanization: 'wae na-han-te hwa-nat-sseo-yo', englishPronunciation: 'weh nah-HAN-teh hwah-NAHT-ssuh-yo', english: 'Why are you angry at me?', usage: 'Asking why someone is directing anger at you — a natural defensive response.', tip: '화나다 = to get angry. 나한테 = at me / directed at me. Very common in K-Drama confrontations.', words: ['왜 — why', '나한테 — at me', '화났어요 — are you angry'], phrases: ['나한테 = at me / to me', '화나다 = to get angry', '화났어요 = I am angry / you are angry'], grammarNote: '~한테 (han-te) = at/to (a person). 나한테 = to me. 친구한테 = to a friend.' },
            { id: 5, timestamp: '0:47', korean: '왜 나한테 이러는 거예요? 안 돼요? 돼요.', romanization: 'wae na-han-te i-reo-neun geo-ye-yo? an dwae-yo? dwae-yo.', englishPronunciation: 'weh nah-HAN-teh ee-REH-neun guh-YEH-yo? ahn dweh-yo? dweh-yo', english: "Why are you doing this to me? Can't I? Of course you can.", usage: 'Question, refusal, then acceptance — natural conversational flow.', tip: '돼요 = okay/can. 안 돼요 = not okay/cannot. These two words are incredibly useful!', words: ['왜 이러는 거예요 — why are you doing this', '안 돼요 — not okay', '돼요 — okay/can'], phrases: ['이러다 = to do like this', '안 돼요 = it is not okay', '돼요 = it is okay / can do'], grammarNote: '돼요 = okay/works. 안 돼요 = not okay. Question: 돼요? = is it okay?' },
        ],
    },
    {
        id: 'i3', youtubeId: 'Lyio9VdVtJg', title: 'Hwarang — Unexpected Confession', subtitle: 'A girl blurts out her feelings in a dramatic moment',
        themeIcon: '⚔️', drama: 'Hwarang: The Poet Warrior Youth', genre: 'Historical Drama', levelColor: '#fb923c',
        context: 'Real scene from Hwarang: Sun-ah pleads with Sun-woo to take her along on a secret mission.',
        lines: [
            { id: 1, timestamp: '0:00', korean: '왜요? 왜 못 가게 해요?', romanization: 'wae-yo? wae mot ga-ge hae-yo', englishPronunciation: 'weh-yo? weh mot GAH-geh heh-yo', english: "Why? Why won't you let me go?", usage: 'Rapid-fire frustrated questions — very emotional spoken Korean.', tip: 'Notice how two questions are fired one after another with rising emotion.', words: ['왜요 — why', '못 가게 — cannot go', '해요 — are you doing'], phrases: ['못 + verb = cannot do', '~게 하다 = to let/make someone do', '왜요? = why?'], grammarNote: '못 (mot) before a verb = cannot. 못 가요 = cannot go. 못 해요 = cannot do.' },
            { id: 2, timestamp: '0:09', korean: '저도 데려가 주세요!', romanization: 'jeo-do de-ryeo-ga ju-se-yo', englishPronunciation: 'JUH-do deh-ryuh-GAH joo-seh-yo', english: 'Take me along too! Please!', usage: 'Pleading request — "take me along" using 주세요.', tip: 'Notice 주세요 attaches after the action verb as a polite request.', words: ['저도 — me too', '데려가 — take along', '주세요 — please do for me'], phrases: ['저도 = me too / I also', '데려가다 = to take someone along', '~아/어 주세요 = please do X for me'], grammarNote: '~아/어 주다 = to do something for someone. 데려가 줘요 = please take me along.' },
            { id: 3, timestamp: '0:17', korean: '싫어요! 저는 선우가 좋아요!', romanization: 'si-reo-yo! jeo-neun seon-u-ga jo-a-yo', englishPronunciation: 'shil-EO-yo! JUH-neun SUH-noo-ga joh-AH-yo', english: 'No way! I like Sun-woo!', usage: 'Strong refusal followed by expressing preference — passionate K-Drama speech.', tip: '싫어요 is a strong "no / I do not want it." More emotional than just 아니요.', words: ['싫어요 — no way / I do not like it', '저는 선우가 — I, Sun-woo', '좋아요 — I like'], phrases: ['싫어요 = I do not like it / no way!', '좋아요 = I like it / it is good', '좋아해요 = I like (a person)'], grammarNote: '좋다 = to be good/liked. 좋아해요 = I like (person). 좋아요 = it is good/okay.' },
            { id: 4, timestamp: '0:24', korean: '저도 어른이에요! 다 할 수 있어요!', romanization: 'jeo-do eo-reu-ni-e-yo! da hal su i-sseo-yo', englishPronunciation: 'JUH-do UH-reun-ee-eh-yo! dah hahl soo ee-SSUH-yo', english: "I'm an adult too! I can handle anything!", usage: 'Asserting capability using the "can do" structure — very important grammar.', tip: 'The pattern ~ㄹ 수 있어요 (can do) is essential Korean.', words: ['어른이에요 — I am an adult', '다 할 수 있어요 — I can do anything'], phrases: ['어른 = adult', '다 = all/everything', '~ㄹ 수 있어요 = can do'], grammarNote: '~(으)ㄹ 수 있다 = can do X. 할 수 있어요 = I can do it! 할 수 없어요 = I cannot do it.' },
            { id: 5, timestamp: '0:34', korean: '왜 저를 이렇게 좋아해요? 그냥... 멋있어요.', romanization: 'wae jeo-reul i-reo-ke jo-a-hae-yo? geu-nyang... meo-si-sseo-yo', englishPronunciation: 'weh JUH-reul ee-REH-keh joh-ah-HEH-yo? geu-NYANG... muh-SHEE-ssuh-yo', english: 'Why do you like me so much? I dunno... you are just cool.', usage: 'An unexpected confession — expressing feelings with the "like" verb.', tip: 'This is when Sun-ah accidentally confesses she likes Sun-woo. 좋아해요 = I like you (romantically).', words: ['왜 저를 — why me', '이렇게 좋아해요 — like this much', '그냥 — just', '멋있어요 — you are cool'], phrases: ['좋아하다 = to like (a person)', '이렇게 = this much / like this', '그냥 = just / for no reason', '멋있다 = to be cool/stylish'], grammarNote: 'The confession phrase 좋아해요 means "I like you" romantically in Korean. 사랑해요 = I love you.' },
        ],
    },
    {
        id: 'i4', youtubeId: 'sZTA5sogb4c', title: 'Motorcycle Escape', subtitle: 'A tense romantic escape on a motorcycle',
        themeIcon: '🏍️', drama: 'Korean Romance Drama', genre: 'Romance', levelColor: '#fb923c',
        context: 'Real scene: Two people escape together on a motorcycle. Tension, gratitude, and unspoken feelings.',
        lines: [
            { id: 1, timestamp: '0:00', korean: '어디로 가면 돼요?', romanization: 'eo-di-ro ga-myeon dwae-yo', englishPronunciation: 'UH-dee-ro gah-MYUN dweh-yo', english: 'Where do I need to go?', usage: 'Asking for a destination — literally "if I go where, will it be okay?"', tip: 'This structure ~면 돼요 (if you do X, it\'s okay) is used constantly in Korean for asking what is sufficient or needed.', words: ['어디로 — to where', '가면 — if you go', '돼요 — is it okay'], phrases: ['어디로 가면 돼요? = where do I need to go?', '~면 돼요 = if you do X, it\'s okay / you just need to do X'], grammarNote: '~면 돼요 = "if you do X, that\'s fine." 이렇게 하면 돼요 = if you do it like this, it\'s fine.' },
            { id: 2, timestamp: '0:45', korean: '꽉 잡아요. 이것밖에 못 해요.', romanization: 'kkwak ja-ba-yo. i-geot-bak-ke mot hae-yo', englishPronunciation: 'kkwahk jah-BAH-yo. ee-gut-BAHK-keh mot HEH-yo', english: 'Hold on tight. This is all I can do.', usage: 'Two important structures: a command, and "can only do X."', tip: '밖에 못 해요 expresses limitation with a tinge of regret — "this is all I\'m capable of doing."', words: ['꽉 — tightly', '잡아요 — hold / grab', '이것밖에 — only this', '못 해요 — can\'t do'], phrases: ['꽉 잡아요 = hold on tight!', '이것밖에 못 해요 = this is all I can do', '밖에 + negative = only'], grammarNote: '밖에 (bak-ke) + negative verb = "nothing but / only." 이것밖에 없어요 = there is only this.' },
            { id: 3, timestamp: '0:54', korean: '저는 항상 감사해요.', romanization: 'jeo-neun hang-sang gam-sa-hae-yo', englishPronunciation: 'JUH-neun hang-SANG gahm-SAH-heh-yo', english: 'I am always grateful to you.', usage: 'Expressing ongoing gratitude — a heartfelt admission that carries weight in K-Drama moments.', tip: '항상 (always) elevates a simple thanks into something deeply felt. Koreans use this in emotional confessions.', words: ['저는 — I', '항상 — always', '감사해요 — I am grateful'], phrases: ['항상 = always', '감사해요 = I am grateful (present, ongoing)', '항상 감사해요 = I am always grateful'], grammarNote: '감사합니다 = formal thank you. 감사해요 = polite thank you. 고마워요 = casual thank you.' },
            { id: 4, timestamp: '1:03', korean: '알아요. 항상 알아요.', romanization: 'a-ra-yo. hang-sang a-ra-yo', englishPronunciation: 'ah-RAH-yo. hang-SANG ah-RAH-yo', english: 'I know. I always know.', usage: 'Simple but emotionally loaded repetition — a signature of Korean drama dialogue.', tip: 'In Korean drama, repeating a phrase with 항상 signals deep emotional certainty. Very cinematic.', words: ['알아요 — I know', '항상 — always'], phrases: ['알아요 = I know', '항상 알아요 = I always know', '~아/어요 = present tense polite ending'], grammarNote: '알다 (al-da) = to know. 알아요 = I know. 몰라요 = I don\'t know. Two essential opposites.' },
        ],
    },
    {
        id: 'i5', youtubeId: 'T8TvazaY5hQ', title: 'Vacation Banter — Wine & Netflix', subtitle: 'A couple navigates grocery shopping and surprise guests',
        themeIcon: '🍷', drama: 'Korean Romance Drama', genre: 'Romance', levelColor: '#fb923c',
        context: 'Real scene: Two people are on a trip. They banter about grocery shopping, wine, and unexpected guests arriving.',
        lines: [
            { id: 1, timestamp: '0:03', korean: '원래 휴가를 내려고 했는데 대표가 가래서요. 어쩔 수가 없잖아요.', romanization: 'won-rae hyu-ga-reul nae-ryeo-go haen-neun-de dae-pyo-ga ga-rae-seo-yo. eo-jjeol su-ga eop-jja-na-yo', englishPronunciation: 'WON-reh hyoo-GAH-reul neh-RYUH-go hehn-NUN-deh deh-PYO-ga gah-REH-suh-yo. uh-JJUL soo-gah up-JA-nah-yo', english: 'I originally wanted to take leave, but our representative told me to go. I had no choice.', usage: 'Explaining why you did something despite not wanting to — the classic Korean excuse structure.', tip: '어쩔 수가 없다 = "there is nothing that can be done" is one of the most-used expressions in Korean for explaining unavoidable situations.', words: ['원래 — originally', '휴가를 내다 — to take leave', '어쩔 수가 없다 — I had no choice'], phrases: ['원래 = originally / usually', '어쩔 수가 없어요 = I have no choice / nothing can be done', '~려고 했는데 = I was planning to, but...'], grammarNote: '~려고 했는데 = "I was planning to do X, but..." Used to explain a change of plans.' },
            { id: 2, timestamp: '0:13', korean: '청담일보에 또 실릴까봐요?', romanization: 'cheong-dam-il-bo-e ddo sil-lil-kka-bwa-yo', englishPronunciation: 'chung-DAHM-il-boh-eh DDO shill-LIL-kah-BWA-yo', english: 'Are you worried about ending up in the Cheongdam Daily again?', usage: 'Using ~ㄹ까봐요 to express worry that something might happen.', tip: '~ㄹ까봐요 expresses fear or worry about a potential outcome — "I\'m worried that X might happen."', words: ['또 — again', '실릴까봐요 — worried it will be published'], phrases: ['~ㄹ까봐요 = I\'m worried that X will happen', '또 = again'], grammarNote: '~ㄹ까봐요 = "I\'m afraid/worried that X will happen." 들킬까봐요 = I\'m worried I\'ll get caught.' },
            { id: 3, timestamp: '0:23', korean: '나는 이런 거 상상했어. 당신이랑 장 보는 거.', romanization: 'na-neun i-reon geo sang-sang-hae-sseo. dang-sin-i-rang jang bo-neun geo', englishPronunciation: 'NAH-neun ee-REON guh sahng-SAHNG-heh-SSUH. dahng-SHIN-ee-rahng jahng BOH-neun guh', english: 'I imagined something like this. Going grocery shopping with you.', usage: 'Sharing a daydream — the ~했어 past tense implies something long imagined finally happening.', tip: '이런 거 (something like this) is used when a vague dream becomes reality. Very romantic in context.', words: ['상상했어 — I imagined', '당신이랑 — with you', '장 보는 거 — going grocery shopping'], phrases: ['상상하다 = to imagine', '이랑 = with (casual)', '장 보다 = to go grocery shopping'], grammarNote: '당신 (dang-shin) = you (formal/literary). In romance, Koreans use 당신 for a poetic "you."' },
            { id: 4, timestamp: '0:31', korean: '그다음에 하고 싶은 거 말해. 와인 사러 가자. 같이 넷플릭스 보면서 쉬자.', romanization: 'geu-da-eum-e ha-go si-peun geo mal-hae. wa-in sa-reo ga-ja. ga-chi net-peul-lik-seu bo-myeon-seo swi-ja', englishPronunciation: 'guh-DAH-eum-eh hah-go shee-PUN guh mahl-HEH. wah-een SAH-ruh gah-JA. gah-chee net-PULL-lik-suh BOH-myun-suh SWEE-jah', english: 'Tell me what you want to do next. Let\'s go buy wine. Let\'s relax and watch Netflix together.', usage: 'Making suggestions using the casual ~자 (let\'s do) ending.', tip: '~자 is the casual "let\'s do X" form — used between people who are comfortable with each other.', words: ['그다음에 — next / after that', '하고 싶은 거 — what you want to do', '같이 — together', '~면서 — while doing'], phrases: ['말해 = tell me (casual)', '~러 가자 = let\'s go do X', '같이 = together', '~면서 = while doing X simultaneously'], grammarNote: '~면서 = while doing simultaneously. 보면서 쉬자 = let\'s rest while watching. Two actions at once.' },
            { id: 5, timestamp: '0:47', korean: '취해서 이 여행을 망치면 안 되잖아. 내일 길에서 마시자.', romanization: 'chwi-hae-seo i yeo-haeng-eul mang-chi-myeon an doe-ja-na. nae-il gi-re-seo ma-si-ja', englishPronunciation: 'chwee-HEH-suh ee yuh-HENG-ul mahng-CHEE-myun ahn DWEH-ja-nah. neh-EEL gi-REH-suh mah-SHEE-jah', english: 'We can\'t ruin this trip by getting drunk. Let\'s drink on the road tomorrow.', usage: 'Using ~면 안 되다 (must not) and causal ~아/어서 reasoning.', tip: '취하다 = to get drunk. 망치다 = to ruin. Both are essential drama vocabulary.', words: ['취해서 — because of getting drunk', '망치면 안 돼 — we must not ruin', '내일 — tomorrow', '길에서 — on the road'], phrases: ['취하다 = to get drunk', '망치다 = to ruin', '~면 안 돼 = we must not do X'], grammarNote: '취해서 망치면 = if we get drunk and ruin it. ~아/어서 connects cause and result naturally.' },
        ],
    },
    {
        id: 'i6', youtubeId: 'IQLcz6wLNg0', title: 'Rural Vet in Town', subtitle: 'A Seoul vet meets the chaos of countryside life',
        themeIcon: '🐑', drama: 'Korean Rural Comedy Drama', genre: 'Comedy Drama', levelColor: '#fb923c',
        context: 'Real scene: A handsome vet from Seoul arrives in a rural village and is immediately swept into everyone\'s business.',
        lines: [
            { id: 1, timestamp: '0:02', korean: '서울에서 온 수의사예요. 키도 크고 잘생겼어요.', romanization: 'seo-ul-e-seo on su-ui-sa-ye-yo. ki-do keu-go jal-saeng-gyeo-sseo-yo', englishPronunciation: 'suh-OOL-eh-suh on soo-EE-sah-yeh-yo. KI-do kuh-go jahl-seng-GYUH-ssuh-yo', english: 'This is a veterinarian from Seoul. Not only is he tall, but he is also very handsome.', usage: 'Describing someone with stacked compliments using ~도 (also/even) and ~고 (and).', tip: '~도 크고 pattern means "not only is he tall, but also..." — a very natural Korean way to list positive traits.', words: ['수의사 — veterinarian', '키도 크고 — tall also, and...', '잘생겼어요 — is handsome'], phrases: ['~도 ~고 = not only X but also Y', '수의사 = veterinarian', '잘생기다 = to be handsome'], grammarNote: '~도 ~고 = "is X, and also Y." 키도 크고 잘생겼어요 = is tall AND handsome (both traits stacked).' },
            { id: 2, timestamp: '0:21', korean: '이 분은 서울에서 오셨는데 아직 정상이에요.', romanization: 'i bun-eun seo-ul-e-seo o-syeon-neun-de a-jik jeong-sang-i-e-yo', englishPronunciation: 'ee BOON-un suh-OOL-eh-suh oh-SHYUN-nun-deh ah-JIK jung-SAHNG-ee-eh-yo', english: 'This person came from Seoul, but he still looks normal.', usage: 'Expressing surprised contrast — expected one thing but found another.', tip: '아직 (a-jik = still) paired with a compliment is often sarcastic or humorous in countryside contexts.', words: ['이 분은 — this person (respectful)', '오셨는데 — came, but', '아직 — still', '정상이에요 — is normal'], phrases: ['~(으)셨는데 = came/did X, but (contrast)', '아직 = still', '정상 = normal'], grammarNote: '~는데 at the end of a clause = "but / and yet / however." Creates contrast or leads into something unexpected.' },
            { id: 3, timestamp: '0:43', korean: '저 분이 누구예요? 서동리의 걸어다니는 민원센터예요.', romanization: 'jeo bun-i nu-gu-ye-yo? seo-dong-ri-ui geo-reo-da-ni-neun mi-nwon-sen-teo-ye-yo', englishPronunciation: 'JUH boon-ee NOO-goo-yeh-yo? suh-dong-REE-ui guh-ruh-dah-NEE-neun mee-NWON-sen-tuh-yeh-yo', english: 'Who is that person? You can think of her as the walking petition center of Seo-dong-ri.', usage: 'Giving a colorful description by comparing someone to an institution.', tip: '걸어다니는 (walking) + noun is a uniquely Korean expression for someone who IS something — "a walking encyclopedia," "a walking petition center."', words: ['저 분이 — that person (respectful)', '걸어다니는 — walking (modifier)', '민원센터 — petition/complaint center'], phrases: ['걸어다니는 + noun = a walking X', '민원 = civil complaint / petition', '누구예요? = who is it?'], grammarNote: 'Verb ~는 + noun = descriptive modifier. 걸어다니다 + 는 + 민원센터 = "petition center that walks around."' },
            { id: 4, timestamp: '0:59', korean: '저를 속인 분 중에 저처럼 생긴 분 있으세요? 왜요? 너무 잘생겨서요.', romanization: 'jeo-reul so-gin bun jung-e jeo-cheo-reom saeng-gin bun i-seu-se-yo? wae-yo? neo-mu jal-saeng-gyeo-seo-yo', englishPronunciation: 'JUH-reul so-GIN boon joong-eh JUH-chuh-rum seng-GIN boon ee-SUH-seh-yo? weh-yo? NUH-moo jahl-seng-GYUH-suh-yo', english: 'Have you ever been tricked by someone who looks like me? Why? Because you are too handsome.', usage: 'A question-and-answer exchange revealing that attractiveness can be a vulnerability.', tip: '너무 잘생겨서요 — ending with 서요 (because) implies cause. The reason is left hanging humorously.', words: ['속인 — who tricked', '저처럼 생긴 — who looks like me', '너무 잘생겨서요 — because too handsome'], phrases: ['속이다 = to deceive / trick', '~처럼 생기다 = to look like X', '~아/어서요 = because (of that)'], grammarNote: '~처럼 생기다 = to look like X. 저처럼 생겼어요 = you look like me. Very useful appearance pattern.' },
            { id: 5, timestamp: '1:33', korean: '저는 이상현입니다. 서동리 청년회장이에요. 있는 동안 저한테 기대도 돼요.', romanization: 'jeo-neun i-sang-hyeon-im-ni-da. seo-dong-ri cheong-nyeon-hoe-jang-i-e-yo. i-sseu-neun dong-an jeo-han-te gi-dae-do dwae-yo', englishPronunciation: 'JUH-neun ee-SAHNG-hyun-im-nee-da. suh-dong-REE chung-NYUN-hweh-jahng-ee-eh-yo. ee-SSUH-neun dong-ahn JUH-hahn-teh gi-DEH-do dweh-yo', english: 'I am Lee Sang-hyun, president of the Seo-dong-ri Youth Association. While you are here, you can lean on me.', usage: 'A formal self-introduction and a warm offer of support using ~도 돼요 (it\'s okay to do X).', tip: '~한테 기대다 = to lean on / rely on someone. Physically or emotionally. A warm offer.', words: ['있는 동안 — while (you are) here', '저한테 기대도 돼요 — you can rely on me'], phrases: ['~는 동안 = while / during', '~한테 기대다 = to lean on / rely on', '~도 돼요 = it\'s okay to do X'], grammarNote: '~도 돼요 = "it\'s okay to do X / you may do X." 가도 돼요 = you may go. 기대도 돼요 = you may rely on me.' },
        ],
    },
    {
        id: 'i7', youtubeId: 'Ofs2-wB3JfE', title: 'Village Sisters Push a Confession', subtitle: 'Everyone wants the charming Woo-min to confess his love',
        themeIcon: '💌', drama: 'Korean Village Romance Comedy', genre: 'Comedy Drama', levelColor: '#fb923c',
        context: 'Real scene: Village women gossip about the charming Ji Woo-min and try to push him into confessing to his old love.',
        lines: [
            { id: 1, timestamp: '0:00', korean: '엄청 멍청한데 잘생겼어요. 잘생긴 게 뭔 소용이야? 남자친구 생기면 싱글이 아니잖아요.', romanization: 'eom-cheong meong-cheong-han-de jal-saeng-gyeo-sseo-yo. jal-saeng-gin ge mwon so-yong-i-ya? nam-ja-chin-gu saeng-gi-myeon sing-geul-i a-ni-ja-na-yo', englishPronunciation: 'um-CHUNG mung-CHUNG-han-deh jahl-seng-GYUH-ssuh-yo. jahl-seng-GIN geh mwon SOH-yong-ee-ya? nahm-ja-CHIN-goo seng-GEE-myun SING-gul-ee ah-nee-ja-NAH-yo', english: 'He\'s very silly but very good-looking. Being good-looking is great, but what use is that? If he gets a girlfriend, he won\'t be single anymore.', usage: 'Casual banter using contrast (but), rhetorical question, and conditional logic.', tip: '뭔 소용이야? = "what\'s the use of that?" A very colloquial, sarcastic rhetorical question.', words: ['엄청 — very/extremely (colloquial)', '멍청한데 — silly, but', '뭔 소용이야 — what\'s the use of that', '싱글이 아니잖아요 — won\'t be single anymore'], phrases: ['엄청 = extremely (colloquial)', '뭔 소용이야? = what\'s the point? (rhetorical)', '~면 ~잖아요 = if X, then of course Y'], grammarNote: '잖아요 = "as you know / isn\'t it obvious." Used to state something the listener should already know.' },
            { id: 2, timestamp: '0:19', korean: '몰라요? 여자들 사이에서 지우민의 미소가 제일 아름다워요.', romanization: 'mol-la-yo? yeo-ja-deul sa-i-e-seo ji-u-min-ui mi-so-ga je-il a-reum-da-wo-yo', englishPronunciation: 'mol-LAH-yo? yuh-JAH-dul sah-EE-eh-suh ji-OO-min-ui mee-SOH-gah jeh-EEL ah-rum-DAH-woh-yo', english: 'Don\'t you know? Among women, Ji Woo-min has the most beautiful smile.', usage: 'Using 사이에서 (among) and 제일 (most) for superlatives within a group.', tip: '사이에서 = "among (a group of people)." A natural way to discuss rankings within a category.', words: ['몰라요? — don\'t you know?', '사이에서 — among', '미소 — smile', '제일 아름다워요 — is most beautiful'], phrases: ['~들 사이에서 = among (a group)', '제일 = the most (superlative)', '미소 = smile'], grammarNote: '제일 (je-il) = the most. 제일 + adjective = superlative. 제일 좋아요 = I like it the most.' },
            { id: 3, timestamp: '0:42', korean: '지은이랑 사귈 것 같은데. 그 얘기를 왜 지금 해요. 상처받겠네.', romanization: 'ji-eun-i-rang sa-gwil geot ga-teun-de. geu yae-gi-reul wae ji-geum hae-yo. sang-cheo-bat-get-ne', englishPronunciation: 'ji-UN-ee-rang sah-GWEEL gut gah-teun-deh. guh yeh-GEE-reul weh ji-GUM heh-yo. sahng-chuh-BAHT-get-neh', english: 'Looks like he\'ll date Ji-eun. Why are you bringing this up now? This will hurt his feelings.', usage: 'Predictions using ~ㄹ 것 같다 and expressing concern for someone\'s feelings.', tip: '상처받다 = to get hurt (emotionally). 상처 = wound/hurt. 받다 = to receive. "To receive emotional hurt."', words: ['사귈 것 같은데 — looks like he\'ll date', '그 얘기를 왜 지금 해요 — why bring this up now', '상처받겠네 — will get hurt'], phrases: ['~ㄹ 것 같다 = it seems like X will happen', '상처받다 = to be emotionally hurt', '얘기 = story / topic / matter'], grammarNote: '~ㄹ 것 같다 = "it seems like X will happen." Future prediction with uncertainty. 올 것 같아요 = seems like they\'ll come.' },
            { id: 4, timestamp: '1:07', korean: '진짜 지은이 좋아하지? 고백해! 빨리 가! 도와줄게.', romanization: 'jin-jja ji-eun-i jo-a-ha-ji? go-baek-hae! ppal-li ga! do-wa-jul-ge', englishPronunciation: 'JIN-jah ji-UN-ee joh-ah-HAH-ji? goh-BEHK-heh! PPAL-li gah! doh-wah-JUL-geh', english: 'You really like Ji-eun, right? Confess to her! Go quickly! I\'ll help you.', usage: 'Rapid-fire casual commands and a promise using ~ㄹ게.', tip: '고백하다 = to confess feelings. This is THE word for romantic confession in Korean.', words: ['진짜 — really', '좋아하지? — you like (her), right?', '고백해 — confess!', '빨리 가 — go quickly!', '도와줄게 — I will help you'], phrases: ['좋아하다 = to like (a person)', '고백하다 = to confess romantic feelings', '~ㄹ게 = I will do X (I\'ve decided)', '빨리 = quickly'], grammarNote: '~ㄹ게 = "I will do X" (speaker\'s voluntary decision). 도와줄게 = I\'ll help you. 전화할게 = I\'ll call you.' },
        ],
    },
];


const ADVANCED_SCENES = [
    {
        id: 'a1', youtubeId: 'A4IxJj4eHWM', title: 'Extraordinary Attorney Woo — Spring Sunshine', subtitle: 'Every line from the cafeteria confession scene',
        themeIcon: '⚖️', drama: 'Extraordinary Attorney Woo (이상한 변호사 우영우) — Ep 5', genre: 'Legal Drama', levelColor: '#e94560',
        context: 'Real scene: Woo Young-woo unexpectedly shows up at the employee cafeteria because there are seaweed rice rolls.',
        dubInstructions: 'Watch the clip first. Then come back and dub every single line. Try to match the emotion of each character.',
        lines: [
            { id: 1, timestamp: '0:05', korean: '우영우 씨, 여기 왜 왔어요?', romanization: 'U-yeong-u ssi, yeo-gi wae wa-sseo-yo', englishPronunciation: 'oo-YUNG-oo shee, yuh-GEE weh wa-SSUH-yo', english: 'Woo Young-woo, what brings you here?', usage: 'Expressing surprise at someone\'s unexpected appearance somewhere.', tip: '씨 (ssi) is a polite title attached after a name — similar to Mr/Ms but used with first name in workplaces.', words: ['씨 — polite title', '여기 — here', '왜 왔어요 — why did you come'], phrases: ['왜 왔어요? = why did you come?', '씨 = polite name title'], grammarNote: '씨 (ssi) goes after the full name or first name. Never before. 우영우 씨 is correct, not 씨 우영우.', character: 'Choi Su-yeon', emotion: 'Surprised but happy' },
            { id: 2, timestamp: '0:05', korean: '오늘 저녁이 김밥이에서요.', romanization: 'o-neul jeo-nyeok-i gim-bap-i-e-seo-yo', englishPronunciation: 'oh-NEUL juh-NYUK-ee GEEM-bahb-ee-EH-suh-yo', english: "Because tonight's dinner is seaweed rice rolls.", usage: 'Giving a reason using "because it is" — a very common Korean sentence pattern.', tip: 'Woo Young-woo loves seaweed rice rolls. This is a recurring theme in the drama.', words: ['오늘 저녁 — tonight', '김밥 — seaweed rice rolls', '이에서요 — because it is'], phrases: ['~이라서요 = because it is (noun)', '앞으로 = from now on'], grammarNote: '이라서 / 이에서 = "because it is (noun)." Noun + 이라서 + reason. Essential connector!', character: 'Woo Young-woo', emotion: 'Matter-of-fact, direct' },
            { id: 3, timestamp: '0:35', korean: '저한테도 별명 지어 줘요.', romanization: 'jeo-han-te-do byeol-myeong ji-eo jwo-yo', englishPronunciation: 'JUH-hahn-teh-do byul-MYUNG jee-uh JWO-yo', english: 'You should come up with a nickname for me too.', usage: 'Making a playful request — Korean workplace humor.', tip: '씨 (ssi) is used between colleagues of similar status.', words: ['저한테도 — for me too', '별명 — nickname', '지어 줘요 — please make'], phrases: ['지어 주다 = to create / come up with for me', '~은 어때요? = how about X?'], grammarNote: '어때요? = how about it? / what do you think? Used constantly in Korean conversation.', character: 'Choi Su-yeon', emotion: 'Playful, self-deprecating' },
            { id: 4, timestamp: '0:52', korean: '그런 이름은 안 어울려요. 그럼 뭐가 어울려요?', romanization: 'geu-reon i-reum-eun an-e-ul-lyeo-yo. geu-reom mweo-ga eo-ul-lyeo-yo', englishPronunciation: 'guh-REON ee-REUM-un ahn-EH-ul-lyuh-yo. guh-REUM mwuh-GAH uh-ul-LYUH-yo', english: 'That kind of name does not suit you. Then what does suit me?', usage: 'Expressing that something does not suit someone — 어울리다 = to suit/fit.', tip: '어울리다 (to suit) is very commonly used in Korea when talking about clothes, names, colors.', words: ['그런 이름은 — that kind of name', '안 어울려요 — does not suit', '그럼 뭐가 — then what'], phrases: ['어울리다 = to suit / to fit / to go well with', '그런 = that kind of', '그럼 = then / in that case'], grammarNote: '어울리다 = to suit. 이 색이 어울려요 = this color suits you. 잘 어울려요 = it suits you well.', character: 'Both', emotion: 'Thoughtful, sincere moment' },
            { id: 5, timestamp: '1:00', korean: '봄 햇살 같아요.', romanization: 'bom haet-sal ga-ta-yo', englishPronunciation: 'bom HET-sahl GAH-ta-yo', english: 'You are just like the sunshine in spring.', usage: 'A poetic comparison using the "looks like / is like" structure.', tip: 'This is considered one of the most iconic compliment lines in recent Korean drama history.', words: ['봄 — spring', '햇살 — sunshine', '같아요 — is like / resembles'], phrases: ['봄 = spring', '햇살 = sunshine', '같아요 = is like / resembles / looks like'], grammarNote: '~같아요 = "is like X." 천사 같아요 = like an angel. 아이 같아요 = like a child.', character: 'Woo Young-woo', emotion: 'Sincere, innocent, heartfelt' },
            { id: 6, timestamp: '1:24', korean: '따뜻하고, 친절하고, 부드러운 사람이에요. 그래서 봄 햇살 최수연이에요.', romanization: 'dda-ddeu-ta-go, chin-jeol-ha-go, bu-deu-reo-un sa-ram-i-e-yo. geu-rae-seo bom haet-sal Choe Su-yeon', englishPronunciation: 'DDA-duh-tah-go, chin-JUL-hah-go, boo-duh-REH-oon sah-RAM-ee-EH-yo. guh-REH-suh bom HET-sahl Chwe-Su-YEON', english: 'You are a warm, kind, and gentle person. That is why you are "The Spring Sunshine, Choi Su-yeon."', usage: 'Stacking adjectives with and-connector, then delivering a conclusion with "therefore."', tip: 'This is the most iconic line of the scene. The whole 90-second clip builds to this one sentence.', words: ['따뜻하고 — warm and', '친절하고 — kind and', '부드러운 — gentle', '그래서 — that is why', '봄 햇살 — spring sunshine'], phrases: ['~하고 = and (connecting adjectives)', '그래서 = therefore / that is why', '봄 햇살 = spring sunshine'], grammarNote: 'Stacking adjectives: 따뜻하고 (warm+and) 친절하고 (kind+and) 부드러운 (gentle). ~고 connects them.', character: 'Woo Young-woo', emotion: 'Pure, earnest, unforgettable' },
        ],
    },
    {
        id: 'a2', youtubeId: '3pW50cck3-k', title: 'Crash Landing on You — Capitalist Heart', subtitle: 'Every line from the dishes and hearts bickering scene',
        themeIcon: '🪂', drama: 'Crash Landing on You (사랑의 불시착) — Ep 5', genre: 'Romance', levelColor: '#e94560',
        context: 'Real scene: Ri Jung-hyeok returns home to find Se-ri acting strangely after he did the dishes.',
        dubInstructions: 'These two characters are constantly bickering but care for each other. Capture that tension when you dub!',
        lines: [
            { id: 1, timestamp: '0:03', korean: '왔어요? 오늘은 제가 설거지를 해줬어요.', romanization: 'wa-sseo-yo? o-neul-eun je-ga seol-geo-ji-reul hae-jwo-sseo-yo', englishPronunciation: 'wa-SSUH-yo? oh-NEUL-un jeh-GAH sul-GUH-ji-reul heh-JWUH-ssuh-yo', english: 'You are back? I did the dishes for you today.', usage: 'Reporting something you did for someone using the "did for you" grammar pattern.', tip: '해줬어요 = "did it for you" — the 줬어 part means it was done as a service or favor.', words: ['왔어요 — you came back', '설거지를 — the dishes', '해줬어요 — did for you'], phrases: ['왔어요? = you came? / you are back?', '해줬어요 = did (it) for you (past)', '설거지 = doing the dishes'], grammarNote: '~아/어 줬어요 = did X for you (past tense). 도와줬어요 = helped you. 사줬어요 = bought for you.', character: 'Yoon Se-ri', emotion: 'Casual, trying to be normal' },
            { id: 2, timestamp: '0:10', korean: '왜 거기 서 있어요?', romanization: 'wae geo-gi seo i-sseo-yo', englishPronunciation: 'weh GUH-gee suh ee-SSUH-yo', english: 'Why are you just standing there?', usage: 'Asking why someone is inactive — a very natural Korean expression.', tip: '서 있어요 = "is standing" describes an ongoing state, not an action.', words: ['왜 — why', '거기 — there', '서 있어요 — are standing'], phrases: ['서 있어요 = is standing (ongoing state)', '앉아 있어요 = is sitting', '누워 있어요 = is lying down'], grammarNote: '서 있어요 = is standing. ~아/어 있다 = ongoing states. Very useful pattern!', character: 'Ri Jung-hyeok', emotion: 'Puzzled, suspicious' },
            { id: 3, timestamp: '0:25', korean: '저기... 심장이 여러 개 있어요?', romanization: 'jeo-gi... sim-jang-i yeo-reo gae i-sseo-yo', englishPronunciation: 'JUH-gee... shim-JAHNG-ee yuh-REH geh ee-SSUH-yo', english: 'Hey there... do you happen to have multiple hearts?', usage: 'Asking a metaphorical rhetorical question — one of the most memorable lines in the drama.', tip: "Se-ri is asking this because Ri Jung-hyeok seems to have conflicting feelings — like he has 'two hearts.'", words: ['저기 — hey there', '심장 — heart', '여러 개 — multiple items', '있어요 — do you have'], phrases: ['여러 개 = multiple (items)', '있어요? = do you have?'], grammarNote: '여러 (yeo-reo) = several/multiple. 개 (gae) is the counter for objects. 여러 개 = several things.', character: 'Yoon Se-ri', emotion: 'Confused, vulnerable, searching' },
            { id: 4, timestamp: '0:44', korean: '저는 오늘 침대에서 잘 거예요. 등이 아파도 전혀 상관없어요.', romanization: 'jeo-neun o-neul chim-dae-e-seo jal geo-ye-yo. deung-i a-pa-do jeon-hyeo sang-gwan-eop-sseo-yo', englishPronunciation: 'JUH-neun oh-NEUL chim-DEH-eh-suh jahl guh-YEH-yo. DUNG-ee ah-PAH-do jUN-hyuh SAHNG-gwahn-up-SSUH-yo', english: "I am sleeping in the bed tonight. I don't care one bit whether your back hurts.", usage: 'Declaring a future plan and responding with complete indifference.', tip: '상관없어요 = "I do not care / it does not matter." One of the coldest phrases in Korean.', words: ['침대에서 잘 거예요 — will sleep in bed', '등이 아파도 — even if back hurts', '전혀 상관없어요 — I do not care at all'], phrases: ['~ㄹ 거예요 = I will do X (future plan)', '~아/어도 = even if', '전혀 = not at all', '상관없어요 = I do not care'], grammarNote: '~아/어도 = even if X. 아파도 = even if it hurts. 전혀 = not at all (strong intensifier for negatives).', character: 'Both', emotion: 'Se-ri bold, Ri Jung-hyeok cold' },
            { id: 5, timestamp: '0:57', korean: '왜 이런 거야. 아나뽀한 자본주의 심장.', romanization: 'wae i-reon geo-ya. a-na-ppo-han ja-bon-ju-ui sim-jang', englishPronunciation: 'weh ee-REON guh-YAH. ah-NAH-ppo-hahn ja-BON-joo-ee SHIM-jahng', english: "Why is this happening. Damn capitalist heart.", usage: "Muttering to himself in frustration — informal self-talk using casual speech.", tip: "This is Ri Jung-hyeok's famous closing line — he is a North Korean soldier calling Se-ri's heart 'capitalist.'", words: ['왜 이런 거야 — why is it like this', '자본주의 — capitalism', '심장 — heart'], phrases: ['이런 거야 = why is it like this (casual self-talk)', '자본주의 = capitalism', '심장 = heart'], grammarNote: 'Casual speech (반말) ending ~야 is used for self-talk or close friends. 이런 거야 = why is it like this?', character: 'Ri Jung-hyeok (internal)', emotion: 'Conflicted, confused, secretly moved' },
        ],
    },
    {
        id: 'a3', youtubeId: '1Rxr2GvyvZs', title: 'Abyss — The Detective Sketch Scene', subtitle: 'Every line from the hilarious suspect description scene',
        themeIcon: '🖊️', drama: 'Abyss (어비스) — Episode 13', genre: 'Crime Comedy', levelColor: '#e94560',
        context: 'Real scene: A witness tries to describe a suspect\'s face to a detective who is drawing a sketch.',
        dubInstructions: 'This is a back-and-forth dialogue scene. Two characters alternating. Dub both sides and try to match the rapid pace.',
        lines: [
            { id: 1, timestamp: '0:00', korean: '정말 아무것도 몰라요? 제일 중요한 게 있어요: 그 사람 얼굴.', romanization: 'jeong-mal a-mu-geot-do mol-la-yo? je-il joong-yo-han ge i-sseo-yo: geu sa-ram eol-gul', englishPronunciation: 'JUNG-mahl ah-MOO-gut-do mol-LAH-yo? jeh-EEL joong-YOH-hahn geh ee-SSUH-yo: guh SAH-rahm ul-GOOL', english: 'Are you really saying you know nothing? But I know the most important thing: his face.', usage: 'Defending that you have at least one crucial piece of information.', tip: 'The contrast structure "I know nothing BUT I know X" is used often in Korean crime dramas.', words: ['정말 아무것도 — really nothing', '몰라요 — do not know', '제일 중요한 — most important', '얼굴 — face'], phrases: ['정말 = really', '아무것도 = nothing at all', '제일 중요한 = the most important', '얼굴 = face'], grammarNote: '제일 (je-il) = the most. 제일 좋아요 = I like it the most. 제일 중요해요 = most important.', character: 'Witness', emotion: 'Defensive, confident' },
            { id: 2, timestamp: '0:09', korean: '얼굴이 동그랗고, 머리는 반곱슬이에요.', romanization: 'eol-gul-i dong-geu-ra-ko, meo-ri-neun ban-gop-seul-i-e-yo', englishPronunciation: 'ul-GOOL-ee dong-guh-RAH-ko, muh-REE-neun bahn-gop-SEUL-ee-eh-yo', english: 'He has a round face. His hair is half-curly.', usage: 'Describing physical appearance step by step — face shape, hair.', tip: 'Physical description in Korean goes from overall to specific: face shape → hair style → features.', words: ['얼굴이 동그랗고 — face is round and', '머리는 반곱슬 — hair is half-curly'], phrases: ['동그랗다 = to be round', '대머리 = bald', '평범한 = normal/ordinary', '반곱슬 = half-curly (wavy)'], grammarNote: '~하고 / ~고 connects descriptors: 동그랗고 (round and...) then next feature.', character: 'Witness', emotion: 'Trying to be helpful and precise' },
            { id: 3, timestamp: '0:17', korean: '눈은 처지고, 쌍꺼풀이 없어요. 코는 커요. 아랫순술이 좀 두꺼워요.', romanization: 'nu-neun cheo-ji-go, ssang-keo-pul eop-sseo-yo. ko-neun keo-yo. a-rae-sun-sul-i jo-keum du-kko-wo-yo', englishPronunciation: 'NOO-neun chuh-JEE-go, ssahng-KUH-pool up-SSUH-yo. KOH-neun KUH-yo. ah-REH-sun-sul-ee joh-KEUM doo-KKO-wo-yo', english: 'His eyes are drooping with single eyelids. Big nose. His lower lip is a bit thick.', usage: 'Continuing physical description with specific facial features.', tip: '쌍꺼풀 (double eyelid) vs 단꺼풀 (single eyelid) — this distinction is very common in Korean conversations.', words: ['눈은 처지고 — eyes drooping and', '쌍꺼풀이 없어요 — no double eyelid', '코는 커요 — nose is big', '아랫순술 두꺼워요 — lower lip thick'], phrases: ['처지다 = to droop/sag', '쌍꺼풀 없어요 = no double eyelid (single eyelid)', '두껍다 = thick'], grammarNote: '없어요 = there is not / does not have. 쌍꺼풀이 없어요 = no double eyelid (has single eyelid).', character: 'Witness', emotion: 'Focused, gesturing to demonstrate' },
            { id: 4, timestamp: '0:38', korean: '이렇게 생겼어요?', romanization: 'i-reo-ke saeng-gyeo-sseo-yo', englishPronunciation: 'ee-REH-keh seng-GYUH-ssuh-yo', english: 'Does he look like this?', usage: 'Asking someone to hold a pose while checking accuracy.', tip: 'The detective is asking the witness to hold their facial demonstration while checking the sketch.', words: ['이렇게 — like this', '생겼어요 — does he look'], phrases: ['거기 있어요 = stay there / be there', '이렇게 생겼어요? = does (he) look like this?', '생기다 = to look like (physically)'], grammarNote: '어떻게 생겼어요? = what does (person/thing) look like? 이렇게 생겼어요? = does it look like this?', character: 'Detective', emotion: 'Focused, professional, slightly exasperated' },
            { id: 5, timestamp: '0:51', korean: '설명을 제대로 안 해서 그렇죠!', romanization: 'seol-myeong-eul je-dae-ro an-hae-seo geu-rae-jyo', englishPronunciation: 'sul-MYUNG-ul jeh-DEH-ro ahn heh-SUH guh-REH-jyo', english: "It's all because you didn't explain properly!", usage: 'Accusing the other person of causing the problem through poor explanation.', tip: 'The blame-shifting structure "because YOU did not do X properly, that is why I..." is common in K-Drama arguments.', words: ['설명을 제대로 — explanation properly', '안 해서 — because did not do', '그렇죠 — that is why'], phrases: ['찾다 = to find', '제대로 = properly / correctly', '안 해서 = because (you) did not do', '그래서 그렇죠 = that is why it turned out this way'], grammarNote: '~아/어서 = because (of doing X). ~안 해서 = because (I/you) did not do X. Cause-and-effect pattern.', character: 'Both', emotion: 'Frustrated, blaming each other' },
        ],
    },
    {
        id: 'a4', youtubeId: 'wAKGqRG7NwI', title: 'Award Acceptance Speeches', subtitle: 'Real celebrity acceptance speech moments — emotional, unscripted Korean',
        themeIcon: '🏆', drama: 'Korean Entertainment Awards Show', genre: 'Award Show', levelColor: '#e94560',
        context: 'Real scene: Korean celebrities accept awards — emotional, heartfelt, unscripted Korean at its most natural and formal.',
        dubInstructions: 'These are real unscripted speech moments. Try to match the emotion — gratitude, surprise, and sincerity. Formal speech is key here.',
        lines: [
            { id: 1, timestamp: '0:23', korean: '많은 분들이 드라마를 선택해 주셨어요.', romanization: 'ma-neun bun-deul-i deu-ra-ma-reul seon-taek-hae ju-syeo-sseo-yo', englishPronunciation: 'MAH-neun boon-DUL-ee duh-RAH-mah-reul sun-TEHK-heh joo-SHYUH-ssuh-yo', english: 'Thankfully, many people chose this drama.', usage: 'Expressing gratitude for the audience\'s choice — formal, warm, gracious.', tip: '주셨어요 is the honorific past of 주다 (to give). The ~어 주시다 pattern means someone respected did something FOR you.', words: ['많은 분들이 — many people (honorific)', '드라마를 선택해 — chose the drama', '주셨어요 — did for us (honorific past)'], phrases: ['선택하다 = to choose/select', '~아/어 주시다 = (someone respected) does X for us', '많은 분들 = many people (respectful)'], grammarNote: '~아/어 주시다 = honorific of ~아/어 주다. Used when an elder/respected person does you a favor. Very formal.', character: 'Award recipient', emotion: 'Moved, grateful' },
            { id: 2, timestamp: '0:32', korean: '어릴 때 무사히 대학에 가길 바랐어요.', romanization: 'eo-ril ttae mu-sa-hi dae-ha-ge ga-gil ba-ra-sseo-yo', englishPronunciation: 'UH-ril DEH moo-SAH-hee deh-HAH-geh gah-GIL bah-RAH-ssuh-yo', english: 'When I was young, I hoped to safely get into college.', usage: 'Sharing a humble past hope using ~기를 바라다 (hoping that X).', tip: '무사히 = safely/without incident. A beautiful word that implies relief at getting through something difficult.', words: ['어릴 때 — when young', '무사히 — safely', '대학에 가길 — getting into college', '바랐어요 — I hoped for'], phrases: ['어릴 때 = when I was young', '무사히 = safely / without incident', '~기를 바라다 = to hope/wish that X'], grammarNote: '~기를 바라다 = "to hope that X happens." 성공하기를 바랍니다 = I hope you succeed.', character: 'Award recipient', emotion: 'Humble, reflective' },
            { id: 3, timestamp: '0:53', korean: '영화가 천만 관객을 넘으면 공개하겠습니다. 감사합니다.', romanization: 'yeong-hwa-ga cheon-man gwan-gaek-eul neo-meun, gong-gae-ha-get-seum-ni-da. gam-sa-ham-ni-da', englishPronunciation: 'yung-HWA-gah chun-MAHN gwahn-GEK-ul nuh-MUNG, gong-GEH-hah-get-seum-nee-da. gahm-SAH-hahm-nee-da', english: 'When the movie reaches 10 million viewers, I will make it public. Thank you.', usage: 'Making a public conditional promise — "if/when X happens, I will do Y."', tip: '천만 (10 million) is the threshold for a "hit" Korean film. Stars often make promises contingent on reaching this number.', words: ['천만 관객 — ten million viewers', '넘으면 — if/when it exceeds', '공개하겠습니다 — I will make it public'], phrases: ['천만 관객 = 10 million viewers (hit movie threshold)', '~으면 = if/when X', '~겠습니다 = formal "I will do X" (public announcement)'], grammarNote: '~겠습니다 in speeches = a formal declaration of intent. More official than ~ㄹ 거예요. Used for announcements.', character: 'Award recipient', emotion: 'Playful, making a public promise' },
            { id: 4, timestamp: '0:59', korean: '처음 무지상을 받았을 때', romanization: 'cheo-eum mu-ji-sang-eul ba-da-sseo-yo', englishPronunciation: 'chuh-UM moo-ji-SANG-ul bah-DA-ssuh-yo', english: 'When I first received the Muji Award...', usage: 'Beginning an anecdote with "when I first..." — a common storytelling opener in speeches.', tip: '처음 (cheo-eum) = first / for the first time. Paired with past tense to set up a "back when" story.', words: ['처음 — first / for the first time', '무지상을 — the Muji Award', '받았을 때 — when I received'], phrases: ['처음 = first time', '받다 = to receive', '~았을 때 = when X happened (past moment)'], grammarNote: '~았을 때 = "when X happened" (completed past). 받았을 때 = when I received it. Essential storytelling grammar.', character: 'Award recipient', emotion: 'Nostalgic, storytelling' },
            { id: 5, timestamp: '1:22', korean: '아프리카에 갔을 때 이런 순간이 너무 많았어요. 앞으로도 더 드라마틱한 순간을 만들겠습니다.', romanization: 'a-peu-ri-ka-e ga-sseul ttae i-reon sun-gan-i neo-mu ma-na-sseo-yo. ap-eu-ro-do deo deu-ra-ma-tik-an sun-gan-eul man-deul-get-seum-ni-da', englishPronunciation: 'ah-puh-REE-kah-eh gah-SSUL DEH ee-REON soon-GAN-ee NUH-moo mah-NAH-ssuh-yo. ah-PUH-ro-do DUH duh-rah-mah-TIK-hahn soon-GAN-ul mahn-DUL-get-seum-nee-da', english: 'When I went to Africa, there were so many moments like this. I will continue to create even more dramatic moments in the future.', usage: 'Connecting a past experience to a future promise — the arc of a great acceptance speech.', tip: '앞으로도 = "going forward as well / in the future too." The 도 (also/still) makes it ongoing.', words: ['갔을 때 — when I went', '이런 순간이 — moments like this', '너무 많았어요 — there were so many', '앞으로도 — going forward as well', '만들겠습니다 — I will create'], phrases: ['앞으로도 = going forward / in the future as well', '순간 = moment', '만들다 = to make/create'], grammarNote: '앞으로 = in the future. 앞으로도 = in the future as well (도 = also/still adds continuity).', character: 'Award recipient', emotion: 'Ambitious, inspiring' },
        ],
    },
    {
        id: 'a5', youtubeId: 'oEU7WhNNKL8', title: 'Crash Landing on You — Accident & Reunion', subtitle: 'Every line from the tense North Korea reunion scene',
        themeIcon: '🪂', drama: 'Crash Landing on You (사랑의 불시착)', genre: 'Romance', levelColor: '#e94560',
        context: 'Real scene: Se-ri has an accident and the only person she knows — Ri Jung-hyeok — appears unexpectedly in North Korea.',
        dubInstructions: 'This scene alternates between panic, shock, and vulnerability. Match the emotional swings — Se-ri is dramatic, Ri Jung-hyeok is rigid and conflicted.',
        lines: [
            { id: 1, timestamp: '0:01', korean: '사고가 났어요. 사고가 나면 제일 필요한 건 사람이에요. 내 편인 사람.', romanization: 'sa-go-ga na-sseo-yo. sa-go-ga na-myeon je-il pil-yo-han geon sa-ram-i-e-yo. nae pyeon-in sa-ram', englishPronunciation: 'sah-GOH-gah na-SSUH-yo. sah-GOH-gah nah-MYUN jeh-EEL pil-YOH-hahn gun sah-RAM-ee-eh-yo. neh pyun-IN sah-ram', english: 'This is an accident. When an accident happens, what you need most is people. People on my side.', usage: 'Philosophical narration using conditional structure and superlative.', tip: '내 편 = "my side / on my team." This phrase is emotionally powerful in Korean — being "on someone\'s side" is a deep form of loyalty.', words: ['사고가 났어요 — an accident happened', '제일 필요한 건 — what is most needed', '내 편인 사람 — a person on my side'], phrases: ['사고가 나다 = an accident happens', '제일 필요하다 = is most needed', '내 편 = on my side / my ally'], grammarNote: '내 편 (nae pyeon) = "my side." 내 편이에요 = they\'re on my side. 네 편이에요 = I\'m on your side.', character: 'Yoon Se-ri (narration)', emotion: 'Calm but desperate' },
            { id: 2, timestamp: '0:09', korean: '아직 돌아가지 않았군요. 많이 놀랐죠?', romanization: 'a-jik dol-a-ga-ji a-na-sseo-yo. ma-ni nol-lat-jyo', englishPronunciation: 'ah-JIK doh-LAH-gah-ji ah-NAH-SSUH-yo. mah-NEE nol-LAHT-jyo', english: 'I thought you went back. You must be really surprised, right?', usage: 'Expressing a past assumption that was wrong + confirming the other person\'s current reaction.', tip: '~군요 = "I see / is that so." Used when realizing something new. 돌아가다 = to go back/return.', words: ['아직 — still / yet', '돌아가지 않았군요 — I see you didn\'t go back', '많이 놀랐죠? — you were very surprised, right?'], phrases: ['돌아가다 = to go back', '아직 = still / not yet', '많이 = a lot / very', '~죠? = right? (confirmation)'], grammarNote: '~군요 = "I see that / so it is." Used when making a new realization. 왔군요 = I see you\'ve come.', character: 'Ri Jung-hyeok', emotion: 'Composed, hiding surprise' },
            { id: 3, timestamp: '0:36', korean: '길을 잃었는데, 정신을 차려보니까 북한 소, 북한 아주머니, 북한 초등학생들이 있었어요.', romanization: 'gi-reul il-heot-neun-de, jeong-sin-eul cha-ryeo bo-ni-kka buk-han so, buk-han a-ju-meo-ni, buk-han cho-deung-hak-saeng-deul-i i-sseo-sseo-yo', englishPronunciation: 'GEE-reul il-HUT-nun-deh, jung-SHIN-ul chah-RYUH boh-NEE-kah book-HAHN soh, book-HAHN ah-joo-MUH-nee, book-HAHN choh-DUNG-hak-seng-DUL-ee ee-ssuh-SSUH-yo', english: 'I got lost, and when I came back to my senses, there were North Korean cows, North Korean aunts, and North Korean elementary school students.', usage: 'Narrating a disorienting past experience using the "when I did X, I realized Y" structure.', tip: '정신을 차리다 = to come to one\'s senses / to regain clarity. Essential Korean idiom.', words: ['길을 잃었는데 — got lost, and', '정신을 차려보니까 — when I came to my senses', '북한 — North Korean'], phrases: ['길을 잃다 = to get lost', '정신을 차리다 = to come to your senses', '~보니까 = upon doing X, I realized Y'], grammarNote: '~아/어 보니까 = "upon trying/doing X, I found that Y." 해보니까 = when I tried it, I found that... Very useful!', character: 'Yoon Se-ri', emotion: 'Dramatic, comedic storytelling' },
            { id: 4, timestamp: '1:06', korean: '아, 이 여자는 항복할 기색이 전혀 없네요. 몰래 군사분계선을 넘어온 거잖아요.', romanization: 'a, i yeo-ja-neun hang-bok-hal gi-saek-i jeon-hyeo eom-ne-yo. mol-lae gun-sa-bun-gye-seon-eul neo-meo-on geo-ja-na-yo', englishPronunciation: 'ah, ee yuh-JAH-neun hahng-BOK-hahl gi-SEK-ee jun-HYU um-NEH-yo. MOL-leh gun-SAH-bun-geh-sun-ul nuh-muh-ON guh-ja-NAH-yo', english: "She doesn't show any intention of surrendering. She secretly crossed the military demarcation line, didn't she?", usage: 'Internal assessment using 전혀 없다 (none whatsoever) and ~잖아요 (as you know).', tip: '전혀 (jeon-hyeo) + negative = "not at all / not in the slightest." One of the strongest negation intensifiers.', words: ['항복할 기색 — intention to surrender', '전혀 없네요 — none whatsoever', '몰래 — secretly', '군사분계선 — military demarcation line'], phrases: ['전혀 없어요 = there is none at all', '몰래 = secretly / sneakily', '~잖아요 = isn\'t it / as you know'], grammarNote: '전혀 (jeon-hyeo) = not at all (used ONLY with negatives). 전혀 몰라요 = I have absolutely no idea.', character: 'Ri Jung-hyeok (internal)', emotion: 'Conflicted, analytical' },
            { id: 5, timestamp: '1:25', korean: '원칙대로라면 없애야 하는데. 죽이고 싶어요? 그런데 여기가 당신 집이에요? 진짜?', romanization: 'won-chik-dae-ro-ra-myeon eop-ssae-ya ha-neun-de. juk-i-go si-peo-yo? geu-reon-de yeo-gi-ga dang-sin jip-i-e-yo? jin-jja?', englishPronunciation: 'won-CHIK-deh-ro-rah-MYUN up-SEH-ya hah-NUN-deh. JOOK-ee-go shi-PUH-yo? guh-RUN-deh yuh-GEE-gah dahng-SHIN jip-ee-EH-yo? JIN-jah?', english: 'According to the rules, I should get rid of her. Do you want to kill her? But is this your home? Really?', usage: 'The collision between duty and reality — principles vs. the unexpected.', tip: '원칙대로 = "according to the rules/principles." 대로 (dae-ro) = according to / following.', words: ['원칙대로라면 — if according to the rules', '없애야 하는데 — should get rid of, but', '죽이고 싶어요 — do you want to kill'], phrases: ['원칙 = principle/rule', '~대로라면 = if according to X', '없애다 = to eliminate / get rid of', '~고 싶어요? = do you want to do X?'], grammarNote: '~대로 = "according to / as per." 말한 대로 = as you said. 계획대로 = according to plan.', character: 'Both', emotion: 'Shock, moral tension, dark humor' },
        ],
    },
    {
        id: 'a6', youtubeId: 'A4IxJj4eHWM', title: 'Attorney Woo — The Scammer Confrontation', subtitle: 'Every line from the sharp scammer interrogation scene',
        themeIcon: '🔎', drama: 'Extraordinary Attorney Woo (이상한 변호사 우영우)', genre: 'Legal Drama', levelColor: '#e94560',
        context: 'Real scene: A quick-witted girl confronts someone she suspects is a scammer, while a man debates whether he counts as "employed."',
        dubInstructions: 'Fast-paced sharp dialogue — these characters interrupt each other. Practice speed and confident delivery. Match the rhythm!',
        lines: [
            { id: 1, timestamp: '0:00', korean: '야, 너 진짜 사기꾼이야? 왜 이렇게 거짓말을 못해?', romanization: 'ya, neo jin-jja sa-gi-kkun-i-ya? wae i-reo-ke geo-jin-mal-eul mot-hae', englishPronunciation: 'YAH, nuh JIN-jah sah-GEE-kkun-ee-YAH? weh ee-REH-keh GUH-jin-mahl-ul mot-HEH', english: 'Hey, are you really a scammer? Why are you so bad at lying?', usage: 'Aggressive informal speech — 야 (ya) is a blunt attention-getter used between close people or toward someone younger.', tip: '야 (ya) = "hey" in casual Korean. Only use with close friends or younger people — never with elders or strangers.', words: ['야 — hey (casual/blunt)', '사기꾼 — scammer', '왜 이렇게 — why so', '거짓말을 못해 — can\'t lie'], phrases: ['야 = hey (casual/rude)', '사기꾼 = scammer/con artist', '거짓말 = a lie', '못해 = can\'t do (casual)'], grammarNote: '못해 = can\'t do (casual). 못해요 = polite. Drop the formality for speed and bluntness.', character: 'Girl', emotion: 'Suspicious, aggressive, sharp' },
            { id: 2, timestamp: '0:10', korean: '왜 꺼진 핸드폰을 들고 다녀요? 장식이에요? 무기예요?', romanization: 'wae kkeo-jin haen-deu-pon-eul deul-go da-nyeo-yo? jang-si-gi-e-yo? mu-gi-ye-yo?', englishPronunciation: 'weh KKUH-jin HEN-duh-pon-ul dul-GO dah-NYUH-yo? jahng-SHI-gee-eh-yo? moo-GEE-yeh-yo?', english: 'Why are you carrying around a phone that\'s turned off? Is it decoration? A weapon?', usage: 'Sarcastic rhetorical questions fired in rapid succession — classic K-Drama confrontation style.', tip: '꺼지다 = to turn off (for electronics). 켜지다 = to turn on. Essential Korean electronics vocabulary.', words: ['꺼진 — turned off (modifier)', '들고 다녀요 — carry around', '장식이에요 — is it decoration', '무기예요 — is it a weapon'], phrases: ['꺼지다 = to turn off', '켜지다 = to turn on', '들고 다니다 = to carry around', '장식 = decoration'], grammarNote: '꺼진 핸드폰 = a phone that is turned off. Verb ~진 = past tense modifier. 꺼진 + noun = "noun that is/was turned off."', character: 'Girl', emotion: 'Sarcastic, rapid-fire' },
            { id: 3, timestamp: '0:21', korean: '밥 잘 챙겨 먹는데, 저 여자 배고프지 않냐고요?', romanization: 'bap jal chaeng-gyeo meok-neun-de, jeo yeo-ja bae-go-peu-ji an-nya-go-yo', englishPronunciation: 'bahb jahl cheng-GYUH muk-NUN-deh, JUH yuh-JAH beh-go-PUH-ji ahn-NYAH-go-yo', english: 'You\'re good at making sure you eat every meal, but isn\'t that girl hungry?', usage: 'Contrast between self-care and caring for others — using ~는데 (but) and a reproachful question.', tip: '밥을 챙기다 = "to take care of your meals / to make sure you eat." A phrase Koreans use to show concern.', words: ['밥 잘 챙겨 먹는데 — you eat well, but', '저 여자 — that girl', '배고프지 않냐고요 — isn\'t she hungry'], phrases: ['밥을 챙기다 = to take care of/manage meals', '~는데 = but / however (contrast)', '배고프다 = to be hungry'], grammarNote: '~는데 creates contrast: "you do X, BUT..." 잘 먹는데 = you eat well, but... Very natural spoken Korean.', character: 'Girl', emotion: 'Pointed, accusatory' },
            { id: 4, timestamp: '0:41', korean: '왜 당신 친구들은 다 이래요? 저번엔 거지, 이번엔 초딩.', romanization: 'wae dang-sin chin-gu-deul-eun da i-rae-yo? jeo-beon-en geo-ji, i-beon-en cho-ding', englishPronunciation: 'weh DAHNG-shin CHIN-goo-dul-un dah ee-REH-yo? JUH-bun-en GUH-ji, ee-BUN-en CHO-ding', english: 'Why are all your friends like this? Last time one was a beggar, now this one\'s an elementary school kid.', usage: 'Comparing past and present situations — 저번엔 (last time) vs. 이번엔 (this time).', tip: '초딩 is slang for elementary school kid — from 초등학생. Slightly rude; don\'t use it to describe a real child to their face.', words: ['왜 이래요 — why are they like this', '저번엔 — last time', '거지 — beggar', '이번엔 — this time', '초딩 — elementary school kid (slang)'], phrases: ['저번엔 = last time', '이번엔 = this time', '거지 = beggar', '왜 다 이래요? = why are they all like this?'], grammarNote: '저번 = last time. 이번 = this time. 다음번 = next time. Adding ~에는 = "as for last time / this time."', character: 'Girl', emotion: 'Exasperated, contemptuous' },
            { id: 5, timestamp: '0:50', korean: '저는 프리랜서예요. 직업이에요. 나라를 위해서 열심히 일해요.', romanization: 'jeo-neun peu-ri-raen-seo-ye-yo. ji-geo-bi-e-yo. na-ra-reul wi-hae-seo yeol-sim-hi il-hae-yo', englishPronunciation: 'JUH-neun PUH-ree-REN-suh-yeh-yo. ji-GUP-ee-eh-yo. nah-RAH-reul WEE-heh-suh yul-SHIM-hee il-HEH-yo', english: 'I\'m a freelancer. It\'s a profession. I work hard for the country.', usage: 'Self-defense using classification and patriotic justification — comedic logic.', tip: '나라를 위해서 = "for the sake of the country." 위해서 = for the sake of. Lends a heroic flair to anything.', words: ['프리랜서 — freelancer', '직업이에요 — it is a profession', '나라를 위해서 — for the country', '열심히 일해요 — work hard'], phrases: ['프리랜서 = freelancer', '직업 = job/profession', '나라를 위해서 = for the sake of the country', '열심히 = hard/diligently'], grammarNote: '~를 위해서 = "for the sake of X." 가족을 위해서 = for the family. 미래를 위해서 = for the future.', character: 'Man', emotion: 'Defensive, proudly ridiculous' },
            { id: 6, timestamp: '1:21', korean: '그런데 그 아이는 방학이 됐어요? 학교 빠졌어요?', romanization: 'geu-reon-de geu a-i-neun bang-hak-i dwae-sseo-yo? hak-gyo ppa-jyeo-sseo-yo', englishPronunciation: 'guh-RUN-deh guh ah-EE-neun bahng-HAK-ee dweh-SSUH-yo? hak-GYO ppa-JYUH-ssuh-yo', english: 'But has that kid already started winter break? Are you skipping school?', usage: 'Catching an inconsistency — the moment suspicion turns into a sharp question.', tip: '방학 = school holiday/break. 빠지다 = to skip / be absent. 학교를 빠지다 = to skip school.', words: ['그런데 — but / by the way', '방학이 됐어요 — is it holiday now', '학교 빠졌어요 — skipped school'], phrases: ['방학 = school break/holiday', '학교를 빠지다 = to skip school', '그런데 = but / however / by the way'], grammarNote: '그런데 = "but / however." Also used to change the subject in conversation. 그런데 말이에요 = "by the way..."', character: 'Man', emotion: 'Suddenly suspicious, sharp' },
        ],
    },
    {
        id: 'a7', youtubeId: 'wCPqVw4cOU0', title: 'Running Away — Let Me Go', subtitle: 'A tense emotional confrontation and escape scene',
        themeIcon: '🏃', drama: 'Korean Drama', genre: 'Romance', levelColor: '#e94560',
        context: 'Real scene: One person has run off. The other catches up and tries to help, but they resist being comforted.',
        dubInstructions: 'Two contrasting energies: one desperate to leave, one trying to hold on. Capture the push and pull of this scene.',
        lines: [
            { id: 1, timestamp: '0:00', korean: '어디로 갔어요? 눈 깜짝할 사이에 어디로 갔어요?', romanization: 'eo-di-ro ga-sseo-yo? nun kkam-jjak-hal sa-i-e eo-di-ro ga-sseo-yo', englishPronunciation: 'UH-dee-ro gah-SSUH-yo? noon kkahm-JJAHK-hahl sah-EE-eh UH-dee-ro gah-SSUH-yo', english: 'Where did he run off to? In just a blink of an eye, where did he go?', usage: 'Expressing disbelief at someone\'s sudden disappearance using a vivid idiom.', tip: '눈 깜짝할 사이에 = "in the time it takes to blink" — a beautiful Korean idiom for an instant.', words: ['어디로 갔어요 — where did you/he go', '눈 깜짝할 사이에 — in the blink of an eye'], phrases: ['눈 깜짝할 사이에 = in the blink of an eye (idiom)', '어디로 갔어요? = where did they go?'], grammarNote: '~할 사이에 = "in the time it takes to do X." 잠깐 사이에 = in just a moment. Very idiomatic Korean.', character: 'Narrator/Pursuing character', emotion: 'Confused, worried, searching' },
            { id: 2, timestamp: '0:44', korean: '일단 차 타요. 데려다 줄게요.', romanization: 'il-dan cha ta-yo. de-ryeo-da jul-ge-yo', englishPronunciation: 'il-DAHN chah TAH-yo. deh-RYUH-dah jool-GEH-yo', english: "Let's get in the car first. I'll take you back.", usage: 'Practical offer and a personal promise — 일단 (first of all) and ~ㄹ게요 (I will do).', tip: '일단 (il-dan) = "first of all / for now." Used to calm a tense situation by suggesting a practical first step.', words: ['일단 — first of all / for now', '차 타요 — let\'s get in the car', '데려다 줄게요 — I will take you (there)'], phrases: ['일단 = first of all / for now', '차를 타다 = to get in a car', '데려다 주다 = to take someone (to a place)'], grammarNote: '데려다 주다 = to take/escort someone to a place. 학교에 데려다 줄게요 = I\'ll take you to school.', character: 'One character', emotion: 'Calm, trying to help' },
            { id: 3, timestamp: '1:11', korean: '놔요. 이러려고 온 게 아니에요.', romanization: 'nwa-yo. i-reo-ryeo-go on ge a-ni-e-yo', englishPronunciation: 'nwah-YO. ee-REH-ryuh-go on geh ah-NEE-eh-yo', english: "Let go of me. I didn't come looking for you for this.", usage: 'Asserting boundaries — 놔요 (let go) and clarifying intent using ~려고 온 게 아니다.', tip: '~려고 온 게 아니에요 = "I didn\'t come in order to do X." A way to clarify your purpose when it\'s been misread.', words: ['놔요 — let go / release', '이러려고 — in order to do this', '온 게 아니에요 — I did not come'], phrases: ['놔요 = let go! release!', '~려고 온 게 아니에요 = I didn\'t come in order to do X', '이러다 = to act/do like this'], grammarNote: '~려고 온 게 아니에요 = "I didn\'t come to do X." 싸우려고 온 게 아니에요 = I didn\'t come to fight.', character: 'Other character', emotion: 'Resisting, hurt, pushing away' },
        ],
    },
];

const LEVEL_CONFIG = {
    beginner: { label: 'Beginner', emoji: '🌱', color: '#4ade80', desc: 'Everyday Seoul survival — airport, restaurants, shops, hotels, emergencies & more', count: BEGINNER_SCENES.length + ' situations' },
    intermediate: { label: 'Intermediate', emoji: '⚡', color: '#fb923c', desc: 'Real K-Drama clips — learn every phrase from actual scenes', count: INTERMEDIATE_SCENES.length + ' drama scenes' },
    advanced: { label: 'Advanced', emoji: '🔥', color: '#e94560', desc: 'Full drama scripts — every line, every character, dub it yourself', count: ADVANCED_SCENES.length + ' full scripts' },
};

const GENRE_COLORS = {
    'Daily Life': '#38bdf8', Travel: '#fb923c', 'Legal Drama': '#a78bfa',
    'Medical Drama': '#4ade80', Romance: '#f472b6', 'Historical Drama': '#f8d347',
    'Fantasy Romance': '#c084fc', 'Crime Comedy': '#fb923c', 'Comedy Drama': '#38bdf8',
    'Emergency': '#ef4444', 'Nightlife': '#c084fc', 'Culture': '#f8d347',
    'Social': '#38bdf8', 'Basics': '#94a3b8',
};

// ─────────────────────────────────────────────────────────────────────────────
export default function Learn() {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const [activeLevel, setActiveLevel] = useState('beginner');
    const [selected, setSelected] = useState(null);
    const [mode, setMode] = useState('script');
    const [expandedLine, setExpanded] = useState(null);
    const [learned, setLearned] = useState(() => loadLearnedFromStorage());
    const [search, setSearch] = useState('');
    const [speaking, setSpeaking] = useState(null);

    const [shadowRec, setShadowRec] = useState(false);
    const [shadowResult, setShadowResult] = useState(null);
    const [shadowTarget, setShadowTarget] = useState(null);

    const [quizIdx, setQuizIdx] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [quizListening, setQuizListening] = useState(false);
    const [quizHeard, setQuizHeard] = useState('');
    const [quizFeedback, setQuizFeedback] = useState(null);
    const [quizRevealed, setQuizRevealed] = useState(false);

    const recRef = useRef(null);

    useEffect(() => {
        if (!user?.id) return;
        // Merge API data with localStorage
        fetchLearnedWords(user.id).then(keys => {
            if (keys.length) {
                setLearned(prev => {
                    const merged = new Set([...prev, ...keys]);
                    saveLearnedToStorage(merged);
                    return merged;
                });
            }
        });
    }, [user?.id]);

    const allScenes = [...BEGINNER_SCENES, ...INTERMEDIATE_SCENES, ...ADVANCED_SCENES];
    const scenes = activeLevel === 'beginner' ? BEGINNER_SCENES
        : activeLevel === 'intermediate' ? INTERMEDIATE_SCENES : ADVANCED_SCENES;

    const displayScenes = search
        ? scenes.filter(v => v.title.toLowerCase().includes(search.toLowerCase()) || (v.drama || '').toLowerCase().includes(search.toLowerCase()) || v.genre.toLowerCase().includes(search.toLowerCase()))
        : scenes;

    const totalLearned = learned.size;

    const handleSpeak = useCallback((text, id, slow = false) => {
        setSpeaking(id);
        speakKorean(text, slow);
        setTimeout(() => setSpeaking(null), slow ? text.length * 120 + 300 : text.length * 80 + 200);
    }, []);

    const markLearned = useCallback((lineKey, line, sceneLevel) => {
        setLearned(prev => {
            if (prev.has(lineKey)) return prev;
            const next = new Set(prev);
            next.add(lineKey);
            saveLearnedToStorage(next);
            if (user?.id) {
                saveLearnedWord(user.id, lineKey, line.korean, line.english, sceneLevel);
            }
            return next;
        });
    }, [user?.id]);

    const startShadow = (line) => {
        setShadowTarget(line); setShadowResult(null);
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { alert('Use Chrome for voice recording!'); return; }
        const r = new SR(); r.lang = 'ko-KR'; r.continuous = false;
        r.onresult = (e) => {
            const spoken = e.results[0][0].transcript;
            const target = line.korean.replace(/[!?.]/g, '').trim();
            const score = Math.min(100, Math.floor((spoken.length / target.length) * 80 + Math.random() * 20));
            setShadowResult({ spoken, score });
            setShadowRec(false);
            if (score >= 80 && selected) {
                const idx = selected.lines.findIndex(l => l.korean === line.korean);
                if (idx !== -1) {
                    const lk = `${selected.id}-${idx}`;
                    markLearned(lk, line, selected.levelColor === '#4ade80' ? 'beginner' : selected.levelColor === '#fb923c' ? 'intermediate' : 'advanced');
                }
            }
        };
        r.onend = () => setShadowRec(false);
        recRef.current = r; setShadowRec(true); r.start();
    };

    const startQuizSpeech = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { alert('Use Chrome!'); return; }
        const r = new SR(); r.lang = 'ko-KR'; r.continuous = false;
        r.onresult = (e) => {
            const spoken = e.results[0][0].transcript.trim();
            setQuizHeard(spoken);
            const line = selected.lines[quizIdx];
            if (fuzzyMatch(spoken, line.korean)) {
                setQuizFeedback({ type: 'success', msg: '🎉 완벽해요! Perfect!' });
                setQuizScore(s => s + 1);
                speakKorean(line.korean, false);
                const lk = `${selected.id}-${quizIdx}`;
                const level = selected.levelColor === '#4ade80' ? 'beginner' : selected.levelColor === '#fb923c' ? 'intermediate' : 'advanced';
                markLearned(lk, line, level);
            } else {
                setQuizFeedback({ type: 'error', msg: '❌ Not quite! Listen and try again.' });
                speakKorean(line.korean, true);
            }
            setQuizListening(false);
        };
        r.onend = () => setQuizListening(false);
        r.onerror = () => { setQuizListening(false); setQuizFeedback({ type: 'error', msg: 'Mic error. Check permissions.' }); };
        recRef.current = r; setQuizListening(true); setQuizHeard(''); setQuizFeedback(null); r.start();
    };

    const quizNext = () => {
        setQuizFeedback(null); setQuizHeard(''); setQuizRevealed(false);
        setQuizListening(false); recRef.current?.abort();
        if (quizIdx + 1 < selected.lines.length) setQuizIdx(i => i + 1);
        else setQuizIdx(selected.lines.length);
    };

    const openScene = (v) => {
        setSelected(v); setMode('script'); setExpanded(null);
        setQuizIdx(0); setQuizScore(0); setQuizFeedback(null);
        setQuizHeard(''); setQuizListening(false); setQuizRevealed(false); setShadowResult(null);
    };

    const lvlCfg = LEVEL_CONFIG[activeLevel];

    return (
        <div style={{ minHeight: '100vh', background: isDark ? '#08081a' : '#f5f5f7', color: isDark ? '#fff' : '#1a1a2e', fontFamily: "'DM Sans',system-ui,sans-serif", transition: 'background 0.4s ease, color 0.4s ease' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 0 rgba(233,69,96,0.3)}50%{box-shadow:0 0 22px rgba(233,69,96,0.6)}}
        @keyframes learnPop{0%{transform:scale(1)}50%{transform:scale(1.15)}100%{transform:scale(1)}}
        @keyframes micPulse{0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,0.5)}70%{box-shadow:0 0 0 18px rgba(74,222,128,0)}}
        .scene-card:hover{transform:translateY(-5px)!important;}
        .line-row:hover{background:rgba(255,255,255,0.03)!important}
        .spk-btn:hover{opacity:.8} .spk-btn:active{transform:scale(.95)}
        .learned-badge{animation:learnPop .35s ease}
      `}</style>

            {/* NAV */}
            <Navbar />

            {/* ═══ SCENE BROWSER ═══ */}
            {!selected && (
                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '36px 24px', animation: 'fadeUp .4s ease' }}>
                    <div style={{ marginBottom: '28px' }}>
                        <div style={{ fontSize: '11px', color: '#e94560', fontWeight: '700', letterSpacing: '3px', marginBottom: '8px' }}>CINELINGO DRAMA LEARNING</div>
                        <h1 style={{ fontSize: '40px', fontWeight: '900', fontFamily: "'Syne',sans-serif", margin: '0 0 6px', letterSpacing: '-1px' }}>Choose Your Level 🎬</h1>
                        <p style={{ fontSize: '14px', color: '#555', margin: 0 }}>Beginner: survive Seoul from day 1 — Intermediate & Advanced: real K-Drama scripts with every Korean line</p>
                    </div>

                    {/* Level tabs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '28px' }}>
                        {Object.entries(LEVEL_CONFIG).map(([key, cfg]) => (
                            <div key={key} onClick={() => { setActiveLevel(key); setSearch(''); }}
                                style={{
                                    padding: '20px', borderRadius: '16px', cursor: 'pointer', transition: 'all .25s',
                                    border: `2px solid ${activeLevel === key ? cfg.color : 'rgba(255,255,255,0.07)'}`,
                                    background: activeLevel === key ? `${cfg.color}12` : 'rgba(255,255,255,0.02)',
                                    transform: activeLevel === key ? 'translateY(-3px)' : 'none',
                                    boxShadow: activeLevel === key ? `0 8px 32px ${cfg.color}22` : 'none'
                                }}>
                                <div style={{ fontSize: '22px', fontWeight: '900', color: cfg.color, fontFamily: "'Syne',sans-serif", marginBottom: '6px' }}>{cfg.emoji} {cfg.label}</div>
                                <div style={{ fontSize: '12px', color: activeLevel === key ? cfg.color : '#555', lineHeight: 1.5 }}>{cfg.desc}</div>
                                <div style={{ marginTop: '10px', fontSize: '10px', color: activeLevel === key ? cfg.color : '#333', fontWeight: '700', letterSpacing: '1px' }}>{cfg.count}</div>
                            </div>
                        ))}
                    </div>

                    {/* How learned works */}
                    <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '12px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '22px' }}>✅</span>
                        <div style={{ fontSize: '13px', color: '#888', lineHeight: 1.5 }}>
                            <strong style={{ color: '#4ade80' }}>Lines are automatically marked as learned</strong> when you answer correctly in the quiz or score 80%+ in shadow mode. Your progress saves to your profile instantly.
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${activeLevel} scenes by title or genre...`}
                            style={{ flex: 1, padding: '11px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                        <VoicePicker accentColor={lvlCfg.color} isDark={isDark} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '16px' }}>
                        {displayScenes.map(v => {
                            const learnedInScene = v.lines.filter((_, i) => learned.has(`${v.id}-${i}`)).length;
                            return (
                                <div key={v.id} className="scene-card"
                                    style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${v.levelColor}22`, borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'all .22s' }}
                                    onClick={() => openScene(v)}>
                                    {v.youtubeId ? (
                                        <div style={{ position: 'relative', paddingTop: '52%', background: '#111', overflow: 'hidden' }}>
                                            <img src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`} alt={v.title}
                                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }}
                                                onError={e => { e.target.style.display = 'none'; }} />
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(8,8,26,0.88),transparent)' }} />
                                            <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                                                <span style={{ fontSize: '10px', padding: '3px 9px', borderRadius: '8px', background: `${GENRE_COLORS[v.genre] || '#888'}22`, border: `1px solid ${GENRE_COLORS[v.genre] || '#888'}55`, color: GENRE_COLORS[v.genre] || '#888', fontWeight: '700' }}>{v.genre}</span>
                                            </div>
                                            <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '10px', color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: '6px' }}>
                                                ✅ {learnedInScene}/{v.lines.length} · Real clip
                                            </div>
                                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '40px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.9))' }}>{v.themeIcon}</div>
                                        </div>
                                    ) : (
                                        <div style={{ padding: '28px 20px', background: `linear-gradient(135deg,${v.levelColor}15,${v.levelColor}05)`, borderBottom: `1px solid ${v.levelColor}22` }}>
                                            <div style={{ fontSize: '44px', marginBottom: '8px' }}>{v.themeIcon}</div>
                                            <div style={{ fontSize: '10px', color: v.levelColor, fontWeight: '700', letterSpacing: '1px' }}>{v.genre}</div>
                                            <div style={{ fontSize: '10px', color: '#555', marginTop: '4px' }}>✅ {learnedInScene} / {v.lines.length} lines learned</div>
                                        </div>
                                    )}
                                    <div style={{ padding: '16px' }}>
                                        <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px', fontFamily: "'Syne',sans-serif", color: '#eee' }}>{v.title}</div>
                                        <div style={{ fontSize: '12px', color: '#555', marginBottom: '8px' }}>{v.subtitle}</div>
                                        {v.drama && <div style={{ fontSize: '10px', color: v.levelColor, fontWeight: '700', marginBottom: '6px' }}>📺 {v.drama}</div>}
                                        <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
                                            <div style={{ width: `${(learnedInScene / v.lines.length) * 100}%`, height: '100%', background: v.levelColor, borderRadius: '2px', transition: 'width .5s ease' }} />
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#333', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '6px 10px', fontStyle: 'italic' }}>{v.context}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ═══ SCENE DETAIL ═══ */}
            {selected && (
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px', animation: 'fadeUp .35s ease' }}>
                    <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', color: '#555', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '16px', padding: 0 }}>
                        ← Back to {lvlCfg.emoji} {lvlCfg.label} Scenes
                    </button>

                    {/* Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: selected.youtubeId ? '1fr 1fr' : '1fr', gap: '20px', marginBottom: '24px' }}>
                        {selected.youtubeId && (
                            <div style={{ borderRadius: '14px', overflow: 'hidden', aspectRatio: '16/9', background: '#000' }}>
                                <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${selected.youtubeId}?rel=0`}
                                    title={selected.title} frameBorder="0"
                                    allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope" allowFullScreen style={{ display: 'block' }} />
                            </div>
                        )}
                        <div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '8px', background: `${GENRE_COLORS[selected.genre] || '#888'}22`, border: `1px solid ${GENRE_COLORS[selected.genre] || '#888'}44`, color: GENRE_COLORS[selected.genre] || '#888', fontWeight: '700' }}>{selected.genre}</span>
                                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '8px', background: `${selected.levelColor}22`, border: `1px solid ${selected.levelColor}44`, color: selected.levelColor, fontWeight: '700' }}>{lvlCfg.emoji} {lvlCfg.label}</span>
                            </div>
                            <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 4px', fontFamily: "'Syne',sans-serif" }}>{selected.themeIcon} {selected.title}</h2>
                            <p style={{ fontSize: '13px', color: '#555', margin: '0 0 8px' }}>{selected.subtitle}</p>
                            {selected.drama && <div style={{ fontSize: '12px', color: selected.levelColor, fontWeight: '700', marginBottom: '8px' }}>📺 {selected.drama}</div>}
                            <div style={{ fontSize: '12px', color: '#888', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px', lineHeight: 1.5 }}>{selected.context}</div>
                            {selected.dubInstructions && (
                                <div style={{ fontSize: '11px', color: '#f8d347', background: 'rgba(248,211,71,0.06)', border: '1px solid rgba(248,211,71,0.2)', borderRadius: '10px', padding: '8px 12px', marginBottom: '12px', lineHeight: 1.5 }}>
                                    🎙️ Dubbing: {selected.dubInstructions}
                                </div>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '12px' }}>
                                {[['📜', selected.lines.length, 'Total Lines'],
                                ['✅', selected.lines.filter((_, i) => learned.has(`${selected.id}-${i}`)).length, 'Learned'],
                                ['🎯', selected.lines.length - selected.lines.filter((_, i) => learned.has(`${selected.id}-${i}`)).length, 'Remaining']
                                ].map(([icon, n, label]) => (
                                    <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '20px', fontWeight: '900', fontFamily: "'Syne',sans-serif", color: label === 'Learned' ? '#4ade80' : selected.levelColor }}>{icon} {n}</div>
                                        <div style={{ fontSize: '10px', color: '#444', marginTop: '2px' }}>{label}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ fontSize: '11px', color: '#38bdf8', background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '10px', padding: '8px 12px', lineHeight: 1.5 }}>
                                ✅ Lines <strong>auto-mark as learned</strong> when you speak them correctly in quiz or score 80%+ in shadow mode. Synced to your profile.
                            </div>
                        </div>
                    </div>

                    {/* Mode Tabs */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                        {[['script', '📜 Script Mode', 'Read & Listen'], ['shadow', '🎤 Shadow Mode', 'Record Yourself'], ['quiz', '🗣️ Speak Quiz', 'Say Korean aloud']].map(([m, label, sub]) => (
                            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit', border: `1px solid ${mode === m ? selected.levelColor : 'rgba(255,255,255,0.08)'}`, background: mode === m ? `${selected.levelColor}18` : 'transparent', color: mode === m ? selected.levelColor : '#555', transition: 'all .2s' }}>
                                <div style={{ fontSize: '13px', fontWeight: '800' }}>{label}</div>
                                <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.7 }}>{sub}</div>
                            </button>
                        ))}
                    </div>

                    {/* ════ SCRIPT MODE ════ */}
                    {mode === 'script' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {selected.lines.map((line, idx) => {
                                const lk = `${selected.id}-${idx}`;
                                const isExp = expandedLine === idx;
                                const isLearned = learned.has(lk);
                                const isSpeaking = speaking === lk;
                                return (
                                    <div key={idx} style={{ background: isLearned ? 'rgba(74,222,128,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isLearned ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '16px', overflow: 'hidden', transition: 'all .2s' }}>
                                        <div className="line-row" style={{ padding: '18px 20px', cursor: 'pointer', borderBottom: isExp ? '1px solid rgba(255,255,255,0.07)' : 'none' }} onClick={() => setExpanded(isExp ? null : idx)}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '10px', color: '#333', fontWeight: '700', letterSpacing: '1px' }}>LINE {idx + 1}</span>
                                                        {line.timestamp && <span style={{ fontSize: '10px', color: selected.levelColor, fontWeight: '700', background: `${selected.levelColor}15`, padding: '1px 7px', borderRadius: '6px' }}>{line.timestamp}</span>}
                                                        {line.character && <span style={{ fontSize: '10px', color: '#888', fontWeight: '700', background: 'rgba(255,255,255,0.05)', padding: '1px 7px', borderRadius: '6px' }}>{line.character}</span>}
                                                        {line.emotion && <span style={{ fontSize: '10px', color: '#f8d347', background: 'rgba(248,211,71,0.1)', padding: '1px 7px', borderRadius: '6px' }}>{line.emotion}</span>}
                                                        {isLearned && (
                                                            <span className="learned-badge" style={{ fontSize: '10px', color: '#4ade80', fontWeight: '800', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', padding: '2px 10px', borderRadius: '20px', letterSpacing: '0.5px' }}>
                                                                ✅ Learned
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: '900', fontFamily: "'Syne',sans-serif", color: '#fff', marginBottom: '8px', lineHeight: 1.4, letterSpacing: '0.5px' }}>
                                                        {line.korean}
                                                    </div>
                                                    <div style={{ fontSize: '14px', color: '#e94560', fontWeight: '600', marginBottom: '5px' }}>{line.romanization}</div>
                                                    <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: '600', marginBottom: '7px', fontStyle: 'italic' }}>🗣 {line.englishPronunciation}</div>
                                                    <div style={{ fontSize: '16px', color: '#4ade80', fontWeight: '700', marginBottom: '6px' }}>{line.english}</div>
                                                    <div style={{ fontSize: '12px', color: '#555', fontStyle: 'italic' }}>💡 {line.usage}</div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button className="spk-btn" onClick={e => { e.stopPropagation(); handleSpeak(line.korean, lk, false); }}
                                                            style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: isSpeaking ? 'rgba(74,222,128,0.2)' : 'rgba(233,69,96,0.12)', color: isSpeaking ? '#4ade80' : '#e94560', fontSize: '18px', cursor: 'pointer', animation: isSpeaking ? 'glow 1s ease infinite' : 'none' }}>🔊</button>
                                                        <button className="spk-btn" onClick={e => { e.stopPropagation(); handleSpeak(line.korean, `${lk}-slow`, true); }}
                                                            style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', fontSize: '14px', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit' }}>🐢</button>
                                                    </div>
                                                    <span style={{ fontSize: '18px', color: '#333' }}>{isExp ? '▲' : '▼'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {isExp && (
                                            <div style={{ padding: '20px' }}>
                                                <div style={{ background: 'rgba(248,211,71,0.05)', border: '1px solid rgba(248,211,71,0.2)', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px' }}>
                                                    <div style={{ fontSize: '13px', color: '#f8d347', fontWeight: '700', marginBottom: '4px' }}>💡 Cultural Tip</div>
                                                    <div style={{ fontSize: '13px', color: '#888', lineHeight: 1.6 }}>{line.tip}</div>
                                                </div>
                                                {line.grammarNote && (
                                                    <div style={{ background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px' }}>
                                                        <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: '700', marginBottom: '4px' }}>📐 Grammar Note</div>
                                                        <div style={{ fontSize: '13px', color: '#888', lineHeight: 1.6 }}>{line.grammarNote}</div>
                                                    </div>
                                                )}
                                                <div style={{ marginBottom: '16px' }}>
                                                    <div style={{ fontSize: '11px', color: '#555', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px' }}>KEY PHRASES</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                        {line.phrases.map((p, i) => (
                                                            <div key={i} style={{ background: `${selected.levelColor}10`, border: `1px solid ${selected.levelColor}30`, borderRadius: '10px', padding: '8px 14px', fontSize: '13px', color: selected.levelColor, fontWeight: '600' }}>{p}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <div style={{ fontSize: '11px', color: '#555', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px' }}>VOCABULARY — click to hear</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                        {line.words.map((w, i) => {
                                                            const [kor, eng] = w.split(' — ');
                                                            return (
                                                                <div key={i} onClick={() => handleSpeak(kor, `${lk}-w${i}`)}
                                                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 16px', cursor: 'pointer', transition: 'all .2s', display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '100px' }}
                                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                                                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
                                                                    <div style={{ fontSize: '20px', fontWeight: '900', fontFamily: "'Syne',sans-serif", color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>{kor} <span style={{ fontSize: '14px', opacity: 0.5 }}>🔊</span></div>
                                                                    {eng && <div style={{ fontSize: '12px', color: '#4ade80', fontWeight: '600' }}>{eng}</div>}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button className="spk-btn" onClick={() => handleSpeak(line.korean, `${lk}-full`, false)}
                                                        style={{ padding: '10px 22px', background: 'linear-gradient(135deg,#e94560,#c73652)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit' }}>🔊 Hear Full Line</button>
                                                    <button className="spk-btn" onClick={() => handleSpeak(line.korean, `${lk}-slow2`, true)}
                                                        style={{ padding: '10px 22px', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '10px', color: '#38bdf8', fontSize: '14px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit' }}>🐢 Hear Slowly</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ════ SHADOW MODE ════ */}
                    {mode === 'shadow' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '14px', padding: '16px 20px', marginBottom: '8px' }}>
                                <div style={{ fontSize: '14px', fontWeight: '800', color: '#4ade80', marginBottom: '4px' }}>🎤 Shadow Mode — Repeat Korean after hearing it</div>
                                <div style={{ fontSize: '13px', color: '#555', lineHeight: 1.6 }}>
                                    1. Press 🔊 to hear the Korean line.<br />
                                    2. Press 🎤 to record yourself speaking Korean.<br />
                                    3. Score 80%+ and the line is <strong style={{ color: '#4ade80' }}>automatically marked learned</strong> and saved to your profile.
                                </div>
                            </div>
                            {selected.lines.map((line, idx) => {
                                const lk = `${selected.id}-${idx}`;
                                const isLearned = learned.has(lk);
                                return (
                                    <div key={idx} style={{ background: isLearned ? 'rgba(74,222,128,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isLearned ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '16px', padding: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                            {line.character && <span style={{ fontSize: '10px', color: selected.levelColor, fontWeight: '700' }}>{line.character}{line.emotion && ` — ${line.emotion}`}</span>}
                                            {line.timestamp && <span style={{ fontSize: '10px', color: '#555' }}>⏱ {line.timestamp}</span>}
                                            {isLearned && <span className="learned-badge" style={{ fontSize: '10px', color: '#4ade80', fontWeight: '800', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', padding: '2px 10px', borderRadius: '20px' }}>✅ Learned</span>}
                                        </div>
                                        <div style={{ fontSize: 'clamp(22px,3vw,28px)', fontWeight: '900', fontFamily: "'Syne',sans-serif", color: '#fff', marginBottom: '6px', lineHeight: 1.4 }}>{line.korean}</div>
                                        <div style={{ fontSize: '14px', color: '#e94560', fontWeight: '600', marginBottom: '4px' }}>{line.romanization}</div>
                                        <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: '600', marginBottom: '6px', fontStyle: 'italic' }}>🗣 {line.englishPronunciation}</div>
                                        <div style={{ fontSize: '16px', color: '#4ade80', fontWeight: '700', marginBottom: '16px' }}>{line.english}</div>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            <button className="spk-btn" onClick={() => handleSpeak(line.korean, `sh-${idx}`, false)} style={{ padding: '10px 20px', background: 'rgba(233,69,96,0.15)', border: '1px solid rgba(233,69,96,0.35)', borderRadius: '10px', color: '#e94560', fontSize: '14px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit' }}>🔊 Listen</button>
                                            <button className="spk-btn" onClick={() => handleSpeak(line.korean, `sh-s-${idx}`, true)} style={{ padding: '10px 20px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '10px', color: '#38bdf8', fontSize: '14px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit' }}>🐢 Slow</button>
                                            <button className="spk-btn" onClick={() => startShadow(line)}
                                                style={{ padding: '10px 20px', background: shadowRec && shadowTarget?.id === line.id ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${shadowRec && shadowTarget?.id === line.id ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '10px', color: shadowRec && shadowTarget?.id === line.id ? '#4ade80' : '#888', fontSize: '14px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit', animation: shadowRec && shadowTarget?.id === line.id ? 'glow 1s ease infinite' : 'none' }}>
                                                {shadowRec && shadowTarget?.id === line.id ? '⏺ Recording...' : '🎤 Record Korean'}
                                            </button>
                                        </div>
                                        {shadowResult && shadowTarget?.id === line.id && (
                                            <div style={{ marginTop: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px' }}>
                                                <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>You said: <span style={{ color: '#f8d347', fontWeight: '700' }}>"{shadowResult.spoken}"</span></div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${shadowResult.score}%`, height: '100%', borderRadius: '4px', transition: 'width 0.5s ease', background: shadowResult.score >= 80 ? '#4ade80' : shadowResult.score >= 60 ? '#fb923c' : '#e94560' }} />
                                                    </div>
                                                    <span style={{ fontSize: '18px', fontWeight: '900', color: shadowResult.score >= 80 ? '#4ade80' : shadowResult.score >= 60 ? '#fb923c' : '#e94560', fontFamily: "'Syne',sans-serif" }}>{shadowResult.score}%</span>
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#555', marginTop: '6px' }}>
                                                    {shadowResult.score >= 80 ? '🎉 Excellent! ✅ This line is now marked as learned in your profile!' : shadowResult.score >= 60 ? '👍 Good! Aim for 80%+ to mark as learned.' : '💪 Keep going! Use slow speed first.'}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ════ SPEAK QUIZ ════ */}
                    {mode === 'quiz' && (
                        <div>
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#555' }}>
                                    <span>Question {Math.min(quizIdx + 1, selected.lines.length)} of {selected.lines.length}</span>
                                    <span style={{ color: '#4ade80', fontWeight: '700' }}>🏅 {quizScore} / {selected.lines.length}</span>
                                </div>
                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${(quizIdx / selected.lines.length) * 100}%`, height: '100%', background: selected.levelColor, borderRadius: '3px', transition: 'width .4s ease' }} />
                                </div>
                            </div>

                            {quizIdx < selected.lines.length ? (() => {
                                const line = selected.lines[quizIdx];
                                const lk = `${selected.id}-${quizIdx}`;
                                const isAlreadyLearned = learned.has(lk);
                                return (
                                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px' }}>
                                        <div style={{ background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '12px', padding: '10px 16px', marginBottom: '24px', textAlign: 'center', fontSize: '12px', color: '#38bdf8', fontWeight: '600' }}>
                                            👂 Listen → 🗣 Speak the KOREAN aloud → Line auto-marks ✅ on correct answer
                                        </div>
                                        {isAlreadyLearned && (
                                            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                                                <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: '700', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', padding: '4px 14px', borderRadius: '20px' }}>✅ Already learned! Practice again to reinforce.</span>
                                            </div>
                                        )}
                                        {line.character && <div style={{ textAlign: 'center', marginBottom: '10px', fontSize: '11px', color: selected.levelColor, fontWeight: '700' }}>{line.character}{line.emotion && ` — ${line.emotion}`}</div>}
                                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                            <div style={{ fontSize: '11px', color: '#555', fontWeight: '700', letterSpacing: '2px', marginBottom: '12px' }}>SAY THIS IN KOREAN:</div>
                                            <div style={{ fontSize: '22px', fontWeight: '700', color: '#4ade80', marginBottom: '14px', lineHeight: 1.4 }}>{line.english}</div>
                                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 20px', marginBottom: '16px', display: 'inline-block', minWidth: '60%' }}>
                                                <div style={{ fontSize: '10px', color: '#444', letterSpacing: '2px', marginBottom: '5px' }}>PRONUNCIATION GUIDE</div>
                                                <div style={{ fontSize: '16px', color: '#e94560', fontWeight: '700', marginBottom: '4px' }}>{line.romanization}</div>
                                                <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: '600', fontStyle: 'italic' }}>🗣 {line.englishPronunciation}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
                                                <button className="spk-btn" onClick={() => speakKorean(line.korean, false)} style={{ padding: '9px 22px', background: 'rgba(233,69,96,0.12)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: '10px', color: '#e94560', fontSize: '14px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit' }}>🔊 Hear Normal</button>
                                                <button className="spk-btn" onClick={() => speakKorean(line.korean, true)} style={{ padding: '9px 22px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '10px', color: '#38bdf8', fontSize: '14px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit' }}>🐢 Hear Slowly</button>
                                            </div>
                                            <button onClick={() => { setQuizRevealed(r => !r); if (!quizRevealed) speakKorean(line.korean, true); }}
                                                style={{ background: 'transparent', border: 'none', color: quizRevealed ? '#f8d347' : '#444', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700', textDecoration: 'underline' }}>
                                                {quizRevealed ? `👁 Answer: ${line.korean}` : '👁 Reveal Korean text'}
                                            </button>
                                        </div>
                                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                            <button onClick={quizListening ? () => { recRef.current?.stop(); setQuizListening(false); } : startQuizSpeech}
                                                style={{ width: '100px', height: '100px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: quizListening ? 'linear-gradient(135deg,#4ade80,#22c55e)' : `linear-gradient(135deg,${selected.levelColor},${selected.levelColor}bb)`, fontSize: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', animation: quizListening ? 'micPulse 1.2s ease-out infinite' : 'none', boxShadow: quizListening ? 'none' : `0 6px 32px ${selected.levelColor}55`, transition: 'all .2s' }}>
                                                {quizListening ? '⏹' : '🎤'}
                                            </button>
                                            <div style={{ fontSize: '15px', color: quizListening ? '#4ade80' : '#666', fontWeight: '700' }}>
                                                {quizListening ? '🎙 Listening... speak Korean now!' : 'Tap mic and speak Korean 🇰🇷'}
                                            </div>
                                        </div>
                                        {quizHeard && (
                                            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '11px', color: '#444', marginBottom: '6px', fontWeight: '700', letterSpacing: '1px' }}>YOU SAID (Korean recognized):</div>
                                                <div style={{ fontSize: '26px', fontWeight: '900', fontFamily: "'Syne',sans-serif", color: '#f8d347' }}>{quizHeard}</div>
                                            </div>
                                        )}
                                        {quizFeedback && (
                                            <div style={{ textAlign: 'center', marginBottom: '20px', padding: '16px', borderRadius: '14px', background: quizFeedback.type === 'success' ? 'rgba(74,222,128,0.1)' : 'rgba(233,69,96,0.1)', border: `1px solid ${quizFeedback.type === 'success' ? 'rgba(74,222,128,0.4)' : 'rgba(233,69,96,0.4)'}`, color: quizFeedback.type === 'success' ? '#4ade80' : '#e94560' }}>
                                                <div style={{ fontSize: '20px', fontWeight: '900', fontFamily: "'Syne',sans-serif", marginBottom: '6px' }}>{quizFeedback.msg}</div>
                                                {quizFeedback.type === 'success' && (
                                                    <>
                                                        <div style={{ fontSize: '24px', fontFamily: "'Syne',sans-serif", fontWeight: '900', color: '#fff', marginBottom: '8px' }}>{line.korean}</div>
                                                        <div style={{ fontSize: '12px', color: '#4ade80', fontWeight: '600' }}>✅ This line is now marked as learned in your profile!</div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                            {quizFeedback?.type === 'success' ? (
                                                <button onClick={quizNext} style={{ padding: '13px 40px', background: `linear-gradient(135deg,${selected.levelColor},${selected.levelColor}aa)`, border: 'none', borderRadius: '12px', color: '#fff', fontSize: '16px', fontWeight: '900', cursor: 'pointer', fontFamily: "'Syne',sans-serif" }}>Next →</button>
                                            ) : (
                                                <>
                                                    {quizFeedback?.type === 'error' && <button onClick={() => { setQuizFeedback(null); setQuizHeard(''); }} style={{ padding: '12px 24px', background: 'rgba(233,69,96,0.12)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: '12px', color: '#e94560', fontSize: '14px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit' }}>🔄 Try Again</button>}
                                                    <button onClick={quizNext} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#666', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Skip →</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })() : (
                                <div style={{ textAlign: 'center', padding: '56px' }}>
                                    <div style={{ fontSize: '72px', marginBottom: '16px' }}>{quizScore === selected.lines.length ? '🏆' : '🎉'}</div>
                                    <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#f8d347', fontFamily: "'Syne',sans-serif", marginBottom: '8px' }}>Scene Complete!</h2>
                                    <div style={{ fontSize: '48px', fontWeight: '900', color: quizScore === selected.lines.length ? '#4ade80' : '#e94560', fontFamily: "'Syne',sans-serif", marginBottom: '8px' }}>{quizScore} / {selected.lines.length}</div>
                                    <div style={{ fontSize: '14px', color: '#4ade80', marginBottom: '8px', fontWeight: '600' }}>✅ {quizScore} line{quizScore !== 1 ? 's' : ''} auto-saved to your profile!</div>
                                    <p style={{ color: '#555', marginBottom: '24px' }}>{quizScore === selected.lines.length ? '🎉 완벽해요! Perfect!' : quizScore >= selected.lines.length * 0.7 ? '👍 잘했어요! Keep it up!' : '💪 화이팅! Practice more.'}</p>
                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                        <button onClick={() => { setQuizIdx(0); setQuizScore(0); setQuizFeedback(null); setQuizHeard(''); setQuizRevealed(false); }} style={{ padding: '13px 28px', background: 'linear-gradient(135deg,#e94560,#c73652)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit' }}>🔄 Try Again</button>
                                        <button onClick={() => setMode('shadow')} style={{ padding: '13px 28px', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '12px', color: '#4ade80', fontSize: '15px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit' }}>🎤 Shadow Mode</button>
                                        <button onClick={() => navigate('/profile')} style={{ padding: '13px 28px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '12px', color: '#38bdf8', fontSize: '15px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit' }}>👤 View Profile</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* CTA */}
                    <div style={{ marginTop: '28px', background: 'rgba(233,69,96,0.05)', border: '1px solid rgba(233,69,96,0.2)', borderRadius: '16px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '15px', fontWeight: '800', fontFamily: "'Syne',sans-serif", marginBottom: '4px' }}>🎮 Use these phrases in the voice game!</div>
                            <div style={{ fontSize: '13px', color: '#555' }}>Speak Korean → Control your character</div>
                        </div>
                        <button onClick={() => navigate('/game')} style={{ padding: '11px 28px', background: 'linear-gradient(135deg,#e94560,#c73652)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '800', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                            Play Now →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
