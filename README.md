# 20 Seconds — sito

Sito statico: HTML + CSS + JS, senza build. Funziona su qualsiasi hosting statico.

```
index.html        struttura (header, nav, ticker, player, ricerca, carrello)
assets/data.js    TUTTI i contenuti (prodotti, eventi, news, podcast, stockist…)
assets/style.css  stile
assets/app.js     logica (router, carrello, ricerca, mappa, player)
assets/art.js     immagini "pellicola" generate in automatico (segnaposto)
assets/comments.js commenti di revisione (tasto C)
assets/img, video copertine, foto e video dell oscilloscopio
```

## Metterlo online in 1 minuto
**Netlify Drop:** vai su https://app.netlify.com/drop e trascina la cartella del sito. Ti dà subito un link pubblico.
Anche GitHub Pages, Vercel e Cloudflare Pages funzionano allo stesso modo: carichi la cartella così com'è.

## Provarlo in locale
```
python3 -m http.server 8123
```
poi apri http://localhost:8123

## Modificare i contenuti
Tutto si cambia in `assets/data.js`:
- **Foto vere delle copertine:** aggiungi `image: 'assets/img/issue-9.jpg'` al prodotto.
- **Foto di eventi e news:** aggiungi `photo: 'assets/img/....jpg'`.
- **Audio vero:** aggiungi `src: 'assets/audio/ep32.mp3'` a un episodio o a una traccia. Senza `src` il player suona un brano generativo di 20 secondi.
- **Checkout:** se `config.checkoutUrl` è vuoto, il carrello prepara un'email d'ordine a info@. Se ci metti un link (Shopify, Stripe Payment Link…), il pulsante CHECKOUT porta lì.
- Le voci segnate `PLACEHOLDER` sono contenuti di esempio da sostituire.

## Revisione: commenti sugli elementi (C)
La barra di revisione è in alto a destra, sotto gli strumenti del sito.
- **C** → passa sopra la pagina: ogni elemento (titolo, immagine, testo, sezione…) si incornicia. Clicca per selezionarlo e scrivi il commento. Con **↑ più grande / ↓ più piccolo** allarghi o restringi la selezione.
- L'elemento commentato resta incorniciato con una nuvoletta numerata nell'angolo.
- Il bottone col numero apre l'elenco di tutti i commenti, divisi per pagina.

**Per condividerli con chi revisiona (GitHub Pages):**
1. Crea un repo **pubblico** su GitHub (es. `tuonome/20s-site`) e carica tutta questa cartella.
2. Settings → Pages → Source: *Deploy from a branch* → `main` / root. Dopo un minuto il sito è su `https://tuonome.github.io/20s-site/`.
3. In `assets/data.js` imposta `comments: { repo: 'tuonome/20s-site' }` e ricarica il file.

Da quel momento:
- Chi commenta clicca "Continua su GitHub →" e preme "Submit new issue": serve un account GitHub (gratuito).
- Ogni commento è una Issue del repo: ti arriva la notifica, puoi rispondere lì.
- **Chiudere la issue** = commento risolto (sparisce dalle nuvolette, visibile con "mostra risolti").
- Il sito legge le issue dall'API pubblica di GitHub (limite di 60 letture all'ora per persona, sufficiente per una revisione).

Senza `repo` impostato, i commenti restano salvati solo nel browser di chi li scrive (utile per provare).

## Pagine
`#/` home · `#/store/<categoria>` · `#/product/<id>` · `#/events/<città>` · `#/event/<id>` ·
`#/sounds/podcast|playlist` · `#/about/manifesto|team|contact` · `#/stockist/<paese>` · `#/info/shipping|credits`
