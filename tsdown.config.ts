import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts', 'src/react-agent-rules.ts'],
  format: 'esm',
  outExtensions: () => ({ js: '.js' }),
})
