<script lang="ts" setup>
import StatusesItemsFilter from '~/components/items/StatusesItemsFilter.vue'
import { ItemsQuery, ItemsQueryVariables } from '~/types/graphql'
import itemsQuery from '~/graphql/items/query/items.graphql'

definePageMeta({ middleware: 'auth' })
const { t } = useI18n()
const { dateTimeHM, money } = useFilters()

const selectedStatus = ref<string>('APPROVED')
const search = ref('')

const {
  data: items,
  pagination,
  loading,
} = useQueryRelay<ItemsQuery, ItemsQueryVariables>({
  document: itemsQuery,
  variables: () => ({
    search: search.value,
    filter: selectedStatus.value,
  }),
})

const headers = [
  { title: '#', key: 'id' },
  { title: t('items.tableHeaders.orderId'), key: 'order.id', sortable: false },
  { title: t('items.tableHeaders.orderCreatedAt'), key: 'order.createdAt', sortable: false },
  { title: t('items.tableHeaders.manufacturer'), key: 'product.manufacturer', sortable: false },
  { title: t('items.tableHeaders.vendorCode'), key: 'product.vendorCode', sortable: false },
  { title: t('items.tableHeaders.quantity'), key: 'quantity', sortable: false },
  { title: t('items.tableHeaders.supplierName'), key: 'price.supplierName', sortable: false },
  { title: t('items.tableHeaders.price'), key: 'price.price', sortable: false },
  { title: t('items.tableHeaders.paymentStatus'), key: 'paymentStatus', sortable: false },
  { title: t('items.tableHeaders.status'), key: 'statuses.status', sortable: false },
  { title: t('items.tableHeaders.commentItem'), key: 'commentItem[0].text', sortable: false },
]

const messageFilter = computed(() => {
  if (selectedStatus.value) {
    return String(
      t(`items.filterStatus.filtrationMessage`, {
        status: String(t(`items.filterStatus.statuses.${selectedStatus.value}`)),
      }),
    )
  } else {
    return String(t(`items.filterStatus.noFiltrationMessage`))
  }
})

const reset = (e: MouseEvent) => {
  e.stopPropagation()
  selectedStatus.value = 'APPROVED'
}
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <h2>Товары</h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <statuses-items-filter
          v-slot="{ props: propsStatusesItemFilter }"
          v-model="selectedStatus"
          :title="$t(`items.filterStatus.title`)"
        >
          <v-chip v-bind="propsStatusesItemFilter">
            <template #append>
              <v-icon v-if="!!selectedStatus" @click="reset">mdi-close</v-icon>
            </template>
            {{ messageFilter }}
          </v-chip>
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
              <template #[`item.order.createdAt`]="{ item }">{{ dateTimeHM(item.raw.order.createdAt) }}</template>
              <template #[`item.price.price`]="{ item }">{{
                `&euro; ${item.raw.price == null ? money(0) : money(item.raw.price.price)}`
              }}</template>
              <template #[`item.statuses.status`]="{ item }"
                >{{ $t(`items.filterStatus.statuses.${item.raw.statuses[0].status}`) }}
              </template>
            </v-data-table-server>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
