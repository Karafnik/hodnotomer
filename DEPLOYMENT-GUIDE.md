# Ako dostať Hodnotomer online — podrobný návod

Tento návod predpokladá, že nemáš skúsenosti s nasadzovaním appiek. Prejdeme to
od úplného začiatku, krok za krokom.

---

## Čo budeš potrebovať

- Účet na [GitHub.com](https://github.com) (zadarmo)
- Účet na [Vercel.com](https://vercel.com) (zadarmo, prihlásiš sa cez GitHub)
- Node.js nainštalovaný na počítači ([nodejs.org](https://nodejs.org) — stiahni LTS verziu)
- Priečinok `hodnotomer-app`, ktorý si dostal/a od Claude

---

## Krok 1 — Over si, že appka funguje lokálne

Otvor terminál (Príkazový riadok / Terminal) v priečinku `hodnotomer-app` a spusti:

```bash
npm install
npm run dev
```

V termináli sa zobrazí adresa, zvyčajne `http://localhost:5173`. Otvor ju v
prehliadači — mala by sa ti zobraziť prihlasovacia obrazovka nástroja.

**Prečo tento krok:** ak niečo nefunguje, je oveľa jednoduchšie to odhaliť
lokálne než až po nasadení online.

---

## Krok 2 — Appku nahraj na GitHub

GitHub je miesto, kde sa uchováva kód tvojho projektu a odkiaľ si ho Vercel
neskôr sám "stiahne" a nasadí.

1. Choď na [github.com/new](https://github.com/new)
2. Zadaj názov repozitára, napr. `hodnotomer`
3. Nechaj ho **Public** alebo **Private** (obe fungujú s Vercelom zadarmo)
4. Klikni **Create repository**
5. GitHub ti ukáže príkazy — v termináli v priečinku `hodnotomer-app` spusti:

```bash
git init
git add .
git commit -m "Prvá verzia nástroja Hodnotomer"
git branch -M main
git remote add origin https://github.com/TVOJE-MENO/hodnotomer.git
git push -u origin main
```

(Nahraď `TVOJE-MENO` svojím GitHub používateľským menom — presný odkaz ti
GitHub zobrazí priamo na stránke nového repozitára.)

Po dokončení uvidíš svoje súbory na GitHub.com v prehliadači.

---

## Krok 3 — Nasadenie cez Vercel

1. Choď na [vercel.com](https://vercel.com) a prihlás sa cez svoj GitHub účet
2. Klikni **Add New → Project**
3. Vercel ti zobrazí zoznam tvojich GitHub repozitárov — vyber `hodnotomer`
4. Vercel automaticky rozpozná, že ide o **Vite** projekt a predvyplní správne
   nastavenia (Build command: `npm run build`, Output directory: `dist`) —
   netreba nič meniť
5. Klikni **Deploy**

Za cca 30–60 sekúnd dostaneš verejnú URL v tvare `hodnotomer-xyz.vercel.app`.
Táto URL funguje odkiaľkoľvek, na akomkoľvek zariadení — presne to, čo
potrebuješ na stretnutie.

**Automatická výhoda:** Vercel appku automaticky obsluhuje cez HTTPS
(zabezpečené pripojenie so zámkom v prehliadači) — to sa dnes považuje za
základ profesionálneho fungovania akejkoľvek appky.

---

## Krok 4 (voliteľné) — Vlastná doména

Ak chceš namiesto `hodnotomer-xyz.vercel.app` niečo ako
`ocenenie.tvojafirma.sk`:

1. V Verceli otvor projekt → **Settings → Domains**
2. Zadaj svoju doménu
3. Vercel ti ukáže DNS záznam (zvyčajne `CNAME`), ktorý pridáš u svojho
   poskytovateľa domény (napr. WebSupport, Websupport, GoDaddy)
4. Do pár minút až hodín (podľa DNS) doména začne fungovať

Toto nie je nutné pre funkčnosť — je to len "kozmetická" vec pre profesionálny
dojem.

---

## Krok 5 — Ako appku aktualizovať

Keď neskôr niečo zmeníš v kóde (napr. upravíš násobky v `App.jsx`):

```bash
git add .
git commit -m "Popis zmeny"
git push
```

Vercel automaticky zachytí zmenu na GitHube a appku znova nasadí — nemusíš nič
klikať ručne. Toto sa volá **continuous deployment** a je to štandard v
profesionálnom vývoji softvéru.

---

## Dôležité obmedzenie, o ktorom by si mal/a vedieť

Aktuálna appka ukladá účty a históriu ocenení do **localStorage prehliadača**
(súbor `src/lib/storage.js`). To znamená:

- Dáta zostávajú len v tom prehliadači/zariadení, kde si sa zaregistroval/a
- Ak si appku otvoríš na inom telefóne alebo v inom prehliadači, "účet" tam
  nebude existovať
- Ak si niekto vymaže históriu prehliadača, dáta zmiznú

**Pre tvoj účel (demo na pohovore/stretnutí) je to úplne v poriadku** — nikto
nebude appku otvárať z viacerých zariadení naraz.

Ak by si však chcel/a appku posunúť na skutočnú produkčnú úroveň s reálnymi
účtami fungujúcimi naprieč zariadeniami (napr. pre skutočných klientov), treba
`storage.js` nahradiť napojením na reálny backend. Odporúčaná voľba pre
začiatočníkov je [Supabase](https://supabase.com) (zadarmo, obsahuje databázu
aj správu prihlásenia) — to je už však ďalší, samostatný krok nad rámec tohto
zadania a rád ti s ním pomôžem, ak sa k tomu dostaneš.

---

## Zhrnutie — čo robí appku "profesionálnou" už teraz

| Vlastnosť | Stav |
|---|---|
| Beží na verejnej HTTPS URL | ✅ cez Vercel |
| Responzívny dizajn (mobil aj počítač) | ✅ zabudované v `App.jsx` |
| Automatické nasadenie pri zmene kódu | ✅ cez GitHub + Vercel |
| Ošetrené chyby (napr. výpadok siete pri ukladaní) | ✅ `try/catch` v kóde |
| Transparentná, vysvetliteľná oceňovacia logika | ✅ sekcia "Ako to počítame" |
| Perzistencia dát naprieč zariadeniami | ⚠️ zatiaľ len lokálne (localStorage) |
