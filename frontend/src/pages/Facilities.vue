<template>
  <q-page class="column q-pb-xl">
    <FacilitiesHeroSection />
    <StatsSection />

    <AllFacilities />
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";

// Components
import FacilitiesHeroSection from "../components/facilities/FacilitiesHeroSection.vue";
import StatsSection from "../components/home/StatsSection.vue";
import AllFacilities from "../components/facilities/AllFacilities.vue";

export default defineComponent({
  name: "FacilitiesPage",

  components: {
    FacilitiesHeroSection,
    StatsSection,
    AllFacilities,
  },
});
</script>
