<script setup>
import { inject, ref, watch } from "vue";
import { useTomodatStore } from "@/stores/tomodat";
import { storeToRefs } from "pinia";

import ListResult from "./ListResult.vue";

const tomodat = useTomodatStore();
const { ctoList, getClients } = storeToRefs(tomodat);
const closeDialog = inject("closeDialog");

const query = ref(localStorage.getItem("lastQuery") || "");
const searchResults = ref([]);

const getCtoByName = (name) => {
  return ctoList.value.filter((cto) => cto.name.includes(name.toUpperCase()));
};

const getClientsByName = (name) => {
  return getClients.value.filter((client) =>
    client.name.includes(name.toUpperCase())
  );
};

watch(query, () => {
  if (!query.value) searchResults.value = [];
  if (query.value) {
    const typeOfSearch = /^R\d+(?:-[\w\d]+)?$/.test(query.value.toUpperCase())
      ? "cto"
      : "client";

    switch (typeOfSearch) {
      case "cto":
        searchResults.value = getCtoByName(query.value);
        break;

      case "client":
        searchResults.value = getClientsByName(query.value);
        break;
    }
  }
  localStorage.setItem("lastQuery", query.value);
});
</script>

<template>
  <v-card style="margin-top: 0 !important">
    <v-toolbar color="orange" title="Pesquisa Avançada">
      <v-btn icon @click="closeDialog">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text class="px-0 pt-0">
      <v-text-field
        placeholder="Nome do cliente ou cto"
        clearable
        prepend-inner-icon="mdi-magnify"
        v-model="query"
      >
      </v-text-field>
      <div
        class="d-flex justify-center align-center text-center"
        v-if="!searchResults.length"
        style="min-height: 500px"
      >
        <v-icon size="200px"> mdi-database-search </v-icon>
      </div>
      <div v-else>
        <ListResult :results="searchResults" :query="query" />
      </div>
    </v-card-text>
  </v-card>
</template>
