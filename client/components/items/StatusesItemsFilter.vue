<script lang="ts" setup>
const props = defineProps<{
  modelValue: string | null
  title: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()
const items = [
  { id: 'CREATED' },
  { id: 'APPROVED' },
  { id: 'PURCHASED' },
  { id: 'EUSTOCK' },
  { id: 'DELIVERY' },
  { id: 'RUSTOCK' },
  { id: 'COMPLETED' },
]

const active = ref<boolean>(false)

const selectStatus = computed({
  get: () => props.modelValue,
  set: (newValue) => {
    emit('update:modelValue', newValue)
  },
})
</script>

<template>
  <v-menu v-model="active">
    <template #activator="{ props: propsMenu }">
      <slot :props="propsMenu"></slot>
    </template>
    <v-card>
      <v-card-title>
        <span>{{ title }}</span>
      </v-card-title>
      <v-card-text>
        <v-radio-group v-model="selectStatus" hide-details>
          <template v-for="{ id } in items" :key="id">
            <v-radio :label="$t(`items.filterStatus.statuses.${id}`)" :value="id"></v-radio>
          </template>
        </v-radio-group>
      </v-card-text>
    </v-card>
  </v-menu>
</template>
