<script lang="ts" setup>
import { User } from '~/types/graphql'
const props = defineProps<{
  user: User
}>()
</script>
<template>
  <v-tooltip location="bottom">
    <template #activator="{ props: propsTooltip }">
      <v-avatar :image="props.user.avatar" v-bind="propsTooltip" color="primary">
        {{ `${props.user.lastName[0]}${props.user.firstName[0]}` }}
      </v-avatar>
    </template>
    <span>{{ `${props.user.lastName} ${props.user.firstName} ${props.user.sirName}` }}</span>
  </v-tooltip>
</template>
