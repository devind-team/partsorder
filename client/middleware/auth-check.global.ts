import { parse } from 'cookie-es'
import { useAuthStore } from '~/stores'
import { useNuxtApp } from '#app'
import { MeQuery } from '~/types/graphql'
import meQuery from '~/graphql/auth/queries/me.graphql'
import { useApollo } from '#imports'

const DEFAULT_CLIENT_ID = 'default'

export default defineNuxtRouteMiddleware(async (_to, _from) => {
  const { ssrContext } = useNuxtApp()
  const apollo = useApollo()
  const authStore = useAuthStore()
  const { resolveClient } = useApolloClient()
  const client = resolveClient()
  let token: string | null
  if (process.server) {
    const cookies = parse(ssrContext?.event?.req?.headers?.cookie || '') as Record<string, string>
    token = cookies[`apollo:${DEFAULT_CLIENT_ID}.token`]
  } else {
    token = await apollo.getToken()
  }
  if (token && !authStore.loginIn) {
    try {
      authStore.user = await client
        .query({
          query: meQuery,
          fetchPolicy: 'network-only',
        })
        .then(({ data }: { data: MeQuery }) => data.me)
    } catch {
      if (process.client) {
        await apollo.onLogout()
      }
    }
  }
})
