const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const SEAT_ROW_MARKS = [143, 189, 235, 281, 328, 374, 420, 467, 513, 559].map(
  (center) => center / 570,
);

export const SEAT_COPY = {
  selected: 'Selected',
  unavailable: 'Not available',
  vip: 'VIP (150$)',
  regular: 'Regular (50 $)',
  seat: '4 / 3 row',
  total: 'Total Price',
  price: '$ 50',
  emptyPrice: '$ 0',
  pay: 'Proceed to pay',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  removeSeat: 'Remove selected seat',
} as const;

export function seatSessionLabel(dateKey: string, time: string, hall: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  const month = match ? MONTHS[Number(match[2]) - 1] : undefined;
  const when = month ? `${month} ${Number(match?.[3])}, ${match?.[1]}` : dateKey;
  const hallName = hall.replace(/^Cinetech \+ /, '');

  return `${when} | ${time} ${hallName}`.trim();
}
