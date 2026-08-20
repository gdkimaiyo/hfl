<template>
  <q-header id="navbar">
    <q-toolbar class="toolbar bg-white text-primary q-py-sm">
      <q-toolbar-title>
        <a class="logo-btn cursor-pointer" @click="goHome()">
          <img
            src="../assets/hospital_icon_24_primary.png"
            alt="HealthFacilityLocator logo"
            class="logo-img"
          />
          <span class="logo-text"> HealthFacility<span class="text-negative">Locator</span> </span>
        </a>
      </q-toolbar-title>

      <div>
        <a
          class="nav-btn gt-xs"
          :class="{ 'text-negative': currentRoute === '/' }"
          clickable
          @click="goTo('/')"
        >
          <q-icon name="fas fa-square-info" size="18px" />
          Home
        </a>
        <a
          class="nav-btn gt-xs"
          :class="{ 'text-negative': currentRoute === '/facilities' }"
          clickable
          @click="goTo('/facilities')"
        >
          <q-icon name="fas fa-square-info" size="18px" />
          Facilities
        </a>
        <a
          class="nav-btn gt-xs"
          :class="{ 'text-negative': currentRoute === '/about-us' }"
          clickable
          @click="goTo('/about-us')"
        >
          <q-icon name="fas fa-square-info" size="18px" />
          About
        </a>

        <a
          class="nav-btn gt-xs"
          :class="{ 'text-negative': currentRoute === '/help' }"
          clickable
          @click="goTo('/help')"
        >
          <q-icon name="fas fa-square-question" size="18px" />
          Help
        </a>

        <q-btn
          flat
          dense
          round
          class="menu-btn lt-sm"
          icon="menu"
          aria-label="Menu"
          @click="dropDownMenu = !dropDownMenu"
        >
          <q-menu
            auto-close
            :offset="[15, 15]"
            transition-show="jump-down"
            transition-hide="jump-up"
            max-width="450px"
            max-height="93vh"
            class="lt-sm"
          >
            <q-list
              class="dropdown-menu bg-primary text-white q-pt-xl"
              style="min-width: 300px; min-height: 85vh; margin-top: 0"
            >
              <q-item
                class="q-pl-xl"
                :class="{ 'active-q-item': currentRoute === '/' }"
                exact
                clickable
                v-ripple
              >
                <q-item-section style="display: inline-block; padding-top: 6px" @click="goTo('/')">
                  <q-icon name="fas fa-house-chimney-window" class="q-pr-sm" />
                  Home
                </q-item-section>
              </q-item>
              <q-item
                class="q-pl-xl"
                :class="{ 'active-q-item': currentRoute === '/facilities' }"
                exact
                clickable
                v-ripple
              >
                <q-item-section
                  style="display: inline-block; padding-top: 6px"
                  @click="goTo('/facilities')"
                >
                  <q-icon name="far fa-hospital" class="q-pr-sm" />
                  Facilities
                </q-item-section>
              </q-item>
              <q-item
                class="q-pl-xl"
                :class="{ 'active-q-item': currentRoute === '/about-us' }"
                exact
                clickable
                v-ripple
              >
                <q-item-section
                  style="display: inline-block; padding-top: 6px"
                  @click="goTo('/about-us')"
                >
                  <q-icon name="fas fa-circle-info" color="white" class="q-pr-sm" />
                  About
                </q-item-section>
              </q-item>

              <q-item
                class="q-pl-xl"
                :class="{ 'active-q-item': currentRoute === '/help' }"
                exact
                clickable
                v-ripple
              >
                <q-item-section
                  style="display: inline-block; padding-top: 6px"
                  @click="goTo('/help')"
                >
                  <q-icon name="fas fa-question" class="q-pr-sm" />
                  Help
                </q-item-section>
              </q-item>

              <!-- <q-separator inset color="white" class="lt-sm q-my-lg" /> -->
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-toolbar>
  </q-header>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  name: "NavBar",

  setup() {
    const router = useRouter();
    const route = useRoute();

    const dropDownMenu = ref<boolean>(false);

    // Computed
    const currentRoute = computed<string>(() => {
      return route.path;
    });

    // Methods
    const goHome = async () => {
      await router.push("/");
    };

    const goTo = async (targetRoute: string) => {
      await router.push(targetRoute);
    };

    return {
      dropDownMenu,
      currentRoute,
      goHome,
      goTo,
    };
  },
});
</script>

<style lang="scss" scoped>
#navbar {
  font-family: "Avenir";
  background-color: rgba(255, 255, 255);
  backdrop-filter: blur(40px);
  border-bottom: 0.5px solid #0d1441;
}
.toolbar {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 16px 8px 16px;
}
.nav-btn {
  font-size: 15px;
  cursor: pointer;
  font-weight: 500;
  margin-right: 18px;
  text-decoration: none;
}
// .logo-btn {
//   font-weight: 700;
//   font-size: 1.7rem;
// }
.logo-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: inherit;
  user-select: none;
}

.logo-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  display: block;
}

.logo-text {
  font-weight: 700;
  font-size: 1.17rem;
  letter-spacing: -0.2px;
  line-height: 1;
}

.menu-btn {
  color: #ffffff;
  background-color: #0d1441;
  box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.08);
  border-radius: 42.5px;
}

.dropdown-menu .q-item.q-router-link--active,
.dropdown-menu .q-item--active,
.dropdown-menu .active-q-item {
  color: #ffffff !important;
  background-color: #c10015 !important;
}
@media only screen and (max-width: 575px) {
  .logo-text {
    font-size: 1.1rem;
  }
  .toolbar {
    padding-left: 16px;
  }
}
</style>
