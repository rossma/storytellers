// running in command line
// $ eslint "src/**/*.{js,vue}"
// # or
// $ eslint src --ext .vue
module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  extends: [
    'standard',
    'plugin:vue/base'
  ],
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2017,
    sourceType: 'module'
  }
}
// module.exports = {
//   root: true,
//   parser: 'vue-eslint-parser',
//   // parser: 'babel-eslint',
//   parserOptions: {
//     parser: 'babel-eslint',
//     ecmaVersion: 2017,
//     // ecmaVersion: 6,
//     sourceType: 'module'
//   },
//   env: {
//     es6: true,
//     browser: true,
//     node: true
//   },
//   extends: [
//     // add more generic rulesets here, such as:
//     //'eslint:recommended',
//     'standard',
//     //'plugin:vue/essential'
//     'plugin:vue/essential'
//   ],
//   plugins: [
//     'html'
//   ],
//   settings: {
//     'html/html-extensions': [".html", ".vue"]  // consider .html and .vue files as HTML
//   },
//   rules: {
//     // override/add rules settings here, such as:
//     // 'vue/no-unused-vars': 'error'
//     //"quotes": [2, "single", { "avoidEscape": true }]
//     "quotes": [
//       "warn",
//       "single"
//     ]
//   }
// }

// module.exports = {
//   root: true,
//   // parser: 'babel-eslint',
//   parser: 'vue-eslint-parser',
//   parserOptions: {
//     "parser": "babel-eslint",
//     "ecmaVersion": 2017,
//     "sourceType": "module"
//   },
//   env: {
//     browser: true,
//     node: true
//   },
//   extends: [
//       // 'standard',
//       'plugin:vue/strongly-recommended'
//     ],
//   // required to lint *.vue files
//   plugins: [
//     'html'
//   ],
//   // add your custom rules here
//   rules: {},
//   globals: {}
//}
