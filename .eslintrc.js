module.exports = {
  "env": {
    "browser": true,
    "es6": true
  },
  "globals": {
    "sap": true,
    "jQuery": true
  },
  "extends": "eslint:recommended",
  "overrides": [
  ],
  "parserOptions": {
    "ecmaVersion": "latest"
  },
  "rules": {
    "block-scoped-var": 2,
    "brace-style": [2, "1tbs", { "allowSingleLine": true }],
    "consistent-this": 2,
    "default-case": 2,
    "dot-notation": 2,
    "no-eval": 2,
    "no-alert": 2,
    "no-div-regex": 2,
    "no-floating-decimal": 2,
    "no-self-compare": 2,
    "no-mixed-spaces-and-tabs": [2, true],
    "no-nested-ternary": 2,
    "no-unused-vars": [2, {"vars":"all", "args":"none"}],
    "radix": 2,
    "keyword-spacing": [2, {"after": true}],
    "space-unary-ops": 2,
    "wrap-iife": [2, "any"],
    // "camelcase": 2,
    "consistent-return": 2,
    "max-nested-callbacks": [1, 3],
    "new-cap": 1,
    "no-extra-boolean-cast": 1,
    "no-lonely-if": 1,
    "no-new": 1,
    "no-new-wrappers": 1,
    "no-redeclare": 2,
    "no-unused-expressions": 1,
    "no-use-before-define": [1, "nofunc"],
    "no-warning-comments": 1,
    "strict": 2,
    //  "valid-jsdoc": [1, {
    //  "requireReturn": false
    //  }],
    "eol-last": 0,
    "eqeqeq": 0,
    "no-trailing-spaces": 0,
    "no-underscore-dangle": 0,

    "indent": [
      "error",
      2
    ],
    "quotes": [
      "error",
      "double"
    ],
    "semi": [
      "error",
      "always"
    ]
  }
};
