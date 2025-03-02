import * as tseslintParser from '@typescript-eslint/parser'
import reactHooks from 'eslint-plugin-react-hooks'

export default {
    parser: tseslintParser,
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: "./tsconfig.json",
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    plugins: ["@typescript-eslint", "react-hooks", "react-refresh"],
    rules: {
        ...reactHooks.configs.recommended.rules,
        "react-refresh/only-export-components": [
            "warn",
            {allowConstantExport: true}
        ],
    },
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    ignorePatterns: ["dist"],
}
