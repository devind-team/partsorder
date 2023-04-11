<script setup lang="ts">
import { useHead, useI18n } from '#imports'
//import '/assets/css/tailwind.css'

const { t } = useI18n()
useHead({
  title: t('title'),
})
</script>
<template>
  <div class="grid text-center place-items-center mt-5">
    <h1>{{ $t('index.header1') }}</h1>
    <h2>{{ $t('index.header2') }}</h2>
    <img src="/images/truck.svg" alt="" />
    <p class="text-base">{{ $t('index.info') }}</p>
  </div>
</template>
