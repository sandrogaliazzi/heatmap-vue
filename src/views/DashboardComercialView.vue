<script setup>
import { ref, computed, onMounted } from "vue";
import moment from "moment-timezone";
import SalesCard from "@/components/Dashboard/Comercial/SalesCard";
import HeaderCard from "@/components/Dashboard/Comercial/HeaderCard.vue";
import MetricsCard from "@/components/Dashboard/Comercial/MetricsCard";
import fetchApi from "@/api";

const metrics = ref([]);
const currentMetric = ref({});

const sales = ref([]);
const nextKey = ref(0);

function getWeekNumber(date) {
  // Configurando o fuso horário para Brasília
  moment.tz.setDefault("America/Sao_Paulo");

  // Obtendo a data atual no fuso horário de Brasília
  const momentDate = date ? moment(date) : moment();

  // Obtendo o número da semana atual
  const weekNumber = momentDate.isoWeek();

  return weekNumber;
}

const salesCount = computed(() => {
  return {
    day: sales.value.dailySales?.length,
    week: sales.value.weekSales?.length,
    total: sales.value.sales?.length,
  };
});

const updateMetric = (metric) => {
  currentMetric.value = metric;
  nextKey.value++;
  fetchSales();
};

const fetchGoals = async () => {
  const response = await fetchApi("/goals");
  metrics.value = response.data;
  currentMetric.value = metrics.value[metrics.value.length - 1];
  nextKey.value++;
};

const fetchSales = async () => {
  const response = await fetchApi.post("/sales", {
    metricRef: currentMetric.value._id,
    weekRef: getWeekNumber(),
  });

  sales.value = response.data;
};

const fetchData = async () => {
  await fetchGoals();
  await fetchSales();
};

const refreshSales = () => {
  setInterval(() => {
    fetchSales();
    console.log("atualizado");
  }, 15000);
};

refreshSales();

onMounted(async () => {
  await fetchData();
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <!-- HEADER -->
        <HeaderCard
          v-if="metrics.length > 0"
          @update-metric="(metric) => updateMetric(metric)"
          @update-component="() => fetchGoals()"
          @update-sale="() => fetchSales()"
          :metrics="metrics"
          :metric="currentMetric"
          :key="nextKey"
        />
      </v-col>
    </v-row>
    <v-row justify="center">
      <MetricsCard
        title="VENDAS MENSAIS"
        :metric="currentMetric.monthSales"
        :numberOfSales="salesCount.total"
      />
      <MetricsCard
        title="VENDAS SEMANAIS"
        :metric="currentMetric.weekSales"
        :numberOfSales="salesCount.week"
      />
      <MetricsCard
        title="VENDAS DIARIAS"
        :metric="currentMetric.dailySales"
        :numberOfSales="salesCount.day"
      />
    </v-row>
    <v-row v-if="sales.sales">
      <v-col cols="12" md="4">
        <SalesCard title="Vendas Mês" :sales="sales.sales" />
      </v-col>
      <v-col cols="12" md="4">
        <SalesCard title="Vendas Semana" :sales="sales.weekSales" />
      </v-col>
      <v-col cols="12" md="4">
        <SalesCard
          :title="'Vendas ' + new Date().toLocaleDateString()"
          :sales="sales.dailySales"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
