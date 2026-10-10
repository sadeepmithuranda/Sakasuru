import { type Course, REVIEWED, NEXT_REVIEW, SOURCES, TF, rs, same } from "../types.js";

export const level2: Course = {
  slug: "managing-money",
  level: 2,
  icon: "🧭",
  color: "#2B6CB0",
  title: { en: "Managing Your Money", si: "ඔබේ මුදල් කළමනාකරණය", ta: "உங்கள் பணத்தை நிர்வகித்தல்" },
  description: {
    en: "Emergency funds, credit cards and loans — how interest really works.",
    si: "හදිසි අරමුදල්, ණය කාඩ්පත් සහ ණය — පොලිය සැබවින්ම ක්‍රියා කරන ආකාරය.",
    ta: "அவசர நிதி, கடன் அட்டைகள், கடன்கள் — வட்டி உண்மையில் எப்படி வேலை செய்கிறது.",
  },
  lessons: [
    {
      slug: "emergency-fund",
      title: { en: "Your emergency fund", si: "ඔබේ හදිසි අරමුදල", ta: "உங்கள் அவசர நிதி" },
      summary: {
        en: "How much is enough, where to keep it, and how to build it step by step.",
        si: "කොපමණ ප්‍රමාණවත්ද, කොහේ තබන්නද, පියවරෙන් පියවර ගොඩනගන්නේ කෙසේද.",
        ta: "எவ்வளவு போதும், எங்கே வைப்பது, படிப்படியாக எப்படி உருவாக்குவது.",
      },
      minutes: 4,
      xp: 25,
      tags: ["emergency", "saving"],
      cards: [
        {
          type: "concept",
          title: { en: "Money for life's surprises", si: "ජීවිතයේ අනපේක්ෂිත දේට මුදල්", ta: "வாழ்க்கையின் எதிர்பாராதவற்றுக்கான பணம்" },
          body: {
            en: "An emergency fund covers essential costs if income stops or a big surprise hits: illness, job loss, a broken motorbike, a family emergency.",
            si: "ආදායම නැවතුණොත් හෝ විශාල අනපේක්ෂිත වියදමක් ආවොත් අත්‍යවශ්‍ය වියදම් පියවීමට හදිසි අරමුදල උපකාරී වේ: අසනීප, රැකියාව අහිමි වීම, යතුරුපැදිය කැඩීම, පවුලේ හදිසි අවස්ථා.",
            ta: "வருமானம் நின்றாலோ பெரிய எதிர்பாராத செலவு வந்தாலோ அவசியச் செலவுகளை அவசர நிதி ஈடுசெய்கிறது: நோய், வேலை இழப்பு, பழுதான மோட்டார் சைக்கிள், குடும்ப அவசரம்.",
          },
        },
        {
          type: "example",
          title: { en: "How much?", si: "කොපමණද?", ta: "எவ்வளவு?" },
          body: {
            en: "Add up essential monthly costs only (rent, food, utilities, transport, loan instalments). If that's Rs. 55,000, three months of cover is Rs. 165,000. Many people aim for 3–6 months.",
            si: "අත්‍යවශ්‍ය මාසික වියදම් පමණක් එකතු කරන්න (කුලිය, ආහාර, උපයෝගිතා, ප්‍රවාහනය, ණය වාරික). එය රු. 55,000 නම්, මාස තුනක ආවරණය රු. 165,000යි. බොහෝ දෙනා මාස 3–6ක් ඉලක්ක කරනවා.",
            ta: "அவசிய மாதச் செலவுகளை மட்டும் கூட்டுங்கள் (வாடகை, உணவு, பயன்பாடுகள், போக்குவரத்து, கடன் தவணை). அது ரூ. 55,000 என்றால், மூன்று மாதப் பாதுகாப்பு ரூ. 165,000. பலர் 3–6 மாதங்களை இலக்காக வைக்கிறார்கள்.",
          },
        },
        {
          type: "tip",
          title: { en: "Keep it safe and reachable", si: "ආරක්ෂිතව, ළඟා විය හැකිව තබන්න", ta: "பாதுகாப்பாக, எளிதில் எடுக்கக்கூடியதாக" },
          body: {
            en: "Keep it in a separate savings account at a licensed bank — easy to withdraw, but not mixed with daily spending. Avoid risky investments for this money.",
            si: "බලපත්‍රලාභී බැංකුවක වෙනම ඉතිරි කිරීමේ ගිණුමක තබන්න — පහසුවෙන් ආපසු ගත හැකි, නමුත් දෛනික වියදම් සමඟ මිශ්‍ර නොවන ලෙස. මෙම මුදල් අවදානම් ආයෝජනවල නොයොදන්න.",
            ta: "உரிமம் பெற்ற வங்கியில் தனிச் சேமிப்புக் கணக்கில் வையுங்கள் — எளிதில் எடுக்கலாம், ஆனால் அன்றாடச் செலவுடன் கலக்காது. இந்தப் பணத்தை ஆபத்தான முதலீடுகளில் வைக்காதீர்கள்.",
          },
        },
        {
          type: "tip",
          title: { en: "Build it in steps", si: "පියවරෙන් ගොඩනගන්න", ta: "படிப்படியாக உருவாக்குங்கள்" },
          body: {
            en: "First milestone: Rs. 10,000. Then one month of essentials. Then three. Every step makes you safer — you don't need the full amount to start.",
            si: "පළමු සන්ධිස්ථානය: රු. 10,000. ඉන්පසු අත්‍යවශ්‍ය වියදම් මාසයක්. ඉන්පසු මාස තුනක්. සෑම පියවරක්ම ඔබව ආරක්ෂිත කරනවා — පටන් ගැනීමට සම්පූර්ණ මුදල අවශ්‍ය නැහැ.",
            ta: "முதல் மைல்கல்: ரூ. 10,000. பிறகு ஒரு மாத அவசியச் செலவு. பிறகு மூன்று. ஒவ்வொரு படியும் பாதுகாப்பைக் கூட்டும் — தொடங்க முழுத் தொகை தேவையில்லை.",
          },
        },
      ],
      quiz: [
        {
          id: "q1",
          type: "calculation",
          prompt: {
            en: "Essential costs are Rs. 40,000 a month. What is a 6-month emergency fund?",
            si: "අත්‍යවශ්‍ය වියදම් මසකට රු. 40,000යි. මාස 6ක හදිසි අරමුදල කීයද?",
            ta: "அவசியச் செலவுகள் மாதம் ரூ. 40,000. 6 மாத அவசர நிதி எவ்வளவு?",
          },
          options: [
            { id: "a", text: rs("120,000") },
            { id: "b", text: rs("240,000") },
            { id: "c", text: rs("480,000") },
          ],
          correctId: "b",
          explanation: same("40,000 × 6 = 240,000"),
        },
        {
          id: "q2",
          type: "mcq",
          prompt: { en: "Where is the best place to keep an emergency fund?", si: "හදිසි අරමුදලක් තබා ගැනීමට හොඳම ස්ථානය කුමක්ද?", ta: "அவசர நிதியை வைக்கச் சிறந்த இடம் எது?" },
          options: [
            { id: "a", text: { en: "Shares on the stock market", si: "කොටස් වෙළඳපොළේ කොටස්", ta: "பங்குச் சந்தையில் பங்குகள்" } },
            { id: "b", text: { en: "A separate savings account at a licensed bank", si: "බලපත්‍රලාභී බැංකුවක වෙනම ඉතිරි කිරීමේ ගිණුමක්", ta: "உரிமம் பெற்ற வங்கியில் தனிச் சேமிப்புக் கணக்கு" } },
            { id: "c", text: { en: "A friend's new business", si: "මිතුරෙකුගේ නව ව්‍යාපාරයක්", ta: "நண்பரின் புதிய வணிகம்" } },
          ],
          correctId: "b",
          explanation: {
            en: "Emergency money must be safe and quick to access. Shares can fall exactly when you need cash.",
            si: "හදිසි මුදල් ආරක්ෂිතව සහ ඉක්මනින් ලබාගත හැකි විය යුතුයි. ඔබට මුදල් අවශ්‍ය මොහොතේම කොටස් මිල පහත වැටිය හැකියි.",
            ta: "அவசரப் பணம் பாதுகாப்பாகவும் விரைவில் எடுக்கக்கூடியதாகவும் இருக்க வேண்டும். உங்களுக்குப் பணம் தேவைப்படும்போதே பங்குகள் சரியலாம்.",
          },
        },
        {
          id: "q3",
          type: "truefalse",
          prompt: { en: "You should only start an emergency fund once you can save the full amount at once.", si: "සම්පූර්ණ මුදල එකවර ඉතිරි කළ හැකි වූ පසුව පමණක් හදිසි අරමුදලක් පටන් ගත යුතුයි.", ta: "முழுத் தொகையையும் ஒரே நேரத்தில் சேமிக்க முடிந்தால் மட்டுமே அவசர நிதியைத் தொடங்க வேண்டும்." },
          options: TF,
          correctId: "f",
          explanation: { en: "Small, regular amounts build it over time. Start with any amount.", si: "කුඩා, නිතිපතා මුදල් කාලයත් සමඟ එය ගොඩනගයි. ඕනෑම මුදලකින් පටන් ගන්න.", ta: "சிறிய, வழக்கமான தொகைகள் காலப்போக்கில் அதை உருவாக்கும். எந்தத் தொகையிலும் தொடங்குங்கள்." },
        },
      ],
      sources: [SOURCES.cbslFinLit, SOURCES.sakasuru],
      lastReviewed: REVIEWED,
      nextReview: NEXT_REVIEW,
    },
    {
      slug: "credit-card-minimum",
      title: { en: "Credit cards & the minimum payment trap", si: "ණය කාඩ්පත් සහ අවම ගෙවීමේ උගුල", ta: "கடன் அட்டைகளும் குறைந்தபட்சக் கட்டணப் பொறியும்" },
      summary: {
        en: "Minimum payment does not mean cheapest repayment.",
        si: "අවම ගෙවීම යනු ලාභම ආපසු ගෙවීම නොවේ.",
        ta: "குறைந்தபட்சக் கட்டணம் என்றால் மலிவான திருப்பிச் செலுத்துதல் அல்ல.",
      },
      minutes: 5,
      xp: 30,
      tags: ["credit", "debt", "interest"],
      cards: [
        {
          type: "concept",
          title: { en: "How a credit card works", si: "ණය කාඩ්පතක් ක්‍රියා කරන ආකාරය", ta: "கடன் அட்டை எப்படி வேலை செய்கிறது" },
          body: {
            en: "A credit card lets you borrow the bank's money up to a limit. Each month you get a statement. Pay the full statement balance by the due date and you usually pay no interest.",
            si: "ණය කාඩ්පතක් සීමාවක් දක්වා බැංකුවේ මුදල් ණයට ගැනීමට ඉඩ දෙයි. සෑම මසකම ඔබට ප්‍රකාශයක් ලැබේ. නියමිත දිනට පෙර සම්පූර්ණ ප්‍රකාශ ශේෂය ගෙවුවොත් සාමාන්‍යයෙන් පොලියක් නැහැ.",
            ta: "கடன் அட்டை ஒரு வரம்பு வரை வங்கியின் பணத்தைக் கடன் வாங்க அனுமதிக்கிறது. ஒவ்வொரு மாதமும் அறிக்கை வரும். உரிய தேதிக்குள் முழு அறிக்கை நிலுவையைச் செலுத்தினால் பொதுவாக வட்டி இல்லை.",
          },
        },
        {
          type: "concept",
          title: { en: "The minimum payment", si: "අවම ගෙවීම", ta: "குறைந்தபட்சக் கட்டணம்" },
          body: {
            en: "The minimum payment is a small part of the balance (often a few percent). Paying it avoids a late fee — but interest keeps charging on everything that's left, at a high rate.",
            si: "අවම ගෙවීම ශේෂයෙන් කුඩා කොටසකි (බොහෝ විට ප්‍රතිශත කිහිපයක්). එය ගෙවීමෙන් ප්‍රමාද ගාස්තුවෙන් වැළකෙනවා — නමුත් ඉතිරි සියල්ලට ඉහළ අනුපාතයකින් පොලිය දිගටම අය වෙනවා.",
            ta: "குறைந்தபட்சக் கட்டணம் நிலுவையில் சிறு பகுதி (பெரும்பாலும் சில சதவீதம்). அதைச் செலுத்தினால் தாமதக் கட்டணம் தவிர்க்கப்படும் — ஆனால் மீதமுள்ள அனைத்துக்கும் அதிக விகிதத்தில் வட்டி தொடரும்.",
          },
        },
        {
          type: "example",
          title: { en: "Rs. 100,000 on a card", si: "කාඩ්පතේ රු. 100,000", ta: "அட்டையில் ரூ. 100,000" },
          body: {
            en: "Example only: a Rs. 100,000 balance at 28% a year, paying a 5% minimum (at least Rs. 1,000), takes years to clear and costs tens of thousands in interest. Paying a fixed Rs. 10,000 a month clears it in about a year. Try it in the credit-card simulator with your own card's rate.",
            si: "උදාහරණයක් පමණි: වසරකට 28% පොලියට රු. 100,000 ශේෂයක් 5% අවම ගෙවීමෙන් (අවම රු. 1,000) ගෙවීමට වසර ගණනාවක් ගත වන අතර පොලියට දහස් ගණනක් වැය වේ. මසකට ස්ථාවර රු. 10,000ක් ගෙවුවොත් වසරකින් පමණ අවසන් වේ. ඔබේ කාඩ්පතේ අනුපාතය සමඟ ණය කාඩ් අනුකාරකයේ උත්සාහ කරන්න.",
            ta: "உதாரணம் மட்டும்: ஆண்டுக்கு 28% வட்டியில் ரூ. 100,000 நிலுவையை 5% குறைந்தபட்சம் (குறைந்தது ரூ. 1,000) செலுத்தி அடைக்க பல ஆண்டுகள் ஆகும், வட்டியாகப் பல்லாயிரம் செலவாகும். மாதம் நிலையான ரூ. 10,000 செலுத்தினால் சுமார் ஒரு வருடத்தில் முடியும். உங்கள் அட்டையின் விகிதத்துடன் கடன் அட்டை உருவகப்படுத்தியில் முயலுங்கள்.",
          },
        },
        {
          type: "tip",
          title: { en: "Using cards responsibly", si: "කාඩ්පත් වගකීමෙන් භාවිතය", ta: "அட்டைகளைப் பொறுப்புடன் பயன்படுத்துதல்" },
          body: {
            en: "Spend only what you can repay this month. Set a reminder before the due date. Never withdraw cash on a credit card unless it's a true emergency — cash advances usually charge interest from day one.",
            si: "මේ මාසයේ ආපසු ගෙවිය හැකි ප්‍රමාණය පමණක් වියදම් කරන්න. නියමිත දිනට පෙර මතක් කිරීමක් සකසන්න. සැබෑ හදිසියක් නොවේ නම් ණය කාඩ්පතෙන් මුදල් ආපසු නොගන්න — මුදල් අත්තිකාරම්වලට සාමාන්‍යයෙන් පළමු දින සිටම පොලිය අය වේ.",
            ta: "இந்த மாதம் திருப்பிச் செலுத்தக்கூடியதை மட்டும் செலவழியுங்கள். உரிய தேதிக்கு முன் நினைவூட்டல் அமையுங்கள். உண்மையான அவசரம் இல்லாவிட்டால் கடன் அட்டையில் பணம் எடுக்காதீர்கள் — பண முன்பணத்துக்குப் பொதுவாக முதல் நாளிலிருந்தே வட்டி.",
          },
        },
      ],
      quiz: [
        {
          id: "q1",
          type: "truefalse",
          prompt: { en: "Paying only the minimum is the cheapest way to repay a credit card.", si: "අවම ගෙවීම පමණක් ගෙවීම ණය කාඩ්පතක් ආපසු ගෙවීමේ ලාභම ක්‍රමයයි.", ta: "குறைந்தபட்சத்தை மட்டும் செலுத்துவது கடன் அட்டையைத் திருப்பிச் செலுத்த மலிவான வழி." },
          options: TF,
          correctId: "f",
          explanation: { en: "It's the slowest and usually the most expensive, because interest keeps building on the remaining balance.", si: "එය මන්දගාමීම සහ සාමාන්‍යයෙන් වඩාත්ම මිල අධික ක්‍රමයයි, මන්ද ඉතිරි ශේෂයට පොලිය දිගටම එකතු වන බැවිනි.", ta: "இது மிக மெதுவானது, பொதுவாக மிக விலையுயர்ந்தது; ஏனெனில் மீதமுள்ள நிலுவையில் வட்டி தொடர்ந்து சேர்கிறது." },
        },
        {
          id: "q2",
          type: "mcq",
          prompt: { en: "How can you usually avoid credit-card interest on purchases?", si: "මිලදී ගැනීම් සඳහා ණය කාඩ්පත් පොලියෙන් සාමාන්‍යයෙන් වැළකිය හැක්කේ කෙසේද?", ta: "கொள்முதல்களுக்கான கடன் அட்டை வட்டியைப் பொதுவாக எப்படித் தவிர்க்கலாம்?" },
          options: [
            { id: "a", text: { en: "Pay the full statement balance by the due date", si: "නියමිත දිනට පෙර සම්පූර්ණ ප්‍රකාශ ශේෂය ගෙවීම", ta: "உரிய தேதிக்குள் முழு அறிக்கை நிலுவையைச் செலுத்துதல்" } },
            { id: "b", text: { en: "Pay the minimum every month", si: "සෑම මසකම අවම ගෙවීම", ta: "ஒவ்வொரு மாதமும் குறைந்தபட்சத்தைச் செலுத்துதல்" } },
            { id: "c", text: { en: "Increase your credit limit", si: "ණය සීමාව වැඩි කිරීම", ta: "கடன் வரம்பை உயர்த்துதல்" } },
          ],
          correctId: "a",
          explanation: { en: "Most cards give an interest-free period on purchases if the full statement balance is paid on time. Check your card's terms.", si: "සම්පූර්ණ ප්‍රකාශ ශේෂය නියමිත වේලාවට ගෙවුවොත් බොහෝ කාඩ්පත් මිලදී ගැනීම්වලට පොලී රහිත කාලයක් දෙයි. ඔබේ කාඩ්පතේ කොන්දේසි පරීක්ෂා කරන්න.", ta: "முழு அறிக்கை நிலுவையை சரியான நேரத்தில் செலுத்தினால் பெரும்பாலான அட்டைகள் கொள்முதலுக்கு வட்டியில்லாக் காலம் தருகின்றன. உங்கள் அட்டையின் நிபந்தனைகளைப் பாருங்கள்." },
        },
        {
          id: "q3",
          type: "scenario",
          prompt: { en: "Ruwan's card is near its limit and he only pays the minimum. What's the best first step?", si: "රුවන්ගේ කාඩ්පත සීමාවට ආසන්නයි, ඔහු ගෙවන්නේ අවම ප්‍රමාණය පමණයි. හොඳම පළමු පියවර කුමක්ද?", ta: "ருவனின் அட்டை வரம்பை நெருங்குகிறது, அவர் குறைந்தபட்சத்தை மட்டும் செலுத்துகிறார். சிறந்த முதல் படி எது?" },
          options: [
            { id: "a", text: { en: "Stop using the card and pay a fixed higher amount each month", si: "කාඩ්පත භාවිතය නවතා සෑම මසකම ස්ථාවර වැඩි මුදලක් ගෙවීම", ta: "அட்டையைப் பயன்படுத்துவதை நிறுத்தி, மாதந்தோறும் நிலையான அதிகத் தொகை செலுத்துதல்" } },
            { id: "b", text: { en: "Apply for a second card", si: "දෙවන කාඩ්පතකට අයදුම් කිරීම", ta: "இரண்டாவது அட்டைக்கு விண்ணப்பித்தல்" } },
            { id: "c", text: { en: "Withdraw cash to pay the bill", si: "බිල ගෙවීමට මුදල් ආපසු ගැනීම", ta: "கட்டணம் செலுத்தப் பணம் எடுத்தல்" } },
          ],
          correctId: "a",
          explanation: { en: "Stopping new spending and paying more than the minimum cuts the balance and the interest.", si: "නව වියදම් නවතා අවමයට වඩා ගෙවීමෙන් ශේෂය සහ පොලිය අඩු වේ.", ta: "புதிய செலவுகளை நிறுத்தி குறைந்தபட்சத்தை விட அதிகம் செலுத்தினால் நிலுவையும் வட்டியும் குறையும்." },
        },
      ],
      sources: [SOURCES.cbslFinLit, SOURCES.sakasuru],
      lastReviewed: REVIEWED,
      nextReview: NEXT_REVIEW,
    },
    {
      slug: "loans-and-interest",
      title: { en: "How loans and interest work", si: "ණය සහ පොලිය ක්‍රියා කරන ආකාරය", ta: "கடன்களும் வட்டியும் எப்படி வேலை செய்கின்றன" },
      summary: {
        en: "Instalments, total interest, and what to check before borrowing.",
        si: "වාරික, මුළු පොලිය සහ ණය ගැනීමට පෙර පරීක්ෂා කළ යුතු දේ.",
        ta: "தவணைகள், மொத்த வட்டி, கடன் வாங்கும் முன் சரிபார்க்க வேண்டியவை.",
      },
      minutes: 5,
      xp: 30,
      tags: ["loans", "debt", "interest"],
      cards: [
        {
          type: "concept",
          title: { en: "Borrowing has a price", si: "ණය ගැනීමට මිලක් ඇත", ta: "கடன் வாங்குவதற்கு விலை உண்டு" },
          body: {
            en: "Interest is the price of borrowing. You repay the amount borrowed (principal) plus interest, usually in monthly instalments.",
            si: "පොලිය යනු ණය ගැනීමේ මිලයි. ඔබ ණයට ගත් මුදල (මූලික මුදල) සහ පොලිය, සාමාන්‍යයෙන් මාසික වාරිකවලින් ආපසු ගෙවනවා.",
            ta: "வட்டி என்பது கடன் வாங்குவதன் விலை. கடன் வாங்கிய தொகையை (அசல்) வட்டியுடன், பொதுவாக மாதத் தவணைகளில் திருப்பிச் செலுத்துகிறீர்கள்.",
          },
        },
        {
          type: "example",
          title: { en: "A Rs. 500,000 personal loan", si: "රු. 500,000 පුද්ගලික ණයක්", ta: "ரூ. 500,000 தனிநபர் கடன்" },
          body: {
            en: "Example only: at 15% a year over 2 years, the instalment is about Rs. 24,240 and total interest about Rs. 81,800. Over 5 years the instalment drops to about Rs. 11,900 — but total interest rises to about Rs. 213,700. Longer is easier monthly, but costs more overall.",
            si: "උදාහරණයක් පමණි: වසරකට 15% පොලියට වසර 2කට වාරිකය රු. 24,240ක් පමණ වන අතර මුළු පොලිය රු. 81,800ක් පමණ. වසර 5කට වාරිකය රු. 11,900ක් පමණ දක්වා අඩු වෙනවා — නමුත් මුළු පොලිය රු. 213,700ක් පමණ දක්වා වැඩි වෙනවා. දිගු කාලය මාසිකව පහසු වුවත් සමස්තයක් ලෙස මිල අධිකයි.",
            ta: "உதாரணம் மட்டும்: ஆண்டுக்கு 15% வட்டியில் 2 ஆண்டுகளுக்குத் தவணை சுமார் ரூ. 24,240, மொத்த வட்டி சுமார் ரூ. 81,800. 5 ஆண்டுகளுக்குத் தவணை சுமார் ரூ. 11,900 ஆகக் குறையும் — ஆனால் மொத்த வட்டி சுமார் ரூ. 213,700 ஆக உயரும். நீண்ட காலம் மாதந்தோறும் எளிது, ஆனால் மொத்தத்தில் அதிகச் செலவு.",
          },
        },
        {
          type: "tip",
          title: { en: "Before you sign", si: "අත්සන් කිරීමට පෙර", ta: "கையெழுத்திடும் முன்" },
          body: {
            en: "Ask for: the annual interest rate, all fees, the total amount you will repay, and the penalty for early or late payment. Compare at least two licensed lenders. Keep instalments affordable — many people keep total debt payments well under a third of income.",
            si: "ඉල්ලන්න: වාර්ෂික පොලී අනුපාතය, සියලු ගාස්තු, ආපසු ගෙවන මුළු මුදල සහ කලින් හෝ ප්‍රමාද ගෙවීම් සඳහා දඩ. අවම වශයෙන් බලපත්‍රලාභී ණය දෙන්නන් දෙදෙනෙකු සසඳන්න. වාරික දැරිය හැකි මට්ටමේ තබන්න.",
            ta: "கேளுங்கள்: ஆண்டு வட்டி விகிதம், அனைத்துக் கட்டணங்கள், திருப்பிச் செலுத்தும் மொத்தத் தொகை, முன்கூட்டிய அல்லது தாமதக் கட்டணத்துக்கான அபராதம். குறைந்தது இரண்டு உரிமம் பெற்ற கடன் வழங்குநர்களை ஒப்பிடுங்கள். தவணைகளைத் தாங்கக்கூடியதாக வையுங்கள்.",
          },
        },
        {
          type: "warning",
          title: { en: "Watch out for informal lenders", si: "අවිධිමත් ණය දෙන්නන් ගැන සැලකිලිමත් වන්න", ta: "முறைசாரா கடன் வழங்குநர்களிடம் கவனம்" },
          body: {
            en: "Unregistered money lenders and 'instant loan' apps can charge extremely high interest and use harassment. Check whether a lender is licensed with the Central Bank before borrowing.",
            si: "ලියාපදිංචි නොවූ පොලී මුදලාලිලා සහ 'ක්ෂණික ණය' ඇප් ඉතා ඉහළ පොලී අය කර හිරිහැර කළ හැකියි. ණය ගැනීමට පෙර ණය දෙන්නා මහ බැංකුවේ බලපත්‍රලාභීදැයි පරීක්ෂා කරන්න.",
            ta: "பதிவு செய்யப்படாத கடன் கொடுப்பவர்களும் 'உடனடிக் கடன்' செயலிகளும் மிக அதிக வட்டி வசூலித்துத் தொந்தரவு செய்யலாம். கடன் வாங்கும் முன் கடன் வழங்குநர் மத்திய வங்கியில் உரிமம் பெற்றவரா என்று சரிபாருங்கள்.",
          },
        },
      ],
      quiz: [
        {
          id: "q1",
          type: "mcq",
          prompt: { en: "Choosing a longer loan term usually means…", si: "දිගු ණය කාලයක් තෝරා ගැනීම සාමාන්‍යයෙන් අදහස් කරන්නේ…", ta: "நீண்ட கடன் காலத்தைத் தேர்ந்தெடுப்பது பொதுவாக…" },
          options: [
            { id: "a", text: { en: "Lower instalments, more total interest", si: "අඩු වාරික, වැඩි මුළු පොලිය", ta: "குறைந்த தவணை, அதிக மொத்த வட்டி" } },
            { id: "b", text: { en: "Higher instalments, less interest", si: "වැඩි වාරික, අඩු පොලිය", ta: "அதிகத் தவணை, குறைந்த வட்டி" } },
            { id: "c", text: { en: "No difference", si: "වෙනසක් නැහැ", ta: "வேறுபாடு இல்லை" } },
          ],
          correctId: "a",
          explanation: { en: "Spreading repayment over more months lowers each instalment, but you pay interest for longer.", si: "වැඩි මාස ගණනකට ගෙවීම බෙදීමෙන් එක් එක් වාරිකය අඩු වුවත්, වැඩි කාලයක් පොලිය ගෙවිය යුතුයි.", ta: "அதிக மாதங்களுக்குப் பரப்பினால் ஒவ்வொரு தவணையும் குறையும், ஆனால் நீண்ட காலம் வட்டி செலுத்துவீர்கள்." },
        },
        {
          id: "q2",
          type: "mcq",
          prompt: { en: "What is the 'principal' of a loan?", si: "ණයක 'මූලික මුදල' යනු කුමක්ද?", ta: "கடனின் 'அசல்' என்றால் என்ன?" },
          options: [
            { id: "a", text: { en: "The interest charged", si: "අය කරන පොලිය", ta: "வசூலிக்கப்படும் வட்டி" } },
            { id: "b", text: { en: "The amount originally borrowed", si: "මුලින් ණයට ගත් මුදල", ta: "முதலில் கடன் வாங்கிய தொகை" } },
            { id: "c", text: { en: "The late fee", si: "ප්‍රමාද ගාස්තුව", ta: "தாமதக் கட்டணம்" } },
          ],
          correctId: "b",
          explanation: { en: "Principal is the borrowed amount. Interest is charged on top of it.", si: "මූලික මුදල යනු ණයට ගත් මුදලයි. පොලිය ඊට අමතරව අය වේ.", ta: "அசல் என்பது கடன் வாங்கிய தொகை. அதன் மேல் வட்டி வசூலிக்கப்படும்." },
        },
        {
          id: "q3",
          type: "truefalse",
          prompt: { en: "It's wise to check that a lender is licensed before borrowing.", si: "ණය ගැනීමට පෙර ණය දෙන්නා බලපත්‍රලාභීදැයි පරීක්ෂා කිරීම නුවණට හුරුයි.", ta: "கடன் வாங்கும் முன் கடன் வழங்குநர் உரிமம் பெற்றவரா என்று சரிபார்ப்பது புத்திசாலித்தனம்." },
          options: TF,
          correctId: "t",
          explanation: { en: "Licensed lenders are supervised and must follow consumer-protection rules.", si: "බලපත්‍රලාභී ණය දෙන්නන් අධීක්ෂණය කරන අතර පාරිභෝගික ආරක්ෂණ නීති අනුගමනය කළ යුතුයි.", ta: "உரிமம் பெற்ற கடன் வழங்குநர்கள் மேற்பார்வையிடப்படுகிறார்கள், நுகர்வோர் பாதுகாப்பு விதிகளைப் பின்பற்ற வேண்டும்." },
        },
      ],
      sources: [SOURCES.cbsl, SOURCES.sakasuru],
      lastReviewed: REVIEWED,
      nextReview: NEXT_REVIEW,
    },
  ],
};
