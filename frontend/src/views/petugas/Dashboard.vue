<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AlertCircle } from 'lucide-vue-next'

import headerHalaman from '@/components/shared/headerHalaman.vue'
import cardStatistik from '@/components/petugas/cardStatistik.vue'
import tableBooking from '@/components/petugas/tableBooking.vue'

import { getBookings } from '@/services/bookingService'
import { useDaftarLapangan } from '@/composables/useDaftarLapangan'
import { useAksiBooking } from '@/composables/useAksiBooking'
import { toYMD, ymdDari } from '@/lib/format'

const router = useRouter()

const bookings = ref([])
const loading = ref(true)
const error = ref('')

const { daftar, muat: muatLapangan } = useDaftarLapangan()

async function muat() {
    loading.value = true
    error.value = ''

    try {
        const res = await getBookings()
        bookings.value = res.data.data ?? []
    } catch (e) {
        error.value = e.response?.data?.message ?? 'Gagal memuat data booking.'
    } finally {
        loading.value = false
    }
}

const aksi = useAksiBooking(async () => {
    await Promise.all([muat(), muatLapangan()])
})

const hariIni = toYMD()

const totalBooking = computed(() => bookings.value.length)

const menungguBayar = computed(() =>
    bookings.value.filter((b) => b.status === 'Menunggu').length,
)

const lapanganAktif = computed(() => daftar.value.filter((l) => l.status === 'Aktif').length)

const bookingSelesai = computed(() => bookings.value.filter((b) => b.status === 'Selesai').length)

const terdekat = computed(() =>
    bookings.value
        .filter((b) => ymdDari(b.tanggal) >= hariIni && b.status !== 'Dibatalkan')
        .sort((a, b) =>
            (ymdDari(a.tanggal) + a.jam_mulai).localeCompare(
                ymdDari(b.tanggal) + b.jam_mulai,
            ),
        )
        .slice(0, 6),
)

onMounted(() => {
    muat()
    muatLapangan()
})
</script>

<template>
    <div class="min-h-full px-4 pb-10 pt-10 md:px-10 md:pt-8">

        <!-- Header -->
        <headerHalaman judul="Dashboard Petugas" subjudul="Ringkasan operasional lapangan dan booking hari ini" />

        <!-- Error -->
        <div v-if="error" role="alert"
            class="mt-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
            <AlertCircle :size="18" class="shrink-0" />
            {{ error }}
        </div>

        <!-- Statistik -->
        <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <cardStatistik label="Total Booking" :nilai="totalBooking" />

            <cardStatistik label="Menunggu Pembayaran" :nilai="menungguBayar" />

            <cardStatistik label="Lapangan Aktif" :nilai="lapanganAktif" />

            <cardStatistik label="Booking Selesai" :nilai="bookingSelesai" />
        </div>

        <!-- Booking Terdekat -->
        <section
            class="mt-5 overflow-hidden rounded-3xl border border-[#E1E8F0] bg-white shadow-[0_2px_8px_rgba(20,39,68,0.04)]">
            <div class="flex flex-wrap items-center justify-between gap-3 px-6 pb-4 pt-6">
                <h2 class="text-xl font-semibold text-[#142744]">
                    Booking Perlu Tindakan &amp; Jadwal Terdekat
                </h2>

                <RouterLink to="/petugas/booking"
                    class="inline-flex items-center gap-1 text-xs font-bold text-[#FF9638] transition hover:text-orange-600">
                    Lihat Semua Booking
                    <span>→</span>
                </RouterLink>
            </div>

            <tableBooking tertanam :bookings="terdekat" :loading="loading" :sibuk="aksi.sedangProses.value"
                @detail="(b) => router.push(`/petugas/booking/${b._id}`)"
                @struk="(b) => router.push(`/petugas/booking/${b._id}/struk`)" @konfirmasi="aksi.konfirmasi"
                @selesai="aksi.selesai" @batal="aksi.batal" />
        </section>

    </div>
</template>