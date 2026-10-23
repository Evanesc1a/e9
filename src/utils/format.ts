import i18n from '../i18n';

// Separador de miles: "1.234" en español, "1,234" en inglés
export function formatNumber(n: number): string {
  const sep = i18n.language === 'en' ? ',' : '.';
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

// Separador decimal: "2,5" en español, "2.5" en inglés
export function formatDecimal(n: number): string {
  return n.toString().replace('.', i18n.language === 'en' ? '.' : ',');
}