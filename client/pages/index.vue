<script setup lang="ts">
import { useHead } from '#head'
import { useI18n } from '#imports'

const { t } = useI18n()

useHead({
  title: t('title'),
})
</script>
<template>
  <div class="text-2xl">Hello, world!</div>
</template>
