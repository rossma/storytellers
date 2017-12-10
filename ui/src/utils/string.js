//
// export const extractInfoFromHash = () => {
//   if (process.SERVER_BUILD) return
//   const { id_token, state } = getQueryParams()
//   return {
//     token: id_token,
//     secret: state
//   }
// }
//

export default {
  truncateWithEllipse: (str, maxLength) => {
    return str.substr(0, maxLength - 1) + (str.length > maxLength ? '...' : '')
  }
}
