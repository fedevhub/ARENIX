<script setup>
import { computed } from 'vue'
import { Clock, Info, LandPlot } from 'lucide-vue-next'
import { gambarUrl, jam, rupiah } from '@/lib/format'

const props = defineProps({
    lapangan: { type: Object, required: true },
    labelBooking: { type: String, default: 'Booking' },
})

defineEmits(['detail', 'booking'])

const aktif = computed(() => props.lapangan.status === 'Aktif')
</script>

<template>
    <article
        class="flex flex-col rounded-3xl border border-[#E1E8F0] bg-white p-3.5 shadow-[0_2px_8px_rgba(20,39,68,0.04)]">
        <!-- Gambar -->
        <div class="relative h-[170px] overflow-hidden rounded-2xl bg-slate-100">
            <img v-if="lapangan.gambar" :src="gambarUrl(lapangan.gambar)" :alt="lapangan.nama"
                class="h-full w-full object-cover" />
            <div v-else class="flex h-full items-center justify-center text-slate-300">
                <LandPlot :size="40" />
            </div>

            <span
                class="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold"
                :class="aktif ? 'bg-[#E9F9F0] text-[#0E8A4F]' : 'bg-[#FFF3E7] text-[#B45309]'">
                <span class="size-1.5 rounded-full" :class="aktif ? 'bg-[#10B981]' : 'bg-[#F59E0B]'" />
                {{ aktif ? 'Aktif' : 'Maintenance' }}
            </span>
        </div>

        <!-- Isi -->
        <div class="flex flex-1 flex-col px-0.5 pt-4">
            <div class="flex items-center justify-between gap-2">
                <span v-if="lapangan.jenis_id?.nama"
                    class="rounded-full bg-[#EAF1FF] px-3 py-1 text-[11px] font-bold text-[#2358D6]">
                    {{ lapangan.jenis_id.nama }}
                </span>
                <span v-else />
                <span class="text-xs" :class="aktif ? 'text-[#65758B]' : 'font-semibold text-[#B45309]'">
                    {{ aktif ? `${lapangan.slotTersedia ?? 0} slot tersedia` : 'Sedang maintenance' }}
                </span>
            </div>

            <h3 class="mt-3 text-xl font-semibold leading-tight text-[#142744]">{{ lapangan.nama }}</h3>

            <div class="mt-2 flex items-end justify-between gap-2">
                <p class="flex items-center gap-1.5 text-xs text-[#65758B]">
                    <Clock class="size-4" />
                    {{ jam(lapangan.jam_buka) }} – {{ jam(lapangan.jam_tutup) }} WIB
                </p>
                <p class="text-[#142744]">
                    <span class="text-lg font-bold">{{ lapangan.harga != null ? rupiah(lapangan.harga) : '-' }}</span>
                    <span class="ml-1 text-xs text-[#65758B]">/jam</span>
                </p>
            </div>

            <div class="mt-3 flex gap-3 border-t border-[#EEF2F7] pt-3">
                <button type="button"
                    class="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#D5DFEC] bg-white text-sm font-bold text-[#142744] transition-colors hover:bg-[#F4F6F8]"
                    @click="$emit('detail', lapangan)">
                    <Info class="size-4" />
                    Detail
                </button>

                <button v-if="aktif" type="button"
                    class="h-10 flex-1 rounded-xl bg-[#FF9638] text-sm font-bold text-white transition-colors hover:bg-[#FF8C24]"
                    @click="$emit('booking', lapangan)">
                    {{ labelBooking }}
                </button>
                <button v-else type="button" disabled
                    class="h-10 flex-1 cursor-not-allowed rounded-xl bg-slate-100 text-sm font-bold text-slate-400">
                    Tidak Tersedia
                </button>
            </div>
        </div>
    </article>
</template>