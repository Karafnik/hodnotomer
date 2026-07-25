import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Building2,
  TrendingUp,
  ShieldAlert,
  History,
  ChevronDown,
  User,
  Mail,
  Info,
  Save,
  Trash2,
  Gauge as GaugeIcon,
  ArrowRight,
  SlidersHorizontal,
  Globe2,
  Network,
  Contact,
  ChevronLeft,
  Check,
  Pencil,
  Home,
  Phone,
  Download,
  Calendar,
} from "lucide-react";
import { storage } from "./lib/storage";

/* ============================================================
   FONTY A ZÁKLADNÉ TOKENY
   ============================================================ */
const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,900&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

const COLORS = {
  ink: "#182449",
  inkSoft: "#64748B",
  paper: "#F8FAFC",
  paperDeep: "#EEF2F9",
  line: "#DEE4EF",
  brass: "#D9A441",
  brassDeep: "#A8781F",
  teal: "#0EA37E",
  tealDeep: "#0A7A5F",
  red: "#E15A50",
};

/* ============================================================
   ODVETVIA A ORIENTAČNÉ NÁSOBKY (ilustratívne, demo hodnoty)
   ============================================================ */
const INDUSTRIES = {
  retail: { label: "Maloobchod", low: 2.5, high: 3.5 },
  wholesale: { label: "Veľkoobchod a distribúcia", low: 3, high: 4 },
  manufacturing: { label: "Výroba", low: 3.5, high: 5 },
  construction: { label: "Stavebníctvo", low: 2.5, high: 3.5 },
  horeca: { label: "Gastro a ubytovanie", low: 2, high: 3 },
  it: { label: "IT a softvérové služby", low: 4, high: 6 },
  services: { label: "Remeselné a osobné služby", low: 2, high: 3 },
  transport: { label: "Doprava a logistika", low: 2.5, high: 3.5 },
  agriculture: { label: "Poľnohospodárstvo", low: 3, high: 4 },
  other: { label: "Iné odvetvie", low: 3, high: 4 },
};

const GROWTH_OPTIONS = [
  { value: "declining", label: "Klesajúce tržby" },
  { value: "stable", label: "Stabilné tržby" },
  { value: "growing", label: "Rastúce tržby" },
  { value: "rapid", label: "Rýchlo rastúce tržby" },
];

const DEPENDENCY_OPTIONS = [
  { value: "low", label: "Nízka – firma funguje aj bez majiteľa" },
  { value: "medium", label: "Stredná – majiteľ je čiastočne nahraditeľný" },
  { value: "high", label: "Vysoká – firma stojí a padá s majiteľom" },
];

const CONCENTRATION_OPTIONS = [
  { value: "diversified", label: "Rozložená – veľa menších klientov" },
  { value: "moderate", label: "Čiastočne koncentrovaná" },
  { value: "concentrated", label: "Koncentrovaná – pár kľúčových klientov" },
];

const COUNTRY_OPTIONS = [
  "Slovensko",
  "Belgicko",
  "Bulharsko",
  "Cyprus",
  "Česko",
  "Dánsko",
  "Estónsko",
  "Fínsko",
  "Francúzsko",
  "Grécko",
  "Holandsko",
  "Chorvátsko",
  "Írsko",
  "Litva",
  "Lotyšsko",
  "Luxembursko",
  "Maďarsko",
  "Malta",
  "Nemecko",
  "Poľsko",
  "Portugalsko",
  "Rakúsko",
  "Rumunsko",
  "Slovinsko",
  "Španielsko",
  "Švédsko",
  "Taliansko",
  "Iná krajina",
];

const COMPANY_TYPE_OPTIONS = [
  { value: "sro", label: "s. r. o." },
  { value: "as", label: "a. s." },
  { value: "szco", label: "Živnosť (SZČO)" },
  { value: "druzstvo", label: "Družstvo" },
  { value: "vos", label: "Verejná obchodná spoločnosť" },
  { value: "ks", label: "Komanditná spoločnosť" },
  { value: "nezisková", label: "Nezisková organizácia" },
  { value: "other", label: "Iný typ" },
];

const STRUCTURE_OPTIONS = [
  { value: "hq", label: "Materská spoločnosť / sídlo (HQ)" },
  { value: "subsidiary", label: "Pobočka / dcérska spoločnosť (Subsidiary)" },
];

// Regióny/kraje pre každú krajinu EÚ — zobrazujú sa vo wizarde dynamicky
// podľa vybranej krajiny (namiesto ručného písania mesta).
const REGIONS_BY_COUNTRY = {
  Slovensko: [
    "Bratislavský kraj",
    "Trnavský kraj",
    "Trenčiansky kraj",
    "Nitriansky kraj",
    "Žilinský kraj",
    "Banskobystrický kraj",
    "Prešovský kraj",
    "Košický kraj",
  ],
  Belgicko: ["Region Brusel-hlavné mesto", "Flámsky región", "Valónsky región"],
  Bulharsko: [
    "Severozápadný región",
    "Severný centrálny región",
    "Severovýchodný región",
    "Juhovýchodný región",
    "Juhozápadný región",
    "Južný centrálny región",
  ],
  Cyprus: ["Nikózia", "Limassol", "Larnaka", "Famagusta", "Pafos"],
  Česko: [
    "Praha",
    "Stredočeský kraj",
    "Juhočeský kraj",
    "Plzeňský kraj",
    "Karlovarský kraj",
    "Ústecký kraj",
    "Liberecký kraj",
    "Královohradecký kraj",
    "Pardubický kraj",
    "Kraj Vysočina",
    "Juhomoravský kraj",
    "Olomoucký kraj",
    "Zlínsky kraj",
    "Moravskosliezsky kraj",
  ],
  Dánsko: ["Hlavné mesto", "Sealand", "Južné Dánsko", "Stredné Jútsko", "Severné Jútsko"],
  Estónsko: [
    "Harju", "Hiiu", "Ida-Viru", "Jõgeva", "Järva", "Lääne", "Lääne-Viru",
    "Põlva", "Pärnu", "Rapla", "Saare", "Tartu", "Valga", "Viljandi", "Võru",
  ],
  Fínsko: [
    "Uusimaa", "Varsinais-Suomi", "Satakunta", "Kanta-Häme", "Pirkanmaa",
    "Päijät-Häme", "Kymenlaakso", "Etelä-Karjala", "Etelä-Savo", "Pohjois-Savo",
    "Pohjois-Karjala", "Keski-Suomi", "Etelä-Pohjanmaa", "Pohjanmaa",
    "Keski-Pohjanmaa", "Pohjois-Pohjanmaa", "Kainuu", "Laponsko", "Alandy",
  ],
  Francúzsko: [
    "Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Bretónsko",
    "Centre-Val de Loire", "Korzika", "Grand Est", "Hauts-de-France",
    "Île-de-France", "Normandia", "Nouvelle-Aquitaine", "Occitánsko",
    "Pays de la Loire", "Provence-Alpes-Côte d'Azur",
  ],
  Grécko: [
    "Attika", "Stredná Macedónia", "Kréta", "Východná Macedónia a Trácia",
    "Západná Macedónia", "Epirus", "Tesália", "Iónske ostrovy",
    "Západné Grécko", "Stredné Grécko", "Peloponéz", "Severné Egeis", "Južné Egeis",
  ],
  Holandsko: [
    "Groningen", "Frízsko", "Drenthe", "Overijssel", "Flevoland", "Gelderland",
    "Utrecht", "Severné Holandsko", "Južné Holandsko", "Zeeland",
    "Severné Brabantsko", "Limburg",
  ],
  Chorvátsko: ["Jadranské Chorvátsko", "Kontinentálne Chorvátsko"],
  Írsko: ["Leinster", "Munster", "Connacht", "Ulster (írska časť)"],
  Litva: [
    "Vilniuský kraj", "Kaunský kraj", "Klaipėdský kraj", "Šiauliaiský kraj",
    "Panevėžyský kraj", "Alytuský kraj", "Marijampolský kraj",
    "Tauragėský kraj", "Telšiaiský kraj", "Utenský kraj",
  ],
  Lotyšsko: ["Riga", "Pieriga", "Vidzeme", "Kurzeme", "Zemgale", "Latgale"],
  Luxembursko: ["Luxembourg", "Diekirch", "Grevenmacher"],
  Maďarsko: [
    "Budapešť", "Baranya", "Bács-Kiskun", "Békés", "Borsod-Abaúj-Zemplén",
    "Csongrád-Csanád", "Fejér", "Győr-Moson-Sopron", "Hajdú-Bihar", "Heves",
    "Jász-Nagykun-Szolnok", "Komárom-Esztergom", "Nógrád", "Pest", "Somogy",
    "Szabolcs-Szatmár-Bereg", "Tolna", "Vas", "Veszprém", "Zala",
  ],
  Malta: ["Malta", "Gozo"],
  Nemecko: [
    "Bádensko-Württembersko", "Bavorsko", "Berlín", "Brandenbursko", "Brémy",
    "Hamburg", "Hesensko", "Meklenbursko-Predpomoransko", "Dolné Sasko",
    "Severné Porýnie-Vestfálsko", "Porýnie-Falcko", "Sársko", "Sasko",
    "Sasko-Anhaltsko", "Šlezvicko-Holštajnsko", "Durínsko",
  ],
  Poľsko: [
    "Dolnosliezske", "Kujavsko-pomoranské", "Lublinské", "Lubušské",
    "Lodžské", "Malopoľské", "Mazovské", "Opolské", "Podkarpatské",
    "Podleské", "Pomoranské", "Sliezske", "Svätokrížske",
    "Varmsko-mazurské", "Veľkopoľské", "Západopomoranské",
  ],
  Portugalsko: [
    "Sever", "Stred", "Metropolitná oblasť Lisabon", "Alentejo", "Algarve",
    "Azory", "Madeira",
  ],
  Rakúsko: [
    "Burgenland", "Korutánsko", "Dolné Rakúsko", "Horné Rakúsko",
    "Salzbursko", "Štajersko", "Tirolsko", "Vorarlbersko", "Viedeň",
  ],
  Rumunsko: [
    "Severozápad", "Stred", "Severovýchod", "Juhovýchod", "Juh-Muntenia",
    "Bukurešť-Ilfov", "Juhozápad-Oltenia", "Západ",
  ],
  Slovinsko: [
    "Pomursko", "Podravsko", "Korutánsko (Koroška)", "Savinsko", "Zasavsko",
    "Posavsko", "Juhovýchodné Slovinsko", "Stredné Slovinsko", "Gorenjsko",
    "Notranjsko-krasko", "Goriško", "Obalno-krasko",
  ],
  Španielsko: [
    "Andalúzia", "Aragónsko", "Astúria", "Baleárske ostrovy", "Kanárske ostrovy",
    "Kantábria", "Kastília-La Mancha", "Kastília a León", "Katalánsko",
    "Extremadura", "Galícia", "Madrid", "Murcia", "Navarra", "Baskicko",
    "La Rioja", "Valencijské spoločenstvo",
  ],
  Švédsko: [
    "Štokholm", "Východné Švédsko", "Malé ostrovy južného Švédska",
    "Južné Švédsko", "Západné Švédsko", "Severné stredné Švédsko",
    "Stredný Norrland", "Horný Norrland",
  ],
  Taliansko: [
    "Piemont", "Valle d'Aosta", "Lombardsko", "Trentino-Alto Adige",
    "Benátsko", "Friuli-Venezia Giulia", "Ligúria", "Emiliano-Romagna",
    "Toskánsko", "Umbria", "Marche", "Lazio", "Abruzzo", "Molise",
    "Kampánia", "Apúlia", "Basilicata", "Kalábria", "Sicília", "Sardínia",
  ],
  "Iná krajina": [],
};

/* ============================================================
   POMOCNÉ FUNKCIE
   ============================================================ */
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const formatEUR = (v) => {
  if (!isFinite(v)) return "—";
  return v.toLocaleString("sk-SK", { maximumFractionDigits: 0 }) + " €";
};

const obfuscate = (s) => btoa(unescape(encodeURIComponent(s || "")));

/* ============================================================
   OCEŇOVACIA LOGIKA
   ============================================================ */
