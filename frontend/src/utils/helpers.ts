import mapboxgl from "mapbox-gl";
import type { FacilityFeature } from "../types/facility.types";

// Axios
import { AxiosError } from "axios";

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

export const getFacilityImage = (imageName?: string): string => {
  if (!imageName) {
    return new URL("../assets/facilities/national-cancer-institute.jpg", import.meta.url).href;
  }

  try {
    return new URL(`../assets/facilities/${imageName}`, import.meta.url).href;
  } catch (e) {
    console.log(e);
    // Fallback if the image file doesn't exist at the given path
    return new URL("../assets/facilities/national-cancer-institute.jpg", import.meta.url).href;
  }
};

export const getErrorMessage = (err: unknown): string => {
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

// Toggle map icons
export const FULLSCREEN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#333333"><path d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z"/></svg>`;
export const FULLSCREEN_EXIT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#333333"><path d="M240-240v-120h-120v-80h200v200h-80Zm400 0v-200h200v80H720v120h-80ZM120-640v-80h120v-120h80v200H120Zm520 0v-200h80v120h120v80H640Z"/></svg>`;
// Accept a reactive toggle callback from Vue
// Define the Custom Control Class with TypeScript Types
export class MaximizeControl implements mapboxgl.IControl {
  private _map: mapboxgl.Map | undefined;
  private _container!: HTMLDivElement;
  private _button!: HTMLButtonElement;
  private _onToggle: () => void;

  constructor(onToggle: () => void) {
    this._onToggle = onToggle;
  }

  onAdd(map: mapboxgl.Map): HTMLElement {
    this._map = map;

    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";

    this._button = document.createElement("button");
    this._button.type = "button";
    this._button.className = "mapboxgl-ctrl-icon custom-max-btn";
    this._button.setAttribute("aria-label", "Maximize map");
    this._button.innerHTML = FULLSCREEN_SVG;

    this._button.onclick = () => {
      this._onToggle();
    };

    this._container.appendChild(this._button);
    return this._container;
  }

  updateIcon(isMaximized: boolean): void {
    if (!this._button) return;
    this._button.innerHTML = isMaximized ? FULLSCREEN_EXIT_SVG : FULLSCREEN_SVG;
    this._button.setAttribute("aria-label", isMaximized ? "Minimize map" : "Maximize map");
  }

  onRemove(): void {
    if (this._container && this._container.parentNode) {
      this._container.parentNode.removeChild(this._container);
    }
    this._map = undefined;
  }
}
