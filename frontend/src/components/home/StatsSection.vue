<template>
  <section class="stats" aria-label="Product highlights">
    <div class="container stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat">
        <strong>{{ stat.value }}</strong>
        <span>{{ stat.label }}</span>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

// Types
import type { StatItem } from "../../types/stats.types";

// Constants
import { STATS } from "../../utils/constants";

export default defineComponent({
  name: "StatsSection",

  setup() {
    const stats = ref<StatItem[]>(STATS);

    return {
      stats,
    };
  },
});
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  max-width: 1172px;
  margin-inline: auto;
}

.stats {
  border-block: 1px solid #e2e8f0;
  background-color: #f8fafc;
  padding: 34px 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px;
}

.stat strong {
  display: block;
  font-family: inherit;
  font-size: 1.4rem;
  font-weight: 600;
  color: #0d1441;
  // color: #16a34a;
}

.stat span {
  font-size: 0.88rem;
  color: #475569;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media only screen and (max-width: 600px) {
}
</style>
