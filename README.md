# SpesaFacile — Landing page

Sito promozionale in italiano per [SpesaFacile](https://github.com/CosmoNetinfo/SpesaFacile), predisposto per **GitHub Pages**.

URL previsto: https://cosmonetinfo.github.io/SpesaFacile-landing-page/

## Contenuti

- Presentazione dell’app con palette arancione, crema e verde.
- Demo illustrativa interattiva: spunte, avanzamento e ripristino. Non salva dati e non è l’app Android.
- Descrizione delle funzioni della versione 1.3: blocco notes, impostazioni, prodotti abituali, preferiti, budget, backup, link condivisi e aggiornamenti dall’app.
- Pulsante all’ultima release GitHub, numero di versione caricato dall’API pubblica e fallback se la richiesta non riesce.
- FAQ: funzionamento offline, account, compatibilità Android, segnalazioni e connessioni della pagina.
- Metadati SEO, anteprima social, sitemap e layout responsive.

Nessun framework, processo di build, font remoto, analytics o cookie di tracciamento. Per leggere l’ultima versione viene chiamata l’API pubblica `api.github.com`; il download apre GitHub.

## Struttura

```text
index.html               Contenuti e demo
assets/style.css         Layout responsive e stili
assets/app.js            Spunte della demo e controllo release
assets/logo.png          Logo del progetto
assets/social-card.png   Immagine per condivisioni social
robots.txt               Indicazioni per i crawler
sitemap.xml              URL canonico della pagina
scripts/check-site.cjs   Verifica di risorse, link interni e metadati
.github/workflows/pages.yml  Deploy GitHub Pages
```

I percorsi delle risorse sono relativi: funzionano anche sotto il percorso di progetto `/SpesaFacile-landing-page/`.

## Avvio locale

Non servono dipendenze JavaScript per il sito. Puoi aprire `index.html` nel browser oppure usare un server statico, ad esempio:

```bash
python -m http.server 8080
```

Poi visita `http://localhost:8080`. Per il controllo delle risorse serve Node.js 22+:

```bash
node scripts/check-site.cjs
```

Verifica prima della pubblicazione: desktop, telefono da 320 px, navigazione da tastiera, spunte e pulsante di ripristino, FAQ e link di download. Le animazioni rispettano `prefers-reduced-motion`.

## Pubblicare con GitHub Pages

1. In GitHub apri **Settings → Pages**.
2. Imposta **Source: GitHub Actions**.
3. Pubblica il codice sul ramo `main`, oppure avvia il workflow **Deploy GitHub Pages** da Actions.
4. Il workflow controlla le risorse, prepara solo i file pubblici e pubblica il sito.

Il job usa i permessi `pages: write` e `id-token: write`. Non servono token personali o segreti di deployment. Il workflow espone l’URL effettivo della pubblicazione nell’ambiente `github-pages`.

Se Pages non è abilitato o il relativo ambiente richiede un’approvazione, completa la configurazione in GitHub prima di riavviare il workflow.

## Aggiornare l’app presentata

Il link di download punta a `/releases/latest` per non dipendere dal nome dell’APK. Il numero della release è solo informativo: il download resta disponibile se l’API è irraggiungibile o limita le richieste.

La pagina presenta la versione 1.3 pubblicata su GitHub e usa schermate reali generate dai test Android. Per gli aggiornamenti futuri, non dichiarare disponibili funzioni presenti soltanto su un ramo di sviluppo: attendi una release verificata.

Per un dominio personalizzato aggiorna anche URL canonico, Open Graph, `robots.txt`, `sitemap.xml` e la configurazione Pages. Non è incluso un file `CNAME` perché non è stato specificato un dominio.

## Liste condivise e licenza

La cartella condividi/ contiene un’anteprima senza backend dei collegamenti dell’app. I dati sono nel frammento del link, decompressi con limite e mostrati come testo. Nessun dato della lista viene salvato sul sito. Il pulsante apre il deep link spesafacile://import nell’app 1.3+. Una nuova apertura dello stesso link riutilizza la copia locale. Non è una sincronizzazione in tempo reale.

La licenza di app e landing è proprietaria (LICENSE). I materiali originali del kit, conservati in assets/press-kit, restano disponibili separatamente e non hanno una sezione nella landing.

La release 1.3.1 uniforma i dialoghi e i menu al tema blocco notes. La landing riporta la versione pubblicata e include un’anteprima della finestra prodotto aggiornata.
