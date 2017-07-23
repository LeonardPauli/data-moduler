// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  extends: 'airbnb-base',
  plugins: [],
  
  // add your custom rules here
  'rules': {

    'import/prefer-default-export': 0,
    'import/first': 0,

    // don't require .vue extension when importing
    'import/extensions': ['error', 'always', {
      'js': 'never'
    }],
    // allow optionalDependencies
    'import/no-extraneous-dependencies': ['error', {
      'optionalDependencies': ['test/unit/index.js']
    }],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,



    'accessor-pairs': 'error',
    'array-bracket-spacing': 'warn',
    'array-callback-return': 'warn',
    'arrow-body-style': 'warn',
    'arrow-parens': ['warn', 'as-needed'],
    'arrow-spacing': ['error', {
      'before': false,
      'after': true,
    }],
    'block-scoped-var': 'error',
    'block-spacing': [
      'error',
      'always'
    ],
    'brace-style': ['warn', '1tbs', {
      "allowSingleLine": true,
    }],
    'callback-return': 'error',
    'camelcase': ["error", {properties: "never"}],
    'capitalized-comments': 'off',
    // "capitalized-comments": ["warn", "never", {
    //  //"ignorePattern": "pragma|ignored",
  //     "ignoreInlineComments": true,
  //     ignoreConsecutiveComments: true,
  //   }],
    "class-methods-use-this": ['warn', { exceptMethods: [
      'getStateUpdates', 'render',
    ] }],
    'comma-dangle': ['error', 'always-multiline'],
    'comma-spacing': ['warn', { before: false, after: true }],
    'comma-style': ['error', 'last'],
    'complexity': ['error', { 'max': 10 }],
    'computed-property-spacing': ['error', 'never'],
    'consistent-return': 'off', // would like consistant having a return
    // statement or not, while allowing different return types
    // 'consistent-return': ['warn', {
    //  "treatUndefinedAsUnspecified": true,
    // }],
    'consistent-this': 'error',
    //'curly': ['warn', "multi-line"], // would like:
    // - single line if short
    // - single under if one but longer
    // - brackets if multi-line
    'curly': 'off',
    'default-case': 'error',
    'dot-location': ['error', 'property'],
    'dot-notation': ['error', {
      'allowKeywords': true
    }],
    'eol-last': ['warn', 'always'],
    'eqeqeq': 'off', // TODO
    'func-call-spacing': 'error',
    'func-name-matching': 'error',
    'func-names': ['warn', 'as-needed'],
    'func-style': ['error', 'expression'],
    'generator-star-spacing': 'error',
    'global-require': 'off',
    'guard-for-in': 'off',
    'handle-callback-err': 'error',
    'id-blacklist': 'error',
    'id-length': 'off',
    // 'id-length': ['warn', {
    //  min: 2, max: 40,
    //  exceptions: ['x', 'e', 'y', 'i', 'k', 'v', 'w', ''],
    // }],
    'id-match': 'error',
    'indent': ['error', 'tab', {
      // MemberExpression: 0,
      SwitchCase: 1,
      FunctionDeclaration: {body: 1, parameters: 1},
      CallExpression: {arguments: 1},
      ArrayExpression: 1,
      ObjectExpression: 1,
    }],
    'init-declarations': 'error',
    'jsx-quotes': ['warn', 'prefer-double'],
    'key-spacing': ['warn', {mode: 'minimum'}],
    'keyword-spacing': ["error", { before: true, after: true }],
    'line-comment-position': 0, // 'error',
    'linebreak-style': ['error', 'unix'],
    'lines-around-comment': 'error',
    'lines-around-directive': 'error',
    'max-depth': ['error', 4],
    'max-len': ['warn', {
      'tabWidth': 2,
      'code': 100,
      'ignoreTrailingComments': true,
    }],
    'max-lines': 'warn',
    'max-nested-callbacks': ['error', { max: 4 }],
    'max-params': 'warn',
    'max-statements': ['warn', 30, { ignoreTopLevelFunctions: true }],
    'max-statements-per-line': ["warn", { max: 3 }],
    'multiline-ternary': 'off',
    'new-cap': 'warn',
    'new-parens': 'error',
    'import/newline-after-import': 0, // want const destructuring of default right after
    'newline-after-var': 'off', // maybe? not in tiny places
    'newline-before-return': 'off', // maybe? not in tiny places
    'newline-per-chained-call': ['warn', { 'ignoreChainWithDepth': 3 }], // what if already split?
    'no-alert': 'error',
    'no-array-constructor': 'error',
    'no-await-in-loop': 'error',
    'no-bitwise': 'error',
    'no-caller': 'error',
    'no-catch-shadow': 'error',
    'no-compare-neg-zero': 'error',
    'no-confusing-arrow': 'off', // solved by arrow-spacing fn=> ...
    'no-console': 'warn',
    'no-continue': 'off',
    'no-div-regex': 'error',
    'no-duplicate-imports': 'error',
    'no-else-return': 'warn',
    'no-empty-function': ['warn'],
    'no-eq-null': 'error',
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-extra-boolean-cast': 'warn',
    'no-extra-label': 'error',
    'no-extra-parens': ['warn', 'all', {
      "nestedBinaryExpressions": false,
      "returnAssign": false,
      "ignoreJSX": "multi-line",
    }],
    'no-floating-decimal': 'error',
    'no-implicit-globals': 'error',
    'no-implied-eval': 'error',
    'no-inline-comments': 'off', // warn, except for ()=> {  } and short ones
    'no-invalid-this': 'warn',
    'no-iterator': 'error',
    'no-label-var': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-lonely-if': 'error',
    'no-loop-func': 'error',
    'no-magic-numbers': 'off',
    // 'no-magic-numbers': ['warn', {ignore:[1,0,2]}], // would be neat, although not for react styling
    'no-mixed-operators': 'off', // would be good to have for ie: a || b && c || d
    'no-mixed-requires': 'error',
    'no-multi-assign': 'off',
    'no-multi-spaces': 'warn',
    'no-multi-str': 'error',
    'no-native-reassign': 'error',
    'no-negated-condition': 'off', // good for ()=> !condition ? short : long
    'no-negated-in-lhs': 'error',
    'no-nested-ternary': 'warn',
    'no-new': 'error',
    'no-new-func': 'error',
    'no-new-object': 'error',
    'no-new-require': 'error',
    'no-new-wrappers': 'error',
    'no-octal-escape': 'error',
    'no-param-reassign': 'off', // maybe...
    'no-path-concat': 'error',
    'no-plusplus': ['off', {
      'allowForLoopAfterthoughts': true
    }],
    'no-process-env': 'error',
    'no-process-exit': 'error',
    'no-proto': 'error',
    'no-prototype-builtins': 'off',
    'no-restricted-globals': 'error',
    'no-restricted-imports': 'error',
    'no-restricted-modules': 'error',
    'no-restricted-properties': 'error',
    'no-restricted-syntax': 'error',
    'no-return-assign': 'off',
    'no-return-await': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-shadow': 'off', // like to allow overwrite by fn arguments, but otherwise no?
    'no-shadow-restricted-names': 'error',
    'no-spaced-func': 'error',
    'no-sync': 'error',
    'no-tabs': 'off',
    'no-template-curly-in-string': 'error',
    'no-ternary': 'off',
    'no-throw-literal': 'error',
    'no-trailing-spaces': ['warn', {
      'skipBlankLines': true
    }],
    'no-undef-init': 'error',
    'no-undefined': 'off', // best to just write undefined in ES5
    'no-undef': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unneeded-ternary': 'error',
    'no-unreachable': 'warn',
    'no-unused-expressions': 'warn',
    'no-use-before-define': ['error', { 'variables': false }],
    'no-useless-call': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-concat': 'error',
    'no-useless-constructor': 'off',
    'no-useless-escape': 'error',
    'no-useless-rename': 'error',
    'no-useless-return': 'warn',
    'no-var': 'error',
    'no-void': 'off', // used like: return void fn(); // calls fn, then returns undefined
    'no-warning-comments': 'off', // maybe before going into
    // staging... good notes for future work though
    'no-whitespace-before-property': 'error',
    'no-with': 'error',
    'nonblock-statement-body-position': ['error', 'any'],
    'object-curly-newline': 'off', // TODO maybe
    'object-curly-spacing': 'off', // TODO maybe
    'object-property-newline': 0, // see src/modules/Name -> model definition
    // ['error', {
    //   'allowMultiplePropertiesPerLine': true
    // }],
    'object-shorthand': ['warn'],
    'one-var': 'off', // maybe, but not in tiny block
    'one-var-declaration-per-line': 'error',
    'operator-assignment': 'error',
    'operator-linebreak': ['error', 'after', {
      'overrides': {
        '||': 'before',
        '&&': 'before',
        ':': 'ignore',
        '?': 'before',
        '+': 'before',
      }
    }],
    'padded-blocks': 'off', // 'never', yes, but not if tiny block or first line is comment
    'prefer-arrow-callback': 'error',
    'prefer-const': 'warn',
    'prefer-destructuring': 'error',
    'prefer-numeric-literals': 'error',
    'prefer-promise-reject-errors': 'error',
    'prefer-reflect': 'off',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'off', // want it, but too intrusive
    'quote-props': ["error", "as-needed", { "numbers": true }],
    'quotes': ['error', 'single'],
    'radix': 'error',
    'require-await': 'off', // nope, better to write async ()=> x than ()=> Promise.resolve(x), etc
    'require-jsdoc': ['warn', {require: {
      FunctionDeclaration: false,
      MethodDefinition: false,
      ClassDeclaration: false, // TODO: set to true when time allows
      // + get jsdoc plugin for editor + auto doc generator
    }}],
    'rest-spread-spacing': 'error',

    'semi': ['error', 'never'],
    'no-unexpected-multiline': 'warn',
    'semi-spacing': ['error', {
      'after': true,
      'before': false,
    }],

    'sort-imports': 'off',
    'sort-keys': 'off',
    'sort-vars': 'error',
    'space-before-blocks': 'error',
    'space-before-function-paren': ['warn', 'always'],
    'space-in-parens': ['error', 'never'],
    'space-infix-ops': 'off',
    'space-unary-ops': 'error',
    'spaced-comment': ["warn", "always", {
      line: {
        markers: ['/'],
        // exceptions: ['-', '+'],
      },
      block: {
        markers: ['!'],
        exceptions: ['*'],
        balanced: true,
      }
    }],
    'strict': 'error',
    'symbol-description': 'error',
    'template-curly-spacing': 'error',
    'template-tag-spacing': 'error',
    'unicode-bom': ['error', 'never'],
    'valid-jsdoc': 'warn',
    'vars-on-top': 'error',
    'wrap-iife': 'error',
    'wrap-regex': 'error',
    'yield-star-spacing': 'error',
    'yoda': ['error', 'never', { exceptRange: true }],

    'no-unused-vars': ['warn', {
      argsIgnorePattern: '(Expo)|(nextState)|(prevState)|^_',
    }],

    'no-multiple-empty-lines': ['warn', { max:3, maxEOF:1, maxBOF:0 }],

    /*
    'react/prop-types': 2, // TODO
    // 'no-unused-vars': 'off', // TODO
    'react/jsx-uses-vars': 'warn',

    'react/default-props-match-prop-types': ['warn', { 'allowRequiredDefaults': false }],
    'react/jsx-curly-spacing': ['warn', 'never'],

    'react/display-name': 2,
    'react/jsx-key': 2,
    'react/jsx-no-comment-textnodes': 2,
    'react/jsx-no-duplicate-props': 2,
    'react/jsx-no-target-blank': 2,
    'react/jsx-no-undef': 2,
    'react/jsx-uses-react': 2,
    'react/jsx-uses-vars': 2,
    'react/no-children-prop': 2,
    'react/no-danger-with-children': 2,
    'react/no-deprecated': 2,
    'react/no-direct-mutation-state': 2,
    'react/no-find-dom-node': 2,
    'react/no-is-mounted': 2,
    'react/no-render-return-value': 2,
    'react/no-string-refs': 2,
    'react/no-unescaped-entities': 2,
    'react/no-unknown-property': 2,
    'react/react-in-jsx-scope': 2,
    'react/require-render-return': 2*/
  }
}
