import { type Course, REVIEWED, NEXT_REVIEW, NEXT_REVIEW_TIME_SENSITIVE, SOURCES, TF, rs } from "../types.js";

export const level6: Course = {
  slug: "sri-lanka-financial-system",
  level: 6,
  icon: "🏛️",
  color: "#2C7A7B",
  title: { en: "Sri Lanka's Financial System", si: "ශ්‍රී ලංකාවේ මූල්‍ය පද්ධතිය", ta: "இலங்கையின் நிதி அமைப்பு" },
  description: {
    en: "Who does what: CBSL, SEC, CSE, IRD — and how EPF and ETF work for employees.",
    si: "කවුද මොනවා කරන්නේ: මහ බැංකුව, SEC, CSE, IRD — සහ සේවකයින් සඳහා EPF සහ ETF ක්‍රියා කරන ආකාරය.",
    ta: "யார் என்ன செய்கிறார்கள்: CBSL, SEC, CSE, IRD — ஊழியர்களுக்கு EPF, ETF எப்படி வேலை செய்கின்றன.",
  },
  lessons: [
    {
      slug: "epf-etf-basics",
      title: { en: "EPF and ETF explained", si: "EPF සහ ETF පැහැදිලි කිරීම", ta: "EPF மற்றும் ETF விளக்கம்" },
      summary: {
        en: "The retirement savings you build with every private-sector pay slip.",
        si: "සෑම පෞද්ගලික අංශ වැටුප් පත්‍රිකාවක් සමඟම ඔබ ගොඩනගන විශ්‍රාම ඉතිරිය.",
        ta: "ஒவ்வொரு தனியார் துறைச் சம்பளச் சீட்டுடனும் நீங்கள் உருவாக்கும் ஓய்வூதியச் சேமிப்பு.",
      },
      minutes: 4,
      xp: 25,
      tags: ["epf", "etf", "retirement", "employment"],
      timeSensitive: true,
      cards: [
        {
          type: "concept",
          title: { en: "EPF — Employees' Provident Fund", si: "EPF — සේවක අර්ථසාධක අරමුදල", ta: "EPF — ஊழியர் சேமலாப நிதி" },
          body: {
            en: "Each month, 8% of your gross earnings is deducted for EPF and your employer adds 12%, so 20% goes into your EPF account. It earns interest and is mainly paid out when you retire. The Central Bank manages the EPF; the Labour Department handles collection and enforcement.",
            si: "සෑම මසකම ඔබේ දළ ඉපැයීම්වලින් 8%ක් EPF සඳහා අඩු කරන අතර ඔබේ සේවායෝජකයා 12%ක් එකතු කරයි, එබැවින් 20%ක් ඔබේ EPF ගිණුමට යයි. එය පොලිය උපයන අතර ප්‍රධාන වශයෙන් විශ්‍රාම ගිය විට ගෙවයි. මහ බැංකුව EPF කළමනාකරණය කරයි; කම්කරු දෙපාර්තමේන්තුව එකතු කිරීම සහ බලාත්මක කිරීම හසුරුවයි.",
            ta: "ஒவ்வொரு மாதமும் உங்கள் மொத்த வருவாயில் 8% EPF க்காகக் கழிக்கப்படுகிறது, உங்கள் முதலாளி 12% சேர்க்கிறார்; எனவே 20% உங்கள் EPF கணக்குக்குச் செல்கிறது. அது வட்டி ஈட்டும், முக்கியமாக ஓய்வுபெறும்போது வழங்கப்படும். மத்திய வங்கி EPF ஐ நிர்வகிக்கிறது; தொழில் திணைக்களம் வசூலிப்பையும் அமலாக்கத்தையும் கையாள்கிறது.",
          },
        },
        {
          type: "concept",
          title: { en: "ETF — Employees' Trust Fund", si: "ETF — සේවක භාරකාර අරමුදල", ta: "ETF — ஊழியர் நம்பிக்கை நிதி" },
          body: {
            en: "Your employer pays an extra 3% of your earnings into the ETF. Nothing is deducted from your salary for ETF. It is managed by the Employees' Trust Fund Board.",
            si: "ඔබේ සේවායෝජකයා ඔබේ ඉපැයීම්වලින් අමතර 3%ක් ETF වෙත ගෙවයි. ETF සඳහා ඔබේ වැටුපෙන් කිසිවක් අඩු නොකෙරේ. එය සේවක භාරකාර අරමුදල් මණ්ඩලය විසින් කළමනාකරණය කරයි.",
            ta: "உங்கள் முதலாளி உங்கள் வருவாயில் கூடுதலாக 3% ETF க்குச் செலுத்துகிறார். ETF க்காக உங்கள் சம்பளத்திலிருந்து எதுவும் கழிக்கப்படுவதில்லை. அதை ஊழியர் நம்பிக்கை நிதிச் சபை நிர்வகிக்கிறது.",
          },
        },
        {
          type: "example",
          title: { en: "On a Rs. 100,000 salary", si: "රු. 100,000 වැටුපක් මත", ta: "ரூ. 100,000 சம்பளத்தில்" },
          body: {
            en: "You contribute Rs. 8,000 (EPF). Your employer adds Rs. 12,000 (EPF) + Rs. 3,000 (ETF). Total Rs. 23,000 a month goes towards your future.",
            si: "ඔබ රු. 8,000ක් (EPF) දායක කරනවා. ඔබේ සේවායෝජකයා රු. 12,000ක් (EPF) + රු. 3,000ක් (ETF) එකතු කරයි. මසකට මුළු රු. 23,000ක් ඔබේ අනාගතයට යයි.",
            ta: "நீங்கள் ரூ. 8,000 (EPF) செலுத்துகிறீர்கள். உங்கள் முதலாளி ரூ. 12,000 (EPF) + ரூ. 3,000 (ETF) சேர்க்கிறார். மாதம் மொத்தம் ரூ. 23,000 உங்கள் எதிர்காலத்துக்குச் செல்கிறது.",
          },
        },
        {
          type: "tip",
          title: { en: "Check your balance", si: "ඔබේ ශේෂය පරීක්ෂා කරන්න", ta: "உங்கள் நிலுவையைச் சரிபாருங்கள்" },
          body: {
            en: "Make sure your employer is actually paying in. You can check your EPF and ETF balances through the official EPF and ETF Board channels. Rates and rules can change — confirm with official sources.",
            si: "ඔබේ සේවායෝජකයා ඇත්තටම ගෙවන බව තහවුරු කර ගන්න. නිල EPF සහ ETF මණ්ඩල නාලිකා හරහා ඔබේ ශේෂ පරීක්ෂා කළ හැකියි. අනුපාත සහ නීති වෙනස් විය හැකියි — නිල මූලාශ්‍ර සමඟ තහවුරු කරන්න.",
            ta: "உங்கள் முதலாளி உண்மையில் செலுத்துகிறாரா என்று உறுதிசெய்யுங்கள். அதிகாரப்பூர்வ EPF, ETF சபை வழிகள் மூலம் நிலுவைகளைச் சரிபார்க்கலாம். விகிதங்களும் விதிகளும் மாறலாம் — அதிகாரப்பூர்வ மூலங்களுடன் உறுதிசெய்யுங்கள்.",
          },
        },
      ],
      quiz: [
        {
          id: "q1",
          type: "calculation",
          prompt: { en: "Salary Rs. 50,000. How much is deducted from the employee for EPF?", si: "වැටුප රු. 50,000. EPF සඳහා සේවකයාගෙන් අඩු කරන්නේ කීයද?", ta: "சம்பளம் ரூ. 50,000. EPF க்காக ஊழியரிடமிருந்து எவ்வளவு கழிக்கப்படும்?" },
          options: [{ id: "a", text: rs("4,000") }, { id: "b", text: rs("6,000") }, { id: "c", text: rs("1,500") }],
          correctId: "a",
          explanation: { en: "Employee EPF is 8%: Rs. 50,000 × 8% = Rs. 4,000. The employer adds 12% (Rs. 6,000) to EPF and 3% (Rs. 1,500) to ETF.", si: "සේවක EPF 8%යි: රු. 50,000 × 8% = රු. 4,000. සේවායෝජකයා EPF වෙත 12% (රු. 6,000) සහ ETF වෙත 3% (රු. 1,500) එකතු කරයි.", ta: "ஊழியர் EPF 8%: ரூ. 50,000 × 8% = ரூ. 4,000. முதலாளி EPF க்கு 12% (ரூ. 6,000), ETF க்கு 3% (ரூ. 1,500) சேர்க்கிறார்." },
        },
        {
          id: "q2",
          type: "truefalse",
          prompt: { en: "ETF contributions are deducted from the employee's salary.", si: "ETF දායකත්වය සේවකයාගේ වැටුපෙන් අඩු කෙරේ.", ta: "ETF பங்களிப்புகள் ஊழியரின் சம்பளத்திலிருந்து கழிக்கப்படும்." },
          options: TF,
          correctId: "f",
          explanation: { en: "ETF is paid only by the employer (3%).", si: "ETF ගෙවන්නේ සේවායෝජකයා පමණි (3%).", ta: "ETF முதலாளியால் மட்டுமே செலுத்தப்படும் (3%)." },
        },
        {
          id: "q3",
          type: "mcq",
          prompt: { en: "Who manages the EPF fund?", si: "EPF අරමුදල කළමනාකරණය කරන්නේ කවුද?", ta: "EPF நிதியை நிர்வகிப்பது யார்?" },
          options: [
            { id: "a", text: { en: "Central Bank of Sri Lanka", si: "ශ්‍රී ලංකා මහ බැංකුව", ta: "இலங்கை மத்திய வங்கி" } },
            { id: "b", text: { en: "Colombo Stock Exchange", si: "කොළඹ කොටස් හුවමාරුව", ta: "கொழும்புப் பங்குச் சந்தை" } },
            { id: "c", text: { en: "Your employer", si: "ඔබේ සේවායෝජකයා", ta: "உங்கள் முதலாளி" } },
          ],
          correctId: "a",
          explanation: { en: "The CBSL manages the EPF fund; your employer only deducts and pays contributions.", si: "මහ බැංකුව EPF අරමුදල කළමනාකරණය කරයි; ඔබේ සේවායෝජකයා දායක මුදල් අඩු කර ගෙවීම පමණක් කරයි.", ta: "மத்திய வங்கி EPF நிதியை நிர்வகிக்கிறது; முதலாளி பங்களிப்புகளைக் கழித்துச் செலுத்துவது மட்டுமே." },
        },
      ],
      sources: [SOURCES.epf, SOURCES.etf, SOURCES.cbsl],
      lastReviewed: REVIEWED,
      nextReview: NEXT_REVIEW_TIME_SENSITIVE,
    },
    {
      slug: "who-regulates-what",
      title: { en: "Who regulates what?", si: "කවුද කුමක් නියාමනය කරන්නේ?", ta: "யார் எதை ஒழுங்குபடுத்துகிறார்கள்?" },
      summary: {
        en: "Knowing the regulators helps you check whether a company is legitimate.",
        si: "නියාමකයින් දැන ගැනීම සමාගමක් නීත්‍යානුකූලදැයි පරීක්ෂා කිරීමට උදව් වේ.",
        ta: "ஒழுங்குபடுத்துநர்களை அறிவது ஒரு நிறுவனம் சட்டபூர்வமானதா என்று சரிபார்க்க உதவும்.",
      },
      minutes: 3,
      xp: 20,
      tags: ["system", "regulators", "protection"],
      protection: true,
      cards: [
        {
          type: "concept",
          title: { en: "Central Bank of Sri Lanka (CBSL)", si: "ශ්‍රී ලංකා මහ බැංකුව", ta: "இலங்கை மத்திய வங்கி" },
          body: {
            en: "Keeps prices stable, issues currency, and licenses and supervises banks, licensed finance companies and payment systems (like LANKAQR). It publishes lists of licensed institutions.",
            si: "මිල ස්ථාවරව තබයි, මුදල් නිකුත් කරයි, සහ බැංකු, බලපත්‍රලාභී මූල්‍ය සමාගම් සහ ගෙවීම් පද්ධති (LANKAQR වැනි) බලපත්‍ර දී අධීක්ෂණය කරයි. බලපත්‍රලාභී ආයතන ලැයිස්තු ප්‍රකාශයට පත් කරයි.",
            ta: "விலைகளை நிலையாக வைக்கிறது, நாணயம் வெளியிடுகிறது, வங்கிகள், உரிமம் பெற்ற நிதி நிறுவனங்கள், கட்டண அமைப்புகளுக்கு (LANKAQR போன்றவை) உரிமம் வழங்கி மேற்பார்வையிடுகிறது. உரிமம் பெற்ற நிறுவனங்களின் பட்டியலை வெளியிடுகிறது.",
          },
        },
        {
          type: "concept",
          title: { en: "SEC and CSE", si: "SEC සහ CSE", ta: "SEC மற்றும் CSE" },
          body: {
            en: "The Colombo Stock Exchange (CSE) is the marketplace where company shares are bought and sold. The Securities and Exchange Commission (SEC) regulates the CSE, stockbrokers and unit trusts to protect investors.",
            si: "කොළඹ කොටස් හුවමාරුව (CSE) යනු සමාගම් කොටස් මිලදී ගන්නා සහ විකුණන වෙළඳපොළයි. සුරැකුම්පත් සහ විනිමය කොමිෂන් සභාව (SEC) ආයෝජකයින් ආරක්ෂා කිරීමට CSE, කොටස් තැරැව්කරුවන් සහ ඒකක භාර නියාමනය කරයි.",
            ta: "கொழும்புப் பங்குச் சந்தை (CSE) நிறுவனப் பங்குகள் வாங்கி விற்கப்படும் சந்தை. பிணையங்கள் மற்றும் பரிவர்த்தனை ஆணைக்குழு (SEC) முதலீட்டாளர்களைப் பாதுகாக்க CSE, பங்குத் தரகர்கள், அலகு நம்பிக்கைகளை ஒழுங்குபடுத்துகிறது.",
          },
        },
        {
          type: "concept",
          title: { en: "IRD and insurance", si: "IRD සහ රක්ෂණ", ta: "IRD மற்றும் காப்பீடு" },
          body: {
            en: "The Inland Revenue Department (IRD) collects taxes such as income tax. Insurance companies are regulated by the Insurance Regulatory Commission of Sri Lanka.",
            si: "දේශීය ආදායම් දෙපාර්තමේන්තුව (IRD) ආදායම් බද්ද වැනි බදු එකතු කරයි. රක්ෂණ සමාගම් ශ්‍රී ලංකා රක්ෂණ නියාමන කොමිෂන් සභාව විසින් නියාමනය කරයි.",
            ta: "உள்நாட்டு இறைவரித் திணைக்களம் (IRD) வருமான வரி போன்ற வரிகளை வசூலிக்கிறது. காப்பீட்டு நிறுவனங்கள் இலங்கைக் காப்பீட்டு ஒழுங்குமுறை ஆணைக்குழுவால் ஒழுங்குபடுத்தப்படுகின்றன.",
          },
        },
        {
          type: "tip",
          title: { en: "Before handing over money", si: "මුදල් භාර දීමට පෙර", ta: "பணம் கொடுக்கும் முன்" },
          body: {
            en: "Look the company up on the regulator's own website — not a link the company gave you. If it isn't on the list, don't deposit or invest.",
            si: "සමාගම නියාමකයාගේම වෙබ් අඩවියේ සොයන්න — සමාගම දුන් සබැඳියක නොවේ. ලැයිස්තුවේ නැත්නම් තැන්පත් හෝ ආයෝජනය නොකරන්න.",
            ta: "நிறுவனத்தை ஒழுங்குபடுத்துநரின் சொந்த இணையதளத்தில் தேடுங்கள் — நிறுவனம் தந்த இணைப்பில் அல்ல. பட்டியலில் இல்லையென்றால் வைப்பு அல்லது முதலீடு செய்யாதீர்கள்.",
          },
        },
      ],
      quiz: [
        {
          id: "q1",
          type: "mcq",
          prompt: { en: "Who licenses finance companies that take deposits?", si: "තැන්පතු භාර ගන්නා මූල්‍ය සමාගම්වලට බලපත්‍ර දෙන්නේ කවුද?", ta: "வைப்புகளை ஏற்கும் நிதி நிறுவனங்களுக்கு உரிமம் வழங்குவது யார்?" },
          options: [
            { id: "a", text: { en: "Central Bank of Sri Lanka", si: "ශ්‍රී ලංකා මහ බැංකුව", ta: "இலங்கை மத்திய வங்கி" } },
            { id: "b", text: { en: "Colombo Stock Exchange", si: "කොළඹ කොටස් හුවමාරුව", ta: "கொழும்புப் பங்குச் சந்தை" } },
            { id: "c", text: { en: "Inland Revenue Department", si: "දේශීය ආදායම් දෙපාර්තමේන්තුව", ta: "உள்நாட்டு இறைவரித் திணைக்களம்" } },
          ],
          correctId: "a",
          explanation: { en: "The CBSL licenses and supervises banks and licensed finance companies.", si: "මහ බැංකුව බැංකු සහ බලපත්‍රලාභී මූල්‍ය සමාගම්වලට බලපත්‍ර දී අධීක්ෂණය කරයි.", ta: "மத்திய வங்கி வங்கிகளுக்கும் உரிமம் பெற்ற நிதி நிறுவனங்களுக்கும் உரிமம் வழங்கி மேற்பார்வையிடுகிறது." },
        },
        {
          id: "q2",
          type: "mcq",
          prompt: { en: "Where are company shares bought and sold?", si: "සමාගම් කොටස් මිලදී ගැනීම සහ විකිණීම සිදු වන්නේ කොහේද?", ta: "நிறுவனப் பங்குகள் எங்கே வாங்கி விற்கப்படுகின்றன?" },
          options: [
            { id: "a", text: { en: "Colombo Stock Exchange (CSE)", si: "කොළඹ කොටස් හුවමාරුව (CSE)", ta: "கொழும்புப் பங்குச் சந்தை (CSE)" } },
            { id: "b", text: { en: "Inland Revenue Department", si: "දේශීය ආදායම් දෙපාර්තමේන්තුව", ta: "உள்நாட்டு இறைவரித் திணைக்களம்" } },
          ],
          correctId: "a",
          explanation: { en: "The CSE is the stock market, regulated by the SEC.", si: "CSE කොටස් වෙළඳපොළයි, SEC විසින් නියාමනය කරයි.", ta: "CSE பங்குச் சந்தை, SEC ஆல் ஒழுங்குபடுத்தப்படுகிறது." },
        },
        {
          id: "q3",
          type: "truefalse",
          prompt: { en: "It's safest to check a company's licence on the regulator's own website.", si: "සමාගමක බලපත්‍රය නියාමකයාගේම වෙබ් අඩවියේ පරීක්ෂා කිරීම ආරක්ෂිතම වේ.", ta: "நிறுவனத்தின் உரிமத்தை ஒழுங்குபடுத்துநரின் சொந்த இணையதளத்தில் சரிபார்ப்பது பாதுகாப்பானது." },
          options: TF,
          correctId: "t",
          explanation: { en: "Scammers can fake certificates and websites. The regulator's list is the reliable source.", si: "වංචාකරුවන්ට සහතික සහ වෙබ් අඩවි ව්‍යාජව සෑදිය හැකියි. නියාමකයාගේ ලැයිස්තුව විශ්වාසදායක මූලාශ්‍රයයි.", ta: "மோசடிக்காரர்கள் சான்றிதழ்களையும் இணையதளங்களையும் போலியாக்கலாம். ஒழுங்குபடுத்துநரின் பட்டியலே நம்பகமான மூலம்." },
        },
      ],
      sources: [SOURCES.cbsl, SOURCES.sec, SOURCES.cse, SOURCES.ird],
      lastReviewed: REVIEWED,
      nextReview: NEXT_REVIEW,
    },
  ],
};

