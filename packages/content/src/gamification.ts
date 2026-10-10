import type { L, ScamExample } from "./types.js";

/**
 * Badges reward learning and healthy habits only — never borrowing,
 * trading frequency or financial risk-taking.
 */
export interface BadgeDef {
  key: string;
  icon: string;
  title: L;
  description: L;
  xp: number;
}

export const BADGES: BadgeDef[] = [
  { key: "firstExpense", icon: "✍️", xp: 10, title: { en: "First Step", si: "පළමු පියවර", ta: "முதல் படி" }, description: { en: "Recorded your first expense.", si: "ඔබේ පළමු වියදම සටහන් කළා.", ta: "உங்கள் முதல் செலவைப் பதிவு செய்தீர்கள்." } },
  { key: "firstBudget", icon: "💰", xp: 30, title: { en: "First Budget", si: "පළමු අයවැය", ta: "முதல் வரவுசெலவு" }, description: { en: "Created your first monthly budget.", si: "ඔබේ පළමු මාසික අයවැය සෑදුවා.", ta: "உங்கள் முதல் மாத வரவுசெலவுத் திட்டத்தை உருவாக்கினீர்கள்." } },
  { key: "smartSaver", icon: "🐷", xp: 50, title: { en: "Smart Saver", si: "බුද්ධිමත් ඉතිරිකරු", ta: "புத்திசாலி சேமிப்பாளர்" }, description: { en: "Saved at least 10% of your income in a month.", si: "මාසයක ආදායමෙන් අවම වශයෙන් 10%ක් ඉතිරි කළා.", ta: "ஒரு மாதத்தில் வருமானத்தில் குறைந்தது 10% சேமித்தீர்கள்." } },
  { key: "moneyLearner", icon: "📚", xp: 40, title: { en: "Money Learner", si: "මුදල් ඉගෙනුම්කරු", ta: "பணக் கற்பவர்" }, description: { en: "Completed 5 lessons.", si: "පාඩම් 5ක් සම්පූර්ණ කළා.", ta: "5 பாடங்களை முடித்தீர்கள்." } },
  { key: "scamDefender", icon: "🛡️", xp: 40, title: { en: "Scam Defender", si: "වංචා ආරක්ෂකයා", ta: "மோசடித் தடுப்பாளர்" }, description: { en: "Completed all protection lessons.", si: "සියලු ආරක්ෂණ පාඩම් සම්පූර්ණ කළා.", ta: "அனைத்துப் பாதுகாப்புப் பாடங்களையும் முடித்தீர்கள்." } },
  { key: "investmentExplorer", icon: "📊", xp: 30, title: { en: "Investment Explorer", si: "ආයෝජන ගවේෂකයා", ta: "முதலீட்டு ஆய்வாளர்" }, description: { en: "Finished the Saving & Investing course (education, not trading).", si: "ඉතිරි කිරීම සහ ආයෝජන පාඨමාලාව අවසන් කළා (අධ්‍යාපනය, වෙළඳාම නොවේ).", ta: "சேமிப்பும் முதலீடும் பாடநெறியை முடித்தீர்கள் (கல்வி, வர்த்தகம் அல்ல)." } },
  { key: "streak7", icon: "🔥", xp: 50, title: { en: "7-Day Learning Streak", si: "දින 7ක ඉගෙනුම් පෙළ", ta: "7 நாள் கற்றல் தொடர்" }, description: { en: "Learned something 7 days in a row.", si: "දින 7ක් අඛණ්ඩව යමක් ඉගෙන ගත්තා.", ta: "தொடர்ந்து 7 நாட்கள் ஏதாவது கற்றீர்கள்." } },
  { key: "budgetMaster", icon: "🏆", xp: 80, title: { en: "Budget Master", si: "අයවැය ප්‍රවීණයා", ta: "வரவுசெலவு வல்லுநர்" }, description: { en: "Stayed within every budget category for a month.", si: "මාසයක් සියලු අයවැය කාණ්ඩ තුළ සිටියා.", ta: "ஒரு மாதம் அனைத்து வரவுசெலவு வகைகளுக்குள்ளும் இருந்தீர்கள்." } },
  { key: "emergencyStarter", icon: "🌱", xp: 40, title: { en: "Emergency Fund Starter", si: "හදිසි අරමුදල් ආරම්භකයා", ta: "அவசர நிதித் தொடக்கர்" }, description: { en: "Created an emergency fund goal and made a contribution.", si: "හදිසි අරමුදල් ඉලක්කයක් සාදා දායකත්වයක් දුන්නා.", ta: "அவசர நிதி இலக்கை உருவாக்கிப் பங்களித்தீர்கள்." } },
  { key: "quizAce", icon: "🎯", xp: 20, title: { en: "Quiz Ace", si: "ප්‍රශ්නාවලි ප්‍රවීණයා", ta: "வினாடி வினா வீரர்" }, description: { en: "Scored 100% on a lesson quiz.", si: "පාඩම් ප්‍රශ්නාවලියකින් 100%ක් ලබා ගත්තා.", ta: "பாட வினாடி வினாவில் 100% பெற்றீர்கள்." } },
];

