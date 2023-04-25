<script lang="ts" setup>
import { useFilters, useHead, useI18n } from '#imports'
import ordersQuery from '~/graphql/orders/queries/orders.graphql'
import AddOrder from '~/components/orders/AddOrder.vue'
import { OrdersQuery, OrdersQueryVariables } from '~/types/graphql'

const { t } = useI18n()

useHead({
  title: t('order.title'),
})
const { dateTimeHM } = useFilters()
const {
  data: orders,
  pagination,
  loading,
  addUpdate,
} = useQueryRelay<OrdersQuery, OrdersQueryVariables>({ document: ordersQuery })

const headers = [
  { title: '#', key: 'id', sortable: false },
  { title: 'Адрес доставки', key: 'address', sortable: false },
  { title: 'Дата создания', key: 'createdAt', sortable: false },
]
</script>
<template>
  <v-container>
    <h1>{{ $t('order.title') }}</h1>
    <v-card>
      <v-card-actions>
        <v-spacer />
        <add-order v-slot="{ props }" :add-update="addUpdate">
          <v-btn v-bind="props">{{ $t('order.add') }}</v-btn>
        </add-order>
      </v-card-actions>
      <v-card-text>
        <v-data-table-server
          v-model:items-per-page="pagination.pageSize.value"
          :items-length="pagination.count.value"
          :headers="headers"
          :items="orders"
          :loading="loading"
        >
          <template #item.createdAt="{ item }">
            {{ dateTimeHM(item.raw.createdAt) }}
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>
  </v-container>
</template>
