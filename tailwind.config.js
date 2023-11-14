/** @type {import('tailwindcss').Config} */

import { clampBuilder } from './src/lib/utils/clamp'

const smallestViewPort = 320;
const largestViewPort = 1400;

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: 'Barlow, sans-serif',
      },
      fontSize: {
        
        'label': [clampBuilder(smallestViewPort, largestViewPort, 1.15, 1.8), {
            lineHeight: clampBuilder(smallestViewPort, largestViewPort, 1.25, 2.0),
            letterSpacing: '0.04vw',
            fontWeight: '400',
        }],
        'eyebrow': [clampBuilder(smallestViewPort, largestViewPort, 1.15, 1.8), {
          lineHeight: clampBuilder(smallestViewPort, largestViewPort, 1.15, 1.9),
          letterSpacing: '0.04vw',
          fontWeight: '400',
        }],
        'amount': [clampBuilder(smallestViewPort, largestViewPort, 1.2, 2.4), {
          lineHeight: clampBuilder(smallestViewPort, largestViewPort, 1.75, 2.8),
          letterSpacing: '0.07vw',
          fontWeight: '600',
        }],
        'unit': [clampBuilder(smallestViewPort, largestViewPort, 1.25, 2.4), {
          lineHeight: clampBuilder(smallestViewPort, largestViewPort, 1.75, 2.8),
          letterSpacing: '0.04vw',
          fontWeight: '400',
        }],
        'sub': [clampBuilder(smallestViewPort, largestViewPort, 1.25, 2.1), {
          lineHeight: clampBuilder(smallestViewPort, largestViewPort, 1.75, 2.4),
          letterSpacing: '0.05vw',
          fontWeight: '600',
        }],
        'table': [clampBuilder(smallestViewPort, largestViewPort, 1.15, 1.8), {
          lineHeight: clampBuilder(smallestViewPort, largestViewPort, 1.15, 1.9),
          letterSpacing: '0.04vw',
          fontWeight: '400',
        }],
       
      },
    },
  },
  plugins: [],
}

