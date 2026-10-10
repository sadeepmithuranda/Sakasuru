import { type Course, REVIEWED, NEXT_REVIEW, NEXT_REVIEW_TIME_SENSITIVE, SOURCES, TF } from "../types.js";

export const level3: Course = {
  slug: "digital-finance",
  level: 3,
  icon: "📲",
  color: "#6B46C1",
  title: { en: "Digital Finance", si: "ඩිජිටල් මූල්‍ය", ta: "டிஜிட்டல் நிதி" },
  description: {
    en: "QR payments, LANKAQR, mobile banking and keeping your OTP and PIN safe.",
    si: "QR ගෙවීම්, LANKAQR, ජංගම බැංකුකරණය සහ OTP හා PIN ආරක්ෂිතව තබා ගැනීම.",
    ta: "QR கட்டணங்கள், LANKAQR, மொபைல் வங்கி, OTP மற்றும் PIN பாதுகாப்பு.",
  },
  lessons: [
    {
      slug: "lankaqr-payments",
      title: { en: "Paying with LANKAQR", si: "LANKAQR මඟින් ගෙවීම", ta: "LANKAQR மூலம் செலுத்துதல்" },
      summary: {
        en: "One QR code, many banking apps — how Sri Lanka's national QR standard works.",
        si: "එක් QR කේතයක්, බොහෝ බැංකු ඇප් — ශ්‍රී ලංකාවේ ජාතික QR ප්‍රමිතිය ක්‍රියා කරන ආකාරය.",
        ta: "ஒரே QR குறியீடு, பல வங்கிச் செயலிகள் — இலங்கையின் தேசிய QR தரநிலை எப்படி வேலை செய்கிறது.",
      },
      minutes: 3,
      xp: 20,
      tags: ["digital", "payments", "lankaqr"],
      timeSensitive: true,
      cards: [
        {
          type: "concept",
          title: { en: "What is LANKAQR?", si: "LANKAQR යනු කුමක්ද?", ta: "LANKAQR என்றால் என்ன?" },
          body: {
            en: "LANKAQR is Sri Lanka's national QR code standard, introduced by the Central Bank of Sri Lanka. A shop shows one LANKAQR code, and customers can pay it from any participating bank or wallet app.",
            si: "LANKAQR යනු ශ්‍රී ලංකා මහ බැංකුව හඳුන්වා දුන් ශ්‍රී ලංකාවේ ජාතික QR කේත ප්‍රමිතියයි. වෙළඳසැලක් එක් LANKAQR කේතයක් පෙන්වන අතර, පාරිභෝගිකයින්ට සහභාගී වන ඕනෑම බැංකු හෝ පසුම්බි ඇප් එකකින් ගෙවිය හැකියි.",
            ta: "LANKAQR என்பது இலங்கை மத்திய வங்கி அறிமுகப்படுத்திய தேசிய QR குறியீட்டுத் தரநிலை. கடை ஒரே LANKAQR குறியீட்டைக் காட்டும்; வாடிக்கையாளர்கள் பங்கேற்கும் எந்த வங்கி அல்லது வாலட் செயலியிலிருந்தும் செலுத்தலாம்.",
          },
        },
        {
          type: "example",
          title: { en: "At the kade", si: "කඩේදී", ta: "கடையில்" },
          body: {
            en: "Open your bank app → choose Scan QR → scan the shop's code → check the shop name → enter the amount → confirm. The money moves from your account to the shop's account.",
            si: "ඔබේ බැංකු ඇප් එක විවෘත කරන්න → QR ස්කෑන් තෝරන්න → වෙළඳසැලේ කේතය ස්කෑන් කරන්න → වෙළඳසැලේ නම පරීක්ෂා කරන්න → මුදල ඇතුළත් කරන්න → තහවුරු කරන්න. මුදල් ඔබේ ගිණුමෙන් වෙළඳසැලේ ගිණුමට යනවා.",
            ta: "உங்கள் வங்கிச் செயலியைத் திறங்கள் → QR ஸ்கேன் தேர்வு செய்யுங்கள் → கடையின் குறியீட்டை ஸ்கேன் செய்யுங்கள் → கடைப் பெயரைச் சரிபாருங்கள் → தொகையை உள்ளிடுங்கள் → உறுதிப்படுத்துங்கள். பணம் உங்கள் கணக்கிலிருந்து கடையின் கணக்குக்குச் செல்லும்.",
          },
        },
        {
          type: "warning",
          title: { en: "Stay safe with QR", si: "QR සමඟ ආරක්ෂිතව සිටින්න", ta: "QR உடன் பாதுகாப்பாக இருங்கள்" },
          body: {
            en: "Always check the name shown before confirming. Watch for stickers pasted over a shop's real code. Never scan a QR code someone sends to 'receive' money — receiving money doesn't need you to scan or enter a PIN.",
            si: "තහවුරු කිරීමට පෙර පෙන්වන නම සැමවිටම පරීක්ෂා කරන්න. වෙළඳසැලේ සැබෑ කේතය මත ඇලවූ ස්ටිකර් ගැන සැලකිලිමත් වන්න. මුදල් 'ලැබීමට' යමෙක් එවන QR කේතයක් කිසිවිටෙක ස්කෑන් නොකරන්න — මුදල් ලැබීමට ස්කෑන් කිරීමක් හෝ PIN එකක් අවශ්‍ය නැහැ.",
            ta: "உறுதிப்படுத்தும் முன் காட்டப்படும் பெயரை எப்போதும் சரிபாருங்கள். கடையின் உண்மையான குறியீட்டின் மேல் ஒட்டப்பட்ட ஸ்டிக்கர்களைக் கவனியுங்கள். பணம் 'பெற' யாரோ அனுப்பும் QR குறியீட்டை ஒருபோதும் ஸ்கேன் செய்யாதீர்கள் — பணம் பெற ஸ்கேன் அல்லது PIN தேவையில்லை.",
          },
        },
        {
          type: "tip",
          title: { en: "Track digital spending too", si: "ඩිජිටල් වියදම්ද සටහන් කරන්න", ta: "டிஜிட்டல் செலவையும் பதிவு செய்யுங்கள்" },
          body: {
            en: "QR payments are fast, which makes them easy to forget. Record them in සකසුරු with the payment method 'LANKAQR' so your budget stays accurate.",
            si: "QR ගෙවීම් වේගවත් නිසා අමතක වීම පහසුයි. ඔබේ අයවැය නිවැරදිව තබා ගැනීමට ගෙවීම් ක්‍රමය 'LANKAQR' ලෙස සකසුරු තුළ සටහන් කරන්න.",
            ta: "QR கட்டணங்கள் வேகமானவை, எனவே மறக்க எளிது. உங்கள் திட்டம் துல்லியமாக இருக்க 'LANKAQR' கட்டண முறையுடன் සකසුරු-இல் பதிவு செய்யுங்கள்.",
          },
        },
      ],
      quiz: [
        {
          id: "q1",
          type: "mcq",
          prompt: { en: "Who introduced the LANKAQR standard?", si: "LANKAQR ප්‍රමිතිය හඳුන්වා දුන්නේ කවුද?", ta: "LANKAQR தரநிலையை அறிமுகப்படுத்தியது யார்?" },
          options: [
            { id: "a", text: { en: "The Central Bank of Sri Lanka", si: "ශ්‍රී ලංකා මහ බැංකුව", ta: "இலங்கை மத்திய வங்கி" } },
            { id: "b", text: { en: "A private mobile company", si: "පෞද්ගලික ජංගම සමාගමක්", ta: "ஒரு தனியார் மொபைல் நிறுவனம்" } },
            { id: "c", text: { en: "The Colombo Stock Exchange", si: "කොළඹ කොටස් හුවමාරුව", ta: "கொழும்புப் பங்குச் சந்தை" } },
          ],
          correctId: "a",
          explanation: { en: "LANKAQR is the national QR standard introduced by CBSL so payments work across banks.", si: "බැංකු අතර ගෙවීම් ක්‍රියා කිරීම සඳහා මහ බැංකුව හඳුන්වා දුන් ජාතික QR ප්‍රමිතිය LANKAQR වේ.", ta: "வங்கிகளுக்கு இடையே கட்டணங்கள் செயல்பட மத்திய வங்கி அறிமுகப்படுத்திய தேசிய QR தரநிலை LANKAQR." },
        },
        {
          id: "q2",
          type: "scenario",
          prompt: { en: "Someone selling your old bike online sends a QR code and says 'scan this so I can pay you'. What should you do?", si: "ඔබේ පරණ බයිසිකලය මිලදී ගන්නෙක් QR කේතයක් එවා 'මට ඔබට ගෙවීමට මෙය ස්කෑන් කරන්න' කියනවා. ඔබ කළ යුත්තේ කුමක්ද?", ta: "உங்கள் பழைய சைக்கிளை வாங்குபவர் QR குறியீட்டை அனுப்பி 'நான் உங்களுக்குச் செலுத்த இதை ஸ்கேன் செய்யுங்கள்' என்கிறார். என்ன செய்ய வேண்டும்?" },
          options: [
            { id: "a", text: { en: "Scan it and enter my PIN", si: "ස්කෑන් කර PIN එක ඇතුළත් කිරීම", ta: "ஸ்கேன் செய்து PIN உள்ளிடுதல்" } },
            { id: "b", text: { en: "Refuse — receiving money never needs me to scan or enter a PIN", si: "ප්‍රතික්ෂේප කිරීම — මුදල් ලැබීමට ස්කෑන් කිරීම හෝ PIN අවශ්‍ය නැහැ", ta: "மறுப்பது — பணம் பெற ஸ்கேன் அல்லது PIN ஒருபோதும் தேவையில்லை" } },
          ],
          correctId: "b",
          explanation: { en: "Scanning a code and confirming sends money out of your account. This is a common scam.", si: "කේතයක් ස්කෑන් කර තහවුරු කිරීමෙන් ඔබේ ගිණුමෙන් මුදල් පිටතට යනවා. මෙය පොදු වංචාවකි.", ta: "குறியீட்டை ஸ்கேன் செய்து உறுதிப்படுத்துவது உங்கள் கணக்கிலிருந்து பணத்தை அனுப்பும். இது பொதுவான மோசடி." },
        },
        {
          id: "q3",
          type: "truefalse",
          prompt: { en: "You should check the merchant name before confirming a QR payment.", si: "QR ගෙවීමක් තහවුරු කිරීමට පෙර වෙළඳ නාමය පරීක්ෂා කළ යුතුයි.", ta: "QR கட்டணத்தை உறுதிப்படுத்தும் முன் வணிகர் பெயரைச் சரிபார்க்க வேண்டும்." },
          options: TF,
          correctId: "t",
          explanation: { en: "The name confirms you're paying the right account.", si: "නම නිවැරදි ගිණුමට ගෙවන බව තහවුරු කරයි.", ta: "சரியான கணக்குக்குச் செலுத்துகிறீர்கள் என்பதைப் பெயர் உறுதிப்படுத்தும்." },
        },
      ],
      sources: [SOURCES.lankaqr, SOURCES.cbsl],
      lastReviewed: REVIEWED,
      nextReview: NEXT_REVIEW_TIME_SENSITIVE,
    },
    {
      slug: "otp-pin-safety",
      title: { en: "OTP, PIN and password safety", si: "OTP, PIN සහ මුරපද ආරක්ෂාව", ta: "OTP, PIN, கடவுச்சொல் பாதுகாப்பு" },
      summary: {
        en: "The details you should never share — not even with someone who says they're from your bank.",
        si: "කිසිවිටෙක බෙදා නොගත යුතු විස්තර — ඔබේ බැංකුවෙන් යැයි කියන කෙනෙකුට පවා.",
        ta: "ஒருபோதும் பகிரக்கூடாத விவரங்கள் — உங்கள் வங்கியிலிருந்து என்று சொல்பவரிடம் கூட.",
      },
      minutes: 3,
      xp: 25,
      tags: ["digital", "security", "scams"],
      protection: true,
      cards: [
        {
          type: "concept",
          title: { en: "Your digital keys", si: "ඔබේ ඩිජිටල් යතුරු", ta: "உங்கள் டிஜிட்டல் சாவிகள்" },
          body: {
            en: "OTP (one-time password) is a code sent by SMS to approve a transaction. PIN is the secret number for your card. CVV is the 3 digits on the back of your card. Together they are the keys to your money.",
            si: "OTP (එක් වරක් භාවිත මුරපදය) ගනුදෙනුවක් අනුමත කිරීමට SMS මඟින් එවන කේතයකි. PIN යනු ඔබේ කාඩ්පතේ රහස් අංකයයි. CVV යනු කාඩ්පතේ පිටුපස ඇති ඉලක්කම් 3යි. මේවා එකට ඔබේ මුදල්වල යතුරුයි.",
            ta: "OTP (ஒருமுறை கடவுச்சொல்) என்பது பரிவர்த்தனையை அங்கீகரிக்க SMS மூலம் அனுப்பப்படும் குறியீடு. PIN உங்கள் அட்டையின் ரகசிய எண். CVV அட்டையின் பின்புறமுள்ள 3 இலக்கங்கள். இவை சேர்ந்து உங்கள் பணத்தின் சாவிகள்.",
          },
        },
        {
          type: "warning",
          title: { en: "The golden rule", si: "ස්වර්ණමය නීතිය", ta: "தங்க விதி" },
          body: {
            en: "Your bank will NEVER ask for your OTP, PIN, CVV or internet-banking password — by phone, SMS, WhatsApp or email. Anyone who asks is trying to steal from you.",
            si: "ඔබේ බැංකුව කිසිවිටෙක ඔබේ OTP, PIN, CVV හෝ අන්තර්ජාල බැංකු මුරපදය ඉල්ලන්නේ නැහැ — දුරකථනයෙන්, SMS, WhatsApp හෝ ඊමේල් මඟින්. ඉල්ලන ඕනෑම අයෙක් ඔබෙන් සොරකම් කිරීමට උත්සාහ කරනවා.",
            ta: "உங்கள் வங்கி ஒருபோதும் உங்கள் OTP, PIN, CVV அல்லது இணைய வங்கிக் கடவுச்சொல்லைக் கேட்காது — தொலைபேசி, SMS, WhatsApp அல்லது மின்னஞ்சல் மூலம். கேட்கும் எவரும் உங்களிடமிருந்து திருட முயல்கிறார்.",
          },
        },
        {
          type: "story",
          title: { en: "A call for Chamari", si: "චාමරීට ඇමතුමක්", ta: "சாமரிக்கு ஒரு அழைப்பு" },
          body: {
            en: "A caller says he's from Chamari's bank: 'Your account will be blocked. Read me the code we just sent.' The SMS actually says 'Your OTP to transfer Rs. 95,000 is…'. Chamari hangs up and calls the number on the back of her card. Her money is safe.",
            si: "ඇමතුම් ලබන්නා චාමරීගේ බැංකුවෙන් යැයි කියනවා: 'ඔබේ ගිණුම අවහිර වෙනවා. අපි දැන් එවූ කේතය කියවන්න.' SMS එකේ ඇත්තටම තිබෙන්නේ 'රු. 95,000ක් මාරු කිරීමට ඔබේ OTP…' කියායි. චාමරී ඇමතුම විසන්ධි කර කාඩ්පතේ පිටුපස ඇති අංකයට අමතනවා. ඇගේ මුදල් ආරක්ෂිතයි.",
            ta: "அழைப்பவர் சாமரியின் வங்கியிலிருந்து என்கிறார்: 'உங்கள் கணக்கு முடக்கப்படும். நாங்கள் அனுப்பிய குறியீட்டைப் படியுங்கள்.' SMS உண்மையில் 'ரூ. 95,000 மாற்ற உங்கள் OTP…' என்கிறது. சாமரி அழைப்பைத் துண்டித்து அட்டையின் பின்புறமுள்ள எண்ணை அழைக்கிறார். அவரது பணம் பாதுகாப்பாக உள்ளது.",
          },
        },
        {
          type: "tip",
          title: { en: "Simple habits", si: "සරල පුරුදු", ta: "எளிய பழக்கங்கள்" },
          body: {
            en: "Read every OTP message fully. Use a different, strong password for banking. Turn on transaction SMS alerts. If something feels wrong, hang up and call your bank's official number yourself.",
            si: "සෑම OTP පණිවිඩයක්ම සම්පූර්ණයෙන් කියවන්න. බැංකුකරණයට වෙනස්, ශක්තිමත් මුරපදයක් භාවිත කරන්න. ගනුදෙනු SMS ඇඟවීම් සක්‍රිය කරන්න. යමක් වැරදි යැයි හැඟේ නම්, ඇමතුම විසන්ධි කර ඔබේ බැංකුවේ නිල අංකයට ඔබම අමතන්න.",
            ta: "ஒவ்வொரு OTP செய்தியையும் முழுமையாகப் படியுங்கள். வங்கிக்கு வேறு, வலுவான கடவுச்சொல் பயன்படுத்துங்கள். பரிவர்த்தனை SMS எச்சரிக்கைகளை இயக்குங்கள். ஏதாவது தவறாகத் தோன்றினால், துண்டித்து உங்கள் வங்கியின் அதிகாரப்பூர்வ எண்ணை நீங்களே அழையுங்கள்.",
          },
        },
      ],
      quiz: [
        {
          id: "q1",
          type: "truefalse",
          prompt: { en: "A real bank officer may ask for your OTP to 'verify' your account.", si: "සැබෑ බැංකු නිලධාරියෙක් ඔබේ ගිණුම 'සත්‍යාපනය' කිරීමට OTP ඉල්ලිය හැකියි.", ta: "உண்மையான வங்கி அதிகாரி உங்கள் கணக்கை 'சரிபார்க்க' OTP கேட்கலாம்." },
          options: TF,
          correctId: "f",
          explanation: { en: "Banks never ask for OTPs. An OTP request is a scam, every time.", si: "බැංකු කිසිවිටෙක OTP ඉල්ලන්නේ නැහැ. OTP ඉල්ලීමක් සැමවිටම වංචාවකි.", ta: "வங்கிகள் ஒருபோதும் OTP கேட்பதில்லை. OTP கோரிக்கை எப்போதும் மோசடி." },
        },
        {
          id: "q2",
          type: "mcq",
          prompt: { en: "Which detail is safe to share to receive a bank transfer?", si: "බැංකු මාරුවක් ලැබීමට බෙදා ගැනීම ආරක්ෂිත වන්නේ කුමන විස්තරයද?", ta: "வங்கிப் பரிமாற்றத்தைப் பெறப் பகிர்வது பாதுகாப்பான விவரம் எது?" },
          options: [
            { id: "a", text: { en: "Account number and account name", si: "ගිණුම් අංකය සහ ගිණුම් නාමය", ta: "கணக்கு எண், கணக்குப் பெயர்" } },
            { id: "b", text: { en: "Card PIN", si: "කාඩ් PIN", ta: "அட்டை PIN" } },
            { id: "c", text: { en: "OTP", si: "OTP", ta: "OTP" } },
          ],
          correctId: "a",
          explanation: { en: "To receive money, someone only needs your account number, name and bank. Never your PIN or OTP.", si: "මුදල් ලැබීමට අවශ්‍ය වන්නේ ඔබේ ගිණුම් අංකය, නම සහ බැංකුව පමණි. කිසිවිටෙක PIN හෝ OTP නොවේ.", ta: "பணம் பெற உங்கள் கணக்கு எண், பெயர், வங்கி மட்டுமே தேவை. PIN அல்லது OTP ஒருபோதும் இல்லை." },
        },
        {
          id: "q3",
          type: "scenario",
          prompt: { en: "You get an SMS: 'Your account is suspended. Log in here: bit.ly/xyz-bank'. What do you do?", si: "ඔබට SMS එකක් ලැබේ: 'ඔබේ ගිණුම අත්හිටුවා ඇත. මෙතැනින් ලොග් වන්න: bit.ly/xyz-bank'. ඔබ කුමක් කරනවාද?", ta: "SMS வருகிறது: 'உங்கள் கணக்கு இடைநிறுத்தப்பட்டது. இங்கே உள்நுழையுங்கள்: bit.ly/xyz-bank'. என்ன செய்வீர்கள்?" },
          options: [
            { id: "a", text: { en: "Tap the link and log in quickly", si: "සබැඳිය ඔබා ඉක්මනින් ලොග් වීම", ta: "இணைப்பைத் தட்டி விரைவாக உள்நுழைவது" } },
            { id: "b", text: { en: "Ignore the link and contact the bank through its official app or number", si: "සබැඳිය නොසලකා නිල ඇප් හෝ අංකය හරහා බැංකුව අමතන්න", ta: "இணைப்பைப் புறக்கணித்து அதிகாரப்பூர்வ செயலி அல்லது எண் மூலம் வங்கியைத் தொடர்புகொள்வது" } },
          ],
          correctId: "b",
          explanation: { en: "Short links plus urgency are classic phishing signs. Go to your bank directly.", si: "කෙටි සබැඳි සහ හදිසිය සම්භාව්‍ය ෆිෂිං ලකුණුයි. ඔබේ බැංකුවට සෘජුවම යන්න.", ta: "சுருக்க இணைப்புகளும் அவசரமும் வழக்கமான ஃபிஷிங் அறிகுறிகள். நேரடியாக உங்கள் வங்கிக்குச் செல்லுங்கள்." },
        },
      ],
      sources: [SOURCES.cbsl, SOURCES.sakasuru],
      lastReviewed: REVIEWED,
      nextReview: NEXT_REVIEW,
    },
  ],
};
