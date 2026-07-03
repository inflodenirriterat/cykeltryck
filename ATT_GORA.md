# Att göra – manuella steg

Bocka av med `[x]` allteftersom. Stegen är i rimlig ordning.

> **Appen heter numera `Bikepressure`** (samma namn på svenska och engelska).
> Bundle-ID: `app.bikepressure`. Webben ligger på https://bikepressure.vercel.app

## 1. Engångsfix på datorn

- [x] Sätt din git-identitet (annars står "Cal Son" på dina commits):
  ```
  git config --global user.name "Ditt Namn"
  git config --global user.email din@email.se
  ```
  (Satt lokalt för det här repot: `inflodenirriterat` / iCloud-adressen.)

## 2. Publicera webbversionen (ger SEO + URL till integritetspolicyn)

- [x] Hosta appen, enklast Vercel eller Netlify (gratis). Bygg-kommando: `npm run build`, mapp: `dist`.
      Live på https://bikepressure.vercel.app
- [ ] Koppla en egen domän om du vill (valfritt – *.vercel.app funkar också).
      Görs på vercel.com → projektet `bikepressure` → Settings → Domains.
- [x] Fyll i din riktiga adress i `index.html`: avkommentera raderna
      `<link rel="canonical" ...>` och `<meta property="og:url" ...>`
      (sök på "TODO vid publicering") och bygg om.
- [x] Verifiera att `https://din-adress/privacy.html` fungerar – den URL:en
      behövs i App Store Connect. → https://bikepressure.vercel.app/privacy.html
- [ ] (Valfritt) Koppla GitHub-repot till Vercel för automatisk deploy vid varje
      push. Tills dess deployar du manuellt med `vercel deploy --prod`.

## 2b. Namnbyte till Bikepressure (KLART – gjort av Claude)

- [x] Bytte appnamn + bundle-ID till `Bikepressure` / `app.bikepressure` i
      `capacitor.config.json`, `Info.plist` och Xcode-projektet.
- [x] Uppdaterade brand i appen (`src/App.jsx`), webben (`index.html`,
      `manifest.json`), integritetspolicyn och App Store-texterna.
- [x] Byggde om webben, körde `npx cap sync ios`, deployade och pushade.

## 2c. App Store-förberedelser i koden (KLART – gjort av Claude, 2026-07-02)

- [x] Beräkningsmodellen uppdaterad mot forskning (lägst rullmotstånd,
      brytpunkt/impedans) och komfort/fart-slidern borttagen. Deployat.
- [x] `Info.plist`: `ITSAppUsesNonExemptEncryption=false` (slipper
      export compliance-frågan vid varje uppladdning), `CFBundleLocalizations`
      (en + sv, så App Store visar båda språken), `arm64` i stället för
      föråldrade `armv7`, iPhone låst till porträttläge (matchar layouten
      och webbmanifestet).
- [x] `APP_STORE.md` kompletterad med övriga obligatoriska ASC-fält
      (support-URL, kategori, åldersgräns, copyright m.m.).
- [x] `index.html`: absolut og:image-URL + SEO-text i linje med nya modellen.

## 3. Skicka appen till App Store

Förberett: iOS-bygget är synkat. Capacitor 8 använder **Swift Package Manager**
(inte CocoaPods), så pluginet `in-app-review` länkas automatiskt – inget extra
att installera.

- [ ] Öppna projektet i Xcode (`npx cap open ios`, eller `ios/App/App.xcworkspace`).
- [ ] **Signing & Capabilities:** bocka i *Automatically manage signing* och välj
      ditt **Team** (kräver Apple Developer Program, 99 USD/år). Verifiera att
      bundle-ID står som `app.bikepressure`.
- [ ] Testa på riktig iPhone (välj enheten högst upp, tryck ▶): inställningar och
      profiler sparas mellan starter, betygsdialogen kan dyka upp vid tredje starten.
- [ ] Välj mål **"Any iOS Device (arm64)"** → **Product → Archive** →
      **Distribute App → App Store Connect → Upload**.
- [ ] I App Store Connect: skapa appen (bundle-ID `app.bikepressure`, namn
      **Bikepressure**) och klistra in texterna från `APP_STORE.md` (namn,
      undertitel, beskrivning, nyckelord – svenska och engelska finns där).
- [ ] Fyll i övriga fält från `APP_STORE.md`: support-URL, kategori (Sports),
      åldersgräns (4+), copyright och pris (gratis).
- [ ] App Privacy: välj **"Data Not Collected"**.
- [ ] Privacy Policy URL: `https://bikepressure.vercel.app/privacy.html`.
- [ ] Skärmbilder: första bilden ska visa resultatpanelen med tryck (det är
      den folk ser i sökresultaten). Tas i simulatorn (⌘S) eller på din iPhone.
      **Obs:** appen stödjer iPad, så det behövs skärmbilder för både iPhone
      (6,9") och iPad (13") – ta dem i respektive simulator.
- [ ] Skicka in för granskning (Apple-review tar oftast 1–3 dygn).

## 4. När CarbPlanner släpps (kopplingen mellan apparna)

> Bränsle-/kalkylatorkortet och CarbPlanner-reklamkortet är **gömda just nu**
> (CarbPlanner är inte live än). De ligger kvar i koden bakom en flagga.

- [ ] Sätt `CARBPLANNER_LIVE = true` överst i `src/App.jsx` för att visa korten igen.
- [ ] Hämta CarbPlanners riktiga App Store-URL (med id-nummer).
- [ ] Skapa en kampanjlänk i App Store Connect (provider-id finns under
      Users and Access → Provider).
- [ ] Byt `CARBPLANNER_URL` överst i `src/App.jsx` till:
      `https://apps.apple.com/se/app/carbplanner/idXXXXXXXXX?pt=<provider-id>&ct=bikepressure`
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

- [x] Kontaktadressen i `public/privacy.html` uppdaterad till
      `info.calson@icloud.com` (2026-07-03).
- [ ] Support-mejl i App Store Connect (fältet "Support URL" pekar redan på
      webben, men om du anger en supportadress separat: använd
      `info.calson@icloud.com`).
- [x] Git-identiteten för det här repot uppdaterad till
      `info.calson@icloud.com` (2026-07-03). Namnet `inflodenirriterat`
      lämnat orört.
- [ ] (Bara om du vill) Bundle-ID är `app.bikepressure`, ett fritt valt ID. Vill
      du hellre ha t.ex. `com.dittnamn.bikepressure` måste det bytas **innan**
      första uppladdningen till App Store Connect.
