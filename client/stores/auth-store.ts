import { defineStore } from 'pinia'
import { User } from '~/types/graphql'

export type AuthStoreStateType = {
  user?: User | null
}

export type AuthStoreGettersType = {
  loginIn: (state: AuthStoreStateType) => boolean
  initials: (state: AuthStoreStateType) => string
}

export type AuthStoreActionsType = {
  setAvatar: (url: string) => void
}

export const useAuthStore = defineStore<string, AuthStoreStateType, AuthStoreGettersType, AuthStoreActionsType>(
  'authStore',
  {
    state: () => ({
      user: null,
    }),
    getters: {
      loginIn: (state) => !!state.user,
      initials: (state) => (state.user ? `${state.user.lastName[0]}${state.user.firstName[0]}` : ''),
    },
    actions: {
      setAvatar(url: string): void {
        if (this.user) {
          this.user = { ...this.user, avatar: url }
        }
      },
    },
  },
)