export interface ChallengeDef {
  key: string;
  icon: string;
  title: L;
  description: L;
  /** how progress is measured */
  metric: "expenseDays" | "lessons" | "savedAmount" | "noSpendDays" | "subscriptionReview" | "emergencyContribution";
  target: number;
  durationDays: number;
  xp: number;
}

export const CHALLENGES: ChallengeDef[] = [
  { key: "track7", icon: "📝", metric: "expenseDays", target: 7, durationDays: 7, xp: 50, title: { en: "Record every expense for 7 days", si: "දින 7ක් සෑම වියදමක්ම සටහන් කරන්න", ta: "7 நாட்கள் ஒவ்வொரு செலவையும் பதிவு செய்யுங்கள்" }, description: { en: "Log at least one expense each day this week.", si: "මේ සතියේ සෑම දිනකම අවම වශයෙන් එක් වියදමක් සටහන් කරන්න.", ta: "இந்த வாரம் ஒவ்வொரு நாளும் குறைந்தது ஒரு செலவைப் பதிவு செய்யுங்கள்." } },
  { key: "save500", icon: "🪙", metric: "savedAmount", target: 500, durationDays: 7, xp: 30, title: { en: "Save Rs. 500 this week", si: "මේ සතියේ රු. 500ක් ඉතිරි කරන්න", ta: "இந்த வாரம் ரூ. 500 சேமியுங்கள்" }, description: { en: "Add Rs. 500 to any savings goal.", si: "ඕනෑම ඉතිරි කිරීමේ ඉලක්කයකට රු. 500ක් එකතු කරන්න.", ta: "எந்தச் சேமிப்பு இலக்கிலும் ரூ. 500 சேருங்கள்." } },
  { key: "learn3", icon: "📚", metric: "lessons", target: 3, durationDays: 7, xp: 40, title: { en: "Complete three lessons", si: "පාඩම් තුනක් සම්පූර්ණ කරන්න", ta: "மூன்று பாடங்களை முடியுங்கள்" }, description: { en: "Finish any three lessons in the Academy.", si: "ඇකඩමියේ ඕනෑම පාඩම් තුනක් අවසන් කරන්න.", ta: "அகாடமியில் ஏதேனும் மூன்று பாடங்களை முடியுங்கள்." } },
  { key: "noSpend1", icon: "🚫", metric: "noSpendDays", target: 1, durationDays: 7, xp: 20, title: { en: "One no-unnecessary-spending day", si: "අනවශ්‍ය වියදම් නැති එක් දිනයක්", ta: "தேவையற்ற செலவில்லாத ஒரு நாள்" }, description: { en: "Spend only on needs for one full day.", si: "එක් සම්පූර්ණ දිනක් අවශ්‍යතා සඳහා පමණක් වියදම් කරන්න.", ta: "ஒரு முழு நாள் தேவைகளுக்கு மட்டும் செலவழியுங்கள்." } },
  { key: "subs", icon: "📺", metric: "subscriptionReview", target: 1, durationDays: 7, xp: 20, title: { en: "Review all subscriptions", si: "සියලු දායකත්ව සමාලෝචනය කරන්න", ta: "அனைத்துச் சந்தாக்களையும் மதிப்பாய்வு செய்யுங்கள்" }, description: { en: "List every subscription and cancel one you don't use.", si: "සෑම දායකත්වයක්ම ලැයිස්තුගත කර ඔබ භාවිත නොකරන එකක් අවලංගු කරන්න.", ta: "ஒவ்வொரு சந்தாவையும் பட்டியலிட்டு, பயன்படுத்தாத ஒன்றை ரத்து செய்யுங்கள்." } },
  { key: "efund", icon: "🌱", metric: "emergencyContribution", target: 1, durationDays: 14, xp: 40, title: { en: "Start your emergency fund", si: "ඔබේ හදිසි අරමුදල පටන් ගන්න", ta: "உங்கள் அவசர நிதியைத் தொடங்குங்கள்" }, description: { en: "Create an emergency-fund goal and add any amount.", si: "හදිසි අරමුදල් ඉලක්කයක් සාදා ඕනෑම මුදලක් එකතු කරන්න.", ta: "அவசர நிதி இலக்கை உருவாக்கி எந்தத் தொகையையும் சேருங்கள்." } },
];

