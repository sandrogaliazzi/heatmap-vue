import { ref, computed } from "vue";
import { defineStore } from "pinia";
import fetchApi from "@/api/index.js";

export const useTomodatStore = defineStore("tomodat", () => {
  const ctoList = ref([]);
  const ctoListByCity = ref({});
  const queryCto = ref("");
  const locatedClients = ref([]);
  const selectedCto = ref("");
  const selectedUserLocation = ref(null);

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

    const newClient = {
      name,
      position: { value: { lat: +lat, lng: +lng } },
      id: Date.now(),
    };

    console.log(newClient);

    const cto = ctoList.value.find((cto) => cto.id === cto_id);

    if (cto) cto.clients.unshift(newClient);
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
    const position = { lat: -29.58576358380055, lng: -50.8956005852099 };

    if (selectedCto.value) {
      selectedUserLocation.value = null;
      const { coord } = getCto(selectedCto.value);

      position.lat = +coord.lat;
      position.lng = +coord.lng;
    }

    return position;
  });

  const getSelectedUserPosition = computed(() => {
    if (!selectedUserLocation.value) {
      return false;
    }
    return {
      lat: selectedUserLocation.value.coords.latitude,
      lng: selectedUserLocation.value.coords.longitude,
    };
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
    selectedUserLocation,
    getSelectedUserPosition,
  };
});
