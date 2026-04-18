import { defineOxfmtConfig } from './src/index.ts'

export default defineOxfmtConfig({
  presets: {
    imports: true,
    packageJson: true,
    tailwindcss: false,
  },
})
