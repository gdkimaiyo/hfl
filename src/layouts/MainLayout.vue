<template>
  <q-layout view="lHh Lpr lFf">
    <NavBar />

    <q-page-container>
      <router-view />
    </q-page-container>

    <FooterBar />
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import NavBar from "../shared/NavBar.vue";
import FooterBar from "../shared/FooterBar.vue";

export default defineComponent({
  name: "MainLayout",

  components: { NavBar, FooterBar },
});
</script>
