// Placeholder ([Ismingiz], [Uni ismi]) dizaynning bir qismi: yumshoq yorug'lik beruvchi "chip".
// Matn ichidagi [..] bo'laklarni topib, ularni chip qilib chizadi; qolgan matn o'zgarmaydi.
const RE = /(\[(?:Ismingiz|Uni ismi)\])/g;
export const isPh = v => typeof v === 'string' && /^\[(?:Ismingiz|Uni ismi)\]$/.test(v.trim());

export function Chip({ children }) {
  return <span className="ph-chip">{children}</span>;
}

export function rich(text) {
  if (typeof text !== 'string' || !text.includes('[')) return text;
  return text.split(RE).map((part, i) => (isPh(part) ? <Chip key={i}>{part}</Chip> : part));
}
