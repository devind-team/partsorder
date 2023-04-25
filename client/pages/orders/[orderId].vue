<script lang="ts" setup>
import { useRoute } from '#imports'

const route = useRoute()
</script>
<template>
  <v-container>
    <v-card>
      <v-card-title>Детализация заказа</v-card-title>
      <v-card-text>{{ route.params }}</v-card-text>
    </v-card>
  </v-container>
</template>
