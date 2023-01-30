import { defineConfig } from 'vite'
import Solid from 'vite-plugin-solid'
import Icons from 'unplugin-icons/vite'

export default defineConfig({
  plugins: [Solid(), Icons({ compiler: 'solid', autoInstall: true })],
  server: {
    port: 5173,
  },
  build: {
    target: 'esnext',
  },
})
