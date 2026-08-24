window.escH = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function buildPrintDoc(notes, label) {
  const items = notes.map(n => {
    const dt = new Date(n.updatedAt).toLocaleString();
    const body = escH(n.body || "").replace(/\n/g, "<br>");
    const imgs = (n.photos || []).map(p => '<img src="' + p.dataUrl + '" style="max-width:100%;border-radius:8px;margin:8px 0;display:block">').join("");
    return '<section style="page-break-inside:avoid;margin-bottom:28px;border-bottom:1px solid #ddd;padding-bottom:18px"><h2 style="color:#6d28d9;margin:0 0 4px;font-size:18px">' + escH(n.title || "Untitled") + '</h2><div style="color:#888;font-size:12px;margin-bottom:8px">' + dt + (n.pinned ? ' &middot; Pinned' : '') + '</div><p style="white-space:pre-wrap;line-height:1.6;font-size:14px">' + body + '</p>' + imgs + '</section>';
  }).join("");
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>LostNote</title><style>@page{margin:16mm}*{box-sizing:border-box}body{font-family:-apple-system,"Segoe UI",Roboto,sans-serif;color:#1a1a24;margin:0;padding:24px}h2{break-after:avoid}.cover{border-bottom:3px solid #8b5cf6;padding-bottom:14px;margin-bottom:24px}.cover h1{font-size:26px;margin:8px 0 0}.cover p{color:#666;margin:4px 0 0;font-size:14px}</style></head><body><div class="cover"><p style="font-weight:800;font-size:18px;color:#6d28d9">LostNote</p><h1>' + escH(label) + '</h1><p>' + notes.length + ' note' + (notes.length === 1 ? "" : "s") + ' &middot; ' + new Date().toLocaleString() + '</p></div>' + items + '</body></html>';
}

window.exportPdf = function (notes, label) {
  if (!notes.length) return;
  const html = buildPrintDoc(notes, label);
  const f = document.createElement("iframe");
  f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0";
  document.body.appendChild(f);
  const d = f.contentDocument;
  d.open();
  d.write(html);
  d.close();
  const wait = () => new Promise(res => {
    const imgs = [...d.querySelectorAll("img")];
    const p = imgs.filter(i => !i.complete).map(i => new Promise(r => { i.onload = r; i.onerror = r; }));
    Promise.all(p).then(res);
  });
  setTimeout(() => wait().then(() => { try { f.contentWindow.print(); } catch {} }), 400);
  setTimeout(() => f.remove(), 30000);
};
