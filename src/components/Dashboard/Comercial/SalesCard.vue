<script setup>
import { ref } from "vue";
import sellers from "./sellers";
import fetchApi from "@/api";
import SalesData from "./SalesData.vue";

const { title, sales } = defineProps(["title", "sales"]);

const salesBySeller = ref([]);

const fetchSales = async (seller) => {
  try {
    const response = await fetchApi(`sales/${seller}`);
    if (response.status === 200) {
      salesBySeller.value = response.data;
    }
  } catch (error) {
    console.error(error);
  }
};
</script>

<template>
  <v-card :title="title">
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
              <span>{{ seller.name }}</span>
              <span class="ml-5">{{
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
              <span>{{ seller.name }}</span>
              <span class="ml-5">{{
                sales.filter((sale) => sale.seller == seller.name).length
              }}</span>
            </div>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>
