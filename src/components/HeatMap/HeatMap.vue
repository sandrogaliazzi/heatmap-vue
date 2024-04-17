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
import ClientesOnuCard from "../ClientesOnuModalDialog/ClientesOnuCard.vue";
import { getMkToken, getClientFone } from "@/api/mkApi.js";

const store = useTomodatStore();
const {
  getHeatMapData,
  getMarkersData,
  getSelectedCtoPosition,
  selectedUserLocation,
  getSelectedUserPosition,
  isEventMarkerVisible,
  setPolygonDrawMode,
} = storeToRefs(store);
const { getCto, getTomodatData } = store;

const heatmapStore = useHeatMapStore();
const { isHeatMapVisible } = storeToRefs(heatmapStore);

const mapRef = ref(null);
const mapZoom = ref(11);
const heatMapRadius = ref(5);
const cto = ref({});
const openModal = ref(false);

const openEventModal = ref(false);
const eventWindow = ref(false);
const eventWindowLocation = ref(null);
const eventAction = ref("");
const events = ref([]);
const selectedEvent = ref({});
const sideBar = ref(false);
const sideBarCtoList = ref([]);
const areaCoordinates = ref([]);
const nextPoint = ref(0);

const openClientSignalModal = ref(false);

const showSideBar = async (ctoList) => {
  sideBar.value = true;
  ctoList.forEach((item) => {
    const cto = getCto(item.id);

    if (!sideBarCtoList.value.includes(cto)) {
      sideBarCtoList.value.push(cto);
    }
  });
  if (!ctoList.length) sideBar.value = false;
  //const response = await fetchApi("/list-access-point/" + cto.id);
  //console.log(cto);
};

