<script lang="ts" setup>
import { definePageMeta, useHead, useRoute } from '#imports'
import orderQuery from '~/graphql/orders/queries/order.graphql'
import { OrderQuery, OrderQueryVariables } from '~/types/graphql'

const route = useRoute()
const { t } = useI18n()

definePageMeta({ middleware: 'auth' })
useHead({
  title: t('order.detail.title', { number: route.params.orderId }),
})

const { data: order, loading } = useCommonQuery<OrderQuery, OrderQueryVariables>({
  document: orderQuery,
  variables: { orderId: +route.params.orderId },
})
</script>
<template>
  <v-container>
    <v-card :loading="loading">
      <v-card-title>{{ t('order.detail.title', { number: route.params.orderId }) }}</v-card-title>
      <v-card-text>{{ order }}</v-card-text>
    </v-card>
  </v-container>
</template>
