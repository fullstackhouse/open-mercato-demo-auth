import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/DemoAuthScript.tsx',
    'src/DemoAuthAutofill.tsx',
  ],
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  treeshake: true,
  external: ['react', 'react-dom'],
  esbuildOptions: (options) => {
    options.jsx = 'automatic'
  },
})
