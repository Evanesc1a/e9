import i18n from '../i18n';

const pad = (n: number) => n.toString().padStart(2, '0');

// "2026-10-22" (con la fecha local del celular)
export function toDateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isToday(d: Date): boolean {
  return toDateKey(d) === toDateKey(new Date());
}

export function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

// Español: "Hoy, jueves 22 de octubre" o "miércoles 21 de octubre"
// Inglés:  "Today, Thursday, October 22" o "Wednesday, October 21"
export function formatDayLabel(d: Date = new Date()): string {
  const dias = i18n.t('dates.days', { returnObjects: true }) as string[];
  const meses = i18n.t('dates.months', { returnObjects: true }) as string[];
  const dia = dias[d.getDay()];
  const mes = meses[d.getMonth()];

  const base =
    i18n.language === 'en' ? `${dia}, ${mes} ${d.getDate()}` : `${dia} ${d.getDate()} de ${mes}`;
  return isToday(d) ? `${i18n.t('dates.today')}, ${base}` : base;
}

// "08:30"
export function currentTime(d: Date = new Date()): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// "2026-10-21" -> Date local
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}