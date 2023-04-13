<script lang="ts" setup>
import { useHead } from '#imports'

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
        <v-btn>Добавить новый заказ</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