function calculateValuation(inputs, baseCapRateOverridePct = null, debtAmount = 0, dataConfidence = 0.5) {
  const sector = INDUSTRIES[inputs.industry] || INDUSTRIES.other;
  const years = Number(inputs.yearsInBusiness) || 0;

  let capAdj = 0;
  if (inputs.ownerDependency === "medium") capAdj += 3;
  if (inputs.ownerDependency === "high") capAdj += 6;

  if (years < 2) capAdj += 4;
  else if (years <= 5) capAdj += 2;
  else if (years > 10) capAdj -= 2;

  if (inputs.growthTrend === "declining") capAdj += 4;
  if (inputs.growthTrend === "growing") capAdj -= 2;
  if (inputs.growthTrend === "rapid") capAdj -= 4;

  if (inputs.customerConcentration === "concentrated") capAdj += 3;
  if (inputs.customerConcentration === "diversified") capAdj -= 1;

  // Základná kapitalizačná miera: buď orientačná heuristika (22 %), alebo — ak je
  // zapnutý pokročilý CAPM/WACC panel — náklad kapitálu vypočítaný z trhových vstupov.
  // Rizikové úpravy nižšie (capAdj) predstavujú prirážku za veľkosť a špecifické riziko
  // malej firmy, ktorú CAPM/WACC sám osebe nezachytáva.
  const baseCapRate = baseCapRateOverridePct != null ? baseCapRateOverridePct : 22;
  const capRateMid = clamp(baseCapRate + capAdj, 4, 60);

  // Šírka rozpätia okolo strednej kapitalizačnej miery závisí od toho, koľko
  // vstupov je reálnych (RegisterUZ, trhové výnosy dlhopisov...) oproti
  // odhadovaným — viac reálnych dát = užšie, sebavedomejšie rozpätie, presne
  // tak, ako by postupoval analytik s viac/menej podkladmi. dataConfidence
  // 0 = všetko odhad → pásmo ±6 p.b., 1 = všetko reálne → pásmo ±2 p.b.
  const capRateBand = 6 - 4 * clamp(dataConfidence, 0, 1);
  const capRateLow = clamp(capRateMid - capRateBand, 3, 65); // nižšia miera => vyššia hodnota
  const capRateHigh = clamp(capRateMid + capRateBand, 3, 65);

  const netProfit = Number(inputs.netProfit) || 0;
  const capValueMid = netProfit / (capRateMid / 100);
  const capValueHigh = netProfit / (capRateLow / 100);
  const capValueLow = netProfit / (capRateHigh / 100);

  // kvalitatívny faktor pre trhové násobky (opačné znamienko ako rizikový capAdj)
  const qualityAdj = -capAdj;
  const factor = clamp(1 + qualityAdj / 100, 0.75, 1.25);

  // Rovnaký princíp aj pri odvetvovom násobku — pri vyššej spoľahlivosti dát sa
  // násobkové rozpätie zúži smerom k stredu (max o polovicu pôvodnej šírky).
  const sectorMid = (sector.low + sector.high) / 2;
  const sectorHalfWidth = (sector.high - sector.low) / 2;
  const narrowedHalfWidth = sectorHalfWidth * (1 - clamp(dataConfidence, 0, 1) * 0.5);
  const sectorLowAdj = sectorMid - narrowedHalfWidth;
  const sectorHighAdj = sectorMid + narrowedHalfWidth;

  const ebitda = Number(inputs.ebitda) || 0;
  const multLow = sectorLowAdj * factor;
  const multHigh = sectorHighAdj * factor;
  const ebitdaValueLow = ebitda * multLow;
  const ebitdaValueHigh = ebitda * multHigh;
  const ebitdaValueMid = ebitda * ((multLow + multHigh) / 2);

  const rangeLow = Math.min(capValueLow, ebitdaValueLow);
  const rangeHigh = Math.max(capValueHigh, ebitdaValueHigh);
  const midpoint = (capValueMid + ebitdaValueMid) / 2;

  // Unlevered = hodnota podniku ako celku (Enterprise Value), bez ohľadu na financovanie.
  // Levered = hodnota, ktorá reálne patrí vlastníkovi po odpočítaní dlhu (Equity Value) —
  // relevantné pri predaji firmy, keďže kupujúci väčšinou platí za vlastný kapitál.
  const debt = Number(debtAmount) || 0;
  const unleveredLow = rangeLow;
  const unleveredHigh = rangeHigh;
  const unleveredMid = midpoint;
  const leveredLow = Math.max(0, rangeLow - debt);
  const leveredHigh = Math.max(0, rangeHigh - debt);
  const leveredMid = Math.max(0, midpoint - debt);

  return {
    sector,
    capRateMid,
    capRateLow,
    capRateHigh,
    capRateBand,
    dataConfidence: clamp(dataConfidence, 0, 1),
    capValueLow,
    capValueMid,
    capValueHigh,
    multLow,
    multHigh,
    ebitdaValueLow,
    ebitdaValueMid,
    ebitdaValueHigh,
    rangeLow,
    rangeHigh,
    midpoint,
    debt,
    unleveredLow,
    unleveredHigh,
    unleveredMid,
    leveredLow,
    leveredHigh,
    leveredMid,
  };
}

/* ============================================================
   WACC (bez bety) — pokročilý výpočet nákladu kapitálu
   ============================================================
   Používa parametre: Debt-to-Equity Ratio, Debt, Credit Spread,
   Risk-free rate, Market risk premium, Country risk premium,
   Inflation differential, Average tax rate.
   Výsledné WACC sa použije ako základná kapitalizačná miera namiesto
   orientačnej heuristiky 22 % a slúži na diskontovanie hodnoty podniku
   (Unlevered / Enterprise Value). Zadaný Debt sa následne odpočíta,
   čím sa získa hodnota pre vlastníka (Levered / Equity Value).
   ============================================================ */
/* ============================================================
   SPOĽAHLIVOSŤ DÁT — koľko vstupov je reálnych vs. odhadovaných
   ============================================================
   Vyššia spoľahlivosť => užšie rozpätie výsledku (pozri calculateValuation)
   a viditeľný odznak v reporte. Súčet váh pri firme s ručne zadanými
   dátami môže dosiahnuť 1,0; pri RegisterUZ firme typicky 0,6–0,9;
   pri čisto zástupnom odhade 0.
   ============================================================ */
function computeDataConfidence({ dataSource, ruzInfo, marketRisk }) {
  let score = 0;
  if (dataSource === "manual") score += 0.4;
  else if (dataSource === "registeruz") score += 0.3;
  if (ruzInfo?.ebitdaIsReal) score += 0.15;
  if (ruzInfo?.financialDebtIsReal) score += 0.1;
  if (ruzInfo?.growthTrend) score += 0.15;
  if (ruzInfo?.yearsInBusinessIsExact) score += 0.05;
  if (marketRisk?.marketCountryRiskPremium != null) score += 0.15;
  return clamp(score, 0, 1);
}

function computeCapmWacc(a) {
  const de = clamp(Number(a.debtToEquity) / 100 || 0, 0, 10); // D/E ako pomer
  const tax = clamp(Number(a.taxRate) / 100 || 0, 0, 0.6);
  const rf = Number(a.riskFreeRate) / 100 || 0;
  const mrp = Number(a.marketRiskPremium) / 100 || 0;
  const crp = Number(a.countryRiskPremium) / 100 || 0;
  const infDiff = Number(a.inflationDifferential) / 100 || 0;
  const creditSpread = Number(a.creditSpread) / 100 || 0;

  // Náklad vlastného kapitálu — bez bety: risk-free rate + trhová a krajinová
  // riziková prirážka, upravené Fisherovou rovnicou o infláčný diferenciál
  // (relevantné pri cezhraničnom ocenení v inej mene, než sú vstupné trhové dáta).
  let costOfEquity = rf + mrp + crp;
  costOfEquity = (1 + costOfEquity) * (1 + infDiff) - 1;

  // Náklad cudzieho kapitálu
  const costOfDebt = rf + creditSpread;
  const costOfDebtAfterTax = costOfDebt * (1 - tax);

  // Váhy podľa D/E pomeru
  const weightEquity = 1 / (1 + de);
  const weightDebt = de / (1 + de);

  const wacc = weightEquity * costOfEquity + weightDebt * costOfDebtAfterTax;

  return {
    costOfEquity,
    costOfDebt,
    costOfDebtAfterTax,
    weightEquity,
    weightDebt,
    wacc,
  };
}

/* ============================================================
   ČIERNA SKRINKA — odvodenie vstupov pre výpočet
   ============================================================
   Používateľ (podnikateľ) nemá prístup k žiadnym vstupným parametrom
   ani ich nemôže upravovať. Táto funkcia je JEDINÝ zdroj vstupov pre
   calculateValuation/computeCapmWacc.

   ⚠️ DOČASNÝ STAV: kým nie je pripojený reálny zdroj dát (register,
   API a pod.), sú finančné údaje generované deterministickou
   placeholder logikou (na základe názvu firmy), aby appka fungovala
   ako demonštrácia end-to-end toku. Túto funkciu treba nahradiť
   reálnym načítaním dát hneď, ako bude zdroj k dispozícii.
   ============================================================ */

// Jednoduchý deterministický hash (rovnaká firma => rovnaké "náhodné" čísla)
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/* Jednoznačný kľúč firmy pre uloženie dát (ručné admin vstupy, história).
   Bez toho by sa napr. ručne zadané finančné údaje jednej firmy mohli omylom
   použiť aj pri inej firme spracovanej neskôr v tom istom prehliadači.
   Prioritne používa IČO (jednoznačné), inak názov firmy + krajina. */
function companyKey(profile) {
  if (!profile) return "default";
  if (profile.ico) return `ico-${String(profile.ico).replace(/\s/g, "")}`;
  const slug = (profile.companyName || "neznama-firma")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `name-${slug}-${profile.country || ""}`;
}

/* Mapovanie SK NACE kódu (vracia ho RegisterUZ priamo pri firme) na naše
   odvetvové kategórie použité v INDUSTRIES tabuľke — podľa prvých dvoch
   číslic kódu (sekcia klasifikácie SK NACE Rev. 2). */
function mapNaceToIndustry(skNace) {
  if (!skNace) return null;
  const code = parseInt(String(skNace).slice(0, 2), 10);
  if (isNaN(code)) return null;
  if (code >= 1 && code <= 3) return "agriculture";
  if (code >= 10 && code <= 33) return "manufacturing";
  if (code >= 41 && code <= 43) return "construction";
  if (code >= 45 && code <= 45) return "retail"; // predaj a oprava motorových vozidiel
  if (code === 46) return "wholesale";
  if (code === 47) return "retail";
  if (code >= 49 && code <= 53) return "transport";
  if (code >= 55 && code <= 56) return "horeca";
  if (code >= 62 && code <= 63) return "it";
  if (code >= 95 && code <= 96) return "services";
  return "other";
}

// Orientačné krajinové parametre (daň, krajinové riziko, mena) — demonštračné hodnoty
const COUNTRY_FINANCE_DEFAULTS = {
  Slovensko: { taxRate: 21, countryRiskPremium: 1.0, currency: "EUR", exchangeRate: 1 },
  Belgicko: { taxRate: 25, countryRiskPremium: 0.5, currency: "EUR", exchangeRate: 1 },
  Bulharsko: { taxRate: 10, countryRiskPremium: 2.0, currency: "BGN", exchangeRate: 1.96 },
  Cyprus: { taxRate: 12.5, countryRiskPremium: 1.5, currency: "EUR", exchangeRate: 1 },
  Česko: { taxRate: 19, countryRiskPremium: 1.2, currency: "CZK", exchangeRate: 25.2 },
  Dánsko: { taxRate: 22, countryRiskPremium: 0.3, currency: "DKK", exchangeRate: 7.46 },
  Estónsko: { taxRate: 20, countryRiskPremium: 1.0, currency: "EUR", exchangeRate: 1 },
  Fínsko: { taxRate: 20, countryRiskPremium: 0.3, currency: "EUR", exchangeRate: 1 },
  Francúzsko: { taxRate: 25, countryRiskPremium: 0.5, currency: "EUR", exchangeRate: 1 },
  Grécko: { taxRate: 22, countryRiskPremium: 2.0, currency: "EUR", exchangeRate: 1 },
  Holandsko: { taxRate: 25.8, countryRiskPremium: 0.3, currency: "EUR", exchangeRate: 1 },
  Chorvátsko: { taxRate: 18, countryRiskPremium: 1.5, currency: "EUR", exchangeRate: 1 },
  Írsko: { taxRate: 12.5, countryRiskPremium: 0.4, currency: "EUR", exchangeRate: 1 },
  Litva: { taxRate: 15, countryRiskPremium: 1.2, currency: "EUR", exchangeRate: 1 },
  Lotyšsko: { taxRate: 20, countryRiskPremium: 1.3, currency: "EUR", exchangeRate: 1 },
  Luxembursko: { taxRate: 24.9, countryRiskPremium: 0.2, currency: "EUR", exchangeRate: 1 },
  Maďarsko: { taxRate: 9, countryRiskPremium: 2.0, currency: "HUF", exchangeRate: 400 },
  Malta: { taxRate: 35, countryRiskPremium: 1.0, currency: "EUR", exchangeRate: 1 },
  Nemecko: { taxRate: 30, countryRiskPremium: 0.2, currency: "EUR", exchangeRate: 1 },
  Poľsko: { taxRate: 19, countryRiskPremium: 1.5, currency: "PLN", exchangeRate: 4.3 },
  Portugalsko: { taxRate: 21, countryRiskPremium: 1.3, currency: "EUR", exchangeRate: 1 },
  Rakúsko: { taxRate: 23, countryRiskPremium: 0.3, currency: "EUR", exchangeRate: 1 },
  Rumunsko: { taxRate: 16, countryRiskPremium: 2.0, currency: "RON", exchangeRate: 4.97 },
  Slovinsko: { taxRate: 19, countryRiskPremium: 1.0, currency: "EUR", exchangeRate: 1 },
  Španielsko: { taxRate: 25, countryRiskPremium: 0.8, currency: "EUR", exchangeRate: 1 },
  Švédsko: { taxRate: 20.6, countryRiskPremium: 0.3, currency: "SEK", exchangeRate: 11.3 },
  Taliansko: { taxRate: 24, countryRiskPremium: 1.2, currency: "EUR", exchangeRate: 1 },
  "Iná krajina": { taxRate: 21, countryRiskPremium: 2.5, currency: "USD", exchangeRate: 1.08 },
};

