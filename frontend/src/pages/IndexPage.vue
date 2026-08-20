<template>
  <q-page class="column q-pb-xl">
    <!-- LANDING PAGE HERO SECTION -->
    <div class="hero-section text-white q-py-xl q-px-md text-center">
      <div class="hero-content">
        <h1 class="text-h3 text-bold q-mb-sm">Find Nearby Healthcare Services Fast</h1>
        <p class="text-subtitle1 q-mb-lg">
          Locate public and private health facilities around Nairobi, check distance, and get
          real-time navigation.
        </p>
        <q-btn
          color="secondary"
          icon="my_location"
          :loading="isLocating"
          label="Locate Near Me"
          class="q-px-lg q-py-xs"
          rounded
          unelevated
          @click="locateUser"
        />
      </div>
    </div>

    <div class="main-page q-pa-md q-mt-sm">
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-h5 page-header q-mb-none">Health Facility Locator</div>
        <q-badge v-if="userLocation" color="positive" class="q-pa-xs">
          <q-icon name="gps_fixed" class="q-mr-xs" /> Sorting by proximity to your position
        </q-badge>
      </div>

      <div class="info">
        <q-icon name="fas fa-circle-info" size="16px" style="padding-right: 4px" />
        Click on any facility or map marker to draw a route from your location.
      </div>
      <q-separator spaced />

      <div class="section">
        <div class="side-content">
          <div class="side-header">
            <h1>Facilities ({{ facilities?.features?.length || 0 }})</h1>
          </div>
          <div v-if="isLoading" class="loading-overlay q-pa-md">Loading facilities...</div>
          <div v-if="!isLoading && facilities" id="listings" class="listings">
            <div
              v-for="facility in facilities.features"
              :key="facility.properties.id"
              :id="'listing-' + facility.properties.id"
              class="item"
              :class="{ active: selectedFacility === facility.properties.id }"
              @click="showFacility(facility.properties.id ?? 0)"
            >
              <a
                href="#"
                :id="'link-' + facility.properties.id"
                class="title"
                :class="{ active: selectedFacility === facility.properties.id }"
              >
                {{ facility.properties.name }}
              </a>
              <div>
                <span>{{ facility.properties.address }}</span>
                <q-icon name="fas fa-circle" size="3px" style="padding: 0 6px" />
                <span v-if="facility.properties.isPrivate" class="muted">Private</span>
                <span v-else class="muted">Public</span>
                <q-icon name="fas fa-circle" size="3px" style="padding: 0 6px" />
                <span v-if="facility.properties.type === 'Hospital'" class="muted">Hospital</span>
                <span v-else class="muted">Health Centre</span>
              </div>
              <div v-if="facility.properties.phone || facility.properties.email">
                <span v-if="facility.properties.phone">
                  <q-icon
                    name="fas fa-phone"
                    class="muted"
                    size="12px"
                    style="padding-right: 2px"
                  />
                  {{ facility.properties.phone }}
                </span>
                <q-icon
                  name="fas fa-circle"
                  size="3px"
                  style="padding: 0 8px"
                  v-if="facility.properties.phone && facility.properties.email"
                />
                <a
                  :href="`mailto:${facility.properties.email}`"
                  class="email"
                  v-if="facility.properties.email"
                  @click.stop
                >
                  {{ facility.properties.email }}
                </a>
              </div>
              <div
                class="text-primary text-bold q-mt-xs"
                v-if="facility.properties.distance !== undefined"
              >
                <q-icon name="directions_car" size="14px" />
                {{ facility.properties.distance }} km away
              </div>
            </div>
          </div>
        </div>
        <div class="map-locations">
          <div id="mapContainer" class="basemap"></div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onUnmounted, shallowRef, onMounted, nextTick, computed } from "vue";
import { Notify } from "quasar";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import distance from "@turf/distance";
import { point } from "@turf/helpers";
import { useQuery } from "@tanstack/vue-query";
import { MAPBOX_TOKEN } from "../secrets.config";

// Services
import { getFacilities } from "../services/facility.service";

// Types
import type { FacilityFeature, FacilityGeoJSON } from "../types/facility.types";
// import type { FacilityFeature, FacilityGeoJSON } from "src/types/facility.types";

