<script lang="ts" setup>
import { definePageMeta, useHead, useRoute, useI18n, useCommonQuery } from '#imports'
import OrderView from '~/components/orders/OrderView.vue'
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
  <v-progress-circular v-if="loading" indeterminate />
  <order-view v-else :order="order" />
</template>
