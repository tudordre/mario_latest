# Mario Custom — PixiJS 2D Edition

Joc platformer inspirat de Mario, construit cu **PixiJS v8**, **Vite** și **Electron**. Poate fi jucat în browser sau ca aplicație desktop.

---

## 🚀 De ce PixiJS ca tehnologie pentru Grafica 2D?

Jocul folosește randare 2D accelerată hardware prin **WebGL**:
1. **Randare PixiJS**: scena este desenată pe GPU prin WebGL, cu forme grafice și sprites pixel-art.
2. **Sistem de Particule Dinamice (Visual Juice)**:
   - Nori fini de praf la alergare și la aterizare după sărituri mari.
   - 4 fragmente de cărămidă cu rotație și gravitație la spargere din cap sau la impactul cu racheta.
   - Dâră de fum și flăcări la propulsia rachetelor.
   - Scântei incandescente în spatele mingilor de foc.
   - Stele de impact la strivirea inamicilor.
   - Sclipiri aurii la colectarea monedelor.
   - Fântână de 10 monede cu rotație și scântei la căderea în groapă.
3. **Screen-Shake Tactil**: Trepidații dinamice ale ecranului la impact (lovit cărămizi, rachete, cădere în groapă, strivire inamici).
4. **Randare Pixel-Art Clară**: `roundPixels: true` și scalare fără estompare (crisp pixelated).
5. **Efecte de Mișcare & Cinematică Avansată**:
   - **Squash & Stretch**: Întindere elastică pe verticală la desprinderea în săritură și tasare lină pe orizontală la aterizare.
   - **Înclinarea Corpului în Alergare (Run Lean)**: Înclinare aerodinamică proporțională cu viteza de deplasare.
   - **Motion Blur / Ghost Afterimages**: Dâră de siluete semitransparente colorate la viteză mare, zbor cu aripile sau călare pe pasăre.
   - **Umbre Dinamice pe Sol (Drop Shadows)**: Umbre ambientale eliptice sub Mario, animăluțe și pasăre, adaptate la înălțime.
   - **Clipire Naturală a Ochilor**: Mario, pasărea și animăluțele clipesc din ochi la intervale organice.
6. **Două moduri de rulare**: în browser prin Vite (`npm run dev`) sau ca aplicație desktop prin Electron (`npm start`).

---

## 🎮 Particularități și Mecanici de Joc

Jocul include 8 lumi, puteri, inamici, niveluri generate procedural și o zonă subterană:

### 1. 8 Lumi x 4 Niveluri (32 Niveluri)
Fiecare lume are o tematică vizuală distinctă (culori unice pentru cer, dealuri, iarbă, pământ):
- **Lumea 1**: Câmpia Senină (Cer albastru clasic, iarbă verde)
- **Lumea 2**: Deșertul de Aur (Apus cald, nuanțe teracotă)
- **Lumea 3**: Amurgul Violet (Cer violet, dealuri nocturne)
- **Lumea 4**: Valea Cristalului (Nuanțe acvamarin și smarald)
- **Lumea 5**: Munții Purpurii (Apus carmin, nuanțe vulcanice)
- **Lumea 6**: Noaptea Înstelată (Albastru intens, atmosferă nocturnă)
- **Lumea 7**: Pădurea Fermecată (Verde proaspăt de primăvară)
- **Lumea 8**: Castelul Întunecat (Obsidian, magenta închisă)

### 2. Generare Procedurală Inteligentă
- **Zonă de start sigură**: 48 de tile-uri cu monede de pornire, cărămizi casante și pasărea călăribilă.
- **Gropi cu trepte ajutătoare**: Platforme și insulițe plutitoare plasate matematic astfel încât traiectoria săriturii să nu fie niciodată blocată de un tavan.
- **Scări de cărămizi și tuburi verzi**: Tuburi de 2 sau 3 tile-uri înălțime cu trepte de cărămidă.
- **Curățare automată (pruning)** a elementelor din spatele camerei pentru performanță maximă.

### 3. Transformări Mario și Puteri
- **Mario Mic (Small)**: Dimensiune 20×30.
- **Mario Mare (Big)**: După primul animal portocaliu (dimensiune 24×48).
- **Mario de Foc (Fire)**: După al doilea animal portocaliu (haină portocalie, salopetă albă). Trage cu mingi de foc (<kbd>Shift</kbd>).
- **Mario cu Rachete (Rockets!)**: După adunarea a **3 animale portocalii**! Trage cu rachete rapide de mare viteză care sparg cărămizile și înving inamicii pe o rază mărită!
- **Puterile persistă** între niveluri la trecerea prin steag și castel.

