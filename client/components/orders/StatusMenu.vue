<script lang="ts" setup>
import { UpdateType } from '~/composables/query-common'
import { Order } from '~/types/graphql'
import AddStatus from '~/components/orders/AddStatus.vue'
import StatusesViewDialog from '~/components/orders/StatusesViewDialog.vue'

const props = defineProps<{
  order: Order
  update: UpdateType
}>()

const active = ref(false)
</script>

<template>
  <v-menu v-model="active">
    <template #activator="{ props: propsMenu }">
      <slot :props="propsMenu" />
    </template>
    <v-list>
      <statuses-view-dialog v-slot="{ props: statusesProps }" :statuses="props.order.statuses">
        <v-list-item v-bind="statusesProps" :title="$t('order.status.show')" />
      </statuses-view-dialog>
      <add-status v-slot="{ props: addStatusProps }" :order="props.order" :update="props.update">
        <v-list-item v-bind="addStatusProps" :title="$t('order.status.add')" />
      </add-status>
    </v-list>
  </v-menu>
</template>
