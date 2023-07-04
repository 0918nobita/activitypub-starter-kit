/** @type {import('eslint').Linter.Config} */
module.exports = {
    env: {
        es2016: true,
        node: true,
    },
    extends: ['eslint:recommended', 'prettier'],
    parserOptions: {
        sourceType: 'module',
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
