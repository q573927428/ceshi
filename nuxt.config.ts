export default defineNuxtConfig({
  app: {
    inlineStyles: true
  },
  css: [
    '~/assets/css/main.css'
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