export const level7: Course = {
  slug: "tax-basics",
  level: 7,
  icon: "🧾",
  color: "#975A16",
  title: { en: "Tax Basics", si: "බදු මූලික කරුණු", ta: "வரி அடிப்படைகள்" },
  description: {
    en: "The main tax concepts in Sri Lanka, explained simply. Not tax advice — check the IRD for current rates.",
    si: "ශ්‍රී ලංකාවේ ප්‍රධාන බදු සංකල්ප, සරලව. බදු උපදෙස් නොවේ — වත්මන් අනුපාත සඳහා IRD පරීක්ෂා කරන්න.",
    ta: "இலங்கையின் முக்கிய வரிக் கருத்துகள், எளிமையாக. வரி ஆலோசனை அல்ல — தற்போதைய விகிதங்களுக்கு IRD ஐப் பாருங்கள்.",
  },
  lessons: [
    {
      slug: "tax-concepts",
      title: { en: "Income tax, APIT and VAT — the concepts", si: "ආදායම් බද්ද, APIT සහ VAT — සංකල්ප", ta: "வருமான வரி, APIT, VAT — கருத்துகள்" },
      summary: {
        en: "What these taxes are and how they reach your pay slip and shopping bill.",
        si: "මෙම බදු මොනවාද සහ ඒවා ඔබේ වැටුප් පත්‍රිකාවට සහ සාප්පු බිලට එන ආකාරය.",
        ta: "இந்த வரிகள் என்ன, உங்கள் சம்பளச் சீட்டையும் கடைக் கட்டணத்தையும் எப்படி அடைகின்றன.",
      },
      minutes: 4,
      xp: 25,
      tags: ["tax"],
      timeSensitive: true,
      cards: [
        {
          type: "concept",
          title: { en: "Income tax", si: "ආදායම් බද්ද", ta: "வருமான வரி" },
          body: {
            en: "Income tax is charged on income above a tax-free threshold, at rates that rise in steps (slabs) as income increases. The thresholds and rates are set by law and change from time to time.",
            si: "ආදායම් බද්ද බදු රහිත සීමාවකට වඩා වැඩි ආදායමට, ආදායම වැඩි වන විට පියවරෙන් පියවර (පරාස) ඉහළ යන අනුපාතවලින් අය කෙරේ. සීමා සහ අනුපාත නීතියෙන් නියම කරන අතර කලින් කලට වෙනස් වේ.",
            ta: "வருமான வரி, வரியில்லா வரம்புக்கு மேலான வருமானத்துக்கு, வருமானம் அதிகரிக்கும்போது படிப்படியாக (படிநிலைகள்) உயரும் விகிதங்களில் விதிக்கப்படுகிறது. வரம்புகளும் விகிதங்களும் சட்டத்தால் நிர்ணயிக்கப்பட்டு அவ்வப்போது மாறும்.",
          },
        },
        {
          type: "concept",
          title: { en: "APIT on your salary", si: "ඔබේ වැටුප මත APIT", ta: "உங்கள் சம்பளத்தில் APIT" },
          body: {
            en: "If you're employed and your pay is above the threshold, your employer deducts Advance Personal Income Tax (APIT) each month and pays it to the Inland Revenue Department on your behalf.",
            si: "ඔබ රැකියාවක නියුතු නම් සහ වැටුප සීමාවට වඩා වැඩි නම්, ඔබේ සේවායෝජකයා සෑම මසකම අත්තිකාරම් පුද්ගල ආදායම් බද්ද (APIT) අඩු කර ඔබ වෙනුවෙන් දේශීය ආදායම් දෙපාර්තමේන්තුවට ගෙවයි.",
            ta: "நீங்கள் வேலை செய்து உங்கள் சம்பளம் வரம்புக்கு மேல் இருந்தால், உங்கள் முதலாளி ஒவ்வொரு மாதமும் முன்கூட்டிய தனிநபர் வருமான வரியை (APIT) கழித்து உங்கள் சார்பில் உள்நாட்டு இறைவரித் திணைக்களத்துக்குச் செலுத்துகிறார்.",
          },
        },
        {
          type: "concept",
          title: { en: "VAT when you shop", si: "සාප්පු යන විට VAT", ta: "கடையில் VAT" },
          body: {
            en: "Value Added Tax (VAT) is included in the price of many goods and services. You pay it indirectly when you buy; registered businesses collect it and pay it to the IRD.",
            si: "වැට් බද්ද (VAT) බොහෝ භාණ්ඩ සහ සේවාවල මිලට ඇතුළත් වේ. මිලදී ගන්නා විට ඔබ එය වක්‍රව ගෙවනවා; ලියාපදිංචි ව්‍යාපාර එය එකතු කර IRD වෙත ගෙවයි.",
            ta: "மதிப்புக் கூட்டு வரி (VAT) பல பொருட்கள், சேவைகளின் விலையில் சேர்க்கப்பட்டுள்ளது. வாங்கும்போது மறைமுகமாகச் செலுத்துகிறீர்கள்; பதிவுசெய்த வணிகங்கள் அதை வசூலித்து IRD க்குச் செலுத்துகின்றன.",
          },
        },
        {
          type: "warning",
          title: { en: "Check current rules", si: "වත්මන් නීති පරීක්ෂා කරන්න", ta: "தற்போதைய விதிகளைச் சரிபாருங்கள்" },
          body: {
            en: "Tax rates, thresholds and filing rules change with budgets and new laws. සකසුරු explains concepts only. For your situation, use the IRD website or talk to a qualified tax professional.",
            si: "බදු අනුපාත, සීමා සහ ගොනු කිරීමේ නීති අයවැය සහ නව නීති සමඟ වෙනස් වේ. සකසුරු සංකල්ප පමණක් පැහැදිලි කරයි. ඔබේ තත්ත්වය සඳහා IRD වෙබ් අඩවිය භාවිත කරන්න හෝ සුදුසුකම් ලත් බදු වෘත්තිකයෙකු සමඟ කතා කරන්න.",
            ta: "வரி விகிதங்கள், வரம்புகள், தாக்கல் விதிகள் வரவுசெலவுத் திட்டங்கள், புதிய சட்டங்களுடன் மாறும். සකසුරු கருத்துகளை மட்டுமே விளக்குகிறது. உங்கள் நிலைக்கு IRD இணையதளத்தைப் பயன்படுத்துங்கள் அல்லது தகுதியான வரி நிபுணரிடம் பேசுங்கள்.",
          },
        },
      ],
      quiz: [
        {
          id: "q1",
          type: "mcq",
          prompt: { en: "Who usually deducts APIT from an employee's salary?", si: "සේවකයෙකුගේ වැටුපෙන් සාමාන්‍යයෙන් APIT අඩු කරන්නේ කවුද?", ta: "ஊழியரின் சம்பளத்திலிருந்து பொதுவாக APIT ஐக் கழிப்பது யார்?" },
          options: [
            { id: "a", text: { en: "The employer", si: "සේවායෝජකයා", ta: "முதலாளி" } },
            { id: "b", text: { en: "The employee's bank", si: "සේවකයාගේ බැංකුව", ta: "ஊழியரின் வங்கி" } },
            { id: "c", text: { en: "The Stock Exchange", si: "කොටස් හුවමාරුව", ta: "பங்குச் சந்தை" } },
          ],
          correctId: "a",
          explanation: { en: "Employers deduct APIT and pay it to the IRD.", si: "සේවායෝජකයින් APIT අඩු කර IRD වෙත ගෙවයි.", ta: "முதலாளிகள் APIT ஐக் கழித்து IRD க்குச் செலுத்துகிறார்கள்." },
        },
        {
          id: "q2",
          type: "truefalse",
          prompt: { en: "Tax rates and thresholds in Sri Lanka never change.", si: "ශ්‍රී ලංකාවේ බදු අනුපාත සහ සීමා කිසිවිටෙක වෙනස් නොවේ.", ta: "இலங்கையில் வரி விகிதங்களும் வரம்புகளும் ஒருபோதும் மாறாது." },
          options: TF,
          correctId: "f",
          explanation: { en: "They change through budgets and amendments, so always check the IRD for the latest.", si: "අයවැය සහ සංශෝධන හරහා ඒවා වෙනස් වේ, එබැවින් නවතම තොරතුරු සඳහා සැමවිටම IRD පරීක්ෂා කරන්න.", ta: "வரவுசெலவுத் திட்டங்கள், திருத்தங்கள் மூலம் அவை மாறும்; எனவே சமீபத்தியவற்றுக்கு எப்போதும் IRD ஐப் பாருங்கள்." },
        },
        {
          id: "q3",
          type: "mcq",
          prompt: { en: "VAT is mainly…", si: "VAT ප්‍රධාන වශයෙන්…", ta: "VAT முக்கியமாக…" },
          options: [
            { id: "a", text: { en: "A tax included in the price of goods and services", si: "භාණ්ඩ සහ සේවාවල මිලට ඇතුළත් බද්දකි", ta: "பொருட்கள், சேவைகளின் விலையில் சேர்க்கப்பட்ட வரி" } },
            { id: "b", text: { en: "A tax only on salaries", si: "වැටුප් මත පමණක් බද්දකි", ta: "சம்பளத்தில் மட்டும் வரி" } },
          ],
          correctId: "a",
          explanation: { en: "VAT is collected by registered businesses through prices.", si: "VAT ලියාපදිංචි ව්‍යාපාර මිල හරහා එකතු කරයි.", ta: "VAT பதிவுசெய்த வணிகங்களால் விலைகள் மூலம் வசூலிக்கப்படுகிறது." },
        },
      ],
      sources: [SOURCES.ird],
      lastReviewed: REVIEWED,
      nextReview: NEXT_REVIEW_TIME_SENSITIVE,
    },
  ],
};

