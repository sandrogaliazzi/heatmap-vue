<script setup>
import { computed } from "vue";

const { ce } = defineProps(["ce"]);

const groupedRows = computed(() => {
  let result = [];
  let tempGroup = [];

  for (let i = 0; i < ce.length; i++) {
    if (ce[i].side === "left") {
      tempGroup.push(ce[i]);

      // Verifica se o próximo item é 'right'
      if (i + 1 < ce.length && ce[i + 1].side === "right") {
        tempGroup.push(ce[i + 1]);
        result.push(tempGroup);
        tempGroup = []; // Limpa o grupo temporário
        i++; // Avança mais um índice para pular 'right'
      } else {
        result.push(tempGroup);
        tempGroup = [];
      }
    } else if (ce[i].side === "right") {
      tempGroup.push(ce[i]);

      // Verifica se o próximo item é 'left'
      if (i + 1 < ce.length && ce[i + 1].side === "left") {
        tempGroup.push(ce[i + 1]);
        result.push(tempGroup);
        tempGroup = []; // Limpa o grupo temporário
        i++; // Avança mais um índice para pular 'left'
      } else {
        result.push(tempGroup);
        tempGroup = [];
      }
    } else {
      result.push([ce[i]]); // Se não for 'left' nem 'right', adiciona sozinho
    }
  }

  console.log(result);

  return result;
});

const getRowAligment = (row) => {
  if (row.length > 1) return "space-between";
  else if (row.length === 1 && row[0].side === "right") return "end";
  else if (row.length === 1 && row[0].side === "left") return "start";
  else return "center";
};
</script>
<template>
  <v-card>
    <v-container>
      <template v-for="(row, i) in groupedRows" :key="i">
        <v-row :justify="getRowAligment(row)">
          <v-col v-for="(cols, index) in row" :key="index" cols="4">
            <v-sheet class="pa-2 ma-2 bg-surface-variant">
              TESTE COLUNA
            </v-sheet>
          </v-col>
        </v-row>
      </template>
    </v-container>
  </v-card>
</template>
