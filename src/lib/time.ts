// Time helpers for Sonntagsruhe. All computations in the browser's local
// timezone — the user cares about German Saturday 20:00 wherever they are.

export type WeekendStatus = {
  now: Date;
  weekday: number; // 0 = Sunday ... 6 = Saturday
  weekdayLabel: string;
  dateLabel: string;
  isSunday: boolean;
  isSaturday: boolean;
  msUntilLadenschluss: number; // ms until the next Saturday 20:00
  hours: number;
  minutes: number;
  seconds: number;
  panicLevel: "chill" | "mittel" | "hoch" | "geschlossen";
};

const WEEKDAYS_DE = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];

const MONTHS_DE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

export function getWeekendStatus(now: Date = new Date()): WeekendStatus {
  const weekday = now.getDay();
  const isSunday = weekday === 0;
  const isSaturday = weekday === 6;

  // Next Saturday 20:00 in local time.
  const target = new Date(now);
  const daysUntilSat = (6 - weekday + 7) % 7;
  target.setDate(now.getDate() + daysUntilSat);
  target.setHours(20, 0, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 7);
  }

  const diff = Math.max(0, target.getTime() - now.getTime());
  const totalSec = Math.floor(diff / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  let panicLevel: WeekendStatus["panicLevel"] = "chill";
  if (isSunday) panicLevel = "geschlossen";
  else if (isSaturday && hours < 3) panicLevel = "hoch";
  else if (isSaturday) panicLevel = "mittel";
  else if (weekday === 5) panicLevel = "mittel";

  return {
    now,
    weekday,
    weekdayLabel: WEEKDAYS_DE[weekday],
    dateLabel: `${now.getDate()}. ${MONTHS_DE[now.getMonth()]}`,
    isSunday,
    isSaturday,
    msUntilLadenschluss: diff,
    hours,
    minutes,
    seconds,
    panicLevel,
  };
}

export function panicLabel(level: WeekendStatus["panicLevel"]): string {
  switch (level) {
    case "chill":
      return "Panik-Score: entspannt";
    case "mittel":
      return "Panik-Score: mittel";
    case "hoch":
      return "Panik-Score: hoch";
    case "geschlossen":
      return "Ladenschluss aktiv";
  }
}