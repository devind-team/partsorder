<script lang="ts" setup>
import { Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { ExtractSingleKey } from '@vue/apollo-composable/dist/util/ExtractSingleKey'
import { useFilters, useI18n } from '#imports'
import { OrderQuery, Price } from '~/types/graphql'
import { useAuthStore } from '~/stores'
import { UpdateType } from '~/composables/query-common'
import StatusesViewDialog from '~/components/orders/StatusesViewDialog.vue'
import { DataTableHeader } from '~/types/vuetify'
import OrderItemsMenu from '~/components/orders/OrderItemsMenu.vue'

const authStore = useAuthStore()
const { t } = useI18n()
const { dateTimeHM } = useFilters()
const { user } = storeToRefs(authStore)

const props = defineProps<{
  order: ExtractSingleKey<OrderQuery, 'order'>
  update: UpdateType
}>()

const selectedItems: Ref<number[]> = ref<number[]>([])
const search = ref<string>('')

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
  h.push({ title: 'Статус', key: 'statuses' })
  h.push({ title: 'Цена', key: 'finalPrice' })
  return h
})

const finalBill = computed<number | undefined>(() => {
  return props.order.items
    ?.filter((item) => item.price)
    .reduce((a, c) => a + c.price?.price * c.quantity * c.coefficient, 0)
})

const makePrice = (price: Price | null, quantity: number, coefficient: number): number | null => {
  if (price) {
    return price.price * quantity * coefficient
  }
  return 0
}
</script>
<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <h1>
          {{ t('order.detail.title', { number: props.order.id, date: dateTimeHM(order.createdAt) }) }}
        </h1>
      </v-col>
      <v-col>
        <h2 class="text-right">Цена заказа: {{ finalBill }}&euro;</h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <order-items-menu
          v-slot="{ props: propsOrderItemsMenu }"
          :order-id="Number(order.id)"
          :update="props.update"
          :selected-items="selectedItems"
          @close="selectedItems = []"
        >
          <v-btn v-bind="propsOrderItemsMenu" color="primary">Действия</v-btn>
        </order-items-menu>
      </v-col>
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
              <template #[`item.finalPrice`]="{ item }">
                {{ makePrice(item.raw.price, item.raw.quantity, item.raw.coefficient) }}&euro;
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
