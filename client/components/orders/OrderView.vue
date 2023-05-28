<script lang="ts" setup>
import { Ref } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import { storeToRefs } from 'pinia'
import { ExtractSingleKey } from '@vue/apollo-composable/dist/util/ExtractSingleKey'
import { useFilters, useI18n } from '#imports'
import { useAuthStore } from '~/stores'
import { ChangePartialUpdateType, UpdateType } from '~/composables/query-common'
import { DataTableHeader } from '~/types/vuetify'
import {
  ChangeQuantityItemMutation,
  ChangeQuantityItemMutationVariables,
  ChangeSellingPriceItemMutation,
  ChangeSellingPriceItemMutationVariables,
  OrderQuery,
  Item,
  Price,
} from '~/types/graphql'
import StatusesViewDialog from '~/components/orders/StatusesViewDialog.vue'
import OrderItemsMenu from '~/components/orders/OrderItemsMenu.vue'
import changeQuantityItemMutation from '~/graphql/items/mutations/change-quantity-item.graphql'
import changeSellingPriceItemMutation from '~/graphql/items/mutations/change-selling-price-item.graphql'
import StatusMenu from '~/components/orders/StatusMenu.vue'

const authStore = useAuthStore()
const { dateTimeHM, money } = useFilters()
const { t } = useI18n()
const { user } = storeToRefs(authStore)

const props = defineProps<{
  order: ExtractSingleKey<OrderQuery, 'order'>
  update: UpdateType
  changePartialUpdate: ChangePartialUpdateType
}>()

const selectedItems: Ref<number[]> = ref<number[]>([])
const search = ref<string | undefined>(undefined)

const headers = computed<DataTableHeader[]>(() => {
  const h: DataTableHeader[] = [
    { title: '#', key: 'id' },
    { title: 'Производитель', key: 'product.manufacturer' },
    { title: 'Артикул', key: 'product.vendorCode' },
    { title: 'Название', key: 'product.name' },
    { title: 'Количество', key: 'quantity', width: 150, align: 'end' },
  ]
  if (user.value?.role === 'ADMIN') {
    h.push({ title: 'Цена закупки', key: 'price', align: 'end' })
    h.push({ title: 'Наценка', key: 'coefficient' })
    h.push({ title: 'Цена продажи', key: 'sellingPrice', align: 'end' })
  }
  h.push({ title: 'Поставщик', key: 'supplierName' })
  h.push({ title: 'Статус', key: 'statuses' })
  h.push({ title: 'Сумма', key: 'finalPrice', align: 'end' })
  return h
})

const finalBill = computed<number | undefined>(() => {
  return props.order.items
    ?.filter((item) => item.price)
    .reduce((a, c) => a + c.price?.price * c.quantity * c.coefficient, 0)
})

const makePrice = (price: Price | null, quantity: number, coefficient: number): string | number => {
  return price ? money(price.price * quantity * coefficient) : 0
}
const makeSellingPrice = (price: Price | null, coefficient: number): string | number => {
  return price ? money(price.price * coefficient) : 0
}

const changeField = ref<string | undefined>(undefined)
const fieldValue = ref<string>('')
const setChangeField = (field: string | undefined, value: string) => {
  changeField.value = field
  fieldValue.value = value
}
const { mutate: changeQuantityItem } = useMutation<ChangeQuantityItemMutation, ChangeQuantityItemMutationVariables>(
  changeQuantityItemMutation,
  { update: (cache, result) => props.changePartialUpdate(cache, result, 'items', 'quantity') },
)
const { mutate: changeSellingPriceItem } = useMutation<
  ChangeSellingPriceItemMutation,
  ChangeSellingPriceItemMutationVariables
>(changeSellingPriceItemMutation, {
  update: (cache, result) => props.changePartialUpdate(cache, result, 'items', 'coefficient'),
})
const changeFieldValue = async (item: Item, field: 'quantity' | 'sellingPrice', value: string): Promise<void> => {
  if (field === 'quantity') {
    const quantity = parseInt(value)
    if (!Number.isNaN(quantity)) {
      await changeQuantityItem({ itemId: Number(item.id), quantity: Math.max(quantity, 1) })
    }
  }
  if (field === 'sellingPrice') {
    const price = parseFloat(value)
    if (!Number.isNaN(price)) {
      await changeSellingPriceItem({ itemId: Number(item.id), price: Math.max(price, 1) })
    }
  }
  setChangeField(undefined, '')
}
</script>
<template>
  <v-container :fluid="true">
    <v-row>
      <v-col>
        <h1>
          {{ t('order.detail.title', { number: props.order.id }) }}
        </h1>
        <status-menu v-slot="{ props: statusesProps }" :update="props.update" :order="props.order">
          <v-chip v-bind="statusesProps">
            {{ $t(`order.statuses.${props.order.statuses[props.order.statuses.length - 1]?.status || '-'}`) }}
          </v-chip>
        </status-menu>
        <v-chip>{{ dateTimeHM(props.order.createdAt) }}</v-chip>
      </v-col>
      <v-col>
        <h2 class="text-right">Сумма заказа: &euro;{{ money(finalBill) }}</h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <order-items-menu
          v-slot="{ props: propsOrderItemsMenu }"
          :order-id="Number(order.id)"
          :update="props.update"
          :change-partial-update="props.changePartialUpdate"
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
              <template #[`item.quantity`]="{ item }">
                <v-text-field
                  v-if="changeField === `quantity_${item.raw.id}`"
                  v-model="fieldValue"
                  clear-icon="mdi-close-circle"
                  append-inner-icon="mdi-check"
                  density="compact"
                  :clearable="true"
                  hide-details
                  single-line
                  @click:clear="setChangeField(undefined, '')"
                  @click:append-inner="changeFieldValue(item.raw, 'quantity', fieldValue)"
                />
                <div v-else @click="setChangeField(`quantity_${item.raw.id}`, item.raw.quantity)">
                  {{ item.raw.quantity }}
                </div>
              </template>
              <template #[`item.coefficient`]="{ item }">
                {{ item.raw.coefficient.toFixed(4) }}
              </template>
              <template #[`item.price`]="{ item }">
                {{ (item.raw.price && '&euro;' + money(item.raw.price.price)) || 'Не указана' }}
              </template>
              <template #[`item.sellingPrice`]="{ item }">
                <template v-if="item.raw.price">
                  <v-text-field
                    v-if="changeField === `sellingPrice_${item.raw.id}`"
                    v-model="fieldValue"
                    clear-icon="mdi-close-circle"
                    append-inner-icon="mdi-check"
                    density="compact"
                    :clearable="true"
                    hide-details
                    single-line
                    @click:clear="setChangeField(undefined, '')"
                    @click:append-inner="changeFieldValue(item.raw, 'sellingPrice', fieldValue)"
                  />
                  <div
                    v-else
                    @click="
                      setChangeField(`sellingPrice_${item.raw.id}`, `${item.raw.price.price * item.raw.coefficient}`)
                    "
                  >
                    &euro;{{ makeSellingPrice(item.raw.price, item.raw.coefficient) }}
                  </div>
                </template>
                <template v-else>-&euro;</template>
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
                &euro;{{ makePrice(item.raw.price, item.raw.quantity, item.raw.coefficient) }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