export default defineComponent({
  name: "IndexPage",

  setup() {
    const accessToken = ref(MAPBOX_TOKEN);
    const selectedFacility = ref<number | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = shallowRef<any>(null);
    const userLocation = ref<[number, number] | null>(null);
    const isLocating = ref<boolean>(false);

    const {
      data: rawFacilities,
      isLoading,
      refetch,
    } = useQuery<FacilityGeoJSON>({
      queryKey: ["facilities"],
      queryFn: async () => {
        const response = await getFacilities();

        // IF response.data is the raw array, map it into a GeoJSON FeatureCollection object
        const rawArray = Array.isArray(response.data) ? response.data : response.data.features;

        const features = rawArray || []; // Fallback to empty array if something goes wrong

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
      enabled: false, // <-- Crucial: Stops Vue Query from firing automatically on setup
      placeholderData: { type: "FeatureCollection", features: [] },
    });

    // Reactive list: computes distance dynamically and sorts by nearest
    const facilities = computed<FacilityGeoJSON>(() => {
      const baseFeatures = rawFacilities.value?.features || [];

      if (!userLocation.value) {
        return {
          type: "FeatureCollection",
          features: baseFeatures,
        };
      }

      const userPt = point(userLocation.value);

      const calculatedFeatures = baseFeatures.map((facility) => {
        const facilityPt = point(facility.geometry.coordinates);
        const distKm = distance(userPt, facilityPt, { units: "kilometers" });

        return {
          ...facility,
          properties: {
            ...facility.properties,
            distance: Math.round(distKm * 10) / 10, // Round to 1 decimal place (e.g. 2.4 km)
          },
        };
      });

      // Sort closest to furthest
      calculatedFeatures.sort(
        (a, b) => (a.properties.distance ?? Infinity) - (b.properties.distance ?? Infinity),
      );

      return {
        type: "FeatureCollection",
        features: calculatedFeatures,
      };
    });

    // GET DEVICE LOCATION & SORT FACILITIES BY TURF DISTANCE
    const locateUser = () => {
      return new Promise<void>((resolve) => {
        if (!navigator.geolocation) {
          Notify.create({ type: "warning", message: "Geolocation not supported by browser." });
          return resolve();
        }

        isLocating.value = true;
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            // Setting this triggers the `facilities` computed property automatically
            userLocation.value = [pos.coords.longitude, pos.coords.latitude];
            isLocating.value = false;
            resolve();
          },
          (error) => {
            console.warn("Geolocation error:", error.message);
            isLocating.value = false;
            resolve();
          },
          { enableHighAccuracy: true, timeout: 8000 },
        );
      });
    };

    // const locateUserAndSort = () => {
    //   return new Promise<void>((resolve) => {
    //     if (!navigator.geolocation) {
    //       Notify.create({ type: "warning", message: "Geolocation not supported by browser." });
    //       return resolve();
    //     }

    //     isLocating.value = true;
    //     navigator.geolocation.getCurrentPosition(
    //       (pos) => {
    //         const userLngLat: [number, number] = [pos.coords.longitude, pos.coords.latitude];
    //         userLocation.value = userLngLat;

    //         if (facilities.value?.features) {
    //           const fromPoint = point(userLngLat);

    //           // Deep clone or map features to create mutable objects
    //           const updatedFeatures = facilities.value.features.map((facility) => {
    //             const toPoint = point(facility.geometry.coordinates);
    //             const distKm = distance(fromPoint, toPoint, { units: "kilometers" });

    //             return {
    //               ...facility,
    //               properties: {
    //                 ...facility.properties,
    //                 distance: Math.round(distKm * 10) / 10,
    //               },
    //             };
    //           });

    //           // Sort ascending: closest facilities first
    //           updatedFeatures.sort((a, b) => {
    //             return (a.properties.distance || 0) - (b.properties.distance || 0);
    //           });

    //           // Replace the features array with the new sorted array
    //           facilities.value = {
    //             ...facilities.value,
    //             features: updatedFeatures,
    //           };
    //         }

    //         isLocating.value = false;
    //         resolve();
    //       },
    //       (error) => {
    //         console.warn("Geolocation error:", error.message);
    //         isLocating.value = false;
    //         resolve(); // Fallback gracefully if permission denied
    //       },
    //       { enableHighAccuracy: true, timeout: 8000 },
    //     );
    //   });
    // };

    // MAPBOX CORE LOGIC
    const mapboxMap = (data: FacilityGeoJSON) => {
      mapboxgl.accessToken = accessToken.value;

      /* Assign a unique ID to each facility & sanitize distances */
      // data.features.forEach((facility, i) => {
      //   facility.properties.id = i;
      //   if (facility.properties.distance) {
      //     facility.properties.distance = Math.round(facility.properties.distance * 100) / 100;
      //   }
      // });

      if (map.value) return;

      // Center on user location if available, otherwise default to Nairobi CBD
      const initialCenter = userLocation.value || [36.81868966807952, -1.2860949419582617];

      map.value = new mapboxgl.Map({
        container: "mapContainer",
        style: "mapbox://styles/mapbox/streets-v11",
        center: initialCenter,
        zoom: userLocation.value ? 13 : 12,
        scrollZoom: true,
      });

      map.value.on("load", () => {
        if (!map.value) return;

        // Add source for the route line
        map.value.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: [] },
          },
        });

        // Add layer for displaying the route line
        map.value.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#0d1441", "line-width": 5, "line-opacity": 0.8 },
        });

        // Add User Pulse Location Marker if geolocated
        if (userLocation.value) {
          const userEl = document.createElement("div");
          userEl.className = "user-location-marker";
          new mapboxgl.Marker(userEl).setLngLat(userLocation.value).addTo(map.value);
        }

        const nav = new mapboxgl.NavigationControl();
        map.value.addControl(nav, "top-right");

        addMarkers(data);
      });
    };

    // FETCH AND DRAW MAPBOX ROUTE LINE
    const drawRoute = async (destinationLngLat: [number, number]) => {
      if (!userLocation.value || !map.value) return;

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

        // Fit map bounds to view both user location and facility
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend(userLocation.value);
        bounds.extend(destinationLngLat);
        map.value.fitBounds(bounds, { padding: 60 });
      }
    };

    const showFacility = (facilityId: number) => {
      selectedFacility.value = facilityId;
      facilities.value?.features.forEach((facility) => {
        if (facility.properties.id === selectedFacility.value) {
          flyToFacility(facility);
          // createPopUp(facility);
          if (userLocation.value) {
            // void drawRoute(facility.geometry.coordinates);

            // Alternative
            drawRoute(facility.geometry.coordinates).catch((err) => {
              console.error("Failed to fetch route:", err);
            });
          }
        }
      });
    };

    const addMarkers = (data: FacilityGeoJSON) => {
      if (!map.value) return;

      data.features.forEach((marker) => {
        const el = document.createElement("div");
        el.id = `marker-${marker.properties.id}`;
        el.className = "marker";

        new mapboxgl.Marker(el, { offset: [0, -23] })
          .setLngLat(marker.geometry.coordinates)
          .addTo(map.value);

        // Get feature with updated distance from computed facilities
        const getActiveFeature = (): FacilityFeature => {
          const found = facilities.value?.features.find(
            (f) => f.properties.id === marker.properties.id,
          );
          return found || marker;
        };

        // Center map, draw route, and highlight selection (NO POPUP)
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          const activeFeature = getActiveFeature();

          flyToFacility(activeFeature);
          // createPopUp(activeFeature);
          selectedFacility.value = activeFeature.properties.id ?? null;

          if (userLocation.value) {
            // void drawRoute(activeFeature.geometry.coordinates);

            // Alternative
            drawRoute(activeFeature.geometry.coordinates).catch((err) => {
              console.error("Failed to fetch route:", err);
            });
          }
        });

        // Show popup with facility distance ONLY on hover
        el.addEventListener("mouseover", (e) => {
          e.stopPropagation();
          const activeFeature = getActiveFeature();
          createPopUp(activeFeature);
        });

        // Remove popup when mouse moves away
        el.addEventListener("mouseleave", () => {
          const popUps = document.getElementsByClassName("mapboxgl-popup");
          if (popUps[0]) {
            popUps[0].remove();
          }
        });
      });
    };

    // const onMapClick = (event: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
    //   if (!map.value) return;

    //   const features = map.value.queryRenderedFeatures(event.point, {
    //     layers: ["locations"],
    //   });

    //   if (!features.length) return;

    //   const clickedPoint = features[0] as unknown as FacilityFeature;

    //   flyToFacility(clickedPoint);
    //   createPopUp(clickedPoint);
    //   selectedFacility.value = clickedPoint.properties.id ?? null;
    // };

    const flyToFacility = (currentFeature: FacilityFeature) => {
      map.value?.flyTo({
        center: currentFeature.geometry.coordinates,
        zoom: 13,
      });
    };

    const createPopUp = (currentFeature: FacilityFeature) => {
      if (!map.value) return;

      // Clear existing popups to prevent duplicates
      const popUps = document.getElementsByClassName("mapboxgl-popup");
      if (popUps[0]) popUps[0].remove();

      const distText =
        currentFeature.properties.distance !== undefined
          ? `<p style="padding: 4px 10px 0 4px; color: #0d1441; font-weight: bold;">
          <i class="fas fa-car"></i> ${currentFeature.properties.distance} km away
         </p>`
          : "";

      new mapboxgl.Popup({ closeOnClick: false, offset: 10 })
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML(
          `<h3>${currentFeature.properties.name}</h3>
       <h4>${currentFeature.properties.address}</h4>
       ${distText}`,
        )
        .addTo(map.value);
    };

    onMounted(async () => {
      try {
        // Force the API to fetch data and wait for it to finish completely
        const result = await refetch();

        // Ensure data came back safely and the DOM container exists
        if (result.data && result.data.features?.length > 0) {
          await locateUser();
          await nextTick();
          mapboxMap(result.data);
        }
      } catch (error) {
        console.error(error);
        Notify.create({
          type: "negative",
          message: "CONNECTION REFUSED.",
          group: false,
          timeout: 5000,
        });
      }
    });

    // REACTIVE MOUNT LIFECYCLE
    // Replaces mounted(). Wait until both Vue Query has the facilities data
    // AND the DOM container element reference is populated before loading the map.
    // watch(
    //   [facilities, mapContainer],
    //   ([newFacilities, container]) => {
    //     if (newFacilities && newFacilities?.features?.length > 0 && container) {
    //       mapboxMap(newFacilities);
    //     }
    //   },
    //   { immediate: true },
    // );

    // Memory safety cleanup
    onUnmounted(() => {
      map.value?.remove();
    });

    return {
      accessToken,
      selectedFacility,
      facilities,
      isLoading,
      isLocating,
      userLocation,
      showFacility,
      locateUser,
    };
  },
});
</script>

