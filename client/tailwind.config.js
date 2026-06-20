/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // Disable Preflight (CSS reset) so Tailwind utilities don't override
  // the existing site-wide CSS variables and class-based styles.
  corePlugins: { preflight: false },
  theme: { extend: {} },
  plugins: [],
};
