<template>
  <q-page class="column q-pb-xl">
    <FacilitiesHeroSection />

    <div class="main-page q-pa-md q-mt-sm">
      <div class="text-h5">Facilities</div>
      <q-separator spaced />
      <p id="all-facilities" ref="#all-facilities">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus consectetur modi sequi
        perferendis consequuntur esse voluptatibus pariatur alias dolorem? Vel perspiciatis commodi,
        earum sed ad nam fugiat ullam similique quidem!
      </p>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";

// Components
import FacilitiesHeroSection from "../components/facilities/FacilitiesHeroSection.vue";

export default defineComponent({
  name: "FacilitiesPage",

  components: {
    FacilitiesHeroSection,
  },
});
</script>

<style lang="scss" scoped>
.main-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 32px;
}
</style>
