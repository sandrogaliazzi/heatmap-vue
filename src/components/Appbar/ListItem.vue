<script setup>
import { inject } from "vue";
import { useTomodatStore } from "@/stores/tomodat";

const closeDialog = inject("closeDialog");

const tomodatStore = useTomodatStore();

const setCto = ({ ctoId, ctoName, id, name }) => {
  tomodatStore.selectedCto = ctoId || id;
  tomodatStore.queryCto = ctoName || name;
  closeDialog();
};

const { source } = defineProps(["source"]);
</script>

<template>
  <v-list-item :title="source.name" :value="source.name">
    <template v-slot:prepend>
      <v-avatar color="grey-lighten-1">
        <v-icon color="white">mdi-google-maps</v-icon>
      </v-avatar>
    </template>
    <v-list-item-subtitle v-if="source.city">
      {{ source.city == "ZCLIENTES NÃO VERIFICADOS" ? "ARARICA" : source.city }}
    </v-list-item-subtitle>

    <template v-slot:append>
      <v-btn
        color="grey-lighten-1"
        icon="mdi-cube"
        variant="text"
        @click="setCto(source)"
      ></v-btn>
    </template>
  </v-list-item>
</template>