### 4. Pasărea Uriașă Călăribilă & Aripile
- **Pasărea Albastră**: Apare chiar la începutul nivelului (56×72 px). Mario poate sări pe ea pentru a o călări. Oferă **+15% viteză** și **super-sărituri** (viteză verticală -780 vs -520 normal).
- Dacă Mario este lovit pe pasăre, pasărea se sperie și fuge cu viteză, iar Mario este demontat cu invulnerabilitate temporară.
- **Aripile Divine**: Apar plutind în aer după 5–20 secunde. Colectarea lor îi oferă lui Mario aripi de înger cu vârfuri roz; fiecare apăsare a tastei de săritură generează o bătaie de aripi, permițând zborul continuu!

### 5. Cameră Subterană Secretă
- Coboară pe orice tub apăsând <kbd>↓</kbd> sau <kbd>S</kbd>.
- Intri într-o peșteră misterioasă cu stalactite și **72 de monede de aur** (3 rânduri a câte 24 monede).
- Ieșirea prin capătul peșterii te teleportează deasupra următorului tub de la suprafață.

### 6. Căderea în Groapă & Recompensă de 10 Bani
- Căderea într-o groapă declanșează un bonus special de **+10 bani** (`PIT_REWARD = 10`).
- O fântână de 10 monede aurii țâșnește din groapă cu rotație și scântei.
- Se aude melodia chiptune descendentă de ~3 secunde cu bas sintetizat.

### 7. Finalul de Nivel (Steag și Castel)
- La distanța de 9000px apare catargul cu bila de aur și steagul roșu, urmat de castel.
- Mario alunecă lin pe steag, coboară și intră automat în ușa castelului, avansând în nivelul următor.
- Trecerea de nivelul 8-4 afișează ecranul glorios de **Victorie**!

### 8. Sintetizator Audio Web Audio API
- Toate sunetele sunt sintetizate procedural prin Web Audio API (fără fișiere audio externe):
  - Monedă (arpegii pătrate B5 -> E6)
  - Creștere / Putere (arpegiu ascendent în 4 note)
  - Micșorare / Lovitură (glissando descendent dinte de ferăstrău)
  - Strivire inamic (impact triunghiular)
  - Spargere cărămidă (zgomot de crunch)
  - Minge de foc și Lansare Rachetă
  - Melodie de groapă (9 note descendente chiptune + dronă bas)

---

## ⌨️ Controale

| Tastă | Acțiune |
|---|---|
| <kbd>←</kbd> <kbd>→</kbd> / <kbd>A</kbd> <kbd>D</kbd> | Mișcare stânga / dreapta |
| <kbd>↑</kbd> / <kbd>W</kbd> | Săritură (cu aripi: fiecare apăsare = bătaie din aripi / zbor) |
| <kbd>↓</kbd> / <kbd>S</kbd> (pe un tub) | Coborâre în camera subterană cu 72 monede |
| <kbd>Space</kbd> / <kbd>Shift</kbd> | Foc (mingi de foc sau rachete după 3 portocalii) |
| <kbd>R</kbd> | Restart rapid al jocului |
| <kbd>Enter</kbd> | Pornire / Din nou |

---

## 🛠️ Cum se rulează

### Cerințe

- Node.js compatibil cu Vite 8 și npm.
- Un browser modern pentru versiunea web; suportul WebGL este necesar pentru randare.
- macOS, Windows sau Linux pentru rularea desktop prin Electron.

### Mod Dezvoltare / Browser
```bash
npm run dev
```
Deschide browserul la adresa `http://localhost:5173`.

### Mod Aplicație Desktop (Electron):
```bash
npm start
```
sau:
```bash
npm run desktop
```

### Compilare Build de Producție:
```bash
npm run build
```
Fișierele optimizate se generează în directorul `dist/`.

---

## 📁 Structura Proiectului

```
.
├── electron/
│   ├── main.cjs        # Procesul principal Electron pentru desktop
│   └── preload.cjs     # Preload securizat Electron
├── src/
│   ├── css/
│   │   └── style.css   # Stiluri pixel-perfect, HUD retro și ferestre modale
│   └── js/
│       ├── constants.js # Dimensiuni, viteze, fizică și cele 8 tematici de lumi
│       ├── sfx.js       # Sintetizator audio Web Audio API (fără fișiere externe)
│       ├── input.js     # Gestionar de taste (WASD, Săgeți, Space, Shift, R, Enter)
│       ├── particles.js # Motor de particule 2D (praf, bucăți cărămidă, fum, foc, stele)
│       ├── player.js    # Fizică Mario, coliziuni, puteri, călărit pasăre, aripi
│       ├── world.js     # Generator procedural pe bucăți, subteran, inamici, steag
│       ├── renderer.js  # Motor grafic PixiJS v8 2D (WebGL), screen-shake, scene graph
│       └── main.js      # Buclă de joc (Game loop), sincronizare HUD, logica stărilor
├── index.html           # Punctul principal de intrare Vite / Web
├── vite.config.js       # Configurare Vite cu exporturi relative
└── package.json         # Dependențe (PixiJS v8, Vite, Electron)
```
