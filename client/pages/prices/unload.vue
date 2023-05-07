<script lang="ts" setup>
import { object, string } from 'yup'
import { Field, Form, FormActions } from 'vee-validate'
import { definePageMeta, useHead, useI18n } from '#imports'

import uploadPricesMutation from '~/graphql/prices/mutations/upload-prices.graphql'
import {
  CreateUploadPriceRowType,
  PresignedPutObjectQuery,
  PresignedPutObjectQueryVariables,
  UploadPricesMutation,
  UploadPricesMutationVariables,
} from '~/types/graphql'
import presignedPutUrlQuery from '~/graphql/files/queries/presigned-put-url.graphql'

const { t } = useI18n()
const { resolveClient } = useApolloClient()

definePageMeta({ middleware: 'auth' })
useHead({ title: t('prices.unload.title') })

const rows = ref<CreateUploadPriceRowType[]>([])
const tableHeaders = [
  { title: t('prices.unload.status'), key: 'status', sortable: false },
  { title: t('prices.unload.productCreate'), key: 'productCreate', sortable: false },
  { title: t('prices.unload.data'), key: 'data', sortable: false },
]

const schema = object({
  fileUpload: string().required().label(t('prices.unload.file')),
})
const { mutate, loading, onDone } = useMutation<UploadPricesMutation, UploadPricesMutationVariables>(
  uploadPricesMutation,
)

onDone(({ data, errors }) => {
  if (!errors && data) {
    const { rows: rowsResult } = data.uploadPrices
    rows.value = rowsResult as CreateUploadPriceRowType[]
  }
})

const abortController = new AbortController()
onBeforeUnmount(() => {
  abortController.abort()
})

const handleUploadPrices = async (
  values: UploadPricesMutationVariables,
  { setValues, setErrors }: FormActions<UploadPricesMutationVariables>,
) => {
  try {
    const client = resolveClient()
    const presignedPutUrl: PresignedPutObjectQuery['presignedPutUrl'] = await client
      .query<PresignedPutObjectQuery, PresignedPutObjectQueryVariables>({
        query: presignedPutUrlQuery,
        variables: { fileName: values.fileUpload.name },
      })
      .then(({ data }) => data.presignedPutUrl)
    const response = await fetch(presignedPutUrl.presignedUrl, {
      method: 'put',
      body: values.fileUpload as unknown as File,
      signal: abortController.signal,
    })
    if (response.ok) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { __typename, presignedUrl, ...fileUpload } = presignedPutUrl
      await mutate({ fileUpload })
      setValues({ fileUpload: undefined })
    }
  } catch {
    setErrors({ fileUpload: `Ошибка загрузки файла` })
  }
}
</script>
<template>
  <v-container>
    <h1>{{ $t('prices.unload.title') }}</h1>
    <v-card>
      <v-row>
        <v-col>
          <Form :validation-schema="schema" @submit="handleUploadPrices">
            <v-card-text>
              <Field v-slot="{ field, errors }" name="fileUpload" type="file">
                <v-file-input
                  v-bind="field"
                  :label="$t('prices.unload.file')"
                  :error-messages="errors"
                  accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                >
                  <template #append>
                    <prices-unload-format v-slot="{ props }">
                      <v-btn v-bind="props" icon="mdi-information" variant="text" />
                    </prices-unload-format>
                  </template>
                </v-file-input>
              </Field>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" type="submit" :loading="loading">
                {{ $t('prices.unload.submit') }}
              </v-btn>
            </v-card-actions>
          </Form>
        </v-col>
      </v-row>
    </v-card>
    <v-card class="mt-4">
      <v-card-title>{{ $t('prices.unload.result') }}</v-card-title>
      <v-card-text>
        <v-data-table :headers="tableHeaders" :items="rows" density="compact">
          <template #item.status="{ item }">
            <v-tooltip :disabled="item.raw.success">
              <template #activator="{ props }">
                <div v-bind="props">{{ item.raw.success ? 'Успешно' : 'Ошибка' }}</div>
              </template>
              <span>{{ item.raw.error }}</span>
            </v-tooltip>
          </template>
          <template #item.productCreate="{ item }">{{ item.raw.productCreate ? 'Да' : 'Нет' }}</template>
          <template #item.data="{ item }">{{ item.raw.data }}</template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>
