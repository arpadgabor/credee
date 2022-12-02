import { defineConfig } from 'vite'
import Solid from 'vite-plugin-solid'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    Solid(),
    AutoImport({
      dts: true,
      resolvers: [
        IconsResolver({
          prefix: 'Icon',
          extension: 'jsx',
          // enabledCollections: ['ph'],
        }),
      ],
    }),
    Icons({ compiler: 'solid' }),
  ],
  server: {
    port: 5173,
  },
  build: {
    target: 'esnext',
  },
})
