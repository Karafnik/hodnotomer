# Hodnotomer — metodika výpočtu

Tento dokument vysvetľuje presne, ako appka dopočíta indikatívnu trhovú hodnotu firmy — odkiaľ berie jednotlivé čísla a ako ich medzi sebou kombinuje.

---

## 1. Odkiaľ appka berie vstupné dáta

Používateľ (podnikateľ) nezadáva žiadne finančné ani rizikové parametre ručne — všetko sa deje na pozadí ("čierna skrinka"). Pre každé číslo appka skúša zdroje **v tomto poradí priority**:

| Poradie | Zdroj | Kedy sa použije |
|---|---|---|
| 1 | **Ručný vstup poradcu** (skrytý panel `#admin`) | Ak si pred stretnutím niečo zadal ručne, má to vždy prednosť |
| 2 | **RegisterUZ** (verejný Register účtovných závierok SR) | Ak je krajina Slovensko a je vyplnené IČO firmy, ktoré sa v registri nájde |
| 3 | **Zástupný odhad (placeholder)** | Vždy, keď 1 a 2 zlyhajú — deterministický odhad odvodený z názvu firmy |

Naživo (bez ohľadu na vyššie poradie) sa vždy sťahujú tieto trhové dáta:
- **Kurz meny** — ECB (cez Frankfurter API)
- **Nezamestnanosť a inflácia** — Eurostat
- **Regionálna nezamestnanosť** — Eurostat, ak je zo Slovenskej firmy známy kraj

---

## 2. Firemné finančné údaje

| Údaj | Zdroj |
|---|---|
| Ročné tržby | RegisterUZ (výkaz ziskov a strát) alebo odhad |
| Čistý zisk / EBITDA | RegisterUZ (výsledok hospodárenia) alebo odhad. EBITDA sama osebe sa v RegisterUZ nenachádza priamo, preto sa medzi čistým ziskom a EBITDA prepočítava pomerom 0,75 (t.j. čistý zisk ≈ 75 % EBITDA) |
| Vlastné imanie | RegisterUZ (súvaha) alebo odhad |
| Dlh | RegisterUZ: dopočítané ako *aktíva − vlastné imanie* (keďže register priamo "dlh" ako jednu položku nevykazuje) |
| Roky pôsobenia na trhu | Zatiaľ len odhad (RegisterUZ dátum založenia sa priamo nevyužíva) |
| Odvetvie | **Automaticky podľa SK NACE kódu** firmy z RegisterUZ (namapované na 10 kategórií — maloobchod, výroba, IT, stavebníctvo…) |
| Trend tržieb, závislosť od majiteľa, koncentrácia zákazníkov | Zatiaľ len odhad — pre tieto neexistuje verejný zdroj dát |

---

## 3. Dve oceňovacie metódy

Výsledné rozpätie hodnoty vzniká skombinovaním dvoch nezávislých metód:

### A) Kapitalizácia zisku
```
Hodnota = Čistý zisk / Kapitalizačná miera
```
Kapitalizačná miera = **WACC** (náklad kapitálu, pozri časť 4) + **prirážka za špecifické riziko firmy** (pozri časť 5).

### B) Trhový násobok EBITDA
```
Hodnota = EBITDA × odvetvový násobok
```
Odvetvové násobky sú orientačné demonštračné hodnoty pre 10 kategórií (napr. IT 4–6×, maloobchod 2,5–3,5×), upravené rovnakou rizikovou prirážkou ako metóda A (opačným smerom — nižšie riziko = vyšší násobok).

**Výsledné rozpätie** = od najnižšej hodnoty z oboch metód po najvyššiu; **stredná hodnota** = priemer stredných hodnôt oboch metód.

---

## 4. WACC — náklad kapitálu (bez bety)

```
WACC = podiel vlastného kapitálu × Ke  +  podiel cudzieho kapitálu × Kd (po dani)
```

**Náklad vlastného kapitálu (Ke):**
```
Ke = Risk-free rate + Market Risk Premium + Country Risk Premium
```
(upravené Fisherovou rovnicou o Inflation Differential — zatiaľ vždy 0, keďže appka nerieši cezhraničné oceňovanie v inej mene)

- **Risk-free rate** = 3,5 % (spoločná orientačná hodnota pre eurozónu)
- **Market Risk Premium** = 5,5 % (spoločná orientačná hodnota)
- **Country Risk Premium** = základná hodnota podľa krajiny (tabuľka nižšie) **+ úprava podľa aktuálnej nezamestnanosti a inflácie** (pozri časť 6)

**Náklad cudzieho kapitálu (Kd):**
```
Kd = Risk-free rate + Credit Spread
Kd po dani = Kd × (1 − daňová sadzba)
```
- **Credit Spread** = 3,0 % (orientačná hodnota)
- **Daňová sadzba** = reálna štatutárna sadzba dane z príjmu právnických osôb podľa krajiny

