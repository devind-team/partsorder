<script lang="ts" setup>
import { useFilters, useI18n } from '#imports'
import { OrderQuery, Price } from '~/types/graphql'
import { ExtractSingleKey } from '@vue/apollo-composable/dist/util/ExtractSingleKey'
import { useAuthStore } from '~/stores'
import { storeToRefs } from 'pinia'
import StatusesViewDialog from '~/components/orders/StatusesViewDialog.vue'
import { DataTableHeader } from '~/types/vuetify'

const authStore = useAuthStore()
const { t } = useI18n()
const { dateTimeHM } = useFilters()
const { user } = storeToRefs(authStore)

const props = defineProps<{
  order: ExtractSingleKey<OrderQuery, 'order'>
}>()

const selectedItems = ref([])
const search = ref('')

const headers = computed<DataTableHeader[]>(() => {
  const h = [
    { title: '#', key: 'id' },
    { title: 'Производитель', key: 'product.manufacturer' },
    { title: 'Артикул', key: 'product.vendorCode' },
    { title: 'Название', key: 'product.name' },
    { title: 'Количество', key: 'quantity' },
  ]
  if (user.value?.role === 'ADMIN') {
    h.push({ title: 'Цена закупки', key: 'price' })
    h.push({ title: 'Наценка', key: 'coefficient' })
  }
  h.push({ title: 'Поставщик', key: 'supplierName' })
  h.push({ title: 'Цена', key: 'finalPrice' })
  h.push({ title: 'Оплачено', key: 'paid' })
  h.push({ title: 'Статус', key: 'statuses' })
  h.push({ title: 'Стоимость', key: 'bill' })
  return h
})

const makePrice = (price: Price | null, coeff: number): number | string => {
  if (price) {
    return price.price * coeff
  }
  return '&mdash;'
}
</script>
<template>
  <v-container fluid>
    <h1 class="my-4">{{ t('order.detail.title', { number: props.order.id, date: dateTimeHM(order.createdAt) }) }}</h1>
    <v-row>
      <v-col></v-col>
      <v-col>
        <v-text-field
          v-model="search"
          :label="$t('search')"
          append-inner-icon="mdi-magnify"
          density="compact"
          hide-details
          single-line
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card>
          <v-card-text>
            <v-data-table
              v-model="selectedItems"
              :search="search"
              :headers="headers"
              :items="props.order.items"
              :items-per-page="-1"
              density="compact"
              item-value="id"
              show-select
              hide-pagination
            >
              <template #[`item.price`]="{ item }">
                {{ (item.raw.price && item.raw.price.price) || 'Не указан' }} (Изменить/Задать)
              </template>
              <template #[`item.supplierName`]="{ item }">
                {{ (item.raw.price && item.raw.price.supplierName) || 'Не указан' }}
              </template>
              <template #[`item.paid`]="{ item }">
                {{ item.raw.statuses.map((status) => status.status).includes('PURCHASED') ? 'Оплачен' : 'Не оплачен' }}
              </template>
              <template #[`item.statuses`]="{ item }">
                <statuses-view-dialog
                  v-if="item.raw.statuses.length"
                  v-slot="{ props: statusesProps }"
                  :statuses="item.raw.statuses"
                >
                  <v-chip v-bind="statusesProps" size="small">
                    {{ $t(`order.statuses.${item.raw.statuses[item.raw.statuses.length - 1].status}`) }}
                  </v-chip>
                </statuses-view-dialog>
                <template v-else>{{ $t('order.status.noStatus') }}</template>
              </template>
              <template #[`item.bill`]="{ item }">{{ makePrice(item.raw.price, item.raw.coefficient) }}&euro;</template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
