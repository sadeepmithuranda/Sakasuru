/**
 * Expense and income categories localised for Sri Lankan life.
 * `kind` is the default needs/wants suggestion — users can always override it.
 */
export type NeedWant = "need" | "want" | "saving";

export interface CategoryDef {
  key: string;
  group: string;
  icon: string;
  kind: NeedWant;
  /** essential for emergency-fund calculations */
  essential: boolean;
  color: string;
}

export const EXPENSE_CATEGORIES: CategoryDef[] = [
  { key: "groceries", group: "food", icon: "🍚", kind: "need", essential: true, color: "#2F855A" },
  { key: "eatingOut", group: "food", icon: "🍛", kind: "want", essential: false, color: "#48BB78" },
  { key: "foodDelivery", group: "food", icon: "🛵", kind: "want", essential: false, color: "#68D391" },
  { key: "bus", group: "transport", icon: "🚌", kind: "need", essential: true, color: "#2B6CB0" },
  { key: "train", group: "transport", icon: "🚆", kind: "need", essential: true, color: "#3182CE" },
  { key: "threeWheeler", group: "transport", icon: "🛺", kind: "need", essential: false, color: "#4299E1" },
  { key: "fuel", group: "transport", icon: "⛽", kind: "need", essential: true, color: "#63B3ED" },
  { key: "rent", group: "housing", icon: "🏠", kind: "need", essential: true, color: "#9C4221" },
  { key: "boarding", group: "housing", icon: "🛏️", kind: "need", essential: true, color: "#C05621" },
  { key: "electricity", group: "utilities", icon: "💡", kind: "need", essential: true, color: "#B7791F" },
  { key: "water", group: "utilities", icon: "🚰", kind: "need", essential: true, color: "#D69E2E" },
  { key: "mobileReload", group: "utilities", icon: "📱", kind: "need", essential: true, color: "#ECC94B" },
  { key: "internet", group: "utilities", icon: "🌐", kind: "need", essential: true, color: "#F6E05E" },
  { key: "tuition", group: "education", icon: "📚", kind: "need", essential: true, color: "#6B46C1" },
  { key: "university", group: "education", icon: "🎓", kind: "need", essential: true, color: "#805AD5" },
  { key: "medical", group: "healthcare", icon: "🩺", kind: "need", essential: true, color: "#C53030" },
  { key: "entertainment", group: "entertainment", icon: "🎬", kind: "want", essential: false, color: "#D53F8C" },
  { key: "shopping", group: "shopping", icon: "🛍️", kind: "want", essential: false, color: "#ED64A6" },
  { key: "loanInstalment", group: "loans", icon: "🏦", kind: "need", essential: true, color: "#4A5568" },
  { key: "leasing", group: "loans", icon: "🚗", kind: "need", essential: true, color: "#718096" },
  { key: "insurance", group: "insurance", icon: "🛡️", kind: "need", essential: true, color: "#2C7A7B" },
  { key: "subscriptions", group: "subscriptions", icon: "📺", kind: "want", essential: false, color: "#B83280" },
  { key: "familyContribution", group: "family", icon: "👨‍👩‍👧", kind: "need", essential: true, color: "#319795" },
  { key: "religiousCharity", group: "family", icon: "🪷", kind: "want", essential: false, color: "#38B2AC" },
  { key: "other", group: "other", icon: "📦", kind: "want", essential: false, color: "#A0AEC0" },
];

export const INCOME_CATEGORIES = [
  { key: "salary", icon: "💼" },
  { key: "business", icon: "🏪" },
  { key: "freelance", icon: "💻" },
  { key: "remittance", icon: "✈️" },
  { key: "allowance", icon: "🎒" },
  { key: "pension", icon: "👴" },
  { key: "rental", icon: "🏘️" },
  { key: "otherIncome", icon: "➕" },
] as const;

export const PAYMENT_METHODS = ["cash", "debitCard", "creditCard", "bankTransfer", "lankaqr", "mobileWallet", "other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const CATEGORY_GROUPS = ["food", "transport", "housing", "utilities", "education", "healthcare", "entertainment", "shopping", "loans", "insurance", "subscriptions", "family", "other"] as const;

const byKey = new Map(EXPENSE_CATEGORIES.map((c) => [c.key, c]));
export const getCategory = (key: string): CategoryDef => byKey.get(key) ?? byKey.get("other")!;

/** Default needs/wants suggestion for a category. */
export const suggestNeedWant = (categoryKey: string): NeedWant => getCategory(categoryKey).kind;
