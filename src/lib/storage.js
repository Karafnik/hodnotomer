/**
 * Náhrada za window.storage (to je API dostupné len vnútri Claude.ai artefaktov).
 * Táto verzia ukladá dáta do localStorage prehliadača, takže appka funguje
 * aj po nasadení na vlastnú URL. Dáta zostávajú uložené len v danom
 * prehliadači / zariadení, kde appku niekto používa.
 *
 * Ak by si neskôr chcel/a, aby účty a odhady boli dostupné naprieč
 * zariadeniami (skutočné prihlásenie), treba toto nahradiť napojením
 * na reálny backend (napr. Supabase, Firebase) — pozri návod v README.md.
 */
const PREFIX = "hodnotomer:";

export const storage = {
  async get(key) {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) return null;
    return { key, value: raw, shared: false };
  },

  async set(key, value) {
    window.localStorage.setItem(PREFIX + key, value);
    return { key, value, shared: false };
  },

  async delete(key) {
    window.localStorage.removeItem(PREFIX + key);
    return { key, deleted: true, shared: false };
  },

  async list(prefix = "") {
    const keys = Object.keys(window.localStorage)
      .filter((k) => k.startsWith(PREFIX + prefix))
      .map((k) => k.slice(PREFIX.length));
    return { keys, prefix, shared: false };
  },
};
