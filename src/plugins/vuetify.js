/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { VDatePicker } from "vuetify/labs/VDatePicker";
import { VuetifyDateAdapter } from "vuetify/labs/date/adapters/vuetify";

// Composables
import { createVuetify } from "vuetify";

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    themes: {
      light: {
        colors: {
          primary: "#235789",
          secondary: "#5CBBF6",
        },
      },
    },
  },
  components: {
    VDatePicker,
  },
  date: {
    adapter: VuetifyDateAdapter,
  },
});
