export default defineNuxtConfig({
  compatibilityDate: '2026-07-21',
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
  ],
})