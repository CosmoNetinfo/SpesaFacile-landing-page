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

## Studio delle icone e dei temi

La sezione `#stile` presenta quattro proposte vettoriali per l’icona Android e indica D, il carrello classico su carta a righe, come scelta definitiva. Quattro mockup illustrativi mostrano i colori Arancio, Salvia, Azzurro e Rosa. Queste anteprime sono separate dalle schermate reali dell’app e accompagnate dallo stato della versione che le introduce.

Le risorse locali sono in `assets/design/`: SVG delle icone, PNG dei singoli temi e tavola completa `studio-icone-temi.png`. Le griglie mostrano quattro schede affiancate su desktop e due su telefono. Non viene ripristinata la sezione del kit di presentazione.

La versione 1.3.2 introduce le quattro palette selezionabili e l’icona D. Le schermate reali `notebook-settings-1.3.2.png` e `notebook-salvia-1.3.2.png` provengono dai test Android e mostrano rispettivamente il selettore dei colori e la home salvia. Le FAQ spiegano anche il percorso di aggiornamento dal browser per chi incontra errori nelle versioni precedenti.

## Conteggio e storico dei download

Il contatore accanto al pulsante di download legge `assets/data/downloads.json`. Somma il campo `download_count` dei soli file APK caricati nelle release stabili pubblicate di `CosmoNetinfo/SpesaFacile`, escludendo bozze, prerelease, checksum e archivi sorgenti. Usa il conteggio di GitHub: non identifica chi scarica, non raccoglie IP e non misura persone, installazioni riuscite o utenti attivi. Include aggiornamenti, scaricamenti ripetuti e verifiche del manutentore.

Il workflow Pages rileva i dati a ogni push su main, su avvio manuale e una volta al giorno alle **06:23 UTC** (07:23 in Italia in inverno, 08:23 in estate). GitHub può ritardare le esecuzioni programmate e può disabilitarle nei repository pubblici inattivi. Non occorrono nuove chiavi: il job usa il GITHUB_TOKEN del repository. Il job delle statistiche usa il permesso contents: write e committa soltanto i file in assets/data su main; il successivo job pubblica il sito con il commit aggiornato. Il push del bot non crea una catena ricorsiva di workflow. Se la raccolta fallisce, la pubblicazione usa i dati già presenti e il job delle statistiche segnala l’errore.

- `assets/data/downloads.json`: ultimo totale osservato e conteggi per asset/versione.
- `assets/data/download-history.json`: una rilevazione per giorno UTC; le esecuzioni successive dello stesso giorno aggiornano quella voce senza cancellare i giorni precedenti.
- `assets/data/download-history.csv`: tabella con data UTC, istante della rilevazione, versione, ID del file, nome e conteggio cumulativo; utilizzabile per i futuri grafici.

Lo storico inizia il **5 novembre 2026**. Il totale iniziale comprende i download precedenti, senza ricostruirne la distribuzione giornaliera. I grafici dovranno distinguere il primo valore dai nuovi download rilevati tra osservazioni. Giorni senza rilevazione non sono giorni con zero download. Se un APK viene eliminato o sostituito con un nuovo asset, il totale delle release attualmente disponibili può diminuire: lo storico conserva gli ID originali per riconoscere il cambiamento. Non interpretare una diminuzione come download negativi.

Per raccogliere manualmente i dati: `node scripts/download-stats.cjs`. Per i test: `node --test scripts/download-stats.test.cjs`. La raccolta completa tutte le pagine e valida i valori prima di sostituire i file; se GitHub non risponde conserva quelli precedenti. Il browser mostra un messaggio di indisponibilità in caso di dati assenti o non validi, mantenendo disponibile il link dell’APK.

## Grafico pubblico dei download

La sezione `#numeri` presenta un grafico interattivo dei download: barre per versione e vista temporale dei totali cumulativi osservati. Il primo punto è il totale iniziale, non i download di quel giorno. Con una sola rilevazione non viene disegnata una crescita. La vista temporale conserva i giorni effettivamente osservati e le eventuali diminuzioni dovute a rimozioni di APK, senza inventare valori intermedi. I dati sono consultabili anche in una tabella accessibile e nel CSV. Non si raccolgono nuovi dati personali.

`assets/insights-model.js` contiene l’aggregazione verificata da `node --test scripts/insights-model.test.cjs`. `assets/insights.js` disegna i grafici con SVG e HTML nativi, senza librerie remote. Se i dati non sono disponibili il download dell’app resta utilizzabile.

Le recensioni sono state rimandate su richiesta del titolare: la landing non include moduli, stelle di valutazione o servizi esterni per i commenti. Nessun commento o giudizio dimostrativo viene presentato come recensione reale. Nessuna campagna è stata pubblicata sui social e nessun budget pubblicitario è stato speso.

## Immagini delle funzioni nella landing

La sezione `#funzioni` presenta otto schede affiancate e scorrevoli con schermate reali dell’app e istruzioni: presentazione, creazione delle liste, quantità e spunte, prodotti abituali, budget, colori, condivisione e download. Si naviga con scorrimento, pulsanti e frecce da tastiera. Le immagini in `assets/features/` sono adattate alla presentazione dell’app, senza rimandi a post social o pacchetti da scaricare.

Le fonti grafiche sono `scripts/feature-slides.json` e `scripts/render-feature-slides.cjs`; il generatore produce soltanto PNG. Per usarlo occorrono Playwright e, se necessario, le variabili `PLAYWRIGHT_PATH` e `CHROMIUM_PATH` per le installazioni locali.

I testi per i social, i relativi archivi e i materiali promozionali da consegnare al titolare restano fuori dai file correnti della repository e del sito. Non creare gallerie pubbliche o pacchetti social nella landing: questi materiali vanno forniti in chat. Il controllo del sito impedisce la reintroduzione delle precedenti cartelle pubbliche dedicate ai post.
