<script lang="ts" setup>
import { useHead, useI18n, useLocalePath } from '#imports'
import { ItemsByLastStatusQuery, ItemsByLastStatusQueryVariables, Price } from '~/types/graphql'
import itemsByLastStatus from '~/graphql/items/queries/items-by-last-status.graphql'
import StatusesItemsFilter from '~/components/items/StatusesItemsFilter.vue'
import StatusesViewDialog from '~/components/orders/StatusesViewDialog.vue'

const { t } = useI18n()
const localePath = useLocalePath()

definePageMeta({ middleware: 'auth' })
useHead({ title: t('items.pending.title') })
const { dateTimeHM, money } = useFilters()

const selectedStatus = ref<string>('APPROVED')
const search = ref('')

const {
  data: items,
  pagination,
  loading,
} = useQueryRelay<ItemsByLastStatusQuery, ItemsByLastStatusQueryVariables>({
  document: itemsByLastStatus,
  variables: () => ({
    search: search.value,
    status: selectedStatus.value,
  }),
})

const headers = [
  { title: '#', key: 'id' },
  { title: t('items.tableHeaders.orderId'), key: 'order.id', sortable: false },
  { title: t('items.tableHeaders.vendorCode'), key: 'product.vendorCode', sortable: false },
  { title: t('items.tableHeaders.manufacturer'), key: 'product.manufacturer', sortable: false },
  { title: t('items.tableHeaders.supplierName'), key: 'price.supplierName', sortable: false },
  { title: t('items.tableHeaders.quantity'), key: 'quantity', sortable: false },
  { title: t('items.tableHeaders.coefficient'), key: 'coefficient', sortable: false },
  { title: t('items.tableHeaders.price'), key: 'price.price', sortable: false },
  { title: t('items.tableHeaders.sellingPrice'), key: 'sellingPrice', sortable: false },
  { title: t('items.tableHeaders.bill'), key: 'bill', sortable: false },
  { title: t('items.tableHeaders.status'), key: 'statuses', sortable: false },
  { title: t('items.tableHeaders.orderCreatedAt'), key: 'order.createdAt', sortable: false },
]

const messageFilter = computed(() => {
  return t(`items.filterStatus.filtrationMessage`, { status: t(`items.filterStatus.statuses.${selectedStatus.value}`) })
})
const makeSellingPrice = (price: Price | null, coefficient: number): string | number => {
  return price ? money(price.price * coefficient) : 0
}
const makePrice = (price: Price | null, quantity: number, coefficient: number): string | number => {
  return price ? money(price.price * quantity * coefficient) : 0
}
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="10">
        <h1>{{ $t('items.pending.title') }}</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <statuses-items-filter
          v-slot="{ props: propsStatusesItemFilter }"
          v-model="selectedStatus"
          :title="$t(`items.filterStatus.title`)"
        >
          <v-chip v-bind="propsStatusesItemFilter">{{ messageFilter }}</v-chip>
        </statuses-items-filter>
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
            <v-data-table-server
              v-model:items-per-page="pagination.pageSize.value"
              v-model:page="pagination.page.value"
              :headers="headers"
              :loading="loading"
              :items="items"
              :items-length="pagination.totalCount.value"
              density="compact"
            >
              <template #[`item.order.id`]="{ item }">
                <nuxt-link :to="localePath({ name: 'orders-orderId', params: { orderId: item.raw.order.id } })">
                  {{ item.raw.order.id }}
                </nuxt-link>
              </template>
              <template #[`item.order.createdAt`]="{ item }">{{ dateTimeHM(item.raw.order.createdAt) }}</template>
              <template #[`item.price.price`]="{ item }">
                {{ item.raw.price ? '&euro;' + money(item.raw.price.price) : 'Не указана' }}
              </template>
              <template #[`item.sellingPrice`]="{ item }">
                &euro;{{ makeSellingPrice(item.raw.price, item.raw.coefficient) }}
              </template>
              <template #[`item.bill`]="{ item }">
                &euro;{{ makePrice(item.raw.price, item.raw.quantity, item.raw.coefficient) }}
              </template>
              <template #[`item.statuses`]="{ item }">
                <statuses-view-dialog v-slot="{ props: statusesProps }" :statuses="item.raw.statuses">
                  <v-chip v-bind="statusesProps" size="small">
                    {{ $t(`order.statuses.${item.raw.statuses[item.raw.statuses.length - 1].status}`) }}
                  </v-chip>
                </statuses-view-dialog>
              </template>
            </v-data-table-server>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