/** XP needed for each level: 0, 100, 250, 450, ... */
export const levelForXp = (xp: number) => {
  let level = 1;
  let need = 100;
  let acc = 0;
  while (xp >= acc + need) {
    acc += need;
    level++;
    need += 50;
  }
  return { level, currentLevelXp: xp - acc, nextLevelXp: need };
};

export const SCAM_EXAMPLES: ScamExample[] = [
  {
    id: "s1",
    isScam: true,
    message: { en: "Congratulations! You have won Rs. 500,000 in our mobile lucky draw. Pay Rs. 2,000 processing fee to claim today.", si: "සුබ පැතුම්! අපගේ ජංගම වාසනා දිනුම් ඇදීමෙන් ඔබ රු. 500,000ක් දිනා ඇත. අදම ලබා ගැනීමට රු. 2,000 සැකසුම් ගාස්තුවක් ගෙවන්න.", ta: "வாழ்த்துக்கள்! எங்கள் மொபைல் அதிர்ஷ்டக் குலுக்கலில் ரூ. 500,000 வென்றுள்ளீர்கள். இன்றே பெற ரூ. 2,000 செயலாக்கக் கட்டணம் செலுத்துங்கள்." },
    explanation: { en: "Unexpected prize + upfront fee + urgency. Real prizes never ask you to pay first.", si: "අනපේක්ෂිත ත්‍යාගය + පෙරගෙවුම් ගාස්තුව + හදිසිය. සැබෑ ත්‍යාග කිසිවිටෙක මුලින් ගෙවීමට නොකියයි.", ta: "எதிர்பாராத பரிசு + முன்கட்டணம் + அவசரம். உண்மையான பரிசுகள் முதலில் செலுத்தச் சொல்வதில்லை." },
  },
  {
    id: "s2",
    isScam: false,
    message: { en: "Your electricity bill of Rs. 4,820 for account ending 1234 is due on 15/10. Pay via your banking app or at any payment centre.", si: "අංක 1234න් අවසන් වන ගිණුම සඳහා රු. 4,820 ඔබේ විදුලි බිල 15/10 දිනට ගෙවිය යුතුයි. ඔබේ බැංකු ඇප් එක හෝ ඕනෑම ගෙවීම් මධ්‍යස්ථානයකින් ගෙවන්න.", ta: "1234 இல் முடியும் கணக்கிற்கான ரூ. 4,820 மின்சாரக் கட்டணம் 15/10 அன்று செலுத்த வேண்டும். உங்கள் வங்கிச் செயலி அல்லது எந்தக் கட்டண மையத்திலும் செலுத்துங்கள்." },
    explanation: { en: "No link, no request for secret details, and it tells you to pay through channels you already use. Still, check the amount in your own app.", si: "සබැඳියක් නැත, රහස් විස්තර ඉල්ලීමක් නැත, ඔබ දැනටමත් භාවිත කරන නාලිකා හරහා ගෙවීමට කියයි. එසේ වුවද, ඔබේම ඇප් එකේ මුදල පරීක්ෂා කරන්න.", ta: "இணைப்பு இல்லை, ரகசிய விவரங்கள் கோரிக்கை இல்லை, நீங்கள் ஏற்கனவே பயன்படுத்தும் வழிகளில் செலுத்தச் சொல்கிறது. இருந்தாலும் உங்கள் சொந்தச் செயலியில் தொகையைச் சரிபாருங்கள்." },
  },
  {
    id: "s3",
    isScam: true,
    message: { en: "Dear customer, your account will be blocked today. Share the OTP sent to your phone to keep it active.", si: "හිතවත් පාරිභෝගිකය, ඔබේ ගිණුම අද අවහිර වේ. එය සක්‍රියව තබා ගැනීමට ඔබේ දුරකථනයට එවූ OTP එක බෙදා ගන්න.", ta: "அன்புள்ள வாடிக்கையாளரே, உங்கள் கணக்கு இன்று முடக்கப்படும். அதைச் செயலில் வைக்க உங்கள் தொலைபேசிக்கு அனுப்பிய OTP ஐப் பகிருங்கள்." },
    explanation: { en: "Banks never ask for your OTP. The threat of blocking is used to rush you.", si: "බැංකු කිසිවිටෙක ඔබේ OTP ඉල්ලන්නේ නැහැ. අවහිර කිරීමේ තර්ජනය ඔබව ඉක්මන් කිරීමට භාවිත කරයි.", ta: "வங்கிகள் ஒருபோதும் OTP கேட்பதில்லை. முடக்குவதாக மிரட்டுவது உங்களை அவசரப்படுத்தவே." },
  },
  {
    id: "s4",
    isScam: true,
    message: { en: "Join our investment club: guaranteed 15% profit every month, zero risk! Bring 3 friends and earn a bonus.", si: "අපගේ ආයෝජන සමාජයට එක්වන්න: සෑම මසකම සහතික 15% ලාභය, අවදානමක් නැහැ! මිතුරන් 3ක් ගෙනැවිත් ප්‍රසාද දීමනාවක් උපයන්න.", ta: "எங்கள் முதலீட்டுக் கழகத்தில் சேருங்கள்: ஒவ்வொரு மாதமும் உத்தரவாத 15% லாபம், ஆபத்து இல்லை! 3 நண்பர்களைக் கொண்டு வந்து போனஸ் பெறுங்கள்." },
    explanation: { en: "Guaranteed high returns, 'zero risk' and recruitment bonuses are classic Ponzi/pyramid signs.", si: "සහතික ඉහළ ප්‍රතිලාභ, 'අවදානමක් නැහැ' සහ බඳවා ගැනීමේ ප්‍රසාද පොන්සි/පිරමිඩ ලකුණුයි.", ta: "உத்தரவாத அதிக வருமானம், 'ஆபத்து இல்லை', ஆட்சேர்ப்பு போனஸ் ஆகியவை வழக்கமான பொன்சி/பிரமிடு அறிகுறிகள்." },
  },
  {
    id: "s5",
    isScam: false,
    message: { en: "Hi Nadeesha, I sent you Rs. 3,500 for the bus tickets — please check your account when you can. Thanks!", si: "හායි නදීෂා, බස් ටිකට් සඳහා මම ඔබට රු. 3,500ක් එව්වා — පුළුවන් වෙලාවක ඔබේ ගිණුම බලන්න. ස්තූතියි!", ta: "ஹாய் நதீஷா, பேருந்து டிக்கெட்டுக்கு ரூ. 3,500 அனுப்பினேன் — முடிந்தபோது உங்கள் கணக்கைப் பாருங்கள். நன்றி!" },
    explanation: { en: "A normal message from someone you know, with no link or request for details. If unsure, check your own banking app.", si: "ඔබ දන්නා කෙනෙකුගෙන් සාමාන්‍ය පණිවිඩයක්, සබැඳියක් හෝ විස්තර ඉල්ලීමක් නැත. සැක නම්, ඔබේම බැංකු ඇප් එක පරීක්ෂා කරන්න.", ta: "தெரிந்தவரிடமிருந்து சாதாரணச் செய்தி, இணைப்போ விவரக் கோரிக்கையோ இல்லை. சந்தேகமெனில் உங்கள் வங்கிச் செயலியைப் பாருங்கள்." },
  },
  {
    id: "s6",
    isScam: true,
    message: { en: "Your parcel is held at customs. Pay Rs. 350 delivery charge here: bit.ly/lk-parcel-pay", si: "ඔබේ පාර්සලය රේගුවේ රඳවා ඇත. මෙතැනින් රු. 350 බෙදාහැරීමේ ගාස්තුව ගෙවන්න: bit.ly/lk-parcel-pay", ta: "உங்கள் பார்சல் சுங்கத்தில் நிறுத்தப்பட்டுள்ளது. இங்கே ரூ. 350 விநியோகக் கட்டணம் செலுத்துங்கள்: bit.ly/lk-parcel-pay" },
    explanation: { en: "Short link + small fee is a common phishing trick to steal card details.", si: "කෙටි සබැඳිය + කුඩා ගාස්තුව කාඩ් විස්තර සොරකම් කිරීමේ පොදු ෆිෂිං උපක්‍රමයකි.", ta: "சுருக்க இணைப்பு + சிறு கட்டணம் அட்டை விவரங்களைத் திருடும் பொதுவான ஃபிஷிங் தந்திரம்." },
  },
];
