/** @type {import('eslint').Linter.Config} */
module.exports = {
    env: {
        es2016: true,
        node: true,
    },
    plugins: ['simple-import-sort'],
    extends: ['eslint:recommended', 'prettier'],
    parserOptions: {
        sourceType: 'module',
    },
    rules: {
        'simple-import-sort/exports': 'error',
        'simple-import-sort/imports': 'error',
    },
    overrides: [
        {
            files: '*.ts',
            parser: '@typescript-eslint/parser',
            parserOptions: {
                tsconfigRootDir: __dirname,
                project: 'tsconfig.json',
            },
            plugins: ['@typescript-eslint'],
            extends: [
                'plugin:@typescript-eslint/recommended',
                'plugin:@typescript-eslint/recommended-requiring-type-checking',
            ],
        },
    ],
};
