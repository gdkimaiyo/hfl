<template>
  <div class="page-not-found fullscreen text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">404</div>

      <div class="text-h2" style="opacity: 0.4">Oops. Nothing here...</div>

      <q-btn
        class="q-mt-xl q-px-lg q-py-xs"
        color="white"
        text-color="black"
        rounded
        unelevated
        to="/"
        label="Go Home"
        no-caps
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-not-found {
  background: linear-gradient(135deg, #0d1441 0%, #2233a1 100%);
}
</style>
