<template>
  <q-page class="column q-pb-xl">
    <div class="main-page q-pa-md q-mt-sm">
      <div class="text-h5 page-header">Health Facility Locator</div>
      <div class="info">
        <q-icon name="fas fa-circle-info" size="16px" style="padding-right: 4px" />
        Click on facility name or the map marker to zoom in on the map
      </div>
      <q-separator spaced />
      <div class="section">
        <div class="side-content">
          <div class="side-header">
            <h1>Facilities</h1>
          </div>
          <div v-if="isLoading" class="loading-overlay">Loading facilities...</div>
          <div v-if="!isLoading && facilities" id="listings" class="listings">
            <div
              v-for="facility in facilities.features"
              :key="facility.properties.id"
              :id="'listing-' + facility.properties.id"
              class="item"
              :class="{
                active: selectedFacility === facility.properties.id,
              }"
              @click="showFacility(facility.properties.id ?? 0)"
            >
              <a
                href="#"
                :id="'link-' + facility.properties.id"
                class="title"
                :class="{
                  active: selectedFacility === facility.properties.id,
                }"
              >
                {{ facility.properties.name }}
              </a>
              <div class="">
                <span>{{ facility.properties.address }}</span>
                <q-icon
                  name="fas fa-circle"
                  size="3px"
                  style="padding-right: 4px; padding-left: 6px"
                />
                <span v-if="facility.properties.isPrivate" class="muted"> Private </span>
                <span v-else class="muted">Public</span>
                <q-icon
                  name="fas fa-circle"
                  size="3px"
                  style="padding-right: 4px; padding-left: 6px"
                />
                <span v-if="facility.properties.type === 'Hospital'" class="muted"> Hospital </span>
                <span v-else class="muted"> Health Centre </span>
              </div>
              <div class="">
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
              <div class="" v-if="facility.properties.distance">
                <strong>{{ facility.properties.distance }} miles away</strong>
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
import { defineComponent, ref, onUnmounted, shallowRef, onMounted, nextTick } from 'vue';
import { Notify } from 'quasar';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from '@tanstack/vue-query';
import { MAPBOX_TOKEN } from '../secrets.config';

// Services
import { getFacilities } from 'src/services/facility.service';

// Types
import type { FacilityFeature, FacilityGeoJSON } from 'src/types/facility.types';

export default defineComponent({
  name: 'IndexPage',

  setup() {
    const accessToken = ref(MAPBOX_TOKEN);
    const selectedFacility = ref<number | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = shallowRef<any>(null);

    const {
      data: facilities,
      isLoading,
      refetch,
    } = useQuery<FacilityGeoJSON>({
      queryKey: ['facilities'],
      queryFn: async () => {
        const response = await getFacilities();

        // IF response.data is the raw array, map it into a GeoJSON FeatureCollection object
        const rawArray = Array.isArray(response.data) ? response.data : response.data.features;

        return {
          type: 'FeatureCollection',
          features: rawArray || [], // Fallback to empty array if something goes wrong
        };
      },
      enabled: false, // <-- Crucial: Stops Vue Query from firing automatically on setup
      placeholderData: { type: 'FeatureCollection', features: [] },
    });

    // MAPBOX CORE LOGIC
    const mapboxMap = (data: FacilityGeoJSON) => {
      mapboxgl.accessToken = accessToken.value;

      /* Assign a unique ID to each facility & sanitize distances */
      data.features.forEach((facility, i) => {
        facility.properties.id = i;
        if (facility.properties.distance) {
          facility.properties.distance = Math.round(facility.properties.distance * 100) / 100;
        }
      });

      if (map.value) return;

      map.value = new mapboxgl.Map({
        container: 'mapContainer',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [36.81868966807952, -1.2860949419582617],
        zoom: 12,
        scrollZoom: false,
      });

      map.value.on('load', () => {
        if (!map.value) return;

        map.value.addSource('places', {
          type: 'geojson',
          data: data as unknown,
        });

        const nav = new mapboxgl.NavigationControl();
        map.value.addControl(nav, 'top-right');

        addMarkers(data);
      });
    };

    const showFacility = (facilityId: number) => {
      selectedFacility.value = facilityId;
      facilities.value?.features.forEach((facility) => {
        if (facility.properties.id === selectedFacility.value) {
          flyToFacility(facility);
          createPopUp(facility);
        }
      });
    };

    const addMarkers = (data: FacilityGeoJSON) => {
      if (!map.value) return;

      data.features.forEach((marker) => {
        const el = document.createElement('div');
        el.id = `marker-${marker.properties.id}`;
        el.className = 'marker';

        new mapboxgl.Marker(el, { offset: [0, -23] })
          .setLngLat(marker.geometry.coordinates)
          .addTo(map.value);

        el.addEventListener('click', (e) => {
          flyToFacility(marker);
          createPopUp(marker);
          e.stopPropagation();
          selectedFacility.value = marker.properties.id ?? null;
        });

        el.addEventListener('mouseover', (e) => {
          createPopUp(marker);
          e.stopPropagation();
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

      const popUps = document.getElementsByClassName('mapboxgl-popup');
      if (popUps[0]) {
        popUps[0].remove();
      }

      new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML(
          `<h3>${currentFeature.properties.name}</h3><h4>${currentFeature.properties.address}</h4>`,
        )
        .addTo(map.value);
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
        console.log(error);
        Notify.create({
          type: 'negative',
          message: 'CONNECTION REFUSED.',
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
      showFacility,
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
    400 15px/22px 'Source Sans Pro',
    'Helvetica Neue',
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
