<script setup lang="ts">
import { object, string } from 'yup'
import { Field, Form, FormActions } from 'vee-validate'
import { useI18n, useHead } from '#imports'
import {
  PresignedPutObjectQuery,
  PresignedPutObjectQueryVariables,
  CreateOrderMutation,
  CreateOrderMutationVariables,
} from '~/types/graphql'
import createOrderMutation from '~/graphql/orders/mutations/create-order.graphql'
import presignedPutUrlQuery from '~/graphql/files/queries/presigned-put-url.graphql'

const props = defineProps({
  addUpdate: { type: Function, required: true },
})

const { t } = useI18n()
const { resolveClient } = useApolloClient()

useHead({
  title: t('order.title'),
})

const active = ref<boolean>(false)

const schema = object({
  address: string().required().min(2).label(t('order.address')),
  file: string().required().label(t('order.file')),
})
const { mutate, loading } = useMutation<CreateOrderMutation, CreateOrderMutationVariables>(createOrderMutation, {
  update: (cache, result) => props.addUpdate(cache, result, 'order'),
})

const abortController = new AbortController()
onBeforeUnmount(() => {
  abortController.abort()
})

const handleCreateOrder = async (
  values: CreateOrderMutationVariables,
  { setErrors }: FormActions<CreateOrderMutationVariables>,
) => {
  try {
    const client = resolveClient()
    const presignedPutUrl: PresignedPutObjectQuery['presignedPutUrl'] = await client
      .query<PresignedPutObjectQuery, PresignedPutObjectQueryVariables>({
        query: presignedPutUrlQuery,
        variables: { fileName: values.file.name },
      })
      .then(({ data }) => data.presignedPutUrl)
    const response = await fetch(presignedPutUrl.presignedUrl, {
      method: 'put',
      body: values.file as unknown as File,
      signal: abortController.signal,
    })
    if (response.ok) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { __typename, presignedUrl, ...fileUpload } = presignedPutUrl
      await mutate({ address: values.address, file: fileUpload })
      active.value = false
    }
  } catch (e) {
    console.error(e)
    setErrors({ file: 'Ошибка загрузки' })
  }
}
</script>
<template>
  <v-dialog v-model="active" width="600px">
    <template #activator="{ props: propsDialog }">
      <slot :props="propsDialog" />
    </template>
    <Form :validation-schema="schema" @submit="handleCreateOrder">
      <v-card :loading="loading">
        <v-card-title>{{ $t('order.new') }}</v-card-title>
        <v-card-text>
          <Field v-slot="{ field, errors }" name="address">
            <v-text-field v-bind="field" :label="$t('order.address')" :error-messages="errors" type="input" />
          </Field>
          <Field v-slot="{ field, errors }" name="file" type="file">
            <v-file-input
              v-bind="field"
              :label="$t('order.file')"
              :error-messages="errors"
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            >
              <template #append>
                <v-tooltip>
                  <template #activator="{ props: propsFileTooltip }">
                    <v-icon v-bind="propsFileTooltip" icon="mdi-information" />
                  </template>
                  <span>vendorCode, quantity, name?, manufacturer?</span>
                </v-tooltip>
              </template>
            </v-file-input>
          </Field>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="active = false">{{ $t('cancel') }}</v-btn>
          <v-spacer />
          <v-btn color="primary" type="submit">
            {{ $t('order.create') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </Form>
  </v-dialog>
</template>
