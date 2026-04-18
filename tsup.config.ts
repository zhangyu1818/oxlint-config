import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts', 'src/react-agent-rules.ts'],
  format: 'esm',
})
