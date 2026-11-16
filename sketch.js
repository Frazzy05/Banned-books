let categoryCounts = {
  "LANGUAGE PROFANITY": 0,
  "RELIGIOUS THEMES": 0,
  "DRUG OR ALCOHOL": 0,
  "VIOLENCE": 0,
  "LGBTQ+ THEMES": 0,
  "POLITICAL CONTENT": 0,
  "RACIAL THEMES": 0,
  "LEGAL COMPLIANCE": 0,
  "UNSPECIFIED": 0,
  "SEXUAL CONTENT": 0
};

let rawCSVText = "";
let selectedYear = 2026; // Anno predefinito

// Coordinate dei punti della timeline a destra
let yearNodes = [
  { year: 2026, x: 0, y: 0 },
  { year: 2025, x: 0, y: 0 }
];

function setup() {
  let canvas = createCanvas(1180, 680);
  canvas.parent('canvas-container');

  // Caricamento del file CSV
  fetch('assets/BANNED_INDEX.csv')
    .then(response => {
      if (!response.ok) throw new Error("CSV non trovato");
      return response.text();
    })
    .then(csvText => {
      rawCSVText = csvText;
      calculateCountsFromCSV(selectedYear);
    })
    .catch(err => {
      console.error("Errore nel caricamento del CSV:", err);
    });
}

