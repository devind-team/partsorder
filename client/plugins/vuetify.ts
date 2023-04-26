import { createVuetify } from 'vuetify'
import { en, ru } from 'vuetify/locale'
import * as components from 'vuetify/components'
import * as componentsLabs from 'vuetify/labs/components'
import * as directives from 'vuetify/directives'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    components: { ...components, ...componentsLabs },
    directives,
    locale: {
      locale: 'ru',
      messages: { ru, en },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
