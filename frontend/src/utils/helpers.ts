import mapboxgl from "mapbox-gl";
import type { FacilityFeature } from "../types/facility.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createPopUp = (currentFeature: FacilityFeature, mapRef: any) => {
  if (!mapRef.value) return;

  // OLD - It does not target the specific map
  // const popUps = document.getElementsByClassName("mapboxgl-popup");
  // if (popUps[0]) {
  //   popUps[0].remove();
  // }

  // NEW
  // Clear/Wipe Existing PopUps in the specific map container before creating another popup
  const mapContainer = mapRef.value.getContainer();
  if (mapContainer) {
    const existingPopups = mapContainer.getElementsByClassName("mapboxgl-popup");
    if (existingPopups[0]) {
      existingPopups[0].remove();
    }
    // Array.from(existingPopups).forEach((popup: Element) => popup.remove());
  }

  // Fallback check for property field names
  const addressText =
    currentFeature.properties.address ||
    currentFeature.properties.city ||
    currentFeature.properties.state ||
    "Address details unavailable";

  const distText =
    currentFeature.properties.distance !== undefined
      ? `<p style="padding: 4px 10px 0 4px; color: #0d1441; font-weight: bold;">
          <i class="fas fa-car"></i> ${currentFeature.properties.distance} km away
         </p>`
      : "";

  new mapboxgl.Popup({ closeOnClick: true, offset: 10 })
    .setLngLat(currentFeature.geometry.coordinates)
    .setHTML(
      `<h3>${currentFeature.properties.name}</h3>
       <h4 style="color: #0d1441;">${addressText}</h4>
       ${distText}`,
    )
    .addTo(mapRef.value);
};

export const isHandset = () => {
  return screen.width <= 575 ? true : false;
};
