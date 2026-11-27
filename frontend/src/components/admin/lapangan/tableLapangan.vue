<script setup>
import {
    ChevronLeft,
    ChevronRight,
    Pencil,
    Trash2,
    LandPlot,
} from 'lucide-vue-next'

import Button from '@/components/ui/button/Button.vue'

defineProps({
    lapangan: {
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

function statusBadgeClass(status) {
    if (status === 'Aktif') {
        return 'bg-green-100 text-green-700'
    }

    if (status === 'Nonaktif') {
        return 'bg-red-100 text-red-700'
    }

    return 'bg-gray-100 text-gray-600'
}

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api'
const BASE_URL = API_URL.replace(/\/api\/?$/, '')

function gambarUrl(gambar) {
    if (!gambar) return ''

    if (/^https?:\/\//i.test(gambar)) {
        return gambar
    }

    const path = gambar.replace(/\\/g, '/').replace(/^\/+/, '')

    if (path.startsWith('uploads/')) {
        return `${BASE_URL}/${path}`
    }

    if (path.startsWith('lapangan/')) {
        return `${BASE_URL}/uploads/${path}`
    }

    return `${BASE_URL}/uploads/lapangan/${path}`
}
</script>

<template>
    <section class="flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">

        <!-- AREA TABEL YANG BISA DI-SCROLL -->
        <div class="table-scrollbar max-h-[calc(100vh-320px)] overflow-auto">
            <table class="w-full min-w-0 table-fixed border-collapse text-left text-xs">

                <colgroup>
                    <col style="width: 5%" />
                    <col style="width: 10%" />
                    <col style="width: 14%" />
                    <col style="width: 10%" />
                    <col style="width: 10%" />
                    <col style="width: 10%" />
                    <col style="width: 12%" />
                    <col style="width: 10%" />
                    <col style="width: 9%" />
                </colgroup>

                <thead class="sticky top-0 z-10">
                    <tr class="bg-[#142744] text-white">
                        <th class="px-4 py-3">No</th>
                        <th class="px-2 py-3">Gambar</th>
                        <th class="px-2 py-3">Nama Lapangan</th>
                        <th class="px-2 py-3">Jenis</th>
                        <th class="px-2 py-3">Jam Buka</th>
                        <th class="px-2 py-3">Jam Tutup</th>
                        <th class="px-2 py-3">Mulai Lampu</th>
                        <th class="px-2 py-3">Status</th>
                        <th class="px-2 py-3 text-center">Aksi</th>
                    </tr>
                </thead>

                <tbody class="divide-y divide-gray-100">

                    <template v-if="loading && lapangan.length === 0">
                        <tr v-for="n in 5" :key="n" class="animate-pulse">
                            <td v-for="kolom in 9" :key="kolom" class="px-2 py-4">
                                <div class="h-4 rounded bg-gray-100"></div>
                            </td>
                        </tr>
                    </template>

                    <tr v-else-if="lapangan.length === 0">
                        <td colspan="9">
                            <div class="flex min-h-[220px] flex-col items-center justify-center text-center">
                                <LandPlot :size="38" class="text-gray-400" />
                                <p class="mt-3 font-semibold text-gray-900">
                                    Tidak ada data lapangan
                                </p>
                                <p class="mt-1 text-gray-500">
                                    Belum ada lapangan terdaftar.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <template v-else>
                        <tr v-for="(item, index) in lapangan" :key="item._id ?? item.id"
                            class="transition-colors hover:bg-gray-50">
                            <!-- NO -->
                            <td class="px-4 py-3 text-gray-500">
                                {{ infoRentang.mulai + index }}
                            </td>

                            <!-- GAMBAR -->
                            <td class="px-2 py-4">
                                <div
                                    class="relative h-12 w-16 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                                    <img v-if="item.gambar" :src="gambarUrl(item.gambar)" :alt="item.nama"
                                        class="h-full w-full object-cover" @error="(event) => {
                                            event.target.style.display = 'none'
                                            event.target.nextElementSibling.style.display = 'flex'
                                        }" />

                                    <div
                                        class="absolute inset-0 hidden items-center justify-center text-[9px] text-gray-400">
                                        Gagal dimuat
                                    </div>
                                </div>
                            </td>

                            <!-- NAMA -->
                            <td class="break-words px-2 py-3 font-semibold text-gray-800">
                                {{ item.nama }}
                            </td>

                            <!-- JENIS -->
                            <td class="break-words px-2 py-3 text-gray-600">
                                {{ item.jenis_id?.nama ?? item.jenis?.nama ?? item.jenis ?? '-' }}
                            </td>

                            <!-- JAM BUKA -->
                            <td class="px-2 py-3 text-gray-600">
                                {{ item.jam_buka }}
                            </td>

                            <!-- JAM TUTUP -->
                            <td class="px-2 py-3 text-gray-600">
                                {{ item.jam_tutup }}
                            </td>

                            <!-- MULAI LAMPU -->
                            <td class="px-2 py-3 text-gray-600">
                                {{ item.jam_mulai_lampu }}
                            </td>

                            <!-- STATUS -->
                            <td class="px-2 py-3">
                                <span :class="[
                                    'inline-flex rounded-full px-2 py-1 text-[10px] font-semibold',
                                    statusBadgeClass(item.status)
                                ]">
                                    {{ item.status }}
                                </span>
                            </td>

                            <!-- AKSI -->
                            <td class="px-2 py-3">
                                <div class="flex items-center justify-center gap-1">
                                    <Button type="button" size="icon" variant="outline" title="Edit lapangan"
                                        class="size-7 rounded-md border-gray-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                                        @click="emit('edit', item)">
                                        <Pencil :size="13" />
                                    </Button>

                                    <Button type="button" size="icon" variant="outline" title="Hapus lapangan"
                                        class="size-7 rounded-md border-gray-200 bg-red-50 text-red-600 hover:bg-red-100"
                                        @click="emit('delete', item._id ?? item.id)">
                                        <Trash2 :size="13" />
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

                lapangan
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
