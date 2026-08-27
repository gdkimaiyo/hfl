<template>
  <q-page class="column q-pb-xl">
    <HeroSection />
    <StatsSection />

    <FacilitiesNearMe />
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";

// Components
import HeroSection from "../components/home/HeroSection.vue";
import StatsSection from "../components/home/StatsSection.vue";
import FacilitiesNearMe from "../components/home/FacilitiesNearMe.vue";

export default defineComponent({
  name: "IndexPage",

  components: {
    HeroSection,
    StatsSection,
    FacilitiesNearMe,
  },
});
</script>

<style lang="scss" scoped>
@media only screen and (max-width: 600px) {
}
</style>
