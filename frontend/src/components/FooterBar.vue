<template>
  <footer id="footer" class="footer">
    <div class="quick-links">
      <div class="q-mt-lg">
        <a class="logo-link cursor-pointer" @click="goHome()">
          <img
            src="../assets/hospital_icon_24_red.png"
            alt="HealthFacilityLocator logo"
            class="logo-img"
          />
          <span class="logo-text"> HealthFacility<span class="text-negative">Locator</span> </span>
        </a>
      </div>

      <!-- <div class="text-h5">Quick Links</div> -->
      <div class="nav-btn">
        <a class="q-pr-sm" clickable @click="goHome()">Home</a>
      </div>
      <div class="nav-btn">
        <a class="q-pr-sm" clickable @click="goTo('/facilities')">Facilities</a>
      </div>
      <div class="nav-btn">
        <a class="q-pr-sm" clickable @click="goTo('/about-us')">About Us</a>
      </div>
      <div class="nav-btn">
        <a class="q-pr-sm" clickable @click="goTo('/help')"> Help </a>
      </div>

      <br />
      <div class="nav-btn">
        <a
          target="_blank"
          class="href-link attribution"
          href="https://icons8.com/icon/5558/hospital-3"
        >
          Hospital Map Marker
        </a>
        <span class="q-px-sm">Icon by </span>
        <a target="_blank" class="href-link attribution" href="https://icons8.com"> Icons8 </a>
      </div>
    </div>

    <div class="copyright q-pt-lg">
      <q-separator spaced color="white" />
      <div class="q-mt-md">
        &copy;
        {{ year }}
        <q-icon name="fas fa-circle" color="white" size="5px" style="padding: 0 6px" />
        All Rights Reserved
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "FooterBar",

  setup() {
    const router = useRouter();
    const year = ref<number>(new Date().getFullYear());

    // Methods
    const goHome = async () => {
      await router.push("/");
    };

    const goTo = async (route: string) => {
      await router.push(route);
    };

    return {
      year,

      goHome,
      goTo,
    };
  },
});
</script>

<style lang="scss" scoped>
.footer {
  bottom: 0;
  width: 100%;
  color: #ffffff;
  background-color: #0d1441;
  padding-bottom: 48px;
}
.logo-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: inherit;
  user-select: none;
  margin-bottom: 48px;
}

.logo-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  display: block;
}

.logo-text {
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: -0.2px;
  line-height: 1;
}
.href-link {
  text-decoration: none;
  cursor: pointer;
}
.attribution {
  color: #ffffff;
  text-decoration: underline;
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
  max-width: 1200px;
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
