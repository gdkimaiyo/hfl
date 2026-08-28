<!-- FacilitiesNearMe.vue -->
<template>
  <div id="facilities-near-me" class="main-page">
    <!-- Initial Loading State ONLY (First mount) -->
    <q-spinner v-if="(isLocating && !map) || (isLoading && !map)" color="primary" size="3em" />

    <!--
      Error Banner UI
      TODO 1. Redesign UI
    -->

    <q-banner
      v-else-if="fetchFacilitiesError"
      class="bg-negative text-white q-mb-md rounded-borders"
    >
      <template #avatar>
        <q-icon name="signal_wifi_off" color="white" />
      </template>
      {{ getErrorMessage(fetchFacilitiesError) }}
      <template #action>
        <q-btn flat color="white" label="Try Again" @click="refetch()" />
      </template>
    </q-banner>

    <div v-else>
      <div class="text-h4 text-bold page-header q-mb-none">Facilities Near Me</div>
      <div v-if="userLocation" class="filters q-mx-sm q-my-lg">
        <!-- Default / All Button -->
        <!-- <q-btn
          flat
          rounded
          no-caps
          class="filter-btn"
          :class="{ selected: selectedFilterRadius === 15 }"
          label="All (15 km)"
          @click="showAll"
        >
          <q-tooltip class="filter-tooltip" :offset="[0, 8]">
            <span
              >{{ selectedFilterRadius === 15 ? "Showing" : "Show" }} facilities within 15 km</span
            >
          </q-tooltip>
        </q-btn> -->

        <!-- Dynamic Radius Buttons -->
        <q-btn
          flat
          rounded
          no-caps
          v-for="dist in distance"
          :key="'filter-radius-' + dist.radius + 'km-' + dist.id"
          class="filter-btn"
          :class="{
            selected: selectedFilterRadius === dist.radius,
            'is-empty': getFacilityCountForRadius(dist.radius) === 0 && dist.radius <= 15,
          }"
          :label="dist.radius + ' km'"
          @click="handleRadiusFilter(dist.radius)"
        >
          <q-tooltip class="filter-tooltip" :offset="[0, 8]">
            <!-- Zero facilities warning -->
            <!-- <div
            v-if="getFacilityCountForRadius(dist.radius) === 0 && dist.radius <= 15"
            class="column items-center text-warning"
            >
            <span>No facilities within {{ dist.radius }} km</span>
            <span class="tooltip-badge q-mt-xs bg-warning text-dark">0 Results</span>
          </div> -->

            <!-- Zero facilities -->
            <span v-if="getFacilityCountForRadius(dist.radius) === 0 && dist.radius <= 15">
              No facilities within {{ dist.radius }} km
            </span>

            <!-- Active state -->
            <span v-else-if="selectedFilterRadius === dist.radius">
              Showing facilities within {{ dist.radius }} km
            </span>

            <!-- In-Memory Filter state (1 - 15 km) -->
            <span v-else-if="dist.radius <= 15">
              Show {{ getFacilityCountForRadius(dist.radius) }} facilities within
              {{ dist.radius }} km
            </span>

            <!-- Extended API Refetch state (25 km & 50 km) -->
            <div v-else class="column items-center">
              <span>Expand search to {{ dist.radius }} km</span>
              <span class="tooltip-badge q-mt-xs">
                <q-icon name="sync" size="10px" class="q-mr-xs" />Fetches wider area data
              </span>
            </div>
          </q-tooltip>
        </q-btn>

        <!-- <q-badge v-if="userLocation" color="primary" class="q-pa-xs q-ma-md">
          <q-icon name="gps_fixed" class="q-mr-xs" /> Sorting by proximity to your location
        </q-badge> -->
      </div>

      <div v-else q-mx-sm q-my-lg>
        <q-banner
          v-if="!isLocating"
          dense
          inline-actions
          class="bg-amber-1 text-amber-10 q-mb-sm rounded-borders text-caption"
        >
          <template #avatar>
            <q-icon name="location_off" color="amber-9" size="xs" />
          </template>
          Location disabled — showing top facilities in Kenya - may not be nearest to you.
        </q-banner>
      </div>

      <div class="info q-mx-sm">
        <q-icon name="fas fa-circle-info" size="16px" style="padding-right: 4px" />
        Click on any facility or map marker to draw a route from your location.
      </div>
      <q-separator spaced />

      <div class="section">
        <div class="side-content">
          <div class="side-header">
            <h1>Facilities ({{ displayedFacilities.length }})</h1>
          </div>

          <!-- Show inline overlay indicator during 25km/50km refetching instead of unmounting whole section -->
          <div v-if="isFetching" class="q-pa-md text-caption text-primary">
            <q-spinner size="1em" class="q-mr-xs" /> Updating facilities distance boundary...
          </div>

          <div id="listings" class="listings">
            <div
              v-for="facility in displayedFacilities"
              :key="facility.properties.id"
              :id="'listing-' + facility.properties.id"
              class="item"
              :class="{ active: selectedFacility === facility.properties.id }"
              @click="showFacility(facility.properties.id ?? 0)"
              @mouseenter="hoverFacility(facility.properties.id ?? 0)"
              @mouseleave="clearFacilityHover"
            >
              <div
                :id="'link-' + facility.properties.id"
                class="title"
                :class="{ active: selectedFacility === facility.properties.id }"
              >
                {{ facility.properties.name }}
              </div>
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
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onUnmounted,
  shallowRef,
  onMounted,
  nextTick,
  watch,
} from "vue";
import { Notify } from "quasar";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useQuery } from "@tanstack/vue-query";
// Axios
import { AxiosError } from "axios";

