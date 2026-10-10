import { type Course, REVIEWED, NEXT_REVIEW, SOURCES, TF } from "../types.js";

export const level5: Course = {
  slug: "protecting-money",
  level: 5,
  icon: "🛡️",
  color: "#C53030",
  title: { en: "Protecting Your Money", si: "ඔබේ මුදල් ආරක්ෂා කිරීම", ta: "உங்கள் பணத்தைப் பாதுகாத்தல்" },
  description: {
    en: "Spot Ponzi schemes, fake investments and phishing before they cost you.",
    si: "පොන්සි යෝජනා ක්‍රම, ව්‍යාජ ආයෝජන සහ ෆිෂිං ඔබට හානි කිරීමට පෙර හඳුනා ගන්න.",
    ta: "பொன்சி திட்டங்கள், போலி முதலீடுகள், ஃபிஷிங் ஆகியவற்றை இழப்புக்கு முன் கண்டறியுங்கள்.",
  },
  lessons: [
    {
      slug: "ponzi-schemes",
      title: { en: "How Ponzi and pyramid schemes work", si: "පොන්සි සහ පිරමිඩ යෝජනා ක්‍රම ක්‍රියා කරන ආකාරය", ta: "பொன்சி மற்றும் பிரமிடு திட்டங்கள் எப்படி வேலை செய்கின்றன" },
      summary: {
        en: "Why early 'profits' are paid with new members' money — and why it always collapses.",
        si: "මුල් 'ලාභ' නව සාමාජිකයින්ගේ මුදලින් ගෙවන්නේ ඇයි — සහ එය සැමවිටම කඩා වැටෙන්නේ ඇයි.",
        ta: "ஆரம்ப 'லாபம்' புதிய உறுப்பினர்களின் பணத்தால் ஏன் செலுத்தப்படுகிறது — அது ஏன் எப்போதும் சரிகிறது.",
      },
      minutes: 4,
      xp: 30,
      tags: ["scams", "ponzi", "protection"],
      protection: true,
      cards: [
        {
          type: "story",
          title: { en: "The WhatsApp group", si: "WhatsApp කණ්ඩායම", ta: "WhatsApp குழு" },
          body: {
            en: "Lahiru's cousin adds him to a group: 'Invest Rs. 50,000, earn 10% every month. Bring 3 friends for a bonus!' Members post screenshots of payouts. For two months Lahiru gets paid. In month four, the group goes silent and the admin's number is switched off.",
            si: "ලහිරුගේ ඥාති සහෝදරයා ඔහුව කණ්ඩායමකට එකතු කරනවා: 'රු. 50,000ක් ආයෝජනය කරන්න, සෑම මසකම 10%ක් උපයන්න. ප්‍රසාද දීමනාවක් සඳහා මිතුරන් 3ක් ගෙනෙන්න!' සාමාජිකයින් ගෙවීම්වල තිරපිටපත් පළ කරනවා. මාස දෙකක් ලහිරුට ගෙවනවා. හතරවන මාසයේ කණ්ඩායම නිහඬ වන අතර පරිපාලකගේ අංකය ක්‍රියා විරහිතයි.",
            ta: "லஹிருவின் உறவினர் அவரை ஒரு குழுவில் சேர்க்கிறார்: 'ரூ. 50,000 முதலீடு செய்யுங்கள், மாதம் 10% சம்பாதியுங்கள். போனஸுக்கு 3 நண்பர்களைக் கொண்டு வாருங்கள்!' உறுப்பினர்கள் கொடுப்பனவுகளின் திரைப்பிடிப்புகளைப் பதிவிடுகிறார்கள். இரண்டு மாதங்கள் லஹிருவுக்குப் பணம் வருகிறது. நான்காவது மாதம் குழு அமைதியாகிறது, நிர்வாகியின் எண் அணைக்கப்பட்டுள்ளது.",
          },
        },
        {
          type: "concept",
          title: { en: "What really happened", si: "ඇත්තටම සිදු වූයේ", ta: "உண்மையில் நடந்தது" },
          body: {
            en: "There was no real business. Early members were paid with money from newer members. When new money slows down, payments stop and most people lose everything. Pyramid schemes are illegal in Sri Lanka under the Banking Act.",
            si: "සැබෑ ව්‍යාපාරයක් තිබුණේ නැහැ. මුල් සාමාජිකයින්ට ගෙව්වේ නව සාමාජිකයින්ගේ මුදලින්. නව මුදල් අඩු වූ විට ගෙවීම් නවතින අතර බොහෝ දෙනාට සියල්ල අහිමි වෙනවා. බැංකු පනත යටතේ ශ්‍රී ලංකාවේ පිරමිඩ යෝජනා ක්‍රම නීති විරෝධීයි.",
            ta: "உண்மையான வணிகம் எதுவும் இல்லை. ஆரம்ப உறுப்பினர்களுக்குப் புதிய உறுப்பினர்களின் பணத்திலிருந்து செலுத்தப்பட்டது. புதிய பணம் குறையும்போது கொடுப்பனவுகள் நிற்கும், பெரும்பாலோர் அனைத்தையும் இழப்பார்கள். வங்கிச் சட்டத்தின் கீழ் இலங்கையில் பிரமிடு திட்டங்கள் சட்டவிரோதமானவை.",
          },
        },
        {
          type: "warning",
          title: { en: "🚩 Warning signs", si: "🚩 අනතුරු ලකුණු", ta: "🚩 எச்சரிக்கை அறிகுறிகள்" },
          body: {
            en: "Guaranteed high monthly returns · 'Zero risk' · Rewards for recruiting people · Pressure to join fast · Vague explanation of how money is made · Payments only in cash or crypto · No licence from the Central Bank or SEC.",
            si: "සහතික ඉහළ මාසික ප්‍රතිලාභ · 'අවදානමක් නැහැ' · අය බඳවා ගැනීමට ත්‍යාග · ඉක්මනින් එකතු වීමට පීඩනය · මුදල් උපයන ආකාරය පිළිබඳ අපැහැදිලි පැහැදිලි කිරීම · මුදලින් හෝ ක්‍රිප්ටෝ වලින් පමණක් ගෙවීම් · මහ බැංකුවේ හෝ SEC හි බලපත්‍රයක් නැත.",
            ta: "உத்தரவாத அதிக மாத வருமானம் · 'ஆபத்து இல்லை' · ஆட்களைச் சேர்ப்பதற்கு வெகுமதி · விரைவில் சேர அழுத்தம் · பணம் எப்படி ஈட்டப்படுகிறது என்பதில் தெளிவின்மை · பணம் அல்லது கிரிப்டோவில் மட்டும் கொடுப்பனவு · மத்திய வங்கி அல்லது SEC உரிமம் இல்லை.",
          },
        },
        {
          type: "tip",
          title: { en: "What to do", si: "කළ යුතු දේ", ta: "என்ன செய்வது" },
          body: {
            en: "Check if the company is licensed on the CBSL and SEC websites. Talk to someone you trust before paying. You can report suspected schemes to the Central Bank. Use සකසුරු's Scam Checker to review a message.",
            si: "සමාගම බලපත්‍රලාභීදැයි මහ බැංකුවේ සහ SEC වෙබ් අඩවිවල පරීක්ෂා කරන්න. ගෙවීමට පෙර විශ්වාසවන්ත කෙනෙකු සමඟ කතා කරන්න. සැක සහිත යෝජනා ක්‍රම මහ බැංකුවට වාර්තා කළ හැකියි. පණිවිඩයක් සමාලෝචනයට සකසුරු වංචා පරීක්ෂකය භාවිත කරන්න.",
            ta: "நிறுவனம் உரிமம் பெற்றதா என்று CBSL, SEC இணையதளங்களில் சரிபாருங்கள். பணம் செலுத்தும் முன் நம்பகமானவரிடம் பேசுங்கள். சந்தேகத்திற்குரிய திட்டங்களை மத்திய வங்கியிடம் புகாரளிக்கலாம். செய்தியை மதிப்பாய்வு செய்ய සකසුරු மோசடிச் சரிபார்ப்பியைப் பயன்படுத்துங்கள்.",
          },
        },
      ],
      quiz: [
        {
          id: "q1",
          type: "mcq",
          prompt: { en: "In a Ponzi scheme, where do 'profits' come from?", si: "පොන්සි යෝජනා ක්‍රමයක 'ලාභ' එන්නේ කොහෙන්ද?", ta: "பொன்சி திட்டத்தில் 'லாபம்' எங்கிருந்து வருகிறது?" },
          options: [
            { id: "a", text: { en: "A successful business", si: "සාර්ථක ව්‍යාපාරයකින්", ta: "வெற்றிகரமான வணிகத்திலிருந்து" } },
            { id: "b", text: { en: "Money from newer members", si: "නව සාමාජිකයින්ගේ මුදලින්", ta: "புதிய உறுப்பினர்களின் பணத்திலிருந்து" } },
            { id: "c", text: { en: "Government grants", si: "රජයේ ප්‍රදානවලින්", ta: "அரசு மானியங்களிலிருந்து" } },
          ],
          correctId: "b",
          explanation: { en: "Payouts are recycled from new deposits, so the scheme must keep growing — and eventually collapses.", si: "ගෙවීම් නව තැන්පතුවලින් ප්‍රතිචක්‍රීකරණය කරන නිසා යෝජනා ක්‍රමය දිගටම වර්ධනය විය යුතුයි — අවසානයේ කඩා වැටේ.", ta: "கொடுப்பனவுகள் புதிய வைப்புகளிலிருந்து சுழற்சி செய்யப்படுகின்றன; எனவே திட்டம் வளர்ந்துகொண்டே இருக்க வேண்டும் — இறுதியில் சரியும்." },
        },
        {
          id: "q2",
          type: "truefalse",
          prompt: { en: "Seeing screenshots of other people's payouts proves an investment is real.", si: "අන් අයගේ ගෙවීම්වල තිරපිටපත් දැකීමෙන් ආයෝජනයක් සැබෑ බව ඔප්පු වේ.", ta: "மற்றவர்களின் கொடுப்பனவுத் திரைப்பிடிப்புகள் முதலீடு உண்மையானது என்பதை நிரூபிக்கும்." },
          options: TF,
          correctId: "f",
          explanation: { en: "Early payouts are part of how Ponzi schemes build trust. Screenshots are easy to fake, too.", si: "මුල් ගෙවීම් පොන්සි යෝජනා ක්‍රම විශ්වාසය ගොඩනගන ආකාරයේ කොටසකි. තිරපිටපත් ව්‍යාජව සෑදීමද පහසුයි.", ta: "ஆரம்பக் கொடுப்பனவுகள் பொன்சி திட்டங்கள் நம்பிக்கையை உருவாக்கும் வழியின் பகுதி. திரைப்பிடிப்புகளைப் போலியாக்குவதும் எளிது." },
        },
        {
          id: "q3",
          type: "mcq",
          prompt: { en: "Which is the biggest red flag?", si: "විශාලතම රතු ධජය කුමක්ද?", ta: "மிகப்பெரிய சிவப்புக் கொடி எது?" },
          options: [
            { id: "a", text: { en: "\"Earn bonuses for every friend you recruit\"", si: "\"ඔබ බඳවා ගන්නා සෑම මිතුරෙකුටම ප්‍රසාද දීමනා\"", ta: "\"நீங்கள் சேர்க்கும் ஒவ்வொரு நண்பருக்கும் போனஸ்\"" } },
            { id: "b", text: { en: "\"Returns can go up or down\"", si: "\"ප්‍රතිලාභ ඉහළ හෝ පහළ යා හැකියි\"", ta: "\"வருமானம் ஏறலாம் அல்லது இறங்கலாம்\"" } },
            { id: "c", text: { en: "\"We are licensed by the SEC (licence no. on our website)\"", si: "\"අපි SEC බලපත්‍රලාභීයි (බලපත්‍ර අංකය අපේ වෙබ් අඩවියේ)\"", ta: "\"நாங்கள் SEC உரிமம் பெற்றவர்கள் (உரிம எண் எங்கள் இணையதளத்தில்)\"" } },
          ],
          correctId: "a",
          explanation: { en: "Rewards based on recruitment are the hallmark of pyramid schemes. (Even a claimed licence should be checked on the regulator's own website.)", si: "බඳවා ගැනීම මත පදනම් වූ ත්‍යාග පිරමිඩ යෝජනා ක්‍රමවල ලක්ෂණයයි. (ප්‍රකාශිත බලපත්‍රයක් පවා නියාමකයාගේම වෙබ් අඩවියේ පරීක්ෂා කළ යුතුයි.)", ta: "ஆட்சேர்ப்பை அடிப்படையாகக் கொண்ட வெகுமதிகள் பிரமிடு திட்டங்களின் அடையாளம். (கூறப்படும் உரிமத்தைக் கூட ஒழுங்குபடுத்துநரின் இணையதளத்தில் சரிபார்க்க வேண்டும்.)" },
        },
      ],
      sources: [SOURCES.cbsl, SOURCES.sec],
      lastReviewed: REVIEWED,
      nextReview: NEXT_REVIEW,
    },
    {
      slug: "phishing-fake-links",
      title: { en: "Phishing, fake links and fake prizes", si: "ෆිෂිං, ව්‍යාජ සබැඳි සහ ව්‍යාජ ත්‍යාග", ta: "ஃபிஷிங், போலி இணைப்புகள், போலிப் பரிசுகள்" },
      summary: {
        en: "'Congratulations, you've won!' — how to recognise and handle scam messages.",
        si: "'සුබ පැතුම්, ඔබ දිනුවා!' — වංචා පණිවිඩ හඳුනාගෙන කටයුතු කරන ආකාරය.",
        ta: "'வாழ்த்துக்கள், நீங்கள் வென்றீர்கள்!' — மோசடிச் செய்திகளை அடையாளம் கண்டு கையாள்வது எப்படி.",
      },
      minutes: 3,
      xp: 25,
      tags: ["scams", "phishing", "protection"],
      protection: true,
      cards: [
        {
          type: "concept",
          title: { en: "What is phishing?", si: "ෆිෂිං යනු කුමක්ද?", ta: "ஃபிஷிங் என்றால் என்ன?" },
          body: {
            en: "Phishing is when scammers pretend to be a bank, courier, mobile company or government office to trick you into clicking a link, entering details or paying money.",
            si: "ෆිෂිං යනු වංචාකරුවන් බැංකුවක්, කුරියර් සේවාවක්, ජංගම සමාගමක් හෝ රජයේ කාර්යාලයක් ලෙස පෙනී සිට සබැඳියක් ක්ලික් කිරීමට, විස්තර ඇතුළත් කිරීමට හෝ මුදල් ගෙවීමට ඔබව රැවටීමයි.",
            ta: "ஃபிஷிங் என்பது மோசடிக்காரர்கள் வங்கி, கூரியர், மொபைல் நிறுவனம் அல்லது அரசு அலுவலகம் போல் நடித்து இணைப்பைக் கிளிக் செய்ய, விவரங்களை உள்ளிட அல்லது பணம் செலுத்த உங்களை ஏமாற்றுவது.",
          },
        },
        {
          type: "warning",
          title: { en: "🚩 Typical messages", si: "🚩 සාමාන්‍ය පණිවිඩ", ta: "🚩 வழக்கமான செய்திகள்" },
          body: {
            en: "\"You've won Rs. 500,000 — pay a small fee to claim.\" · \"Your parcel is held, pay Rs. 350 here.\" · \"Your account will be blocked today, verify now.\" · \"Send your OTP to confirm.\"",
            si: "\"ඔබ රු. 500,000ක් දිනුවා — ලබා ගැනීමට කුඩා ගාස්තුවක් ගෙවන්න.\" · \"ඔබේ පාර්සලය රඳවා ඇත, මෙතැනින් රු. 350 ගෙවන්න.\" · \"ඔබේ ගිණුම අද අවහිර වේ, දැන්ම සත්‍යාපනය කරන්න.\" · \"තහවුරු කිරීමට ඔබේ OTP එවන්න.\"",
            ta: "\"நீங்கள் ரூ. 500,000 வென்றீர்கள் — பெற சிறு கட்டணம் செலுத்துங்கள்.\" · \"உங்கள் பார்சல் நிறுத்தப்பட்டுள்ளது, இங்கே ரூ. 350 செலுத்துங்கள்.\" · \"உங்கள் கணக்கு இன்று முடக்கப்படும், இப்போதே சரிபாருங்கள்.\" · \"உறுதிப்படுத்த OTP அனுப்புங்கள்.\"",
          },
        },
        {
          type: "tip",
          title: { en: "Stop · Check · Verify", si: "නවතින්න · පරීක්ෂා කරන්න · සත්‍යාපනය කරන්න", ta: "நிறுத்து · சரிபார் · உறுதிசெய்" },
          body: {
            en: "Stop: don't click or reply in a hurry. Check: look at the sender and the link carefully — real organisations don't use short links or random numbers. Verify: contact the organisation using a number or app you already trust.",
            si: "නවතින්න: ඉක්මනින් ක්ලික් කිරීම හෝ පිළිතුරු දීම නොකරන්න. පරීක්ෂා කරන්න: යවන්නා සහ සබැඳිය හොඳින් බලන්න — සැබෑ ආයතන කෙටි සබැඳි හෝ අහඹු අංක භාවිත නොකරයි. සත්‍යාපනය කරන්න: ඔබ දැනටමත් විශ්වාස කරන අංකයක් හෝ ඇප් එකක් මඟින් ආයතනය අමතන්න.",
            ta: "நிறுத்து: அவசரமாகக் கிளிக் அல்லது பதில் வேண்டாம். சரிபார்: அனுப்புநரையும் இணைப்பையும் கவனமாகப் பாருங்கள் — உண்மையான நிறுவனங்கள் சுருக்க இணைப்புகளையோ சீரற்ற எண்களையோ பயன்படுத்துவதில்லை. உறுதிசெய்: நீங்கள் ஏற்கனவே நம்பும் எண் அல்லது செயலி மூலம் நிறுவனத்தைத் தொடர்புகொள்ளுங்கள்.",
          },
        },
        {
          type: "tip",
          title: { en: "If you already clicked", si: "ඔබ දැනටමත් ක්ලික් කළා නම්", ta: "ஏற்கனவே கிளிக் செய்திருந்தால்" },
          body: {
            en: "Call your bank immediately using the number on your card to block it. Change your passwords. Report the incident to your bank and the police. Acting fast can limit the damage.",
            si: "ඔබේ කාඩ්පත අවහිර කිරීමට එහි ඇති අංකයට වහාම ඔබේ බැංකුව අමතන්න. ඔබේ මුරපද වෙනස් කරන්න. සිදුවීම ඔබේ බැංකුවට සහ පොලිසියට වාර්තා කරන්න. ඉක්මනින් ක්‍රියා කිරීමෙන් හානිය සීමා කළ හැකියි.",
            ta: "உங்கள் அட்டையை முடக்க அதிலுள்ள எண்ணில் உடனே வங்கியை அழையுங்கள். கடவுச்சொற்களை மாற்றுங்கள். சம்பவத்தை வங்கிக்கும் காவல்துறைக்கும் புகாரளியுங்கள். விரைவாகச் செயல்படுவது சேதத்தைக் குறைக்கும்.",
          },
        },
      ],
      quiz: [
        {
          id: "q1",
          type: "scenario",
          prompt: { en: "\"You won a lucky draw! Pay Rs. 2,500 processing fee to receive Rs. 300,000.\" This is…", si: "\"ඔබ වාසනා දිනුම් ඇදීමක් දිනුවා! රු. 300,000ක් ලැබීමට රු. 2,500 සැකසුම් ගාස්තුවක් ගෙවන්න.\" මෙය…", ta: "\"நீங்கள் அதிர்ஷ்டக் குலுக்கலில் வென்றீர்கள்! ரூ. 300,000 பெற ரூ. 2,500 செயலாக்கக் கட்டணம் செலுத்துங்கள்.\" இது…" },
          options: [
            { id: "a", text: { en: "Probably a scam", si: "බොහෝ විට වංචාවකි", ta: "பெரும்பாலும் மோசடி" } },
            { id: "b", text: { en: "Probably real", si: "බොහෝ විට සැබෑ", ta: "பெரும்பாலும் உண்மை" } },
          ],
          correctId: "a",
          explanation: { en: "Real prizes don't require you to pay first. Upfront fees are a classic scam sign.", si: "සැබෑ ත්‍යාගවලට මුලින් ගෙවීමක් අවශ්‍ය නැහැ. පෙරගෙවුම් ගාස්තු සම්භාව්‍ය වංචා ලකුණකි.", ta: "உண்மையான பரிசுகளுக்கு முதலில் பணம் செலுத்தத் தேவையில்லை. முன்கட்டணம் வழக்கமான மோசடி அறிகுறி." },
        },
        {
          id: "q2",
          type: "mcq",
          prompt: { en: "What's the safest way to check a message that claims to be from your bank?", si: "ඔබේ බැංකුවෙන් යැයි කියන පණිවිඩයක් පරීක්ෂා කිරීමට ආරක්ෂිතම ක්‍රමය කුමක්ද?", ta: "உங்கள் வங்கியிலிருந்து எனக் கூறும் செய்தியைச் சரிபார்க்கப் பாதுகாப்பான வழி எது?" },
          options: [
            { id: "a", text: { en: "Call the number in the message", si: "පණිවිඩයේ ඇති අංකයට ඇමතීම", ta: "செய்தியிலுள்ள எண்ணை அழைப்பது" } },
            { id: "b", text: { en: "Call the number on your card or the bank's official website", si: "ඔබේ කාඩ්පතේ හෝ බැංකුවේ නිල වෙබ් අඩවියේ ඇති අංකයට ඇමතීම", ta: "அட்டையில் அல்லது வங்கியின் அதிகாரப்பூர்வ இணையதளத்தில் உள்ள எண்ணை அழைப்பது" } },
            { id: "c", text: { en: "Reply to the SMS", si: "SMS එකට පිළිතුරු දීම", ta: "SMS க்குப் பதிலளிப்பது" } },
          ],
          correctId: "b",
          explanation: { en: "Scammers put their own numbers in messages. Use contact details you already trust.", si: "වංචාකරුවන් පණිවිඩවල තමන්ගේම අංක දමනවා. ඔබ දැනටමත් විශ්වාස කරන සම්බන්ධතා විස්තර භාවිත කරන්න.", ta: "மோசடிக்காரர்கள் செய்திகளில் தங்கள் சொந்த எண்களை வைக்கிறார்கள். நீங்கள் ஏற்கனவே நம்பும் தொடர்பு விவரங்களைப் பயன்படுத்துங்கள்." },
        },
        {
          id: "q3",
          type: "truefalse",
          prompt: { en: "If you clicked a fake link and entered card details, you should call your bank right away.", si: "ඔබ ව්‍යාජ සබැඳියක් ක්ලික් කර කාඩ් විස්තර ඇතුළත් කළා නම්, වහාම ඔබේ බැංකුව ඇමතිය යුතුයි.", ta: "போலி இணைப்பைக் கிளிக் செய்து அட்டை விவரங்களை உள்ளிட்டிருந்தால், உடனே வங்கியை அழைக்க வேண்டும்." },
          options: TF,
          correctId: "t",
          explanation: { en: "Blocking the card quickly can stop further losses.", si: "කාඩ්පත ඉක්මනින් අවහිර කිරීමෙන් තවදුරටත් පාඩු නැවැත්විය හැකියි.", ta: "அட்டையை விரைவாக முடக்குவது மேலும் இழப்புகளைத் தடுக்கும்." },
        },
      ],
      sources: [SOURCES.cbsl, SOURCES.sakasuru],
      lastReviewed: REVIEWED,
      nextReview: NEXT_REVIEW,
    },
  ],
};
