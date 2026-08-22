<template>
  <div class="hero-section text-white q-py-xl q-px-md">
    <div class="hero-content">
      <!-- Left Column: CTA & Info -->
      <div class="hero-left">
        <h1 class="text-h3 text-bold q-mb-lg">{{ heading }}</h1>
        <p class="text-body1 q-mb-lg">
          Locate public and private health facilities in Kenya, check distance and get real-time
          navigation.
        </p>
        <div class="q-mt-xl hero-actions">
          <q-btn
            color="white"
            text-color="black"
            class="q-px-lg q-py-sm"
            rounded
            unelevated
            @click="scrollTo('facilities-near-me')"
          >
            <q-icon name="gps_fixed" size="14px" />
            <span class="q-pl-sm">Facilities Near Me</span>
          </q-btn>
          <q-btn
            color="white"
            class="q-px-lg q-py-sm btn-secondary"
            rounded
            outline
            @click="goTo('about-us')"
          >
            <span class="q-pr-sm">Learn More</span>
            <q-icon name="fas fa-angles-right" size="14px" />
          </q-btn>
        </div>
      </div>

      <!-- Right Column: Interactive Suggested Facility Map -->
      <div class="suggested-facilities">
        <div id="top5mapContainer" class="heromap"></div>

        <!-- Facility Card & Carousel Navigation Controls -->
        <div v-if="currentFacility" class="facility-card q-mt-md q-pa-md">
          <div class="row items-center justify-between q-mb-xs">
            <span class="text-caption text-uppercase text-weight-medium text-grey-4">
              Top {{ totalSuggested }} Facilities in proximity to me
            </span>
            <div class="row q-gutter-xs">
              <q-btn
                icon="chevron_left"
                flat
                round
                dense
                color="white"
                :disabled="totalSuggested <= 1"
                @click="prevFacility"
              />
              <q-btn
                icon="chevron_right"
                flat
                round
                dense
                color="white"
                :disabled="totalSuggested <= 1"
                @click="nextFacility"
              />
            </div>
          </div>

          <q-banner
            v-if="!isLocating && !isLoading && !userLocation"
            dense
            inline-actions
            class="bg-amber-1 text-amber-10 q-mb-sm rounded-borders text-caption"
          >
            <template #avatar>
              <q-icon name="location_off" color="amber-9" size="xs" />
            </template>
            Location disabled — showing top facilities in Kenya - may not be nearest to you.
          </q-banner>

          <div class="text-h6 text-bold text-white ellipsis">
            {{ currentFacility.properties.name }}
          </div>

          <div class="row items-center text-subtitle2 text-grey-3 q-mt-xs">
            <q-icon name="place" size="16px" class="q-mr-xs" />
            <span class="ellipsis col">{{
              currentFacility.properties.address || "Address unavailable"
            }}</span>
          </div>

          <div class="row items-center q-gutter-x-md q-mt-sm">
            <q-chip
              v-if="currentFacility.properties.distance !== undefined"
              dense
              color="primary"
              text-color="white"
              icon="directions_car"
            >
              {{ currentFacility.properties.distance }} km away
            </q-chip>
            <q-chip dense outline color="white">
              {{ currentFacility.properties.isPrivate ? "Private" : "Public" }}
            </q-chip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, onUnmounted, ref, shallowRef } from "vue";
import { Notify } from "quasar";
import { useRouter } from "vue-router";
import { useQuery } from "@tanstack/vue-query";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN } from "../../secrets.config";

// Services
import { getSuggestedFacilities } from "../../services/facility.service";

// Types
import type { FacilityFeature, FacilityGeoJSON } from "../../types/facility.types";

// Utils / Helpers / Constants
import { createPopUp } from "../../utils/helpers";

