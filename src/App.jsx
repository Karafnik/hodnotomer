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
  MapPin,
  Phone,
  Briefcase,
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
  ink: "#17233B",
  inkSoft: "#4A5568",
  paper: "#F6F4EE",
  paperDeep: "#EFEBE0",
  line: "#E1DACB",
  brass: "#C2954B",
  brassDeep: "#9C7530",
  teal: "#1F6F5C",
  tealDeep: "#154F42",
  red: "#B0483B",
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
function calculateValuation(inputs, baseCapRateOverridePct = null, debtAmount = 0) {
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
  const capRateLow = clamp(capRateMid - 4, 3, 65); // nižšia miera => vyššia hodnota
  const capRateHigh = clamp(capRateMid + 4, 3, 65);

  const netProfit = Number(inputs.netProfit) || 0;
  const capValueMid = netProfit / (capRateMid / 100);
  const capValueHigh = netProfit / (capRateLow / 100);
  const capValueLow = netProfit / (capRateHigh / 100);

  // kvalitatívny faktor pre trhové násobky (opačné znamienko ako rizikový capAdj)
  const qualityAdj = -capAdj;
  const factor = clamp(1 + qualityAdj / 100, 0.75, 1.25);

  const ebitda = Number(inputs.ebitda) || 0;
  const multLow = sector.low * factor;
  const multHigh = sector.high * factor;
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
      <div style={{ display: "flex", alignItems: "center", border: `1px solid ${COLORS.line}`, borderRadius: 3, background: "#fff", overflow: "hidden" }}>
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
            borderRadius: 3,
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
      city: "",
      companyName: "",
      ico: "",
      companyType: "sro",
      structureType: "hq",
      parentCompany: "",
      contactName: "",
      contactPosition: "",
      contactEmail: "",
      contactPhone: "",
    }
  );
  const [touched, setTouched] = useState(false);

  const upd = (k) => (v) => setData((s) => ({ ...s, [k]: v }));

  const isStepValid = () => {
    if (step === 0) return data.country.trim() && data.city.trim();
    if (step === 1) return data.companyName.trim() && data.companyType;
    if (step === 2) return !!data.structureType;
    if (step === 3) return data.contactName.trim() && /\S+@\S+\.\S+/.test(data.contactEmail);
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
              Táto informácia pomáha zohľadniť krajinové a regionálne riziko v ocenení.
            </p>
            <SelectInput label="Krajina" value={data.country} onChange={upd("country")} options={COUNTRY_OPTIONS} />
            <NumberInputText label="Mesto" value={data.city} onChange={upd("city")} icon={<MapPin size={14} />} />
            {touched && !isStepValid() && <ErrorHint text="Vyplňte prosím krajinu a mesto." />}
          </>
        )}

        {step === 1 && (
          <>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22, color: COLORS.ink, margin: "0 0 4px" }}>
              Ako sa firma volá?
            </h2>
            <p style={{ color: COLORS.inkSoft, fontSize: 13.5, margin: "0 0 20px" }}>
              Celý oficiálny názov spoločnosti, IČO a jej právna forma.
            </p>
            <NumberInputText label="Celý názov spoločnosti" value={data.companyName} onChange={upd("companyName")} icon={<Building2 size={14} />} />
            <NumberInputText
              label="IČO"
              value={data.ico}
              onChange={upd("ico")}
              icon={<Contact size={14} />}
              helper="Ak firma sídli na Slovensku, podľa IČO appka skúsi automaticky dohľadať reálne účtovné údaje z verejného registra."
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
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22, color: COLORS.ink, margin: "0 0 4px" }}>
              Kto údaje vypĺňa?
            </h2>
            <p style={{ color: COLORS.inkSoft, fontSize: 13.5, margin: "0 0 20px" }}>
              Kontaktné údaje osoby zodpovednej za tieto informácie.
            </p>
            <NumberInputText label="Meno a priezvisko" value={data.contactName} onChange={upd("contactName")} icon={<User size={14} />} />
            <NumberInputText
              label="Pozícia (voliteľné)"
              value={data.contactPosition}
              onChange={upd("contactPosition")}
              icon={<Briefcase size={14} />}
            />
            <NumberInputText label="E-mail" value={data.contactEmail} onChange={upd("contactEmail")} icon={<Mail size={14} />} />
            <NumberInputText
              label="Telefón (voliteľné)"
              value={data.contactPhone}
              onChange={upd("contactPhone")}
              icon={<Phone size={14} />}
            />
            {touched && !isStepValid() && <ErrorHint text="Vyplňte prosím meno a platný e-mail." />}
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
                padding: "11px 16px",
                borderRadius: 3,
                border: `1px solid ${COLORS.line}`,
                background: "#fff",
                color: COLORS.ink,
                fontWeight: 600,
                fontSize: 13.5,
                cursor: "pointer",
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
              padding: "12px 16px",
              borderRadius: 5,
              border: "none",
              background: COLORS.ink,
              color: COLORS.paper,
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
              boxShadow: "0 6px 16px -6px rgba(23,35,59,0.5)",
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

