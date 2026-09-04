<!-- FacilitiesNearMe.vue -->
<template>
  <div id="facilities-near-me" ref="#facilities-near-me" class="main-page">
    <!-- Initial Loading State ONLY (First mount) -->
    <div
      v-if="(isLocating && !map) || (isLoading && !map)"
      class="flex flex-center loader-container"
    >
      <q-spinner color="primary" size="3em" />
    </div>

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

    <div v-else id="map-section" ref="#map-section">
      <header class="top-header-section q-mb-md">
        <div class="text-h4 text-bold text-primary page-header q-mb-xs">Facilities Near Me</div>

        <!-- Filters Bar -->
        <div v-if="userLocation" class="filters q-py-sm">
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
                >{{ selectedFilterRadius === 15 ? "Showing" : "Show" }} facilities within 15
                km</span
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
              <span v-if="getFacilityCountForRadius(dist.radius) === 0 && dist.radius <= 15">
                No facilities within {{ dist.radius }} km
              </span>
              <span v-else-if="selectedFilterRadius === dist.radius">
                Showing facilities within {{ dist.radius }} km
              </span>
              <span v-else-if="dist.radius <= 15">
                Show {{ getFacilityCountForRadius(dist.radius) }} facilities within
                {{ dist.radius }} km
              </span>
              <div v-else class="column items-center">
                <span>Expand search to {{ dist.radius }} km</span>
                <span class="tooltip-badge q-mt-xs">
                  <q-icon name="sync" size="10px" class="q-mr-xs" />Fetches wider area data
                </span>
              </div>
            </q-tooltip>
          </q-btn>

          <q-separator vertical class="q-mx-xs" />

          <!-- Ownership Filters -->
          <q-btn
            flat
            rounded
            no-caps
            class="filter-btn"
            :class="{ selected: selectedOwnership === 'public' }"
            label="Public"
            @click="handleOwnershipFilter('public')"
          >
            <q-tooltip class="filter-tooltip" :offset="[0, 8]">
              {{ selectedOwnership === "public" ? "Showing" : "Show" }} public facilities
            </q-tooltip>
            <q-icon
              name="close"
              size="14px"
              class="q-ml-xs"
              @click.stop="handleOwnershipFilter('both')"
              v-if="selectedOwnership === 'public'"
            />
          </q-btn>

          <q-btn
            flat
            rounded
            no-caps
            class="filter-btn"
            :class="{ selected: selectedOwnership === 'private' }"
            label="Private"
            @click="handleOwnershipFilter('private')"
          >
            <q-tooltip class="filter-tooltip" :offset="[0, 8]">
              {{ selectedOwnership === "private" ? "Showing" : "Show" }} private facilities
            </q-tooltip>
            <q-icon
              name="close"
              size="14px"
              class="q-ml-xs"
              @click.stop="handleOwnershipFilter('both')"
              v-if="selectedOwnership === 'private'"
            />
          </q-btn>

          <q-separator vertical class="q-mx-xs" />

          <!-- Facility Type Filters -->
          <q-btn
            flat
            rounded
            no-caps
            class="filter-btn"
            :class="{ selected: selectedHospitalType === 'hospital' }"
            label="Hospital"
            @click="handleHospitalTypeFilter('hospital')"
          >
            <q-tooltip class="filter-tooltip" :offset="[0, 8]">
              {{ selectedHospitalType === "hospital" ? "Showing" : "Show" }} hospitals
            </q-tooltip>
            <q-icon
              name="close"
              size="14px"
              class="q-ml-xs"
              @click.stop="handleHospitalTypeFilter('')"
              v-if="selectedHospitalType === 'hospital'"
            />
          </q-btn>

          <q-btn
            flat
            rounded
            no-caps
            class="filter-btn"
            :class="{ selected: selectedHospitalType === 'health-centre' }"
            label="Health Centre"
            @click="handleHospitalTypeFilter('health-centre')"
          >
            <q-tooltip class="filter-tooltip" :offset="[0, 8]">
              {{ selectedHospitalType === "health-centre" ? "Showing" : "Show" }} health centres
            </q-tooltip>
            <q-icon
              name="close"
              size="14px"
              class="q-ml-xs"
              @click.stop="handleHospitalTypeFilter('')"
              v-if="selectedHospitalType === 'health-centre'"
            />
          </q-btn>

          <!-- <q-badge v-if="userLocation" color="primary" class="q-pa-xs q-ma-md">
            <q-icon name="gps_fixed" class="q-mr-xs" /> Sorting by proximity to your location
          </q-badge> -->
        </div>

        <div v-else class="q-py-sm">
          <q-banner
            v-if="!isLocating"
            dense
            inline-actions
            class="bg-amber-1 text-amber-10 rounded-borders text-caption"
          >
            <template #avatar>
              <q-icon name="location_off" color="amber-9" size="xs" />
            </template>
            Location disabled — showing top facilities in Kenya.
          </q-banner>
        </div>

        <!-- Helpful Tip Bar -->
        <div class="info text-caption text-grey-7 flex items-center q-mt-xs">
          <q-icon name="info" size="16px" class="q-mr-xs text-primary" />
          Click on any facility card or map marker to draw a driving route.
        </div>
      </header>

      <!-- <q-separator spaced /> -->
      <q-separator class="q-mb-md" />

      <main class="section">
        <aside class="side-content">
          <!-- <div class="side-header">
            <h1>Facilities ({{ displayedFacilities.length }})</h1>
          </div> -->
          <div
            v-if="isFetching"
            class="q-pa-xs text-caption text-primary flex items-center bg-blue-1 rounded-borders"
          >
            <q-spinner size="1em" class="q-mr-xs" /> Updating distance boundary...
          </div>

          <div id="listings" class="listings">
            <div
              v-for="facility in displayedFacilities"
              :key="facility.properties.id"
              :id="'listing-' + facility.properties.id"
              class="item"
              :class="{ 'is-selected': selectedFacility === facility.properties.id }"
              @click="showFacility(facility.properties.id ?? 0)"
            >
              <div class="image-wrapper">
                <q-img
                  alt="Facility Image"
                  :src="getFacilityImage(facility.properties.image)"
                  height="250px"
                  class="rounded-borders facility-img"
                  fit="cover"
                >
                  <template #loading>
                    <q-spinner color="primary" size="20px" />
                  </template>
                </q-img>
              </div>

              <div class="after-img-content">
                <div
                  :id="'link-' + facility.properties.id"
                  class="title text-subtitle1 text-bold"
                  :class="{ active: selectedFacility === facility.properties.id }"
                  @mouseenter="hoverFacility(facility.properties.id ?? 0)"
                  @mouseleave="clearFacilityHover"
                >
                  {{ facility.properties.name }}
                </div>

                <div
                  v-if="facility.properties.address"
                  class="text-caption text-grey-7 q-mb-xs flex items-center"
                >
                  <q-icon name="place" size="13px" class="q-mr-xs" />
                  {{ facility.properties.address }}
                </div>

                <!-- Contact Information -->
                <div
                  v-if="facility.properties.phone || facility.properties.email"
                  class="text-caption text-grey-8 q-mb-xs flex items-center wrap gap-xs"
                >
                  <span v-if="facility.properties.phone" class="flex items-center" @click.stop>
                    <q-icon name="phone" size="12px" class="q-mr-xs text-grey-6" />
                    {{ facility.properties.phone.split("/")[0] }}
                  </span>
                  <span
                    v-if="facility.properties.phone && facility.properties.email"
                    class="text-grey-4 q-mx-sm"
                    >•</span
                  >
                  <span v-if="facility.properties.email" class="flex items-center">
                    <q-icon name="email" size="12px" class="q-mr-xs text-grey-6" />
                    <a :href="`mailto:${facility.properties.email}`" class="email" @click.stop>
                      {{ facility.properties.email }}
                    </a>
                  </span>
                </div>

                <!-- Facility Badges -->
                <div class="row q-gutter-xs q-mt-xs">
                  <q-badge
                    unelevated
                    :color="facility.properties.isPrivate ? 'deep-orange-1' : 'teal-1'"
                    :text-color="facility.properties.isPrivate ? 'deep-orange-9' : 'teal-9'"
                    class="text-caption text-weight-medium"
                  >
                    {{ facility.properties.isPrivate ? "Private" : "Public" }}
                  </q-badge>
                  <q-badge outline color="primary" class="text-caption text-weight-medium">
                    {{ facility.properties.type === "Hospital" ? "Hospital" : "Health Centre" }}
                  </q-badge>
                </div>

                <!-- Distance and Actions Footer -->
                <div
                  class="row items-center justify-between text-primary text-bold q-mt-md pt-xs"
                  v-if="facility.properties.distance !== undefined"
                >
                  <div class="flex items-center text-caption text-weight-bold">
                    <q-icon name="directions_car" size="14px" class="q-mr-xs" />
                    {{ facility.properties.distance }} km away
                  </div>
                  <div class="q-mb-md">
                    <q-btn
                      flat
                      rounded
                      no-caps
                      class="facility-card-action-btn"
                      size="sm"
                      @click.stop
                    >
                      Services
                      <q-icon name="open_in_new" size="14px" class="q-ml-xs" />
                    </q-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- RIGHT CONTENT: Sticky Map -->
        <section class="map-locations">
          <div id="mapContainer" class="basemap"></div>
        </section>
      </main>
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
import { useRouter } from "vue-router";
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
import { createPopUp, getFacilityImage, isHandset } from "../../utils/helpers";
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

    const router = useRouter();

    // API Distance Radius state (Defaults to 15km)
    const apiQueryRadius = ref<number>(15);
    // Active UI filter state (Defaults to 1km)
    const selectedFilterRadius = ref<number>(1);

    // Public or Private
    const selectedOwnership = ref<string>("both");
    // Hospital Type
    const selectedHospitalType = ref<string>("");

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

      return allFeatures.filter((facility) => {
        const props = facility.properties;

        // Distance Radius Filter
        const matchesDistance =
          props.distance === undefined || props.distance <= selectedFilterRadius.value;

        // Ownership Filter ('both', 'public', or 'private')
        const matchesOwnership =
          selectedOwnership.value === "both" ||
          (selectedOwnership.value === "private" && props.isPrivate === true) ||
          (selectedOwnership.value === "public" && props.isPrivate === false);

        // Facility Type Filter ('', 'hospital', or 'health-centre')
        const matchesHospitalType = computedHospitalTypeMatch(
          props.type,
          selectedHospitalType.value,
        );

        return matchesDistance && matchesOwnership && matchesHospitalType;
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

    const handleOwnershipFilter = (filter: string) => {
      selectedOwnership.value = filter;
    };

    const handleHospitalTypeFilter = (filter: string) => {
      selectedHospitalType.value = filter;
    };

    // MAP INTERACTION
    const showFacility = (facilityId: number) => {
      if (isHandset()) {
        void router.push({ name: "home", hash: "#map-section" });
      }
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
        scrollZoom: false,
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
        const props = facility.properties;

        const matchesRadius = props.distance !== undefined && props.distance <= radius;
        const matchesOwnership =
          selectedOwnership.value === "both" ||
          (selectedOwnership.value === "private" && props.isPrivate === true) ||
          (selectedOwnership.value === "public" && props.isPrivate === false);
        const matchesHospitalType = computedHospitalTypeMatch(
          props.type,
          selectedHospitalType.value,
        );

        return matchesRadius && matchesOwnership && matchesHospitalType;
      }).length;
    };

    const computedHospitalTypeMatch = (
      facilityType: string | undefined,
      selectedType: string,
    ): boolean => {
      if (!selectedType) return true;

      const normalizedFacilityType = (facilityType || "").toLowerCase().replace(/[\s-_]/g, "");
      const normalizedSelectedType = selectedType.toLowerCase().replace(/[\s-_]/g, "");

      return normalizedFacilityType.includes(normalizedSelectedType);
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
      selectedOwnership,
      selectedHospitalType,
      distance,
      showAll,
      getFacilityCountForRadius,
      handleRadiusFilter,
      handleOwnershipFilter,
      handleHospitalTypeFilter,
      getFacilityImage,
    };
  },
});
</script>