import { MAPBOX_TOKEN } from "../../secrets.config";

// Services
import { getFacilitiesNearMe } from "../../services/facility.service";

// Types
import type { Distance, FacilityFeature, FacilityGeoJSON } from "../../types/facility.types";
// import type { FacilityFeature, FacilityGeoJSON } from "src/types/facility.types";

// Utils / Constants
import { createPopUp } from "../../utils/helpers";
import { DISTANCE } from "../../utils/constants";

export default defineComponent({
  name: "FacilitiesNearMe",

  setup() {
    const accessToken = ref(MAPBOX_TOKEN);
    const selectedFacility = ref<number | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = shallowRef<any>(null);
    const markersRef = shallowRef<mapboxgl.Marker[]>([]);
    const userLocation = ref<[number, number] | null>(null);
    const isLocating = ref<boolean>(true);

    // API Distance Radius state (Defaults to 15km)
    const apiQueryRadius = ref<number>(15);
    // Active UI filter state (Defaults to 1km)
    const selectedFilterRadius = ref<number>(1);

    const distance = ref<Distance[]>(DISTANCE);
    const hoveredFacilityId = ref<number | null>(null);

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
            console.warn("Geolocation error:", error.message);
            isLocating.value = false;
            resolve();
          },
          { enableHighAccuracy: true, timeout: 8000 },
        );
      });
    };

    // VUE QUERY - Dependent on apiQueryRadius
    const {
      data: rawFacilities,
      isLoading,
      isFetching,
      refetch,
      error: fetchFacilitiesError,
    } = useQuery<FacilityGeoJSON>({
      queryKey: ["facilities-near-me", apiQueryRadius],
      queryFn: async () => {
        const response = await getFacilitiesNearMe(userLocation.value, apiQueryRadius.value);

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
      staleTime: Infinity,
      gcTime: 30 * 60 * 1000,
      enabled: false,
      placeholderData: { type: "FeatureCollection", features: [] },
    });

    // COMPUTED IN-MEMORY FILTERED LIST
    const displayedFacilities = computed<FacilityFeature[]>(() => {
      const allFeatures = rawFacilities.value?.features || [];

      // Filter in-memory based on selected filter radius
      return allFeatures.filter((facility) => {
        if (facility.properties.distance === undefined) return true;
        return facility.properties.distance <= selectedFilterRadius.value;
      });
    });

    // FILTER HANDLERS
    const showAll = () => {
      selectedFilterRadius.value = 15;
      if (apiQueryRadius.value < 15) {
        apiQueryRadius.value = 15;
        void refetch();
      }
    };

    const handleRadiusFilter = async (radius: number) => {
      if (getFacilityCountForRadius(radius) === 0) return;

      selectedFilterRadius.value = radius;

      // Fetch wider boundaries if requested radius exceeds current cache threshold
      if (radius > apiQueryRadius.value) {
        apiQueryRadius.value = radius;

        try {
          await refetch();
        } catch (error) {
          console.error("Failed to get facilities in the expanded boundary: ", error);
          Notify.create({
            type: "negative",
            message: "Unable to load facilities in the expanded radius",
            timeout: 5000,
          });
        }
      }
    };

    // MAP INTERACTION
    const showFacility = (facilityId: number) => {
      selectedFacility.value = facilityId;

      const targetFacility = displayedFacilities.value.find(
        (facility) => facility.properties.id === facilityId,
      );

      if (!targetFacility) return;

      flyToFacility(targetFacility);
      createPopUp(targetFacility, map);

      if (userLocation.value) {
        // void drawRoute(facility.geometry.coordinates);
        // Alternative
        drawRoute(targetFacility.geometry.coordinates).catch((err) => {
          console.error("Failed to fetch route:", err);
        });
      }
    };

    // Triggered when a user hovers over a facility item in the list.
    // Displays the map popup and focuses the facility without drawing routes.
    const hoverFacility = (facilityId: number) => {
      if (hoveredFacilityId.value === facilityId) return;

      hoveredFacilityId.value = facilityId;

      const targetFacility = displayedFacilities.value.find(
        (facility) => facility.properties.id === facilityId,
      );

      if (targetFacility) {
        createPopUp(targetFacility, map);
        flyToFacility(targetFacility);
      }
    };

    //  Clears hover state when mouse leaves the facility item.
    const clearFacilityHover = () => {
      hoveredFacilityId.value = null;
      const mapContainer = document.getElementById("mapContainer");
      if (mapContainer) {
        const popUps = mapContainer.getElementsByClassName("mapboxgl-popup");
        Array.from(popUps).forEach((popup) => popup.remove());
      }
    };

    // MAPBOX INITIALIZATION
    const mapboxMap = (data: FacilityFeature[]) => {
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

        if (userLocation.value) fitMapToVisibleFacilities(data);
        addMarkers(data);
      });
    };

    // RENDER / RE-RENDER MARKERS ON FILTER CHANGES
    const addMarkers = (features: FacilityFeature[]) => {
      if (!map.value) return;

      // Remove active markers from Mapbox map instance & clear array
      markersRef.value.forEach((marker) => marker.remove());
      const newMarkers: mapboxgl.Marker[] = [];

      features.forEach((marker) => {
        const el = document.createElement("div");
        el.id = `marker-${marker.properties.id}`;
        el.className = "marker";

        const markerInstance = new mapboxgl.Marker(el, { offset: [0, -23] })
          .setLngLat(marker.geometry.coordinates)
          .addTo(map.value);

        // Track new marker instance
        newMarkers.push(markerInstance);

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          flyToFacility(marker);
          selectedFacility.value = marker.properties.id ?? null;

          if (userLocation.value) {
            // void drawRoute(marker.geometry.coordinates);

            // Alternative
            drawRoute(marker.geometry.coordinates).catch((err) => {
              console.error("Failed to fetch route:", err);
            });
          }
        });

        el.addEventListener("mouseover", (e) => {
          e.stopPropagation();
          createPopUp(marker, map);
        });

        el.addEventListener("mouseleave", () => {
          const mapContainer = document.getElementById("mapContainer");
          if (mapContainer) {
            const popUps = mapContainer.getElementsByClassName("mapboxgl-popup");
            Array.from(popUps).forEach((popup) => popup.remove());
          }
        });
      });

      // Update reference array
      markersRef.value = newMarkers;
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

    // Fit map viewport around all currently rendered/displayed facilities
    const fitMapToVisibleFacilities = (features: FacilityFeature[]) => {
      if (!map.value || features.length === 0) return;

      const bounds = new mapboxgl.LngLatBounds();

      // Always include user location in bounds calculation if present
      if (userLocation.value) {
        bounds.extend(userLocation.value);
      }

      // Extend bounds to encompass every visible facility marker
      features.forEach((facility) => {
        bounds.extend(facility.geometry.coordinates);
      });

      map.value.fitBounds(bounds, {
        padding: { top: 70, bottom: 70, left: 70, right: 70 },
        maxZoom: 14, // Prevents over-zooming when only 1 facility exists close to user
        duration: 1000, // Smooth 1-second transition animation
      });
    };

    // HELPER FUNCTIONS
    const getFacilityCountForRadius = (radius: number): number => {
      const allFeatures = rawFacilities.value?.features || [];
      return allFeatures.filter((facility) => {
        if (facility.properties.distance === undefined) return false;
        return facility.properties.distance <= radius;
      }).length;
    };

    const getErrorMessage = (err: unknown): string => {
      if (err instanceof AxiosError) {
        if (err.code === "ERR_NETWORK" || err.code === "ERR_CONNECTION_REFUSED") {
          return "Unable to connect to server! Please try again.";
        }
        if (err.response?.status === 404) {
          return "Requested facility endpoint was not found (404).";
        }
        if (err.response?.status === 500) {
          return "Internal server error. Please try again later.";
        }
        return err.response?.data?.message || err.message;
      }
      return err instanceof Error ? err.message : "An unexpected error occurred.";
    };

    // WATCHERS & LIFECYCLE
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
    watch(displayedFacilities, (newFeatures) => {
      if (map.value) {
        addMarkers(newFeatures);
        if (userLocation.value) fitMapToVisibleFacilities(newFeatures);
      }
    });

    watch(fetchFacilitiesError, (newError) => {
      if (newError) {
        console.error("Facility Query Error:", newError);

        // Notify.create({
        //   type: "negative",
        //   message: getErrorMessage(newError),
        //   icon: "error",
        //   timeout: 7000,
        //   actions: [{ label: "Retry", color: "white", handler: () => void refetch() }],
        // });
      }
    });

    onMounted(async () => {
      await locateUser();

      try {
        let result = await refetch();

        const widerRadii = distance.value
          .map((d) => d.radius)
          .filter((r) => r > apiQueryRadius.value)
          .sort((a, b) => a - b);

        let i = 0;
        while ((!result.data || result.data.features.length === 0) && i < widerRadii.length) {
          apiQueryRadius.value = widerRadii[i] || 15;
          result = await refetch();
          i++;
        }

        if (result.data && result.data.features.length > 0) {
          const distances = result.data.features
            .map((f) => f.properties.distance)
            .filter((d): d is number => d !== undefined);

          if (distances.length > 0) {
            const minDistance = Math.min(...distances);
            const effectiveFilter = distance.value.find((d) => d.radius >= minDistance);
            if (effectiveFilter) {
              selectedFilterRadius.value = effectiveFilter.radius;
            }
          }

          await nextTick();
          mapboxMap(displayedFacilities.value);
        }
      } catch (error) {
        console.error("Failed mounting FacilitiesNearMe:", error);
        Notify.create({
          type: "negative",
          message: "Unable to load facilities near me.",
          group: false,
          timeout: 5000,
        });
      }
    });

    onUnmounted(() => {
      map.value?.remove();
    });

    return {
      accessToken,
      selectedFacility,
      displayedFacilities,
      map,
      isLoading,
      isFetching,
      isLocating,
      userLocation,
      showFacility,
      hoverFacility,
      clearFacilityHover,
      refetch,
      getErrorMessage,
      fetchFacilitiesError,
      selectedFilterRadius,
      distance,
      showAll,
      getFacilityCountForRadius,
      handleRadiusFilter,
    };
  },
});
</script>

