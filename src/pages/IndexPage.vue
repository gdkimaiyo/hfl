<template>
  <q-page class="column q-pb-xl">
    <div class="main-page q-pa-md q-mt-sm">
      <div class="text-h5 page-header">Health Facility Locator</div>
      <q-separator spaced />
      <div class="section">
        <div class="side-content">
          <div class="side-header">
            <h1>Facilities</h1>
          </div>
          <div id="listings" class="listings">
            <div
              v-for="facility in facilities.features"
              :key="facility.properties.id"
              :id="'listing-' + facility.properties.id"
              class="item"
              :class="{
                active: selectedFaciliity === facility.properties.id,
              }"
            >
              <a
                href="#"
                :id="'link-' + facility.properties.id"
                class="title"
                :class="{
                  active: selectedFaciliity === facility.properties.id,
                }"
                @click="showFacility(facility.properties.id)"
              >
                {{ facility.properties.name }}
              </a>
              <div class="">
                <span>{{ facility.properties.address }}</span>
                <q-icon
                  name="fas fa-circle"
                  size="3px"
                  style="padding: 0 8px"
                  v-if="facility.properties.phone"
                />
                <span v-if="facility.properties.phone">
                  {{ facility.properties.phone }}
                </span>
                <q-icon
                  name="fas fa-circle"
                  color="white"
                  size="3px"
                  style="padding: 0 8px"
                  v-if="facility.properties.distance"
                />
                <span v-if="facility.properties.distance">
                  <strong>{{ facility.properties.distance }} miles away</strong>
                </span>
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

<script>
import { defineComponent, ref } from "vue";
import mapboxgl from "mapbox-gl";
import { MAPBOX_TOKEN } from "../secrets.config";
import { FACILITIES } from "../utils/constants";

export default defineComponent({
  name: "IndexPage",

  setup() {
    return {
      accessToken: ref(MAPBOX_TOKEN),
      map: ref(null),
      facilities: ref(FACILITIES),
      selectedFaciliity: ref(null), // ID of selected facility
    };
  },

  methods: {
    mapboxMap() {
      mapboxgl.accessToken = this.accessToken;

      /* Assign a unique ID to each facility */
      this.facilities.features.forEach((facility, i) => {
        facility.properties.id = i;
        if (facility.properties.distance) {
          facility.properties.distance =
            Math.round(facility.properties.distance * 100) / 100;
        }
      });

      this.map = new mapboxgl.Map({
        container: "mapContainer",
        style: "mapbox://styles/mapbox/streets-v11",
        center: [36.80700922760637, -1.301141731273861],
        zoom: 12,
        scrollZoom: false,
      });

      this.map.on("load", () => {
        this.map.addSource("places", {
          type: "geojson",
          data: this.facilities,
        });

        const nav = new mapboxgl.NavigationControl();
        this.map.addControl(nav, "top-right");

        this.addMarkers();
      });

      // this.map.on("click", this.onMapClick);
    },

    showFacility(facilityId) {
      this.selectedFaciliity = facilityId;
      this.facilities.features.forEach((facility) => {
        if (facility.properties.id === this.selectedFaciliity) {
          this.flyToFacility(facility);
          this.createPopUp(facility);
        }
      });
    },

    addMarkers() {
      /* For each feature in the GeoJSON object above: */
      this.facilities.features.forEach((marker) => {
        /* Create a div element for the marker. */
        const el = document.createElement("div");
        /* Assign a unique `id` to the marker. */
        el.id = `marker-${marker.properties.id}`;
        /* Assign the `marker` class to each marker for styling. */
        el.className = "marker";

        /**
         * Create a marker using the div element
         * defined above and add it to the map.
         **/
        new mapboxgl.Marker(el, { offset: [0, -23] })
          .setLngLat(marker.geometry.coordinates)
          .addTo(this.map);

        el.addEventListener("click", (e) => {
          /* Fly to the point */
          this.flyToFacility(marker);
          /* Close all other popups and display popup for clicked facility */
          this.createPopUp(marker);
          /* Highlight listing in sidebar */
          e.stopPropagation();
          this.selectedFaciliity = marker.properties.id;
        });
      });
    },

    onMapClick(event) {
      /* Determine if a feature in the "locations" layer exists at that point. */
      const features = this.map.queryRenderedFeatures(event.point, {
        layers: ["locations"],
      });

      /* If it does not exist, return */
      if (!features.length) return;

      const clickedPoint = features[0];

      /* Fly to the point */
      this.flyToFacility(clickedPoint);

      /* Close all other popups and display popup for clicked facility */
      this.createPopUp(clickedPoint);

      /* Highlight listing in sidebar (and remove highlight for all other listings) */
      this.selectedFaciliity = clickedPoint.properties.id;
    },

    // Mapbox GL JS's `flyTo` to move the camera smoothly to a given center point
    flyToFacility(currentFeature) {
      this.map.flyTo({
        center: currentFeature.geometry.coordinates,
        zoom: 13,
      });
    },

    // Create a Mapbox GL JS `Popup`.
    createPopUp(currentFeature) {
      const popUps = document.getElementsByClassName("mapboxgl-popup");
      /** Check if there is already a popup on the map and if so, remove it */
      if (popUps[0]) {
        popUps[0].remove();
      }

      const popup = new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML(
          `<h3>${currentFeature.properties.name}</h3><h4>${currentFeature.properties.address}</h4>`
        )
        .addTo(this.map);
    },
  },

  mounted() {
    this.mapboxMap();
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
  font: 400 15px/22px "Source Sans Pro", "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
}
.page-header {
  margin: 0 0 24px 12px;
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
  background: #00853e;
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

@media only screen and (max-width: 600px) {
  .page-header {
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
