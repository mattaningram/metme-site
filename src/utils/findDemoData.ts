export type DemoContact = {
  id: string
  name: string
  company: string
  city: string
  place: string
  day: number
  hue: number
}

export type GroupMode = 'date' | 'city' | 'company'

// `day` is a day of last month, so the list, map and calendar always agree
export const demoContacts: DemoContact[] = [
  {
    id: 'sarah',
    name: 'Sarah Chen',
    company: 'Lumen Studio',
    city: 'Brooklyn',
    place: 'Design Week',
    day: 27,
    hue: 70,
  },
  {
    id: 'marcus',
    name: 'Marcus Rivera',
    company: 'Rivera Foto',
    city: 'Brooklyn',
    place: 'Design Week',
    day: 27,
    hue: 25,
  },
  {
    id: 'priya',
    name: 'Priya Sharma',
    company: 'Harbor Labs',
    city: 'Brooklyn',
    place: 'Harbor Coffee',
    day: 22,
    hue: 300,
  },
  { id: 'tomas', name: 'Tomás Silva', company: 'Harbor Labs', city: 'Lisbon', place: 'Web Meetup', day: 19, hue: 200 },
  {
    id: 'amara',
    name: 'Amara Diallo',
    company: 'Lumen Studio',
    city: 'Lisbon',
    place: 'Web Meetup',
    day: 19,
    hue: 150,
  },
  {
    id: 'james',
    name: 'James Nakamura',
    company: 'Fieldnote',
    city: 'Austin',
    place: "Dana's wedding",
    day: 14,
    hue: 250,
  },
  {
    id: 'elena',
    name: 'Elena Vasquez',
    company: 'Fieldnote',
    city: 'Austin',
    place: "Dana's wedding",
    day: 14,
    hue: 350,
  },
  {
    id: 'david',
    name: 'David Kim',
    company: 'Tidewater',
    city: 'Brooklyn',
    place: 'Northside Climbing',
    day: 8,
    hue: 110,
  },
  {
    id: 'layla',
    name: 'Layla Okonkwo',
    company: 'Tidewater',
    city: 'Brooklyn',
    place: 'Harbor Coffee',
    day: 3,
    hue: 45,
  },
]

export const demoPlaces = [
  { name: 'Design Week', x: 64, y: 27 },
  { name: 'Harbor Coffee', x: 30, y: 41 },
  { name: 'Northside Climbing', x: 72, y: 52 },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = [
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
]

export function demoMonth(now = new Date()) {
  const first = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return {
    label: `${MONTHS_LONG[first.getMonth()]} ${first.getFullYear()}`,
    offset: first.getDay(),
    days: new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate(),
    dayLabel(day: number) {
      const date = new Date(first.getFullYear(), first.getMonth(), day)
      return `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${day}`
    },
  }
}

export function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
}

export function groupContacts(mode: GroupMode, now = new Date()) {
  const month = demoMonth(now)
  const groups = new Map<string, DemoContact[]>()
  const sorted =
    mode === 'date'
      ? demoContacts
      : [...demoContacts].sort((a, b) => a[mode].localeCompare(b[mode]) || a.name.localeCompare(b.name))
  for (const contact of sorted) {
    const label = mode === 'date' ? month.dayLabel(contact.day) : contact[mode]
    groups.set(label, [...(groups.get(label) ?? []), contact])
  }
  return [...groups].map(([label, contacts]) => ({ label, contacts }))
}
