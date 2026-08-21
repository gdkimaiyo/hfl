<template>
  <div class="hero-section text-white q-py-xl q-px-md">
    <div class="hero-content">
      <h1 class="text-h3 text-bold q-mb-lg">{{ heading }}</h1>
      <p class="text-body1 q-mb-lg">
        Public and private health facilities in Kenya. Check services available, capacity and
        ownership
      </p>
      <div class="q-mt-xl">
        <q-btn
          color="white"
          text-color="black"
          class="q-px-lg q-py-sm"
          rounded
          unelevated
          @click="scrollTo('all-facilities')"
        >
          <span class="q-pr-sm">Show All Facilities</span>
          <q-icon name="fas fa-angles-down" size="14px" />
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "FacilitiesHeroSection",

  setup() {
    const router = useRouter();
    const heading = ref<string>("All Healthcare Facilities in Kenya");

    const scrollTo = (refName: string): void => {
      void router.push({ name: "facilities", hash: `#${refName}` });
    };

    return {
      heading,
      scrollTo,
    };
  },
});
</script>

<style lang="scss" scoped>
.hero-section {
  background: linear-gradient(135deg, #0d1441 0%, #2233a1 100%);
  padding: 24px;
  height: 65vh;

  .hero-content {
    width: 100%;
    max-width: 1172px;
    margin: 0 auto;
    padding-top: 112px;
  }

  .hero-left {
    width: 50%;
    max-width: 50%;
    align-content: center;
    flex-grow: 1;
  }
}
@media only screen and (max-width: 600px) {
  .hero-section {
    height: fit-content;
    padding: 18px;
    padding-bottom: 72px;

    .hero-content {
      width: 100%;
      max-width: 100%;
      padding-top: 32px;
    }
  }
}
</style>
