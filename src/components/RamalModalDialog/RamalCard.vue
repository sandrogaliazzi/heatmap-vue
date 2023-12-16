<script setup>
import { ref, onMounted, inject, computed } from "vue";
import fetchApi from "@/api";

import PonSignal from "./PonSingal";
import { load } from "webfontloader";

const isLoadingRamals = ref(true);
const ramals = ref([]);
const query = ref("");
const ponSignals = ref({});
const gponData = ref([]);
const cardId = ref("");
const loading = ref(false);

const closeDialog = inject("closeDialog");

const filterRamal = computed(() => {
  if (!query.value) return;

  return ramals.value.filter((ramal) => {
    return ramal.oltRamal
      .toLowerCase()
      .includes(query.value.toLocaleLowerCase());
  });
});

const getRamals = async () => {
  try {
    const oltRamals = await fetchApi("ramais");
    ramals.value = oltRamals.data;
    isLoadingRamals.value = false;
  } catch (error) {
    // handle this shit later
  }
};

const calcSignal = (gponData) => {
  if (!gponData.length) return false;

  const txList = gponData
    .map((onu) => {
      return parseFloat(onu["Power Level"].split(" ")[0].slice(0, 6));
    })
    .filter((num) => !isNaN(num))
    .sort();

  const rxList = gponData
    .map((onu) => {
      return parseFloat(onu["RSSI"].split(" ")[0].slice(0, 6));
    })
    .filter((num) => !isNaN(num))
    .sort();

  const avgTxCalc = (
    txList.reduce((acc, val) => acc + val) / txList.length
  ).toFixed(2);
  const avgRxCalc = (
    rxList.reduce((acc, val) => acc + val) / rxList.length
  ).toFixed(2);

  return { txList, rxList, avgRxCalc, avgTxCalc };
};

const selectRamal = async (ramal) => {
  loading.value = true;
  gponData.value = [];

  const { oltIp, oltPon } = ramal;

  const [gponSignals, gponNames] = await Promise.all([
    fetchApi.post("verificar-pon", { oltIp, oltPon }),
    fetchApi.post("verificar-onu-name-pon", { oltIp, oltPon }),
  ]);

  for (const mac in gponSignals.data) {
    const onuData = gponSignals.data[mac];
    const onuAliasMatch = gponNames.data.find((item) => item.mac === mac);

    if (onuAliasMatch) {
      gponData.value.push({
        ...onuData,
        name: onuAliasMatch.name,
      });
    }
  }

  ponSignals.value = calcSignal(gponData.value);
  cardId.value = ramal._id;
  loading.value = false;
};

onMounted(async () => {
  await getRamals();
});
</script>

<template>
  <v-card>
    <slot name="header">
      <v-card-title class="bg-orange">
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex">
            <p class="me-2">SINAIS OLT</p>
            <v-icon>mdi-circle-box</v-icon>
          </div>
          <div>
            <v-btn variant="text" icon="mdi-close" @click="closeDialog"></v-btn>
          </div>
        </div>
      </v-card-title>
    </slot>
    <v-card-text>
      <v-container>
        <v-row no-gutters>
          <v-col cols="12">
            <v-text-field
              variant="outlined"
              label="Pesquisar cliente"
              append-inner-icon="mdi-magnify"
              single-line
              v-model="query"
              hide-details
              class="mb-3"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12">
            <div v-if="!isLoadingRamals">
              <v-card
                v-for="ramal in filterRamal || ramals"
                :key="ramal._id"
                :title="ramal.oltName.split('-').join(' ')"
                :subtitle="ramal.oltRamal"
                variant="elevated"
                class="mb-3"
                :loading="loading"
                link
              >
                <template #prepend>
                  <v-icon icon="mdi-signal" color="orange"></v-icon>
                </template>
                <v-card-text v-if="ponSignals && cardId == ramal._id">
                  <p>
                    <v-icon icon="mdi-chevron-double-up"></v-icon>
                    TX Média: {{ ponSignals.avgTxCalc }}dbm
                  </p>
                  <p>
                    <v-icon icon="mdi-chevron-double-down"></v-icon>
                    RX Média: {{ ponSignals.avgRxCalc }}dbm
                  </p>
                  <p class="mt-2">
                    <v-icon icon="mdi-circle-box"></v-icon>
                    ONUS Total: {{ ponSignals.txList.length }}
                  </p>
                </v-card-text>
                <v-card-text v-else-if="cardId == ramal._id">
                  <p>Não há clientes cadastrados neste ramal</p>
                </v-card-text>
                <v-card-text>
                  <v-btn
                    color="primary"
                    variant="tonal"
                    @click="selectRamal(ramal)"
                    >Ver Sinais
                  </v-btn>
                  <v-btn
                    v-if="ponSignals && cardId == ramal._id"
                    class="ml-2"
                    color="success"
                    variant="tonal"
                  >
                    Exibir lista
                    <v-dialog activator="parent" width="auto">
                      <PonSignal :onuList="gponData" :ramal="ramal" />
                    </v-dialog>
                  </v-btn>
                </v-card-text>
              </v-card>
            </div>
            <div v-else>
              <div class="d-flex justify-center align-center">
                <v-progress-circular
                  color="orange"
                  indeterminate
                  :size="105"
                  :width="9"
                ></v-progress-circular>
              </div>
              <p class="subtitle text-center text-warning mt-4">
                Carregando lista dos ramais
              </p>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>
