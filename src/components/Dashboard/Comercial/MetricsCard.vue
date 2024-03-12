<script setup>
import { computed } from "vue";
const { title, metric, numberOfSales } = defineProps([
  "title",
  "metric",
  "numberOfSales",
]);

const remainingSales = computed(() => {
  return parseInt(metric) - parseInt(numberOfSales) === 0 ? false : true;
});
</script>

<template>
  <v-col>
    <v-card :color="remainingSales ? '' : 'success'">
      <v-card-title>
        <div class="d-flex justify-space-between">
          <p>{{ title }}</p>
          <p>{{ numberOfSales }}/{{ metric }}</p>
        </div>
      </v-card-title>
      <v-card-text
        class="d-flex justify-end"
        style="font-size: 1rem"
        v-if="numberOfSales > 0"
      >
        {{
          remainingSales
            ? `FALTAM ${parseInt(metric) - parseInt(numberOfSales)}`
            : "META CONCLUIDA"
        }}
      </v-card-text>
    </v-card>
  </v-col>
</template>
