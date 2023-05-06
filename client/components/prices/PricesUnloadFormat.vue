<script lang="ts" setup>
import { useI18n } from '#imports'

const { t } = useI18n()
const active = ref<boolean>(false)
</script>
<template>
  <v-dialog v-model="active" width="600px">
    <template #activator="{ props }">
      <slot :props="props" />
    </template>
    <v-card>
      <v-card-title>{{ $t('prices.unload.format') }}</v-card-title>
      <v-card-text>
        <div class="font-bold">{{ $t('prices.unload.formatInfo') }}:</div>
        <v-row>
          <v-col>
            <v-list density="compact">
              <v-list-subheader>{{ $t('prices.unload.related') }} Price:</v-list-subheader>
              <v-list-item
                v-for="priceField in ['price', 'duration', 'supplierName', 'country', 'site', 'comment', 'validAt']"
                :key="priceField"
                :title="priceField"
                :subtitle="t(`prices.unload.${priceField}`)"
              />
            </v-list>
          </v-col>
          <v-col>
            <v-list density="compact">
              <v-list-subheader>{{ $t('prices.unload.related') }} Product:</v-list-subheader>
              <v-list-item
                v-for="productField in ['vendorCode', 'name', 'manufacturer']"
                :key="productField"
                :title="productField"
                :subtitle="t(`prices.unload.${productField}`)"
              />
            </v-list>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="active = false">{{ $t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
