<script setup>
import { ref, watch, inject } from "vue";
import { useTomodatStore } from "@/stores/tomodat";
import { storeToRefs } from "pinia";
import avatar from "@/assets/avatar.png";
import DialogBox from "../Dialog/Dialog.vue";
import SearchCard from "./SearchCard.vue";
import CameraForm from "./CameraForm.vue";

const tomodatStore = useTomodatStore();
const { selectedCto } = storeToRefs(tomodatStore);

const { user } = defineProps(["user"]);
const cto = ref({});
const isDarkTheme = ref(true);

const changeTheme = inject("changeTheme");

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
    <v-list-group>
      <template #activator="{ props }">
        <v-list-item
          :prepend-avatar="avatar"
          :title="user.name"
          :subtitle="user.category"
          v-bind="props"
        >
        </v-list-item>
      </template>
      <v-list-item>
        <v-switch
          hide-details
          v-model="isDarkTheme"
          color="indigo-darken-3"
          @click="changeTheme"
          label="Dark Mode"
          class="ml-3"
        ></v-switch>
      </v-list-item>
    </v-list-group>
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
      <v-list-group value="Dashboard" prepend-icon="mdi-view-dashboard">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" title="Dashboard"></v-list-item>
        </template>
        <v-list-item
          prepend-icon="mdi-monitor-dashboard"
          title="Adm Painel"
          value="Dashboard"
          to="/dashboard"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-account-group"
          title="Usuários"
          value="users"
          to="/users"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-web"
          title="Ativações"
          value="logs"
          to="/logs"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-cctv"
          title="Câmeras"
          value="cameras"
          to="/camera"
        ></v-list-item>
      </v-list-group>
    </v-list>
  </v-list>
  <DialogBox :isOpen="openDialog" @update:modalValue="onCloseDialog">
    <SearchCard class="mt-4" />
  </DialogBox>
  <DialogBox :isOpen="openCameraDialog" @update:modalValue="onCloseDialog">
    <CameraForm />
  </DialogBox>
</template>
