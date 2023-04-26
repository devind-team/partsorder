<script setup lang="ts">
import AppBar from '~/components/common/AppBar.vue'
import FooterComponent from '~/components/common/FooterComponent.vue'
</script>
<template>
  <v-app>
    <app-bar />
    <v-main>
      <slot />
    </v-main>
    <footer-component />
  </v-app>
</template>
