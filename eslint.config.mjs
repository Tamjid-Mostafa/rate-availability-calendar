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
  ...compat.config({
    rules: {
      "react-hooks/exhaustive-deps": "off", // Disable unnecessary dependency warning
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ], // Ignore unused vars
      "@typescript-eslint/no-explicit-any": "off", // Disable any type warnings
      "react/display-name": "off", // Disable component display name rule
    },
  }),
];

export default eslintConfig;