export const level8: Course = {
  slug: "entrepreneurship",
  level: 8,
  icon: "🏪",
  color: "#805AD5",
  title: { en: "Entrepreneurship", si: "ව්‍යවසායකත්වය", ta: "தொழில்முனைவு" },
  description: {
    en: "Revenue, profit and cash flow for small businesses — from a kade to a home bakery.",
    si: "කුඩා ව්‍යාපාර සඳහා ආදායම, ලාභය සහ මුදල් ප්‍රවාහය — කඩයක සිට ගෘහ බේකරියක් දක්වා.",
    ta: "சிறு வணிகங்களுக்கான வருவாய், லாபம், பணப்புழக்கம் — கடை முதல் வீட்டு பேக்கரி வரை.",
  },
  lessons: [
    {
      slug: "revenue-profit-cashflow",
      title: { en: "Revenue, profit and cash flow", si: "ආදායම, ලාභය සහ මුදල් ප්‍රවාහය", ta: "வருவாய், லாபம், பணப்புழக்கம்" },
      summary: {
        en: "Why a busy shop can still run out of money.",
        si: "කාර්යබහුල වෙළඳසැලකට වුවද මුදල් අවසන් විය හැක්කේ ඇයි.",
        ta: "பரபரப்பான கடைக்கும் பணம் தீர்ந்துபோவது ஏன்.",
      },
      minutes: 5,
      xp: 30,
      tags: ["business", "cashflow"],
      cards: [
        {
          type: "story",
          title: { en: "Sumana's home bakery", si: "සුමනාගේ ගෘහ බේකරිය", ta: "சுமனாவின் வீட்டு பேக்கரி" },
          body: {
            en: "Sumana in Galle sells cakes for Rs. 300,000 this month. Ingredients, gas and packaging cost Rs. 210,000. A hotel owes her Rs. 80,000 and will pay next month. She can't pay her flour supplier today.",
            si: "ගාල්ලේ සුමනා මේ මාසයේ රු. 300,000ක කේක් විකුණනවා. අමුද්‍රව්‍ය, ගෑස් සහ ඇසුරුම්වලට රු. 210,000ක් වැය වෙනවා. හෝටලයක් ඇයට රු. 80,000ක් ණය වන අතර ලබන මාසයේ ගෙවනවා. ඇයට අද පිටි සැපයුම්කරුට ගෙවිය නොහැකියි.",
            ta: "காலியில் சுமனா இந்த மாதம் ரூ. 300,000க்குக் கேக் விற்கிறார். பொருட்கள், எரிவாயு, பொதியிடல் ரூ. 210,000. ஒரு ஹோட்டல் அவருக்கு ரூ. 80,000 கடன்பட்டுள்ளது, அடுத்த மாதம் செலுத்தும். இன்று அவரால் மாவு வழங்குநருக்குச் செலுத்த முடியவில்லை.",
          },
        },
        {
          type: "concept",
          title: { en: "Three different numbers", si: "වෙනස් සංඛ්‍යා තුනක්", ta: "மூன்று வெவ்வேறு எண்கள்" },
          body: {
            en: "Revenue = total sales (Rs. 300,000). Profit = revenue − costs (Rs. 90,000). Cash flow = money actually coming in and going out. Sumana is profitable, but Rs. 80,000 of her sales hasn't arrived as cash yet.",
            si: "ආදායම = මුළු විකුණුම් (රු. 300,000). ලාභය = ආදායම − වියදම් (රු. 90,000). මුදල් ප්‍රවාහය = සැබවින්ම ලැබෙන සහ යන මුදල්. සුමනා ලාභ ලබනවා, නමුත් ඇගේ විකුණුම්වලින් රු. 80,000ක් තවම මුදල් ලෙස ලැබී නැහැ.",
            ta: "வருவாய் = மொத்த விற்பனை (ரூ. 300,000). லாபம் = வருவாய் − செலவுகள் (ரூ. 90,000). பணப்புழக்கம் = உண்மையில் வரும், போகும் பணம். சுமனா லாபம் ஈட்டுகிறார், ஆனால் அவரது விற்பனையில் ரூ. 80,000 இன்னும் பணமாக வரவில்லை.",
          },
        },
        {
          type: "tip",
          title: { en: "Protect your cash flow", si: "ඔබේ මුදල් ප්‍රවාහය ආරක්ෂා කරන්න", ta: "உங்கள் பணப்புழக்கத்தைப் பாதுகாக்கவும்" },
          body: {
            en: "Keep business and personal money in separate accounts. Record every sale and expense. Agree clear payment dates with customers, and keep a cash reserve for at least one month of costs.",
            si: "ව්‍යාපාරික සහ පෞද්ගලික මුදල් වෙනම ගිණුම්වල තබන්න. සෑම විකුණුමක්ම සහ වියදමක්ම සටහන් කරන්න. පාරිභෝගිකයින් සමඟ පැහැදිලි ගෙවීම් දින එකඟ වන්න, සහ අවම වශයෙන් මාසයක වියදම් සඳහා මුදල් සංචිතයක් තබා ගන්න.",
            ta: "வணிக, தனிப்பட்ட பணத்தைத் தனிக் கணக்குகளில் வையுங்கள். ஒவ்வொரு விற்பனையையும் செலவையும் பதிவு செய்யுங்கள். வாடிக்கையாளர்களுடன் தெளிவான கட்டணத் தேதிகளை ஒப்புக்கொள்ளுங்கள், குறைந்தது ஒரு மாதச் செலவுக்கான பண இருப்பை வையுங்கள்.",
          },
        },
        {
          type: "tip",
          title: { en: "Pay yourself a salary", si: "ඔබටම වැටුපක් ගෙවන්න", ta: "உங்களுக்கே சம்பளம் கொடுங்கள்" },
          body: {
            en: "Instead of taking money from the till whenever you need it, pay yourself a fixed amount each month. It shows whether the business can really support you.",
            si: "අවශ්‍ය වූ විට මුදල් ලාච්චුවෙන් ගැනීම වෙනුවට, සෑම මසකම ඔබටම ස්ථාවර මුදලක් ගෙවන්න. ව්‍යාපාරයට ඔබව සැබවින්ම නඩත්තු කළ හැකිදැයි එයින් පෙන්වයි.",
            ta: "தேவைப்படும்போதெல்லாம் பணப்பெட்டியிலிருந்து எடுப்பதற்குப் பதிலாக, மாதந்தோறும் உங்களுக்கே நிலையான தொகையைக் கொடுங்கள். வணிகம் உங்களை உண்மையில் தாங்குமா என்பதை அது காட்டும்.",
          },
        },
      ],
      quiz: [
        {
          id: "q1",
          type: "calculation",
          prompt: { en: "Sales Rs. 120,000, costs Rs. 85,000. What is the profit?", si: "විකුණුම් රු. 120,000, වියදම් රු. 85,000. ලාභය කීයද?", ta: "விற்பனை ரூ. 120,000, செலவுகள் ரூ. 85,000. லாபம் எவ்வளவு?" },
          options: [{ id: "a", text: rs("35,000") }, { id: "b", text: rs("120,000") }, { id: "c", text: rs("205,000") }],
          correctId: "a",
          explanation: { en: "Profit = revenue − costs = 120,000 − 85,000 = Rs. 35,000.", si: "ලාභය = ආදායම − වියදම් = 120,000 − 85,000 = රු. 35,000.", ta: "லாபம் = வருவாய் − செலவுகள் = 120,000 − 85,000 = ரூ. 35,000." },
        },
        {
          id: "q2",
          type: "truefalse",
          prompt: { en: "A profitable business can still run short of cash.", si: "ලාභ ලබන ව්‍යාපාරයකට වුවද මුදල් හිඟ විය හැකියි.", ta: "லாபம் ஈட்டும் வணிகத்துக்கும் பணப் பற்றாக்குறை வரலாம்." },
          options: TF,
          correctId: "t",
          explanation: { en: "If customers pay late or stock is bought upfront, cash can run out even when the business is profitable on paper.", si: "පාරිභෝගිකයින් ප්‍රමාද වී ගෙවුවහොත් හෝ තොග කලින් මිලදී ගත්තොත්, කඩදාසි මත ලාභ ලැබුවත් මුදල් අවසන් විය හැකියි.", ta: "வாடிக்கையாளர்கள் தாமதமாகச் செலுத்தினால் அல்லது சரக்கு முன்கூட்டியே வாங்கப்பட்டால், காகிதத்தில் லாபம் இருந்தாலும் பணம் தீர்ந்துபோகலாம்." },
        },
        {
          id: "q3",
          type: "mcq",
          prompt: { en: "Which habit helps most with business cash flow?", si: "ව්‍යාපාරික මුදල් ප්‍රවාහයට වඩාත්ම උපකාරී පුරුද්ද කුමක්ද?", ta: "வணிகப் பணப்புழக்கத்துக்கு மிகவும் உதவும் பழக்கம் எது?" },
          options: [
            { id: "a", text: { en: "Mixing home and shop money in one wallet", si: "නිවසේ සහ කඩේ මුදල් එක පසුම්බියක මිශ්‍ර කිරීම", ta: "வீட்டு, கடைப் பணத்தை ஒரே பணப்பையில் கலப்பது" } },
            { id: "b", text: { en: "Separate accounts and recording every transaction", si: "වෙනම ගිණුම් සහ සෑම ගනුදෙනුවක්ම සටහන් කිරීම", ta: "தனிக் கணக்குகள், ஒவ்வொரு பரிவர்த்தனையையும் பதிவு செய்வது" } },
          ],
          correctId: "b",
          explanation: { en: "Separate accounts and good records show you exactly where cash stands.", si: "වෙනම ගිණුම් සහ හොඳ වාර්තා මුදල් තත්ත්වය හරියටම පෙන්වයි.", ta: "தனிக் கணக்குகளும் நல்ல பதிவுகளும் பண நிலையைத் துல்லியமாகக் காட்டும்." },
        },
      ],
      sources: [SOURCES.sakasuru],
      lastReviewed: REVIEWED,
      nextReview: NEXT_REVIEW,
    },
  ],
};
