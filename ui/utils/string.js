export default {
  findKeywords: str => {
    return str
      .split(/\s+/)
      .filter(v => v.startsWith('#'))
      .map(v => v.substr(1))
  },

  findAuthorTags: str => {
    return str
      .split(/\s+/)
      .filter(v => v.startsWith('@'))
      .map(v => v.substr(1))
  },

  truncateWithEllipse: (str, maxLength) => {
    return str.substr(0, maxLength - 1) + (str.length > maxLength ? '...' : '')
  }
}
