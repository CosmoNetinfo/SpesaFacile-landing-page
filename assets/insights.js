'use strict';
(async function () {
  const chart = document.getElementById('downloads-chart');
  const note = document.getElementById('chart-note');
  const body = document.getElementById('chart-data-body');
  const buttons = [...document.querySelectorAll('[data-chart-view]')];
  const node = (tag, text, className) => {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  };
  const number = value => new Intl.NumberFormat('it-IT').format(value);
  const date = value => new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(new Date(value + 'T00:00:00Z'));
  try {
    const response = await fetch('assets/data/download-history.json', { signal: AbortSignal.timeout(5000), cache: 'no-cache' });
    if (!response.ok) throw new Error('History unavailable');
    const rows = SpesaInsights.observations(await response.json());
    if (!rows.length) throw new Error('Empty history');
    const latest = rows[rows.length - 1];
    const versions = SpesaInsights.versions(latest);
    document.getElementById('chart-total').textContent = number(latest.totalDownloads);
    document.getElementById('chart-asof').textContent = `Rilevazione del ${date(latest.date)} ${latest.date.slice(0, 4)}`;
    function render(view) {
      chart.replaceChildren(); body.replaceChildren();
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.chartView === view)));
      document.getElementById('chart-column').textContent = view === 'versions' ? 'Versione' : 'Data UTC';
      if (view === 'versions') {
        const max = Math.max(1, ...versions.map(row => row.downloads));
        const list = node('ol', undefined, 'version-bars');
        versions.forEach((row, index) => {
          const item = node('li');
          const label = node('div', undefined, 'bar-label');
          label.append(node('span', row.version), node('strong', number(row.downloads)));
          const track = node('div', undefined, 'bar-track');
          const fill = node('span'); fill.style.width = `${row.downloads / max * 100}%`;
          if (index === 0) fill.className = 'bar-latest';
          track.setAttribute('aria-hidden', 'true'); track.append(fill); item.append(label, track); list.append(item);
          const tr = node('tr'); tr.append(node('th', row.version), node('td', number(row.downloads))); body.append(tr);
        });
        chart.append(list);
        note.textContent = 'Download cumulativi degli APK per versione. Comprendono anche aggiornamenti e scaricamenti ripetuti o di prova.';
      } else {
        const ns = 'http://www.w3.org/2000/svg';
        const svgNode = (tag, attributes, text) => {
          const el = document.createElementNS(ns, tag);
          Object.entries(attributes || {}).forEach(([key, value]) => el.setAttribute(key, value));
          if (text !== undefined) el.textContent = text;
          return el;
        };
        const svg = svgNode('svg', { viewBox: '0 0 720 260', role: 'img', 'aria-labelledby': 'history-title history-description' });
        svg.append(svgNode('title', { id: 'history-title' }, 'Totale dei download osservati su GitHub'));
        svg.append(svgNode('desc', { id: 'history-description' }, rows.length === 1 ? 'È disponibile una sola rilevazione: nessun andamento giornaliero è ancora calcolabile.' : 'Ogni punto rappresenta una rilevazione. Gli intervalli senza dati non indicano zero download.'));
        const max = Math.max(5, Math.ceil(Math.max(...rows.map(row => row.totalDownloads)) / 5) * 5);
        const start = Date.parse(rows[0].date), end = Date.parse(latest.date);
        const points = rows.map(row => ({ row, x: end === start ? 385 : 58 + (Date.parse(row.date) - start) / (end - start) * 620, y: 209 - row.totalDownloads / max * 170 }));
        for (let tick = 0; tick <= 4; tick++) {
          const y = 209 - tick / 4 * 170;
          svg.append(svgNode('line', { x1: 58, x2: 678, y1: y, y2: y, class: 'plot-grid' }));
          svg.append(svgNode('text', { x: 43, y: y + 4, 'text-anchor': 'end', class: 'plot-label' }, number(Math.round(tick / 4 * max))));
        }
        if (points.length > 1) svg.append(svgNode('path', { d: points.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' '), class: 'plot-line' }));
        points.forEach(p => {
          const circle = svgNode('circle', { cx: p.x, cy: p.y, r: 6, class: 'plot-point', tabindex: 0, 'aria-label': `${p.row.date}: ${number(p.row.totalDownloads)} download cumulativi` });
          circle.append(svgNode('title', {}, `${p.row.date}: ${number(p.row.totalDownloads)} download cumulativi`)); svg.append(circle);
          const tr = node('tr'); tr.append(node('th', p.row.date), node('td', number(p.row.totalDownloads))); body.append(tr);
        });
        svg.append(svgNode('text', { x: points[0].x, y: 244, 'text-anchor': 'middle', class: 'plot-label' }, date(rows[0].date)));
        if (points.length > 1) svg.append(svgNode('text', { x: points[points.length - 1].x, y: 244, 'text-anchor': 'middle', class: 'plot-label' }, date(latest.date)));
        chart.append(svg);
        note.textContent = rows.length === 1 ? 'Lo storico comincia con questa prima rilevazione. Il totale comprende anche i download precedenti: l’andamento comparirà con le prossime osservazioni, senza inventare dati passati.' : 'Totali cumulativi osservati, non download del singolo giorno. Se un APK viene eliminato il totale può diminuire. Le rilevazioni mancanti non equivalgono a zero download.';
      }
    }
    buttons.forEach(button => { button.disabled = false; button.addEventListener('click', () => render(button.dataset.chartView)); });
    render('versions');
  } catch {
    chart.textContent = 'Il grafico non è disponibile in questo momento. Puoi comunque scaricare l’app.';
    note.textContent = 'Riprova più tardi oppure consulta lo storico CSV.';
  }
})();
