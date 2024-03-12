<script setup>
const { title, metric, numberOfSales } = defineProps([
  "title",
  "metric",
  "numberOfSales",
]);
</script>

<template>
  <v-col>
    <v-card>
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
        Faltam {{ metric - numberOfSales }}
      </v-card-text>
    </v-card>
  </v-col>
</template>
