<script setup>
import { inject, ref, onMounted, computed } from "vue";
import fetchApi from "@/api";

const onuList = ref([]);
const closeDialog = inject("closeDialog");

const fetchAllOnu = async () => {
  const onuData = await fetchApi.post("verificar-onu-name-olt", {
    oltIp: "192.168.204.2",
  });
  console.log(onuData.data);
  onuList.value = onuData.data;
};

onMounted(() => {
  fetchAllOnu();
});
</script>

<template>
  <v-card>
    <v-card-title class="bg-orange">
      <div class="d-flex justify-space-between align-center">
        <div class="d-flex">
          <p class="me-2">ONUS PARKS</p>
          <v-icon>mdi-circle-box</v-icon>
        </div>
        <div>
          <v-btn variant="text" icon="mdi-reload"></v-btn>
          <v-btn variant="text" icon="mdi-close" @click="closeDialog"></v-btn>
        </div>
      </div>
    </v-card-title>
    <v-card-text>
      {{ onuList }}
    </v-card-text>
  </v-card>
</template>
