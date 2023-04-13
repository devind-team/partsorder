<script setup lang="ts">
import { definePageMeta, useI18n, useHead } from '#imports'

const { t } = useI18n()

definePageMeta({
  middleware: 'auth',
})

useHead({
  title: t('title'),
})
</script>
<template>
  <div class="text-2xl">Hello, world about!</div>
</template>
