import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", name: "home", component: () => import("pages/IndexPage.vue") },
      {
        path: "/facilities",
        name: "facilities",
        component: () => import("pages/Facilities.vue"),
      },
      {
        path: "/about-us",
        name: "about",
        component: () => import("pages/AboutUs.vue"),
      },
      { path: "/help", name: "help", component: () => import("pages/HelpPage.vue") },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
