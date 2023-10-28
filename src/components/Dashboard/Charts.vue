<script setup>
import { ref, watch, computed } from "vue";
import LogsChart from "./LogsChart.vue";
import DialogBox from "../Dialog/Dialog.vue";
import LogsFilterCard from "./LogsFilterCard.vue";

const { logs } = defineProps(["logs"]);

const dialog = ref(false);
const nextKey = ref(1);
const loadingChart = ref(true);
const dateFilter = ref(null);
const logsCoordinates = ref([]);

const onCloseDialog = (value) => (dialog.value = value);

watch(dateFilter, () => {
  if (!dateFilter.value) {
    logsCoordinates.value = logs.map((log) => ({
      lat: log.lat,
      lng: log.lng,
    }));
  } else {
    const { month, _ } = dateFilter.value;

    logsCoordinates.value = logs.value
      .filter((log) => {
        return log.splitDate.month == month;
      })
      .map((log) => ({ lat: log.lat, lng: log.lng }));
  }

  forceChartRender();
});

const forceChartRender = () => {
  nextKey.value++;
  loadingChart.value = true;
};
</script>

<template>
  <v-row justify="center">
    <v-col cols="12">
      <v-banner icon="mdi-alert" lines="one" color="orange" class="my-4">
        <v-banner-text>
          Os gráficos podem sofrer erros de carregamento, neste caso clique em
          recarregar
        </v-banner-text>
        <template v-slot:actions>
          <v-btn
            prepend-icon="mdi-reload"
            color="orange"
            @click="forceChartRender"
            >Recarregar</v-btn
          >
        </template>
      </v-banner>
    </v-col>
    <v-col cols="12">
      <v-card variant="tonal" color="primary" :loading="loadingChart">
        <DialogBox :isOpen="dialog" @update:modal-value="onCloseDialog">
          <LogsFilterCard
            @update:close-dialog="dialog = false"
            @update:clear-filter-date="dateFilter = null"
          />
        </DialogBox>
        <v-card-title class="d-flex justify-space-between align-center">
          <p>
            Numero de Ativaçõs por cidade
            <b v-if="dateFilter"
              >Em: {{ dateFilter?.month + "/" + dateFilter?.year }}</b
            >
          </p>
          <v-btn
            variant="tonal"
            color="secondary"
            append-icon="mdi-filter"
            @click="dialog = true"
            >Filtro</v-btn
          >
        </v-card-title>
        <template v-slot:loader="{ isActive }">
          <v-progress-linear
            :active="isActive"
            color="orange"
            height="4"
            indeterminate
          ></v-progress-linear>
        </template>
        <v-card-text>
          <LogsChart
            :logs="logs"
            :key="nextKey"
            :loading="loadingChart"
            @update:loading="loadingChart = false"
          />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
