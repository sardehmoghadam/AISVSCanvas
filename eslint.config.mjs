import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "public/**",
      "node_modules/**",
      ".git/**",
      ".continue/**",
      ".github/**",
      "next-env.d.ts",
    ],
  },
  ...nextVitals,
  ...nextTypescript,
];

export default eslintConfig;
