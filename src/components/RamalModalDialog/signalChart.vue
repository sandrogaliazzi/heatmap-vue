<script setup>
import { ref } from "vue";
import { Line } from "vue-chartjs";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const {rx, tx, labels} = defineProps(["rx", "tx", "labels"]);

const chartOptions = ref({
  responsive: true,
});

const chartData = ref({
  labels,
  datasets: [
    {
      label: "Sinais rx",
      backgroundColor: "#2196F3",
      borderColor: "#2196F3",
      data: rx,
    },
    {
      label: "Sinais tx",
      backgroundColor: "#FF9800",
      borderColor: "#FF9800",
      data: tx,
    }
  ],
});
</script>

<template>
  <Line id="my-chart-id" :options="chartOptions" :data="chartData" />
</template>
