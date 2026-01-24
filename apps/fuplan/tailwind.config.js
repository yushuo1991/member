/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 情绪周期主题色
        chaos: {
          primary: '#f97316',
          secondary: '#f59e0b',
          bg: '#fffbf7',
          card: '#fefaf6',
        },
        rising: {
          primary: '#ef4444',
          secondary: '#f43f5e',
          bg: '#fff9f9',
          card: '#fff5f5',
        },
        peak: {
          primary: '#3b82f6',
          secondary: '#6366f1',
          bg: '#f5f8ff',
          card: '#f0f5ff',
        },
        retreat: {
          primary: '#10b981',
          secondary: '#14b8a6',
          bg: '#f0fbf8',
          card: '#edfcf7',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Inter',
          'Noto Sans SC',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'SF Mono',
          'SFMono-Regular',
          'Consolas',
          'Liberation Mono',
          'Menlo',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
};
