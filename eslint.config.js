const { defineConfig } = require("eslint/config");
const expo = require("eslint-config-expo/flat");
const prettier = require("eslint-config-prettier");

const tsPlugin = expo.find((c) => c.plugins?.["@typescript-eslint"])
    ?.plugins?.["@typescript-eslint"];

module.exports = defineConfig([
    ...expo,
    prettier,
    {
        plugins: tsPlugin ? { "@typescript-eslint": tsPlugin } : {},
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/no-explicit-any": "warn",
            "react-hooks/exhaustive-deps": "off",
            "import/no-named-as-default-member": "off",
        },
    },
    {
        ignores: ["android/**", "ios/**", ".expo/**", "node_modules/**"],
    },
]);