// Mapovanie na dvojpísmenové kódy Eurostatu (potrebné pre API dopyty na nezamestnanosť a infláciu)
const EUROSTAT_COUNTRY_CODES = {
  Slovensko: "SK",
  Belgicko: "BE",
  Bulharsko: "BG",
  Cyprus: "CY",
  Česko: "CZ",
  Dánsko: "DK",
  Estónsko: "EE",
  Fínsko: "FI",
  Francúzsko: "FR",
  Grécko: "EL", // Eurostat používa kód EL, nie GR
  Holandsko: "NL",
  Chorvátsko: "HR",
  Írsko: "IE",
  Litva: "LT",
  Lotyšsko: "LV",
  Luxembursko: "LU",
  Maďarsko: "HU",
  Malta: "MT",
  Nemecko: "DE",
  Poľsko: "PL",
  Portugalsko: "PT",
  Rakúsko: "AT",
  Rumunsko: "RO",
  Slovinsko: "SI",
  Španielsko: "ES",
  Švédsko: "SE",
  Taliansko: "IT",
};
// Kompaktný formát čísla pre popisky na stupnici gauge (napr. "1,2M €", "450k €")
function formatCompactEUR(v) {
  if (!isFinite(v)) return "—";
  const abs = Math.abs(v);
  if (abs >= 1000000) {
    const m = v / 1000000;
    return (Number.isInteger(m) ? m.toFixed(0) : m.toFixed(1)) + "M €";
  }
  if (abs >= 1000) return Math.round(v / 1000) + "k €";
  return Math.round(v) + " €";
}

/* ============================================================
   GAUGE (ihlový merač hodnoty) — signature element
   ============================================================ */
function ValueGauge({ low, high, mid, size = 280 }) {
  const w = size;
  const h = size * 0.62;
  const cx = w / 2;
  const cy = h * 0.94;
  const r = w * 0.4;

  const frac = high > low ? clamp((mid - low) / (high - low), 0, 1) : 0.5;
  const angle = -90 + frac * 180; // -90 (vľavo) .. +90 (vpravo)

  const polarToCartesian = (cx, cy, rad, angleDeg) => {
    const a = ((angleDeg - 180) * Math.PI) / 180;
    return { x: cx + rad * Math.cos(a), y: cy + rad * Math.sin(a) };
  };

  const arcStart = polarToCartesian(cx, cy, r, 0);
  const arcEnd = polarToCartesian(cx, cy, r, 180);
  const arcPath = `M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 0 1 ${arcEnd.x} ${arcEnd.y}`;

  const strokeW = w * 0.085;
  const tickCount = 5; // 0, 25, 50, 75, 100 %
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const t = i / (tickCount - 1);
    const a = t * 180; // 0..180 stupňov po oblúku
    const inner = polarToCartesian(cx, cy, r - strokeW / 2 - 2, a);
    const outer = polarToCartesian(cx, cy, r + strokeW / 2 + 2, a);
    return { inner, outer };
  });

  const needleLen = r * 0.86;
  const needleBackLen = r * 0.14;
  const needleHalfWidth = w * 0.02;
  const tip = { x: cx - needleLen, y: cy };
  const back = { x: cx + needleBackLen, y: cy };
  const needlePath = `M ${tip.x} ${tip.y} L ${cx} ${cy - needleHalfWidth} L ${back.x} ${back.y} L ${cx} ${cy + needleHalfWidth} Z`;

  const gaugeId = useRef(`gauge-${Math.random().toString(36).slice(2, 9)}`).current;

  return (
    <svg viewBox={`0 0 ${w} ${h + 34}`} width="100%" style={{ maxWidth: size, display: "block", margin: "0 auto" }}>
      <defs>
        <linearGradient id={`${gaugeId}-arc`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={COLORS.red} />
          <stop offset="50%" stopColor={COLORS.brass} />
          <stop offset="100%" stopColor={COLORS.teal} />
        </linearGradient>
        <radialGradient id={`${gaugeId}-hub`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#4a5a74" />
          <stop offset="55%" stopColor={COLORS.ink} />
          <stop offset="100%" stopColor="#0d1626" />
        </radialGradient>
        <filter id={`${gaugeId}-shadow`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#17233B" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* podkladový oblúk */}
      <path d={arcPath} fill="none" stroke={COLORS.line} strokeWidth={strokeW} strokeLinecap="round" />
      {/* farebný oblúk */}
      <path
        d={arcPath}
        fill="none"
        stroke={`url(#${gaugeId}-arc)`}
        strokeWidth={strokeW}
        strokeLinecap="round"
        opacity="0.92"
      />
      {/* rysky stupnice */}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.inner.x}
          y1={t.inner.y}
          x2={t.outer.x}
          y2={t.outer.y}
          stroke={COLORS.paper}
          strokeWidth={1.5}
          opacity={0.9}
        />
      ))}

      {/* ihla */}
      <g
        style={{ transition: "transform 900ms cubic-bezier(.2,.8,.2,1)", transformOrigin: `${cx}px ${cy}px` }}
        transform={`rotate(${angle} ${cx} ${cy})`}
        filter={`url(#${gaugeId}-shadow)`}
      >
        <path d={needlePath} fill={COLORS.ink} />
      </g>
      {/* stredový hub */}
      <circle cx={cx} cy={cy} r={w * 0.042} fill={`url(#${gaugeId}-hub)`} filter={`url(#${gaugeId}-shadow)`} />
      <circle cx={cx} cy={cy} r={w * 0.016} fill={COLORS.brass} />

      {/* popisky min / max pod oblúkom */}
      <text
        x={arcStart.x}
        y={h + 20}
        textAnchor="start"
        fontSize={w * 0.036}
        fontFamily="'IBM Plex Mono', monospace"
        fill={COLORS.inkSoft}
      >
        {formatCompactEUR(low)}
      </text>
      <text
        x={arcEnd.x}
        y={h + 20}
        textAnchor="end"
        fontSize={w * 0.036}
        fontFamily="'IBM Plex Mono', monospace"
        fill={COLORS.inkSoft}
      >
        {formatCompactEUR(high)}
      </text>
    </svg>
  );
}


/* ============================================================
   FORMULÁROVÉ PRVKY
   ============================================================ */
function SectionEyebrow({ children }) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: COLORS.brassDeep,
        fontWeight: 600,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function NumberInput({ label, value, onChange, suffix = "€", helper }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <div style={{ fontSize: 13.5, color: COLORS.ink, fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", border: `1px solid ${COLORS.line}`, borderRadius: 10, background: "#fff", overflow: "hidden" }}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            padding: "10px 12px",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 14,
            color: COLORS.ink,
          }}
        />
        <span style={{ padding: "0 12px", color: COLORS.inkSoft, fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>{suffix}</span>
      </div>
      {helper && <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 4 }}>{helper}</div>}
    </label>
  );
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <div style={{ fontSize: 13.5, color: COLORS.ink, fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            appearance: "none",
            border: `1px solid ${COLORS.line}`,
            borderRadius: 10,
            background: "#fff",
            padding: "10px 34px 10px 12px",
            fontSize: 13.5,
            fontFamily: "'IBM Plex Sans', sans-serif",
            color: COLORS.ink,
          }}
        >
          {options.map((o) => (
            <option key={o.value || o} value={o.value || o}>
              {o.label || o}
            </option>
          ))}
        </select>
        <ChevronDown size={15} color={COLORS.inkSoft} style={{ position: "absolute", right: 12, top: 12, pointerEvents: "none" }} />
      </div>
    </label>
  );
}

/* ============================================================
   WIZARD — firemný profil (4 slidy), beží po prihlásení
   ============================================================ */
const WIZARD_STEPS = [
  { key: "location", label: "Krajina", icon: Globe2 },
  { key: "company", label: "Firma", icon: Building2 },
  { key: "structure", label: "Štruktúra", icon: Network },
  { key: "contact", label: "Kontakt", icon: Contact },
];

