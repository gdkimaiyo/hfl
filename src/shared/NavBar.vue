<template>
  <q-header id="navbar">
    <q-toolbar class="toolbar bg-white text-primary q-py-sm">
      <q-toolbar-title>
        <a class="logo-btn" clickable @click="goHome()">
          <span>
            <q-icon name="fas fa-location-dot" />
            <q-icon name="fas fa-h" size="16px" />
          </span>
          <span>
            <q-icon name="fas fa-f" size="16px" />
          </span>
          <span>
            <q-icon name="fas fa-l" size="16px" />
          </span>
        </a>
      </q-toolbar-title>

      <div>
        <a class="nav-btn gt-xs" clickable @click="goTo('/about-us')">
          <q-icon name="fas fa-square-info" size="18px" />
          About
        </a>

        <a class="nav-btn gt-xs" clickable @click="goTo('/help')">
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
                :class="{ 'active-q-item': currentRoute === '/about-us' }"
                exact
                clickable
                v-ripple
              >
                <q-item-section
                  style="display: inline-block"
                  @click="goTo('/about-us')"
                >
                  <q-icon name="fas fa-square-info" class="q-pr-sm" />
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
                  style="display: inline-block"
                  @click="goTo('/help')"
                >
                  <q-icon name="fas fa-square-question" class="q-pr-sm" />
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

<script>
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "NavBar",

  setup() {
    return {
      dropDownMenu: ref(false),
    };
  },

  computed: {
    currentRoute() {
      return useRoute().path;
    },
  },

  methods: {
    goHome() {
      this.$router.push("/").then(() => {
        this.$router.go();
      });
    },

    goTo(route) {
      this.$router.push(route);
    },
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
  max-width: 1024px;
  margin: 0 auto;
  padding-left: 16px;
  padding-right: 16px;
}
.logo-btn,
.nav-btn {
  font-size: 15px;
  cursor: pointer;
  font-weight: 500;
  margin-right: 18px;
  text-decoration: none;
}
.logo-btn {
  font-weight: 700;
  font-size: 1.7rem;
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
  background-color: #312c69 !important;
}
@media only screen and (max-width: 575px) {
  .logo-btn {
    font-size: 1.3rem;
    font-weight: 600;
    margin-right: 0;
  }
  .toolbar {
    padding-left: 16px;
  }
}
</style>
