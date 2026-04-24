import { defineConfig } from 'tsup'

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
  },
  {
    entry: {
      'modules/demo_auth/index': 'src/modules/demo_auth/index.ts',
      'modules/demo_auth/widgets/components': 'src/modules/demo_auth/widgets/components.ts',
      'modules/demo_auth/widgets/LoginFormWrapper': 'src/modules/demo_auth/widgets/LoginFormWrapper.tsx',
    },
    format: ['esm'],
    dts: true,
    clean: false,
    splitting: false,
    sourcemap: true,
    treeshake: true,
    external: ['react', 'react-dom', '@open-mercato/shared'],
  },
])
