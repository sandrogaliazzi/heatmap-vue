<script setup>
import { ref, computed } from "vue";
const sellersData = ref([
  {
    type: 1,
    seller: "FELIPE",
    sellerID: 1,
    monthSales: 20,
    weekSales: 5,
    dailySales: 2,
  },
  {
    type: 1,
    seller: "JEFERSON",
    sellerID: 2,
    monthSales: 17,
    weekSales: 4,
    dailySales: 3,
  },
  {
    type: 1,
    seller: "LUIS FELIPE",
    sellerID: 3,
    monthSales: 15,
    weekSales: 3,
    dailySales: 2,
  },
  {
    type: 0,
    seller: "NADINE",
    sellerID: 4,
    monthSales: 18,
    weekSales: 4,
    dailySales: 2,
  },
  {
    type: 0,
    seller: "JANICE",
    sellerID: 5,
    monthSales: 17,
    weekSales: 3,
    dailySales: 1,
  },
]);

const avatar = ref({
  FELIPE: "https://randomuser.me/api/portraits/men/1.jpg",
  "LUIS FELIPE": "https://randomuser.me/api/portraits/men/2.jpg",
  JEFERSON: "https://randomuser.me/api/portraits/men/3.jpg",
  JANICE: "https://randomuser.me/api/portraits/women/1.jpg",
  NADINE: "https://randomuser.me/api/portraits/women/2.jpg",
});

const externalSales = computed(() => {
  return sellersData.value.filter((seller) => seller.type);
});

const internalSales = computed(() => {
  return sellersData.value.filter((seller) => !seller.type);
});

const dailySalesEx = computed(() => {
  return externalSales.value.sort((salesA, salesB) => {
    return salesB.dailySales - salesA.dailySales;
  });
});

const weekSalesEx = computed(() => {
  return externalSales.value.sort((salesA, salesB) => {
    return salesB.weekSales - salesA.weekSales;
  });
});

const monthSalesEx = computed(() => {
  return externalSales.value.sort((salesA, salesB) => {
    return salesB.monthSales - salesA.monthSales;
  });
});

const dailySalesIn = computed(() => {
  return internalSales.value.sort((salesA, salesB) => {
    return salesB.dailySales - salesA.dailySales;
  });
});

const weekSalesIn = computed(() => {
  return internalSales.value.sort((salesA, salesB) => {
    return salesB.weekSales - salesA.weekSales;
  });
});

const monthSalesIn = computed(() => {
  return internalSales.value.sort((salesA, salesB) => {
    return salesB.monthSales - salesA.monthSales;
  });
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card
          title="METAS SETOR COMERCIAL"
          append-icon="mdi-chart-line"
        ></v-card>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col>
        <v-card>
          <v-card-title>
            <div class="d-flex justify-space-between">
              <p>VENDAS MENSAIS</p>
              <p>150/400</p>
            </div>
          </v-card-title>
        </v-card>
      </v-col>
      <v-col>
        <v-card>
          <v-card-title>
            <div class="d-flex justify-space-between">
              <p>VENDAS SEMANAIS</p>
              <p>25/100</p>
            </div>
          </v-card-title>
        </v-card>
      </v-col>
      <v-col>
        <v-card>
          <v-card-title>
            <div class="d-flex justify-space-between">
              <p>VENDAS DIARIAS</p>
              <p>5/25</p>
            </div>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card title="Vendas Mensais" subtitle="Externas">
          <v-card-text>
            <v-list density="compact" lines="one">
              <v-list-item
                v-for="sale in monthSalesEx"
                :value="sale.sellerID"
                :key="sale.seller"
                :prepend-avatar="avatar[sale.seller]"
              >
                <v-list-item-title v-if="sale.type">
                  <div class="d-flex">
                    <span>{{ sale.seller }}</span>
                    <span class="ml-5">{{ sale.monthSales }}</span>
                  </div>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <v-card title="Vendas Semanais" subtitle="Externas">
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-for="sale in weekSalesEx"
                :key="sale.seller"
                :value="sale.sellerID"
                :prepend-avatar="avatar[sale.seller]"
              >
                <v-list-item-title>
                  <div class="d-flex">
                    <p>{{ sale.seller }}</p>
                    <p class="ml-5">{{ sale.weekSales }}</p>
                  </div>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <v-card title="Vendas Diarias" subtitle="Externas">
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-for="sale in dailySalesEx"
                :key="sale.seller"
                :value="sale.sellerID"
                :prepend-avatar="avatar[sale.seller]"
              >
                <v-list-item-title>
                  <div class="d-flex">
                    <p>{{ sale.seller }}</p>
                    <p class="ml-5">{{ sale.dailySales }}</p>
                  </div>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card title="Vendas Mensais" subtitle="Internas">
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-for="sale in monthSalesIn"
                :key="sale.seller"
                :value="sale.sellerID"
                :prepend-avatar="avatar[sale.seller]"
              >
                <v-list-item-title>
                  <div class="d-flex">
                    <span>{{ sale.seller }}</span>
                    <span class="ml-5">{{ sale.monthSales }}</span>
                  </div>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <v-card title="Vendas Semanais" subtitle="Internas">
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-for="sale in weekSalesIn"
                :key="sale.seller"
                :value="sale.sellerID"
                :prepend-avatar="avatar[sale.seller]"
              >
                <v-list-item-title>
                  <div class="d-flex">
                    <p>{{ sale.seller }}</p>
                    <p class="ml-5">{{ sale.weekSales }}</p>
                  </div>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <v-card title="Vendas Diarias" subtitle="Internas">
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-for="sale in dailySalesIn"
                :key="sale.seller"
                :value="sale.sellerID"
                :prepend-avatar="avatar[sale.seller]"
              >
                <v-list-item-title>
                  <div class="d-flex">
                    <p>{{ sale.seller }}</p>
                    <p class="ml-5">{{ sale.dailySales }}</p>
                  </div>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
