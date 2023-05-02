<template>
  <footer id="footer" class="footer">
    <div class="quick-links">
      <!-- <div class="text-h5">Quick Links</div> -->
      <div class="nav-btn">
        <a class="q-pr-sm" clickable @click="goHome()">Home</a>
      </div>
      <div class="nav-btn">
        <a class="q-pr-sm" clickable @click="goTo('/about-us')">About Us</a>
      </div>
      <div class="nav-btn">
        <a class="q-pr-sm" clickable @click="goTo('/help')"> Help </a>
      </div>
    </div>

    <div class="copyright q-pt-lg">
      <q-separator spaced color="white" />
      <div class="q-mt-md">
        &copy;
        {{ year }}
        <q-icon
          name="fas fa-circle"
          color="white"
          size="5px"
          style="padding: 0 6px"
        />
        <a class="href-link" clickable @click="goHome()" style="color: #ffffff">
          <span>
            <q-icon name="fas fa-location-dot" />
            <q-icon name="fas fa-h" size="12px" />
          </span>
          <span>
            <q-icon name="fas fa-f" size="12px" />
          </span>
          <span>
            <q-icon name="fas fa-l" size="12px" />
          </span>
        </a>
        <q-icon
          name="fas fa-circle"
          color="white"
          size="5px"
          style="padding: 0 6px"
        />
        <a class="href-link" clickable @click="goHome()" style="color: #ffffff">
          Health Facility Locator
        </a>
        <q-icon
          name="fas fa-circle"
          color="white"
          size="5px"
          style="padding: 0 6px"
        />
        All Rights Reserved
      </div>
    </div>
  </footer>
</template>

<script>
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "FooterBar",

  setup() {
    return {
      year: ref(new Date().getFullYear()),
    };
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
.footer {
  bottom: 0;
  width: 100%;
  color: #ffffff;
  background-color: #0d1441;
}
.href-link {
  text-decoration: none;
  cursor: pointer;
}
.nav-btn {
  padding: 6px;
  padding-left: 0;
  display: inline-block;
}
.nav-btn a {
  cursor: pointer;
}
.nav-btn a:hover {
  text-decoration: underline;
}
.quick-links,
.copyright {
  width: 100%;
  max-width: 1024px;
  padding: 16px;
  margin: 0 auto;
}

.quick-links {
  padding-top: 48px;
}

.copyright {
  padding-bottom: 42px;
}

@media only screen and (max-width: 575px) {
  .quick-links {
    padding-top: 38px;
  }
}
</style>