export default defineComponent({
  name: "HomeHeroSection",

  setup() {
    const router = useRouter();
    const heading = ref<string>("Find Healthcare Facilities Fast");

    // Carousel State
    const currentIndex = ref<number>(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = shallowRef<any>(null);
    const accessToken = ref(MAPBOX_TOKEN);

    // const userLocation = ref<[number, number] | null>([35.30642810318034, 0.5443346870559028]);
    const userLocation = ref<[number, number] | null>(null);
    const isLocating = ref<boolean>(true);

    // GET DEVICE LOCATION
    const locateUser = () => {
      return new Promise<void>((resolve) => {
        if (!navigator.geolocation) {
          Notify.create({ type: "warning", message: "Geolocation not supported by browser." });
          return resolve();
        }

        isLocating.value = true;
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            userLocation.value = [pos.coords.longitude, pos.coords.latitude];
            isLocating.value = false;
            resolve();
          },
          (error) => {
            console.warn("Geolocation warning/error:", error.message);
            isLocating.value = false;
            resolve();
          },
          { enableHighAccuracy: true, timeout: 8000 },
        );
      });
    };

    const {
      data: suggestedFacilities,
      isLoading,
      refetch,
    } = useQuery<FacilityGeoJSON>({
      queryKey: ["suggested-facilities"],
      queryFn: async () => {
        // Resolve device coordinates first
        await locateUser();

        // Fetch facilities
        const response = await getSuggestedFacilities(userLocation.value);

        // IF response.data is the raw array, map it into a GeoJSON FeatureCollection object
        const rawArray = Array.isArray(response.data) ? response.data : response.data?.features;
        const features = rawArray || [];

        // Map property IDs
        const featuresWithIds = features.map((feature: FacilityFeature, index: number) => ({
          ...feature,
          properties: {
            ...feature.properties,
            id: feature.properties?.id ?? index,
            // distance: feature.properties.distance
            //   ? Math.round(feature.properties.distance * 100) / 100
            //   : 0,
          },
        }));

        return {
          type: "FeatureCollection",
          features: featuresWithIds,
        };
      },
      staleTime: Infinity,
      gcTime: 30 * 60 * 1000,
      enabled: false,
      placeholderData: { type: "FeatureCollection", features: [] },
    });

    const totalSuggested = computed(() => suggestedFacilities.value?.features?.length || 0);

    const currentFacility = computed<FacilityFeature | null>(() => {
      if (!suggestedFacilities.value?.features?.length) return null;
      return suggestedFacilities.value.features[currentIndex.value] || null;
    });

    // Carousel Action: Next
    const nextFacility = () => {
      if (totalSuggested.value === 0) return;
      currentIndex.value = (currentIndex.value + 1) % totalSuggested.value;
      selectActiveFacility();
    };

    // Carousel Action: Prev
    const prevFacility = () => {
      if (totalSuggested.value === 0) return;
      currentIndex.value = (currentIndex.value - 1 + totalSuggested.value) % totalSuggested.value;
      selectActiveFacility();
    };

    const selectActiveFacility = () => {
      if (!currentFacility.value || !map.value) return;

      const targetCoords = currentFacility.value.geometry.coordinates;
      flyToFacility(currentFacility.value);

      // if (!userLocation.value) {
      //   createPopUp(currentFacility.value, map);
      // }
      createPopUp(currentFacility.value, map);

      if (userLocation.value) {
        // void drawRoute(targetCoords);
        drawRoute(targetCoords).catch((err) => {
          console.error("Failed to fetch route:", err);
        });
      }
    };

    // Initialize Mapbox Map
    const mapboxMap = (data: FacilityGeoJSON) => {
      mapboxgl.accessToken = accessToken.value;
      if (map.value) return;

      // Default center: Nairobi coordinates if user location is unavailable
      const initialCenter = userLocation.value || [36.81868966807952, -1.2860949419582617];

      map.value = new mapboxgl.Map({
        container: "top5mapContainer",
        style: "mapbox://styles/mapbox/streets-v11",
        center: initialCenter,
        zoom: userLocation.value ? 13 : 12,
        scrollZoom: false,
      });

      map.value.on("load", () => {
        if (!map.value) return;

        // Route Source & Layer
        map.value.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: [] },
          },
        });

        map.value.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#10b981", "line-width": 5, "line-opacity": 0.9 },
        });

        // Add User Location Marker
        if (userLocation.value) {
          const userEl = document.createElement("div");
          userEl.className = "user-location-marker";
          new mapboxgl.Marker(userEl).setLngLat(userLocation.value).addTo(map.value);
        }

        const nav = new mapboxgl.NavigationControl();
        map.value.addControl(nav, "top-right");

        addMarkers(data);

        // Auto-select initial active facility route once map loads
        selectActiveFacility();
      });
    };

    const addMarkers = (data: FacilityGeoJSON) => {
      if (!map.value) return;

      data.features.forEach((marker, index) => {
        const el = document.createElement("div");
        el.id = `marker-${marker.properties.id}`;
        el.className = "marker";

        // el.style.width = "24px";
        // el.style.height = "24px";
        // el.style.border = "none";
        // el.style.backgroundImage = "url('./src/assets/hospital_icon_24_red.png')";

        new mapboxgl.Marker(el, { offset: [0, -23] })
          .setLngLat(marker.geometry.coordinates)
          .addTo(map.value);

        const getActiveFeature = (): FacilityFeature => {
          const found = suggestedFacilities.value?.features.find(
            (f) => f.properties.id === marker.properties.id,
          );
          return found || marker;
        };

        // Click Marker: Sync carousel index & draw route
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          currentIndex.value = index;
          selectActiveFacility();
        });

        // Hover Popup
        el.addEventListener("mouseover", (e) => {
          e.stopPropagation();
          createPopUp(getActiveFeature(), map);
        });

        // el.addEventListener("mouseleave", () => {
        //   const popUps = document.getElementsByClassName("mapboxgl-popup");
        //   if (popUps[0]) {
        //     popUps[0].remove();
        //   }
        // });

        el.addEventListener("mouseleave", () => {
          // Query popups specifically inside the HeroSection map container (#top5mapContainer)
          const mapContainer = document.getElementById("top5mapContainer");
          if (mapContainer) {
            const popUps = mapContainer.getElementsByClassName("mapboxgl-popup");
            Array.from(popUps).forEach((popup) => popup.remove());
          }
        });
      });
    };

    const flyToFacility = (currentFeature: FacilityFeature) => {
      map.value?.flyTo({
        center: currentFeature.geometry.coordinates,
        zoom: 13,
      });
    };

    const drawRoute = async (destinationLngLat: [number, number]) => {
      if (!userLocation.value || !map.value) return;

      try {
        const query = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation.value[0]},${userLocation.value[1]};${destinationLngLat[0]},${destinationLngLat[1]}?steps=true&geometries=geojson&access_token=${accessToken.value}`,
        );
        const json = await query.json();
        const routeData = json.routes[0]?.geometry;

        if (routeData && map.value.getSource("route")) {
          map.value.getSource("route").setData({
            type: "Feature",
            properties: {},
            geometry: routeData,
          });

          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend(userLocation.value);
          bounds.extend(destinationLngLat);
          map.value.fitBounds(bounds, { padding: 50 });
        }
      } catch (err) {
        console.error("Failed to fetch route:", err);
      }
    };

    const scrollTo = (refName: string): void => {
      void router.push({ name: "home", hash: `#${refName}` });
    };

    const goTo = (route: string): void => {
      void router.push(route);
    };

    onMounted(async () => {
      try {
        // Force the API to fetch data and wait for it to finish completely
        const result = await refetch();

        // Ensure data came back safely and the DOM container exists
        if (result.data && result.data.features?.length > 0) {
          await nextTick();
          mapboxMap(result.data);
        }
      } catch (error) {
        console.error("Failed mounting HeroSection:", error);
        Notify.create({
          type: "negative",
          message: "Unable to load suggested facilities.",
          group: false,
          timeout: 5000,
        });
      }
    });

    onUnmounted(() => {
      map.value?.remove();
    });

    return {
      heading,
      currentIndex,
      totalSuggested,
      currentFacility,
      nextFacility,
      prevFacility,
      userLocation,
      isLoading,
      isLocating,
      scrollTo,
      goTo,
    };
  },
});
</script>

<style lang="scss" scoped>
.hero-section {
  background: linear-gradient(135deg, #0d1441 0%, #2233a1 100%);
  padding: 24px;
  min-height: 87vh;

  .hero-content {
    width: 100%;
    max-width: 1172px;
    margin: 0 auto;
    padding-top: 64px;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .hero-left {
    width: 48%;
    max-width: 48%;

    .hero-actions {
      display: flex;
      flex-direction: column;
      gap: 16px;

      @media (min-width: 600px) {
        flex-direction: row;
        align-items: center;
        gap: 24px;
      }
    }
  }

  .suggested-facilities {
    width: 48%;
    max-width: 48%;

    .heromap {
      width: 100%;
      height: 320px;
      border-radius: 16px !important;
      // overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }

    .facility-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
    }
  }
}

@media only screen and (max-width: 768px) {
  .hero-section {
    padding: 18px;

    .hero-content {
      padding-top: 24px;
      flex-direction: column;
      gap: 32px;
    }

    .hero-left,
    .suggested-facilities {
      width: 100%;
      max-width: 100%;
    }

    .suggested-facilities .heromap {
      height: 260px;
    }
  }
}
</style>
