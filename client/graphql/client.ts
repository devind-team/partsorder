import { defineApolloClient } from '@nuxtjs/apollo'

export default defineApolloClient({
  httpEndpoint: process.env.NUXT_API_URL as string,
  browserHttpEndpoint: process.env.NUX_API_URL_BROWSER as string,
  wsEndpoint: process.env.NUXT_WS_URL_BROWSER as string,
  inMemoryCacheOptions: {},
  // inMemoryCacheOptions: { fragmentMatcher }
  httpLinkOptions: {
    headers: {
      'Accept-Language': 'ru', // Язык по умолчанию
    },
  },
})