**Váhy vlastného/cudzieho kapitálu** určuje pomer Debt-to-Equity, ktorý sa dopočíta z pomeru (dlh / vlastné imanie) danej firmy.

---

## 5. Prirážka za špecifické riziko firmy

WACC zachytáva len *trhové* riziko. Na to sa pripočítava prirážka odrážajúca riziko *konkrétnej malej firmy*:

| Faktor | Vplyv na kapitalizačnú mieru |
|---|---|
| Závislosť od majiteľa: stredná | +3 p.b. |
| Závislosť od majiteľa: vysoká | +6 p.b. |
| Roky pôsobenia < 2 | +4 p.b. |
| Roky pôsobenia 2–5 | +2 p.b. |
| Roky pôsobenia > 10 | −2 p.b. |
| Trend tržieb: klesajúci | +4 p.b. |
| Trend tržieb: rastúci | −2 p.b. |
| Trend tržieb: rýchlo rastúci | −4 p.b. |
| Koncentrácia zákazníkov: koncentrovaná | +3 p.b. |
| Koncentrácia zákazníkov: rozložená | −1 p.b. |

Táto prirážka sa premietne opačným smerom aj do EBITDA násobku (vyššie riziko = nižší násobok, a naopak).

---

## 6. Makroekonomické doladenie Country Risk Premium

Základná krajinová prirážka (statická orientačná tabuľka pre všetkých 27 členov EÚ) sa doladí podľa **aktuálnych reálnych dát z Eurostatu**:

```
+ 0,1 p.b. za každý bod nezamestnanosti nad 5 %
+ 0,15 p.b. za každý bod inflácie (HICP) nad 2 % (cieľ ECB)
```
Súčet tejto úpravy je zastropovaný na max. **+2,5 p.b.**

**Regionálne spresnenie (len SR):** ak má firma z RegisterUZ známy kraj, namiesto celoštátnej nezamestnanosti sa použije presnejšia **regionálna nezamestnanosť** (Eurostat, úroveň NUTS2) pre daný kraj — to reálne rozlíši napr. Bratislavský kraj od Trenčianskeho.

---

## 7. Prepočet meny a Levered/Unlevered hodnota

- **Kurz meny** sa sťahuje naživo z ECB (Frankfurter API) — slúži len na zobrazenie prepočtu, nemení podkladový výpočet v eurách.
- **Unlevered hodnota** (Hodnota podniku / Enterprise Value) = výsledok metód A a B — hodnota firmy ako celku, bez ohľadu na to, ako je financovaná.
- **Levered hodnota** (Equity Value, hodnota pre vlastníka) = Unlevered hodnota **mínus Debt** — suma, ktorá reálne patrí vlastníkovi a je relevantná pri predaji firmy.

---

## 8. Prehľadová tabuľka — orientačné krajinové parametre

| Parameter | Hodnota |
|---|---|
| Risk-free rate | 3,5 % (spoločné pre celú EÚ) |
| Market Risk Premium | 5,5 % (spoločné pre celú EÚ) |
| Credit Spread | 3,0 % (spoločné pre celú EÚ) |
| Daňová sadzba | reálna, špecifická pre každú z 27 krajín EÚ |
| Country Risk Premium (základ) | orientačná, špecifická pre každú z 27 krajín EÚ |
| Nezamestnanosť, inflácia | reálne, naživo z Eurostatu, špecifické pre krajinu (a kraj pri SR firmách) |

---

## 9. Čo je stále len orientačný odhad (nie reálne dáta)

- Risk-free rate, Market Risk Premium, Credit Spread — spoločné orientačné hodnoty, nie z trhu naživo
- Základná Country Risk Premium (pred makro doladením) — orientačná demonštračná tabuľka
- Odvetvové EBITDA násobky — orientačné demonštračné hodnoty
- Trend tržieb, závislosť od majiteľa, koncentrácia zákazníkov — odhad (žiadny verejný zdroj neexistuje)
- Roky pôsobenia na trhu — odhad
- Finančné údaje mimo Slovenska (bez RegisterUZ) — vždy len odhad

---

## 10. Čo zostáva nevyriešené (vedomé rozhodnutie)

- **FinStat** — bezplatné API zrušené v roku 2023, dnes len platená služba (od 350 €/rok). Zvažovali sme to, ale rozhodli sme sa **nekupovať** — RegisterUZ (zadarmo, oficiálne) už pokrýva to najdôležitejšie (tržby, zisk, súvaha) pre slovenské firmy. FinStat by pridal hlavne históriu dlhov/exekúcií, čo nie je nevyhnutné pre indikatívne ocenenie.
- **Skutoční vlastníci a ich podiely** (Obchodný register SR) — žiadne oficiálne API neexistuje; appka aspoň ponúka priamy odkaz na ručné overenie v skrytom admin paneli
- **Administratívne podmienky/kvalita regulácie** — World Bank zrušila "Ease of Doing Business" v 2021; existuje náhrada (Worldwide Governance Indicators), zatiaľ nenapojená
