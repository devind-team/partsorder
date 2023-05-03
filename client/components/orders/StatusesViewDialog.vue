<script lang="ts" setup>
import { useFilters } from '~/composables/filters'
import { Status } from '~/types/graphql'
import UserView from '~/components/common/UserView.vue'

const { dateTimeHM } = useFilters()

const props = withDefaults(defineProps<{ statuses: Status[] }>(), {
  statuses: () => [],
})
const active = ref(false)
</script>
<template>
  <v-dialog v-model="active" width="600px">
    <template #activator="{ props: propsDialog }">
      <slot :props="propsDialog" />
    </template>
    <v-card>
      <v-card-title>{{ $t('order.status.title') }}</v-card-title>
      <v-card-text>
        <v-timeline>
          <v-timeline-item v-for="status in props.statuses" :key="status.id">
            <template v-if="status.user" #icon>
              <user-view :user="status.user" />
            </template>
            <v-card>
              <v-card-title>{{ $t(`order.statuses.${status.status}`) }}</v-card-title>
              <v-card-text>{{ dateTimeHM(status.createdAt) }}</v-card-text>
            </v-card>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="active = false">{{ $t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
