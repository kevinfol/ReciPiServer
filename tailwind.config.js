/** @type {import('tailwindcss').Config} */
module.exports = {
  separator: "--",
  content: ["./views/*.pug"],
  theme: {
    extend: {},
  },
  plugins: [
    {
      tailwindcss: {},
      autoprefixer: {},
    },
  ],
};
