/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: '#6366f1',
              '&:hover': {
                color: '#4f46e5',
              },
            },
            code: {
              color: 'inherit',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
            },
            pre: {
              backgroundColor: 'transparent',
              color: 'inherit',
              fontSize: '0.875rem',
              padding: '0',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            table: {
              width: '100%',
              marginTop: '1.5em',
              marginBottom: '1.5em',
              lineHeight: '1.5',
              borderCollapse: 'collapse',
              '& th': {
                fontWeight: '600',
                textAlign: 'left',
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
                paddingLeft: '1rem',
                paddingRight: '1rem',
              },
              '& td': {
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
                paddingLeft: '1rem',
                paddingRight: '1rem',
              },
              '& tbody tr': {
                borderBottomWidth: '1px',
              },
              '& tbody tr:last-child': {
                borderBottomWidth: '0',
              },
              '& p': {
                marginTop: '0',
                marginBottom: '0',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};