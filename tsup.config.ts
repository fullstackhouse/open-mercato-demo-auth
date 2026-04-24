import { defineConfig } from 'tsup'

const jsx = { jsx: 'automatic' as const }

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    splitting: false,
    sourcemap: true,
    treeshake: true,
    external: ['react', 'react-dom', '@open-mercato/shared'],
    esbuildOptions: (options) => {
      Object.assign(options, jsx)
    },
  },
  {
    entry: {
      'modules/demo_auth/index': 'src/modules/demo_auth/index.ts',
      'modules/demo_auth/widgets/components': 'src/modules/demo_auth/widgets/components.ts',
      'modules/demo_auth/widgets/LoginFormWrapper': 'src/modules/demo_auth/widgets/LoginFormWrapper.tsx',
      'modules/demo_auth/widgets/DemoAuthScript': 'src/modules/demo_auth/widgets/DemoAuthScript.tsx',
    },
    format: ['esm'],
    dts: true,
    clean: false,
    splitting: false,
    sourcemap: true,
    treeshake: true,
    external: ['react', 'react-dom', '@open-mercato/shared'],
    esbuildOptions: (options) => {
      Object.assign(options, jsx)
    },
  },
])
