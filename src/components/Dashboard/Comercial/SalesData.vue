<script setup>
import { ref } from "vue";
import fetchApi from "@/api";
const { data, seller } = defineProps(["data", "seller"]);

const sales = ref(null);

const headers = ref([
  { key: "seller", title: "Vendedor" },
  { key: "client", title: "Cliente" },
  { key: "ticket", title: "Plano" },
  { key: "date", title: "Data" },
]);

const fetchAllSales = async () => {
  try {
    const response = await fetchApi("/sales");
    if (response.status === 200) {
      sales.value = response.data;
    }
  } catch (error) {
    console.error(error);
  }
};

const search = ref("");
</script>
<template>
  <v-card>
    <v-card-text>
      <v-card flat>
        <v-card-title class="d-flex ga-2">
          <span>Vendas</span>
          <v-chip closable @click:close="fetchAllSales">
            {{ seller.name }}
          </v-chip>
        </v-card-title>
        <template v-slot:text>
          <v-text-field
            v-model="search"
            label="Search"
            prepend-inner-icon="mdi-magnify"
            single-line
            variant="outlined"
            hide-details
          ></v-text-field>
        </template>

        <v-data-table
          :headers="headers"
          :items="sales ? sales : data"
          :search="search"
        ></v-data-table>
      </v-card>
    </v-card-text>
  </v-card>
</template>
