<script setup>
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/user";
import { useNotificationStore } from "@/stores/notification";
import { useAuthStore } from "@/stores/auth";
import Notification from "@/components/Notification/Notification";
//import teste from "./components/teste.vue";

import { watch } from "vue";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const notification = useNotificationStore();
const user = useUserStore();
const router = useRouter();

const { tokenExpired } = storeToRefs(auth);

watch(tokenExpired, () => {
  if (tokenExpired) {
    notification.setNotification({
      msg: "Sua sessão expirou, faça Login novamente",
      status: "red",
    });

    user.logout();

    setTimeout(() => {
      router.push({ name: "Login" });
    }, 3000);
  }
});
</script>

<template>
  <v-app theme="dark">
    <v-main>
      <router-view></router-view>
      <!-- <teste /> -->
    </v-main>
    <Notification />
  </v-app>
</template>

<style>
::-webkit-scrollbar {
  width: 8px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #212121;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #4b4b4b;
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
