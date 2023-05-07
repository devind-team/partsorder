<script lang="ts" setup>
import { definePageMeta, useFilters, useHead, useI18n, useLocalePath } from '#imports'
import ordersQuery from '~/graphql/orders/queries/orders.graphql'
import AddOrder from '~/components/orders/AddOrder.vue'
import { OrdersQuery, OrdersQueryVariables } from '~/types/graphql'
import UserView from '~/components/common/UserView.vue'
import StatusesViewDialog from '~/components/orders/StatusesViewDialog.vue'

const localePath = useLocalePath()
const { t } = useI18n()
const { dateTimeHM } = useFilters()

definePageMeta({ middleware: 'auth' })
useHead({ title: t('order.title') })

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
  { title: 'Статус', key: 'statuses', sortable: false },
  { title: 'Менеджер', key: 'manager', sortable: false },
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
          v-model:page="pagination.page.value"
          v-model:items-per-page="pagination.pageSize.value"
          :items-length="pagination.count.value"
          :headers="headers"
          :items="orders"
          :loading="loading"
        >
          <template #item.id="{ item }">
            <nuxt-link :to="localePath({ name: 'orders-orderId', params: { orderId: item.raw.id } })">
              {{ item.raw.id }}
            </nuxt-link>
          </template>
          <template #item.createdAt="{ item }">
            {{ dateTimeHM(item.raw.createdAt) }}
          </template>
          <template #item.statuses="{ item }">
            <statuses-view-dialog v-if="item.raw.statuses.length" v-slot="{ props }" :statuses="item.raw.statuses">
              <v-chip v-bind="props" size="small">
                {{ $t(`order.statuses.${item.raw.statuses[item.raw.statuses.length - 1].status}`) }}
              </v-chip>
            </statuses-view-dialog>
            <template v-else>{{ $t('order.status.noStatus') }}</template>
          </template>
          <template #item.manager="{ item }">
            <user-view v-if="item.raw.manager" :user="item.raw.manager" />
            <div v-else>Не назначен</div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>
  </v-container>
</template>
