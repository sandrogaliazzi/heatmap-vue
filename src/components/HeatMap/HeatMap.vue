<script setup>
import { ref, watch, onMounted } from "vue";
import { useTomodatStore } from "@/stores/tomodat.js";
import { useHeatMapStore } from "@/stores/heatmap";
import { storeToRefs } from "pinia";
import { getNewRadius } from "./HeatMap.js";
import warningIcon from "@/assets/warning-icon.png";
import EventForm from "./EventForm.vue";
import fetchApi from "@/api";

import CtoCard from "../CtoModalDialog/CtoCard.vue";
import DialogBox from "@/components/Dialog/Dialog.vue";
import Marker from "./Marker.vue";
import EventMarker from "./eventMarker.vue";

const store = useTomodatStore();
const {
  getHeatMapData,
  getMarkersData,
  getSelectedCtoPosition,
  selectedUserLocation,
  getSelectedUserPosition,
} = storeToRefs(store);
const { getCto, getTomodatData } = store;

const heatmapStore = useHeatMapStore();
const { isHeatMapVisible } = storeToRefs(heatmapStore);

const mapRef = ref(null);
const mapZoom = ref(15);
const heatMapRadius = ref(50);
const cto = ref({});
const openModal = ref(false);

const openEventModal = ref(false);
const eventWindow = ref(false);
const eventWindowLocation = ref(null);
const eventAction = ref("");
const events = ref([]);
const selectedEvent = ref({});

const onCloseDialog = (value) => {
  openModal.value = value;
  openEventModal.value = value;
};

const getCtoById = (id) => {
  cto.value = getCto(id);
  openModal.value = true;
};

watch(
  [getSelectedCtoPosition, getSelectedUserPosition],
  () => (mapZoom.value = 16)
);

const onCloseMarker = () => {
  openEventModal.value = false;
  eventWindowLocation.value = null;
  selectedEvent.value = {};
  eventAction.value = "";
};

watch(mapRef, (googleMap) => {
  if (googleMap) {
    googleMap.$mapPromise.then((map) => {
      getTomodatData();

      map.addListener("zoom_changed", () => {
        const zoom = map.getZoom();
        const center = map.getCenter();

        heatMapRadius.value = getNewRadius(zoom, center);
      });

      map.addListener("rightclick", (mapsMouseEvent) => {
        eventWindowLocation.value = mapsMouseEvent.latLng.toJSON();
        eventWindow.value = true;
      });
    });
  }
});

const onUpdateEvent = (event) => {
  selectedEvent.value = event.info;
  openEventModal.value = true;
  eventAction.value = event.action;
};

const loadEvents = async () => {
  try {
    const response = await fetchApi("/listevents");

    events.value = response.data;
  } catch (error) {
    throw error;
  }
};

const onReloadEvent = () => {
  loadEvents();
};

onMounted(() => loadEvents());
</script>

<template>
  <DialogBox :isOpen="openModal" @update:modalValue="onCloseDialog">
    <CtoCard :cto="cto" />
  </DialogBox>

  <DialogBox :isOpen="openEventModal" @update:modalValue="onCloseDialog">
    <EventForm
      :event-locale="eventWindowLocation"
      :event="selectedEvent"
      :event-action="eventAction"
      @reload-events="onReloadEvent"
      @close-marker="onCloseMarker"
    />
  </DialogBox>
  <GMapMap
    :center="getSelectedUserPosition || getSelectedCtoPosition"
    :zoom="mapZoom"
    class="w-100 h-100"
    ref="mapRef"
  >
    <GMapMarker
      v-if="getSelectedUserPosition"
      :animation="2"
      title="Você está aqui"
      :position="getSelectedUserPosition"
    ></GMapMarker>

    <GMapMarker
      v-if="eventWindowLocation"
      title="Adicionar Evento aqui"
      :icon="warningIcon"
      :position="eventWindowLocation"
      @click="eventWindow = !eventWindow"
    >
      <GMapInfoWindow :opened="eventWindow">
        <div class="d-flex flex-column ga-2">
          <v-btn @click="openEventModal = true">Criar evento</v-btn>
          <v-btn @click="eventWindowLocation = null">Cancelar</v-btn>
        </div>
      </GMapInfoWindow>
    </GMapMarker>

    <EventMarker
      v-if="events.length"
      :event-markers="events"
      @update-event="(event) => onUpdateEvent(event)"
    />

    <Marker :markers="getMarkersData" @open:cto-dialog="getCtoById" />
    <div v-if="isHeatMapVisible">
      <GMapHeatmap
        :data="getHeatMapData"
        :options="{
          radius: heatMapRadius,
        }"
      />
    </div>
  </GMapMap>
</template>

<style scoped></style>
