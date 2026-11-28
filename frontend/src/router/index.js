import { createRouter, createWebHistory } from "vue-router";

import { getUser, isLoggedIn, rumahRole } from "@/lib/auth";

import adminLayout from "@/layout/adminLayout.vue";
import petugasLayout from "@/layout/petugasLayout.vue";
import penyewaLayout from "@/layout/penyewaLayout.vue";

import Dashboard from "@/views/admin/Dashboard.vue";
import Pengguna from "@/views/admin/Pengguna.vue";
import Jenis from "@/views/admin/Jenis.vue";
import Lapangan from "@/views/admin/Lapangan.vue";
import Tarif from "@/views/admin/Tarif.vue";
import Pendapatan from "@/views/admin/Pendapatan.vue";
import LogAktivitas from "@/views/admin/Log-Aktivitas.vue";

const routes = [
  {
    path: "/login",
    name: "login",
    meta: { guest: true },
    component: () => import("@/views/auth/Login.vue"),
  },
  {
    path: "/register",
    name: "register",
    meta: { guest: true },
    component: () => import("@/views/auth/Register.vue"),
  },

  {
    path: "/",
    component: penyewaLayout,
    children: [
      {
        path: "",
        name: "beranda",
        component: () => import("@/views/penyewa/Landing.vue"),
      },
      {
        path: "lapangan",
        name: "lapangan-publik",
        component: () => import("@/views/penyewa/Lapangan.vue"),
      },
      {
        path: "lapangan/:id",
        name: "lapangan-detail-publik",
        component: () => import("@/views/penyewa/DetailLapangan.vue"),
      },

      {
        path: "penyewa/riwayat",
        name: "penyewa-riwayat",
        meta: { roles: ["penyewa"] },
        component: () => import("@/views/penyewa/Riwayat.vue"),
      },
      {
        path: "penyewa/booking/baru/:lapanganId",
        name: "penyewa-booking-baru",
        meta: { roles: ["penyewa"] },
        component: () => import("@/views/penyewa/FormBooking.vue"),
      },
      {
        path: "penyewa/booking/:id/berhasil",
        name: "penyewa-booking-berhasil",
        meta: { roles: ["penyewa"] },
        component: () => import("@/views/penyewa/BookingBerhasil.vue"),
      },
      {
        path: "penyewa/booking/:id/bukti",
        name: "penyewa-booking-bukti",
        meta: { roles: ["penyewa"] },
        component: () => import("@/views/penyewa/Bukti.vue"),
      },
      {
        path: "penyewa/booking/:id",
        name: "penyewa-booking-detail",
        meta: { roles: ["penyewa"] },
        component: () => import("@/views/penyewa/DetailBooking.vue"),
      },
    ],
  },
  { path: "/penyewa", redirect: "/penyewa/riwayat" },

  {
    path: "/admin",
    component: adminLayout,
    redirect: "/admin/dashboard",
    meta: { roles: ["admin"] },
    children: [
      { path: "dashboard", name: "admin-dashboard", component: Dashboard },
      { path: "pengguna", name: "admin-pengguna", component: Pengguna },
      { path: "jenis", name: "admin-jenis", component: Jenis },
      { path: "lapangan", name: "admin-lapangan", component: Lapangan },
      { path: "tarif", name: "admin-tarif", component: Tarif },
      { path: "pendapatan", name: "admin-pendapatan", component: Pendapatan },
      {
        path: "log-aktivitas",
        name: "admin-log-aktivitas",
        component: LogAktivitas,
      },
    ],
  },

  {
    path: "/petugas",
    component: petugasLayout,
    redirect: "/petugas/dashboard",
    meta: { roles: ["petugas"] },
    children: [
      {
        path: "dashboard",
        name: "petugas-dashboard",
        component: () => import("@/views/petugas/Dashboard.vue"),
      },
      {
        path: "lapangan",
        name: "petugas-lapangan",
        component: () => import("@/views/petugas/Lapangan.vue"),
      },
      {
        path: "lapangan/:id",
        name: "petugas-lapangan-detail",
        meta: { fokus: true },
        component: () => import("@/views/petugas/DetailLapangan.vue"),
      },
      {
        path: "booking",
        name: "petugas-booking",
        component: () => import("@/views/petugas/DaftarBooking.vue"),
      },
      {
        path: "booking/baru/:lapanganId",
        name: "petugas-booking-baru",
        meta: { fokus: true },
        component: () => import("@/views/petugas/FormBooking.vue"),
      },
      {
        path: "booking/:id",
        name: "petugas-booking-detail",
        meta: { fokus: true },
        component: () => import("@/views/petugas/DetailBooking.vue"),
      },
      {
        path: "booking/:id/struk",
        name: "petugas-booking-struk",
        meta: { fokus: true },
        component: () => import("@/views/petugas/Struk.vue"),
      },
    ],
  },

  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to) => {
  const login = isLoggedIn();
  const user = getUser();

  if (to.meta.guest && login) {
    return rumahRole(user.role);
  }

  const roles = to.matched.map((r) => r.meta.roles).find(Boolean);

  if (roles) {
    if (!login) {
      return { path: "/login", query: { redirect: to.fullPath } };
    }
    if (!roles.includes(user.role)) {
      return rumahRole(user.role);
    }
  }

  return true;
});

export default router;
