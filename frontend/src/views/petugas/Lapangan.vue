<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AlertCircle } from 'lucide-vue-next'

import headerHalaman from '@/components/shared/headerHalaman.vue'
import filterLapangan from '@/components/shared/filterLapangan.vue'
import cardLapangan from '@/components/shared/cardLapangan.vue'
import { useDaftarLapangan } from '@/composables/useDaftarLapangan'

const router = useRouter()

const { tampil, loading, error, muat, pencarian, filterJenis, filterStatus, opsiJenis } = useDaftarLapangan()

onMounted(muat)
</script>

<template>
    <div class="min-h-full p-4 sm:p-6 md:p-8">
        <headerHalaman judul="Lapangan & Jadwal" subjudul="Pilih lapangan untuk melihat jadwal dan membuat booking" />

        <div class="mt-6">
            <filterLapangan v-model:pencarian="pencarian" v-model:jenis="filterJenis" v-model:status="filterStatus"
                :opsi-jenis="opsiJenis" :total="tampil.length" />
        </div>

        <div v-if="error" role="alert"
            class="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" /> {{ error }}
        </div>

        <div v-if="loading" class="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <div v-for="n in 6" :key="n" class="h-80 animate-pulse rounded-2xl bg-white" />
        </div>

        <p v-else-if="!tampil.length"
            class="mt-6 rounded-2xl border border-[#E1E8F0] bg-white py-16 text-center text-[#65758B]">
            Tidak ada lapangan yang cocok.
        </p>

        <div v-else class="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <cardLapangan v-for="l in tampil" :key="l._id" :lapangan="l" label-booking="+ Sewa"
                @detail="router.push(`/petugas/lapangan/${l._id}`)"
                @booking="router.push(`/petugas/booking/baru/${l._id}`)" />
        </div>
    </div>
</template>
