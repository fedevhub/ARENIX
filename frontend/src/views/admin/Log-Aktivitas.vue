<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { AlertCircle } from 'lucide-vue-next'

import LogAktivitas from '@/components/admin/logAktivitas.vue'
import { getLogAktivitas } from '@/services/logAktivitasService'

const daftarAktivitas = ref([])
const loading = ref(false)
const errorMessage = ref('')

// Pagination
const halamanSaatIni = ref(1)
const itemPerHalaman = ref(8)

// Tanggal hari ini
const tanggal = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
}).format(new Date())

// Mengambil data log aktivitas
async function ambilLogAktivitas() {
    loading.value = true
    errorMessage.value = ''

    try {
        const response = await getLogAktivitas()

        const hasil = response.data.data ?? response.data

        if (!Array.isArray(hasil)) {
            throw new TypeError(
                'Respons API tidak berisi daftar aktivitas.'
            )
        }

        daftarAktivitas.value = hasil
    } catch (error) {
        console.error('Gagal mengambil log aktivitas:', error)

        errorMessage.value =
            error.response?.data?.message ??
            'Gagal mengambil data riwayat aktivitas.'
    } finally {
        loading.value = false
    }
}

// Total halaman
const totalHalaman = computed(() =>
    Math.max(
        1,
        Math.ceil(
            daftarAktivitas.value.length / itemPerHalaman.value
        )
    )
)

// Data sesuai halaman
const aktivitasPaginasi = computed(() => {
    const mulai =
        (halamanSaatIni.value - 1) * itemPerHalaman.value

    return daftarAktivitas.value.slice(
        mulai,
        mulai + itemPerHalaman.value
    )
})

// Informasi rentang data
const infoRentangData = computed(() => {
    const total = daftarAktivitas.value.length

    if (total === 0) {
        return {
            mulai: 0,
            akhir: 0,
            total: 0,
        }
    }

    const mulai =
        (halamanSaatIni.value - 1) * itemPerHalaman.value + 1

    const akhir = Math.min(
        halamanSaatIni.value * itemPerHalaman.value,
        total
    )

    return {
        mulai,
        akhir,
        total,
    }
})

// Reset halaman jika jumlah data berubah
watch(totalHalaman, (total) => {
    if (halamanSaatIni.value > total) {
        halamanSaatIni.value = total
    }
})

// Ambil data saat halaman dibuka
onMounted(ambilLogAktivitas)
</script>

<template>
    <main class="min-h-full bg-[#F4F6F8] p-4 sm:p-6 md:p-8" style="font-family: 'DM Sans', Arial, sans-serif">
        <!-- HEADER -->
        <div>
            <h1 class="font-display text-3xl font-extrabold tracking-tight text-[#142744] md:text-4xl">
                Riwayat Aktivitas
            </h1>

            <div class="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p class="text-base font-medium text-slate-600">
                    Kelola dan pantau aktivitas Arenix
                </p>

                <p class="text-base font-medium text-slate-600">
                    {{ tanggal }}
                </p>
            </div>
        </div>

        <!-- ERROR ALERT -->
        <div v-if="errorMessage" role="alert"
            class="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" />
            <span>{{ errorMessage }}</span>
        </div>

        <!-- TABEL AKTIVITAS -->
        <div class="mt-6">
            <LogAktivitas :aktivitas="aktivitasPaginasi" :loading="loading" :halaman-saat-ini="halamanSaatIni"
                :total-halaman="totalHalaman" :info-rentang="infoRentangData"
                @ganti-halaman="halamanSaatIni = $event" />
        </div>
    </main>
</template>
