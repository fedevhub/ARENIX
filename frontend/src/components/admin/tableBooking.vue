<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'

const props = defineProps({
    items: { type: Array, default: () => [] },
})

const bookingTerbaru = computed(() => props.items.slice(0, 5))
</script>

<template>
    <div class="rounded-xl border border-[#E8EDF3] bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
            <h2 class="text-base font-semibold text-[#12284C]">
                Booking Terbaru
            </h2>

            <span>
                <RouterLink to="/admin/pendapatan"
                    class="inline-flex items-center gap-2 text-xs font-semibold text-[#FF9638] hover:text-[#E98228]">
                    Lihat Selengkapnya
                    <ArrowRight :size="15" />
                </RouterLink>
            </span>
        </div>

        <div class="mt-4 overflow-x-auto">
            <table class="w-full min-w-[480px] text-left text-sm">
                <thead>
                    <tr class="bg-[#F1F5F9] text-xs font-semibold text-[#64748B]">
                        <th class="rounded-l-md px-3 py-3">Kode</th>
                        <th class="px-3 py-3">Penyewa</th>
                        <th class="px-3 py-3">Lapangan</th>
                        <th class="rounded-r-md px-3 py-3">Status</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="b in bookingTerbaru" :key="b.id || b.kode"
                        class="border-b border-[#E8EDF3] text-xs text-[#1E293B] last:border-0">
                        <td class="whitespace-nowrap px-3 py-3.5 font-semibold">
                            {{ b.kode }}
                        </td>
                        <td class="px-3 py-3.5">{{ b.penyewa }}</td>
                        <td class="px-3 py-3.5">{{ b.lapangan }}</td>
                        <td class="px-3 py-3.5">
                            <span class="rounded-full px-2 py-1 text-[10px] font-semibold" :class="{
                                'bg-green-50 text-green-700': b.status === 'Selesai',
                                'bg-blue-50 text-blue-700': b.status === 'Dikonfirmasi',
                                'bg-orange-50 text-orange-700': b.status === 'Menunggu',
                                'bg-red-50 text-red-700': b.status === 'Dibatalkan',
                            }">
                                {{ b.status }}
                            </span>
                        </td>
                    </tr>

                    <tr v-if="!bookingTerbaru.length">
                        <td colspan="4" class="px-3 py-8 text-center text-sm text-gray-400">
                            Belum ada booking
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
