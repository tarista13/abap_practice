import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// abaplint looks up its parser and syntax handlers by class name (constructor.name).
// Minifying, or the bundler renaming clashing class names to e.g. "Data$1", breaks that
// with "duplicate statement syntax handler", so production builds must keep the names.
const keepNames = { output: { keepNames: true } }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: { rolldownOptions: keepNames },
  // the ABAP engine runs in a Web Worker, which is bundled separately
  worker: { rolldownOptions: keepNames },
})
