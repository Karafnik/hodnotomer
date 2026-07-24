# Hodnotomer

Online nástroj na indikatívne ocenenie firmy pre malých podnikateľov.

## Rýchly štart (lokálne, na tvojom počítači)

```bash
npm install
npm run dev
```

Appka pobeží na `http://localhost:5173`.

## Nasadenie online

Pozri `DEPLOYMENT-GUIDE.md` (priložený mimo tohto priečinka) — obsahuje
podrobný krok-za-krokom návod, ako to dostať na verejnú URL cez GitHub + Vercel.

## Štruktúra projektu

```
hodnotomer-app/
├── index.html          — HTML kostra stránky
├── package.json        — zoznam závislostí a príkazy (npm run dev/build)
├── vite.config.js       — konfigurácia build nástroja Vite
└── src/
    ├── main.jsx         — vstupný bod, vykreslí <App /> do stránky
    ├── App.jsx          — celá logika a UI nástroja (formulár, výpočet, gauge)
    └── lib/
        └── storage.js   — ukladanie dát (účty, história) do localStorage
```
