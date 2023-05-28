<script lang="ts" setup>
import { object, string } from 'yup'
import { useMutation } from '@vue/apollo-composable'
import { Field, Form } from 'vee-validate'
import { useI18n } from '#imports'
import { ChangePartialUpdateType } from '~/composables/query-common'
import { AddStatusItemsMutation, AddStatusItemsMutationVariables } from '~/types/graphql'
import addStatusItems from '~/graphql/items/mutations/add-status-items.graphql'

const props = defineProps<{
  orderId: number
  selectedItems: number[]
  changePartialUpdate: ChangePartialUpdateType
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t } = useI18n()

const active = ref(false)
const statuses = computed<{ title: string; value: string }[]>(() =>
  ['CREATED', 'APPROVED', 'PURCHASED', 'EUSTOCK', 'DELIVERY', 'RUSTOCK', 'COMPLETED'].map((value) => ({
    title: t(`order.statuses.${value}`),
    value,
  })),
)
const status = ref<string>(statuses.value[0].value)

const schema = object({
  status: string().required().label(t('items.status')),
})
const { mutate, loading } = useMutation<AddStatusItemsMutation, AddStatusItemsMutationVariables>(addStatusItems, {
  update: (cache, result) => props.changePartialUpdate(cache, result, 'items', 'statuses'),
})
const handleAddStatusItems = async (values: AddStatusItemsMutationVariables) => {
  await mutate({
    orderId: props.orderId,
    itemIds: props.selectedItems.map(Number),
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
    <Form :validation-schema="schema" @submit="handleAddStatusItems">
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
