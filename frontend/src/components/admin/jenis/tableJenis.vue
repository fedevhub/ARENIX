<script setup>
import {
    ChevronLeft,
    ChevronRight,
    Pencil,
    Trash2,
    Layers,
} from 'lucide-vue-next'

import Button from '@/components/ui/button/Button.vue'

defineProps({
    jenis: {
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
</script>

<template>
    <section class="flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
        <!-- AREA TABEL YANG BISA DI-SCROLL -->
        <div class="table-scrollbar max-h-[calc(100vh-320px)] overflow-auto">

            <table class="w-full min-w-[500px] table-fixed border-collapse text-left text-sm">
                <colgroup>
                    <col class="w-[12%]" />
                    <col class="w-[58%]" />
                    <col class="w-[30%]" />
                </colgroup>

                <!-- HEADER TABEL -->
                <thead class="sticky top-0 z-10">
                    <tr class="border-b border-gray-200 bg-[#142744] text-xs font-semibold tracking-wider text-white">
                        <th class="px-4 py-4 text-center sm:px-6">
                            No
                        </th>

                        <th class="px-4 py-4 sm:px-6">
                            Nama Jenis
                        </th>

                        <th class="px-4 py-4 text-center sm:px-6">
                            Aksi
                        </th>
                    </tr>
                </thead>

                <!-- BODY TABEL -->
                <tbody class="divide-y divide-gray-100">

                    <!-- LOADING SKELETON -->
                    <template v-if="loading && jenis.length === 0">
                        <tr v-for="n in 5" :key="n" class="animate-pulse">
                            <td class="px-4 py-4 sm:px-6">
                                <div class="mx-auto h-4 w-6 rounded bg-gray-100" />
                            </td>

                            <td class="px-4 py-4 sm:px-6">
                                <div class="h-4 w-36 rounded bg-gray-100" />
                            </td>

                            <td class="px-4 py-4 sm:px-6">
                                <div class="mx-auto h-8 w-20 rounded-lg bg-gray-100" />
                            </td>
                        </tr>
                    </template>

                    <!-- EMPTY STATE -->
                    <tr v-else-if="jenis.length === 0">
                        <td colspan="3" class="px-6 py-16 text-center">
                            <div class="flex flex-col items-center justify-center">
                                <Layers :size="44" stroke-width="1.25" class="text-gray-400" />

                                <p class="mt-3 text-base font-semibold text-gray-900">
                                    Tidak ada data jenis lapangan
                                </p>

                                <p class="mt-1 text-sm text-gray-500">
                                    Belum ada jenis lapangan terdaftar
                                    atau hasil pencarian tidak ditemukan.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- DATA JENIS -->
                    <template v-else>
                        <tr v-for="(item, index) in jenis" :key="item._id ?? item.id"
                            class="transition-colors hover:bg-gray-50/80">
                            <td class="px-4 py-4 text-center text-sm font-medium text-gray-400 sm:px-6">
                                {{ infoRentang.mulai + index }}
                            </td>

                            <td class="px-4 py-4 font-semibold text-gray-900 sm:px-6">
                                {{ item.nama }}
                            </td>

                            <td class="px-4 py-4 sm:px-6">
                                <div class="flex items-center justify-center gap-2">
                                    <!-- EDIT -->
                                    <Button type="button" size="icon" variant="outline" title="Edit jenis"
                                        class="size-8 rounded-lg border-[#dfe3e8] bg-blue-50/60 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                                        @click="emit('edit', item)">
                                        <Pencil :size="14" />
                                    </Button>

                                    <!-- DELETE -->
                                    <Button type="button" size="icon" variant="outline" title="Hapus jenis"
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

        <!-- PAGINATION FOOTER (TETAP DI BAWAH) -->
        <div v-if="!loading && infoRentang.total > 0"
            class="flex shrink-0 flex-col items-center justify-between gap-4 border-t border-gray-100 bg-white px-6 py-4 sm:flex-row">
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

                jenis lapangan
            </p>

            <div class="flex items-center gap-1.5">

                <!-- SEBELUMNYA -->
                <Button type="button" variant="outline" size="sm"
                    class="h-8 rounded-lg border-[#dfe3e8] px-2.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
                    :disabled="halamanSaatIni <= 1" @click="
                        emit('ganti-halaman', halamanSaatIni - 1)
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
                        " @click="emit('ganti-halaman', nomor)">
                    {{ nomor }}
                </button>

                <!-- BERIKUTNYA -->
                <Button type="button" variant="outline" size="sm"
                    class="h-8 rounded-lg border-[#dfe3e8] px-2.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
                    :disabled="halamanSaatIni >= totalHalaman" @click="
                        emit('ganti-halaman', halamanSaatIni + 1)
                        ">
                    Berikutnya
                    <ChevronRight :size="15" class="ml-0.5" />
                </Button>

            </div>
        </div>
    </section>
</template>
