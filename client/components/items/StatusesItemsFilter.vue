<script lang="ts" setup>
const props = defineProps<{
  modelValue: string
  title: string
  //message: { type: string; required: true }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
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

const reset = () => {
  active.value = false
}
const apply = () => {
  active.value = false
}
</script>

<template>
  <v-menu v-model="active">
    <template #activator="{ props: propsMenu }">
      <slot :props="propsMenu" :disabled="active"></slot>
    </template>
    <v-card>
      <v-card-title>
        <span>{{ title }}</span>
      </v-card-title>
      <v-card-text>
        <v-radio-group :value="modelValue" @input="$emit('update:modelValue', $event.target.value)">
          <template v-for="{ id } in items" :key="id">
            <v-radio :label="$t(`items.filterStatus.statuses.${id}`)" :value="id"></v-radio>
          </template>
        </v-radio-group>
      </v-card-text>
      <v-card-actions>
        <v-btn color="warning" @click="reset">Сбросить</v-btn>
        <v-spacer />
        <v-btn color="primary" @click="apply">Применить</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>
