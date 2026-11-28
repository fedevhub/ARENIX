<script setup>
import {
    ChevronLeft,
    ChevronRight,
    Users,
} from 'lucide-vue-next'

import Button from '@/components/ui/button/Button.vue'

defineProps({
    pendapatan: {
        type: Array,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: false,
    },
    halamanSaatIni: {
        type: Number,
        default: 1,
    },
    totalHalaman: {
        type: Number,
        default: 1,
    },
    infoRentang: {
        type: Object,
        default: () => ({
            mulai: 0,
            akhir: 0,
            total: 0,
        }),
    },
})

const emit = defineEmits(['ganti-halaman'])

function getNamaPenyewa(item) {
    return (
        item.user_id?.nama ||
        item.user_id?.username ||
        item.nama_penyewa ||
        '-'
    )
}

// Mengambil nama lapangan dari relasi lapangan_id
function getNamaLapangan(item) {
    return item.lapangan_id?.nama || '-'
}

// Mengambil dan memformat tanggal booking
function getTanggalBooking(item) {
    if (!item.tanggal) return '-'

    const date = new Date(item.tanggal)

    if (Number.isNaN(date.getTime())) return '-'

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date)
}

function getDurasi(item) {
    const durasi = Number(item.durasi_jam) || 0;
    return durasi > 0 ? `${durasi} Jam` : '-';
}

function getTotalBayar(item) {
    return Number(item.total_biaya) || 0
}

// Format rupiah
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(angka)
}
</script>

<template>
    <section class="flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
        <!-- AREA TABEL -->
        <div class="hide-scrollbar max-h-[calc(100vh-340px)] overflow-auto">
            <table class="w-full min-w-[850px] border-collapse text-left text-sm">

                <!-- HEADER -->
                <thead class="sticky top-0 z-10">
                    <tr class="border-b border-gray-200 bg-[#142744] text-xs font-semibold tracking-wider text-white">
                        <th class="px-6 py-4">
                            No
                        </th>

                        <th class="px-6 py-4">
                            Nama Penyewa
                        </th>

                        <th class="px-6 py-4">
                            Nama Lapangan
                        </th>

                        <th class="px-6 py-4">
                            Tanggal
                        </th>

                        <th class="px-6 py-4 text-center">
                            Durasi
                        </th>

                        <th class="px-6 py-4 text-center">
                            Total Bayar
                        </th>
                    </tr>
                </thead>

                <!-- BODY -->
                <tbody class="divide-y divide-gray-100">

                    <!-- LOADING -->
                    <template v-if="loading && pendapatan.length === 0">
                        <tr v-for="n in 5" :key="n" class="animate-pulse">
                            <td class="px-6 py-4">
                                <div class="h-4 w-14 rounded bg-gray-100" />
                            </td>

                            <td class="px-6 py-4">
                                <div class="h-4 w-36 rounded bg-gray-100" />
                            </td>

                            <td class="px-6 py-4">
                                <div class="h-4 w-24 rounded bg-gray-100" />
                            </td>

                            <td class="px-6 py-4">
                                <div class="h-4 w-44 rounded bg-gray-100" />
                            </td>

                            <td class="px-6 py-4">
                                <div class="mx-auto h-6 w-20 rounded-full bg-gray-100" />
                            </td>

                            <td class="px-6 py-4">
                                <div class="mx-auto h-8 w-24 rounded-lg bg-gray-100" />
                            </td>
                        </tr>
                    </template>

                    <!-- DATA KOSONG -->
                    <tr v-else-if="pendapatan.length === 0">
                        <td colspan="6" class="px-6 py-16 text-center">
                            <div class="flex flex-col items-center justify-center">
                                <Users :size="44" stroke-width="1.25" class="text-gray-400" />

                                <p class="mt-3 text-base font-semibold text-gray-900">
                                    Tidak ada data pendapatan
                                </p>

                                <p class="mt-1 text-sm text-gray-500">
                                    Belum ada pendapatan terdaftar
                                    atau hasil pencarian tidak ditemukan.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- DATA BOOKING -->
                    <template v-else>
                        <tr v-for="(item, index) in pendapatan" :key="item._id"
                            class="transition-colors hover:bg-gray-50/80">
                            <!-- NOMOR -->
                            <td class="px-6 py-4 text-sm font-medium text-gray-400">
                                {{ infoRentang.mulai + index }}
                            </td>

                            <!-- NAMA PENYEWA -->
                            <td class="px-6 py-4 font-semibold text-gray-900">
                                {{ getNamaPenyewa(item) }}
                            </td>

                            <!-- NAMA LAPANGAN -->
                            <td class="px-6 py-4 text-gray-600">
                                {{ getNamaLapangan(item) }}
                            </td>

                            <!-- TANGGAL -->
                            <td class="px-6 py-4 text-gray-600">
                                {{ getTanggalBooking(item) }}
                            </td>

                            <td class="px-6 py-4 text-center text-gray-600">
                                {{ getDurasi(item) }}
                            </td>

                            <!-- TOTAL BAYAR -->
                            <td class="px-6 py-4 text-center font-semibold text-gray-900">
                                {{ formatRupiah(getTotalBayar(item)) }}
                            </td>
                        </tr>
                    </template>

                </tbody>
            </table>
        </div>

        <!-- PAGINATION FOOTER -->
        <div v-if="!loading && infoRentang.total > 0"
            class="flex shrink-0 flex-col items-center justify-between gap-4 border-t border-gray-100 bg-white px-6 py-4 sm:flex-row">
            <!-- INFO DATA -->
            <p class="text-xs text-gray-500">
                Menampilkan

                <span class="font-semibold text-gray-900">
                    {{ infoRentang.mulai }}
                </span>

                –

                <span class="font-semibold text-gray-900">
                    {{ infoRentang.akhir }}
                </span>

                dari

                <span class="font-semibold text-gray-900">
                    {{ infoRentang.total }}
                </span>

                pendapatan
            </p>

            <!-- TOMBOL PAGINATION -->
            <div class="flex items-center gap-1.5">

                <!-- SEBELUMNYA -->
                <Button type="button" variant="outline" size="sm"
                    class="h-8 rounded-lg border-[#dfe3e8] px-2.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
                    :disabled="halamanSaatIni <= 1" @click="emit('ganti-halaman', halamanSaatIni - 1)">
                    <ChevronLeft :size="15" class="mr-0.5" />
                    Sebelumnya
                </Button>

                <!-- NOMOR HALAMAN -->
                <button v-for="nomor in totalHalaman" :key="nomor" type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors"
                    :class="halamanSaatIni === nomor
                            ? 'bg-[#142744] text-white'
                            : 'border border-[#dfe3e8] bg-white text-gray-700 hover:bg-gray-50'
                        " @click="emit('ganti-halaman', nomor)">
                    {{ nomor }}
                </button>

                <!-- BERIKUTNYA -->
                <Button type="button" variant="outline" size="sm"
                    class="h-8 rounded-lg border-[#dfe3e8] px-2.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
                    :disabled="halamanSaatIni >= totalHalaman" @click="emit('ganti-halaman', halamanSaatIni + 1)">
                    Berikutnya
                    <ChevronRight :size="15" class="ml-0.5" />
                </Button>

            </div>
        </div>
    </section>
</template>
