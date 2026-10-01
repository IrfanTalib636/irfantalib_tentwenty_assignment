const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const TIMES = ['10:30', '12:30', '13:30', '15:00', '16:30', '18:00', '19:30', '21:00'];

export type Showtime = {
  id: string;
  time: string;
  hall: string;
  price: number;
  bonus: number;
};

export function ticketDates(from: Date, count = 14) {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export function dayKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function formatDateChip(date: Date) {
  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`;
}

function hash(input: string) {
  let value = 0;
  for (const char of input) {
    value = (value * 33 + char.charCodeAt(0)) >>> 0;
  }
  return value;
}

export function buildShowtimes(movieId: number, date: Date): Showtime[] {
  let seed = hash(`${movieId}-${dayKey(date)}`);
  const next = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed;
  };
  const count = 4 + (next() % 2);
  const used = new Set<number>();
  const showtimes: Showtime[] = [];

  while (showtimes.length < count && used.size < TIMES.length) {
    const timeIndex = next() % TIMES.length;
    if (used.has(timeIndex)) {
      continue;
    }
    used.add(timeIndex);
    const hall = (next() % 6) + 1;
    showtimes.push({
      id: `${dayKey(date)}-${TIMES[timeIndex]}`,
      time: TIMES[timeIndex],
      hall: `Cinetech + Hall ${hall}`,
      price: 50 + (next() % 4) * 25,
      bonus: 2500 + (next() % 4) * 500,
    });
  }

  return showtimes.sort((left, right) => left.time.localeCompare(right.time));
}
