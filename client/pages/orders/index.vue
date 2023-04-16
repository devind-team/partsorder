<script lang="ts" setup>
import { useHead, useLocalePath } from '#imports'
const localePath = useLocalePath()

useHead({
  title: 'Мои заказы',
})
</script>
<template>
  <v-container>
    <h1>Мои заказы</h1>
    <v-card>
      <v-card-actions>
        <v-spacer />
        <v-btn :to="localePath({ name: 'orders-new' })">Добавить новый заказ</v-btn>
      </v-card-actions>
      <v-card-text>Таблица с заказами</v-card-text>
    </v-card>
  </v-container>
</template>
