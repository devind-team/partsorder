<script lang="ts" setup>
import { useMutation } from '@vue/apollo-composable'
import { ChangePartialUpdate, UpdateType } from '~/composables/query-common'
import {
  UnloadOrderMutation,
  UnloadOrderMutationVariables,
  RecountPricesMutation,
  RecountPricesMutationVariables,
  DeleteOrderItemsMutation,
  DeleteOrderItemsMutationVariables,
  Item,
} from '~/types/graphql'
import unloadOrderMutation from '~/graphql/orders/mutations/unload-order.graphql'
import changePricesMutation from '~/graphql/items/mutations/recount-prices.graphql'
import deleteOrderItemsMutation from '~/graphql/orders/mutations/delete-order-items.graphql'

const props = defineProps<{
  orderId: number
  selectedItems: number[]
  update: UpdateType
  changePartialUpdate: ChangePartialUpdate
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const active = ref<boolean>(false)

const close = () => {
  active.value = false
  emit('close')
}

const { mutate: recountPrices } = useMutation<RecountPricesMutation, RecountPricesMutationVariables>(
  changePricesMutation,
  { update: (cache, result) => props.changePartialUpdate(cache, result, 'items', 'price') },
)

const { mutate: unloadOrder, onDone: onDoneUnloadOrder } = useMutation<
  UnloadOrderMutation,
  UnloadOrderMutationVariables
>(unloadOrderMutation)
onDoneUnloadOrder(({ data }) => {
  if (data) {
    const { serverUrl, bucket, key } = data.unloadOrder
    const url = new URL(`${bucket}/${key}`, serverUrl)
    window.location.href = url.href
  }
})

const { mutate: deleteOrderItems } = useMutation<DeleteOrderItemsMutation, DeleteOrderItemsMutationVariables>(
  deleteOrderItemsMutation,
  {
    update: (cache, result) => {
      props.update(cache, result, (dataCache) => {
        close()
        if (!result.data) {
          return dataCache
        }
        return {
          ...dataCache,
          order: {
            ...dataCache.order,
            items: dataCache.order.items.filter(
              (item: Item) => !result.data?.deleteOrderItems.deleteIds.includes(Number(item.id)),
            ),
          },
        }
      })
    },
  },
)
</script>
<template>
  <v-menu v-model="active">
    <template #activator="{ props: propsMenu }">
      <slot :props="propsMenu" />
    </template>
    <v-list density="compact">
      <v-list-item
        :title="$t('order.items.uploadXlsx')"
        prepend-icon="mdi-file-excel-box-outline"
        @click="unloadOrder({ orderId: props.orderId })"
      />
      <v-list-item :title="$t('order.items.uploadOffer')" prepend-icon="mdi-file-pdf-box" />
      <v-list-item :title="$t('add')" prepend-icon="mdi-plus" />
      <v-list-item
        :disabled="!props.selectedItems.length"
        :title="$t('order.items.recountPrices')"
        prepend-icon="mdi-ballot-recount-outline"
        @click="recountPrices({ orderId: props.orderId, itemIds: selectedItems.map(Number) })"
      />
      <v-list-item :title="$t('order.items.changeStatus')" prepend-icon="mdi-list-status" />
      <v-list-item :title="$t('order.items.changeCoefficient')" prepend-icon="mdi-circle-multiple-outline" />
      <v-list-item
        :title="$t('delete')"
        :disabled="!props.selectedItems.length"
        prepend-icon="mdi-delete"
        @click="deleteOrderItems({ orderId: props.orderId, where: { id: { in: selectedItems.map(Number) } } })"
      />
    </v-list>
  </v-menu>
</template>