<style lang="scss" scoped>
.main-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
  padding-top: 64px;

  box-sizing: border-box;
  color: #404040;
  font:
    400 15px/22px "Source Sans Pro",
    "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
}
.loader-container {
  min-height: 50vh;
}

.page-header {
  // margin: 0 0 12px 12px;
  line-height: 1.2;
}
.info {
  // color: #6c757d;
  font-size: 13px;
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
  gap: 20px;
  height: calc(100vh - 270px);
  min-height: 500px;
}

.side-content {
  width: 40%;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
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
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.listings .item {
  border-bottom: 1px solid #e2e8f0;
  background-color: #ffffff;
  // border-radius: 12px;
  padding: 12px;
  margin-top: 16px;
  margin-bottom: 16px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    // border-color: var(--q-primary, #0d1441);
    // box-shadow: 0 4px 16px rgba(13, 20, 65, 0.08);
    transform: translateY(-2px);

    .title {
      // color: var(--q-primary, #0d1441);
      color: rgba(13, 20, 65, 0.7);
    }
  }

  // &.is-selected {
  //   border: 2px solid var(--q-primary, #0d1441);
  //   box-shadow: 0 6px 20px rgba(13, 20, 65, 0.12);
  // }
}

.facility-img {
  transition: transform 0.3s ease;
}

