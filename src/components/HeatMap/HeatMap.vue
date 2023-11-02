<script setup>
import { ref, watch } from "vue";
import { useTomodatStore } from "@/stores/tomodat.js";
import { useHeatMapStore } from "@/stores/heatmap";
import { storeToRefs } from "pinia";
import { getNewRadius } from "./HeatMap.js";

import CtoCard from "../CtoModalDialog/CtoCard.vue";
import DialogBox from "@/components/Dialog/Dialog.vue";
import Marker from "./Marker.vue";

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

const onCloseDialog = (value) => (openModal.value = value);

const getCtoById = (id) => {
  cto.value = getCto(id);
  openModal.value = true;
};

watch(
  [getSelectedCtoPosition, getSelectedUserPosition],
  () => (mapZoom.value = 16)
);

watch(mapRef, (googleMap) => {
  if (googleMap) {
    googleMap.$mapPromise.then((map) => {
      getTomodatData();

      map.addListener("zoom_changed", () => {
        const zoom = map.getZoom();
        const center = map.getCenter();

        heatMapRadius.value = getNewRadius(zoom, center);
      });
    });
  }
});
</script>

<template>
  <DialogBox :isOpen="openModal" @update:modalValue="onCloseDialog">
    <CtoCard :cto="cto" />
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
