<script setup lang="ts">
import { useFilters, useHead, useI18n } from '#imports'
import productsQuery from '~/graphql/products/queries/products.graphql'
import { ProductsQuery, ProductsQueryVariables } from '~/types/graphql'

const { t } = useI18n()
const { date, money } = useFilters()
useHead({ title: t('products.title') })

const search = ref<string>('')

const {
  data: products,
  loading,
  pagination,
} = useQueryRelay<ProductsQuery, ProductsQueryVariables>({
  document: productsQuery,
  variables: () => ({
    search: search.value,
  }),
  options: {
    debounce: 250,
  },
})
const headers = [
  { title: '#', key: 'id', sortable: false },
  ...['vendorCode', 'name', 'manufacturer'].map((key) => ({
    title: t(`products.${key}`),
    key,
    sortable: false,
  })),
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
            show-expand
            density="compact"
          >
            <template #expanded-row="{ columns, item }">
              <tr>
                <td :colspan="columns.length">
                  <v-row>
                    <v-col>
                      <v-list density="compact">
                        <v-list-subheader>{{ $t('products.prices') }}</v-list-subheader>
                        <v-list-item
                          v-for="price in item.raw.prices"
                          :key="price.id"
                          :title="`&euro;${money(price.price * 2)} ${$t('prices.withoutVAT')}`"
                          :subtitle="`${price.supplierName} - ${date(price.createdAt)}`"
                        />
                      </v-list>
                    </v-col>
                    <v-col>
                      <v-list>
                        <v-list-subheader>{{ $t('products.attributes') }}</v-list-subheader>
                      </v-list>
                    </v-col>
                  </v-row>
                </td>
              </tr>
            </template>
          </v-data-table-server>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
