<script setup lang="ts">
import { useHead } from '#head'
import { definePageMeta, useI18n } from '#imports'
import { useAuthStore } from '~/stores'
import { Field, Form } from 'vee-validate'

const { t } = useI18n()
const authStore = useAuthStore()

definePageMeta({
  middleware: 'auth',
})

useHead({
  title: t('title'),
})
</script>
<template>
  <template v-if="authStore.loginIn">
    <v-container>
      <Form as="v-form" :validation-schema="schema" @submit="handleNeworder">
        <v-card :loading="loading" class="mx-auto lg:w-1/2">
          <v-card-title>{{ $t('order.new') }}</v-card-title>
          <v-card-text>
            <Field v-slot="{ field, errors }" name="adress">
              <v-text-field v-bind="field" :label="$t('order.adress')" :error-messages="errors" type="input" />
            </Field>
            <Field v-slot="{ field, errors }" name="fileUpload" type="file">
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
  <template v-else>
    <v-btn :to="localePath({ name: 'auth-register' })" stacked>{{ $t('auth.register') }}</v-btn>
    <v-btn :to="localePath({ name: 'auth-login' })" stacked>{{ $t('auth.login') }}</v-btn>
  </template>
</template>
