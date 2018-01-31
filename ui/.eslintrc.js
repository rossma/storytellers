// running in command line
// $ eslint "src/**/*.{js,vue}"
// # or
// $ eslint src --ext .vue
module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  extends: [
    'standard',
    'plugin:vue/recommended'
  ],
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2017,
    sourceType: 'module'
  }
}
