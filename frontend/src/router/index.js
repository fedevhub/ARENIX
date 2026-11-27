import { createRouter, createWebHistory } from "vue-router";

import adminLayout from "@/layout/adminLayout.vue";

import Dashboard from "@/views/admin/Dashboard.vue";
import Pengguna from "@/views/admin/Pengguna.vue";
import Jenis from "@/views/admin/Jenis.vue";
import Lapangan from "@/views/admin/Lapangan.vue";
import Tarif from "@/views/admin/Tarif.vue";

const routes = [
  { path: "/", redirect: "/login" },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/auth/Login.vue"),
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/auth/Register.vue"),
  },

  {
    path: "/admin",
    component: adminLayout,
    redirect: "/admin/dashboard",
    children: [
      {
        path: "dashboard",
        name: "admin-dashboard",
        component: Dashboard,
      },
      {
        path: "pengguna",
        name: "admin-pengguna",
        component: Pengguna,
      },
      {
        path: "jenis",
        name: "admin-jenis",
        component: Jenis,
      },
      {
        path: "lapangan",
        name: "admin-lapangan",
        component: Lapangan,
      },
      {
        path: "tarif",
        name: "admin-tarif",
        component: Tarif,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
