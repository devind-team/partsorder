<script lang="ts" setup>
import { object, string } from 'yup'
import { useMutation } from '@vue/apollo-composable'
import { Field, Form } from 'vee-validate'
import { useI18n } from '#imports'
import { UpdateType } from '~/composables/query-common'
import addStatusOrder from '~/graphql/orders/mutations/add-status-order.graphql'
import { AddStatusOrderMutation, AddStatusOrderMutationVariables, Order, OrderQuery } from '~/types/graphql'

const props = defineProps<{
  order: Order
  update: UpdateType
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t } = useI18n()

const active = ref(false)
const statuses = computed<{ title: string; value: string }[]>(() =>
  ['CREATED', 'APPROVAL', 'APPROVED', 'PURCHASING', 'DELIVERY'].map((value) => ({
    title: t(`order.statuses.${value}`),
    value,
  })),
)
const status = ref<string>(statuses.value[0].value)

const schema = object({
  status: string().required().label(t('items.status')),
})
const { mutate, loading } = useMutation<AddStatusOrderMutation, AddStatusOrderMutationVariables>(addStatusOrder, {
  update: (cache, result) =>
    props.update(cache, result, (dataCache: OrderQuery) => {
      const statuses = result.data
        ? [...(dataCache.order.statuses ?? []), result.data.addStatusOrder]
        : dataCache.order.statuses
      // Если APPROVED, для каждого items создатеся такой же статус, это оптимистичное добавление
      let maxItemId =
        dataCache.order.items?.reduce(
          (a, c) => Math.max(a, ...(c.statuses ?? []).map((status) => Number(status.id))),
          0,
        ) || 0
      console.log(maxItemId)
      const items =
        result.data && result.data.addStatusOrder.status === 'APPROVED'
          ? dataCache.order.items?.map((item) => ({
              ...item,
              statuses: [
                ...(item.statuses ?? []),
                { ...(result.data && result.data.addStatusOrder), id: ++maxItemId, __typename: 'StatusItem' },
              ],
            }))
          : dataCache.order.items
      console.log(items)
      return {
        ...dataCache,
        order: {
          ...dataCache.order,
          items,
          statuses,
        },
      }
    }),
})
const handleAddStatus = async (values: AddStatusOrderMutationVariables) => {
  await mutate({
    orderId: Number(props.order.id),
    status: values.status,
  })
  active.value = false
  emit('close')
}
</script>
<template>
  <v-dialog v-model="active" width="600px">
    <template #activator="{ props: propsDialog }">
      <slot :props="propsDialog" />
    </template>
    <Form :validation-schema="schema" @submit="handleAddStatus">
      <v-card :loading="loading">
        <v-card-title>{{ $t('items.addStatus') }}</v-card-title>
        <v-card-text>
          <Field v-slot="{ field, errors }" name="status">
            <v-select
              v-model="status"
              v-bind="field"
              :label="$t('items.status')"
              :items="statuses"
              :error-messages="errors"
              single-line
            />
          </Field>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="active = false">{{ $t('cancel') }}</v-btn>
          <v-spacer />
          <v-btn color="primary" type="submit">{{ $t('change') }}</v-btn>
        </v-card-actions>
      </v-card>
    </Form>
  </v-dialog>
</template>
