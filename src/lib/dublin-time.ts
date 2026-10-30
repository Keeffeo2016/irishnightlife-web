export function formatDublinDateKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Dublin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function dublinWallTimeToUtc(
  dateKey: string,
  hour: number,
  minute: number,
  second: number,
  millisecond = 0
): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  const utcGuessMs = Date.UTC(year, month - 1, day, hour, minute, second, millisecond)

  const getOffsetMsAt = (timestampMs: number): number => {
    const parts = new Intl.DateTimeFormat('en-IE', {
      timeZone: 'Europe/Dublin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(timestampMs))

    const map: Record<string, number> = {}
    for (const part of parts) {
      if (part.type !== 'literal') {
        map[part.type] = Number(part.value)
      }
    }

    const dublinWallAsUtcMs = Date.UTC(
      map.year,
      (map.month || 1) - 1,
      map.day || 1,
      map.hour || 0,
      map.minute || 0,
      map.second || 0,
      millisecond
    )
    return dublinWallAsUtcMs - timestampMs
  }

  const firstOffset = getOffsetMsAt(utcGuessMs)
  const firstCandidate = utcGuessMs - firstOffset
  const secondOffset = getOffsetMsAt(firstCandidate)
  return new Date(utcGuessMs - secondOffset)
}
