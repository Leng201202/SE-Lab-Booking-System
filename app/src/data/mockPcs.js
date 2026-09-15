export const mockPcs = Array.from({ length: 10 }, (_, index) => {
  const number = index + 1
  const id = `PC-${String(number).padStart(2, '0')}`
  const specialStatus = { 3: 'Booked', 4: 'Maintenance', 8: 'Maintenance' }

  return {
    id,
    number: id,
    room: number <= 5 ? 'SE Lab A · 401' : 'SE Lab B · 402',
    status: specialStatus[number] || 'Available',
    specification:
      number % 2 === 0
        ? 'Intel Core i7 · 32 GB RAM · RTX 4060'
        : 'Intel Core i5 · 16 GB RAM · RTX 3060',
  }
})
