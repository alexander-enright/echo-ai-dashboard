// Major accounts to target for retweets
export const targetAccounts = {
  business: [
    { handle: 'Forbes', name: 'Forbes', category: 'business' },
    { handle: 'WSJ', name: 'Wall Street Journal', category: 'business' },
    { handle: 'BusinessInsider', name: 'Business Insider', category: 'business' },
    { handle: 'CNBC', name: 'CNBC', category: 'business' },
    { handle: 'FastCompany', name: 'Fast Company', category: 'business' },
    { handle: 'Inc', name: 'Inc Magazine', category: 'business' },
    { handle: 'Entrepreneur', name: 'Entrepreneur', category: 'business' },
    { handle: 'FortuneMagazine', name: 'Fortune', category: 'business' },
    { handle: 'HarvardBiz', name: 'Harvard Business Review', category: 'business' },
    { handle: 'Bloomberg', name: 'Bloomberg', category: 'business' },
  ],
  sports: [
    { handle: 'espn', name: 'ESPN', category: 'sports' },
    { handle: 'SportsCenter', name: 'SportsCenter', category: 'sports' },
    { handle: 'BleacherReport', name: 'Bleacher Report', category: 'sports' },
    { handle: 'NBA', name: 'NBA', category: 'sports' },
    { handle: 'NFL', name: 'NFL', category: 'sports' },
    { handle: 'MLB', name: 'MLB', category: 'sports' },
    { handle: 'NHL', name: 'NHL', category: 'sports' },
    { handle: 'WWE', name: 'WWE', category: 'sports' },
    { handle: 'ufc', name: 'UFC', category: 'sports' },
    { handle: 'F1', name: 'Formula 1', category: 'sports' },
    { handle: 'premierleague', name: 'Premier League', category: 'sports' },
    { handle: 'ChampionsLeague', name: 'Champions League', category: 'sports' },
  ],
  entrepreneurship: [
    { handle: 'garyvee', name: 'Gary Vaynerchuk', category: 'entrepreneurship' },
    { handle: 'naval', name: 'Naval Ravikant', category: 'entrepreneurship' },
    { handle: 'elonmusk', name: 'Elon Musk', category: 'entrepreneurship' },
    { handle: 'sama', name: 'Sam Altman', category: 'entrepreneurship' },
    { handle: 'paulg', name: 'Paul Graham', category: 'entrepreneurship' },
    { handle: 'reidhoffman', name: 'Reid Hoffman', category: 'entrepreneurship' },
    { handle: 'tferriss', name: 'Tim Ferriss', category: 'entrepreneurship' },
    { handle: 'TonyRobbins', name: 'Tony Robbins', category: 'entrepreneurship' },
    { handle: 'BillGates', name: 'Bill Gates', category: 'entrepreneurship' },
    { handle: 'JeffBezos', name: 'Jeff Bezos', category: 'entrepreneurship' },
  ],
}

export type Category = 'business' | 'sports' | 'entrepreneurship'

export function getAccountsByCategory(categories: Category[]) {
  const accounts: typeof targetAccounts.business = []
  categories.forEach((cat) => {
    accounts.push(...targetAccounts[cat])
  })
  return accounts
}

export function getRandomAccounts(count: number = 5, categories?: Category[]) {
  const accounts = categories ? getAccountsByCategory(categories) : [
    ...targetAccounts.business,
    ...targetAccounts.sports,
    ...targetAccounts.entrepreneurship,
  ]
  
  // Shuffle and pick random
  const shuffled = [...accounts].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
