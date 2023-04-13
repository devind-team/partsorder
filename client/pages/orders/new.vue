<script setup lang="ts">
import { object, string } from 'yup'
import { definePageMeta, useI18n, useHead } from '#imports'
import { Field, Form } from 'vee-validate'

const { t } = useI18n()

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
</script>
<template>
  <v-container>
    <Form as="v-form" :validation-schema="schema">
      <v-card class="mx-auto lg:w-1/2">
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
