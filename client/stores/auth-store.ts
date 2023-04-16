import { defineStore } from 'pinia'
import { User } from '~/types/graphql'

export type AuthStoreStateType = {
  user: User | null
}

export type AuthStoreGettersType = {
  loginIn: (state: AuthStoreStateType) => boolean
  initials: (state: AuthStoreStateType) => string
  avatar: (state: AuthStoreStateType) => string | null
}

export const useAuthStore = defineStore<string, AuthStoreStateType, AuthStoreGettersType>('authStore', {
  state: () => ({
    user: null,
  }),
  getters: {
    loginIn: (state) => state.user !== null,
    initials: (state) => (state.user ? `${state.user.lastName[0]}${state.user.firstName[0]}` : ''),
    avatar(state) {
      if (state.user === null) {
        return null
      }
      const config = useRuntimeConfig()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return new URL(state.user.avatar!, config['minioExternal']).toString()
    },
  },
})