// Parser CSV robusto per gestire le virgolette e le virgole nei testi
function parseCSVLine(text) {
  let result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Calcolo CUMULATIVO (<= targetYear) dal file CSV reale
function calculateCountsFromCSV(targetYear) {
  if (!rawCSVText) return;

  // Azzeriamo i dati
  for (let key in categoryCounts) {
    categoryCounts[key] = 0;
  }

  let lines = rawCSVText.split(/\r?\n/);
  if (lines.length < 2) return;

  // Identifichiamo gli indici delle colonne dal testo originale
  let headers = parseCSVLine(lines[0]);
  let dateColIndex = headers.findIndex(h => h.trim().replace(/"/g, '') === 'date_reported');
  let categoryColIndex = headers.findIndex(h => h.trim().replace(/"/g, '') === 'reason_categories');

  if (dateColIndex === -1) dateColIndex = 9;
  if (categoryColIndex === -1) categoryColIndex = 13;

  for (let i = 1; i < lines.length; i++) {
    let line = lines[i];
    if (!line) continue;

    let columns = parseCSVLine(line);

    if (columns.length > dateColIndex) {
      let dateReported = columns[dateColIndex];

      if (dateReported) {
        // Estraiamo l'anno dalla data (es. "2025-06-30" -> 2025)
        let match = dateReported.match(/\b(19|20)\d{2}\b/);
        
        if (match) {
          let banYear = parseInt(match[0]);

          // CUMULATIVO: include tutti i ban verificatisi entro l'anno selezionato
          if (banYear <= targetYear) {
            let catString = columns[categoryColIndex] || line;

            if (catString.includes('language_profanity')) categoryCounts["LANGUAGE PROFANITY"]++;
            if (catString.includes('religious_objection')) categoryCounts["RELIGIOUS THEMES"]++;
            if (catString.includes('drug_or_alcohol')) categoryCounts["DRUG OR ALCOHOL"]++;
            if (catString.includes('violence')) categoryCounts["VIOLENCE"]++;
            if (catString.includes('lgbtq_themes')) categoryCounts["LGBTQ+ THEMES"]++;
            if (catString.includes('political_content')) categoryCounts["POLITICAL CONTENT"]++;
            if (catString.includes('racial_themes')) categoryCounts["RACIAL THEMES"]++;
            if (catString.includes('legal_compliance')) categoryCounts["LEGAL COMPLIANCE"]++;
            if (catString.includes('unspecified')) categoryCounts["UNSPECIFIED"]++;
            if (catString.includes('sexual_content')) categoryCounts["SEXUAL CONTENT"]++;
          }
        }
      }
    }
  }
}

function draw() {
  background(13, 26, 21); // Verde scuro come nello mockup della Visione 1

  let startX = 30;
  let startY = 20;
  let totalWidth = 980;
  let totalHeight = 630;

  // Doppio bordo esterno
  stroke(229, 236, 233, 180);
  strokeWeight(1);
  noFill();
  rect(startX, startY, totalWidth, totalHeight);
  rect(startX + 3, startY + 3, totalWidth - 6, totalHeight - 6);

  let categories = Object.keys(categoryCounts);
  let rowHeight = (totalHeight - 10) / categories.length;

  let maxVal = Math.max(...Object.values(categoryCounts));
  if (maxVal === 0) maxVal = 100;

  // 1. Scaffali orizzontali e libri verticali
  for (let i = 0; i < categories.length; i++) {
    let catName = categories[i];
    let count = categoryCounts[catName];
    let y = startY + 5 + i * rowHeight;

    // Linea orizzontale
    stroke(229, 236, 233, 120);
    strokeWeight(1);
    line(startX + 5, y + rowHeight, startX + totalWidth - 5, y + rowHeight);

    // Titolo Categoria a destra
    fill(229, 236, 233);
    noStroke();
    textSize(13);
    textFont('Courier New');
    textStyle(BOLD);
    textAlign(RIGHT, TOP);
    text(catName, startX + totalWidth - 15, y + 8);

    // Disegno dei dorsi dei libri in verticale
    let maxBooksToDraw = 70;
    let booksToDraw = map(count, 0, maxVal, 0, maxBooksToDraw);
    if (count > 0 && booksToDraw < 1) booksToDraw = 1;

    let bookWidth = 6;
    let bookGap = 3;
    let bookHeight = rowHeight - 16;
    let bookBaseY = y + rowHeight - 4;

    for (let b = 0; b < booksToDraw; b++) {
      let bookX = startX + 15 + b * (bookWidth + bookGap);

      stroke(13, 26, 21);
      strokeWeight(0.5);
      fill(235, 240, 235);
      rect(bookX, bookBaseY - bookHeight, bookWidth, bookHeight);
    }
  }

  // 2. Timeline ad arco a destra
  drawTimeline(startX + totalWidth + 20, startY + totalHeight / 2);
}

function drawTimeline(centerX, centerY) {
  noFill();
  stroke(229, 236, 233, 100);
  strokeWeight(1.5);

  arc(centerX, centerY, 140, 320, -HALF_PI + 0.3, HALF_PI - 0.3);

  yearNodes[0].x = centerX + 60;
  yearNodes[0].y = centerY - 60;

  yearNodes[1].x = centerX + 60;
  yearNodes[1].y = centerY + 60;

  for (let i = 0; i < yearNodes.length; i++) {
    let node = yearNodes[i];
    let isSelected = (node.year === selectedYear);

    if (isSelected) {
      fill(235, 240, 235);
      stroke(235, 240, 235);
      circle(node.x, node.y, 10);
    } else {
      noFill();
      stroke(229, 236, 233, 150);
      circle(node.x, node.y, 7);
    }

    fill(isSelected ? 255 : 180);
    noStroke();
    textSize(14);
    textFont('Courier New');
    textStyle(isSelected ? BOLD : NORMAL);
    textAlign(LEFT, CENTER);
    text(node.year, node.x + 15, node.y);
  }
}

// Click del mouse per cambiare anno (2025 vs 2026)
function mousePressed() {
  for (let i = 0; i < yearNodes.length; i++) {
    let node = yearNodes[i];
    let d = dist(mouseX, mouseY, node.x, node.y);
    if (d < 25 || (mouseX >= node.x && mouseX <= node.x + 60 && abs(mouseY - node.y) < 15)) {
      selectedYear = node.year;
      calculateCountsFromCSV(selectedYear);
      break;
    }
  }
}