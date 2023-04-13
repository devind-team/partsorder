<script setup lang="ts">
import { useHead, useI18n } from '#imports'

const { t } = useI18n()
useHead({
  title: t('title'),
})
</script>
<template>
  <div class="grid text-center place-items-center mt-5">
    <h1>{{ $t('index.header') }}</h1>
    <h2>{{ $t('index.title') }}</h2>
    <v-img src="/images/truck.svg" class="w-1/3" alt="" />
    <p class="text-base">{{ $t('index.info') }}</p>
  </div>
</template>
