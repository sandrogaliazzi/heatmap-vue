<script setup>
import { defineProps, defineEmits } from "vue";
import { useTomodatStore } from "@/stores/tomodat";

import ctoIcon from "@/assets/ctoconect.png";
import ctoFullIcon from "@/assets/ctofull.png";

const tomodatStore = useTomodatStore();

const isMarkerVisible = (marker) => {
  const multiples = tomodatStore.queryCto.toUpperCase().split(",");

  if (multiples.length > 1) {
    return multiples.some((query) => marker.title.includes(query));
  } else {
    return marker.title.includes(tomodatStore.queryCto.toUpperCase());
  }
};

const props = defineProps({
  markers: Array, //Lista de Marcadores
});

const emit = defineEmits(["open:ctoDialog", "open:sideBar"]);

const handleMarkerClick = (event, marker) => {
  if (!event.domEvent.altKey) {
    emit("open:ctoDialog", marker.id);
  } else {
    emit("open:sideBar", marker);
  }
};
</script>

<template>
  <GMapMarker
    v-for="(marker, index) in markers"
    :key="index"
    :title="marker.title"
    :position="marker.position"
    :icon="marker.percentage_free == 0 ? ctoFullIcon : ctoIcon"
    :clickable="true"
    @click="handleMarkerClick($event, marker)"
    :visible="isMarkerVisible(marker)"
  />
</template>
