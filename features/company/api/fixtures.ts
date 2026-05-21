import type { Locale } from "@/lib/i18n/config";

/**
 * Stub directory data. There is no public company-list endpoint
 * (`GET /api/v1/companies` requires `AUTH SELLER` and returns only the
 * caller's own companies; admin list is admin-only). Until backend exposes
 * a public list, the directory renders these typed entries. Shape mirrors
 * `CompanyShortDTO` plus a few presentation extras.
 */
export type Localized = Record<Locale, string>;

export interface DirectoryStubEntry {
  id: number;
  name: string;
  slug: string;
  logoInitials: string;
  shortDescription: Localized;
  industry: Localized;
  region: Localized;
  verified: boolean;
  /** All numeric fields are stub-only; no backend exposes them yet. */
  ratingStub: number;
  reviewsCountStub: number;
  productsCountStub: number;
}

export const STUB_COMPANIES: DirectoryStubEntry[] = [
  {
    id: 101,
    name: "UzMetal Pro",
    slug: "uzmetal-pro",
    logoInitials: "UM",
    shortDescription: {
      ru: "Ведущий производитель металлопроката в Центральной Азии. Более 20 лет на рынке.",
      en: "A leading rolled-metal producer in Central Asia. Over 20 years on the market.",
      uz: "Markaziy Osiyoning yetakchi prokat metall ishlab chiqaruvchisi. Bozorda 20 yildan ortiq.",
    },
    industry: {
      ru: "Металлургия",
      en: "Metallurgy",
      uz: "Metallurgiya",
    },
    region: {
      ru: "Ташкент",
      en: "Tashkent",
      uz: "Toshkent",
    },
    verified: true,
    ratingStub: 4.8,
    reviewsCountStub: 127,
    productsCountStub: 1500,
  },
  {
    id: 102,
    name: "Asia Steel Group",
    slug: "asia-steel-group",
    logoInitials: "AS",
    shortDescription: {
      ru: "Поставка строительной арматуры и листового проката по СНГ.",
      en: "Construction rebar and sheet rolled-metal supply across the CIS.",
      uz: "MDH bo'ylab qurilish armaturasi va listli prokat yetkazib berish.",
    },
    industry: {
      ru: "Металлургия",
      en: "Metallurgy",
      uz: "Metallurgiya",
    },
    region: {
      ru: "Ташкент",
      en: "Tashkent",
      uz: "Toshkent",
    },
    verified: true,
    ratingStub: 4.6,
    reviewsCountStub: 84,
    productsCountStub: 612,
  },
  {
    id: 103,
    name: "Metal Trade LLC",
    slug: "metal-trade",
    logoInitials: "MT",
    shortDescription: {
      ru: "Оцинкованный лист, профильная труба, нержавеющая сталь.",
      en: "Galvanised sheet, profile pipe and stainless steel.",
      uz: "Sinklangan list, profil quvur va zanglamaydigan po'lat.",
    },
    industry: {
      ru: "Металлургия",
      en: "Metallurgy",
      uz: "Metallurgiya",
    },
    region: {
      ru: "Самарканд",
      en: "Samarkand",
      uz: "Samarqand",
    },
    verified: true,
    ratingStub: 4.5,
    reviewsCountStub: 96,
    productsCountStub: 430,
  },
  {
    id: 104,
    name: "BuildKaz LLP",
    slug: "buildkaz",
    logoInitials: "BK",
    shortDescription: {
      ru: "Строительные материалы оптом — кирпич, бетон, сухие смеси.",
      en: "Wholesale construction materials — brick, concrete, dry mixes.",
      uz: "Ulgurji qurilish materiallari — g'isht, beton, quruq aralashmalar.",
    },
    industry: {
      ru: "Строительство",
      en: "Construction",
      uz: "Qurilish",
    },
    region: {
      ru: "Бухара",
      en: "Bukhara",
      uz: "Buxoro",
    },
    verified: true,
    ratingStub: 4.4,
    reviewsCountStub: 53,
    productsCountStub: 248,
  },
  {
    id: 105,
    name: "Алтын Цемент",
    slug: "altyn-cement",
    logoInitials: "АЦ",
    shortDescription: {
      ru: "Цемент М400 / М500 и сухие строительные смеси с доставкой.",
      en: "M400 / M500 cement and dry construction mixes with delivery.",
      uz: "M400 / M500 sement va quruq qurilish aralashmalari yetkazib berish bilan.",
    },
    industry: {
      ru: "Строительство",
      en: "Construction",
      uz: "Qurilish",
    },
    region: {
      ru: "Ташкент",
      en: "Tashkent",
      uz: "Toshkent",
    },
    verified: true,
    ratingStub: 4.7,
    reviewsCountStub: 142,
    productsCountStub: 84,
  },
  {
    id: 106,
    name: "Tashkent Plast",
    slug: "tashkent-plast",
    logoInitials: "TP",
    shortDescription: {
      ru: "Полимерная продукция: трубы ПНД, плёнка, упаковка для бизнеса.",
      en: "Polymer products: HDPE pipes, film and packaging for business.",
      uz: "Polimer mahsulotlari: HDPE quvurlar, plyonka, biznes uchun qadoqlash.",
    },
    industry: {
      ru: "Полимеры",
      en: "Polymers",
      uz: "Polimerlar",
    },
    region: {
      ru: "Ташкент",
      en: "Tashkent",
      uz: "Toshkent",
    },
    verified: false,
    ratingStub: 4.2,
    reviewsCountStub: 31,
    productsCountStub: 180,
  },
  {
    id: 107,
    name: "Fergana Textile",
    slug: "fergana-textile",
    logoInitials: "FT",
    shortDescription: {
      ru: "Хлопковые ткани, спецодежда, домашний текстиль собственного производства.",
      en: "Cotton fabrics, workwear and home textiles of own production.",
      uz: "Paxtali matolar, maxsus kiyim, o'z ishlab chiqarishimizdagi uy to'qimachiligi.",
    },
    industry: {
      ru: "Текстиль",
      en: "Textile",
      uz: "To'qimachilik",
    },
    region: {
      ru: "Фергана",
      en: "Fergana",
      uz: "Farg'ona",
    },
    verified: true,
    ratingStub: 4.6,
    reviewsCountStub: 67,
    productsCountStub: 312,
  },
  {
    id: 108,
    name: "Namangan Wood",
    slug: "namangan-wood",
    logoInitials: "NW",
    shortDescription: {
      ru: "Деревообработка: пиломатериалы, OSB, мебельный щит.",
      en: "Wood processing: lumber, OSB and furniture board.",
      uz: "Yog'ochga ishlov berish: yog'och materiallari, OSB va mebel paneli.",
    },
    industry: {
      ru: "Деревообработка",
      en: "Woodworking",
      uz: "Yog'och ishlash",
    },
    region: {
      ru: "Наманган",
      en: "Namangan",
      uz: "Namangan",
    },
    verified: false,
    ratingStub: 4.0,
    reviewsCountStub: 22,
    productsCountStub: 96,
  },
  {
    id: 109,
    name: "Andijan Glass",
    slug: "andijan-glass",
    logoInitials: "AG",
    shortDescription: {
      ru: "Производство листового и закалённого стекла для строительства.",
      en: "Sheet and tempered glass manufacturing for construction.",
      uz: "Qurilish uchun listli va chiniqtirilgan oyna ishlab chiqarish.",
    },
    industry: {
      ru: "Стройматериалы",
      en: "Building materials",
      uz: "Qurilish materiallari",
    },
    region: {
      ru: "Андижан",
      en: "Andijan",
      uz: "Andijon",
    },
    verified: true,
    ratingStub: 4.5,
    reviewsCountStub: 41,
    productsCountStub: 124,
  },
];

/**
 * Filter against name + localized description/industry/region. Trim +
 * case-insensitive, matches across every locale so search works regardless
 * of the active UI language.
 */
export function filterStubCompanies(
  query: string,
): DirectoryStubEntry[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return STUB_COMPANIES;
  return STUB_COMPANIES.filter((entry) => {
    const haystacks = [
      entry.name,
      ...Object.values(entry.shortDescription),
      ...Object.values(entry.industry),
      ...Object.values(entry.region),
    ];
    return haystacks.some((s) => s.toLowerCase().includes(trimmed));
  });
}
