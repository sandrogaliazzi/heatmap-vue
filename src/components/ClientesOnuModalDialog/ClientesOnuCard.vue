<script setup>
import { inject, ref, onMounted, computed, watch } from "vue";
import OnuList from "./OnuList.vue";
import fetchApi from "@/api";

const onuList = ref([]);
const closeDialog = inject("closeDialog");
const query = ref("");
const selectedOlt = ref([
  {
    ip: "192.168.202.2",
    name: "PARKS 1",
  },
]);

const selectAllOlt = ref(false);

const olts = [
  {
    ip: "192.168.202.2",
    name: "PARKS 1",
  },
  {
    ip: "192.168.203.2",
    name: "PARKS 2",
  },
  {
    ip: "192.168.204.2",
    name: "PARKS 3",
  },
  {
    ip: "192.168.205.2",
    name: "PARKS 4",
  },
  {
    ip: "192.168.206.2",
    name: "PARKS 5",
  },
  {
    ip: "192.168.207.2",
    name: "PARKS 6",
  },
  {
    ip: "192.168.208.2",
    name: "PARKS 7",
  },
  {
    ip: "192.168.209.2",
    name: "PARKS 8",
  },
];

const fetchAllOnu = async () => {
  const promiseList = selectedOlt.value.map(async (olt) => {
    const onuData = await fetchApi.post("verificar-onu-name-olt", {
      oltIp: olt.ip,
    });
    return onuData.data;
  });

  const allOnuData = await Promise.all(promiseList);
  onuList.value = allOnuData.flat();
};

watch(query, () => {
  if (query.value) {
    query.value = query.value.split(" ").join("-").toUpperCase();
  }
});

watch(selectedOlt, async () => {
  if (!selectedOlt.value.length) {
    alert("Selecione no mínimo uma olt");
  } else {
    await fetchAllOnu();
  }
});

watch(selectAllOlt, () => {
  selectAllOlt.value
    ? (selectedOlt.value = olts.slice())
    : (selectedOlt.value = [
        {
          ip: "192.168.202.2",
          name: "PARKS 1",
        },
      ]);
});

const filterOnuList = computed(() => {
  return onuList.value.filter((onu) => {
    if (onu.name) {
      return onu.name.includes(query.value);
    }
  });
});

const itemProps = (item) => {
  return {
    title: item.name,
    subtitle: item.ip,
  };
};

onMounted(() => {
  fetchAllOnu();
});
</script>

<template>
  <v-card style="min-height: 450px">
    <slot name="header">
      <v-card-title class="bg-orange">
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex">
            <p class="me-2">ONUS PARKS</p>
            <v-icon>mdi-circle-box</v-icon>
          </div>
          <div>
            <v-btn variant="text" icon="mdi-close" @click="closeDialog"></v-btn>
          </div>
        </div>
      </v-card-title>
    </slot>
    <v-card-text>
      <v-container>
        <v-row no-gutters>
          <v-col cols="12">
            <v-text-field
              variant="outlined"
              label="Pesquisar cliente"
              append-inner-icon="mdi-magnify"
              single-line
              v-model="query"
              hide-details
              class="mb-3"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-select
              label="Selecionar OLT"
              v-model="selectedOlt"
              multiple
              :items="olts"
              :item-props="itemProps"
            ></v-select>
            <v-checkbox
              label="selecionar todas as olts"
              v-model="selectAllOlt"
            ></v-checkbox>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12">
            <div v-if="onuList.length">
              <OnuList :onu-list="filterOnuList || onuList" />
            </div>
            <div v-else>
              <div class="d-flex justify-center align-center">
                <v-progress-circular
                  color="orange"
                  indeterminate
                  :size="105"
                  :width="9"
                ></v-progress-circular>
              </div>
              <p class="subtitle text-center text-warning mt-4">
                Carregando lista de clientes
              </p>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>
