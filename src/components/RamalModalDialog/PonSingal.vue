<script setup>
import { ref, computed, onMounted } from "vue";
import { useNotificationStore } from "@/stores/notification";

const { onuList, ramal } = defineProps(["onuList", "ramal"]);
import fetchApi from "@/api";

const notification = useNotificationStore();

const ramalHistory = ref([]);
const prevData = ref(false);
const selectedDate = ref("");

const search = ref("");

const headers = ref([
  {
    align: "start",
    key: "name",
    sortable: false,
    title: "Nome",
  },
  { key: "Status", title: "status" },
  { key: "Power Level", title: "Rx Sinal" },
  { key: "RSSI", title: "Tx sinal" },
]);

const Currentdata = computed(() => {
  return onuList.map((onu) => {
    if (onu.status == "ACTIVE (PROVISIONED)") {
      onu["Powe Level"] = parseFloat(
        onu["Power Level"].split(" ")[0].slice(0, 6)
      );
      onu["RSSI"] = parseFloat(onu["RSSI"].split(" ")[0].slice(0, 6));
    }

    return onu;
  });
});

const saveGponData = async () => {
  const save = await fetchApi.post("ramal-log-register", {
    id: ramal._id,
    date_time: new Date().toLocaleString("pt-BR"),
    gpon_data: onuList,
  });

  if (save.status === 200) {
    notification.setNotification({
      msg: "Salvo no histórico de sinais com sucesso",
      status: "success",
    });
  } else {
    notification.setNotification({
      msg: "Erro ao adicionar no histórico",
      status: "red",
    });
  }
};

const setDataByDate = (data) => {
  prevData.value = data.gpon_data;
  selectedDate.value = data.date_time;
};

onMounted(async () => {
  const response = await fetchApi(`find-ramal-logs/${ramal._id}`);
  if (response.status === 200) {
    ramalHistory.value = response.data.ramalHistory;
  }
});
</script>

<template>
  <v-card>
    <v-card-text>
      <v-card flat>
        <v-card-title> </v-card-title>
        <v-card-title>
          Lista clientes {{ ramal.oltRamal }}
          <v-chip
            v-if="prevData"
            class="ma-2"
            closable
            @click:close="prevData = false"
          >
            {{ selectedDate }}
          </v-chip>
        </v-card-title>
        <v-btn color="orange" variant="tonal" v-if="ramalHistory.length > 0">
          Ver histórico
          <v-menu activator="parent">
            <v-list>
              <v-list-item
                v-for="date in ramalHistory"
                :key="date._id"
                :title="date.date_time"
                :value="date.date_time"
                @click="setDataByDate(date)"
              ></v-list-item>
            </v-list>
          </v-menu>
        </v-btn>
        <template v-slot:text>
          <v-text-field
            v-model="search"
            label="Search"
            prepend-inner-icon="mdi-magnify"
            single-line
            variant="outlined"
            hide-details
          ></v-text-field>
        </template>

        <v-data-table
          :headers="headers"
          :items="prevData ? prevData : Currentdata"
          :search="search"
        ></v-data-table>
      </v-card>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" block @click="saveGponData"
        >Salvar no histórico</v-btn
      >
    </v-card-actions>
  </v-card>
</template>
