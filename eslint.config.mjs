import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Regras básicas para prevenir erros comuns (sem type information)

      // TypeScript rules básicas
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",

      // React rules para hooks
      "react-hooks/exhaustive-deps": "warn", // Warn em vez de error para ser menos rigoroso
      "react-hooks/rules-of-hooks": "error",

      // Regras gerais de qualidade
      "prefer-const": "error",
      "no-var": "error",
    }
  }
];

export default eslintConfig;
