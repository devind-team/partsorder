import { createVuetify } from 'vuetify'
import { en, ru } from 'vuetify/locale'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    locale: {
      locale: 'ru',
      messages: { ru, en },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