const onCloseDialog = (value) => {
  openModal.value = value;
  openEventModal.value = value;
  openClientSignalModal.value = value;
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

import { setupContainsLatLng } from "./is-point-within-polygon.js";
const polygonRef = ref(null);

watch(polygonRef, (polygon) => {
  if (polygon) {
    polygon.$polygonPromise.then((area) => {
      const isWithinPolygon = getMarkersData.value.filter((marker) => {
        return area.containsLatLng(marker.position.lat, marker.position.lng);
      });

      showSideBar(isWithinPolygon);
    });
  }
});

watch(setPolygonDrawMode, (mode) => {
  if (!mode) {
    areaCoordinates.value = [];
    sideBar.value = false;
  }
});

watch(mapRef, (googleMap) => {
  if (googleMap) {
    googleMap.$mapPromise.then((map) => {
      getTomodatData();

      setupContainsLatLng();

      map.addListener("zoom_changed", () => {
        const zoom = map.getZoom();
        const center = map.getCenter();

        heatMapRadius.value = getNewRadius(zoom, center);
      });

      map.addListener("rightclick", (mapsMouseEvent) => {
        eventWindowLocation.value = mapsMouseEvent.latLng.toJSON();
        eventWindow.value = true;
      });

      map.addListener("click", (mapsMouseEvent) => {
        if (setPolygonDrawMode.value) {
          areaCoordinates.value.push(mapsMouseEvent.latLng.toJSON());
          nextPoint.value++;
        }
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

const findTotalClients = () => {
  return sideBarCtoList.value.reduce((acc, val) => {
    if (Array.isArray(val.clients)) {
      return acc + val.clients.length;
    } else return 0;
  }, 0);
};

const removeParenthesis = (inputString) => {
  const startIndex = inputString.indexOf("(");
  if (startIndex !== -1) {
    const endIndex = inputString.indexOf(")", startIndex);
    if (endIndex !== -1) {
      return inputString.slice(0, startIndex).trim();
    }
  }
  return inputString;
};

const convertArrayOfObjectsToCSV = (array) => {
  const header = Object.keys(array[0]).join(",");
  const rows = array.map((obj) =>
    Object.values(obj)
      .map((value) => `"${value}"`)
      .join(",")
  );
  return `${header}\n${rows.join("\n")}`;
};

const downloadCSV = (csvContent, fileName) => {
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const extractClientsNamesFromCto = () => {
  return sideBarCtoList.value
    .filter((cto) => Array.isArray(cto.clients))
    .map((cto) => cto.clients)
    .flat()
    .map((client) => removeParenthesis(client.name).trim());
};

const extractClientsFromCto = () => {
  return sideBarCtoList.value
    .filter((cto) => Array.isArray(cto.clients))
    .map((cto) => cto.clients)
    .flat();
};

const getClientsFone = async () => {
  const clients = extractClientsNamesFromCto();

  const mkToken = await getMkToken();

  const promisseList = clients.map((client) => getClientFone(client, mkToken));

  const foneList = await Promise.all(promisseList);

  const foneListFormatted = foneList.flat().map((client) => ({
    numero: client.fone,
    nome: client.nome,
    mensagem: "",
  }));

  const csvContent = convertArrayOfObjectsToCSV(foneListFormatted);

  downloadCSV(csvContent, `data=${new Date().toLocaleDateString()}.csv`);

  //console.log(foneListFormatted);
};

const onReloadEvent = () => {
  loadEvents();
};

// function transformCoordinates(input) {
//   // Split the input string into an array of coordinate pairs
//   const coordinatePairs = input.trim().split(" ");

//   // Map over each coordinate pair and transform it into the desired format
//   const transformedCoordinates = coordinatePairs.map((pair) => {
//     const [lng, lat, _] = pair.split(","); // Extract longitude and latitude
//     return { lat: parseFloat(lat), lng: parseFloat(lng) }; // Parse and return as an object
//   });

//   return transformedCoordinates;
// }

onMounted(() => loadEvents());
</script>

<template>
  <DialogBox :isOpen="openModal" @update:modalValue="onCloseDialog">
    <CtoCard :cto="cto" />
  </DialogBox>

  <DialogBox :isOpen="openClientSignalModal" @update:modalValue="onCloseDialog">
    <ClientesOnuCard :clients="extractClientsFromCto()"></ClientesOnuCard>
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

  <v-navigation-drawer
    location="right"
    v-model="sideBar"
    permanent
    width="400"
    style="overflow-y: hidden"
  >
    <v-card variant="flat">
      <v-card-title
        class="mt-3 d-flex wrap"
        v-if="sideBarCtoList.length > 0"
        style="position: sticky; top: 0"
      >
        <v-chip prepend-icon="mdi-cube" size="large" color="primary">{{
          sideBarCtoList.length
        }}</v-chip>
        <v-chip
          prepend-icon="mdi-account"
          size="large"
          color="orange"
          class="ml-2"
          >{{ findTotalClients() }}</v-chip
        >
        <v-btn
          rounded="xl"
          class="ml-2"
          color="success"
          prepend-icon="mdi-phone"
          @click="getClientsFone"
          >IF-BOT</v-btn
        >
        <v-btn
          rounded="xl"
          class="ml-2"
          color="indigo"
          prepend-icon="mdi-flash"
          @click="openClientSignalModal = true"
          >Sinal</v-btn
        >
      </v-card-title>
      <v-card-text style="max-height: 80vh; overflow-y: auto">
        <v-list>
          <v-list-item v-for="cto in sideBarCtoList" :key="cto.id">
            <v-list-subheader inset>{{ cto.name }}</v-list-subheader>
            <v-list-item
              v-for="client in cto.clients"
              :title="client.name"
              :value="client.name"
              :key="client.id"
              rounded="xl"
            >
              <template #prepend>
                <v-icon icon="mdi-account"></v-icon>
              </template>
            </v-list-item>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-navigation-drawer>
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
      v-if="events.length && isEventMarkerVisible"
      :event-markers="events"
      @update-event="(event) => onUpdateEvent(event)"
    />

    <Marker
      :markers="getMarkersData"
      @open:cto-dialog="getCtoById"
      @open:side-bar="(cto) => showSideBar(cto)"
    />

    <GMapPolygon
      ref="polygonRef"
      :paths="areaCoordinates"
      :key="nextPoint"
    ></GMapPolygon>

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
