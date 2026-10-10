/**
 * Rule-based scam warning-sign detector (English, Sinhala, Tamil).
 * It can only point out common warning signs; it can NEVER confirm that a
 * message is legitimate. The UI always tells users to verify through
 * official channels (their bank's hotline, CBSL, police).
 */

export type ScamRisk = "low" | "suspicious" | "high";

export interface ScamSignal {
  key: string;
  weight: number;
  /** matched snippet from the message, for highlighting */
  match: string;
}

export interface ScamCheckResult {
  risk: ScamRisk;
  score: number;
  signals: ScamSignal[];
}

interface Rule {
  key: string;
  weight: number;
  patterns: RegExp[];
}

const RULES: Rule[] = [
  {
    key: "otpRequest",
    weight: 5,
    patterns: [/\b(otp|one[- ]time (pass)?code|pin|cvv|cvc)\b/i, /ඕටීපී|රහස් අංකය|OTP අංකය/, /ஒருமுறை கடவுச்சொல்|ஓடிபி|பின் எண்/],
  },
  {
    key: "bankDetails",
    weight: 4,
    patterns: [/\b(bank (account )?details|account number|card number|password|login details|internet banking)\b/i, /බැංකු (ගිණුම් )?විස්තර|ගිණුම් අංකය|කාඩ් අංකය|මුරපදය/, /வங்கி (கணக்கு )?விவரங்கள்|கணக்கு எண்|அட்டை எண்|கடவுச்சொல்/],
  },
  {
    key: "guaranteedReturns",
    weight: 4,
    patterns: [/guarantee[d]?\s+(\d+%|returns?|profit|income)/i, /(zero|no)\s+risk/i, /risk[- ]free/i, /සහතික (ලාභ|ප්‍රතිලාභ)|අවදානමක් නැති|අවදානම් රහිත/, /உத்தரவாத (லாபம்|வருமானம்)|ஆபத்து இல்லாத/],
  },
  {
    key: "unrealisticReturns",
    weight: 4,
    patterns: [/\d{1,3}\s?%\s*(per|a|every|each)?\s*(day|daily|week|weekly|month|monthly)/i, /double your (money|investment)/i, /මාසයකට\s*\d+\s?%|දිනකට\s*\d+\s?%|මුදල් දෙගුණ/, /மாதம்\s*\d+\s?%|தினமும்\s*\d+\s?%|இரட்டிப்பு/],
  },
  {
    key: "prizeOrLottery",
    weight: 3,
    patterns: [/\b(congratulations|you('ve| have)? won|winner|lucky draw|lottery|prize|jackpot)\b/i, /සුබ පැතුම්|ඔබ දිනා|ත්‍යාගය|ලොතරැයි|ජයග්‍රාහකයා/, /வாழ்த்துக்கள்|நீங்கள் வென்றீர்கள்|பரிசு|லாட்டரி/],
  },
  {
    key: "upfrontFee",
    weight: 4,
    patterns: [/(pay|send|deposit|transfer)\s+(a\s+)?(small\s+)?(fee|tax|charge|deposit|processing|registration)/i, /(fee|charge|tax)\s+to\s+(release|unlock|claim|receive)/i, /ගාස්තුවක් (ගෙවන්න|යවන්න)|ලියාපදිංචි ගාස්තු/, /கட்டணம் (செலுத்த|அனுப்ப)|பதிவு கட்டணம்/],
  },
  {
    key: "urgency",
    weight: 2,
    patterns: [/\b(urgent(ly)?|immediately|act now|within \d+ (minutes|hours)|last chance|today only|expires? (today|soon))\b/i, /හදිසි|වහාම|අද පමණයි|අවසන් අවස්ථාව/, /அவசரம்|உடனடியாக|இன்று மட்டும்|கடைசி வாய்ப்பு/],
  },
  {
    key: "threat",
    weight: 3,
    patterns: [/(account|card|sim)\s+(will be\s+)?(blocked|suspended|closed|deactivated)/i, /legal action|arrest/i, /ගිණුම (අවහිර|අත්හිටුවනු)|නීතිමය ක්‍රියාමාර්ග/, /கணக்கு (முடக்கப்|தடுக்கப்)|சட்ட நடவடிக்கை/],
  },
  {
    key: "suspiciousLink",
    weight: 3,
    patterns: [/\b(bit\.ly|tinyurl|t\.co|cutt\.ly|is\.gd|rb\.gy|shorturl)\b/i, /https?:\/\/\S*(\d{1,3}\.){3}\d{1,3}/i, /https?:\/\/\S*(-verify|-secure|-login|-update)\S*/i],
  },
  {
    key: "recruitOthers",
    weight: 3,
    patterns: [/(refer|recruit|invite|bring)\s+(\d+\s+)?(friends|people|members)\s+(to\s+)?(earn|get|receive)/i, /pyramid|network marketing scheme/i, /සාමාජිකයින් (ගෙන්වන්න|එකතු)|යාලුවන් එකතු කර/, /உறுப்பினர்களை சேர்த்து|நண்பர்களை சேர்/],
  },
  {
    key: "cryptoPressure",
    weight: 2,
    patterns: [/\b(crypto|bitcoin|usdt|forex signals?|trading bot|binary option)\b/i, /ක්‍රිප්ටෝ|බිට්කොයින්/, /கிரிப்டோ|பிட்காயின்/],
  },
  {
    key: "secrecy",
    weight: 2,
    patterns: [/(don'?t|do not) (tell|share with) (anyone|your bank|family)/i, /keep (this )?(secret|confidential)/i, /කාටවත් කියන්න එපා|රහසිගතව තබා/, /யாரிடமும் சொல்ல வேண்டாம்|ரகசியமாக/],
  },
  {
    key: "impersonation",
    weight: 2,
    patterns: [/\b(central bank|cbsl|customer care|bank officer|security team|inland revenue|police)\b/i, /මහ බැංකුව|පාරිභෝගික සේවා|බැංකු නිලධාරී/, /மத்திய வங்கி|வாடிக்கையாளர் சேவை|வங்கி அதிகாரி/],
  },
  {
    key: "advanceLoan",
    weight: 3,
    patterns: [/loan approved.*(fee|pay)/i, /(instant|guaranteed) loan.*(no documents|without documents|no credit check)/i, /ණය අනුමතයි|ලේඛන නැතිව ණය/, /கடன் அங்கீகரிக்கப்பட்டது|ஆவணங்கள் இல்லாமல் கடன்/],
  },
];

export function checkScamMessage(text: string): ScamCheckResult {
  const signals: ScamSignal[] = [];
  const normalized = text.normalize("NFC").slice(0, 5000);
  for (const rule of RULES) {
    for (const p of rule.patterns) {
      const m = normalized.match(p);
      if (m) {
        signals.push({ key: rule.key, weight: rule.weight, match: m[0] });
        break;
      }
    }
  }
  const score = signals.reduce((a, s) => a + s.weight, 0);
  // Asking for OTP/PIN or bank credentials is high risk on its own.
  const critical = signals.some((s) => s.key === "otpRequest" || (s.key === "bankDetails" && score >= 6));
  const risk: ScamRisk = critical || score >= 7 ? "high" : score >= 3 ? "suspicious" : "low";
  return { risk, score, signals: signals.sort((a, b) => b.weight - a.weight) };
}

export const SCAM_SIGNAL_KEYS = RULES.map((r) => r.key);
