import { defineBoot } from "#q-app/wrappers";
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli-vite/boot-files
export default defineBoot(({ app } /* { app, router, ... } */) => {
  // something to do

  // Create a new Query Client instance
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Optional global settings (e.g., don't refetch on window focus)
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

  // Register the plugin with the Quasar app instance
  app.use(VueQueryPlugin, { queryClient });
});
