<script setup>
import { ref, watch } from "vue";
import { useTomodatStore } from "@/stores/tomodat";
import { storeToRefs } from "pinia";
import avatar from "@/assets/avatar.png";
import DialogBox from "../Dialog/Dialog.vue";
import SearchCard from "./SearchCard.vue";
import CameraForm from "./CameraForm.vue";

const tomodatStore = useTomodatStore();
const { selectedCto } = storeToRefs(tomodatStore);

const cto = ref({});
const { user } = defineProps(["user"]);

watch(selectedCto, () => {
  cto.value = tomodatStore.getCto(selectedCto.value);
});

const openDialog = ref(false);
const openCameraDialog = ref(false);

const emit = defineEmits(["logout:user"]);

const onCloseDialog = (value) => {
  openDialog.value = value;
  openCameraDialog.value = value;
};
</script>

<template>
  <v-list>
    <v-list-item
      :prepend-avatar="avatar"
      :title="user.name"
      :subtitle="user.category"
    ></v-list-item>
    <v-divider class="my-2"></v-divider>

    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-magnify"
        title="Pesquisa avançada"
        value="search"
        color="orange"
        @click="openDialog = !openDialog"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-camera-account"
        title="Adicionar Câmera"
        value="camera"
        @click="openCameraDialog = true"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-logout"
        title="Logout"
        value="logout"
        @click="emit('logout:user')"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-monitor-dashboard"
        title="Dashboard"
        value="Dashboard"
        to="/dashboard"
      ></v-list-item>
    </v-list>
  </v-list>
  <DialogBox :isOpen="openDialog" @update:modalValue="onCloseDialog">
    <SearchCard class="mt-4" />
  </DialogBox>
  <DialogBox :isOpen="openCameraDialog" @update:modalValue="onCloseDialog">
    <CameraForm />
  </DialogBox>
</template>