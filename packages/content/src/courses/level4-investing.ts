import { type Course, REVIEWED, NEXT_REVIEW, NEXT_REVIEW_TIME_SENSITIVE, SOURCES, TF, rs } from "../types.js";

export const level4: Course = {
  slug: "saving-investing",
  level: 4,
  icon: "📈",
  color: "#B7791F",
  title: { en: "Saving & Investing", si: "ඉතිරි කිරීම සහ ආයෝජනය", ta: "சேமிப்பும் முதலீடும்" },
  description: {
    en: "Compound interest, risk and return, and the main investment options in Sri Lanka. Education only — never a recommendation.",
    si: "සංයුක්ත පොලිය, අවදානම සහ ප්‍රතිලාභ, සහ ශ්‍රී ලංකාවේ ප්‍රධාන ආයෝජන විකල්ප. අධ්‍යාපනය පමණි — කිසිවිටෙක නිර්දේශයක් නොවේ.",
    ta: "கூட்டு வட்டி, ஆபத்தும் வருமானமும், இலங்கையின் முக்கிய முதலீட்டு வழிகள். கல்வி மட்டுமே — பரிந்துரை அல்ல.",
  },
  prerequisites: ["emergency-fund"],
  lessons: [
    {
      slug: "compound-interest",
      title: { en: "The magic of compound interest", si: "සංයුක්ත පොලියේ ආශ්චර්යය", ta: "கூட்டு வட்டியின் அதிசயம்" },
      summary: {
        en: "Interest that earns interest — and why starting early matters.",
        si: "පොලියට පොලිය ලැබීම — සහ කලින් පටන් ගැනීම වැදගත් වන්නේ ඇයි.",
        ta: "வட்டிக்கு வட்டி — சீக்கிரம் தொடங்குவது ஏன் முக்கியம்.",
      },
      minutes: 4,
      xp: 25,
      tags: ["investing", "interest"],
      cards: [
        {
          type: "concept",
          title: { en: "Simple vs compound", si: "සරල සහ සංයුක්ත", ta: "எளிய மற்றும் கூட்டு" },
          body: {
            en: "Simple interest is paid only on the money you put in. Compound interest is paid on your money AND on the interest it already earned. Over time, the difference grows.",
            si: "සරල පොලිය ඔබ දැමූ මුදලට පමණක් ගෙවයි. සංයුක්ත පොලිය ඔබේ මුදලට සහ දැනටමත් උපයා ඇති පොලියටත් ගෙවයි. කාලයත් සමඟ වෙනස වැඩි වේ.",
            ta: "எளிய வட்டி நீங்கள் வைத்த பணத்துக்கு மட்டுமே. கூட்டு வட்டி உங்கள் பணத்துக்கும் ஏற்கனவே ஈட்டிய வட்டிக்கும் செலுத்தப்படும். காலப்போக்கில் வேறுபாடு வளரும்.",
          },
        },
        {
          type: "example",
          title: { en: "Rs. 100,000 at 10%", si: "10% ට රු. 100,000", ta: "10% இல் ரூ. 100,000" },
          body: {
            en: "Example rate only. After 2 years: simple interest gives Rs. 120,000, compound (yearly) gives Rs. 121,000. After 20 years: simple gives Rs. 300,000, compound about Rs. 672,750.",
            si: "උදාහරණ අනුපාතයක් පමණි. වසර 2කට පසු: සරල පොලියෙන් රු. 120,000, සංයුක්ත (වාර්ෂික) පොලියෙන් රු. 121,000. වසර 20කට පසු: සරල රු. 300,000, සංයුක්ත රු. 672,750ක් පමණ.",
            ta: "உதாரண விகிதம் மட்டும். 2 ஆண்டுகளுக்குப் பின்: எளிய வட்டி ரூ. 120,000, கூட்டு (ஆண்டு) ரூ. 121,000. 20 ஆண்டுகளுக்குப் பின்: எளிய ரூ. 300,000, கூட்டு சுமார் ரூ. 672,750.",
          },
        },
        {
          type: "story",
          title: { en: "Tharindu vs Kavindi", si: "තරිඳු සහ කවින්දි", ta: "தரிந்து மற்றும் கவிந்தி" },
          body: {
            en: "Kavindi starts saving Rs. 5,000 a month at 22. Tharindu starts the same at 32. With the same interest, Kavindi ends up with far more by 55 — not because she saved much more, but because her money had ten extra years to compound.",
            si: "කවින්දි වයස 22දී මසකට රු. 5,000ක් ඉතිරි කිරීම පටන් ගන්නවා. තරිඳු වයස 32දී එසේම පටන් ගන්නවා. එකම පොලියක් සමඟ, 55 වන විට කවින්දිට ඉතා වැඩි මුදලක් ලැබේ — ඇය වැඩිපුර ඉතිරි කළ නිසා නොව, ඇගේ මුදල්වලට සංයුක්ත වීමට අමතර වසර දහයක් ලැබුණු නිසා.",
            ta: "கவிந்தி 22 வயதில் மாதம் ரூ. 5,000 சேமிக்கத் தொடங்குகிறார். தரிந்து 32 வயதில் அதையே தொடங்குகிறார். அதே வட்டியில், 55 வயதுக்குள் கவிந்திக்கு மிக அதிகமாக இருக்கும் — அவர் அதிகம் சேமித்ததால் அல்ல, அவரது பணம் கூட்டாக வளர பத்து ஆண்டுகள் கூடுதலாகக் கிடைத்ததால்.",
          },
        },
        {
          type: "warning",
          title: { en: "Compounding works on debt too", si: "සංයුක්ත වීම ණයටත් බලපායි", ta: "கூட்டு வட்டி கடனிலும் வேலை செய்யும்" },
          body: {
            en: "Unpaid credit-card interest compounds against you. Paying off high-interest debt is often one of the best 'returns' you can get.",
            si: "නොගෙවූ ණය කාඩ්පත් පොලිය ඔබට එරෙහිව සංයුක්ත වේ. ඉහළ පොලී ණය ගෙවා දැමීම බොහෝ විට ඔබට ලබාගත හැකි හොඳම 'ප්‍රතිලාභ'යකි.",
            ta: "செலுத்தாத கடன் அட்டை வட்டி உங்களுக்கு எதிராகக் கூட்டாக வளரும். அதிக வட்டிக் கடனை அடைப்பது பெரும்பாலும் சிறந்த 'வருமானங்களில்' ஒன்று.",
          },
        },
      ],
      quiz: [
        {
          id: "q1",
          type: "calculation",
          prompt: { en: "Rs. 100,000 at 10% compounded yearly for 2 years becomes…", si: "වාර්ෂිකව සංයුක්ත 10% ට රු. 100,000 වසර 2කින් කීයක් වේද?", ta: "ஆண்டுக் கூட்டு 10% இல் ரூ. 100,000 2 ஆண்டுகளில் எவ்வளவு ஆகும்?" },
          options: [{ id: "a", text: rs("120,000") }, { id: "b", text: rs("121,000") }, { id: "c", text: rs("110,000") }],
          correctId: "b",
          explanation: { en: "Year 1: 110,000. Year 2: 110,000 × 1.10 = 121,000.", si: "1 වසර: 110,000. 2 වසර: 110,000 × 1.10 = 121,000.", ta: "ஆண்டு 1: 110,000. ஆண்டு 2: 110,000 × 1.10 = 121,000." },
        },
        {
          id: "q2",
          type: "mcq",
          prompt: { en: "What makes compound growth most powerful?", si: "සංයුක්ත වර්ධනය වඩාත් බලවත් කරන්නේ කුමක්ද?", ta: "கூட்டு வளர்ச்சியை மிகச் சக்திவாய்ந்ததாக்குவது எது?" },
          options: [
            { id: "a", text: { en: "Time", si: "කාලය", ta: "காலம்" } },
            { id: "b", text: { en: "Luck", si: "වාසනාව", ta: "அதிர்ஷ்டம்" } },
            { id: "c", text: { en: "Withdrawing interest every month", si: "සෑම මසකම පොලිය ආපසු ගැනීම", ta: "ஒவ்வொரு மாதமும் வட்டியை எடுப்பது" } },
          ],
          correctId: "a",
          explanation: { en: "The longer interest stays invested, the more it earns on itself.", si: "පොලිය වැඩි කාලයක් ආයෝජනය කර තිබෙන තරමට එය තමාගෙන්ම වැඩිපුර උපයයි.", ta: "வட்டி நீண்ட காலம் முதலீட்டில் இருக்கும்போது, அது தன்மீதே அதிகம் ஈட்டும்." },
        },
        {
          id: "q3",
          type: "truefalse",
          prompt: { en: "Compound interest can make debt grow faster if you don't repay it.", si: "ආපසු නොගෙවුවහොත් සංයුක්ත පොලිය නිසා ණය වේගයෙන් වැඩි විය හැකියි.", ta: "திருப்பிச் செலுத்தாவிட்டால் கூட்டு வட்டி கடனை வேகமாக வளரச் செய்யும்." },
          options: TF,
          correctId: "t",
          explanation: { en: "Interest charged on unpaid interest makes balances snowball.", si: "නොගෙවූ පොලියට පොලිය අය කිරීම ශේෂය හිම බෝලයක් මෙන් වැඩි කරයි.", ta: "செலுத்தாத வட்டிக்கு வட்டி வசூலிப்பது நிலுவையைப் பனிப்பந்து போல் வளர்க்கும்." },
        },
      ],
      sources: [SOURCES.sakasuru],
      lastReviewed: REVIEWED,
      nextReview: NEXT_REVIEW,
    },
    {
      slug: "risk-and-return",
      title: { en: "Risk, return and diversification", si: "අවදානම, ප්‍රතිලාභ සහ විවිධාංගීකරණය", ta: "ஆபத்து, வருமானம், பல்வகைப்படுத்தல்" },
      summary: {
        en: "Higher possible returns come with higher risk. Don't put all your eggs in one basket.",
        si: "ඉහළ ප්‍රතිලාභ හැකියාව ඉහළ අවදානමක් සමඟ එයි. සියලු බිත්තර එක කූඩයකට නොදමන්න.",
        ta: "அதிக வருமான வாய்ப்பு அதிக ஆபத்துடன் வரும். எல்லா முட்டைகளையும் ஒரே கூடையில் வைக்காதீர்கள்.",
      },
      minutes: 4,
      xp: 25,
      tags: ["investing", "risk"],
      cards: [
        {
          type: "concept",
          title: { en: "Risk and return travel together", si: "අවදානම සහ ප්‍රතිලාභ එකට යයි", ta: "ஆபத்தும் வருமானமும் சேர்ந்தே பயணிக்கும்" },
          body: {
            en: "Investments that might grow faster (like shares) can also fall in value. Safer options (like a savings account at a licensed bank) usually grow more slowly. No real investment offers high returns with no risk.",
            si: "වේගයෙන් වර්ධනය විය හැකි ආයෝජන (කොටස් වැනි) වටිනාකමින් පහත වැටීමටද හැකියි. ආරක්ෂිත විකල්ප (බලපත්‍රලාභී බැංකුවක ඉතිරි කිරීමේ ගිණුමක් වැනි) සාමාන්‍යයෙන් සෙමින් වර්ධනය වේ. අවදානමක් නැතිව ඉහළ ප්‍රතිලාභ දෙන සැබෑ ආයෝජනයක් නැහැ.",
            ta: "வேகமாக வளரக்கூடிய முதலீடுகள் (பங்குகள் போன்றவை) மதிப்பில் சரியவும் கூடும். பாதுகாப்பான வழிகள் (உரிமம் பெற்ற வங்கியின் சேமிப்புக் கணக்கு போன்றவை) பொதுவாக மெதுவாக வளரும். ஆபத்தே இல்லாமல் அதிக வருமானம் தரும் உண்மையான முதலீடு இல்லை.",
          },
        },
        {
          type: "concept",
          title: { en: "Diversification", si: "විවිධාංගීකරණය", ta: "பல்வகைப்படுத்தல்" },
          body: {
            en: "Diversifying means spreading money across different types of investments, so one bad result doesn't wipe out everything.",
            si: "විවිධාංගීකරණය යනු විවිධ ආයෝජන වර්ග අතර මුදල් බෙදා හැරීමයි, එවිට එක් නරක ප්‍රතිඵලයකින් සියල්ල විනාශ නොවේ.",
            ta: "பல்வகைப்படுத்தல் என்பது பணத்தை வெவ்வேறு முதலீட்டு வகைகளில் பரப்புவது; அதனால் ஒரு மோசமான முடிவு எல்லாவற்றையும் அழிக்காது.",
          },
        },
        {
          type: "tip",
          title: { en: "Match money to time", si: "මුදල කාලයට ගැළපෙන්න", ta: "பணத்தைக் காலத்துடன் பொருத்துங்கள்" },
          body: {
            en: "Money you need soon (emergency fund, school fees next year) belongs in safe, easy-to-access places. Only money you won't need for many years should take on more risk.",
            si: "ඉක්මනින් අවශ්‍ය මුදල් (හදිසි අරමුදල, ලබන වසරේ පාසල් ගාස්තු) ආරක්ෂිත, පහසුවෙන් ලබාගත හැකි තැන්වල තිබිය යුතුයි. වසර ගණනාවක් අවශ්‍ය නොවන මුදල් පමණක් වැඩි අවදානමක් ගත යුතුයි.",
            ta: "விரைவில் தேவைப்படும் பணம் (அவசர நிதி, அடுத்த ஆண்டுப் பள்ளிக் கட்டணம்) பாதுகாப்பான, எளிதில் எடுக்கக்கூடிய இடங்களில். பல ஆண்டுகள் தேவைப்படாத பணம் மட்டுமே அதிக ஆபத்தை எடுக்கலாம்.",
          },
        },
        {
          type: "warning",
          title: { en: "'Guaranteed high return' = red flag", si: "'සහතික ඉහළ ප්‍රතිලාභ' = රතු ධජය", ta: "'உத்தரவாத அதிக வருமானம்' = சிவப்புக் கொடி" },
          body: {
            en: "If anyone promises high returns with no risk, treat it as a likely scam. Check whether the company is licensed by the Central Bank or the SEC before giving any money.",
            si: "යමෙක් අවදානමක් නැති ඉහළ ප්‍රතිලාභ පොරොන්දු වුවහොත්, එය වංචාවක් විය හැකි යැයි සලකන්න. මුදල් දීමට පෙර සමාගම මහ බැංකුවේ හෝ SEC හි බලපත්‍රලාභීදැයි පරීක්ෂා කරන්න.",
            ta: "யாராவது ஆபத்தில்லாத அதிக வருமானம் என வாக்குறுதி அளித்தால், அது மோசடியாக இருக்கலாம் எனக் கருதுங்கள். பணம் கொடுக்கும் முன் நிறுவனம் மத்திய வங்கி அல்லது SEC உரிமம் பெற்றதா என்று சரிபாருங்கள்.",
          },
        },
      ],
      quiz: [
        {
          id: "q1",
          type: "truefalse",
          prompt: { en: "An investment can offer high returns with zero risk.", si: "ආයෝජනයකට අවදානමක් නැතිව ඉහළ ප්‍රතිලාභ ලබා දිය හැකියි.", ta: "ஒரு முதலீடு ஆபத்தே இல்லாமல் அதிக வருமானம் தரலாம்." },
          options: TF,
          correctId: "f",
          explanation: { en: "Higher potential returns always come with higher risk. 'Zero risk, high return' is a warning sign.", si: "ඉහළ ප්‍රතිලාභ හැකියාව සැමවිටම ඉහළ අවදානමක් සමඟ එයි. 'අවදානම් නැති, ඉහළ ප්‍රතිලාභ' අනතුරු ඇඟවීමකි.", ta: "அதிக வருமான வாய்ப்பு எப்போதும் அதிக ஆபத்துடன் வரும். 'ஆபத்தில்லை, அதிக வருமானம்' எச்சரிக்கை அறிகுறி." },
        },
        {
          id: "q2",
          type: "mcq",
          prompt: { en: "What does diversification mean?", si: "විවිධාංගීකරණය යනු කුමක්ද?", ta: "பல்வகைப்படுத்தல் என்றால் என்ன?" },
          options: [
            { id: "a", text: { en: "Putting all money in the best-performing share", si: "හොඳම කොටසට සියලු මුදල් දැමීම", ta: "சிறப்பாகச் செயல்படும் பங்கில் எல்லாப் பணத்தையும் வைப்பது" } },
            { id: "b", text: { en: "Spreading money across different investments", si: "විවිධ ආයෝජන අතර මුදල් බෙදා හැරීම", ta: "வெவ்வேறு முதலீடுகளில் பணத்தைப் பரப்புவது" } },
            { id: "c", text: { en: "Keeping all money as cash at home", si: "සියලු මුදල් නිවසේ තබා ගැනීම", ta: "எல்லாப் பணத்தையும் வீட்டில் வைப்பது" } },
          ],
          correctId: "b",
          explanation: { en: "Spreading reduces the damage any single investment can do.", si: "බෙදා හැරීමෙන් එක් ආයෝජනයක් කළ හැකි හානිය අඩු වේ.", ta: "பரப்புவது எந்த ஒரு முதலீடும் ஏற்படுத்தும் சேதத்தைக் குறைக்கும்." },
        },
        {
          id: "q3",
          type: "scenario",
          prompt: { en: "Priya needs her money for university fees in 8 months. Which is most suitable?", si: "ප්‍රියාට මාස 8කින් විශ්වවිද්‍යාල ගාස්තු සඳහා මුදල් අවශ්‍යයි. වඩාත් සුදුසු කුමක්ද?", ta: "பிரியாவுக்கு 8 மாதங்களில் பல்கலைக்கழகக் கட்டணத்துக்குப் பணம் தேவை. எது மிகப் பொருத்தமானது?" },
          options: [
            { id: "a", text: { en: "A safe deposit at a licensed bank", si: "බලපත්‍රලාභී බැංකුවක ආරක්ෂිත තැන්පතුවක්", ta: "உரிமம் பெற்ற வங்கியில் பாதுகாப்பான வைப்பு" } },
            { id: "b", text: { en: "A single company's shares", si: "එක් සමාගමක කොටස්", ta: "ஒரே நிறுவனத்தின் பங்குகள்" } },
            { id: "c", text: { en: "A crypto group promising 30% a month", si: "මසකට 30% පොරොන්දු වන ක්‍රිප්ටෝ කණ්ඩායමක්", ta: "மாதம் 30% வாக்குறுதி அளிக்கும் கிரிப்டோ குழு" } },
          ],
          correctId: "a",
          explanation: { en: "Short-term money should be kept safe. Shares can fall right when she needs the cash, and option C is a classic scam pattern.", si: "කෙටිකාලීන මුදල් ආරක්ෂිතව තැබිය යුතුයි. ඇයට මුදල් අවශ්‍ය මොහොතේම කොටස් පහත වැටිය හැකි අතර, C විකල්පය සම්භාව්‍ය වංචා රටාවකි.", ta: "குறுகிய காலப் பணம் பாதுகாப்பாக இருக்க வேண்டும். அவருக்குப் பணம் தேவைப்படும்போதே பங்குகள் சரியலாம்; C வழக்கமான மோசடி முறை." },
        },
      ],
      sources: [SOURCES.sec, SOURCES.cbsl],
      lastReviewed: REVIEWED,
      nextReview: NEXT_REVIEW,
    },
    {
      slug: "treasury-fd-unit-trusts",
      title: { en: "Fixed deposits, Treasury bills & unit trusts", si: "ස්ථාවර තැන්පතු, භාණ්ඩාගාර බිල්පත් සහ ඒකක භාර", ta: "நிலையான வைப்பு, திறைசேரி உண்டியல்கள், அலகு நம்பிக்கைகள்" },
      summary: {
        en: "What they are, how they work, and who regulates them.",
        si: "ඒවා මොනවාද, ක්‍රියා කරන්නේ කෙසේද, නියාමනය කරන්නේ කවුද.",
        ta: "அவை என்ன, எப்படி வேலை செய்கின்றன, யார் ஒழுங்குபடுத்துகிறார்கள்.",
      },
      minutes: 5,
      xp: 30,
      tags: ["investing", "treasury", "fd", "unit-trusts"],
      timeSensitive: true,
      cards: [
        {
          type: "concept",
          title: { en: "Fixed deposit (FD)", si: "ස්ථාවර තැන්පතුව (FD)", ta: "நிலையான வைப்பு (FD)" },
          body: {
            en: "You leave money with a bank or licensed finance company for a fixed period (e.g. 6 or 12 months) at an agreed rate. Breaking it early usually means less interest. Banks and licensed finance companies are supervised by the Central Bank.",
            si: "ඔබ නියමිත කාලයකට (උදා: මාස 6 හෝ 12) එකඟ වූ අනුපාතයකට බැංකුවක හෝ බලපත්‍රලාභී මූල්‍ය සමාගමක මුදල් තබනවා. කලින් කඩා දැමීමෙන් සාමාන්‍යයෙන් අඩු පොලියක් ලැබේ. බැංකු සහ බලපත්‍රලාභී මූල්‍ය සමාගම් මහ බැංකුව විසින් අධීක්ෂණය කරයි.",
            ta: "ஒப்புக்கொண்ட விகிதத்தில் நிலையான காலத்துக்கு (எ.கா. 6 அல்லது 12 மாதங்கள்) வங்கி அல்லது உரிமம் பெற்ற நிதி நிறுவனத்தில் பணத்தை வைக்கிறீர்கள். முன்கூட்டியே உடைத்தால் பொதுவாகக் குறைந்த வட்டி. வங்கிகளும் உரிமம் பெற்ற நிதி நிறுவனங்களும் மத்திய வங்கியால் மேற்பார்வையிடப்படுகின்றன.",
          },
        },
        {
          type: "concept",
          title: { en: "Treasury bills and bonds", si: "භාණ්ඩාගාර බිල්පත් සහ බැඳුම්කර", ta: "திறைசேரி உண்டியல்களும் முறிகளும்" },
          body: {
            en: "These are loans you give to the Government of Sri Lanka. Treasury bills are short-term (91, 182 or 364 days). Treasury bonds are longer-term and usually pay interest twice a year. They're issued through the Central Bank's Public Debt Department and can be bought via primary dealers and many banks.",
            si: "මේවා ඔබ ශ්‍රී ලංකා රජයට දෙන ණයයි. භාණ්ඩාගාර බිල්පත් කෙටිකාලීනයි (දින 91, 182 හෝ 364). භාණ්ඩාගාර බැඳුම්කර දිගුකාලීන වන අතර සාමාන්‍යයෙන් වසරකට දෙවරක් පොලිය ගෙවයි. මහ බැංකුවේ රාජ්‍ය ණය දෙපාර්තමේන්තුව හරහා නිකුත් කරන අතර ප්‍රාථමික අලෙවිකරුවන් සහ බොහෝ බැංකු හරහා මිලදී ගත හැකියි.",
            ta: "இவை இலங்கை அரசுக்கு நீங்கள் கொடுக்கும் கடன்கள். திறைசேரி உண்டியல்கள் குறுகிய காலம் (91, 182 அல்லது 364 நாட்கள்). திறைசேரி முறிகள் நீண்ட காலம், பொதுவாக ஆண்டுக்கு இருமுறை வட்டி செலுத்தும். மத்திய வங்கியின் பொதுக் கடன் திணைக்களம் மூலம் வெளியிடப்படுகின்றன; முதன்மை விற்பனையாளர்கள், பல வங்கிகள் மூலம் வாங்கலாம்.",
          },
        },
        {
          type: "concept",
          title: { en: "Unit trusts and shares", si: "ඒකක භාර සහ කොටස්", ta: "அலகு நம்பிக்கைகளும் பங்குகளும்" },
          body: {
            en: "A unit trust pools money from many people and a professional manager invests it. Shares are part-ownership of a company listed on the Colombo Stock Exchange. Both can rise and fall. Unit trusts and the stock market are regulated by the SEC Sri Lanka.",
            si: "ඒකක භාරයක් බොහෝ දෙනාගේ මුදල් එකතු කර වෘත්තීය කළමනාකරුවෙක් ආයෝජනය කරයි. කොටස් යනු කොළඹ කොටස් හුවමාරුවේ ලැයිස්තුගත සමාගමක හවුල් අයිතියයි. දෙකම ඉහළ පහළ යා හැකියි. ඒකක භාර සහ කොටස් වෙළඳපොළ ශ්‍රී ලංකා SEC විසින් නියාමනය කරයි.",
            ta: "அலகு நம்பிக்கை பலரின் பணத்தைத் திரட்டி, தொழில்முறை மேலாளர் முதலீடு செய்வது. பங்குகள் கொழும்புப் பங்குச் சந்தையில் பட்டியலிடப்பட்ட நிறுவனத்தின் பகுதி உரிமை. இரண்டும் ஏறி இறங்கலாம். அலகு நம்பிக்கைகளும் பங்குச் சந்தையும் இலங்கை SEC ஆல் ஒழுங்குபடுத்தப்படுகின்றன.",
          },
        },
        {
          type: "tip",
          title: { en: "Questions to ask before investing", si: "ආයෝජනයට පෙර ඇසිය යුතු ප්‍රශ්න", ta: "முதலீட்டுக்கு முன் கேட்க வேண்டியவை" },
          body: {
            en: "Is the provider licensed? Can I lose money? How quickly can I get it back (liquidity)? What fees apply? How long should I stay invested? Current rates change often — always check the latest figures from official sources.",
            si: "සපයන්නා බලපත්‍රලාභීද? මට මුදල් අහිමි විය හැකිද? කෙතරම් ඉක්මනින් ආපසු ගත හැකිද (ද්‍රවශීලතාව)? කුමන ගාස්තු අදාළද? කොපමණ කාලයක් ආයෝජනය කර සිටිය යුතුද? වත්මන් අනුපාත නිතර වෙනස් වේ — නිල මූලාශ්‍රවලින් නවතම සංඛ්‍යා සැමවිටම පරීක්ෂා කරන්න.",
            ta: "வழங்குநர் உரிமம் பெற்றவரா? நான் பணத்தை இழக்கலாமா? எவ்வளவு விரைவில் திரும்பப் பெறலாம் (திரவத்தன்மை)? என்ன கட்டணங்கள்? எவ்வளவு காலம் முதலீட்டில் இருக்க வேண்டும்? தற்போதைய விகிதங்கள் அடிக்கடி மாறும் — அதிகாரப்பூர்வ மூலங்களிலிருந்து சமீபத்திய எண்களை எப்போதும் சரிபாருங்கள்.",
          },
        },
      ],
      quiz: [
        {
          id: "q1",
          type: "mcq",
          prompt: { en: "A Treasury bill is…", si: "භාණ්ඩාගාර බිල්පතක් යනු…", ta: "திறைசேரி உண்டியல் என்பது…" },
          options: [
            { id: "a", text: { en: "A short-term loan to the Government", si: "රජයට දෙන කෙටිකාලීන ණයක්", ta: "அரசுக்கு வழங்கும் குறுகிய காலக் கடன்" } },
            { id: "b", text: { en: "A share in a company", si: "සමාගමක කොටසක්", ta: "நிறுவனத்தின் பங்கு" } },
            { id: "c", text: { en: "An electricity bill", si: "විදුලි බිලක්", ta: "மின்சாரக் கட்டணம்" } },
          ],
          correctId: "a",
          explanation: { en: "T-bills are short-term government borrowing, with terms of 91, 182 or 364 days.", si: "භාණ්ඩාගාර බිල්පත් දින 91, 182 හෝ 364 කාලවල කෙටිකාලීන රාජ්‍ය ණය ගැනීම්ය.", ta: "திறைசேரி உண்டியல்கள் 91, 182 அல்லது 364 நாள் கால குறுகிய கால அரசுக் கடன்." },
        },
        {
          id: "q2",
          type: "mcq",
          prompt: { en: "Who regulates unit trusts in Sri Lanka?", si: "ශ්‍රී ලංකාවේ ඒකක භාර නියාමනය කරන්නේ කවුද?", ta: "இலங்கையில் அலகு நம்பிக்கைகளை ஒழுங்குபடுத்துவது யார்?" },
          options: [
            { id: "a", text: { en: "Securities and Exchange Commission (SEC)", si: "සුරැකුම්පත් සහ විනිමය කොමිෂන් සභාව (SEC)", ta: "பிணையங்கள் மற்றும் பரிவர்த்தனை ஆணைக்குழு (SEC)" } },
            { id: "b", text: { en: "Inland Revenue Department", si: "දේශීය ආදායම් දෙපාර්තමේන්තුව", ta: "உள்நாட்டு இறைவரித் திணைக்களம்" } },
            { id: "c", text: { en: "No one", si: "කිසිවෙකු නැහැ", ta: "யாரும் இல்லை" } },
          ],
          correctId: "a",
          explanation: { en: "The SEC regulates unit trusts and the capital market, including the CSE.", si: "SEC ඒකක භාර සහ CSE ඇතුළු ප්‍රාග්ධන වෙළඳපොළ නියාමනය කරයි.", ta: "SEC அலகு நம்பிக்கைகளையும் CSE உட்பட மூலதனச் சந்தையையும் ஒழுங்குபடுத்துகிறது." },
        },
        {
          id: "q3",
          type: "truefalse",
          prompt: { en: "Breaking a fixed deposit early usually means earning less interest.", si: "ස්ථාවර තැන්පතුවක් කලින් කඩා දැමීමෙන් සාමාන්‍යයෙන් අඩු පොලියක් ලැබේ.", ta: "நிலையான வைப்பை முன்கூட்டியே உடைத்தால் பொதுவாகக் குறைந்த வட்டி கிடைக்கும்." },
          options: TF,
          correctId: "t",
          explanation: { en: "Most FDs reduce the rate or charge a penalty for early withdrawal. Check the terms first.", si: "බොහෝ FD කලින් ආපසු ගැනීමට අනුපාතය අඩු කරයි හෝ දඩයක් අය කරයි. මුලින් කොන්දේසි පරීක්ෂා කරන්න.", ta: "பெரும்பாலான FD முன்கூட்டிய எடுப்புக்கு விகிதத்தைக் குறைக்கும் அல்லது அபராதம் விதிக்கும். முதலில் நிபந்தனைகளைப் பாருங்கள்." },
        },
      ],
      sources: [SOURCES.publicDebt, SOURCES.sec, SOURCES.cse, SOURCES.cbsl],
      lastReviewed: REVIEWED,
      nextReview: NEXT_REVIEW_TIME_SENSITIVE,
    },
  ],
};
