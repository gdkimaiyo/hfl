<template>
  <div class="row items-center">
    <!-- City Filters -->
    <q-btn
      v-for="city in majorCities"
      :key="city"
      flat
      rounded
      no-caps
      class="filter-btn q-ml-sm"
      :class="{ selected: selectedTown === city }"
      :label="city"
      @click="childHandleCityFilter(city)"
    >
      <q-tooltip class="filter-tooltip" :offset="[0, 8]" v-if="city !== 'All'">
        {{ selectedTown === city ? "Showing" : "Show" }} facilities in {{ city }}
      </q-tooltip>
      <q-icon
        v-if="selectedTown === city && city !== 'All'"
        name="close"
        size="14px"
        class="q-ml-xs"
        @click.stop="childHandleCityFilter('All')"
      />
    </q-btn>

    <!-- Select Dropdown for Other Towns -->
    <q-select
      v-model="selectedTown"
      :options="otherTownOptions"
      dense
      borderless
      options-dense
      emit-value
      map-options
      class="filter-select-btn q-ma-sm"
      :class="{ selected: isOtherTownSelected }"
      :display-value="selectedCityDisplayLabel"
      @update:model-value="childHandleCityFilter"
    >
      <template #prepend>
        <q-icon name="location_city" size="14px" class="q-mr-xs" />
      </template>

      <template #append>
        <q-icon
          v-if="isOtherTownSelected"
          name="close"
          size="14px"
          class="cursor-pointer q-ml-xs"
          @click.stop="childHandleCityFilter('All')"
        />
      </template>

      <q-tooltip class="filter-tooltip" :offset="[0, 8]">
        {{
          isOtherTownSelected ? `Showing facilities in ${selectedTown}` : "Filter by other towns"
        }}
      </q-tooltip>
    </q-select>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";

// Utils / Helpers / Constants
import { TOWNS } from "../../utils/constants";

export default defineComponent({
  name: "SelectTownFilter",

  props: {
    selectedCity: {
      type: String,
      default: "All",
    },
    isLocationActive: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["trigger-city-filter"],

  setup(props, { emit }) {
    const route = useRoute();

    const ALL_TOWNS = TOWNS;
    const MAJOR_CITIES = ["All", "Nairobi", "Mombasa", "Eldoret"];

    const selectedTown = ref<string>(props.selectedCity);

    // WATCHERS & LIFECYCLE
    watch(
      () => props.selectedCity,
      (newVal) => {
        selectedTown.value = newVal;
      },
    );

    // COMPUTED
    const otherTownOptions = computed(() => {
      const otherTowns = ALL_TOWNS.filter((town) => !MAJOR_CITIES.includes(town));
      return [
        { label: "Other Towns...", value: "All" },
        ...otherTowns.map((town) => ({ label: town, value: town })),
      ];
    });

    const currentRouteName = computed(() => route.name);

    const majorCities = computed(() => {
      const isFacilitiesPage = currentRouteName.value === "facilities";

      if (props.isLocationActive && isFacilitiesPage) {
        return MAJOR_CITIES.filter((city: string) => city !== "All");
      }

      return MAJOR_CITIES;
    });

    const isOtherTownSelected = computed(() => {
      return selectedTown.value !== "All" && !MAJOR_CITIES.includes(selectedTown.value);
    });

    const selectedCityDisplayLabel = computed(() => {
      return isOtherTownSelected.value ? selectedTown.value : "Other Towns";
    });

    // METHODS
    const childHandleCityFilter = (filter: string) => {
      emit("trigger-city-filter", filter);
    };

    return {
      majorCities,
      selectedTown,
      otherTownOptions,
      isOtherTownSelected,
      selectedCityDisplayLabel,
      childHandleCityFilter,
    };
  },
});
</script>

<style lang="scss" scoped>
/* Filter Select styling similar to Quasar flat rounded buttons */
.filter-select-btn {
  display: inline-flex;
  align-items: center;
  height: 36px;
  border-radius: 28px;
  background-color: #f1f5f9;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  // margin-top: 8px;
  padding: 0 12px;
  vertical-align: middle;

  :deep(.q-field__inner),
  :deep(.q-field__control),
  :deep(.q-field__control-container) {
    height: 36px !important;
    min-height: 36px !important;
    padding: 0 !important;
    display: flex;
    align-items: center;
  }

  :deep(.q-field__native) {
    padding: 0;
    min-height: unset;
    line-height: 1;
    color: inherit;
    font-weight: 500;
  }

  :deep(.q-field__append),
  :deep(.q-field__prepend) {
    height: 36px;
    padding: 0;
    color: inherit;
  }

  /* Active/Selected State matching selected chip buttons */
  &.selected {
    background-color: var(--q-primary);
    color: #ffffff;

    :deep(.q-field__native),
    :deep(.q-icon) {
      color: #ffffff !important;
    }
  }
}
</style>
