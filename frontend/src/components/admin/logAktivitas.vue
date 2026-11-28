<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight, Activity } from 'lucide-vue-next'

import Button from '@/components/ui/button/Button.vue'

const props = defineProps({
    aktivitas: {
        type: Array,
        default: () => [],
    },
    loading: Boolean,
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

function formatWaktu(waktu) {
    if (!waktu) return '-'

    return new Date(waktu).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function namaPengguna(item) {
    return (
        item.user_id?.nama ||
        item.user_id?.username ||
        item.user_id?.name ||
        item.user_id ||
        '-'
    )
}

function formatAksi(aksi) {
    if (!aksi) return '-'

    return String(aksi)
        .replaceAll('_', ' ')
        .replace(/\b\w/g, huruf => huruf.toUpperCase())
}

function formatKodeBooking(booking) {
    const id = booking?._id || booking

    if (!id) return '-'

    return `ARENIX-${String(id).slice(-6).toUpperCase()}`
}
</script>

<template>
    <section class="flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">

        <div class="table-scrollbar max-h-[calc(100vh-320px)] overflow-auto">
            <table class="w-full min-w-[650px] table-fixed border-collapse text-left text-sm">

                <colgroup>
                    <col class="w-[10%]" />
                    <col class="w-[25%]" />
                    <col class="w-[25%]" />
                    <col class="w-[18%]" />
                    <col class="w-[22%]" />
                </colgroup>

                <thead class="sticky top-0 z-10">
                    <tr class="border-b border-gray-200 bg-[#142744] text-xs font-semibold tracking-wider text-white">
                        <th class="px-4 py-4 text-center sm:px-6">No</th>
                        <th class="px-4 py-4 sm:px-6">Pengguna</th>
                        <th class="px-4 py-4 sm:px-6">Aktivitas</th>
                        <th class="px-4 py-4 text-center sm:px-6">Kode Booking</th>
                        <th class="px-4 py-4 text-center sm:px-6">Waktu</th>
                    </tr>
                </thead>

                <tbody class="divide-y divide-gray-100">

                    <!-- Loading -->
                    <template v-if="loading && aktivitas.length === 0">
                        <tr v-for="n in 5" :key="n" class="animate-pulse">
                            <td v-for="i in 5" :key="i" class="px-4 py-5">
                                <div class="h-4 rounded bg-gray-100" />
                            </td>
                        </tr>
                    </template>

                    <!-- Empty State -->
                    <tr v-else-if="aktivitas.length === 0">
                        <td colspan="5" class="px-6 py-16 text-center">
                            <div class="flex flex-col items-center">
                                <Activity :size="44" stroke-width="1.25" class="text-gray-400" />

                                <p class="mt-3 text-base font-semibold text-gray-900">
                                    Tidak ada aktivitas
                                </p>

                                <p class="mt-1 text-sm text-gray-500">
                                    Belum ada riwayat aktivitas yang tercatat.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Data -->
                    <tr v-for="(item, index) in aktivitas" v-else :key="item._id"
                        class="transition-colors hover:bg-gray-50/80">
                        <td class="px-4 py-4 text-center font-medium text-gray-400 sm:px-6">
                            {{ infoRentang.mulai + index }}
                        </td>

                        <td class="px-4 py-4 font-semibold text-gray-900 sm:px-6">
                            {{ namaPengguna(item) }}
                        </td>

                        <td class="px-4 py-4 sm:px-6">
                            <span
                                class="inline-flex rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                {{ formatAksi(item.aksi) }}
                            </span>
                        </td>

                        <td class="px-4 py-4 text-center text-gray-700 sm:px-6">
                            <span v-if="item.booking_id" class="font-semibold text-[#142744]">
                                {{ formatKodeBooking(item.booking_id) }}
                            </span>
                            <span v-else>-</span>
                        </td>

                        <td class="px-4 py-4 text-center text-xs text-gray-500 sm:px-6">
                            {{ formatWaktu(item.waktu) }}
                        </td>
                    </tr>

                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div v-if="!loading && infoRentang.total > 0"
            class="flex shrink-0 flex-col items-center justify-between gap-4 border-t border-gray-100 bg-white px-6 py-4 sm:flex-row">
            <p class="text-xs text-gray-500">
                Menampilkan
                <span class="font-semibold text-gray-900">{{ infoRentang.mulai }}</span>
                –
                <span class="font-semibold text-gray-900">{{ infoRentang.akhir }}</span>
                dari
                <span class="font-semibold text-gray-900">{{ infoRentang.total }}</span>
                aktivitas
            </p>

            <div class="flex items-center gap-1.5">
                <Button type="button" variant="outline" size="sm" class="h-8 rounded-lg border-[#dfe3e8] px-2.5 text-xs"
                    :disabled="halamanSaatIni <= 1" @click="emit('ganti-halaman', halamanSaatIni - 1)">
                    <ChevronLeft :size="15" />
                    Sebelumnya
                </Button>

                <button v-for="nomor in totalHalaman" :key="nomor" type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold" :class="halamanSaatIni === nomor
                        ? 'bg-[#142744] text-white'
                        : 'border border-[#dfe3e8] bg-white text-gray-700 hover:bg-gray-50'"
                    @click="emit('ganti-halaman', nomor)">
                    {{ nomor }}
                </button>

                <Button type="button" variant="outline" size="sm" class="h-8 rounded-lg border-[#dfe3e8] px-2.5 text-xs"
                    :disabled="halamanSaatIni >= totalHalaman" @click="emit('ganti-halaman', halamanSaatIni + 1)">
                    Berikutnya
                    <ChevronRight :size="15" />
                </Button>
            </div>
        </div>
    </section>
</template>