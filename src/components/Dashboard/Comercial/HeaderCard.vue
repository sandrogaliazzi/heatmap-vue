<script setup>
import { ref, watch } from "vue";
import fetchApi from "@/api";
import Dialog from "@/components/Dialog/Dialog.vue";
import SaleForm from "./SaleForm.vue";

const { metrics, metric } = defineProps(["metrics", "metric"]);
const emit = defineEmits(["update-metric", "update-component", "update-sale"]);

const openForm = ref(false);
const openDialog = ref(false);
const newMetric = ref({ ...metric });
const createNewMetric = ref(false);

const resetState = () => {
  newMetric.value = { ...newMetric };
  openForm.value = false;
  createNewMetric.value = false;
};

watch(createNewMetric, (newVal) => {
  if (newVal) newMetric.value = {};
  else newMetric.value = { ...metric };
});

const submitMetric = async () => {
  if (confirm("Confirmar edição de métrica")) {
    let response;
    if (!createNewMetric.value) {
      response = await fetchApi.post("/goals", { ...newMetric.value });
    } else {
      response = await fetchApi.post("/goals", {
        description: newMetric.value.description,
        monthSales: newMetric.value.monthSales,
        weekSales: newMetric.value.weekSales,
        dailySales: newMetric.value.dailySales,
        phrase: newMetric.value.phrase,
        date: new Date().toLocaleDateString(),
      });
    }
    if (response.status === 200) {
      alert("Métrica atualizada com sucesso");
      emit("update-component");
      resetState();
    } else {
      alert("Erro ao atualizar a métrica");
    }
  }
};
</script>

<template>
  <Dialog :isOpen="openDialog" @update:modalValue="openDialog = false">
    <SaleForm
      :metricId="metric._id"
      @update-sales="() => emit('update-sale')"
    />
  </Dialog>
  <v-card>
    <v-card-title
      class="d-flex flex-column justify-center text-wrap align-center ga-3 text-orange-darken-4"
    >
      <span class="text-h4 font-weight-bold"
        >METAS {{ metric.description }}</span
      >
      <!-- <v-spacer></v-spacer> -->
      <div>
        <v-btn
          icon="mdi-chart-line"
          color="orange"
          variant="tonal"
          @click="openForm = !openForm"
        ></v-btn>
        <v-btn
          icon="mdi-menu"
          color="primary"
          class="ml-2"
          variant="tonal"
          id="menu-activator"
        >
        </v-btn>
        <v-menu activator="#menu-activator">
          <v-list>
            <v-list-item
              v-for="metric in metrics"
              :key="metric._id"
              :value="metric.description"
              @click="$emit('update-metric', metric)"
            >
              <v-list-item-title>{{ metric.description }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn
          icon="mdi-plus"
          color="green"
          class="ml-2"
          variant="tonal"
          @click="openDialog = true"
        ></v-btn>
      </div>
    </v-card-title>
    <template v-if="openForm">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              type="text"
              variant="solo"
              label="Descrição"
              v-model="newMetric.description"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              type="number"
              variant="solo"
              label="Mês"
              v-model="newMetric.monthSales"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              type="number"
              variant="solo"
              label="Semana"
              v-model="newMetric.weekSales"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              type="number"
              variant="solo"
              label="Dia"
              v-model="newMetric.dailySales"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-textarea
              clearable
              label="Frase"
              v-model="newMetric.phrase"
            ></v-textarea>
          </v-col>
        </v-row>
        <v-checkbox label="Nova métrica" v-model="createNewMetric"></v-checkbox>
      </v-card-text>
      <v-card-actions>
        <v-btn color="success" variant="tonal" @click="submitMetric"
          >Registrar</v-btn
        >
        <v-btn color="error" variant="tonal" @click="resetState"
          >cancelar</v-btn
        >
      </v-card-actions>
    </template>
  </v-card>
</template>