<style lang="scss" scoped>
.main-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 32px;

  box-sizing: border-box;
  color: #404040;
  font:
    400 15px/22px "Source Sans Pro",
    "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
}
.page-header {
  margin: 0 0 24px 12px;
}
.info {
  color: #6c757d;
  margin-left: 12px;
}

.hero-section {
  background: linear-gradient(135deg, #0d1441 0%, #2233a1 100%);
  border-radius: 0 0 16px 16px;
  .hero-content {
    max-width: 800px;
    margin: 0 auto;
  }
}

:deep(.user-location-marker) {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #007cbf;
  border: 3px solid #ffffff;
  box-shadow: 0 0 10px rgba(0, 124, 191, 0.8);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 124, 191, 0.7);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(0, 124, 191, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 124, 191, 0);
  }
}

.section {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.side-content {
  width: 33.3333%;
  max-width: 33.3333%;
  height: 75vh;
  // margin-right: 24px;
  align-content: center;
  flex-grow: 1;

  overflow: hidden;
  border-right: 1px solid rgba(0, 0, 0, 0.25);
}
.side-header {
  background: #fff;
  border-bottom: 1px solid #eee;
  height: 60px;
  line-height: 60px;
  padding: 0 10px;

  h1 {
    font-size: 22px;
    margin: 0;
    font-weight: 400;
    line-height: 20px;
    padding: 20px 2px;
  }
}

a {
  color: #404040;
  text-decoration: none;
}

a:hover {
  color: #101010;
}

.listings {
  height: 100%;
  overflow: auto;
  overflow-y: scroll;
  padding-bottom: 60px;
}

.listings .item {
  border-bottom: 1px solid #eee;
  padding: 10px;
  text-decoration: none;
  cursor: pointer;
}

.listings .item:last-child {
  border-bottom: none;
}

.listings .item .title {
  display: block;
  color: #0d1441;
  font-weight: 700;
}

.listings .item .title small {
  font-weight: 400;
}

.listings .item .active,
.listings .item .title:hover {
  color: rgba(13, 20, 65, 0.7);
}

.listings .active {
  background-color: #f8f8f8;
}

::-webkit-scrollbar {
  width: 3px;
  height: 3px;
  border-left: 0;
  background: rgba(0, 0, 0, 0.1);
}

::-webkit-scrollbar-track {
  background: none;
}

::-webkit-scrollbar-thumb {
  background: #0d1441;
  border-radius: 0;
}

.map-locations {
  width: 66.6666%;
  max-width: 66.6666%;
  height: 75vh;

  .basemap {
    width: 100%;
    height: 100%;
  }
}

.muted {
  color: #6c757d;
}

.email {
  color: #2233a1;
  text-decoration: none;
}
.email:hover {
  color: #2233a1;
}

@media only screen and (max-width: 600px) {
  .page-header,
  .info {
    margin: 0;
  }
  .section {
    flex-direction: column;
    text-align: center;
  }
  .side-content {
    width: 100%;
    max-width: 100%;
    height: fit-content;
    text-align: left;
    margin-bottom: 48px;
  }
  .map-locations {
    width: 100%;
    max-width: 100%;
    height: 50vh;
  }
}
</style>
