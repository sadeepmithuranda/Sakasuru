import { type Course, REVIEWED, NEXT_REVIEW, NEXT_REVIEW_TIME_SENSITIVE, SOURCES } from "../types.js";

export const level1: Course = {
  slug: "money-basics",
  level: 1,
  icon: "🌱",
  color: "#2F855A",
  title: { en: "Money Basics", si: "මුදල් මූලික කරුණු", ta: "பணத்தின் அடிப்படைகள்" },
  description: {
    en: "Saving, spending, budgeting and inflation — the foundations, with everyday Sri Lankan examples.",
    si: "ඉතිරි කිරීම, වියදම් කිරීම, අයවැය සහ උද්ධමනය — දෛනික ශ්‍රී ලාංකේය උදාහරණ සමඟ.",
    ta: "சேமிப்பு, செலவு, வரவுசெலவுத் திட்டம், பணவீக்கம் — அன்றாட இலங்கை உதாரணங்களுடன்.",
  },
  lessons: [
    {
      slug: "why-save",
      title: { en: "Why should you save money?", si: "මුදල් ඉතිරි කළ යුත්තේ ඇයි?", ta: "ஏன் பணத்தைச் சேமிக்க வேண்டும்?" },
      summary: {
        en: "Amaya's laptop breaks. What happens when there is nothing saved?",
        si: "අමායාගේ ලැප්ටොප් එක කැඩෙනවා. ඉතිරියක් නැති විට කුමක් වේද?",
        ta: "அமாயாவின் மடிக்கணினி பழுதாகிறது. சேமிப்பு இல்லாவிட்டால் என்ன நடக்கும்?",
      },
      minutes: 3,
      xp: 20,
      tags: ["saving", "emergency"],
      cards: [
        {
          type: "story",
          title: { en: "Meet Amaya", si: "අමායා හඳුනා ගනිමු", ta: "அமாயாவைச் சந்திப்போம்" },
          body: {
            en: "Amaya works in Kandy and earns Rs. 70,000 a month. Every month she spends almost everything she earns — rent, food, bus fare, a few nice dinners.",
            si: "අමායා මහනුවර රැකියාවක් කරන අතර මසකට රු. 70,000ක් උපයනවා. සෑම මාසයකම ඇය උපයන සියල්ලම පාහේ වියදම් කරනවා — කුලිය, ආහාර, බස් ගාස්තු, ඉඳහිට රාත්‍රී ආහාරයක්.",
            ta: "அமாயா கண்டியில் வேலை செய்கிறார், மாதம் ரூ. 70,000 சம்பாதிக்கிறார். ஒவ்வொரு மாதமும் வாடகை, உணவு, பேருந்துக் கட்டணம், சில இரவு உணவுகள் என சம்பாதிப்பதை அனைத்தையும் செலவழிக்கிறார்.",
          },
        },
        {
          type: "story",
          title: { en: "Then something breaks", si: "ඉන්පසු යමක් කැඩෙනවා", ta: "பிறகு ஏதோ பழுதாகிறது" },
          body: {
            en: "One morning her laptop stops working. She needs it for work. The repair costs Rs. 45,000 — and she has Rs. 3,000 in her account.",
            si: "එක් උදෑසනක ඇගේ ලැප්ටොප් එක ක්‍රියා විරහිත වෙනවා. රැකියාවට එය අත්‍යවශ්‍යයි. අලුත්වැඩියාවට රු. 45,000ක් වැය වෙනවා — ඇගේ ගිණුමේ ඇත්තේ රු. 3,000යි.",
            ta: "ஒரு காலை அவரது மடிக்கணினி வேலை செய்யவில்லை. வேலைக்கு அது அவசியம். பழுதுபார்க்க ரூ. 45,000 ஆகும் — அவரது கணக்கில் ரூ. 3,000 மட்டுமே உள்ளது.",
          },
        },
        {
          type: "question",
          body: { en: "What problem is Amaya facing?", si: "අමායා මුහුණ දෙන ගැටලුව කුමක්ද?", ta: "அமாயா எதிர்கொள்ளும் பிரச்சினை என்ன?" },
          options: [
            { text: { en: "She earns too little", si: "ඇය උපයන්නේ ඉතා අඩුවෙන්", ta: "அவர் மிகக் குறைவாகச் சம்பாதிக்கிறார்" }, correct: false },
            { text: { en: "She has no money set aside for surprises", si: "අනපේක්ෂිත දේට වෙන් කළ මුදලක් ඇය සතුව නැහැ", ta: "எதிர்பாராதவற்றுக்கு ஒதுக்கிய பணம் இல்லை" }, correct: true },
            { text: { en: "Laptops are too expensive", si: "ලැප්ටොප් ඉතා මිල අධිකයි", ta: "மடிக்கணினிகள் மிக விலை உயர்ந்தவை" }, correct: false },
          ],
          explanation: {
            en: "Rs. 70,000 is a reasonable income. The real gap is that nothing was set aside, so a normal surprise becomes a crisis — she may now borrow at high interest.",
            si: "රු. 70,000 සාධාරණ ආදායමක්. සැබෑ ගැටලුව කිසිවක් වෙන් කර නොතිබීමයි. එවිට සාමාන්‍ය අනපේක්ෂිත වියදමක් අර්බුදයක් වෙනවා — ඇයට දැන් ඉහළ පොලියට ණය ගැනීමට සිදු විය හැකියි.",
            ta: "ரூ. 70,000 நியாயமான வருமானம். உண்மையான இடைவெளி எதுவும் ஒதுக்கப்படாததுதான்; அதனால் ஒரு சாதாரண எதிர்பாராத செலவு நெருக்கடியாகிறது — இப்போது அதிக வட்டிக்குக் கடன் வாங்க வேண்டியிருக்கலாம்.",
          },
        },
        {
          type: "concept",
          title: { en: "Saving = paying your future self", si: "ඉතිරි කිරීම = අනාගත ඔබට ගෙවීම", ta: "சேமிப்பு = எதிர்கால உங்களுக்குச் செலுத்துவது" },
          body: {
            en: "Saving means keeping part of today's income for later. It protects you from surprises (an emergency fund) and helps you reach goals (a laptop, a course, a home) without debt.",
            si: "ඉතිරි කිරීම යනු අද ආදායමෙන් කොටසක් පසුවට තබා ගැනීමයි. එය අනපේක්ෂිත දේවලින් ඔබව ආරක්ෂා කරනවා (හදිසි අරමුදල) සහ ණය නොගෙන ඉලක්ක කරා යාමට උදව් කරනවා.",
            ta: "சேமிப்பு என்பது இன்றைய வருமானத்தில் ஒரு பகுதியைப் பின்னர் வைத்திருப்பது. அது எதிர்பாராதவற்றிலிருந்து (அவசர நிதி) பாதுகாக்கிறது, கடனின்றி இலக்குகளை அடைய உதவுகிறது.",
          },
        },
        {
          type: "tip",
          title: { en: "Start small, start today", si: "කුඩාවෙන් අද පටන් ගන්න", ta: "சிறிதாக, இன்றே தொடங்குங்கள்" },
          body: {
            en: "If Amaya had saved Rs. 4,000 every month, she would have Rs. 48,000 after a year — enough for the repair. Pay yourself first: move savings on salary day, before spending.",
            si: "අමායා මසකට රු. 4,000ක් ඉතිරි කළා නම්, වසරකින් රු. 48,000ක් තිබෙනවා — අලුත්වැඩියාවට ප්‍රමාණවත්. පඩි දිනයේදීම, වියදම් කිරීමට පෙර ඉතිරිය වෙන් කරන්න.",
            ta: "அமாயா மாதம் ரூ. 4,000 சேமித்திருந்தால், ஒரு வருடத்தில் ரூ. 48,000 இருந்திருக்கும் — பழுதுபார்க்கப் போதுமானது. சம்பள நாளிலேயே, செலவழிக்கும் முன் சேமிப்பை ஒதுக்குங்கள்.",
          },
        },
      ],
      quiz: [
        {
          id: "q1",
          type: "mcq",
          prompt: { en: "What is the main purpose of an emergency fund?", si: "හදිසි අරමුදලක ප්‍රධාන අරමුණ කුමක්ද?", ta: "அவசர நிதியின் முக்கிய நோக்கம் என்ன?" },
          options: [
            { id: "a", text: { en: "To buy things on sale", si: "වට්ටම් ඇති විට බඩු මිලදී ගැනීමට", ta: "தள்ளுபடியில் பொருட்கள் வாங்க" } },
            { id: "b", text: { en: "To cover unexpected costs without borrowing", si: "ණය නොගෙන අනපේක්ෂිත වියදම් පියවීමට", ta: "கடன் வாங்காமல் எதிர்பாராத செலவுகளைச் சமாளிக்க" } },
            { id: "c", text: { en: "To invest in shares", si: "කොටස්වල ආයෝජනයට", ta: "பங்குகளில் முதலீடு செய்ய" } },
          ],
          correctId: "b",
          explanation: {
            en: "An emergency fund is money kept aside for surprises like medical bills or repairs, so you don't need high-interest loans.",
            si: "හදිසි අරමුදල වෛද්‍ය බිල්පත් හෝ අලුත්වැඩියා වැනි අනපේක්ෂිත දේට වෙන් කළ මුදලයි, එවිට ඉහළ පොලී ණය අවශ්‍ය නොවේ.",
            ta: "அவசர நிதி என்பது மருத்துவக் கட்டணம், பழுதுபார்ப்பு போன்ற எதிர்பாராதவற்றுக்கு ஒதுக்கிய பணம்; அதனால் அதிக வட்டிக் கடன் தேவையில்லை.",
          },
        },
        {
          id: "q2",
          type: "calculation",
          prompt: { en: "Saving Rs. 2,500 every month, how much will you have after 12 months (no interest)?", si: "මසකට රු. 2,500 බැගින් ඉතිරි කළොත් මාස 12කින් කීයක් තිබේද (පොලිය නැතිව)?", ta: "மாதம் ரூ. 2,500 சேமித்தால், 12 மாதங்களில் எவ்வளவு இருக்கும் (வட்டி இல்லாமல்)?" },
          options: [
            { id: "a", text: { en: "Rs. 25,000", si: "රු. 25,000", ta: "ரூ. 25,000" } },
            { id: "b", text: { en: "Rs. 30,000", si: "රු. 30,000", ta: "ரூ. 30,000" } },
            { id: "c", text: { en: "Rs. 36,000", si: "රු. 36,000", ta: "ரூ. 36,000" } },
          ],
          correctId: "b",
          explanation: { en: "Rs. 2,500 × 12 = Rs. 30,000.", si: "රු. 2,500 × 12 = රු. 30,000.", ta: "ரூ. 2,500 × 12 = ரூ. 30,000." },
        },
        {
          id: "q3",
          type: "truefalse",
          prompt: { en: "\"Pay yourself first\" means saving before you spend.", si: "\"මුලින්ම ඔබටම ගෙවන්න\" යනු වියදමට පෙර ඉතිරි කිරීමයි.", ta: "\"முதலில் உங்களுக்கே செலுத்துங்கள்\" என்றால் செலவழிக்கும் முன் சேமிப்பது." },
          options: [
            { id: "t", text: { en: "True", si: "සත්‍යයි", ta: "சரி" } },
            { id: "f", text: { en: "False", si: "අසත්‍යයි", ta: "தவறு" } },
          ],
          correctId: "t",
          explanation: {
            en: "Moving savings away on payday makes saving automatic, instead of saving whatever happens to be left.",
            si: "පඩි දිනයේ ඉතිරිය වෙන් කිරීමෙන් ඉතිරි කිරීම ස්වයංක්‍රීය වෙනවා; ඉතිරි වන දෙයක් පමණක් තබා ගැනීම වෙනුවට.",
            ta: "சம்பள நாளில் சேமிப்பை ஒதுக்குவது, மீதமிருப்பதைச் சேமிப்பதற்குப் பதிலாக சேமிப்பைத் தானியங்கியாக்குகிறது.",
          },
        },
      ],
      sources: [SOURCES.cbslFinLit, SOURCES.sakasuru],
      lastReviewed: REVIEWED,
      nextReview: NEXT_REVIEW,
    },
    {
      slug: "income-vs-expenses",
      title: { en: "Income vs expenses", si: "ආදායම සහ වියදම", ta: "வருமானமும் செலவும்" },
      summary: {
        en: "Work out what's left of Nimal's Rs. 80,000 salary.",
        si: "නිමල්ගේ රු. 80,000 වැටුපෙන් ඉතිරි වන්නේ කීයද කියා ගණනය කරමු.",
        ta: "நிமலின் ரூ. 80,000 சம்பளத்தில் எவ்வளவு மீதமிருக்கிறது என்று கணக்கிடுவோம்.",
      },
      minutes: 4,
      xp: 20,
      tags: ["budgeting", "basics"],
      cards: [
        {
          type: "concept",
          title: { en: "Two simple words", si: "සරල වචන දෙකක්", ta: "இரண்டு எளிய சொற்கள்" },
          body: {
            en: "Income is money coming in (salary, business sales, remittances). Expenses are money going out (rent, food, bus fare, loan instalments). What's left = income − expenses.",
            si: "ආදායම යනු ලැබෙන මුදල් (වැටුප, ව්‍යාපාරික විකුණුම්, විදේශ ප්‍රේෂණ). වියදම් යනු යන මුදල් (කුලිය, ආහාර, බස් ගාස්තු, ණය වාරික). ඉතිරිය = ආදායම − වියදම්.",
            ta: "வருமானம் என்பது வரும் பணம் (சம்பளம், வணிக விற்பனை, வெளிநாட்டுப் பணம்). செலவுகள் என்பது போகும் பணம் (வாடகை, உணவு, பேருந்துக் கட்டணம், கடன் தவணை). மீதம் = வருமானம் − செலவுகள்.",
          },
        },
        {
          type: "example",
          title: { en: "Nimal's month", si: "නිමල්ගේ මාසය", ta: "நிமலின் மாதம்" },
          body: {
            en: "Nimal earns Rs. 80,000. Rent Rs. 20,000 · Food Rs. 20,000 · Transport Rs. 10,000 · Phone/Internet Rs. 5,000 · Entertainment Rs. 10,000 · Loan Rs. 10,000.",
            si: "නිමල් රු. 80,000ක් උපයනවා. කුලිය රු. 20,000 · ආහාර රු. 20,000 · ප්‍රවාහනය රු. 10,000 · දුරකථන/අන්තර්ජාලය රු. 5,000 · විනෝදාස්වාදය රු. 10,000 · ණය රු. 10,000.",
            ta: "நிமல் ரூ. 80,000 சம்பாதிக்கிறார். வாடகை ரூ. 20,000 · உணவு ரூ. 20,000 · போக்குவரத்து ரூ. 10,000 · தொலைபேசி/இணையம் ரூ. 5,000 · பொழுதுபோக்கு ரூ. 10,000 · கடன் ரூ. 10,000.",
          },
        },
        {
          type: "question",
          body: { en: "How much does Nimal have left?", si: "නිමල්ට ඉතිරි වන්නේ කීයද?", ta: "நிமலுக்கு எவ்வளவு மீதமிருக்கிறது?" },
          options: [
            { text: { en: "Rs. 0", si: "රු. 0", ta: "ரூ. 0" }, correct: false },
            { text: { en: "Rs. 5,000", si: "රු. 5,000", ta: "ரூ. 5,000" }, correct: true },
            { text: { en: "Rs. 15,000", si: "රු. 15,000", ta: "ரூ. 15,000" }, correct: false },
          ],
          explanation: {
            en: "Expenses add up to Rs. 75,000, so Rs. 80,000 − Rs. 75,000 = Rs. 5,000. That's about 6% of his income — a thin cushion if anything goes wrong.",
            si: "වියදම් එකතුව රු. 75,000යි, එබැවින් රු. 80,000 − රු. 75,000 = රු. 5,000. එය ආදායමෙන් 6%ක් පමණයි — යමක් වැරදුණොත් ඉතා කුඩා ආරක්ෂාවක්.",
            ta: "செலவுகள் மொத்தம் ரூ. 75,000; எனவே ரூ. 80,000 − ரூ. 75,000 = ரூ. 5,000. இது வருமானத்தில் சுமார் 6% — ஏதாவது தவறினால் மெல்லிய பாதுகாப்பு.",
          },
        },
        {
          type: "tip",
          title: { en: "Small changes add up", si: "කුඩා වෙනස්කම් එකතු වෙනවා", ta: "சிறு மாற்றங்கள் கூடுகின்றன" },
          body: {
            en: "If Nimal trims entertainment by Rs. 3,000, he keeps Rs. 8,000 a month — Rs. 96,000 a year. Tracking expenses is how you find these choices.",
            si: "නිමල් විනෝදාස්වාදයෙන් රු. 3,000ක් අඩු කළොත් මසකට රු. 8,000ක් ඉතිරි වෙනවා — වසරකට රු. 96,000ක්. වියදම් සටහන් කිරීමෙන් මෙවැනි තේරීම් සොයා ගත හැකියි.",
            ta: "நிமல் பொழுதுபோக்கை ரூ. 3,000 குறைத்தால் மாதம் ரூ. 8,000 மீதமாகும் — வருடம் ரூ. 96,000. செலவுகளைப் பதிவு செய்வதால் இத்தகைய தேர்வுகளைக் கண்டறியலாம்.",
          },
        },
      ],
      quiz: [
        {
          id: "q1",
          type: "calculation",
          prompt: {
            en: "Dilani earns Rs. 60,000 and spends Rs. 51,000. What percentage does she keep?",
            si: "දිලානි රු. 60,000ක් උපයා රු. 51,000ක් වියදම් කරනවා. ඇය ඉතිරි කරන ප්‍රතිශතය කීයද?",
            ta: "திலானி ரூ. 60,000 சம்பாதித்து ரூ. 51,000 செலவழிக்கிறார். அவர் வைத்திருக்கும் சதவீதம் என்ன?",
          },
          options: [
            { id: "a", text: { en: "9%", si: "9%", ta: "9%" } },
            { id: "b", text: { en: "15%", si: "15%", ta: "15%" } },
            { id: "c", text: { en: "85%", si: "85%", ta: "85%" } },
          ],
          correctId: "b",
          explanation: { en: "She keeps Rs. 9,000. Rs. 9,000 ÷ Rs. 60,000 = 15%.", si: "ඇයට රු. 9,000ක් ඉතිරියි. රු. 9,000 ÷ රු. 60,000 = 15%.", ta: "அவருக்கு ரூ. 9,000 மீதம். ரூ. 9,000 ÷ ரூ. 60,000 = 15%." },
        },
        {
          id: "q2",
          type: "mcq",
          prompt: { en: "Which of these is income?", si: "මේවායින් ආදායමක් වන්නේ කුමක්ද?", ta: "இவற்றில் வருமானம் எது?" },
          options: [
            { id: "a", text: { en: "A loan instalment", si: "ණය වාරිකයක්", ta: "கடன் தவணை" } },
            { id: "b", text: { en: "Money sent home by a family member working abroad", si: "විදේශගත පවුලේ සාමාජිකයෙක් එවන මුදල්", ta: "வெளிநாட்டில் வேலை செய்யும் குடும்ப உறுப்பினர் அனுப்பும் பணம்" } },
            { id: "c", text: { en: "Mobile reload", si: "ජංගම රීලෝඩ්", ta: "மொபைல் ரீலோட்" } },
          ],
          correctId: "b",
          explanation: {
            en: "Remittances are money coming in, so they are income for the household. The others are expenses.",
            si: "විදේශ ප්‍රේෂණ ලැබෙන මුදල් නිසා ගෘහයට ආදායමකි. අනෙක් ඒවා වියදම්ය.",
            ta: "வெளிநாட்டுப் பணம் வரும் பணம், எனவே குடும்பத்தின் வருமானம். மற்றவை செலவுகள்.",
          },
        },
        {
          id: "q3",
          type: "truefalse",
          prompt: { en: "If expenses are higher than income, the gap is usually covered by debt or savings.", si: "වියදම් ආදායමට වඩා වැඩි නම්, එම පරතරය සාමාන්‍යයෙන් ණය හෝ ඉතිරියෙන් පියවෙනවා.", ta: "செலவுகள் வருமானத்தை விட அதிகமானால், அந்த இடைவெளி பொதுவாகக் கடன் அல்லது சேமிப்பால் நிரப்பப்படும்." },
          options: [
            { id: "t", text: { en: "True", si: "සත්‍යයි", ta: "சரி" } },
            { id: "f", text: { en: "False", si: "අසත්‍යයි", ta: "தவறு" } },
          ],
          correctId: "t",
          explanation: {
            en: "Spending more than you earn has to be paid for somehow — by using savings or borrowing. Doing it every month makes debt grow.",
            si: "උපයන ප්‍රමාණයට වඩා වියදම් කිරීම ඉතිරියෙන් හෝ ණයෙන් පියවිය යුතුයි. සෑම මාසයකම එසේ වුවහොත් ණය වැඩි වෙනවා.",
            ta: "சம்பாதிப்பதை விட அதிகம் செலவழித்தால் சேமிப்பு அல்லது கடனால் ஈடுசெய்ய வேண்டும். மாதந்தோறும் இப்படி நடந்தால் கடன் வளரும்.",
          },
        },
      ],
      sources: [SOURCES.sakasuru],
      lastReviewed: REVIEWED,
      nextReview: NEXT_REVIEW,
    },
    {
      slug: "needs-vs-wants",
      title: { en: "Needs vs wants", si: "අවශ්‍යතා සහ කැමැත්තන්", ta: "தேவைகளும் விருப்பங்களும்" },
      summary: {
        en: "Rice or a new phone? Learn to sort spending — without guilt.",
        si: "හාල්ද, අලුත් දුරකථනයක්ද? වරදකාරී හැඟීමකින් තොරව වියදම් වර්ග කරමු.",
        ta: "அரிசியா, புதிய தொலைபேசியா? குற்ற உணர்வின்றி செலவுகளை வகைப்படுத்துவோம்.",
      },
      minutes: 3,
      xp: 20,
      tags: ["budgeting", "spending"],
      cards: [
        {
          type: "concept",
          title: { en: "What's the difference?", si: "වෙනස කුමක්ද?", ta: "வேறுபாடு என்ன?" },
          body: {
            en: "Needs are things you must have to live and work: food, housing, basic transport, electricity, medicine. Wants make life nicer but you could live without them: streaming apps, eating out, the latest phone.",
            si: "අවශ්‍යතා යනු ජීවත් වීමට සහ වැඩ කිරීමට අත්‍යවශ්‍ය දේවල්: ආහාර, නිවාස, මූලික ප්‍රවාහනය, විදුලිය, ඖෂධ. කැමැත්තන් ජීවිතය සුවපහසු කරන නමුත් නැතිව ජීවත් විය හැකි දේවල්: ස්ට්‍රීමිං ඇප්, පිටතින් කෑම, නවතම දුරකථනය.",
            ta: "தேவைகள் என்பது வாழவும் வேலை செய்யவும் அவசியமானவை: உணவு, வீடு, அடிப்படைப் போக்குவரத்து, மின்சாரம், மருந்து. விருப்பங்கள் வாழ்க்கையை இனிமையாக்கும், ஆனால் அவை இல்லாமலும் வாழலாம்: ஸ்ட்ரீமிங் செயலிகள், வெளியில் சாப்பிடுவது, புதிய தொலைபேசி.",
          },
        },
        {
          type: "question",
          body: { en: "Kamal buys a Rs. 180,000 phone when his old one works fine. Need or want?", si: "කමල්ගේ පරණ දුරකථනය හොඳින් ක්‍රියා කරද්දී ඔහු රු. 180,000 දුරකථනයක් මිලදී ගන්නවා. අවශ්‍යතාවක්ද කැමැත්තක්ද?", ta: "கமலின் பழைய தொலைபேசி நன்றாக வேலை செய்யும்போது ரூ. 180,000 தொலைபேசி வாங்குகிறார். தேவையா விருப்பமா?" },
          options: [
            { text: { en: "Need", si: "අවශ්‍යතාවක්", ta: "தேவை" }, correct: false },
            { text: { en: "Usually a want", si: "සාමාන්‍යයෙන් කැමැත්තක්", ta: "பொதுவாக விருப்பம்" }, correct: true },
          ],
          explanation: {
            en: "A phone can be a need — but an expensive upgrade while the old one works is usually a want. Context matters: a broken phone you need for work is different.",
            si: "දුරකථනයක් අවශ්‍යතාවක් විය හැකියි — නමුත් පරණ එක ක්‍රියා කරද්දී මිල අධික අලුත් එකක් සාමාන්‍යයෙන් කැමැත්තකි. තත්ත්වය වැදගත්: රැකියාවට අවශ්‍ය කැඩුණු දුරකථනයක් වෙනස්.",
            ta: "தொலைபேசி தேவையாக இருக்கலாம் — ஆனால் பழையது வேலை செய்யும்போது விலையுயர்ந்த மேம்பாடு பொதுவாக விருப்பம். சூழல் முக்கியம்: வேலைக்குத் தேவையான உடைந்த தொலைபேசி வேறு.",
          },
        },
        {
          type: "concept",
          title: { en: "A simple guide: needs, wants, savings", si: "සරල මාර්ගෝපදේශයක්: අවශ්‍යතා, කැමැත්තන්, ඉතිරිය", ta: "எளிய வழிகாட்டி: தேவைகள், விருப்பங்கள், சேமிப்பு" },
          body: {
            en: "Many people aim for roughly 50% needs, 30% wants and 20% savings. In Sri Lanka, rent and food often take more than half — that's normal. Treat it as a direction, not a rule.",
            si: "බොහෝ දෙනා ආසන්න වශයෙන් අවශ්‍යතා 50%, කැමැත්තන් 30%, ඉතිරිය 20% ඉලක්ක කරනවා. ශ්‍රී ලංකාවේ කුලිය සහ ආහාර බොහෝ විට අඩකට වඩා ගන්නවා — එය සාමාන්‍යයි. මෙය නීතියක් නොව දිශාවක් ලෙස සලකන්න.",
            ta: "பலர் சுமார் 50% தேவைகள், 30% விருப்பங்கள், 20% சேமிப்பு என இலக்கு வைக்கிறார்கள். இலங்கையில் வாடகையும் உணவும் பெரும்பாலும் பாதிக்கு மேல் எடுக்கும் — அது இயல்பானது. இதை விதியாக அல்ல, திசையாகக் கருதுங்கள்.",
          },
        },
        {
          type: "tip",
          title: { en: "Wants aren't bad", si: "කැමැත්තන් නරක නැහැ", ta: "விருப்பங்கள் கெட்டவை அல்ல" },
          body: {
            en: "Enjoying life matters. The goal is to choose wants on purpose, after your needs and savings are covered — not to feel guilty.",
            si: "ජීවිතය විඳීම වැදගත්. අරමුණ වරදකාරී හැඟීම නොව, අවශ්‍යතා සහ ඉතිරිය ආවරණය කළ පසු දැනුවත්ව කැමැත්තන් තෝරා ගැනීමයි.",
            ta: "வாழ்க்கையை அனுபவிப்பது முக்கியம். குற்ற உணர்வு அல்ல, தேவைகளும் சேமிப்பும் பூர்த்தியான பிறகு விருப்பங்களை நோக்கத்துடன் தேர்வு செய்வதே இலக்கு.",
          },
        },
      ],
      quiz: [
        {
          id: "q1",
          type: "mcq",
          prompt: { en: "Which is usually a NEED?", si: "සාමාන්‍යයෙන් අවශ්‍යතාවක් වන්නේ කුමක්ද?", ta: "பொதுவாகத் தேவை எது?" },
          options: [
            { id: "a", text: { en: "A streaming subscription", si: "ස්ට්‍රීමිං දායකත්වයක්", ta: "ஸ்ட்ரீமிங் சந்தா" } },
            { id: "b", text: { en: "Electricity bill", si: "විදුලි බිල", ta: "மின்சாரக் கட்டணம்" } },
            { id: "c", text: { en: "Weekend food delivery", si: "සති අන්ත ආහාර බෙදාහැරීම", ta: "வார இறுதி உணவு விநியோகம்" } },
          ],
          correctId: "b",
          explanation: { en: "Electricity is essential for daily life and work.", si: "විදුලිය දෛනික ජීවිතයට සහ රැකියාවට අත්‍යවශ්‍යයි.", ta: "மின்சாரம் அன்றாட வாழ்க்கைக்கும் வேலைக்கும் அவசியம்." },
        },
        {
          id: "q2",
          type: "scenario",
          prompt: {
            en: "Sunil's budget is tight this month. Which change protects his needs best?",
            si: "මේ මාසයේ සුනිල්ගේ අයවැය තදයි. ඔහුගේ අවශ්‍යතා හොඳින්ම ආරක්ෂා කරන වෙනස කුමක්ද?",
            ta: "இந்த மாதம் சுனிலின் வரவுசெலவு இறுக்கமாக உள்ளது. அவரது தேவைகளைச் சிறப்பாகப் பாதுகாக்கும் மாற்றம் எது?",
          },
          options: [
            { id: "a", text: { en: "Skip the electricity bill", si: "විදුලි බිල නොගෙවා සිටීම", ta: "மின்சாரக் கட்டணத்தைத் தவிர்ப்பது" } },
            { id: "b", text: { en: "Pause one subscription and eat out less", si: "එක් දායකත්වයක් නවතා පිටතින් කෑම අඩු කිරීම", ta: "ஒரு சந்தாவை நிறுத்தி, வெளியில் சாப்பிடுவதைக் குறைப்பது" } },
            { id: "c", text: { en: "Borrow from a money lender", si: "පොලී මුදලාලි කෙනෙකුගෙන් ණය ගැනීම", ta: "கடன் கொடுப்பவரிடம் கடன் வாங்குவது" } },
          ],
          correctId: "b",
          explanation: {
            en: "Cutting wants first keeps essentials paid and avoids expensive informal debt.",
            si: "මුලින්ම කැමැත්තන් අඩු කිරීමෙන් අත්‍යවශ්‍ය දේ ගෙවීම සහ මිල අධික අවිධිමත් ණයෙන් වැළකීම සිදු වෙනවා.",
            ta: "முதலில் விருப்பங்களைக் குறைப்பது அத்தியாவசியங்களைச் செலுத்தவும் விலையுயர்ந்த முறைசாரா கடனைத் தவிர்க்கவும் உதவும்.",
          },
        },
        {
          id: "q3",
          type: "truefalse",
          prompt: { en: "Every want is a bad financial decision.", si: "සෑම කැමැත්තක්ම නරක මූල්‍ය තීරණයකි.", ta: "ஒவ்வொரு விருப்பமும் மோசமான நிதி முடிவு." },
          options: [
            { id: "t", text: { en: "True", si: "සත්‍යයි", ta: "சரி" } },
            { id: "f", text: { en: "False", si: "අසත්‍යයි", ta: "தவறு" } },
          ],
          correctId: "f",
          explanation: {
            en: "Wants are fine when they're planned and affordable. Trouble starts when wants squeeze out needs or savings.",
            si: "සැලසුම් කළ, දැරිය හැකි කැමැත්තන් ගැටලුවක් නොවේ. කැමැත්තන් නිසා අවශ්‍යතා හෝ ඉතිරිය අඩු වූ විට ගැටලු පටන් ගන්නවා.",
            ta: "திட்டமிட்ட, தாங்கக்கூடிய விருப்பங்கள் பரவாயில்லை. விருப்பங்கள் தேவைகளையோ சேமிப்பையோ நெருக்கும்போதுதான் பிரச்சினை.",
          },
        },
      ],
      sources: [SOURCES.sakasuru],
      lastReviewed: REVIEWED,
      nextReview: NEXT_REVIEW,
    },
    {
      slug: "budgeting-basics",
      title: { en: "Build your first budget", si: "ඔබේ පළමු අයවැය සාදමු", ta: "உங்கள் முதல் வரவுசெலவுத் திட்டம்" },
      summary: {
        en: "A budget is a plan for your money, made before the month starts.",
        si: "අයවැය යනු මාසය පටන් ගැනීමට පෙර ඔබේ මුදල් සඳහා සාදන සැලැස්මකි.",
        ta: "வரவுசெலவுத் திட்டம் என்பது மாதம் தொடங்கும் முன் உங்கள் பணத்திற்கான திட்டம்.",
      },
      minutes: 4,
      xp: 25,
      tags: ["budgeting"],
      cards: [
        {
          type: "story",
          title: { en: "Fathima's salary day", si: "ෆාතිමාගේ පඩි දිනය", ta: "பாத்திமாவின் சம்பள நாள்" },
          body: {
            en: "Fathima, a nurse in Batticaloa, used to wonder where her salary went by the 20th. This month she spent 15 minutes on payday writing a plan for every rupee.",
            si: "මඩකලපුවේ හෙදියක වන ෆාතිමා, 20 වැනිදා වන විට වැටුප කොහේ ගියාදැයි කල්පනා කළා. මේ මාසයේ පඩි දිනයේ විනාඩි 15ක් වැය කර සෑම රුපියලකටම සැලැස්මක් ලිව්වා.",
            ta: "மட்டக்களப்பில் செவிலியரான பாத்திமா, 20ஆம் தேதிக்குள் சம்பளம் எங்கே போனது என்று யோசிப்பார். இந்த மாதம் சம்பள நாளில் 15 நிமிடங்கள் செலவழித்து ஒவ்வொரு ரூபாய்க்கும் திட்டம் எழுதினார்.",
          },
        },
        {
          type: "concept",
          title: { en: "Four steps", si: "පියවර හතරක්", ta: "நான்கு படிகள்" },
          body: {
            en: "1. Write your monthly income. 2. List fixed costs (rent, loan, school fees). 3. Set amounts for variable costs (food, transport). 4. Decide savings first, then what's left for wants.",
            si: "1. මාසික ආදායම ලියන්න. 2. ස්ථාවර වියදම් ලැයිස්තුගත කරන්න (කුලිය, ණය, පාසල් ගාස්තු). 3. විචල්‍ය වියදම්වලට මුදල් තීරණය කරන්න (ආහාර, ප්‍රවාහනය). 4. මුලින් ඉතිරිය තීරණය කර, ඉතිරි වන මුදල කැමැත්තන්ට.",
            ta: "1. மாத வருமானத்தை எழுதுங்கள். 2. நிலையான செலவுகளைப் பட்டியலிடுங்கள் (வாடகை, கடன், பள்ளிக் கட்டணம்). 3. மாறும் செலவுகளுக்குத் தொகை ஒதுக்குங்கள் (உணவு, போக்குவரத்து). 4. முதலில் சேமிப்பை முடிவு செய்து, மீதியை விருப்பங்களுக்கு.",
          },
        },
        {
          type: "tip",
          title: { en: "Base it on real numbers", si: "සැබෑ සංඛ්‍යා මත පදනම් කරන්න", ta: "உண்மையான எண்களை அடிப்படையாகக் கொள்ளுங்கள்" },
          body: {
            en: "Track your spending for two weeks before setting limits. A budget built on guesses breaks quickly; one built on your real habits lasts.",
            si: "සීමා තීරණය කිරීමට පෙර සති දෙකක් ඔබේ වියදම් සටහන් කරන්න. අනුමාන මත සාදන අයවැයක් ඉක්මනින් බිඳෙනවා; සැබෑ පුරුදු මත සාදන එකක් පවතිනවා.",
            ta: "வரம்புகளை நிர்ணயிக்கும் முன் இரண்டு வாரங்கள் செலவுகளைப் பதிவு செய்யுங்கள். ஊகத்தில் கட்டிய திட்டம் விரைவில் உடையும்; உண்மைப் பழக்கத்தில் கட்டியது நிலைக்கும்.",
          },
        },
        {
          type: "tip",
          title: { en: "Review, don't punish", si: "සමාලෝචනය කරන්න, දඬුවම් නොකරන්න", ta: "மதிப்பாய்வு செய்யுங்கள், தண்டிக்காதீர்கள்" },
          body: {
            en: "If you go over in one category, move money from another and adjust next month. Budgets are meant to change as life changes.",
            si: "එක් වර්ගයක සීමාව ඉක්මවූයේ නම්, වෙනත් වර්ගයකින් මුදල් මාරු කර ලබන මාසයේ සකස් කරන්න. ජීවිතය වෙනස් වන විට අයවැයද වෙනස් විය යුතුයි.",
            ta: "ஒரு வகையில் அதிகமானால், இன்னொன்றிலிருந்து பணத்தை மாற்றி அடுத்த மாதம் சரிசெய்யுங்கள். வாழ்க்கை மாறும்போது திட்டமும் மாற வேண்டும்.",
          },
        },
      ],
      quiz: [
        {
          id: "q1",
          type: "mcq",
          prompt: { en: "When is the best time to make a monthly budget?", si: "මාසික අයවැයක් සෑදීමට හොඳම කාලය කුමක්ද?", ta: "மாத வரவுசெலவுத் திட்டத்தை உருவாக்க சிறந்த நேரம் எது?" },
          options: [
            { id: "a", text: { en: "Before the month starts / on payday", si: "මාසය පටන් ගැනීමට පෙර / පඩි දිනයේ", ta: "மாதம் தொடங்கும் முன் / சம்பள நாளில்" } },
            { id: "b", text: { en: "When money runs out", si: "මුදල් අවසන් වූ විට", ta: "பணம் தீர்ந்தபோது" } },
            { id: "c", text: { en: "Only at the end of the year", si: "වසර අවසානයේ පමණක්", ta: "வருட இறுதியில் மட்டும்" } },
          ],
          correctId: "a",
          explanation: { en: "A budget is a plan — it works best when made before the money is spent.", si: "අයවැය සැලැස්මකි — මුදල් වියදම් කිරීමට පෙර සෑදූ විට හොඳින්ම ක්‍රියා කරයි.", ta: "வரவுசெலவுத் திட்டம் ஒரு திட்டம் — பணம் செலவழிக்கும் முன் உருவாக்கினால் சிறப்பாகச் செயல்படும்." },
        },
        {
          id: "q2",
          type: "calculation",
          prompt: {
            en: "Income Rs. 100,000. Expenses Rs. 72,000. Savings Rs. 18,000. What remains?",
            si: "ආදායම රු. 100,000. වියදම් රු. 72,000. ඉතිරිය රු. 18,000. ඉතිරි වන්නේ කීයද?",
            ta: "வருமானம் ரூ. 100,000. செலவுகள் ரூ. 72,000. சேமிப்பு ரூ. 18,000. மீதம் எவ்வளவு?",
          },
          options: [
            { id: "a", text: { en: "Rs. 10,000", si: "රු. 10,000", ta: "ரூ. 10,000" } },
            { id: "b", text: { en: "Rs. 18,000", si: "රු. 18,000", ta: "ரூ. 18,000" } },
            { id: "c", text: { en: "Rs. 28,000", si: "රු. 28,000", ta: "ரூ. 28,000" } },
          ],
          correctId: "a",
          explanation: { en: "100,000 − 72,000 − 18,000 = Rs. 10,000. The savings rate is 18%.", si: "100,000 − 72,000 − 18,000 = රු. 10,000. ඉතිරි කිරීමේ අනුපාතය 18%යි.", ta: "100,000 − 72,000 − 18,000 = ரூ. 10,000. சேமிப்பு விகிதம் 18%." },
        },
        {
          id: "q3",
          type: "truefalse",
          prompt: { en: "Once made, a budget should never change.", si: "සෑදූ පසු අයවැයක් කිසි විටෙක වෙනස් නොකළ යුතුයි.", ta: "ஒருமுறை உருவாக்கிய திட்டத்தை ஒருபோதும் மாற்றக்கூடாது." },
          options: [
            { id: "t", text: { en: "True", si: "සත්‍යයි", ta: "சரி" } },
            { id: "f", text: { en: "False", si: "අසත්‍යයි", ta: "தவறு" } },
          ],
          correctId: "f",
          explanation: { en: "Good budgets are reviewed every month and adjusted.", si: "හොඳ අයවැයක් සෑම මසකම සමාලෝචනය කර සකස් කෙරේ.", ta: "நல்ல திட்டங்கள் ஒவ்வொரு மாதமும் மதிப்பாய்வு செய்யப்பட்டு சரிசெய்யப்படும்." },
        },
      ],
      sources: [SOURCES.sakasuru],
      lastReviewed: REVIEWED,
      nextReview: NEXT_REVIEW,
    },
    {
      slug: "what-is-inflation",
      title: { en: "Understanding inflation", si: "උද්ධමනය තේරුම් ගනිමු", ta: "பணவீக்கத்தைப் புரிந்துகொள்வோம்" },
      summary: {
        en: "Why the same Rs. 1,000 buys less rice every few years.",
        si: "එකම රු. 1,000කින් වසර කිහිපයකට වරක් අඩුවෙන් හාල් ලැබෙන්නේ ඇයි?",
        ta: "அதே ரூ. 1,000க்கு சில வருடங்களுக்கு ஒருமுறை குறைவான அரிசி கிடைப்பது ஏன்?",
      },
      minutes: 3,
      xp: 20,
      tags: ["inflation", "basics"],
      timeSensitive: false,
      cards: [
        {
          type: "story",
          title: { en: "Ask your grandparents", si: "ආච්චිලාගෙන් අහන්න", ta: "தாத்தா பாட்டியிடம் கேளுங்கள்" },
          body: {
            en: "Your grandparents probably remember a bus ride or a cup of tea costing a few rupees. The tea didn't change — the value of the rupee did.",
            si: "ඔබේ ආච්චි සීයාට රුපියල් කිහිපයකට බස් ගමනක් හෝ තේ කෝප්පයක් මතක ඇති. තේ වෙනස් වුණේ නැහැ — රුපියලේ වටිනාකම වෙනස් වුණා.",
            ta: "உங்கள் தாத்தா பாட்டிக்கு சில ரூபாய்க்கு பேருந்துப் பயணம் அல்லது தேநீர் நினைவிருக்கும். தேநீர் மாறவில்லை — ரூபாயின் மதிப்பு மாறியது.",
          },
        },
        {
          type: "concept",
          title: { en: "What inflation means", si: "උද්ධමනය යනු", ta: "பணவீக்கம் என்றால்" },
          body: {
            en: "Inflation is the general rise in prices over time. When inflation is 5%, something costing Rs. 10,000 today costs about Rs. 10,500 next year. Your money buys a little less each year.",
            si: "උද්ධමනය යනු කාලයත් සමඟ මිල ගණන් සාමාන්‍යයෙන් ඉහළ යාමයි. උද්ධමනය 5% නම්, අද රු. 10,000ක් වන දෙයක් ලබන වසරේ රු. 10,500ක් පමණ වෙනවා. ඔබේ මුදලින් සෑම වසරකම ටිකක් අඩුවෙන් මිලදී ගත හැකියි.",
            ta: "பணவீக்கம் என்பது காலப்போக்கில் விலைகளின் பொதுவான உயர்வு. பணவீக்கம் 5% என்றால், இன்று ரூ. 10,000 விலையுள்ள பொருள் அடுத்த ஆண்டு சுமார் ரூ. 10,500. உங்கள் பணம் ஒவ்வொரு ஆண்டும் சற்றுக் குறைவாக வாங்கும்.",
          },
        },
        {
          type: "example",
          title: { en: "Over 10 years", si: "වසර 10ක් තුළ", ta: "10 ஆண்டுகளில்" },
          body: {
            en: "At an average of 5% a year, Rs. 10,000 of shopping today would cost about Rs. 16,300 in 10 years. Try different rates in the inflation calculator.",
            si: "වසරකට සාමාන්‍යයෙන් 5% නම්, අද රු. 10,000ක සාප්පු ගමනක් වසර 10කින් රු. 16,300ක් පමණ වෙනවා. උද්ධමන ගණකයේ විවිධ අනුපාත උත්සාහ කරන්න.",
            ta: "ஆண்டுக்குச் சராசரி 5% என்றால், இன்று ரூ. 10,000 கொள்முதல் 10 ஆண்டுகளில் சுமார் ரூ. 16,300 ஆகும். பணவீக்கக் கணிப்பானில் வெவ்வேறு விகிதங்களை முயலுங்கள்.",
          },
        },
        {
          type: "warning",
          title: { en: "Future inflation is uncertain", si: "අනාගත උද්ධමනය අවිනිශ්චිතයි", ta: "எதிர்காலப் பணவீக்கம் நிச்சயமற்றது" },
          body: {
            en: "Nobody knows future inflation for sure. Sri Lanka has seen both low and very high inflation. For the latest official figures, check the Central Bank of Sri Lanka.",
            si: "අනාගත උද්ධමනය කිසිවෙකුට නිශ්චිතව දන්නේ නැහැ. ශ්‍රී ලංකාව අඩු සහ ඉතා ඉහළ උද්ධමනය යන දෙකම අත්විඳ ඇත. නවතම නිල සංඛ්‍යා සඳහා ශ්‍රී ලංකා මහ බැංකුව පරීක්ෂා කරන්න.",
            ta: "எதிர்காலப் பணவீக்கம் யாருக்கும் உறுதியாகத் தெரியாது. இலங்கை குறைந்த மற்றும் மிக உயர்ந்த பணவீக்கம் இரண்டையும் கண்டுள்ளது. சமீபத்திய அதிகாரப்பூர்வ எண்களுக்கு இலங்கை மத்திய வங்கியைப் பாருங்கள்.",
          },
        },
        {
          type: "tip",
          title: { en: "What this means for savings", si: "මෙය ඉතිරියට අදහස් කරන්නේ", ta: "சேமிப்புக்கு இதன் பொருள்" },
          body: {
            en: "Cash kept at home loses value over time. Savings that earn interest can help — compare the interest rate with inflation to see whether your money is really growing.",
            si: "නිවසේ තබන මුදල් කාලයත් සමඟ වටිනාකම අහිමි කරනවා. පොලිය ලැබෙන ඉතිරි කිරීම් උදව් විය හැකියි — ඔබේ මුදල් සැබවින්ම වර්ධනය වේදැයි බැලීමට පොලී අනුපාතය උද්ධමනය සමඟ සසඳන්න.",
            ta: "வீட்டில் வைக்கும் பணம் காலப்போக்கில் மதிப்பை இழக்கும். வட்டி தரும் சேமிப்பு உதவலாம் — உங்கள் பணம் உண்மையில் வளர்கிறதா என்று பார்க்க வட்டி விகிதத்தைப் பணவீக்கத்துடன் ஒப்பிடுங்கள்.",
          },
        },
      ],
      quiz: [
        {
          id: "q1",
          type: "mcq",
          prompt: { en: "What does inflation do to your money?", si: "උද්ධමනය ඔබේ මුදල්වලට කරන්නේ කුමක්ද?", ta: "பணவீக்கம் உங்கள் பணத்திற்கு என்ன செய்கிறது?" },
          options: [
            { id: "a", text: { en: "Makes it buy more", si: "වැඩිපුර මිලදී ගැනීමට ඉඩ දෙයි", ta: "அதிகம் வாங்க வைக்கும்" } },
            { id: "b", text: { en: "Makes it buy less over time", si: "කාලයත් සමඟ අඩුවෙන් මිලදී ගැනීමට සලස්වයි", ta: "காலப்போக்கில் குறைவாக வாங்க வைக்கும்" } },
            { id: "c", text: { en: "Has no effect", si: "බලපෑමක් නැහැ", ta: "எந்த விளைவும் இல்லை" } },
          ],
          correctId: "b",
          explanation: { en: "Rising prices reduce purchasing power — what each rupee can buy.", si: "මිල ඉහළ යාම මිලදී ගැනීමේ හැකියාව අඩු කරයි — එක් රුපියලකින් ගත හැකි දේ.", ta: "விலை உயர்வு வாங்கும் சக்தியைக் குறைக்கிறது — ஒவ்வொரு ரூபாயும் வாங்கக்கூடியது." },
        },
        {
          id: "q2",
          type: "scenario",
          prompt: {
            en: "Your savings account pays 4% a year and inflation is 6%. What is happening to your money's real value?",
            si: "ඔබේ ඉතිරි කිරීමේ ගිණුම වසරකට 4% ගෙවන අතර උද්ධමනය 6%යි. ඔබේ මුදලේ සැබෑ වටිනාකමට කුමක් වේද?",
            ta: "உங்கள் சேமிப்புக் கணக்கு ஆண்டுக்கு 4% தருகிறது, பணவீக்கம் 6%. உங்கள் பணத்தின் உண்மை மதிப்புக்கு என்ன நடக்கிறது?",
          },
          options: [
            { id: "a", text: { en: "Growing", si: "වර්ධනය වෙනවා", ta: "வளர்கிறது" } },
            { id: "b", text: { en: "Shrinking slightly", si: "මඳක් අඩු වෙනවා", ta: "சற்றுக் குறைகிறது" } },
            { id: "c", text: { en: "Exactly the same", si: "හරියටම එසේමයි", ta: "அப்படியே உள்ளது" } },
          ],
          correctId: "b",
          explanation: {
            en: "Prices rise faster (6%) than your interest (4%), so the real value falls by roughly 2% a year.",
            si: "මිල (6%) ඔබේ පොලියට (4%) වඩා වේගයෙන් ඉහළ යන නිසා සැබෑ වටිනාකම වසරකට 2%ක් පමණ අඩු වෙනවා.",
            ta: "உங்கள் வட்டியை (4%) விட விலைகள் (6%) வேகமாக உயர்வதால், உண்மை மதிப்பு ஆண்டுக்குச் சுமார் 2% குறைகிறது.",
          },
        },
        {
          id: "q3",
          type: "truefalse",
          prompt: { en: "Future inflation rates can be known exactly.", si: "අනාගත උද්ධමන අනුපාත නිශ්චිතව දැනගත හැකියි.", ta: "எதிர்காலப் பணவீக்க விகிதங்களைத் துல்லியமாக அறியலாம்." },
          options: [
            { id: "t", text: { en: "True", si: "සත්‍යයි", ta: "சரி" } },
            { id: "f", text: { en: "False", si: "අසත්‍යයි", ta: "தவறு" } },
          ],
          correctId: "f",
          explanation: { en: "Forecasts exist, but actual inflation is uncertain.", si: "පුරෝකථන ඇතත්, සැබෑ උද්ධමනය අවිනිශ්චිතයි.", ta: "முன்னறிவிப்புகள் உள்ளன, ஆனால் உண்மையான பணவீக்கம் நிச்சயமற்றது." },
        },
      ],
      sources: [SOURCES.cbslInflation, SOURCES.cbsl],
      lastReviewed: REVIEWED,
      nextReview: NEXT_REVIEW_TIME_SENSITIVE,
    },
  ],
};
