import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Regras específicas para prevenir erros comuns
      
      // TypeScript rules para prevenir 'any' e problemas de tipo
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      
      // React rules para hooks e dependências
      "react-hooks/exhaustive-deps": "error",
      "react-hooks/rules-of-hooks": "error",
      
      // Regras gerais de qualidade
      "no-console": "warn", // Avisar sobre console.log esquecidos
      "prefer-const": "error",
      "no-var": "error",
      
      // Regras específicas para prevenir bugs com undefined/null
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/strict-boolean-expressions": "warn",
      
      // Naming conventions
      "@typescript-eslint/naming-convention": [
        "error",
        {
          "selector": "interface",
          "format": ["PascalCase"]
        },
        {
          "selector": "typeAlias", 
          "format": ["PascalCase"]
        },
        {
          "selector": "variable",
          "format": ["camelCase", "PascalCase", "UPPER_CASE"]
        }
      ]
    }
  }
];

export default eslintConfig;
