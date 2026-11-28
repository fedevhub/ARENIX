<script setup>
import { onMounted, ref } from 'vue'

import cardDashboard from '@/components/admin/cardDashboard.vue'
import chartBar from '@/components/admin/chart-bar.vue'
import tableBooking from '@/components/admin/tableBooking.vue'
import tableLogAktivitas from '@/components/admin/tableLogAktivitas.vue'

import { getDashboardData } from '@/services/dashboardService'

const loading = ref(true)

const tanggal = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
}).format(new Date())

const data = ref({
    pengguna: 0,
    lapangan: 0,
    booking: 0,
    pendapatan: 0,
    bookingMingguan: [],
    pendapatanBulanan: [],
    bookingTerbaru: [],
    aktivitas: [],
})

async function ambilDashboard() {
    loading.value = true

    try {
        const res = await getDashboardData()
        const hasil = res.data

        data.value = {
            ...data.value,
            ...hasil,
            bookingMingguan: hasil.bookingMingguan || [],
            pendapatanBulanan: hasil.pendapatanBulanan || [],
            bookingTerbaru: hasil.bookingTerbaru || [],
            aktivitas: hasil.aktivitas || [],
        }
    } catch (error) {
        console.error('Gagal memuat dashboard:', error)
    } finally {
        loading.value = false
    }
}

onMounted(ambilDashboard)
</script>

<template>
    <main class="min-h-full bg-[#F5F7FA] p-5 md:p-8">
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 class="font-display text-3xl font-extrabold tracking-tight text-[#142744] md:text-4xl">
                    Dashboard
                </h1>

                <p class="mt-1 text-sm font-medium text-slate-600 md:text-base">
                    Pantau data dan aktivitas sistem secara keseluruhan.
                </p>
            </div>

            <p class="text-sm font-medium text-slate-600 md:text-base">
                {{ tanggal }}
            </p>
        </div>

        <!-- Statistik -->
        <div class="mt-5">
            <cardDashboard :pengguna="data.pengguna" :lapangan="data.lapangan" :booking="data.booking"
                :pendapatan="data.pendapatan" />
        </div>

        <!-- Grafik -->
        <div class="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <chartBar title="Booking Mingguan" variant="stacked" :items="data.bookingMingguan" />

            <chartBar title="Pendapatan Bulanan" variant="single" :items="data.pendapatanBulanan" />
        </div>

        <!-- Booking dan Aktivitas -->
        <div class="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <tableBooking :items="data.bookingTerbaru.slice(0, 5)" />

            <tableLogAktivitas :items="data.aktivitas.slice(0, 5)" />
        </div>

        <div v-if="loading" class="mt-4 text-center text-xs text-slate-400">
            Memuat data dashboard...
        </div>
    </main>
</template>
