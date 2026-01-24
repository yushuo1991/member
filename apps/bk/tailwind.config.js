/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // 股票颜色系统
    'bg-stock-red-100', 'bg-stock-red-200', 'bg-stock-red-300', 'bg-stock-red-400', 'bg-stock-red-500', 'bg-stock-red-600',
    'bg-stock-green-100', 'bg-stock-green-200', 'bg-stock-green-300', 'bg-stock-green-400', 'bg-stock-green-500',
    'bg-stock-dark',
    'bg-stock-orange-100', 'bg-stock-orange-400', 'bg-stock-orange-600',
    'text-red-700', 'text-red-800', 'text-red-900', 'text-green-700', 'text-green-800', 'text-green-900',
    'text-white', 'text-slate-600', 'text-slate-700', 'text-gray-900',
    'text-stock-orange-700', 'text-stock-orange-800',
    'bg-orange-600', 'bg-red-400', 'bg-red-500', 'bg-rose-400', 'bg-rose-200', 'bg-rose-100',
    'bg-teal-600', 'bg-emerald-400', 'bg-emerald-500', 'bg-green-400', 'bg-green-200', 'bg-green-100',
    'bg-slate-100', 'bg-slate-200',
    'bg-red-50', 'bg-red-100', 'bg-red-200', 'bg-red-300', 'bg-red-600', 'bg-red-700', 'bg-red-800', 'bg-red-900',
    'bg-green-50', 'bg-green-300', 'bg-green-500', 'bg-green-600', 'bg-green-700', 'bg-green-800', 'bg-green-900',
    'bg-purple-100', 'bg-purple-200', 'bg-purple-300', 'bg-purple-400', 'bg-purple-500', 'bg-purple-600', 'bg-purple-700',
    'bg-gray-100', 'bg-gray-200', 'bg-gray-300', 'bg-gray-600', 'bg-gray-700', 'bg-gray-900',
    'font-bold', 'font-semibold', 'font-medium', 'font-normal',
    'text-2xs', 'text-xs', 'text-sm', 'text-lg', 'text-xl', 'rounded', 'rounded-md', 'rounded-lg',
    'px-1', 'px-2', 'px-3', 'py-1', 'py-2', 'text-center', 'text-left', 'text-right',
    'min-w-[45px]', 'inline-block', 'block', 'inline', 'shadow-sm'
  ],
  theme: {
    extend: {
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        stock: {
          'red-100': '#fdf2f4',
          'red-200': '#fce7ea',
          'red-300': '#f8b6c1',
          'red-400': '#f28a9a',
          'red-500': '#ec5f73',
          'red-600': '#da4453',
          'green-100': '#f0fdf9',
          'green-200': '#dcfcf0',
          'green-300': '#86efcf',
          'green-400': '#5dd5b0',
          'green-500': '#37bc9b',
          'dark': '#434a54',
          'orange-100': '#FCFCE5',
          'orange-400': '#FC6E51',
          'orange-600': '#E9573F',
          'orange-700': '#C73E1D',
          'orange-800': '#A83418',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