function CompanyWizard({ initialData, onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(
    initialData || {
      country: "Slovensko",
      region: REGIONS_BY_COUNTRY["Slovensko"][0],
      companyName: "",
      ico: "",
      companyType: "sro",
      structureType: "hq",
      parentCompany: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    }
  );
  const [touched, setTouched] = useState(false);

  const upd = (k) => (v) => setData((s) => ({ ...s, [k]: v }));

  // pri zmene krajiny sa región automaticky prepne na prvý z jej zoznamu
  // (zoznamy sa medzi krajinami líšia, starý výber by nemusel dávať zmysel)
  const updCountry = (v) => {
    setData((s) => ({ ...s, country: v, region: (REGIONS_BY_COUNTRY[v] || [])[0] || "" }));
  };

  const isStepValid = () => {
    if (step === 0) return data.country.trim() && data.region.trim();
    if (step === 1) return data.companyName.trim() && data.companyType;
    if (step === 2) return !!data.structureType;
    if (step === 3) return true;
    return true;
  };

  const handleNext = () => {
    if (!isStepValid()) {
      setTouched(true);
      return;
    }
    setTouched(false);
    if (step < WIZARD_STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    setTouched(false);
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 20px 60px" }}>
      {/* progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
        {WIZARD_STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          const done = i < step;
          return (
            <React.Fragment key={s.key}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: "0 0 auto" }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: done ? COLORS.teal : active ? COLORS.ink : "#fff",
                    border: `1.5px solid ${done ? COLORS.teal : active ? COLORS.ink : COLORS.line}`,
                    color: done || active ? "#fff" : COLORS.inkSoft,
                    transition: "all 200ms ease",
                  }}
                >
                  {done ? <Check size={16} /> : <Icon size={15} />}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: active ? COLORS.ink : COLORS.inkSoft,
                    fontWeight: active ? 700 : 400,
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.label}
                </div>
              </div>
              {i < WIZARD_STEPS.length - 1 && (
                <div style={{ flex: 1, height: 1.5, background: i < step ? COLORS.teal : COLORS.line, marginBottom: 18 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <Card accent>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: COLORS.brassDeep, fontWeight: 600, marginBottom: 6 }}>
          Krok {step + 1} z {WIZARD_STEPS.length}
        </div>

        {step === 0 && (
          <>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22, color: COLORS.ink, margin: "0 0 4px" }}>
              Kde firma sídli?
            </h2>
            <p style={{ color: COLORS.inkSoft, fontSize: 13.5, margin: "0 0 20px" }}>
              Táto informácia pomáha zohľadniť geopolitiku.
            </p>
            <SelectInput label="Krajina" value={data.country} onChange={updCountry} options={COUNTRY_OPTIONS} />
            <SelectInput
              label="Kraj / región"
              value={data.region}
              onChange={upd("region")}
              options={
                (REGIONS_BY_COUNTRY[data.country] || []).length > 0
                  ? REGIONS_BY_COUNTRY[data.country]
                  : ["Neuvedené"]
              }
            />
            {touched && !isStepValid() && <ErrorHint text="Vyplňte prosím krajinu a kraj/región." />}
          </>
        )}

        {step === 1 && (
          <>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22, color: COLORS.ink, margin: "0 0 20px" }}>
              Ako sa firma volá?
            </h2>
            <NumberInputText label="Celý názov spoločnosti" value={data.companyName} onChange={upd("companyName")} icon={<Building2 size={14} />} />
            <NumberInputText
              label="IČO"
              value={data.ico}
              onChange={upd("ico")}
              icon={<Contact size={14} />}
              numericOnly
              maxLength={8}
              helper="Ak firma sídli na Slovensku, appka sa pokúsi podľa IČO automaticky dohľadať reálne účtovné údaje z verejného registra."
            />
            <SelectInput label="Typ spoločnosti" value={data.companyType} onChange={upd("companyType")} options={COMPANY_TYPE_OPTIONS} />
            {touched && !isStepValid() && <ErrorHint text="Vyplňte prosím názov aj typ spoločnosti." />}
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22, color: COLORS.ink, margin: "0 0 4px" }}>
              Materská spoločnosť, alebo pobočka?
            </h2>
            <p style={{ color: COLORS.inkSoft, fontSize: 13.5, margin: "0 0 20px" }}>
              Táto informácia pomáha správne zaradiť firmu v rámci celej skupiny (ak existuje).
            </p>
            <SelectInput label="Štruktúra" value={data.structureType} onChange={upd("structureType")} options={STRUCTURE_OPTIONS} />
            {data.structureType === "subsidiary" && (
              <NumberInputText
                label="Názov materskej spoločnosti"
                value={data.parentCompany}
                onChange={upd("parentCompany")}
                icon={<Network size={14} />}
                helper="Voliteľné, ale pomáha to pri interpretácii výsledku."
              />
            )}
            {touched && !isStepValid() && <ErrorHint text="Vyberte prosím jednu z možností." />}
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22, color: COLORS.ink, margin: "0 0 20px" }}>
              Kontaktné údaje
            </h2>
            <NumberInputText label="Meno a priezvisko (voliteľné)" value={data.contactName} onChange={upd("contactName")} icon={<User size={14} />} />
            <NumberInputText label="E-mail (voliteľné)" value={data.contactEmail} onChange={upd("contactEmail")} icon={<Mail size={14} />} />
            <NumberInputText
              label="Telefón (voliteľné)"
              value={data.contactPhone}
              onChange={upd("contactPhone")}
              icon={<Phone size={14} />}
            />
          </>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          {step > 0 && (
            <button
              onClick={handleBack}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "12px 18px",
                borderRadius: 999,
                border: `1px solid ${COLORS.line}`,
                background: "#fff",
                color: COLORS.ink,
                fontWeight: 600,
                fontSize: 13.5,
                cursor: "pointer",
                transition: "background 150ms ease",
              }}
            >
              <ChevronLeft size={15} /> Späť
            </button>
          )}
          <button
            onClick={handleNext}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "13px 20px",
              borderRadius: 999,
              border: "none",
              background: COLORS.ink,
              color: COLORS.paper,
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
              transition: "transform 150ms ease, box-shadow 150ms ease",
              boxShadow: "0 8px 20px -6px rgba(24,36,73,0.5)",
            }}
          >
            {step === WIZARD_STEPS.length - 1 ? "Pokračovať k oceneniu" : "Ďalej"}
            <ArrowRight size={15} />
          </button>
        </div>
      </Card>
    </div>
  );
}

function NumberInputText({ label, value, onChange, icon, helper, numericOnly = false, maxLength }) {
  const handleChange = (e) => {
    const v = numericOnly ? e.target.value.replace(/\D/g, "") : e.target.value;
    onChange(v);
  };
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <div style={{ fontSize: 13.5, color: COLORS.ink, fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${COLORS.line}`, borderRadius: 10, background: "#fff", padding: "10px 12px" }}>
        {icon && <span style={{ color: COLORS.inkSoft, display: "flex" }}>{icon}</span>}
        <input
          type="text"
          inputMode={numericOnly ? "numeric" : "text"}
          pattern={numericOnly ? "[0-9]*" : undefined}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontFamily: "'IBM Plex Sans', sans-serif", color: COLORS.ink, background: "transparent" }}
        />
      </div>
      {helper && <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 4 }}>{helper}</div>}
    </label>
  );
}

function ErrorHint({ text }) {
  return (
    <div style={{ fontSize: 13, color: COLORS.red, background: "rgba(225,90,80,0.08)", padding: "8px 10px", borderRadius: 10, marginTop: 4 }}>
      {text}
    </div>
  );
}

/* ============================================================
   ZDROJ VSTUPNÝCH DÁT PRE VÝPOČET — "black box"
   ============================================================
   Používateľ (podnikateľ) nemá prístup k žiadnym vstupným finančným
   ani rizikovým parametrom — tie appka získava automaticky na pozadí
   z dvoch zdrojov, v tomto poradí priority:

   1. REÁLNE DÁTA, KTORÉ ZADÁ PORADCA VOPRED — cez skrytý panel
      (otvorí sa pridaním #admin do URL adresy, bežný používateľ naň
      nikdy nenarazí). Ak sú takto zadané, majú prednosť pred placeholder
      hodnotami. Pozri komponent AdminOverridePanel nižšie.

   2. VEREJNÉ TRHOVÉ DÁTA (kurz meny) — sťahujú sa naživo z verejného
      ECB API (Frankfurter, frankfurter.dev — zdarma, bez API kľúča).

   3. PLACEHOLDER — pre všetko, k čomu neexistuje voľne dostupný zdroj
      (konkrétne tržby/EBITDA/zisk firmy) a čo poradca nezadal ručne cez
      admin panel, sa použije deterministický odhad (rovnaká firma =>
      rovnaké čísla), aby appka fungovala end-to-end aj bez reálnych dát.
   ============================================================ */
/* ============================================================
   EUROSTAT — reálna miera nezamestnanosti a inflácie po krajinách
   ============================================================
   Oficiálne, bezplatné REST API bez kľúča (ec.europa.eu/eurostat).
   Používame datasety:
   - une_rt_m  — mesačná miera nezamestnanosti (sezónne očistená)
   - prc_hicp_manr — medziročná miera inflácie (HICP)
   Obe volania si pýtajú len najnovšiu dostupnú hodnotu
   (lastTimePeriod=1), aby bola odpoveď malá a jednoduchá na spracovanie.
   Výsledky sa použijú na jemné doladenie krajinovej rizikovej prirážky
   (Country Risk Premium) — vyššia nezamestnanosť a inflácia nad cieľom
   ECB (~2 %) znamenajú o niečo vyššie makroekonomické riziko.
   ============================================================ */
async function fetchEurostatLatest(dataset, params, geo) {
  try {
    const qs = new URLSearchParams({ format: "JSON", lang: "EN", geo, lastTimePeriod: "1", ...params });
    const url = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${dataset}?${qs.toString()}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const values = data?.value ? Object.values(data.value) : [];
    const num = values.length > 0 ? Number(values[0]) : null;
    return isNaN(num) ? null : num;
  } catch (_) {
    return null;
  }
}

async function fetchCountryMacroData(countryName) {
  const geo = EUROSTAT_COUNTRY_CODES[countryName];
  if (!geo) return null; // "Iná krajina" a pod. — Eurostat pokrýva len EÚ
  const [unemployment, inflation] = await Promise.all([
    fetchEurostatLatest("une_rt_m", { sex: "T", age: "TOTAL", unit: "PC_ACT", s_adj: "SA" }, geo),
    fetchEurostatLatest("prc_hicp_manr", { coicop: "CP00" }, geo),
  ]);
  if (unemployment == null && inflation == null) return null;
  return { unemployment, inflation };
}

/* ============================================================
   VÝNOSY ŠTÁTNYCH DLHOPISOV — trhový proxy namiesto kreditného ratingu
   ============================================================
   Skutočné ratingy S&P/Moody's/Fitch nemajú voľné API. Výnos 10-ročných
   štátnych dlhopisov (Eurostat, dataset irt_lt_mcby_m, mesačne) je ale
   lepší, živý trhový signál rizika krajiny — kým rating sa mení so
   spozdením, dlhopisový trh riziko precenuje priebežne. Nemecký výnos
   slúži ako referenčný "risk-free" benchmark v rámci EÚ; rozdiel oproti
   nemu (spread) je trhovo odvodená Country Risk Premium.
   ============================================================ */
async function fetchSovereignBondYield(geo) {
  return await fetchEurostatLatest("irt_lt_mcby_m", { bonds: "MCBY" }, geo);
}

async function fetchMarketRiskData(countryName) {
  const geo = EUROSTAT_COUNTRY_CODES[countryName];
  if (!geo) return null;
  const [deYield, countryYield] = await Promise.all([
    fetchSovereignBondYield("DE"),
    geo === "DE" ? Promise.resolve(null) : fetchSovereignBondYield(geo),
  ]);
  if (deYield == null) return null;
  const resolvedCountryYield = geo === "DE" ? deYield : countryYield;
  return {
    riskFreeRate: deYield,
    countryYield: resolvedCountryYield,
    marketCountryRiskPremium:
      resolvedCountryYield != null ? Math.max(0, resolvedCountryYield - deYield) : null,
  };
}

/* ============================================================
   REGIONÁLNE SPRESNENIE (kraj → NUTS2 → Eurostat) — len SR
   ============================================================
   RegisterUZ pri slovenskej firme vracia pole "kraj" rovno ako NUTS3 kód
   (napr. "SK010" pre Bratislavský kraj — overené na reálnom príklade
   z verejnej dokumentácie API). NUTS2 sa z neho odvodí jednoducho
   skrátením na 4 znaky (napr. "SK022" → "SK02"), keďže NUTS3 kód v EÚ
   klasifikácii je vždy NUTS2 kód + jedna číslica navyše. Stiahneme
   regionálnu mieru nezamestnanosti — presnejšiu než celoštátny priemer,
   reálne rozlíši napr. Bratislavský kraj od Trenčianskeho. Ak sa
   nepodarí stiahnuť, použije sa celoštátna hodnota bez spresnenia.
   ============================================================ */
const SK_NUTS3_NAZVY = {
  SK010: "Bratislavský kraj",
  SK021: "Trnavský kraj",
  SK022: "Trenčiansky kraj",
  SK023: "Nitriansky kraj",
  SK031: "Žilinský kraj",
  SK032: "Banskobystrický kraj",
  SK041: "Prešovský kraj",
  SK042: "Košický kraj",
};

async function fetchRegionalUnemployment(krajCode) {
  const nuts3 = String(krajCode || "").toUpperCase();
  if (!/^SK\d{3}$/.test(nuts3)) return null; // neočakávaný formát — bezpečne preskočiť
  const nuts2 = nuts3.slice(0, 4);
  const nazov = SK_NUTS3_NAZVY[nuts3] || nuts3;
  const unemployment = await fetchEurostatLatest(
    "lfst_r_lfu3rt",
    { sex: "T", age: "Y15-74", unit: "PC_ACT" },
    nuts2
  );
  if (unemployment == null) return null;
  return { unemployment, kraj: nazov, nuts2 };
}

async function fetchLiveExchangeRate(currency) {
  if (!currency || currency === "EUR") return 1;
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=EUR&to=${currency}`);
    if (!res.ok) throw new Error("fx fetch failed");
    const data = await res.json();
    const rate = data?.rates?.[currency];
    return typeof rate === "number" ? rate : null;
  } catch (_) {
    return null; // appka pri zlyhaní použije statickú tabuľku ako zálohu
  }
}

/* ============================================================
   REGISTERUZ — reálne účtovné dáta pre slovenské firmy (podľa IČO)
   ============================================================
   Oficiálne, bezplatné API bez kľúča (registeruz.sk, licencia CC0,
   prevádzkuje Ministerstvo financií SR). Postup:
   1. nájde účtovnú jednotku podľa IČO
   2. vezme jej najnovšiu účtovnú závierku
   3. stiahne súvisiace účtovné výkazy (súvaha, výkaz ziskov a strát)
   4. pre každý výkaz stiahne šablónu (definuje význam jednotlivých
      riadkov) a podľa kľúčových slov v texte riadku nájde potrebné
      hodnoty (tržby, výsledok hospodárenia, aktíva, vlastné imanie,
      záväzky)

   Keďže ide o skutočné, rôzne štruktúrované výkazy (menia sa
   v priebehu rokov aj podľa veľkosti firmy), táto funkcia je robustná
   voči drobným odchýlkam vďaka vyhľadávaniu podľa textu riadku namiesto
   pevných čísel riadkov — ale pri prvom ostrom použití odporúčam overiť
   výsledok na 2-3 známych IČO a dať mi vedieť, ak by niečo sedelo zle.
   Pri akomkoľvek zlyhaní funkcia vráti null a appka potichu použije
   zástupný odhad.
   ============================================================ */
async function fetchRegisterUzData(ico) {
  const cleanIco = String(ico || "").replace(/\s/g, "");
  if (!/^\d{6,8}$/.test(cleanIco)) return null;

  const base = "https://www.registeruz.sk/cruz-public/api";
  const getJson = async (url) => {
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  };

  // Skutočný počet dátových stĺpcov tabuľky sa v API NEVRACIA ako jednoduché
  // číslo (pole "pocetDatovychStlpcov" neexistuje) — treba ho odvodiť z
  // hlavičky tabuľky (hlavicka: zoznam buniek s pozíciou stlpec + šírkou
  // sirkaStlpca). Bez tohto by sa pri viacstĺpcových tabuľkách (napr. súvaha
  // s Brutto/Korekcia/Netto) čítal vždy len prvý stĺpec.
  const getColumnCount = (templateTabulka) => {
    const hlavicka = templateTabulka?.hlavicka;
    if (!hlavicka || hlavicka.length === 0) return 1;
    let maxCol = 1;
    for (const h of hlavicka) {
      const endCol = (h.stlpec || 1) + (h.sirkaStlpca || 1) - 1;
      if (endCol > maxCol) maxCol = endCol;
    }
    return maxCol;
  };

  // Vo väčšine výkazov RÚZ je posledný stĺpec porovnávacie MINULÉ obdobie —
  // stĺpec s aktuálnymi (bežnými) dátami je tak takmer vždy predposledný
  // (napr. Brutto/Korekcia/Netto-bežné/Netto-minulé → chceme 3. z 4 stĺpcov).
  // Pri jedinom stĺpci (žiadne porovnanie) je správne jednoducho stĺpec 0.
  const currentPeriodColumnIndex = (columnCount) => (columnCount <= 1 ? 0 : columnCount - 2);

  // nájde hodnotu v tabuľke podľa kľúčových slov v texte riadku šablóny.
  // useCurrentPeriodColumn=true pre súvahové položky (aktíva, imanie, dlh),
  // kde treba konkrétne stĺpec bežného obdobia (nie brutto, nie minulé obdobie).
  const findValue = (tabulka, templateTabulka, keywords, useCurrentPeriodColumn = false) => {
    if (!tabulka?.data || !templateTabulka?.riadky) return null;
    const dataCols = getColumnCount(templateTabulka);
    const col = useCurrentPeriodColumn ? currentPeriodColumnIndex(dataCols) : 0;
    for (let i = 0; i < templateTabulka.riadky.length; i++) {
      const text = (templateTabulka.riadky[i].text && templateTabulka.riadky[i].text.sk) || "";
      if (keywords.some((k) => text.toLowerCase().includes(k.toLowerCase()))) {
        const val = tabulka.data[i * dataCols + col];
        const num = val != null ? parseFloat(val) : NaN;
        if (!isNaN(num)) return num;
      }
    }
    return null;
  };

  // rovnaké ako findValue, ale spočíta VŠETKY riadky, ktoré zodpovedajú kľúčovým
  // slovám (napr. bankové úvery bývajú v súvahe rozdelené na dlhodobé/krátkodobé)
  const findValueSum = (tabulka, templateTabulka, keywords, useCurrentPeriodColumn = false) => {
    if (!tabulka?.data || !templateTabulka?.riadky) return null;
    const dataCols = getColumnCount(templateTabulka);
    const col = useCurrentPeriodColumn ? currentPeriodColumnIndex(dataCols) : 0;
    let sum = 0,
      found = false;
    for (let i = 0; i < templateTabulka.riadky.length; i++) {
      const text = (templateTabulka.riadky[i].text && templateTabulka.riadky[i].text.sk) || "";
      if (keywords.some((k) => text.toLowerCase().includes(k.toLowerCase()))) {
        const val = tabulka.data[i * dataCols + col];
        const num = val != null ? parseFloat(val) : NaN;
        if (!isNaN(num)) {
          sum += num;
          found = true;
        }
      }
    }
    return found ? sum : null;
  };

  // stiahne výkazy danej závierky. `income` = tržby/zisk/EBITDA komponenty
  // (zmysluplné priemerovať za viac rokov), `balance` = súvahové položky
  // (aktíva, vlastné imanie, dlh — berú sa len z najnovšieho roka, nedáva
  // zmysel ich priemerovať naprieč rokmi).
  const extractFromClosure = async (closure, templateCache, { income = true, balance = false } = {}) => {
    const reportIds = closure?.idUctovnychVykazov || [];
    if (reportIds.length === 0) return null;
    const reports = (
      await Promise.all(reportIds.map((id) => getJson(`${base}/uctovny-vykaz?id=${id}`)))
    ).filter((r) => r?.obsah?.tabulky);
    if (reports.length === 0) return null;

    const missingTemplateIds = [...new Set(reports.map((r) => r.idSablony))].filter((id) => !templateCache[id]);
    if (missingTemplateIds.length > 0) {
      const fetched = await Promise.all(missingTemplateIds.map((id) => getJson(`${base}/sablona?id=${id}`)));
      fetched.forEach((t) => {
        if (t) templateCache[t.id] = t;
      });
    }

    let revenue = null,
      profit = null,
      operatingProfit = null,
      depreciation = null,
      assets = null,
      equity = null,
      liabilities = null,
      financialDebt = null;

    for (const report of reports) {
      const template = templateCache[report.idSablony];
      if (!template) continue;
      const tabulky = report.obsah.tabulky;
      const templateTabulky = template.tabulky;
      for (let ti = 0; ti < tabulky.length; ti++) {
        const tabulka = tabulky[ti];
        const templateTabulka = templateTabulky[ti];
        if (!templateTabulka) continue;

        if (income) {
          if (revenue === null) {
            revenue = findValue(tabulka, templateTabulka, [
              "Tržby z predaja vlastných výrobkov",
              "Tržby za vlastné výkony a tovar",
              "Tržby z predaja výrobkov, tovarov a služieb",
              "Čistý obrat",
            ]);
          }
          if (profit === null) {
            profit = findValue(tabulka, templateTabulka, [
              "Výsledok hospodárenia za účtovné obdobie po zdanení",
              "Výsledok hospodárenia za účtovné obdobie",
            ]);
          }
          if (operatingProfit === null) {
            operatingProfit = findValue(tabulka, templateTabulka, [
              "Výsledok hospodárenia z hospodárskej činnosti",
              "Výsledok hospodárenia z prevádzkovej činnosti",
            ]);
          }
          if (depreciation === null) {
            depreciation = findValue(tabulka, templateTabulka, [
              "Odpisy dlhodobého nehmotného majetku a dlhodobého hmotného majetku",
              "Odpisy dlhodobého majetku",
            ]);
          }
        }
        if (balance) {
          if (assets === null) {
            assets = findValue(tabulka, templateTabulka, ["Spolu majetok", "SPOLU MAJETOK"], true);
          }
          if (equity === null) {
            equity = findValue(tabulka, templateTabulka, ["Vlastné imanie"], true);
          }
          if (liabilities === null) {
            liabilities = findValue(tabulka, templateTabulka, ["Záväzky spolu", "Záväzky súčet", "Záväzky r."], true);
          }
          if (financialDebt === null) {
            financialDebt = findValueSum(
              tabulka,
              templateTabulka,
              ["Bankové úvery", "Krátkodobé finančné výpomoci", "Bežné bankové úvery"],
              true
            );
          }
        }
      }
    }

    // EBITDA = prevádzkový (hospodársky) výsledok + odpisy — štandardný vzorec.
    // Ak niektorá zložka chýba, necháme null a appka použije záložný odhad z čistého zisku.
    const ebitda = operatingProfit != null && depreciation != null ? operatingProfit + depreciation : null;

    return { revenue, profit, ebitda, assets, equity, liabilities, financialDebt };
  };

  // klasifikácia trendu podľa priemerného medziročného rastu (CAGR) tržieb
  const classifyGrowthTrend = (cagr) => {
    if (cagr < -0.05) return "declining";
    if (cagr < 0.03) return "stable";
    if (cagr < 0.15) return "growing";
    return "rapid";
  };

  try {
    const jList = await getJson(`${base}/uctovne-jednotky?zmenene-od=2000-01-01&max-zaznamov=5&ico=${cleanIco}`);
    const ujId = jList?.id?.[0];
    if (!ujId) return null;

    const uj = await getJson(`${base}/uctovna-jednotka?id=${ujId}`);
    const closureIds = uj?.idUctovnychZavierok || [];
    if (closureIds.length === 0) return null;

    // skontrolovať posledných pár závierok (podľa id) a zoradiť podľa reálneho obdobia
    const candidateIds = closureIds.slice(-8);
    const closures = (
      await Promise.all(candidateIds.map((id) => getJson(`${base}/uctovna-zavierka?id=${id}`)))
    ).filter((c) => c && c.obdobieDo);
    if (closures.length === 0) return null;
    closures.sort((a, b) => (a.obdobieDo < b.obdobieDo ? 1 : -1));

    // posledné (max) 3 roky použijeme na výpočet reálneho trendu tržieb
    const recentClosures = closures.slice(0, 3);
    const templateCache = {};

    const yearlyData = [];
    for (let i = 0; i < recentClosures.length; i++) {
      const extracted = await extractFromClosure(recentClosures[i], templateCache, {
        income: true,
        balance: i === 0, // súvahové položky (aktíva, imanie, dlh) len z najnovšieho roka
      });
      if (extracted) yearlyData.push({ obdobie: recentClosures[i].obdobieDo, ...extracted });
    }

    if (yearlyData.length === 0) return null;
    const latestData = yearlyData[0];

    // priemerovanie zisku a EBITDA za dostupné roky (max. 3) — vyhladí to
    // jednorazové výkyvy, ktoré by inak jeden mimoriadny rok mohol spôsobiť
    const avg = (arr) => {
      const vals = arr.filter((v) => v != null);
      return vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
    };
    const avgProfit = avg(yearlyData.map((y) => y.profit));
    const avgEbitda = avg(yearlyData.map((y) => y.ebitda));

    // trend tržieb z reálnych viacročných dát (ak máme aspoň 2 roky s tržbami)
    let growthTrend = null;
    let revenueHistory = null;
    const revenuesWithYears = yearlyData.filter((y) => y.revenue != null);
    if (revenuesWithYears.length >= 2) {
      const newest = revenuesWithYears[0];
      const oldest = revenuesWithYears[revenuesWithYears.length - 1];
      const yearsSpan = Math.max(
        1,
        new Date(newest.obdobie).getFullYear() - new Date(oldest.obdobie).getFullYear()
      );
      if (oldest.revenue > 0) {
        const cagr = Math.pow(newest.revenue / oldest.revenue, 1 / yearsSpan) - 1;
        growthTrend = classifyGrowthTrend(cagr);
        revenueHistory = revenuesWithYears.map((y) => ({ obdobie: y.obdobie, revenue: y.revenue })).reverse();
      }
    }

    if (latestData.revenue === null && avgProfit === null && latestData.assets === null) return null;

    // Roky pôsobenia na trhu — prednostne z presného dátumu založenia firmy
    // (pole "datumZalozenia" priamo z RegisterUZ). Ak by chýbalo (staršie/
    // neúplné záznamy), záložne dolný odhad z najstaršej dostupnej závierky.
    let yearsInBusiness = null;
    let yearsInBusinessIsExact = false;
    if (uj?.datumZalozenia) {
      const foundedYear = new Date(uj.datumZalozenia).getFullYear();
      const currentYear = new Date().getFullYear();
      if (!isNaN(foundedYear)) {
        yearsInBusiness = Math.max(0, currentYear - foundedYear);
        yearsInBusinessIsExact = true;
      }
    }
    if (yearsInBusiness === null) {
      try {
        const earliestId = closureIds[0];
        const earliestClosure = await getJson(`${base}/uctovna-zavierka?id=${earliestId}`);
        if (earliestClosure?.obdobieOd) {
          const earliestYear = new Date(earliestClosure.obdobieOd).getFullYear();
          const currentYear = new Date().getFullYear();
          if (!isNaN(earliestYear)) yearsInBusiness = Math.max(0, currentYear - earliestYear);
        }
      } catch (_) {
        yearsInBusiness = null;
      }
    }

    // Finančný dlh = bankové úvery a výpomoci (nie všetky záväzky!). Ak sa
    // nepodarilo vyčítať konkrétny riadok, záložne použijeme aktíva − vlastné
    // imanie (t.j. všetky záväzky) — menej presné, ale lepšie než nič.
    const financialDebt =
      latestData.financialDebt != null
        ? latestData.financialDebt
        : latestData.assets != null && latestData.equity != null
        ? Math.max(0, latestData.assets - latestData.equity)
        : null;

    return {
      ico: cleanIco,
      nazovUJ: uj?.nazovUJ || null,
      skNace: uj?.skNace || null,
      kraj: uj?.kraj || null,
      obdobie: recentClosures[0]?.obdobieDo || null,
      yearsInBusiness,
      yearsInBusinessIsExact,
      annualRevenue: latestData.revenue,
      netProfit: avgProfit ?? latestData.profit,
      ebitda: avgEbitda,
      ebitdaIsReal: avgEbitda != null,
      totalAssets: latestData.assets,
      equity: latestData.equity,
      liabilities: latestData.liabilities,
      financialDebt,
      financialDebtIsReal: latestData.financialDebt != null,
      growthTrend, // null, ak sa nedalo spoľahlivo určiť (appka potom použije odhad)
      revenueHistory, // pole {obdobie, revenue} pre transparentné zobrazenie, najstarší rok prvý
    };
  } catch (_) {
    return null;
  }
}

async function resolveValuationInputs(profile) {
  // 1) Skontrolovať, či poradca zadal reálne dáta cez skrytý admin panel —
  // kľúčované podľa konkrétnej firmy (IČO, alebo názov+krajina), aby sa dáta
  // jednej firmy nikdy neuplatnili pri inej.
  let manual = null;
  try {
    const res = await storage.get(`manualFinancials:${companyKey(profile)}`);
    manual = res ? JSON.parse(res.value) : null;
  } catch (_) {
    manual = null;
  }

  // 2) Ak je firma zo Slovenska a má vyplnené IČO, skúsiť reálne dáta z RegisterUZ
  let ruz = null;
  if (profile?.country === "Slovensko" && profile?.ico) {
    ruz = await fetchRegisterUzData(profile.ico);
  }

  const h = hashString((profile?.companyName || "") + (profile?.country || "") + (profile?.region || ""));
  const cd = COUNTRY_FINANCE_DEFAULTS[profile?.country] || COUNTRY_FINANCE_DEFAULTS["Iná krajina"];

  // 3) Reálny kurz meny naživo z ECB (Frankfurter API), so zálohou na statickú tabuľku
  const liveRate = await fetchLiveExchangeRate(cd.currency);
  const exchangeRate = liveRate != null ? liveRate : cd.exchangeRate;

  // 3b) Reálna nezamestnanosť a inflácia naživo z Eurostatu — jemne upravia
  // krajinovú rizikovú prirážku (Country Risk Premium). Ak sa nepodarí
  // stiahnuť (napr. krajina mimo EÚ, alebo výpadok siete), použije sa
  // pôvodná orientačná hodnota z tabuľky bez úpravy.
  const macro = profile?.country ? await fetchCountryMacroData(profile.country) : null;

  // 3b-2) Výnosy štátnych dlhopisov (Eurostat) — živý trhový proxy namiesto
  // kreditného ratingu. Nemecký výnos = risk-free rate, rozdiel oproti nemu
  // = trhovo odvodená Country Risk Premium. Ak zlyhá, použije sa statická
  // orientačná tabuľka ako záloha.
  const marketRisk = profile?.country ? await fetchMarketRiskData(profile.country) : null;

  // 3c) Ak ide o slovenskú firmu s krajom známym z RegisterUZ, skúsiť
  // presnejšiu regionálnu (NUTS2) nezamestnanosť namiesto celoštátnej.
  let regional = null;
  if (profile?.country === "Slovensko" && ruz?.kraj) {
    regional = await fetchRegionalUnemployment(ruz.kraj);
  }
  const effectiveUnemployment = regional?.unemployment ?? macro?.unemployment ?? null;

  const riskFreeRate = marketRisk?.riskFreeRate ?? 3.5;
  let countryRiskPremium =
    marketRisk?.marketCountryRiskPremium != null ? marketRisk.marketCountryRiskPremium : cd.countryRiskPremium;
  if (macro || regional) {
    let macroAdj = 0;
    if (effectiveUnemployment != null) macroAdj += Math.max(0, effectiveUnemployment - 5) * 0.1;
    if (macro?.inflation != null) macroAdj += Math.max(0, macro.inflation - 2) * 0.15;
    macroAdj = Math.min(macroAdj, 2.5); // strop, aby prirážka nevystrelila nezmyselne vysoko
    countryRiskPremium += macroAdj;
  }

  // 4) Placeholder pre to, k čomu nemáme reálny zdroj a čo nebolo zadané ručne ani nájdené v RegisterUZ
  const revenue = 150000 + (h % 1850000); // 150k – 2M
  const ebitdaMargin = 0.08 + ((h >> 3) % 10) / 100; // 8–17 %
  const placeholderEbitda = Math.round(revenue * ebitdaMargin);
  const placeholderNetProfit = Math.round(placeholderEbitda * 0.72);
  const placeholderYears = 2 + ((h >> 6) % 19); // 2–20 rokov
  const placeholderEquity = Math.round(placeholderNetProfit * (2 + ((h >> 9) % 3)));
  const placeholderDebt = Math.round(revenue * (0.05 + ((h >> 12) % 20) / 100));

  const growthOptions = ["declining", "stable", "growing", "rapid"];
  const dependencyOptions = ["low", "medium", "high"];
  const concentrationOptions = ["diversified", "moderate", "concentrated"];

  // Priorita pre každé pole zvlášť: ručný vstup poradcu > RegisterUZ > placeholder
  const resolvedRevenue = manual?.annualRevenue ? Number(manual.annualRevenue) : ruz?.annualRevenue ?? revenue;
  const netProfit = manual?.netProfit ? Number(manual.netProfit) : ruz?.netProfit ?? placeholderNetProfit;
  const ebitda = manual?.ebitda ? Number(manual.ebitda) : ruz?.ebitda ?? placeholderEbitda;
  const equity = manual?.equity ? Number(manual.equity) : ruz?.equity ?? placeholderEquity;
  const debt = manual?.debt ? Number(manual.debt) : ruz?.financialDebt ?? placeholderDebt;
  const years = manual?.yearsInBusiness
    ? Number(manual.yearsInBusiness)
    : ruz?.yearsInBusiness ?? placeholderYears;

  const inputs = {
    industry: manual?.industry || mapNaceToIndustry(ruz?.skNace) || "other",
    yearsInBusiness: String(years),
    annualRevenue: String(resolvedRevenue),
    ebitda: String(ebitda),
    netProfit: String(netProfit),
    growthTrend: manual?.growthTrend || ruz?.growthTrend || growthOptions[(h >> 2) % growthOptions.length],
    ownerDependency: manual?.ownerDependency || dependencyOptions[(h >> 4) % dependencyOptions.length],
    customerConcentration: manual?.customerConcentration || concentrationOptions[(h >> 5) % concentrationOptions.length],
    equity: String(equity),
  };
  const advanced = {
    enabled: true,
    debtToEquity: String(Math.round((debt / Math.max(equity, 1)) * 100)),
    debt: String(debt),
    creditSpread: "3.0",
    riskFreeRate: riskFreeRate.toFixed(2),
    marketRiskPremium: "5.5",
    countryRiskPremium: countryRiskPremium.toFixed(2),
    inflationDifferential: "0",
    taxRate: String(cd.taxRate),
    currency: cd.currency,
    exchangeRate: String(exchangeRate),
  };
  const dataSource = manual ? "manual" : ruz ? "registeruz" : "placeholder";
  return { inputs, advanced, usedManualData: !!manual, dataSource, ruzInfo: ruz, macro, regional, marketRisk };
}

/* ============================================================
   SKRYTÝ ADMIN PANEL — pre poradcu, nie pre podnikateľa
   ============================================================
   Prístupné iba cez URL adresu s #admin na konci (napr.
   tvoja-appka.vercel.app/#admin). Bežný používateľ (podnikateľ) sa
   sem nedostane, pokiaľ mu presnú adresu nedáš. Slúži na to, aby si
   pred stretnutím vedel vložiť skutočné (alebo čo najpresnejšie
   odhadnuté) finančné údaje konkrétnej firmy — namiesto placeholder
   čísel. Uložené dáta majú prednosť pred automatickým odhadom.
   ============================================================ */
function AdminOverridePanel({ onClose }) {
  const [data, setData] = useState({
    industry: "other",
    yearsInBusiness: "",
    annualRevenue: "",
    ebitda: "",
    netProfit: "",
    equity: "",
    debt: "",
    growthTrend: "stable",
    ownerDependency: "medium",
    customerConcentration: "moderate",
  });
  const [savedMsg, setSavedMsg] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let loadedProfile = null;
      try {
        const p = await storage.get("profile");
        loadedProfile = p ? JSON.parse(p.value) : null;
        setProfile(loadedProfile);
      } catch (_) {}
      if (loadedProfile) {
        try {
          const res = await storage.get(`manualFinancials:${companyKey(loadedProfile)}`);
          if (res) setData((s) => ({ ...s, ...JSON.parse(res.value) }));
        } catch (_) {}
      }
      setLoading(false);
    })();
  }, []);

  const upd = (k) => (v) => setData((s) => ({ ...s, [k]: v }));

  const handleSave = async () => {
    if (!profile) return;
    try {
      await storage.set(`manualFinancials:${companyKey(profile)}`, JSON.stringify(data));
      setSavedMsg("Uložené pre túto firmu. Použije sa pri jej ďalšom výpočte.");
    } catch (_) {
      setSavedMsg("Nepodarilo sa uložiť.");
    }
  };

  const handleClear = async () => {
    if (!profile) return;
    try {
      await storage.delete(`manualFinancials:${companyKey(profile)}`);
    } catch (_) {}
    setData({
      industry: "other",
      yearsInBusiness: "",
      annualRevenue: "",
      ebitda: "",
      netProfit: "",
      equity: "",
      debt: "",
      growthTrend: "stable",
      ownerDependency: "medium",
      customerConcentration: "moderate",
    });
    setSavedMsg("Vymazané pre túto firmu — appka sa pre ňu vráti k automatickému odhadu.");
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 20px 60px" }}>
      <div
        style={{
          fontSize: 12,
          color: COLORS.brassDeep,
          fontFamily: "'IBM Plex Mono', monospace",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 8,
        }}
      >
        Skrytý panel pre poradcu — nevidí ho podnikateľ
      </div>
      <p style={{ color: COLORS.inkSoft, fontSize: 13.5, marginBottom: 20 }}>
        Sem zadaj skutočné (alebo čo najpresnejšie odhadnuté) finančné údaje firmy pred stretnutím. Prázdne polia sa
        doplnia automatickým odhadom. Toto okno sa zobrazí len pri návšteve adresy s <code>#admin</code> na konci.
        Údaje sa ukladajú <strong>osobitne pre každú firmu</strong> (podľa IČO), takže sa nikdy nepomiešajú.
      </p>

      {!loading && !profile && (
        <div
          style={{
            background: "rgba(225,90,80,0.08)",
            border: `1px solid ${COLORS.red}`,
            borderRadius: 12,
            padding: 14,
            marginBottom: 18,
            fontSize: 13,
            color: COLORS.ink,
          }}
        >
          Zatiaľ nie je uložený žiadny firemný profil. Najprv prejdi celým wizardom (4 kroky) pre konkrétnu firmu — až
          potom sa sem vráť a zadaj jej reálne údaje. Bez toho appka nevie, ku ktorej firme má tieto dáta priradiť.
        </div>
      )}

      {profile?.companyName && (
        <div
          style={{
            background: "#fff",
            border: `1px solid ${COLORS.line}`,
            borderRadius: 12,
            padding: 14,
            marginBottom: 18,
          }}
        >
          <div style={{ fontSize: 13, color: COLORS.ink, fontWeight: 600, marginBottom: 4 }}>
            Aktuálny profil: {profile.companyName}
            {profile.ico ? ` (IČO ${profile.ico})` : ""}
          </div>
          <div style={{ fontSize: 12.5, color: COLORS.inkSoft }}>
            {profile.country}
            {profile.region ? `, ${profile.region}` : ""}
          </div>
          {profile.ico && profile.country === "Slovensko" && (
            <a
              href={`https://www.orsr.sk/hladaj_ico.asp?ICO=${profile.ico}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                marginTop: 8,
                fontSize: 12.5,
                color: COLORS.brassDeep,
                fontWeight: 600,
              }}
            >
              Otvoriť firmu v Obchodnom registri SR (overiť vlastníkov / podiely ručne) →
            </a>
          )}
        </div>
      )}
      <Card accent>
        <SelectInput
          label="Odvetvie"
          value={data.industry}
          onChange={upd("industry")}
          options={Object.entries(INDUSTRIES).map(([value, v]) => ({ value, label: v.label }))}
        />
        <NumberInput label="Roky pôsobenia na trhu" value={data.yearsInBusiness} onChange={upd("yearsInBusiness")} suffix="rokov" />
        <NumberInput label="Ročné tržby" value={data.annualRevenue} onChange={upd("annualRevenue")} />
        <NumberInput label="EBITDA" value={data.ebitda} onChange={upd("ebitda")} />
        <NumberInput label="Čistý zisk" value={data.netProfit} onChange={upd("netProfit")} />
        <NumberInput label="Vlastné imanie" value={data.equity} onChange={upd("equity")} />
        <NumberInput label="Dlh (celková výška)" value={data.debt} onChange={upd("debt")} />
        <SelectInput label="Trend tržieb" value={data.growthTrend} onChange={upd("growthTrend")} options={GROWTH_OPTIONS} />
        <SelectInput label="Závislosť od majiteľa" value={data.ownerDependency} onChange={upd("ownerDependency")} options={DEPENDENCY_OPTIONS} />
        <SelectInput label="Koncentrácia zákazníkov" value={data.customerConcentration} onChange={upd("customerConcentration")} options={CONCENTRATION_OPTIONS} />

        {savedMsg && (
          <div style={{ fontSize: 13, color: COLORS.teal, background: "rgba(14,163,126,0.08)", padding: "8px 10px", borderRadius: 10, marginBottom: 12 }}>
            {savedMsg}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleSave}
            disabled={!profile}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 10,
              border: "none",
              background: profile ? COLORS.ink : COLORS.line,
              color: profile ? COLORS.paper : COLORS.inkSoft,
              fontWeight: 700,
              fontSize: 13.5,
              cursor: profile ? "pointer" : "not-allowed",
            }}
          >
            Uložiť
          </button>
          <button
            onClick={handleClear}
            disabled={!profile}
            style={{
              padding: "11px 16px",
              borderRadius: 10,
              border: `1px solid ${COLORS.line}`,
              background: "#fff",
              color: profile ? COLORS.ink : COLORS.line,
              fontWeight: 600,
              fontSize: 13.5,
              cursor: profile ? "pointer" : "not-allowed",
            }}
          >
            Vymazať
          </button>
        </div>
      </Card>
      <button
        onClick={onClose}
        style={{ background: "none", border: "none", color: COLORS.inkSoft, fontSize: 13, cursor: "pointer", textDecoration: "underline" }}
      >
        Zavrieť a prejsť do bežnej appky
      </button>
    </div>
  );
}

