export default [
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "warn", // Warns you if you create variables you don't use
      "no-undef": "error",      // Errors if you use a variable that isn't defined
    }
  }
];