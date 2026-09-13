/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  IMAGE REGISTRY
 * ─────────────────────────────────────────────────────────────────────────────
 *  Every image the store uses is declared once, here.
 *
 *  To ship real photography:
 *    1. Drop the file into `public/images/` using the `expectedFile` name.
 *    2. Change `src` from the `.svg` placeholder to that file.
 *  Dimensions must stay as declared — they reserve layout space so nothing
 *  shifts while images load.
 *
 *  Every photo must show the Q30 Aimo Mini itself. Do not substitute a
 *  different printer model.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type MediaSlot = {
  /** Path served from /public. */
  src: string;
  width: number;
  height: number;
  /** Filename to use once real photography is available. */
  expectedFile: string;
  /** Key under `media` in the locale files, resolved to a translated alt text. */
  altKey: string;
  /** What the shot should contain. Brief kept for the photographer. */
  brief: string;
};

const placeholder = (name: string) => `/images/${name}.svg`;

export const media = {
  hero: {
    src: placeholder("hero-q30"),
    width: 1200,
    height: 1200,
    expectedFile: "hero-q30.webp",
    altKey: "hero",
    brief:
      "Q30 Aimo Mini beside a phone showing the label app, with freshly labelled kitchen jars and a drawer organiser in frame.",
  },
  step1: {
    src: placeholder("step-1-type"),
    width: 900,
    height: 700,
    expectedFile: "step-1-type.webp",
    altKey: "step1",
    brief: "Hands typing a label in the phone app, printer resting on the desk.",
  },
  step2: {
    src: placeholder("step-2-design"),
    width: 900,
    height: 700,
    expectedFile: "step-2-design.webp",
    altKey: "step2",
    brief: "Phone screen showing the layout/template picker of the label app.",
  },
  step3: {
    src: placeholder("step-3-print"),
    width: 900,
    height: 700,
    expectedFile: "step-3-print.webp",
    altKey: "step3",
    brief: "Label emerging from the Q30 and being pressed onto a storage box.",
  },
  useKitchen: {
    src: placeholder("use-kitchen"),
    width: 800,
    height: 800,
    expectedFile: "use-kitchen.webp",
    altKey: "useKitchen",
    brief: "Labelled spice and pantry jars on a clean kitchen shelf.",
  },
  useKids: {
    src: placeholder("use-kids"),
    width: 800,
    height: 800,
    expectedFile: "use-kids.webp",
    altKey: "useKids",
    brief: "Toy bins and a wardrobe drawer in a child's room, each with a label.",
  },
  useStudy: {
    src: placeholder("use-study"),
    width: 800,
    height: 800,
    expectedFile: "use-study.webp",
    altKey: "useStudy",
    brief: "Notebooks, folders and pencil cases labelled by subject.",
  },
  useOffice: {
    src: placeholder("use-office"),
    width: 800,
    height: 800,
    expectedFile: "use-office.webp",
    altKey: "useOffice",
    brief: "Cable ties, file boxes and desk drawers labelled in an office.",
  },
  usePackaging: {
    src: placeholder("use-packaging"),
    width: 800,
    height: 800,
    expectedFile: "use-packaging.webp",
    altKey: "usePackaging",
    brief: "Home-business parcels sealed with branded labels, ready to ship.",
  },
  useGifts: {
    src: placeholder("use-gifts"),
    width: 800,
    height: 800,
    expectedFile: "use-gifts.webp",
    altKey: "useGifts",
    brief: "Gift boxes with small printed name tags.",
  },
  gallery1: {
    src: placeholder("gallery-1-front"),
    width: 1000,
    height: 1000,
    expectedFile: "gallery-1-front.webp",
    altKey: "gallery1",
    brief: "Q30 front view on a plain background.",
  },
  gallery2: {
    src: placeholder("gallery-2-hand"),
    width: 1000,
    height: 1000,
    expectedFile: "gallery-2-hand.webp",
    altKey: "gallery2",
    brief: "Q30 held in one hand, showing how small it is.",
  },
  gallery3: {
    src: placeholder("gallery-3-roll"),
    width: 1000,
    height: 1000,
    expectedFile: "gallery-3-roll.webp",
    altKey: "gallery3",
    brief: "Open printer with a 15 mm label roll seated inside.",
  },
  gallery4: {
    src: placeholder("gallery-4-app"),
    width: 1000,
    height: 1000,
    expectedFile: "gallery-4-app.webp",
    altKey: "gallery4",
    brief: "Printer next to a phone running the companion app.",
  },
  gallery5: {
    src: placeholder("gallery-5-labels"),
    width: 1000,
    height: 1000,
    expectedFile: "gallery-5-labels.webp",
    altKey: "gallery5",
    brief: "Close-up of finished labels applied to jars, folders and parcels.",
  },
  before: {
    src: placeholder("before-clutter"),
    width: 900,
    height: 700,
    expectedFile: "before-clutter.webp",
    altKey: "before",
    brief: "Unlabelled containers, a messy drawer and a plain parcel.",
  },
  after: {
    src: placeholder("after-order"),
    width: 900,
    height: 700,
    expectedFile: "after-order.webp",
    altKey: "after",
    brief: "The same containers, drawer and parcel, now labelled and tidy.",
  },
  offerSingle: {
    src: placeholder("offer-single"),
    width: 700,
    height: 700,
    expectedFile: "offer-single.webp",
    altKey: "offerSingle",
    brief: "One Q30 with a trial label roll.",
  },
  offerBundle: {
    src: placeholder("offer-bundle"),
    width: 700,
    height: 700,
    expectedFile: "offer-bundle.webp",
    altKey: "offerBundle",
    brief: "Two Q30 printers side by side with their label rolls.",
  },
  ogImage: {
    src: placeholder("og-share"),
    width: 1200,
    height: 630,
    expectedFile: "og-share.jpg",
    altKey: "ogImage",
    brief: "Wide social-share image: Q30, phone and labelled jars with the wordmark.",
  },
} as const satisfies Record<string, MediaSlot>;

export type MediaKey = keyof typeof media;

export const galleryKeys = [
  "gallery1",
  "gallery2",
  "gallery3",
  "gallery4",
  "gallery5",
] as const satisfies readonly MediaKey[];

/** Cart line thumbnail, per offer. */
export const offerImage: Record<string, MediaSlot> = {
  single: media.offerSingle,
  bundle: media.offerBundle,
};
