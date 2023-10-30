import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useUserStore = defineStore("user", () => {
  const user = ref(JSON.parse(localStorage.getItem("user")));

  const setUser = (userData) => {
    user.value = userData;

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);
  };

  const isAuthenticated = computed(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    return user == null ? false : true;
  });

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return { setUser, isAuthenticated, logout, user };
});