function NumberInputText({ label, value, onChange, icon, helper }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <div style={{ fontSize: 13.5, color: COLORS.ink, fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${COLORS.line}`, borderRadius: 3, background: "#fff", padding: "10px 12px" }}>
        {icon && <span style={{ color: COLORS.inkSoft, display: "flex" }}>{icon}</span>}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontFamily: "'IBM Plex Sans', sans-serif", color: COLORS.ink, background: "transparent" }}
        />
      </div>
      {helper && <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 4 }}>{helper}</div>}
    </label>
  );
}

function ErrorHint({ text }) {
  return (
    <div style={{ fontSize: 13, color: COLORS.red, background: "rgba(176,72,59,0.08)", padding: "8px 10px", borderRadius: 3, marginTop: 4 }}>
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
   REGIONÁLNE SPRESNENIE (kraj → NUTS2 → Eurostat) — len SR
   ============================================================
   RegisterUZ pri slovenskej firme vracia kód kraja (číselník ŠÚSR
   0023/RSUJ3). Namapujeme ho na zodpovedajúci NUTS2 región a stiahneme
   jeho regionálnu mieru nezamestnanosti — tá je presnejšia než
   celoštátny priemer a reálne rozlíši napr. Bratislavský kraj od
   Trenčianskeho. Ak sa nepodarí stiahnuť, použije sa celoštátna
   hodnota z fetchCountryMacroData bez regionálneho spresnenia.
   ============================================================ */
const SK_KRAJ_TO_NUTS2 = {
  1: { nuts2: "SK01", nazov: "Bratislavský kraj" },
  2: { nuts2: "SK02", nazov: "Trnavský kraj" },
  3: { nuts2: "SK02", nazov: "Trenčiansky kraj" },
  4: { nuts2: "SK02", nazov: "Nitriansky kraj" },
  5: { nuts2: "SK03", nazov: "Žilinský kraj" },
  6: { nuts2: "SK03", nazov: "Banskobystrický kraj" },
  7: { nuts2: "SK04", nazov: "Prešovský kraj" },
  8: { nuts2: "SK04", nazov: "Košický kraj" },
};

async function fetchRegionalUnemployment(krajCode) {
  const region = SK_KRAJ_TO_NUTS2[Number(krajCode)];
  if (!region) return null;
  const unemployment = await fetchEurostatLatest(
    "lfst_r_lfu3rt",
    { sex: "T", age: "Y15-74", unit: "PC_ACT" },
    region.nuts2
  );
  if (unemployment == null) return null;
  return { unemployment, kraj: region.nazov, nuts2: region.nuts2 };
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

  try {
    const jList = await getJson(`${base}/uctovne-jednotky?zmenene-od=2000-01-01&ico=${cleanIco}`);
    const ujId = jList?.id?.[0];
    if (!ujId) return null;

    const uj = await getJson(`${base}/uctovna-jednotka?id=${ujId}`);
    const closureIds = uj?.idUctovnychZavierok || [];
    if (closureIds.length === 0) return null;

    // skontrolovať posledných pár závierok (podľa id) a vybrať tú s najnovším obdobím
    const candidateIds = closureIds.slice(-5);
    const closures = (
      await Promise.all(candidateIds.map((id) => getJson(`${base}/uctovna-zavierka?id=${id}`)))
    ).filter((c) => c && c.obdobieDo);
    if (closures.length === 0) return null;
    closures.sort((a, b) => (a.obdobieDo < b.obdobieDo ? 1 : -1));
    const latest = closures[0];

    const reportIds = latest.idUctovnychVykazov || [];
    if (reportIds.length === 0) return null;

    const reports = (
      await Promise.all(reportIds.map((id) => getJson(`${base}/uctovny-vykaz?id=${id}`)))
    ).filter((r) => r?.obsah?.tabulky);
    if (reports.length === 0) return null;

    const templateIds = [...new Set(reports.map((r) => r.idSablony))];
    const templates = await Promise.all(templateIds.map((id) => getJson(`${base}/sablona?id=${id}`)));
    const templateMap = {};
    templates.forEach((t) => {
      if (t) templateMap[t.id] = t;
    });

    // nájde hodnotu v tabuľke podľa kľúčových slov v texte riadku šablóny
    const findValue = (tabulka, templateTabulka, keywords, columnFromEnd = null) => {
      if (!tabulka?.data || !templateTabulka?.riadky) return null;
      const dataCols = templateTabulka.pocetDatovychStlpcov || 1;
      const col = columnFromEnd != null ? Math.max(0, dataCols - 1 - columnFromEnd) : 0;
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

    let revenue = null,
      profit = null,
      assets = null,
      equity = null,
      liabilities = null;

    for (const report of reports) {
      const template = templateMap[report.idSablony];
      if (!template) continue;
      const tabulky = report.obsah.tabulky;
      const templateTabulky = template.tabulky;
      for (let ti = 0; ti < tabulky.length; ti++) {
        const tabulka = tabulky[ti];
        const templateTabulka = templateTabulky[ti];
        if (!templateTabulka) continue;

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
        if (assets === null) {
          assets = findValue(tabulka, templateTabulka, ["Spolu majetok", "SPOLU MAJETOK"], 0);
        }
        if (equity === null) {
          equity = findValue(tabulka, templateTabulka, ["Vlastné imanie"], 0);
        }
        if (liabilities === null) {
          liabilities = findValue(tabulka, templateTabulka, ["Záväzky spolu", "Záväzky súčet", "Záväzky r."], 0);
        }
      }
    }

    if (revenue === null && profit === null && assets === null) return null;

    return {
      ico: cleanIco,
      nazovUJ: uj?.nazovUJ || null,
      skNace: uj?.skNace || null,
      kraj: uj?.kraj || null,
      obdobie: latest.obdobieDo || null,
      annualRevenue: revenue,
      netProfit: profit,
      totalAssets: assets,
      equity: equity,
      liabilities: liabilities,
    };
  } catch (_) {
    return null;
  }
}

async function resolveValuationInputs(profile) {
  // 1) Skontrolovať, či poradca zadal reálne dáta cez skrytý admin panel
  let manual = null;
  try {
    const res = await storage.get("manualFinancials");
    manual = res ? JSON.parse(res.value) : null;
  } catch (_) {
    manual = null;
  }

  // 2) Ak je firma zo Slovenska a má vyplnené IČO, skúsiť reálne dáta z RegisterUZ
  let ruz = null;
  if (profile?.country === "Slovensko" && profile?.ico) {
    ruz = await fetchRegisterUzData(profile.ico);
  }

  const h = hashString((profile?.companyName || "") + (profile?.country || "") + (profile?.city || ""));
  const cd = COUNTRY_FINANCE_DEFAULTS[profile?.country] || COUNTRY_FINANCE_DEFAULTS["Iná krajina"];

  // 3) Reálny kurz meny naživo z ECB (Frankfurter API), so zálohou na statickú tabuľku
  const liveRate = await fetchLiveExchangeRate(cd.currency);
  const exchangeRate = liveRate != null ? liveRate : cd.exchangeRate;

  // 3b) Reálna nezamestnanosť a inflácia naživo z Eurostatu — jemne upravia
  // krajinovú rizikovú prirážku (Country Risk Premium). Ak sa nepodarí
  // stiahnuť (napr. krajina mimo EÚ, alebo výpadok siete), použije sa
  // pôvodná orientačná hodnota z tabuľky bez úpravy.
  const macro = profile?.country ? await fetchCountryMacroData(profile.country) : null;

  // 3c) Ak ide o slovenskú firmu s krajom známym z RegisterUZ, skúsiť
  // presnejšiu regionálnu (NUTS2) nezamestnanosť namiesto celoštátnej.
  let regional = null;
  if (profile?.country === "Slovensko" && ruz?.kraj) {
    regional = await fetchRegionalUnemployment(ruz.kraj);
  }
  const effectiveUnemployment = regional?.unemployment ?? macro?.unemployment ?? null;

  let countryRiskPremium = cd.countryRiskPremium;
  if (macro || regional) {
    let macroAdj = 0;
    if (effectiveUnemployment != null) macroAdj += Math.max(0, effectiveUnemployment - 5) * 0.1;
    if (macro?.inflation != null) macroAdj += Math.max(0, macro.inflation - 2) * 0.15;
    macroAdj = Math.min(macroAdj, 2.5); // strop, aby prirážka nevystrelila nezmyselne vysoko
    countryRiskPremium = cd.countryRiskPremium + macroAdj;
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
  const ebitda = manual?.ebitda ? Number(manual.ebitda) : placeholderEbitda; // RegisterUZ neobsahuje priamo EBITDA
  const equity = manual?.equity ? Number(manual.equity) : ruz?.equity ?? placeholderEquity;
  const debt = manual?.debt
    ? Number(manual.debt)
    : ruz?.totalAssets != null && ruz?.equity != null
    ? Math.max(0, ruz.totalAssets - ruz.equity)
    : placeholderDebt;
  const years = manual?.yearsInBusiness ? Number(manual.yearsInBusiness) : placeholderYears;

  const inputs = {
    industry: manual?.industry || mapNaceToIndustry(ruz?.skNace) || "other",
    yearsInBusiness: String(years),
    annualRevenue: String(resolvedRevenue),
    ebitda: String(ebitda),
    netProfit: String(netProfit),
    growthTrend: manual?.growthTrend || growthOptions[(h >> 2) % growthOptions.length],
    ownerDependency: manual?.ownerDependency || dependencyOptions[(h >> 4) % dependencyOptions.length],
    customerConcentration: manual?.customerConcentration || concentrationOptions[(h >> 5) % concentrationOptions.length],
    equity: String(equity),
  };
  const advanced = {
    enabled: true,
    debtToEquity: String(Math.round((debt / Math.max(equity, 1)) * 100)),
    debt: String(debt),
    creditSpread: "3.0",
    riskFreeRate: "3.5",
    marketRiskPremium: "5.5",
    countryRiskPremium: countryRiskPremium.toFixed(2),
    inflationDifferential: "0",
    taxRate: String(cd.taxRate),
    currency: cd.currency,
    exchangeRate: String(exchangeRate),
  };
  const dataSource = manual ? "manual" : ruz ? "registeruz" : "placeholder";
  return { inputs, advanced, usedManualData: !!manual, dataSource, ruzInfo: ruz, macro, regional };
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

  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get("manualFinancials");
        if (res) setData((s) => ({ ...s, ...JSON.parse(res.value) }));
      } catch (_) {}
      try {
        const p = await storage.get("profile");
        if (p) setProfile(JSON.parse(p.value));
      } catch (_) {}
    })();
  }, []);

  const upd = (k) => (v) => setData((s) => ({ ...s, [k]: v }));

  const handleSave = async () => {
    try {
      await storage.set("manualFinancials", JSON.stringify(data));
      setSavedMsg("Uložené. Použije sa pri ďalšom výpočte.");
    } catch (_) {
      setSavedMsg("Nepodarilo sa uložiť.");
    }
  };

  const handleClear = async () => {
    try {
      await storage.delete("manualFinancials");
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
    setSavedMsg("Vymazané — appka sa vráti k automatickému odhadu.");
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
      </p>

      {profile?.companyName && (
        <div
          style={{
            background: "#fff",
            border: `1px solid ${COLORS.line}`,
            borderRadius: 4,
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
            {profile.city ? `, ${profile.city}` : ""}
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
          <div style={{ fontSize: 13, color: COLORS.teal, background: "rgba(31,111,92,0.08)", padding: "8px 10px", borderRadius: 3, marginBottom: 12 }}>
            {savedMsg}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleSave}
            style={{ flex: 1, padding: "11px 0", borderRadius: 3, border: "none", background: COLORS.ink, color: COLORS.paper, fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}
          >
            Uložiť
          </button>
          <button
            onClick={handleClear}
            style={{ padding: "11px 16px", borderRadius: 3, border: `1px solid ${COLORS.line}`, background: "#fff", color: COLORS.ink, fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}
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
    const onHashChange = () => setIsAdminRoute(window.location.hash === "#admin");
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

  // Automatický výpočet na pozadí — spustí sa hneď, ako je firemný profil
  // hotový. Používateľ nemá prístup k vstupným parametrom ani k tomuto kódu;
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
      } = await resolveValuationInputs(profile);
      if (cancelled) return;

      const e = Number(resolvedInputs.ebitda) || 0;
      const n = Number(resolvedInputs.netProfit) || 0;
      const effEbitda = e > 0 ? e : n > 0 ? n / 0.75 : 0;
      const effNetProfit = n > 0 ? n : e > 0 ? e * 0.75 : 0;

      const capm = resolvedAdvanced.enabled ? computeCapmWacc(resolvedAdvanced) : null;
      const baseCapRateOverridePct = capm ? capm.wacc * 100 : null;
      const debtAmount = resolvedAdvanced.enabled ? Number(resolvedAdvanced.debt) || 0 : 0;

      const calc = calculateValuation(
        { ...resolvedInputs, ebitda: effEbitda, netProfit: effNetProfit },
        baseCapRateOverridePct,
        debtAmount
      );
      calc.capm = capm;
      calc.usedManualData = usedManualData;
      calc.dataSource = dataSource;
      calc.ruzInfo = ruzInfo;
      calc.macro = macro;
      calc.regional = regional;

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
  }, [profile, editingProfile]);

  const handleSave = async () => {
    if (!result) return;
    const entry = {
      ts: Date.now(),
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
        <AdminOverridePanel onClose={() => { window.location.hash = ""; setIsAdminRoute(false); }} />
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
      <div className="no-print" style={{ background: COLORS.ink, color: COLORS.paper, padding: "16px 20px", boxShadow: "0 4px 16px rgba(23,35,59,0.18)", position: "relative", zIndex: 2 }}>
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
                onClick={() => setEditingProfile(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  border: `1px solid rgba(255,255,255,0.25)`,
                  color: COLORS.paper,
                  borderRadius: 3,
                  padding: "7px 12px",
                  fontSize: 12.5,
                  cursor: "pointer",
                }}
              >
                <Pencil size={13} /> Upraviť profil
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
                        {profile?.city ? ` · ${profile.city}, ${profile.country}` : profile?.country ? ` · ${profile.country}` : ""}
                      </div>
                      <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 2, fontFamily: "'IBM Plex Mono', monospace" }}>
                        Vygenerované {new Date().toLocaleDateString("sk-SK")} · nástroj Hodnotomer
                      </div>
                    </div>

                    <SectionEyebrow>Súhrn ocenenia</SectionEyebrow>
                    <div style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: -6, marginBottom: 10 }}>
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
                          boxShadow: "0 8px 20px -8px rgba(21,79,66,0.45)",
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
                          borderRadius: 3,
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
                          padding: "10px 0",
                          borderRadius: 3,
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
                        }}
                      >
                        <Save size={14} /> {saved ? "Uložené" : "Uložiť odhad"}
                      </button>
                      <button
                        onClick={() => window.print()}
                        style={{
                          flex: 1,
                          padding: "10px 0",
                          borderRadius: 3,
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
                            borderRadius: 3,
                            padding: "8px 10px",
                            marginBottom: 10,
                          }}
                        >
                          WACC {(result.capm.wacc * 100).toFixed(2)}% · Ke {(result.capm.costOfEquity * 100).toFixed(2)}% · Kd
                          (po dani) {(result.capm.costOfDebtAfterTax * 100).toFixed(2)}% · váha VK/CK{" "}
                          {(result.capm.weightEquity * 100).toFixed(0)}% / {(result.capm.weightDebt * 100).toFixed(0)}%
                        </div>
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
                          } EBITDA a niektoré rizikové faktory sú naďalej odhadované.`}
                        {result.dataSource === "placeholder" &&
                          "Finančné údaje zatiaľ nemajú pripojený reálny zdroj (firma nie je zo Slovenska, nemá vyplnené IČO, alebo sa nenašla v RegisterUZ), preto ich appka odhaduje zástupne — do systému ich vie poradca vopred vložiť cez skrytý panel."}
                      </p>
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
                        <div style={{ color: COLORS.ink, fontWeight: 600 }}>{h.industry}</div>
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
        borderRadius: 6,
        padding: 22,
        marginBottom: 18,
        boxShadow: accent
          ? "0 12px 28px -12px rgba(23,35,59,0.18), 0 2px 6px -1px rgba(23,35,59,0.06)"
          : "0 1px 3px rgba(23,35,59,0.05)",
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
    <div style={{ flex: 1, background: COLORS.paperDeep, borderRadius: 5, padding: "12px 14px", border: `1px solid ${COLORS.line}` }}>
      <div style={{ fontSize: 11, color: COLORS.inkSoft, marginBottom: 5, letterSpacing: "0.02em" }}>{label}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: COLORS.ink, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

