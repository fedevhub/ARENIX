<script setup>
import {
    ChevronLeft,
    ChevronRight,
    Pencil,
    Trash2,
    Tag,
} from 'lucide-vue-next'

import Button from '@/components/ui/button/Button.vue'

const props = defineProps({
    tarif: {
        type: Array,
        default: () => [],
    },
    // Opsional: kirim list lapangan jika item tarif hanya menyimpan lapangan_id
    lapanganList: {
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

const emit = defineEmits([
    'edit',
    'delete',
    'ganti-halaman',
])

const TAMBAHAN_WEEKEND = 20000
const TAMBAHAN_LAMPU = 15000

function getNamaLapangan(item) {
    // Jika backend mengirim data lapangan hasil populate
    if (item.lapangan_id && typeof item.lapangan_id === 'object') {
        return item.lapangan_id.nama ?? '-'
    }

    if (item.lapangan?.nama) {
        return item.lapangan.nama
    }

    if (item.nama_lapangan) {
        return item.nama_lapangan
    }

    if (item.nama) {
        return item.nama
    }

    // Jika hanya menyimpan ID lapangan
    const idLapangan = String(
        item.lapangan_id?._id ??
        item.lapangan_id?.id ??
        item.lapangan_id ??
        ''
    )

    const found = props.lapanganList.find(
        (lap) => String(lap._id ?? lap.id) === idLapangan
    )

    return found?.nama ?? '-'
}

function getHargaTampil(item) {
    // Jika harga_per_jam sudah termasuk tambahan dari modal/backend, langsung gunakan
    if (item.harga_per_jam !== undefined && item.harga_per_jam !== null) {
        return Number(item.harga_per_jam)
    }

    // Fallback: hitung otomatis sistem jika hanya tersedia harga_dasar
    let total = Number(item.harga_dasar) || 0
    if (item.tipe_hari === 'weekend') total += TAMBAHAN_WEEKEND
    if (item.pakai_lampu === 'ya') total += TAMBAHAN_LAMPU
    return total
}

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(Number(angka) || 0)
}
</script>

<template>
    <section class="flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">

        <!-- AREA TABEL YANG BISA DI-SCROLL -->
        <div class="hide-scrollbar max-h-[calc(100vh-340px)] overflow-auto">
            <table class="w-full min-w-[850px] border-collapse text-left text-sm">

                <!-- HEADER TABEL -->
                <thead class="sticky top-0 z-10">
                    <tr class="border-b border-gray-200 bg-[#142744] text-xs font-semibold tracking-wider text-white">
                        <th class="px-6 py-4">
                            No
                        </th>

                        <th class="px-6 py-4">
                            Nama Lapangan
                        </th>

                        <th class="px-6 py-4">
                            Tipe Hari
                        </th>

                        <th class="px-6 py-4">
                            Pakai Lampu
                        </th>

                        <th class="px-6 py-4">
                            Harga/Jam
                        </th>

                        <th class="px-6 py-4 text-center">
                            Aksi
                        </th>
                    </tr>
                </thead>

                <!-- BODY TABEL -->
                <tbody class="divide-y divide-gray-100">

                    <!-- LOADING SKELETON -->
                    <template v-if="loading && tarif.length === 0">
                        <tr v-for="n in 5" :key="n" class="animate-pulse">
                            <td class="px-6 py-4">
                                <div class="h-4 w-8 rounded bg-gray-100" />
                            </td>

                            <td class="px-6 py-4">
                                <div class="h-4 w-40 rounded bg-gray-100" />
                            </td>

                            <td class="px-6 py-4">
                                <div class="h-6 w-24 rounded-full bg-gray-100" />
                            </td>

                            <td class="px-6 py-4">
                                <div class="h-6 w-20 rounded-full bg-gray-100" />
                            </td>

                            <td class="px-6 py-4">
                                <div class="h-4 w-28 rounded bg-gray-100" />
                            </td>

                            <td class="px-6 py-4">
                                <div class="mx-auto h-8 w-20 rounded-lg bg-gray-100" />
                            </td>
                        </tr>
                    </template>

                    <!-- EMPTY STATE -->
                    <tr v-else-if="tarif.length === 0">
                        <td colspan="6" class="px-6 py-16 text-center">
                            <div class="flex flex-col items-center justify-center">
                                <Tag :size="44" stroke-width="1.25" class="text-gray-400" />

                                <p class="mt-3 text-base font-semibold text-gray-900">
                                    Tidak ada data tarif
                                </p>

                                <p class="mt-1 text-sm text-gray-500">
                                    Belum ada tarif terdaftar
                                    atau hasil pencarian tidak ditemukan.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <template v-else>
                        <tr v-for="(item, index) in tarif" :key="item._id ?? item.id"
                            class="transition-colors hover:bg-gray-50/80">

                            <!-- NOMOR -->
                            <td class="px-6 py-4 text-sm font-medium text-gray-400">
                                {{ infoRentang.mulai + index }}
                            </td>

                            <!-- NAMA LAPANGAN -->
                            <td class="px-6 py-4 font-semibold text-gray-900">
                                {{ getNamaLapangan(item) }}
                            </td>

                            <!-- TIPE HARI -->
                            <td class="px-6 py-4">
                                <span
                                    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize"
                                    :class="item.tipe_hari === 'weekend'
                                        ? 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200'
                                        : 'bg-slate-100 text-slate-700'
                                        ">
                                    {{ item.tipe_hari || '-' }}
                                </span>
                            </td>

                            <!-- PAKAI LAMPU -->
                            <td class="px-6 py-4">
                                <span
                                    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize"
                                    :class="item.pakai_lampu === 'ya'
                                        ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200'
                                        : 'bg-gray-100 text-gray-600'
                                        ">
                                    {{ item.pakai_lampu === 'ya' ? 'Ya' : 'Tidak' }}
                                </span>
                            </td>

                            <!-- HARGA PER JAM -->
                            <td class="px-6 py-4 font-semibold text-gray-900">
                                {{ formatRupiah(getHargaTampil(item)) }}
                            </td>

                            <!-- AKSI -->
                            <td class="px-6 py-4">
                                <div class="flex items-center justify-center gap-2">

                                    <!-- EDIT -->
                                    <Button type="button" size="icon" variant="outline" title="Edit tarif"
                                        class="size-8 rounded-lg border-[#dfe3e8] bg-blue-50/60 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                                        @click="emit('edit', item)">
                                        <Pencil :size="14" />
                                    </Button>

                                    <!-- DELETE -->
                                    <Button type="button" size="icon" variant="outline" title="Hapus tarif"
                                        class="size-8 rounded-lg border-[#dfe3e8] bg-red-50/60 text-red-600 hover:bg-red-100 hover:text-red-700"
                                        @click="
                                            emit(
                                                'delete',
                                                item._id ?? item.id
                                            )
                                            ">
                                        <Trash2 :size="14" />
                                    </Button>

                                </div>
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

                tarif
            </p>

            <!-- TOMBOL PAGINATION -->
            <div class="flex items-center gap-1.5">

                <!-- SEBELUMNYA -->
                <Button type="button" variant="outline" size="sm"
                    class="h-8 rounded-lg border-[#dfe3e8] px-2.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
                    :disabled="halamanSaatIni <= 1" @click="
                        emit(
                            'ganti-halaman',
                            halamanSaatIni - 1
                        )
                        ">
                    <ChevronLeft :size="15" class="mr-0.5" />

                    Sebelumnya
                </Button>

                <!-- NOMOR HALAMAN -->
                <button v-for="nomor in totalHalaman" :key="nomor" type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors"
                    :class="halamanSaatIni === nomor
                        ? 'bg-[#142744] text-white'
                        : 'border border-[#dfe3e8] bg-white text-gray-700 hover:bg-gray-50'
                        " @click="
                            emit('ganti-halaman', nomor)
                            ">
                    {{ nomor }}
                </button>

                <!-- BERIKUTNYA -->
                <Button type="button" variant="outline" size="sm"
                    class="h-8 rounded-lg border-[#dfe3e8] px-2.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
                    :disabled="halamanSaatIni >= totalHalaman" @click="
                        emit(
                            'ganti-halaman',
                            halamanSaatIni + 1
                        )
                        ">
                    Berikutnya

                    <ChevronRight :size="15" class="ml-0.5" />
                </Button>

            </div>
        </div>

    </section>
</template>