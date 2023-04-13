<script lang="ts" setup>
const props = defineProps({
  modelValue: String,
})
const emit = defineEmits(['update:modelValue'])

const changeFile = (...args: any[]) => {
  console.log(args)
}
</script>

<template>
  <v-card>
    <v-card-text>
      <v-file-input @change="changeFile" />
    </v-card-text>
  </v-card>
</template>
