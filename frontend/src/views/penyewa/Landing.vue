<script setup>
import { onMounted } from 'vue'
import { AlertCircle } from 'lucide-vue-next'

import heroLanding from '@/components/penyewa/heroLanding.vue'
import gridJadwalHariIni from '@/components/penyewa/gridJadwalHariIni.vue'
import caraBooking from '@/components/penyewa/caraBooking.vue'
import footerPenyewa from '@/components/penyewa/footerPenyewa.vue'
import { useDaftarLapangan } from '@/composables/useDaftarLapangan'
import { isLoggedIn } from '@/lib/auth'
import { tanggalPanjang, toYMD } from '@/lib/format'

const login = isLoggedIn()
const { daftar, loading, error, muat } = useDaftarLapangan()

onMounted(muat)
</script>

<template>
    <!-- Hero Section -->
    <heroLanding :login="login" :daftar="daftar" />

    <!-- Main Content -->
    <main class="mx-auto max-w-[1200px] px-6 py-16 lg:px-8 lg:py-24 space-y-24">

        <!-- Section 1: Jadwal Hari Ini -->
        <section aria-labelledby="jadwal-hari-ini">
            <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                    <p class="text-sm font-bold text-[#FF9638]">Jadwal terkini</p>
                    <h2 id="jadwal-hari-ini" class="mt-1.5 text-2xl sm:text-3xl font-bold text-[#142744]">
                        Ketersediaan hari ini
                    </h2>
                </div>
                <p class="text-sm font-medium text-[#65758B] bg-white border border-[#E1E8F0] px-4 py-2 rounded-lg">
                    {{ tanggalPanjang(toYMD()) }}
                </p>
            </div>

            <!-- Error State -->
            <div v-if="error" role="alert"
                class="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle :size="20" class="shrink-0" />
                {{ error }}
            </div>

            <!-- Tabel Jadwal -->
            <template v-else>
                <gridJadwalHariIni :daftar="daftar" :loading="loading" />
                <div class="mt-5 flex justify-center sm:justify-start">
                    <RouterLink to="/lapangan"
                        class="inline-flex h-9 items-center justify-center rounded-lg border border-[#D5DFEC] bg-white px-4 text-xs font-bold text-[#142744] transition-colors hover:bg-[#F4F6F8]">
                        Lihat selengkapnya
                    </RouterLink>
                </div>
            </template>
        </section>

        <!-- Section 2: Cara Booking -->
        <section aria-labelledby="cara-booking" class="bg-[#F8FAFC] rounded-3xl p-8 sm:p-12 border border-[#E1E8F0]">
            <div class="max-w-2xl mx-auto text-center">
                <p class="text-sm font-bold text-[#FF9638]">Mudah dan cepat</p>
                <h2 id="cara-booking" class="mt-1.5 text-2xl sm:text-3xl font-bold text-[#142744]">
                    Cara booking lapangan
                </h2>
                <p class="mt-3 text-base text-[#65758B]">
                    Pesan jadwal bermainmu hanya dalam beberapa langkah.
                </p>
            </div>

            <!-- Komponen Cara Booking -->
            <caraBooking class="mt-12" />
        </section>

    </main>

    <!-- Footer -->
    <footerPenyewa />
</template>