/* ============================================================
   HLAVNÁ APLIKÁCIA
   ============================================================ */
export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(
    typeof window !== "undefined" && window.location.hash === "#admin"
  );

  useEffect(() => {
    const onHashChange = () => {
      const nowAdmin = window.location.hash === "#admin";
      setIsAdminRoute((wasAdmin) => {
        if (wasAdmin && !nowAdmin) setDataRefreshKey((k) => k + 1); // vynúti prepočet po návrate z admin panela
        return nowAdmin;
      });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const [inputs, setInputs] = useState({
    industry: "retail",
    yearsInBusiness: "5",
    annualRevenue: "",
    ebitda: "",
    netProfit: "",
    growthTrend: "stable",
    ownerDependency: "medium",
    customerConcentration: "moderate",
    equity: "",
  });
  const [advanced, setAdvanced] = useState({
    enabled: false,
    debtToEquity: "40",
    debt: "",
    creditSpread: "3.0",
    riskFreeRate: "3.5",
    marketRiskPremium: "5.5",
    countryRiskPremium: "1.0",
    inflationDifferential: "0",
    taxRate: "21",
    currency: "USD",
    exchangeRate: "1.08",
  });
  const [result, setResult] = useState(null);
  const [showMethodology, setShowMethodology] = useState(false);
  const [history, setHistory] = useState([]);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);

  const handleGoHome = async () => {
    setProfile(null);
    setResult(null);
    setSaved(false);
    setEditingProfile(false);
    setShowMethodology(false);
    try {
      await storage.delete("profile");
    } catch (_) {}
  };
  const resultsRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get(`valuations`);
        if (res) setHistory(JSON.parse(res.value));
      } catch (_) {
        setHistory([]);
      }
    })();
    (async () => {
      setProfileLoading(true);
      try {
        const res = await storage.get(`profile`);
        setProfile(res ? JSON.parse(res.value) : null);
      } catch (_) {
        setProfile(null);
      }
      setProfileLoading(false);
    })();
  }, []);

  const handleProfileComplete = async (data) => {
    setProfile(data);
    setEditingProfile(false);
    try {
      await storage.set(`profile`, JSON.stringify(data));
    } catch (_) {}
  };

  const [computing, setComputing] = useState(false);
  const [dataRefreshKey, setDataRefreshKey] = useState(0);

  // Automatický výpočet na pozadí — spustí sa hneď, ako je firemný profil
  // hotový, a tiež po každom návrate zo skrytého admin panela (dataRefreshKey),
  // aby sa prípadné novo uložené ručné dáta hneď premietli do výsledku.
  // Používateľ nemá prístup k vstupným parametrom ani k tomuto kódu;
  // dáta pre výpočet dodáva výhradne resolveValuationInputs (pozri vyššie).
  useEffect(() => {
    if (!profile || editingProfile) return;
    let cancelled = false;
    (async () => {
      setComputing(true);
      setResult(null);
      const {
        inputs: resolvedInputs,
        advanced: resolvedAdvanced,
        usedManualData,
        dataSource,
        ruzInfo,
        macro,
        regional,
        marketRisk,
      } = await resolveValuationInputs(profile);
      if (cancelled) return;

      const e = Number(resolvedInputs.ebitda) || 0;
      const n = Number(resolvedInputs.netProfit) || 0;
      const effEbitda = e > 0 ? e : n > 0 ? n / 0.75 : 0;
      const effNetProfit = n > 0 ? n : e > 0 ? e * 0.75 : 0;

      const capm = resolvedAdvanced.enabled ? computeCapmWacc(resolvedAdvanced) : null;
      const baseCapRateOverridePct = capm ? capm.wacc * 100 : null;
      const debtAmount = resolvedAdvanced.enabled ? Number(resolvedAdvanced.debt) || 0 : 0;
      const dataConfidence = computeDataConfidence({ dataSource, ruzInfo, marketRisk });

      const calc = calculateValuation(
        { ...resolvedInputs, ebitda: effEbitda, netProfit: effNetProfit },
        baseCapRateOverridePct,
        debtAmount,
        dataConfidence
      );
      calc.capm = capm;
      calc.usedManualData = usedManualData;
      calc.dataSource = dataSource;
      calc.ruzInfo = ruzInfo;
      calc.macro = macro;
      calc.regional = regional;
      calc.marketRisk = marketRisk;

      setInputs(resolvedInputs);
      setAdvanced(resolvedAdvanced);
      if (!cancelled) {
        setResult(calc);
        setSaved(false);
        setComputing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile, editingProfile, dataRefreshKey]);

  const handleSave = async () => {
    if (!result) return;
    const entry = {
      ts: Date.now(),
      companyName: profile?.companyName || "Neznáma firma",
      ico: profile?.ico || null,
      industry: INDUSTRIES[inputs.industry].label,
      rangeLow: result.unleveredLow,
      rangeHigh: result.unleveredHigh,
      midpoint: result.unleveredMid,
      leveredMid: result.debt > 0 ? result.leveredMid : null,
    };
    const next = [entry, ...history].slice(0, 8);
    setHistory(next);
    try {
      await storage.set(`valuations`, JSON.stringify(next));
    } catch (_) {}
    setSaved(true);
  };

  const handleDeleteHistory = async (ts) => {
    const next = history.filter((h) => h.ts !== ts);
    setHistory(next);
    try {
      await storage.set(`valuations`, JSON.stringify(next));
    } catch (_) {}
  };

  if (isAdminRoute) {
    return (
      <div style={{ minHeight: "100%", width: "100%", background: COLORS.paper, fontFamily: "'IBM Plex Sans', sans-serif" }}>
        <style>{FONT_IMPORT}</style>
        <AdminOverridePanel onClose={() => { window.location.hash = ""; setIsAdminRoute(false); setDataRefreshKey((k) => k + 1); }} />
      </div>
    );
  }

  return (
    <div className="hodnotomer-root" style={{ minHeight: "100%", width: "100%", background: COLORS.paper, fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <style>{`
        .print-only { display: none; }
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .hodnotomer-root { background: #fff !important; }
          .print-card { box-shadow: none !important; border: 1px solid #ccc !important; }
          .sticky-wrap { position: static !important; }
        }
      `}</style>

      {/* HEADER */}
      <div className="no-print" style={{ background: COLORS.ink, color: COLORS.paper, padding: "16px 20px", boxShadow: "0 4px 16px rgba(24,36,73,0.18)", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <GaugeIcon size={20} color={COLORS.brass} />
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 18, lineHeight: 1 }}>Hodnotomer</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#9AA5B8", letterSpacing: "0.05em" }}>
                {profile?.companyName || "Indikatívne ocenenie firmy"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {profile && !editingProfile && (
              <button
                onClick={handleGoHome}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  border: `1px solid rgba(255,255,255,0.25)`,
                  color: COLORS.paper,
                  borderRadius: 999,
                  padding: "7px 14px",
                  fontSize: 12.5,
                  cursor: "pointer",
                }}
              >
                <Home size={13} /> Späť na úvod
              </button>
            )}
          </div>
        </div>
      </div>

      {profileLoading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: COLORS.inkSoft, fontSize: 14 }}>Načítavam profil firmy…</div>
      ) : !profile || editingProfile ? (
        <CompanyWizard initialData={editingProfile ? profile : null} onComplete={handleProfileComplete} />
      ) : (
      <>
      {/* CONTENT */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 20px 60px", display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div ref={resultsRef}>
            <div className="sticky-wrap" style={{ position: "sticky", top: 20 }}>
              <Card accent>
                {computing ? (
                  <div style={{ textAlign: "center", padding: "40px 10px" }}>
                    <GaugeIcon size={38} color={COLORS.brass} style={{ margin: "0 auto 16px", animation: "spin 2.2s linear infinite" }} />
                    <div style={{ color: COLORS.ink, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Analyzujeme {profile?.companyName}…</div>
                    <div style={{ color: COLORS.inkSoft, fontSize: 13 }}>Načítavame finančné údaje a počítame ocenenie.</div>
                    <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
                  </div>
                ) : !result ? (
                  <div style={{ textAlign: "center", padding: "30px 10px" }}>
                    <GaugeIcon size={38} color={COLORS.line} style={{ margin: "0 auto 12px" }} />
                    <div style={{ color: COLORS.inkSoft, fontSize: 14 }}>
                      Výsledný odhad sa zobrazí tu automaticky.
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Hlavička viditeľná len pri tlači/PDF exporte */}
                    <div className="print-only" style={{ marginBottom: 18, paddingBottom: 14, borderBottom: `2px solid ${COLORS.ink}` }}>
                      <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 20, color: COLORS.ink }}>
                        Indikatívne ocenenie firmy
                      </div>
                      <div style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 4 }}>
                        {profile?.companyName}
                        {profile?.region ? ` · ${profile.region}, ${profile.country}` : profile?.country ? ` · ${profile.country}` : ""}
                      </div>
                      <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 2, fontFamily: "'IBM Plex Mono', monospace" }}>
                        Vygenerované {new Date().toLocaleDateString("sk-SK")} · nástroj Hodnotomer
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <SectionEyebrow>Súhrn ocenenia</SectionEyebrow>
                      {(() => {
                        const c = result.dataConfidence ?? 0;
                        const badge =
                          c >= 0.7
                            ? { text: "Vysoká spoľahlivosť dát", bg: "rgba(14,163,126,0.12)", fg: COLORS.tealDeep }
                            : c >= 0.35
                            ? { text: "Čiastočne reálne dáta", bg: "rgba(217,164,65,0.15)", fg: COLORS.brassDeep }
                            : { text: "Orientačný odhad", bg: COLORS.paperDeep, fg: COLORS.inkSoft };
                        return (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "4px 10px",
                              borderRadius: 999,
                              background: badge.bg,
                              color: badge.fg,
                              letterSpacing: "0.02em",
                              marginBottom: -4,
                            }}
                          >
                            {badge.text}
                          </span>
                        );
                      })()}
                    </div>
                    <div style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 4, marginBottom: 10 }}>
                      {result.debt > 0 ? "Hodnota podniku (Unlevered / Enterprise Value)" : "Indikatívna trhová hodnota"}
                    </div>
                    <ValueGauge low={result.unleveredLow} high={result.unleveredHigh} mid={result.unleveredMid} />
                    <div style={{ textAlign: "center", marginTop: 4 }}>
                      <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 38, color: COLORS.ink, letterSpacing: "-0.01em" }}>
                        {formatEUR(result.unleveredMid)}
                      </div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: COLORS.inkSoft, marginTop: 2 }}>
                        rozpätie {formatEUR(result.unleveredLow)} – {formatEUR(result.unleveredHigh)}
                      </div>
                      {advanced.enabled && Number(advanced.exchangeRate) > 0 && (
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: COLORS.brassDeep, marginTop: 4 }}>
                          ≈ {(result.unleveredMid * Number(advanced.exchangeRate)).toLocaleString("sk-SK", { maximumFractionDigits: 0 })}{" "}
                          {advanced.currency} (kurz 1 € = {advanced.exchangeRate} {advanced.currency})
                        </div>
                      )}
                    </div>

                    {result.debt > 0 && (
                      <div
                        style={{
                          marginTop: 14,
                          background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.tealDeep} 100%)`,
                          color: "#fff",
                          borderRadius: 6,
                          padding: "14px 16px",
                          boxShadow: "0 8px 20px -8px rgba(10,122,95,0.45)",
                        }}
                      >
                        <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.85, marginBottom: 4 }}>
                          Hodnota pre vlastníka (Levered / Equity Value)
                        </div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 24 }}>
                          {formatEUR(result.leveredMid)}
                        </div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, opacity: 0.9, marginTop: 2 }}>
                          rozpätie {formatEUR(result.leveredLow)} – {formatEUR(result.leveredHigh)} · po odpočítaní dlhu {formatEUR(result.debt)}
                        </div>
                      </div>
                    )}

                    {Number(inputs.equity) > 0 && (
                      <div
                        style={{
                          marginTop: 16,
                          fontSize: 12.5,
                          color: COLORS.inkSoft,
                          background: COLORS.paperDeep,
                          borderRadius: 10,
                          padding: "8px 10px",
                          display: "flex",
                          gap: 6,
                          alignItems: "flex-start",
                        }}
                      >
                        <Info size={14} style={{ marginTop: 1, flexShrink: 0 }} />
                        Pre porovnanie: vykázané vlastné imanie firmy je {formatEUR(Number(inputs.equity))}.
                      </div>
                    )}

                    <div style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid ${COLORS.line}` }}>
                      <SectionEyebrow>Rozpis podľa metód</SectionEyebrow>
                      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                        <MiniStat label="Kapitalizácia zisku" value={`${formatEUR(result.capValueLow)} – ${formatEUR(result.capValueHigh)}`} />
                        <MiniStat label="Trhový násobok EBITDA" value={`${formatEUR(result.ebitdaValueLow)} – ${formatEUR(result.ebitdaValueHigh)}`} />
                      </div>
                    </div>

                    <div className="no-print" style={{ display: "flex", gap: 10, marginTop: 18 }}>
                      <button
                        onClick={handleSave}
                        style={{
                          flex: 1,
                          padding: "11px 0",
                          borderRadius: 999,
                          border: `1px solid ${COLORS.ink}`,
                          background: saved ? COLORS.ink : "transparent",
                          color: saved ? COLORS.paper : COLORS.ink,
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          transition: "background 150ms ease, color 150ms ease",
                        }}
                      >
                        <Save size={14} /> {saved ? "Uložené" : "Uložiť odhad"}
                      </button>
                      <button
                        onClick={() => window.print()}
                        style={{
                          flex: 1,
                          padding: "11px 0",
                          borderRadius: 999,
                          border: `1px solid ${COLORS.brassDeep}`,
                          background: "transparent",
                          color: COLORS.brassDeep,
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          transition: "background 150ms ease",
                        }}
                      >
                        <Download size={14} /> Stiahnuť ako PDF
                      </button>
                    </div>
                    <div className="no-print" style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 8, textAlign: "center" }}>
                      Tip: ak chceš do PDF zahrnúť aj vysvetlenie metodiky, najprv nižšie rozklikni "Ako to počítame".
                    </div>
                  </>
                )}
              </Card>

              <Card>
                <button
                  onClick={() => setShowMethodology((s) => !s)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <SectionEyebrow>Ako to počítame</SectionEyebrow>
                  <ChevronDown
                    size={16}
                    color={COLORS.inkSoft}
                    style={{ transform: showMethodology ? "rotate(180deg)" : "none", transition: "transform 200ms" }}
                  />
                </button>
                {showMethodology && (
                  <div style={{ fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.6, marginTop: 8 }}>
                    <p style={{ margin: "0 0 10px" }}>
                      Nástroj kombinuje dve bežné zjednodušené metódy a výsledok ukazuje ako rozpätie:
                    </p>
                    <p style={{ margin: "0 0 8px", color: COLORS.ink, fontWeight: 600 }}>1. Kapitalizácia zisku</p>
                    <p style={{ margin: "0 0 10px" }}>
                      Hodnota = čistý zisk / kapitalizačná miera. Základná miera vychádza z nákladu kapitálu
                      (WACC) vypočítaného z trhových vstupov (risk-free rate, market a country risk premium,
                      náklad dlhu, daň) — tie appka získava automaticky na pozadí. Na túto
                      základnú mieru sa vždy pripočíta prirážka za špecifické riziko malej firmy
                      (dĺžka pôsobenia, závislosť od majiteľa, trend tržieb, koncentrácia zákazníkov) — WACC
                      totiž zachytáva trhové riziko, nie riziko konkrétnej malej firmy.
                      {result ? ` Aktuálna výsledná miera: ${result.capRateMid.toFixed(1)}%.` : ""}
                    </p>
                    {result && (
                      <p style={{ margin: "0 0 10px" }}>
                        <strong style={{ color: COLORS.ink }}>Šírka rozpätia</strong> okolo tejto miery aj okolo
                        odvetvového násobku nie je pevná — zužuje sa podľa toho, koľko vstupov je reálnych (nie
                        odhadovaných). Momentálne: {(result.dataConfidence * 100).toFixed(0)} % spoľahlivosť dát →
                        pásmo kapitalizačnej miery ±{result.capRateBand.toFixed(1)} p.b. (pri čisto odhadovaných
                        dátach by bolo ±6 p.b., pri kompletne reálnych dátach ±2 p.b.). Rovnaký princíp zužuje aj
                        rozsah odvetvového násobku EBITDA.
                      </p>
                    )}
                    {result?.capm && (
                      <>
                        <p style={{ margin: "0 0 6px" }}>
                          WACC = podiel vlastného kapitálu × náklad vlastného kapitálu (Ke) + podiel cudzieho kapitálu ×
                          náklad cudzieho kapitálu po dani (Kd). Bez bety: Ke = risk-free rate + market risk premium +
                          country risk premium, upravené o infláčný diferenciál. Kd = risk-free rate + credit spread.
                          Váhy Ke/Kd určuje zadaný Debt-to-Equity Ratio.
                        </p>
                        <div
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 12,
                            background: COLORS.paperDeep,
                            borderRadius: 10,
                            padding: "8px 10px",
                            marginBottom: 10,
                          }}
                        >
                          WACC {(result.capm.wacc * 100).toFixed(2)}% · Ke {(result.capm.costOfEquity * 100).toFixed(2)}% · Kd
                          (po dani) {(result.capm.costOfDebtAfterTax * 100).toFixed(2)}% · váha VK/CK{" "}
                          {(result.capm.weightEquity * 100).toFixed(0)}% / {(result.capm.weightDebt * 100).toFixed(0)}%
                        </div>
                        {result.marketRisk?.marketCountryRiskPremium != null ? (
                          <p style={{ margin: "0 0 10px", fontSize: 12.5 }}>
                            <strong style={{ color: COLORS.ink }}>Risk-free rate a Country Risk Premium sú trhovo
                            odvodené</strong> z výnosov 10-ročných štátnych dlhopisov (Eurostat): Nemecko{" "}
                            {result.marketRisk.riskFreeRate.toFixed(2)}% (= risk-free rate), {profile?.country}{" "}
                            {result.marketRisk.countryYield?.toFixed(2)}% → spread (Country Risk Premium základ){" "}
                            {result.marketRisk.marketCountryRiskPremium.toFixed(2)} p.b. Toto je živý trhový proxy
                            namiesto kreditného ratingu (ten voľné API nemá).
                          </p>
                        ) : (
                          <p style={{ margin: "0 0 10px", fontSize: 12.5 }}>
                            Výnosy štátnych dlhopisov sa nepodarilo stiahnuť, preto sa risk-free rate (3,5 %) a základná
                            Country Risk Premium použili zo statickej orientačnej tabuľky.
                          </p>
                        )}
                        {profile?.country && (
                          <p style={{ margin: "0 0 6px", fontSize: 12.5 }}>
                            <strong style={{ color: COLORS.ink }}>Krajina:</strong> {profile.country} · daň z príjmu
                            právnických osôb {advanced.taxRate}% · základná Country Risk Premium{" "}
                            {(COUNTRY_FINANCE_DEFAULTS[profile.country] || COUNTRY_FINANCE_DEFAULTS["Iná krajina"]).countryRiskPremium}%
                          </p>
                        )}
                        {(result.macro || result.regional) && (
                          <p style={{ margin: "0 0 10px", fontSize: 12.5 }}>
                            Country Risk Premium bola doladená podľa aktuálnych dát z Eurostatu:{" "}
                            {result.regional
                              ? `regionálna nezamestnanosť v regióne ${result.regional.kraj} (${result.regional.nuts2}) ${result.regional.unemployment.toFixed(1)} %`
                              : result.macro?.unemployment != null
                              ? `celoštátna nezamestnanosť ${result.macro.unemployment.toFixed(1)} %`
                              : ""}
                            {result.macro?.inflation != null &&
                              `, inflácia (HICP) ${result.macro.inflation.toFixed(1)} %`}{" "}
                            → výsledná prirážka {advanced.countryRiskPremium}%.
                            {result.regional &&
                              " Použitá je presnejšia regionálna hodnota namiesto celoštátneho priemeru, keďže firma má z RegisterUZ známy kraj."}
                          </p>
                        )}
                      </>
                    )}
                    {result && (
                      <p style={{ margin: "0 0 10px" }}>
                        <strong style={{ color: COLORS.ink }}>Zdroj vstupných dát:</strong> kurz meny sa načítava naživo
                        z verejného ECB API.{" "}
                        {result.dataSource === "manual" &&
                          "Finančné údaje (tržby, zisk, aktíva...) pre túto firmu boli zadané ručne poradcom vopred."}
                        {result.dataSource === "registeruz" &&
                          `Tržby, výsledok hospodárenia a vlastné imanie sú načítané z verejného Registra účtovných závierok SR (RegisterUZ)${
                            result.ruzInfo?.obdobie ? `, obdobie do ${result.ruzInfo.obdobie}` : ""
                          }.${
                            result.ruzInfo?.skNace
                              ? ` Odvetvie bolo automaticky určené podľa SK NACE kódu firmy (${result.ruzInfo.skNace}).`
                              : ""
                          }${
                            result.ruzInfo?.growthTrend
                              ? " Trend tržieb je vypočítaný z reálnych viacročných dát (nie odhad)."
                              : " Trend tržieb nebolo možné spoľahlivo určiť z dostupných rokov, preto je odhadovaný."
                          }${
                            result.ruzInfo?.yearsInBusiness != null
                              ? result.ruzInfo.yearsInBusinessIsExact
                                ? ` Roky pôsobenia (${result.ruzInfo.yearsInBusiness}) sú vypočítané z presného dátumu založenia firmy v registri.`
                                : ` Roky pôsobenia (${result.ruzInfo.yearsInBusiness}) sú odvodené z najstaršej dostupnej závierky v registri — ide o dolný odhad, firma môže reálne existovať aj dlhšie.`
                              : ""
                          }${
                            result.ruzInfo?.ebitdaIsReal
                              ? " EBITDA je vypočítaná z reálnych dát registra (prevádzkový výsledok + odpisy)."
                              : " EBITDA sa nepodarilo vyčítať priamo z registra, preto je odhadovaná z čistého zisku."
                          }${
                            result.ruzInfo?.financialDebtIsReal
                              ? " Dlh zohľadňuje len bankové úvery a výpomoci (nie všetky záväzky voči dodávateľom a pod.)."
                              : " Presný riadok bankových úverov sa nenašiel, preto dlh zástupne odhaduje všetky záväzky firmy — to môže hodnotu pre vlastníka mierne podhodnotiť."
                          } Čistý zisk aj EBITDA sú priemerom za dostupné posledné roky (nie len posledný rok), aby jeden mimoriadny rok neskreslil výsledok.`}
                        {result.dataSource === "placeholder" &&
                          "Finančné údaje zatiaľ nemajú pripojený reálny zdroj (firma nie je zo Slovenska, nemá vyplnené IČO, alebo sa nenašla v RegisterUZ), preto ich appka odhaduje zástupne — do systému ich vie poradca vopred vložiť cez skrytý panel."}
                      </p>
                    )}
                    {result?.ruzInfo?.revenueHistory && result.ruzInfo.revenueHistory.length >= 2 && (
                      <div
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 12,
                          background: COLORS.paperDeep,
                          borderRadius: 10,
                          padding: "8px 10px",
                          marginBottom: 10,
                        }}
                      >
                        História tržieb:{" "}
                        {result.ruzInfo.revenueHistory
                          .map((y) => `${new Date(y.obdobie).getFullYear()}: ${formatCompactEUR(y.revenue)}`)
                          .join("  →  ")}
                      </div>
                    )}
                    {result?.debt > 0 && (
                      <p style={{ margin: "0 0 10px" }}>
                        <strong style={{ color: COLORS.ink }}>Unlevered vs. Levered:</strong> hodnota vypočítaná
                        vyššie (kapitalizácia zisku aj EBITDA násobok) predstavuje hodnotu podniku ako celku
                        (Unlevered / Enterprise Value) — bez ohľadu na to, ako je financovaný. Zadaný Debt sa od nej
                        odpočíta, čím sa získa hodnota, ktorá reálne patrí vlastníkovi (Levered / Equity Value) —
                        to je suma relevantná pri predaji firmy.
                      </p>
                    )}
                    <p style={{ margin: "0 0 8px", color: COLORS.ink, fontWeight: 600 }}>2. Trhový násobok EBITDA</p>
                    <p style={{ margin: "0 0 10px" }}>
                      Hodnota = EBITDA × odvetvový násobok. Násobky sú orientačné demonštračné hodnoty pre jednotlivé
                      odvetvia, upravené rovnakými rizikovými faktormi.
                    </p>
                    <p style={{ margin: 0, fontStyle: "italic" }}>
                      Ide o zjednodušený, indikatívny model na demonštračné účely — nenahrádza znalecký posudok ani
                      reálne trhové násobky a mieru kapitalizácie z aktuálnych transakčných dát. Prepočet na inú menu
                      (Selected Exchange Rate) slúži len na zobrazenie a nemení podkladový výpočet v eurách.
                      Finančné a rizikové vstupy získava appka automaticky na pozadí — používateľ ich nevidí ani
                      neupravuje.
                    </p>
                  </div>
                )}
              </Card>

              {history.length > 0 && (
                <div className="no-print">
                <Card>
                  <SectionEyebrow>História odhadov</SectionEyebrow>
                  {history.map((h) => (
                    <div
                      key={h.ts}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: `1px solid ${COLORS.line}`,
                        fontSize: 12.5,
                      }}
                    >
                      <div>
                        <div style={{ color: COLORS.ink, fontWeight: 600 }}>
                          {h.companyName || h.industry}
                        </div>
                        <div style={{ color: COLORS.inkSoft, fontSize: 11 }}>
                          {h.companyName ? h.industry : ""}
                        </div>
                        <div style={{ color: COLORS.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>
                          {formatEUR(h.midpoint)} · {new Date(h.ts).toLocaleDateString("sk-SK")}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteHistory(h.ts)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.inkSoft }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .hodnotomer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      </>
      )}
    </div>
  );
}

function Card({ children, accent = false }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${COLORS.line}`,
        borderTop: accent ? `3px solid ${COLORS.brass}` : `1px solid ${COLORS.line}`,
        borderRadius: 18,
        padding: 24,
        marginBottom: 18,
        transition: "box-shadow 200ms ease, transform 200ms ease",
        boxShadow: accent
          ? "0 20px 40px -16px rgba(24,36,73,0.20), 0 2px 8px -2px rgba(24,36,73,0.06)"
          : "0 1px 3px rgba(24,36,73,0.05)",
      }}
    >
      {children}
    </div>
  );
}

function Toggle({ checked }) {
  return (
    <div
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        background: checked ? COLORS.teal : COLORS.line,
        position: "relative",
        transition: "background 150ms ease",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 150ms ease",
          boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{ flex: 1, background: COLORS.paperDeep, borderRadius: 10, padding: "12px 14px", border: `1px solid ${COLORS.line}` }}>
      <div style={{ fontSize: 11, color: COLORS.inkSoft, marginBottom: 5, letterSpacing: "0.02em" }}>{label}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: COLORS.ink, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

