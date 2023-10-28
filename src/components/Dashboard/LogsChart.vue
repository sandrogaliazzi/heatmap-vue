<script setup>
import { ref, computed, onMounted } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const { logs, loading } = defineProps(["logs", "loading"]);
const emit = defineEmits(["update:loading"]);

const chartData = ref(null);
const chartOptions = ref({
  responsive: true,
});

const logCounterBycity = ref({});
const loaded = ref(false);

const logsCoordinates = computed(() => {
  return logs.map((log) => ({
    lat: log.lat,
    lng: log.lng,
  }));
});

onMounted(async () => {
  logCounterBycity.value = await getTotalLogsByCity();

  const { labels, data } = logCounterBycity.value;

  chartData.value = {
    labels,
    datasets: [
      {
        data,
        label: `Ativações`,
        backgroundColor: [
          "#FF9800",
          "#ff006e",
          "#3a86ff",
          "#8338ec",
          "#2c6e49",
          "#d90429",
          "#2b2d42",
        ],
        color: "#fff",
      },
    ],
  };

  if (data.length > 0) loaded.value = true;
  emit("update:loading");
});

const getCityNameByLatLng = async ({ lat, lng }) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&sensor=true&key=${
        import.meta.env.VITE_GOOGLE_API_KEY
      }`
    );
    const fullAdress = await response.json();

    return fullAdress?.results[0]?.address_components.find(
      (address) => address.types[0] == "administrative_area_level_2"
    );
  } catch (error) {
    console.log(error.message);
  }
};

const getTotalLogsByCity = async () => {
  const promises = logsCoordinates.value.map(async (value) => {
    const cityName = await getCityNameByLatLng({
      lat: value.lat,
      lng: value.lng,
    });
    return cityName;
  });

  const response = await Promise.all(promises);

  const cityNames = response
    .filter((city) => city)
    .map((city) => city.long_name);

  const result = {};
  for (const cityName of cityNames) {
    if (result[cityName]) result[cityName]++;
    else result[cityName] = 1;
  }

  return {
    labels: Object.keys(result),
    data: Object.values(result),
  };
};
</script>

<template>
  <Bar
    id="my-chart-id"
    :options="chartOptions"
    :data="chartData"
    v-if="loaded"
  />
</template>
