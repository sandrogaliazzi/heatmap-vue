import { ref, computed } from "vue";
import { defineStore } from "pinia";
import fetchApi from "@/api/index.js";

export const useTomodatStore = defineStore("tomodat", () => {
  const ctoList = ref([]);
  const ctoListByCity = ref({});
  const queryCto = ref("");
  const locatedClients = ref([]);
  const selectedCto = ref("");

  async function getTomodatData() {
    const response = await fetchApi.get("/fetch");

    ctoList.value = response.data;

    ctoListByCity.value = divideByCity(ctoList.value);
  }

  function divideByCity(ctoList) {
    return ctoList.reduce((acc, item) => {
      if (!acc[item.city]) acc[item.city] = [item];
      else acc[item.city].push(item);

      return acc;
    }, {});
  }

  async function getAllLocatedClients() {
    const response = await fetchApi.get("ctoclient");

    locatedClients.value = response.data;
  }

  function addNewClient(data) {
    const { lat, lng, name, cto_id } = data;

    const cto = ctoList.value.find((cto) => cto.id === cto_id);

    if (cto)
      cto.clients.unshift({
        name,
        position: { value: { lat, lng } },
        id: Date.now(),
      });
  }

  const getClients = computed(() => {
    const clientList = [];

    ctoList.value.forEach((cto) => {
      const clients = cto.clients;

      clientList.push(
        clients.map((client) => ({
          ...client,
          ctoId: cto.id,
          ctoName: cto.name,
        }))
      );
    });

    return clientList.flat();
  });

  function getCto(id) {
    const cto = ctoList.value.find((cto) => cto.id === id);

    const locatedClients = getLocatedClientesByCto(id);

    cto.clients = cto.clients.map((client) => {
      const { name, id } = client;
      const position = {};

      position.value = false;

      const hasLocationRegistered = locatedClients.find((c) => c.name === name);

      if (hasLocationRegistered) {
        const { lat, lng, _id } = hasLocationRegistered;
        position.value = { lat: +lat, lng: +lng, _id };
      }

      return {
        name,
        id,
        position,
      };
    });

    return cto;
  }

  const getSelectedCtoPosition = computed(() => {
    if (!selectedCto.value)
      return {
        lat: -29.58576358380055,
        lng: -50.8956005852099,
      };
    else {
      const { coord } = getCto(selectedCto.value);

      return {
        lat: +coord.lat,
        lng: +coord.lng,
      };
    }
  });

  const getMarkersData = computed(() => {
    return ctoList.value.map((cto) => {
      const { lat, lng } = cto.coord;

      return {
        position: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        },
        percentage_free: cto.percentage_free,
        title: cto.name,
        id: cto.id,
      };
    });
  });

  function toggleMarkers() {
    queryCto.value = queryCto.value ? "" : "123456";
  }

  const getLocatedClientesByCto = (ctoId) => {
    return locatedClients.value.filter((client) => client.cto_id == ctoId);
  };

  const getHeatMapData = computed(() => {
    return ctoList.value.map((cto) => {
      const { lat, lng } = cto.coord;

      return new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
    });
  });

  getAllLocatedClients();

  return {
    ctoList,
    ctoListByCity,
    getTomodatData,
    getMarkersData,
    getHeatMapData,
    getCto,
    queryCto,
    toggleMarkers,
    addNewClient,
    getClients,
    selectedCto,
    getSelectedCtoPosition,
    getAllLocatedClients,
  };
});
