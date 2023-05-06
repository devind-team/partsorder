<script setup lang="ts">
import { useFilters, useHead, useI18n } from '#imports'
import productsQuery from '~/graphql/products/queries/products.graphql'
import { ProductsQuery, ProductsQueryVariables } from '~/types/graphql'
import { useOffsetPagination } from '~/composables/pagination'

const { t } = useI18n()
const { date } = useFilters()
useHead({
  title: t('title'),
})

const search = ref<string>('')

const {
  data: products,
  loading,
  pagination,
} = useQueryRelay<ProductsQuery, ProductsQueryVariables>(
  {
    document: productsQuery,
    variables: () => ({
      search: search.value,
    }),
    options: {
      debounce: 250,
    },
  },
  { pagination: useOffsetPagination({ pageSize: 10 }) },
)
const headers = [
  { title: '#', key: 'id', sortable: false },
  { title: 'Артикул', key: 'vendorCode', sortable: false },
  { title: 'Название', key: 'name', sortable: false },
  { title: 'Производитель', key: 'manufacturer', sortable: false },
  { title: 'Цены', key: 'prices', sortable: false },
]
</script>
<template>
  <v-container>
    <v-row>
      <v-col>
        <v-text-field
          v-model="search"
          :label="$t('index.vendorCode')"
          :loading="loading"
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
          <v-data-table-server
            v-model:items-per-page="pagination.pageSize.value"
            v-model:page="pagination.page.value"
            :headers="headers"
            :loading="loading"
            :items="products"
            :items-length="pagination.totalCount.value"
          >
            <template #[`item.prices`]="{ item }">
              <v-list density="compact">
                <v-list-item
                  v-for="price in item.raw.prices"
                  :key="price.id"
                  :title="`${price.price} (${price.duration})`"
                  :subtitle="`${price.supplierName} - ${date(price.createdAt)}`"
                />
              </v-list>
            </template>
          </v-data-table-server>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
