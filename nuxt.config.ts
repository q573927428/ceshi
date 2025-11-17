export default defineNuxtConfig({
  css: [
    'element-plus/dist/index.css'
  ],
  vite: {
    vue: {
      customElement: false
    },
    vueJsx: {
      mergeProps: true
    }
  },

  modules: [
    "@element-plus/nuxt"
  ]
})