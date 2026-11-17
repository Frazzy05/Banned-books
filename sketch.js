// 1 glifo (= 1 libro disegnato) rappresenta GLIFO_VALE libri del database
let GLIFO_VALE = 50;

//categorie ban
// A sinistra il valore scritto nella colonna "reason_categories" del CSV - a destra il nome sul sito
let reasoncategories = {
  language_profanity:      "LANGUAGE PROFANITY",
  religious_objection:     "RELIGIOUS THEMES",
  drug_or_alcohol_content: "DRUG OR ALCOHOL",
  violence:                "VIOLENCE",
  lgbtq_themes:            "LGBTQ+ THEMES",
  political_content:       "POLITICAL CONTENT",
  racial_themes:           "RACIAL THEMES",
  legal_compliance:        "LEGAL COMPLIANCE",
  unspecified:             "UNSPECIFIED",
  sexual_content:          "SEXUAL CONTENT"
};
console.log("Reason Categories:", reasoncategories); //mostra in console le categorie

let counts = {}; // Quanti libri ha ogni motivazione

// elementi stile messi in style.css che veongono poi letti da loadStyle
let margin, labelWidth, bookWidth, bookGap, bookHeight, plankHeight, shelfGap, shelfStep, labelSize;
let backgroundColor, textColor, bookColor, plankColor, fontFamily;


async function setup() {
  loadStyle(); //carica gli elementi di stile da style.css
  let data = await loadTable("assets/Banned index - banned_index_bans per libro.csv", ",", "header"); // La tabella CSV (una riga = un libro)

  // Conta i libri per motivazione (un libro con più motivazioni conta in ciascuna)
  for (let row = 0; row < data.getRowCount(); row++) { //Passa tutte le righe del CSV, cioè tutti i libri, uno alla volta
   
    let reasons = (data.getString(row, "reason_categories") || "").split(/[;\r\n]+/); //prendi la colonna delle motivazioni; se non c’è niente, considera un testo vuoto; poi spezzalo in una lista. Prende dalla riga corrente il testo della colonna reason_categories e lo spezza ogni volta che trova un ; o un ritono a capo (r) o un a capo (n). Es: racial_themes;political_content diventa una lista di due motivazioni.
    
    for (let reason of new Set(reasons)) { //Passa le motivazioni del libro una alla volta. Set toglie i doppioni: se una motivazione è scritta due volte nello stesso libro, conta una volta sola.
      counts[reason] = (counts[reason] || 0) + 1; //Aggiunge 1 al contatore della motivazione. Se è la prima volta che compare parte da zero. Un libro con tre motivazioni diverse aumenta tre contatori. (I libri senza motivazione finiscono nella voce "" che nessuno scaffale legge.)
    }
  }

  // Altezza della pagina= margini + altezza degli scaffali
  createCanvas(windowWidth, 2 * margin + Object.keys(reasoncategories).length * shelfStep);
  textFont(fontFamily);
}


// Legge da style.css  
function loadStyle() {
  let css = getComputedStyle(document.documentElement);
  let text = (name) => css.getPropertyValue(name).trim();
  let number = (name) => parseFloat(text(name));

  backgroundColor = text('--sfondo');
  textColor = text('--testo');
  bookColor = text('--libro');
  plankColor = text('--tavola');
  fontFamily = text('--font');
  labelSize = number('--testo-dimensione');

  margin = number('--margine');
  labelWidth = number('--etichetta-larghezza');
  bookWidth = number('--libro-larghezza');
  bookGap = number('--libro-spazio');
  bookHeight = number('--libro-altezza');
  plankHeight = number('--tavola-spessore');
  shelfGap = number('--scaffale-spazio');
  shelfStep = bookHeight + plankHeight + shelfGap; // Quanto spazio occupa uno scaffale  
}


function draw() {
  background(backgroundColor);
  noStroke();
  textSize(labelSize);
  textAlign(LEFT, BOTTOM);

  let shelfX = margin + labelWidth; // dove iniziano gli scaffali
  let y = margin; //altezza del prossimo scaffale che parte dal margine in alto

  for (let key in reasoncategories) { //Ciclo sulle 10 motivazioni: ognuna diventa uno scaffale. La tavola sta subito sotto l'altezza dei libri
    let plankY = y + bookHeight; //altezza della tavola = altezza dei libri + margine in alto

    // Tavola
    fill(plankColor); 
    rect(shelfX, plankY, width - margin - shelfX, plankHeight); //la larghezza va da dove iniziano gli scaffali fino al margine destro

    // Nome della motivazione
    fill(textColor);
    text(reasoncategories[key], margin, plankY - 8); //per centrare il testo verticalmente

    // Libri: uno ogni GLIFO_VALE libri, arrotondato per eccesso (almeno uno)
    fill(bookColor);
    for (let g = 0; g < ceil(counts[key] / GLIFO_VALE); g++) { //g=glifo //Quanti libri disegnare. Un glifo vale 50 quindi conta il numero di libri diviso 50 e arrotondato per eccesso. Se ci sono 0 libri, ceil(0) = 0 quindi non disegna nulla. Se ci sono 1-50 libri, ceil(1/50) = 1 quindi disegna un libro.
      rect(shelfX + g * (bookWidth + bookGap), y, bookWidth, bookHeight);
    }

    y += shelfStep; // Shelfstep è il punto di partenza del prossimo scaffale più in basso --> 78px (bookeheight + plankHeight + shelfGap)
  }
}