<style lang="scss" scoped>
.main-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 64px;

  box-sizing: border-box;
  color: #404040;
  font:
    400 15px/22px "Source Sans Pro",
    "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
}
.page-header {
  margin: 0 0 12px 12px;
}
.info {
  color: #6c757d;
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

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

/* Filter Button Base Styles */
.filter-btn {
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.2px;
  color: var(--q-primary, #0d1441);
  background-color: #f8fafc;
  /* Variant of #0d1441 (18% opacity border) */
  border: 1px solid rgba(13, 20, 65, 0.18);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);

  &:hover {
    background-color: #f1f5f9;
    color: var(--q-primary, #0d1441);
    /* Border darkens to 40% opacity variant on hover */
    border-color: rgba(13, 20, 65, 0.4);
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(13, 20, 65, 0.08);
  }

  /* Active / Selected State */
  &.selected {
    background-color: var(--q-primary, #0d1441);
    color: #ffffff;
    border-color: var(--q-primary, #0d1441);
    box-shadow: 0 4px 12px rgba(13, 20, 65, 0.25);

    &:hover {
      background-color: var(--q-primary, #0d1441);
      color: #ffffff;
      border-color: var(--q-primary, #0d1441);
      opacity: 0.95;
    }
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  /* Muted / Zero Results State */
  &.is-empty:not(.selected) {
    opacity: 0.55;
    background-color: #f1f5f9;
    border-style: dashed;
    border-color: rgba(13, 20, 65, 0.15);

    &:hover {
      opacity: 0.85;
      border-style: solid;
    }
  }
}

/* Custom Tooltip Styling */
.filter-tooltip {
  background-color: rgba(13, 20, 65, 0.94) !important;
  backdrop-filter: blur(4px);
  color: #ffffff !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  padding: 6px 12px !important;
  border-radius: 6px !important;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);

  /* Refetch indicator pill inside tooltip */
  .tooltip-badge {
    display: inline-flex;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.15);
    color: #ffffff; /* Soft blue highlight */
    // color: #93c5fd; /* Soft blue highlight */
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }
}

.email {
  color: #2233a1;
  text-decoration: none;
}
.email:hover {
  color: #2233a1;
}

@media only screen and (max-width: 600px) {
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
