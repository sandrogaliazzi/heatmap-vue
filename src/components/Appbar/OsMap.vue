<script setup>
import { inject, ref, watch, onMounted } from "vue";
import fetchApi from "@/api";
import OsMarkers from "../HeatMap/OsMarkers.vue";

const model = ref(null);

const letters = ["e", "i", "l", "w"];
const tecIdList = [1877, 5180, 5291, 12014];

const adressList = ref([]);

const formatAdress = (adress) => {
  const { logradouro, bairro, cidade } = adress;

  return `${logradouro.replaceAll(" ", "+")},${bairro.replaceAll(
    " ",
    "+"
  )},${cidade.replaceAll(" ", "+")}+RS`;
};

const getCoordinatesFromAdress = async (adress) => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${adress}&key=${
      import.meta.env.VITE_GOOGLE_API_KEY
    }`
  );

  const data = await response.json();

  return data.results[0];
};

const getMkSupportOsAdress = async (tecnicoId) => {
  const response = await fetchApi("listar-os-percurso/" + tecnicoId);

  const adresses = response.data;

  const formatedAdresses = await Promise.all(
    adresses.map(async (ad) => {
      return {
        adress: await getCoordinatesFromAdress(formatAdress(ad)),
        encerrado: ad.encerrado,
        cliente: ad.com_titulo,
        descricao: ad.com_descricao,
        encerramento: ad.servico_prestado,
      };
    })
  );

  return formatedAdresses;
};

onMounted(async () => {
  adressList.value = await getMkSupportOsAdress(1877);
  console.log(adressList.value);
});

watch(model, async (modelValue) => {
  if (modelValue !== null) {
    adressList.value = await getMkSupportOsAdress(tecIdList[modelValue]);
  }
});

const closeDialog = inject("closeDialog");
</script>
<template>
  <v-card>
    <v-toolbar color="orange">
      <v-btn icon="mdi-close" @click="closeDialog"></v-btn>

      <v-toolbar-title>Mapa OS Suporte</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-toolbar-items>
        <v-btn text="Atualizar" variant="text"></v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <v-card
      class="px-2 mx-auto"
      rounded="lg"
      text="Selecione um técnico para exibir as OS no Mapa"
      theme="dark"
      variant="flat"
    >
      <v-item-group
        v-model="model"
        class="d-flex justify-sm-space-between px-6 pt-2 pb-6 mb-5"
      >
        <v-item v-for="n in 4" :key="n">
          <template v-slot:default="{ toggle }">
            <v-btn
              :icon="`mdi-alpha-${letters[n - 1]}`"
              height="40"
              :active="model != null && model + 1 == n"
              variant="text"
              width="40"
              @click="toggle"
            ></v-btn>
          </template>
        </v-item>
      </v-item-group>
    </v-card>

    <v-divider></v-divider>
    <GMapMap
      :center="{
        lat: -29.67523007459448,
        lng: -50.87956603814547,
      }"
      :zoom="10"
      class="w-100 h-100"
      ref="mapRef"
    >
      <OsMarkers :adress-list="adressList" />
    </GMapMap>
  </v-card>
</template>
