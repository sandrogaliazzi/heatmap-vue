<script setup>
import { defineProps, defineEmits } from "vue";
import { useTomodatStore } from "@/stores/tomodat";

import ctoIcon from "@/assets/ctoconect.png";
import ctoFullIcon from "@/assets/ctofull.png";

const tomodatStore = useTomodatStore();

const isMarkerVisible = (marker) =>
  marker.title.includes(tomodatStore.queryCto.toUpperCase()) ? true : false;

const props = defineProps({
  markers: Array, //Lista de Marcadores
});

const emit = defineEmits(["open:ctoDialog"]);
</script>

<template>
  <GMapMarker
    v-for="(marker, index) in markers"
    :key="index"
    :title="marker.title"
    :position="marker.position"
    :icon="marker.percentage_free == 0 ? ctoFullIcon : ctoIcon"
    :clickable="true"
    @click="$emit('open:ctoDialog', marker.id)"
    :visible="isMarkerVisible(marker)"
  />
</template>
