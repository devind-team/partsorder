<script lang="ts" setup>
import StatusesItemsFilter from '~/components/items/StatusesItemsFilter.vue'
import { ItemsQuery, ItemsQueryVariables } from '~/types/graphql'
import itemsQuery from '~/graphql/items/query/items.graphql'

definePageMeta({ middleware: 'auth' })
const { t } = useI18n()
const { dateTimeHM } = useFilters()

const selectedStatus = ref<string>('APPROVED')
const search = ref('')

const {
  data: items,
  pagination,
  loading,
} = useQueryRelay<ItemsQuery, ItemsQueryVariables>({
  document: itemsQuery,
})

const headers = [
  { title: '#', key: 'id' },
  { title: 'Номер заказа', key: 'order.id' },
  { title: 'Дата создания', key: 'order.createdAt' },
  { title: 'Производитель', key: 'product.manufacturer' },
  { title: 'Артикул', key: 'product.vendorCode' },
  { title: 'Количество', key: 'quantity' },
  { title: 'Поставщик', key: 'pricre.supplierName' },
  { title: 'Цена', key: 'price.price' },
  { title: 'Статус оплаты', key: 'paymentStatus' },
  { title: 'Статус отправки', key: 'statuses[0].status' },
  { title: 'Комментарий', key: 'commentItem[0].text' },
]

const messageFiter = computed(() => {
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

const reset = () => {
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
          <v-chip v-bind="propsStatusesItemFilter" :closable="!!selectedStatus" @click:close="reset">{{
            messageFiter
          }}</v-chip>
        </statuses-items-filter>
        <v-chip :closable="!!selectedStatus" :text="messageFiter" @click:close="reset" />
        <v-btn color="warning" @click="reset">test</v-btn>
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
            <pre>{{ items[0].statuses }}</pre>
            <pre>{{ `${dateTimeHM(items[0].createdAt)}` }}</pre>
            <v-data-table-server
              v-model:items-per-page="pagination.pageSize.value"
              v-model:page="pagination.page.value"
              :headers="headers"
              :loading="loading"
              :items="items"
              :items-length="pagination.totalCount.value"
              density="compact"
            >
              <template #item.order="{ item }">{{ dateTimeHM(item.value) }}</template>
            </v-data-table-server>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
