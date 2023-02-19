import { defineConfig } from 'vite'
import Solid from 'vite-plugin-solid'
import Icons from 'unplugin-icons/vite'
import devtools from 'solid-devtools/vite'

export default defineConfig({
  plugins: [
    Solid(),
    Icons({ compiler: 'solid', autoInstall: true }),
    devtools({
      autoname: true, // e.g. enable autoname
    }),
  ],
  server: {
    port: 5173,
  },
  build: {
    target: 'esnext',
  },
})
