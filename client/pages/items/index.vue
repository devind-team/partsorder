<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores'

definePageMeta({ middleware: 'auth' })
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const selectedItems = ref([])
const search = ref('')

const headers = [
  { title: '#', key: 'id' },
  { title: 'Номер заказа', key: 'order.id' },
  { title: 'Дата создания', key: 'order.createAt' },
  { title: 'Производитель', key: 'product.manufacturer' },
  { title: 'Артикул', key: 'product.vendorCode' },
  { title: 'Количество', key: 'quantity' },
  { title: 'Поставщик', key: 'pricre.supplierName' },
  { title: 'Цена', key: 'price.price' },
  { title: 'Статус оплаты', key: 'paymentStatus' },
  { title: 'Статус отправки', key: 'statuses.status' },
  { title: 'Комментарий', key: 'commentItem.text' },
]
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <h2>Товары</h2>
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
              :headers="headers"
              density="compact"
              item-value="id"
              show-select
              hide-pagination
            >
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
