<script lang="ts" setup>
import { object, number } from 'yup'
import { Field, Form } from 'vee-validate'
import changeCoefficientItemMutation from '~/graphql/items/mutations/change-coefficient-items.graphql'
import { useMutation } from '@vue/apollo-composable'
import { ChangeCoefficientItemsMutation, ChangeCoefficientItemsMutationVariables } from '~/types/graphql'
import { useI18n } from '#imports'
import { ChangePartialUpdate } from '~/composables/query-common'

const props = defineProps<{
  orderId: number
  selectedItems: number[]
  changePartialUpdate: ChangePartialUpdate
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t } = useI18n()

const active = ref(false)

const schema = object({
  coefficient: number().positive().required().label(t('items.coefficient')),
})
const { mutate, loading } = useMutation<ChangeCoefficientItemsMutation, ChangeCoefficientItemsMutationVariables>(
  changeCoefficientItemMutation,
  { update: (cache, result) => props.changePartialUpdate(cache, result, 'items', 'coefficient') },
)
const handleChangeCoefficientItem = async (values: ChangeCoefficientItemsMutationVariables) => {
  await mutate({
    orderId: props.orderId,
    itemsId: props.selectedItems.map(Number),
    coefficient: Number(values.coefficient),
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
    <Form :validation-schema="schema" @submit="handleChangeCoefficientItem">
      <v-card :loading="loading">
        <v-card-title>{{ $t('items.changeDialog') }}</v-card-title>
        <v-card-text>
          <Field v-slot="{ field, errors }" name="coefficient">
            <v-text-field v-bind="field" :label="$t('items.coefficient')" :error-messages="errors" type="input" />
          </Field>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="active = false">{{ $t('cancel') }}</v-btn>
          <v-spacer />
          <v-btn color="primary" type="submit">
            {{ $t('change') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </Form>
  </v-dialog>
</template>
