# Att göra – manuella steg

Bocka av med `[x]` allteftersom. Stegen är i rimlig ordning.

## 1. Engångsfix på datorn

- [x] Sätt din git-identitet (annars står "Cal Son" på dina commits):
  ```
  git config --global user.name "Ditt Namn"
  git config --global user.email din@email.se
  ```

## 2. Publicera webbversionen (ger SEO + URL till integritetspolicyn)

- [x] Hosta appen, enklast Vercel eller Netlify (gratis). Bygg-kommando: `npm run build`, mapp: `dist`.
      Live på https://bikepressure.vercel.app
- [ ] Koppla en domän om du vill (valfritt – *.vercel.app funkar också).
- [x] Fyll i din riktiga adress i `index.html`: avkommentera raderna
      `<link rel="canonical" ...>` och `<meta property="og:url" ...>`
      (sök på "TODO vid publicering") och bygg om.
- [x] Verifiera att `https://din-adress/privacy.html` fungerar – den URL:en
      behövs i App Store Connect. → https://bikepressure.vercel.app/privacy.html

## 3. Skicka appen till App Store

- [ ] Öppna `ios/App/App.xcodeproj` i Xcode, välj ditt utvecklarteam under
      Signing & Capabilities.
- [ ] Testa på riktig iPhone: ändringar sparas mellan starter, profiler funkar,
      betygsdialogen kan dyka upp vid tredje starten.
- [ ] Product → Archive → Distribute App → App Store Connect.
- [ ] I App Store Connect: skapa appen och klistra in texterna från
      `APP_STORE.md` (namn, undertitel, beskrivning, nyckelord – svenska och
      engelska finns där).
- [ ] App Privacy: välj **"Data Not Collected"**.
- [ ] Privacy Policy URL: `https://din-adress/privacy.html`.
- [ ] Skärmbilder: första bilden ska visa resultatpanelen med tryck (det är
      den folk ser i sökresultaten).

## 4. När CarbPlanner släpps (kopplingen mellan apparna)

- [ ] Hämta CarbPlanners riktiga App Store-URL (med id-nummer).
- [ ] Skapa en kampanjlänk i App Store Connect (provider-id finns under
      Users and Access → Provider).
- [ ] Byt `CARBPLANNER_URL` överst i `src/App.jsx` till:
      `https://apps.apple.com/se/app/carbplanner/idXXXXXXXXX?pt=<provider-id>&ct=cykeltryck`
- [ ] Kör `npm run build && npx cap copy ios`, committa, och skicka en
      app-uppdatering. Attributionen syns sedan i App Store Connect → Analytics.

## 5. Marknadsföring (det är högsäsong nu i juni!)

- [ ] Posta i Happyride-forumet och cykelgrupper på Facebook (Gravel Sverige,
      MTB-grupper, Vätternrundan/Cykelvasan-grupper). Vinkel: "gratis
      däcktryckskalkylator, forskningsbaserad, ingen reklam, ingen spårning".
- [ ] Internationellt: r/gravelcycling, r/bicycling på Reddit (läs gruppens
      regler för egna projekt först).
- [ ] Tipsa svenska cykelpoddar/YouTubers som gör utrustningstips.

## Övrigt

- [ ] Kontaktadressen i `public/privacy.html` är din iCloud-adress – byt om du
      hellre använder en annan mejl.
