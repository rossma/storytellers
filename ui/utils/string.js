export default {
  truncateWithEllipse: (str, maxLength) => {
    return str.substr(0, maxLength - 1) + (str.length > maxLength ? '...' : '')
  }
}
