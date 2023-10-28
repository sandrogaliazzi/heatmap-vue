<script setup>
import { ref, computed, watch, inject } from "vue";

import CtoMap from "./CtoMap.vue";
import CtoClientsList from "./CtoClientsList.vue";
import AddClientForm from "./AddClientForm.vue";
import fetchApi from "@/api";

const { cto } = defineProps(["cto"]);

const closeDialog = inject("closeDialog");

const isMapVisible = ref(true);
const slideNumber = ref(1);
const positionClicked = ref({ lat: "", lng: "" });

const center = computed(() => {
  return {
    lat: parseFloat(cto.coord.lat),
    lng: parseFloat(cto.coord.lng),
  };
});

const getSplitterPortStatus = computed(() => {
  if (!cto || !cto.percentage_free) {
    return { status: { error: true }, msg: "Erro ao calcular informações!" };
  }

  const percentageFree = parseInt(cto.percentage_free);

  if (percentageFree === 100)
    return { status: { isEmpty: true }, msg: "CTO vazia" };

  const occupiedPortsPercentage = 100 - percentageFree;

  if (occupiedPortsPercentage === 100)
    return { status: { isFull: true }, msg: "CTO Lotada" };

  const totalClients = cto.clients.length ? cto.clients.length : 0;

  const totalPorts = Math.ceil((100 * totalClients) / occupiedPortsPercentage);
  const freePorts = totalPorts - totalClients;

  return { status: { hasFreePorts: true }, freePorts, totalPorts };
});

const handleSplliterStatus = computed(() => {
  const { status, msg, freePorts, totalPorts } = getSplitterPortStatus.value;

  const className =
    status.error || status.isFull ? "text-error" : "text-success";
  const statusMsg = status.hasFreePorts
    ? `Portas: ${totalPorts} Vagas: ${freePorts}`
    : msg;

  return { className, statusMsg };
});

const openNewGMapTab = (position) => {
  const url = `https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}`;
  const win = window.open(url, "_blank");
  win.focus();
};

const resetPosition = () => (positionClicked.value = { lat: "", lng: "" });

watch(slideNumber, () => {
  if (slideNumber.value === 1) resetPosition();
});

const onPositionSelected = (position) => (positionClicked.value = position);

const clientLocationExists = async (clientName) => {
  try {
    const response = await fetchApi.post("/ctoclientid", {
      cto_id: cto.id,
      name: clientName,
    });

    return response.status === 200 ? true : false;
  } catch (e) {
    return false;
  }
};

const saveClientLocation = async (client, position) => {
  const bodyRequest = {
    name: client.name,
    lat: position.lat,
    lng: position.lng,
    cto_id: cto.id,
    user: "SANDRO",
    cto_name: cto.name,
    date_time: new Date().toLocaleString("pt-BR", { timeZone: "UTC" }),
  };

  const response = await fetchApi.post("/ctoclient", bodyRequest);

  return response;
};

const mapCenter = ref({ lat: +cto.coord.lat, lng: +cto.coord.lng });

const setMapCenter = (position) => {
  mapCenter.value = position;
};

const createMarker = (client) => {
  if (client.position.value) {
    setMapCenter(client.position.value);
  } else {
    const { lat, lng } = cto.coord;
    cto.clients.find((c) => c === client).position.value = {
      lat: +lat,
      lng: +lng,
    };
  }
};

const deleteClientLocation = (id) => {
  try {
    return fetchApi.delete(`/deletectoclient/${id}`);
  } catch (e) {
    return false;
  }
};

const onClientRemoved = async (id) => {
  if (confirm("deseja remover a localização deste cliente?")) {
    const client = cto.clients.find((c) => c.id === id);

    const hasLocationId = client.position.value._id;

    if (hasLocationId /*TEM LOCALIZAÇÃO NO BANCO*/) {
      const isDeleted = await deleteClientLocation(hasLocationId);
      client.position.value = false;
      return isDeleted
        ? alert("deleteado com sucesso")
        : alert("erro ao deletar cliente");
    } else client.position.value = false;
  }
};

const onClientPositionSelected = async ({ client, position }) => {
  if (!(await clientLocationExists(client.name))) {
    const locationSaved = await saveClientLocation(client, position);

    if (locationSaved.status === 201)
      alert("Localização adicionada com sucesso");
    else alert("erro ao adicionar localização");
  }
};
</script>

<template>
  <v-card class="rounded-md-lg">
    <v-card-title
      class="d-flex justify-space-between align-center border-b bg-orange"
    >
      <p style="cursor: pointer" @click="openNewGMapTab(cto.coord)">
        #{{ cto.name }}
      </p>
      <div>
        <v-btn
          v-if="slideNumber < 2"
          icon="mdi-account-plus"
          variant="plain"
          @click="slideNumber++"
        />
        <v-btn
          v-else
          icon="mdi-chevron-left"
          variant="plain"
          @click="slideNumber--"
        />
        <v-btn
          v-if="slideNumber < 2"
          variant="plain"
          :icon="`${isMapVisible ? 'mdi-eye' : 'mdi-eye-off'}`"
          @click="isMapVisible = !isMapVisible"
        />
        <v-btn variant="plain" icon="mdi-close" @click="closeDialog" />
      </div>
    </v-card-title>
    <v-card-subtitle class="mt-3 font-weight-bold"
      >{{ cto.city }}
      |
      <span :class="handleSplliterStatus.className">
        {{ handleSplliterStatus.statusMsg.toLocaleUpperCase() }}
      </span>
    </v-card-subtitle>

    <CtoMap
      :center="mapCenter"
      :ctoPosition="center"
      :clients="cto.clients"
      :openGmapTab="openNewGMapTab"
      :slideNumber="slideNumber"
      :isMapVisible="isMapVisible || slideNumber == 2"
      @positionSelected="onPositionSelected"
      @clientPositionSelected="onClientPositionSelected"
      @clientRemoved="onClientRemoved"
    />

    <v-window v-model="slideNumber" class="overflow-auto">
      <v-window-item :value="1">
        <v-card-text class="pa-5">
          <CtoClientsList
            :clients="cto.clients"
            class="mb-4"
            @adduser:location="(client) => createMarker(client)"
          />
        </v-card-text>
      </v-window-item>
      <v-window-item :value="2">
        <v-card-text>
          <AddClientForm
            :clientPosition="positionClicked"
            :cto="cto"
            @slide-back="slideNumber--"
          />
        </v-card-text>

        <v-card-actions class="d-flex justify-space-between mt-4 px-6">
          <v-btn
            color="blue"
            prepend-icon="mdi-chevron-left"
            variant="tonal"
            class="mb-2"
            @click="slideNumber--"
            >Voltar</v-btn
          >
        </v-card-actions>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<style scoped>
.fixed-action {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
}
</style>
