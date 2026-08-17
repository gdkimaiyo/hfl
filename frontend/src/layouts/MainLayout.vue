<template>
  <q-layout view="lHh Lpr lFf">
    <NavBar />

    <q-page-container>
      <router-view />
    </q-page-container>

    <FooterBar />
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

// Components
import NavBar from '../components/NavBar.vue';
import FooterBar from '../components/FooterBar.vue';

export default defineComponent({
  name: 'MainLayout',

  components: {
    NavBar,
    FooterBar,
  },
});
</script>
