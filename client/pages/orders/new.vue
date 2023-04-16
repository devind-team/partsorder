<script setup lang="ts">
import { object, string } from 'yup'
import { Field, Form, FormActions } from 'vee-validate'
import { definePageMeta, useI18n, useHead } from '#imports'
import {
  PresignedPutObjectQuery,
  PresignedPutObjectQueryVariables,
  CreateOrderMutation,
  CreateOrderMutationVariables,
} from '~/types/graphql'
import createOrderMutation from '~/graphql/orders/mutations/create-order.graphql'
import presignedPutUrlQuery from '~/graphql/files/queries/presigned-put-url.graphql'

const { t } = useI18n()
const { resolveClient } = useApolloClient()

definePageMeta({
  middleware: 'auth',
})

useHead({
  title: t('order.title'),
})

const schema = object({
  address: string().required().min(2).label(t('order.address')),
  file: string().required().label(t('order.file')),
})
const { mutate, loading } = useMutation<CreateOrderMutation, CreateOrderMutationVariables>(createOrderMutation)

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
      mutate({ address: values.address, file: fileUpload })
    }
  } catch (e) {
    console.error(e)
    setErrors({ file: 'Ошибка загрузки' })
  }
}
</script>
<template>
  <v-container>
    <Form as="v-form" :validation-schema="schema" @submit="handleCreateOrder">
      <v-card :loading="loading" class="mx-auto lg:w-1/2">
        <v-card-title>{{ $t('order.title') }}</v-card-title>
        <v-card-text>
          <Field v-slot="{ field, errors }" name="address">
            <v-text-field v-bind="field" :label="$t('order.address')" :error-messages="errors" type="input" />
          </Field>
          <Field v-slot="{ field, errors }" name="file" type="file">
            <v-file-input v-bind="field" :label="$t('order.file')" :error-messages="errors" accept="*" />
          </Field>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" type="submit">
            {{ $t('order.create') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </Form>
  </v-container>
</template>
