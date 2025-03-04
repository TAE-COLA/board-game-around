import eslint from "@eslint/js";
import typescriptEslint from 'typescript-eslint';

export default [
  eslint.configs.recommended, // eslint의 권장 config 사용
  ...typescriptEslint.configs.recommended, // ts-eslint의 권장 config spread
  {
	  files: ['**/*.@(js|ts|jsx|tsx)'],
    languageOptions:{
      parserOptions: {
        ecmaFeatures: {
          tsx: true,
        },
      }
    }
  }
]