<script setup>
import { ref } from "vue";
import sellers from "./sellers";
import fetchApi from "@/api";
import SalesData from "./SalesData.vue";
import moment from "moment-timezone";

const { title, sales, filter, metric } = defineProps(["title", "sales", "filter", "metric"]);

const salesBySeller = ref([]);

function getWeekNumber(date) {
  // Configurando o fuso horário para Brasília
  moment.tz.setDefault("America/Sao_Paulo");

  // Obtendo a data atual no fuso horário de Brasília
  const momentDate = date ? moment(date) : moment();

  // Obtendo o número da semana atual
  const weekNumber = momentDate.isoWeek();

  console.log(weekNumber);

  return weekNumber;
}

const formatDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const fetchSales = async (seller) => {
  try {
    const response = await fetchApi(`sales/${seller}`);
    if (response.status === 200) {
      switch (filter) {
        case "month":
        console.log(metric._id);
          salesBySeller.value = response.data.filter(
            (sale) => {
              return sale.metricId == metric._id;
            }
          );
          break;
        case "week":
          salesBySeller.value = response.data.filter(
            (sale) => sale.weekNumber == getWeekNumber()
          );
          break;

        case "day":
          salesBySeller.value = response.data.filter(
            (sale) => sale.date === formatDate()
          );
          break;
      }
    }
  } catch (error) {
    console.error(error);
  }
};
</script>

<template>
  <v-card :title="title" class="rounded-xl">
    <v-card-text>
      <v-list density="compact" lines="one">
        <v-list-item type="subheader" title="Externo"></v-list-item>
        <v-list-item
          v-for="seller in sellers.externos"
          :value="seller.name"
          :key="seller.name"
          :prepend-avatar="seller.avatar"
          @click="fetchSales(seller.name)"
        >
          <v-dialog activator="parent" width="auto">
            <SalesData
              :data="salesBySeller"
              :seller="seller"
              @delete-sale="(seller) => fetchSales(seller)"
            />
          </v-dialog>
          <v-list-item-title>
            <div class="d-flex">
              <span class="text-emphasis">{{ seller.name }}</span>
              <span class="ml-5 text-emphasis">{{
                sales.filter((sale) => sale.seller == seller.name).length
              }}</span>
            </div>
          </v-list-item-title>
        </v-list-item>
        <v-list-item type="subheader" title="Interno"></v-list-item>
        <v-list-item
          v-for="seller in sellers.internos"
          :value="seller.name"
          :key="seller.name"
          :prepend-avatar="seller.avatar"
          @click="fetchSales(seller.name)"
        >
          <v-dialog activator="parent" width="auto">
            <SalesData
              :data="salesBySeller"
              :seller="seller"
              @delete-sale="(seller) => fetchSales(seller)"
            />
          </v-dialog>
          <v-list-item-title>
            <div class="d-flex">
              <span class="text-emphasis">{{ seller.name }}</span>
              <span class="ml-5 text-emphasis">{{
                sales.filter((sale) => sale.seller == seller.name).length
              }}</span>
            </div>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>
<style scoped>
.text-emphasis {
  font-size: 1.2rem;
  font-weight: bold;
}
</style>
