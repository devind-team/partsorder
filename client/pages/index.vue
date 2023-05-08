<script setup lang="ts">
import { useHead, useI18n, useLocalePath } from '#imports'

const localePath = useLocalePath()
const { t } = useI18n()
useHead({
  title: t('title'),
})

const cards: Record<string, string>[] = [
  { key: 'products', title: 'Поиск продуктов', to: 'products', icon: 'mdi-train-car-autorack' },
  { key: 'orders', title: 'Мои заказы', to: 'orders', icon: 'mdi-basket' },
]
</script>
<template>
  <v-container>
    <v-row>
      <v-col v-for="card in cards" :key="card.key" :cols="12 / cards.length">
        <v-card :to="localePath({ name: card.to })">
          <v-card-text class="text-center">
            <v-icon :icon="card.icon" size="100px" />
          </v-card-text>
          <v-card-title>{{ card.title }}</v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
