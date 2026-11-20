// Small heuristic parser for the website demo. The app itself uses Apple Intelligence on device.

export type DemoFieldKey = 'name' | 'company' | 'title' | 'phone' | 'email'

export type DemoRange = { start: number; end: number; key: DemoFieldKey | 'when' }

export type DemoParse = {
  fields: Partial<Record<DemoFieldKey, string>>
  when: string
  ranges: DemoRange[]
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const NOT_A_NAME = new Set(
  [
    ...WEEKDAYS,
    'I',
    'Met',
    'Meet',
    'Just',
    'Yesterday',
    'Today',
    'Tonight',
    'He',
    'She',
    'They',
    'Her',
    'His',
    'Their',
    'The',
    'A',
    'An',
    'At',
    'From',
    'With',
    'And',
    'We',
    'Got',
    'Ran',
    'Bumped',
    'Talked',
    'Had',
    'Chatted',
    'This',
    'Last',
    'On',
    'Also',
    'Works',
    'Loves',
    'Likes',
    'Lives',
    'Number',
    'Email',
    'Phone',
    'Cell',
    'My',
    'New',
    'Hi',
    'Hey',
    'So',
    'Then',
    'Ok',
    'Okay',
    'Add',
    'Its',
    "It's",
    "He's",
    "She's",
    "I'm",
    'Dr',
    'Mr',
    'Mrs',
    'Ms',
  ].map((w) => w.toLowerCase()),
)

const TITLE_FILLER = new Set([
  'a',
  'an',
  'the',
  'is',
  'who',
  'whos',
  'hes',
  'shes',
  'theyre',
  'he',
  'she',
  'they',
  'works',
  'as',
  's',
  'and',
  'i',
  'met',
])

const WORD = "[A-Z][\\p{L}'’-]+"
const COMPANY_WORD = "[A-Z0-9][\\p{L}\\d&'’-]*"

function blank(text: string, start: number, end: number) {
  return text.slice(0, start) + ' '.repeat(end - start) + text.slice(end)
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function parseDemo(input: string): DemoParse {
  const fields: DemoParse['fields'] = {}
  const ranges: DemoRange[] = []
  let when = 'Today'
  let text = input

  const take = (key: DemoRange['key'], start: number, end: number) => {
    ranges.push({ start, end, key })
    text = blank(text, start, end)
  }

  const email = text.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/)
  if (email?.index !== undefined) {
    fields.email = email[0]
    take('email', email.index, email.index + email[0].length)
  }

  const phone = text.match(/\+?\d[\d\s().-]{5,}\d/)
  if (phone?.index !== undefined) {
    fields.phone = phone[0]
    take('phone', phone.index, phone.index + phone[0].length)
  }

  const whenMatch = text.match(
    /\b(yesterday|today|tonight|(?:last|on|this)\s+(?:sun|mon|tues|wednes|thurs|fri|satur)day)\b/i,
  )
  if (whenMatch?.index !== undefined) {
    when = whenMatch[0]
      .toLowerCase()
      .replace(/^on\s+/, '')
      .split(/\s+/)
      .map(capitalize)
      .join(' ')
    take('when', whenMatch.index, whenMatch.index + whenMatch[0].length)
  }

  // Company: a capitalized run after "at", "from" or "for"
  const companyRe = new RegExp(`\\b(at|from|for)\\s+(${COMPANY_WORD}(?:\\s+${COMPANY_WORD}){0,3})`, 'u')
  const company = text.match(companyRe)
  let companyPrepStart = -1
  if (company?.index !== undefined) {
    const valueStart = company.index + company[0].length - company[2].length
    fields.company = company[2]
    companyPrepStart = company.index
    take('company', valueStart, valueStart + company[2].length)
  }

  // Name: the first capitalized run that isn't a filler word
  const nameRe = new RegExp(`${WORD}(?:\\s+${WORD}){0,2}`, 'gu')
  let nameEnd = -1
  for (const match of text.matchAll(nameRe)) {
    const words = [...match[0].matchAll(/\S+/g)]
    let first = 0
    while (first < words.length && NOT_A_NAME.has(words[first][0].toLowerCase())) first++
    if (first === words.length) continue
    let last = first
    while (last + 1 < words.length && !NOT_A_NAME.has(words[last + 1][0].toLowerCase())) last++
    const start = match.index + words[first].index
    const end = match.index + words[last].index + words[last][0].length
    fields.name = input.slice(start, end)
    nameEnd = end
    take('name', start, end)
    break
  }

  if (nameEnd < 0) {
    const lower = text.match(/\b(?:met|meet)\s+([a-z]{2,})\b/)
    if (lower?.index !== undefined && !NOT_A_NAME.has(lower[1])) {
      const start = lower.index + lower[0].length - lower[1].length
      fields.name = capitalize(lower[1])
      nameEnd = start + lower[1].length
      take('name', start, nameEnd)
    }
  }

  // Title: lowercase words between the name and the company, or after "a" / "an"
  if (nameEnd >= 0) {
    let sliceStart = nameEnd
    let slice = companyPrepStart > nameEnd ? text.slice(nameEnd, companyPrepStart) : ''
    if (!slice.trim()) {
      const loose = text.slice(nameEnd).match(/\b(?:an?|the)\s+([a-z-]+(?:\s[a-z-]+)?)(?=\s*(?:[,.;!]|$))/)
      if (loose?.index !== undefined) {
        sliceStart = nameEnd + loose.index
        slice = loose[0]
      }
    }
    const words = [...slice.matchAll(/[\p{L}-]+/gu)].filter((w) => !TITLE_FILLER.has(w[0].toLowerCase()))
    if (words.length > 0 && words.length <= 4 && words.every((w) => /^[a-z-]+$/.test(w[0]))) {
      const start = sliceStart + words[0].index
      const lastWord = words[words.length - 1]
      const end = sliceStart + lastWord.index + lastWord[0].length
      fields.title = capitalize(input.slice(start, end))
      take('title', start, end)
    }
  }

  ranges.sort((a, b) => a.start - b.start)
  return { fields, when, ranges }
}
