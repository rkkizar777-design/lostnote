const DB_NAME = "lostnote-db", DB_VER = 2;
let _dbP = null;
function openDb() {
  if (!_dbP) _dbP = new Promise((r, j) => {
    const q = indexedDB.open(DB_NAME, DB_VER);
    q.onupgradeneeded = () => {
      const d = q.result;
      if (!d.objectStoreNames.contains("notes")) d.createObjectStore("notes", { keyPath: "id" });
      if (!d.objectStoreNames.contains("meta")) d.createObjectStore("meta", { keyPath: "key" });
    };
    q.onsuccess = () => r(q.result);
    q.onerror = () => j(q.error);
  });
  return _dbP;
}
const rp = (r) => new Promise((ok, no) => { r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
async function all(s) { return rp((await openDb()).transaction(s).objectStore(s).getAll()); }
async function get(s, k) { return rp((await openDb()).transaction(s).objectStore(s).get(k)); }
async function put(s, v) { return rp((await openDb()).transaction(s, "readwrite").objectStore(s).put(v)); }
async function del(s, k) { return rp((await openDb()).transaction(s, "readwrite").objectStore(s).delete(k)); }
window.db = {
  listNotes: () => all("notes"),
  listMeta: () => all("meta"),
  getNote: (id) => get("notes", id),
  putNote: (n) => put("notes", n),
  delNote: (id) => del("notes", id),
  getMeta: async (k) => { const v = await get("meta", k); return v ? v.value : undefined; },
  setMeta: (k, val) => put("meta", { key: k, value: val }),
  delMeta: (k) => del("meta", k)
};
