const hostsToRegex = (hostPatterns: string[]): RegExp => {
  let combinedRegex = '(' + hostPatterns.join('|') + ')'
  return new RegExp(combinedRegex)
}
