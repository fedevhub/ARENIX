<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AlertCircle } from 'lucide-vue-next'

import filterLapangan from '@/components/shared/filterLapangan.vue'
import cardLapangan from '@/components/shared/cardLapangan.vue'
import bannerLogin from '@/components/penyewa/bannerLogin.vue'

import { useDaftarLapangan } from '@/composables/useDaftarLapangan'
import { useMulaiBooking } from '@/composables/useMulaiBooking'
import { isLoggedIn } from '@/lib/auth'
import { tanggalPanjang, toYMD } from '@/lib/format'

const router = useRouter()
const login = isLoggedIn()
const { mulai } = useMulaiBooking()

const { tampil, loading, error, muat, pencarian, filterJenis, filterStatus, opsiJenis } = useDaftarLapangan()

onMounted(muat)
</script>

<template>
    <div class="mx-auto max-w-[1440px] px-6 pb-16 pt-10 lg:px-[72px]">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
                <h1 class="text-4xl font-semibold leading-tight text-[#142744] md:text-[40px]">
                    Lapangan &amp; Jadwal
                </h1>
                <p class="mt-1 text-base text-[#65758B]">
                    Lihat lapangan dan slot kosong. Login diperlukan hanya saat booking.
                </p>
            </div>
            <p class="pt-5 text-sm font-bold text-[#142744]">{{ tanggalPanjang(toYMD()) }}</p>
        </div>

        <div v-if="!login" class="mt-6">
            <bannerLogin ikon="info" kompak judul="Kamu belum masuk"
                teks="Booking memerlukan akun. Daftar atau login terlebih dahulu." />
        </div>

        <div class="mt-5">
            <filterLapangan v-model:pencarian="pencarian" v-model:jenis="filterJenis" v-model:status="filterStatus"
                :opsi-jenis="opsiJenis" :total="tampil.length" />
        </div>

        <div v-if="error" role="alert"
            class="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" /> {{ error }}
        </div>

        <div v-if="loading" class="mt-5 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            <div v-for="n in 6" :key="n" class="h-[352px] animate-pulse rounded-3xl bg-white" />
        </div>

        <p v-else-if="!tampil.length"
            class="mt-5 rounded-3xl border border-[#E1E8F0] bg-white py-16 text-center text-[#65758B]">
            Tidak ada lapangan yang cocok.
        </p>

        <div v-else class="mt-5 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            <cardLapangan v-for="l in tampil" :key="l._id" :lapangan="l" label-booking="Booking"
                @detail="router.push(`/lapangan/${l._id}`)" @booking="mulai(l._id)" />
        </div>
    </div>
</template>
