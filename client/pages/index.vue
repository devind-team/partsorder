<script setup lang="ts">
import { useHead, useI18n } from '#imports'
import { Field, Form } from 'vee-validate'
import { object, string } from 'yup'

const { t } = useI18n()
useHead({
  title: t('title'),
})

const schema = object({
  article: string().required().min(2).label(t('index.article')),
})
</script>
<template>
  <div class="grid text-center place-items-center mt-5">
    <h1>{{ $t('index.header') }}</h1>
    <h2>{{ $t('index.title') }}</h2>
    <!--<v-img src="/images/truck.svg" class="w-1/3" alt="" />-->
    <p class="text-base">{{ $t('index.info') }}</p>
  </div>
  <v-container>
    <Form as="v-form" :validation-schema="schema" @submit="handleSeach">
      <v-card :loading="loading" class="mx-auto lg:w-1/2">
        <v-card-title>{{ $t('index.searchtitle') }}</v-card-title>
        <v-card-text>
          <Field v-slot="{ field, errors }" name="article">
            <v-text-field v-bind="field" :label="$t('index.article')" :error-messages="errors" />
          </Field>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" type="submit">
            {{ $t('index.doSearch') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </Form>
  </v-container>
</template>
