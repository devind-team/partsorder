<script setup lang="ts">
import { definePageMeta, useHead, useI18n, useLocalePath } from '#imports'

const localePath = useLocalePath()
const { t } = useI18n()

definePageMeta({ middleware: 'auth' })
useHead({ title: t('dashboard.title') })

const cards: Record<string, string>[] = [
  { key: 'products', title: t('products.title'), to: 'products', icon: 'mdi-train-car-autorack' },
  { key: 'orders', title: t('order.title'), to: 'orders', icon: 'mdi-basket' },
  { key: 'items-pending', title: t('items.pending.title'), to: 'items-pending', icon: 'mdi-archive-lock-open-outline' },
  { key: 'items-pricing', title: t('items.pricing.title'), to: 'items-pricing', icon: 'mdi-currency-eur' },
]
</script>
<template>
  <v-container>
    <h1>{{ $t('dashboard.title') }}</h1>
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
