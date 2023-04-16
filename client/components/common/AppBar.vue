<script setup lang="ts">
import { useAuthStore } from '~/stores'
import { useLocalePath } from '#imports'

const authStore = useAuthStore()
const localePath = useLocalePath()
</script>
<template>
  <v-app-bar :title="$t('title')" density="compact" floating>
    <template #prepend>
      <NuxtLink :to="localePath({ name: 'index' })"><v-img src="/favicon.ico" width="50" /></NuxtLink>
    </template>
    <template #append>
      <template v-if="authStore.loginIn">
        <v-menu>
          <template #activator="{ props }">
            <v-avatar :image="authStore.avatar" v-bind="props" color="primary">
              {{ authStore.initials }}
            </v-avatar>
          </template>
          <v-list>
            <v-list-item :to="localePath({ name: 'profile-me' })" prepend-icon="mdi-account-circle">
              <v-list-item-title>{{ $t('profile.me') }}</v-list-item-title>
            </v-list-item>
            <v-list-item :to="localePath({ name: 'orders' })" prepend-icon="mdi-delete-variant">
              <v-list-item-title>{{ $t('order.my') }}</v-list-item-title>
            </v-list-item>
            <v-list-item :to="localePath({ name: 'auth-logout' })" prepend-icon="mdi-logout">
              <v-list-item-title>{{ $t('auth.logout') }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <template v-else>
        <!--<v-btn :to="localePath({ name: 'auth-register' })" stacked>{{ $t('auth.register') }}</v-btn>-->
        <v-btn :to="localePath({ name: 'auth-login' })" stacked>{{ $t('auth.login') }}</v-btn>
      </template>
    </template>
  </v-app-bar>
</template>
