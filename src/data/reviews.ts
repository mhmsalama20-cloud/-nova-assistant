/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CUSTOMER REVIEWS
 * ─────────────────────────────────────────────────────────────────────────────
 *  `realReviews` is what the published store renders. It is empty until you
 *  have genuine, verified reviews to put in it — no invented social proof
 *  ships to shoppers.
 *
 *  `sampleReviews` exists only so the section's design can be reviewed during
 *  development. It is rendered behind `showSampleContent` (dev builds, or an
 *  explicit NEXT_PUBLIC_SHOW_SAMPLE_CONTENT=true) and is always marked on
 *  screen as sample data.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Locale } from "@/i18n/config";

export type Review = {
  id: string;
  /** Display name exactly as the customer allowed you to publish it. */
  author: string;
  /** 1–5. Only fill this in from a real, verifiable rating. */
  rating: 1 | 2 | 3 | 4 | 5;
  /** Review body per language. Show the original and translate as needed. */
  body: Partial<Record<Locale, string>> & { [K in Locale]?: string };
  /** Locale the review was originally written in. */
  sourceLocale: Locale;
  verifiedPurchase: boolean;
};

/** ── Real reviews go here. Leave empty until you have them. ── */
export const realReviews: Review[] = [];

/** ── Development-only placeholders. Never treated as real. ── */
export const sampleReviews: Review[] = [
  {
    id: "sample-1",
    author: "—",
    rating: 5,
    sourceLocale: "ar",
    verifiedPurchase: true,
    body: {
      ar: "مثال لنص تقييم داخل بيئة التطوير: يوضح شكل البطاقة وطول النص المتوقع من عميل حقيقي.",
      en: "Sample review text for development: it shows the card layout and the length of text to expect from a real customer.",
      tr: "Geliştirme ortamı için örnek yorum metni: kart düzenini ve gerçek bir müşteriden beklenecek metin uzunluğunu gösterir.",
      he: "טקסט חוות דעת לדוגמה לסביבת פיתוח: מדגים את מבנה הכרטיס ואת אורך הטקסט הצפוי מלקוח אמיתי.",
    },
  },
  {
    id: "sample-2",
    author: "—",
    rating: 4,
    sourceLocale: "en",
    verifiedPurchase: true,
    body: {
      ar: "مثال ثانٍ لنص تقييم داخل بيئة التطوير، أقصر من الأول لاختبار تفاوت أطوال البطاقات.",
      en: "A second sample review for development, shorter than the first so the cards can be checked at different lengths.",
      tr: "Geliştirme için ikinci bir örnek yorum; kartların farklı uzunluklarda nasıl durduğunu görmek için ilkinden kısa.",
      he: "חוות דעת שנייה לדוגמה לפיתוח, קצרה מהראשונה כדי לבדוק כרטיסים באורכים שונים.",
    },
  },
  {
    id: "sample-3",
    author: "—",
    rating: 5,
    sourceLocale: "he",
    verifiedPurchase: false,
    body: {
      ar: "مثال ثالث لنص تقييم داخل بيئة التطوير، لعرض بطاقة من دون وسم عملية شراء موثّقة.",
      en: "A third sample review for development, showing a card without the verified-purchase mark.",
      tr: "Geliştirme için üçüncü bir örnek yorum; doğrulanmış satın alma etiketi olmayan bir kartı gösterir.",
      he: "חוות דעת שלישית לדוגמה לפיתוח, שמציגה כרטיס בלי סימון רכישה מאומתת.",
    },
  },
];