.item:hover .facility-img {
  transform: scale(1.01);
}

.after-img-content {
  padding-top: 12px;
}

.listings .item .title {
  color: #1e293b;
  transition: color 0.2s ease;

  &.active {
    // color: var(--q-primary, #0d1441);
    color: rgba(193, 0, 21, 0.8);
  }
}

.facility-card-action-btn {
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  padding: 4px 14px;
  background-color: var(--q-primary, #0d1441);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--q-primary, #0d1441);
    opacity: 0.9;
  }
}

// ::-webkit-scrollbar {
//   width: 3px;
//   height: 3px;
//   border-left: 0;
//   background: transparent;
//   // background: rgba(0, 0, 0, 0.1);
// }

// ::-webkit-scrollbar-track {
//   background: none;
// }

// ::-webkit-scrollbar-thumb {
//   background: transparent;
//   // background: #0d1441;
//   border-radius: 0;
// }

/* Scrollbars */
.listings::-webkit-scrollbar {
  width: 5px;
}
.listings::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}
.listings::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;

  &:hover {
    background: #94a3b8;
  }
}

.map-locations {
  width: 60%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;

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
  color: var(--q-primary, #0d1441);
  background-color: #f8fafc;
  border: 1px solid rgba(13, 20, 65, 0.18);
  transition: all 0.2s ease;

  &:hover {
    background-color: #f1f5f9;
    border-color: rgba(13, 20, 65, 0.4);
    transform: translateY(-1px);
  }

  /* Active / Selected State */
  &.selected {
    background-color: var(--q-primary, #0d1441);
    color: #ffffff;
    border-color: var(--q-primary, #0d1441);
    // box-shadow: 0 4px 12px rgba(13, 20, 65, 0.25);
    box-shadow: 0 4px 10px rgba(13, 20, 65, 0.2);

    &:hover {
      background-color: var(--q-primary, #0d1441);
      color: #ffffff;
      border-color: var(--q-primary, #0d1441);
      opacity: 0.95;
    }
  }

  // &:active {
  //   transform: translateY(0);
  //   box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  // }

  /* Muted / Zero Results State */
  &.is-empty:not(.selected) {
    opacity: 0.55;
    background-color: #f1f5f9;
    border-style: dashed;
    // border-color: rgba(13, 20, 65, 0.15);

    // &:hover {
    //   opacity: 0.85;
    //   border-style: dashed;
    // }
  }
}

/* Custom Tooltip Styling */
.filter-tooltip {
  background-color: rgba(13, 20, 65, 0.94) !important;
  backdrop-filter: blur(4px);
  color: #ffffff !important;
  font-size: 12px !important;
  padding: 6px 12px !important;
  border-radius: 6px !important;

  /* Refetch indicator pill inside tooltip */
  .tooltip-badge {
    display: inline-flex;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.15);
    color: #ffffff;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
  }
}

.email {
  color: var(--q-primary, #0d1441);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

@media only screen and (max-width: 768px) {
  .section {
    flex-direction: column;
    height: auto;
  }

  .map-locations {
    width: 100%;
    height: 350px;
    order: -1; /* Move map to top on mobile viewports */
  }

  .side-content {
    width: 100%;
    height: auto;
  }

  .listings {
    padding-right: 0;
  }
}
</style>
