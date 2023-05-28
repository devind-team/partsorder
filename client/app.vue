<script setup lang="ts">
import { useHead, useI18n } from '#imports'
const { t } = useI18n()

useHead({ titleTemplate: `%s | ${t('title')}` })
</script>
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
