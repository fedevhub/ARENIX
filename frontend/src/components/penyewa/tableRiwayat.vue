<script setup>
import { Inbox } from 'lucide-vue-next'
import statusBadge from '@/components/shared/statusBadge.vue'
import { kodeBooking, lapanganLabel, rentangJam, rupiah, tanggalSingkat } from '@/lib/format'

defineProps({
    bookings: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
})

defineEmits(['detail', 'batal', 'bukti'])

const btn = 'h-10 rounded-xl px-6 text-[13px] font-bold transition-colors'
const btnGaris = 'border-2 border-[#D5DFEC] bg-white text-[#142744] hover:bg-[#F4F6F8]'
</script>

<template>
    <div
        class="overflow-hidden rounded-3xl border border-[#E1E8F0] bg-white p-5 shadow-[0_2px_8px_rgba(20,39,68,0.04)]">
        <div class="overflow-x-auto">
            <table class="w-full min-w-195 text-left text-sm">
                <thead>
                    <tr class="bg-[#142744] text-[11px] font-bold uppercase text-white">
                        <th class="rounded-l-2xl px-7 py-3.5">Kode</th>
                        <th class="px-3 py-3.5">Lapangan &amp; Jadwal</th>
                        <th class="px-3 py-3.5">Total</th>
                        <th class="px-3 py-3.5">Status</th>
                        <th class="rounded-r-2xl px-3 py-3.5">Aksi</th>
                    </tr>
                </thead>

                <tbody class="divide-y divide-[#EEF2F7]">
                    <template v-if="loading && !bookings.length">
                        <tr v-for="n in 4" :key="n" class="animate-pulse">
                            <td v-for="k in 5" :key="k" class="px-4 py-7">
                                <div class="h-4 rounded bg-slate-100" />
                            </td>
                        </tr>
                    </template>

                    <tr v-else-if="!bookings.length">
                        <td colspan="5">
                            <div class="flex min-h-52 flex-col items-center justify-center text-center">
                                <Inbox :size="36" class="text-slate-300" />
                                <p class="mt-3 font-bold text-[#142744]">Belum ada booking</p>
                                <RouterLink to="/lapangan"
                                    class="mt-1 text-sm font-bold text-[#FF9638] hover:underline">
                                    Cari lapangan →
                                </RouterLink>
                            </div>
                        </td>
                    </tr>

                    <tr v-for="b in bookings" v-else :key="b._id" class="hover:bg-[#F8FAFC]">
                        <td class="px-7 py-6 text-[13px] font-bold text-[#142744]">{{ kodeBooking(b) }}</td>
                        <td class="px-3 py-6">
                            <p class="text-[13px] font-bold text-[#142744]">{{ lapanganLabel(b) }}</p>
                            <p class="mt-0.5 text-xs text-[#65758B]">
                                {{ tanggalSingkat(b.tanggal) }} • {{ rentangJam(b.jam_mulai, b.jam_selesai) }} ({{
                                    b.durasi_jam }} jam)
                            </p>
                        </td>
                        <td class="px-3 py-6 text-[13px] font-bold text-[#142744]">{{ rupiah(b.total_biaya) }}</td>
                        <td class="px-3 py-6">
                            <statusBadge :status="b.status" />
                        </td>
                        <td class="px-3 py-6">
                            <div class="flex flex-wrap gap-3">
                                <button :class="[btn, btnGaris]" @click="$emit('detail', b)">Detail</button>

                                <button v-if="b.status === 'Menunggu'"
                                    :class="[btn, 'border border-[#F9C5C5] bg-[#FEEFEF] text-[#DC2626] hover:bg-[#FDE2E2]']"
                                    @click="$emit('batal', b)">Batalkan</button>

                                <button v-if="b.status === 'Dikonfirmasi'"
                                    :class="[btn, 'min-w-44 bg-[#FF9638] text-white hover:bg-[#FF8C24]']"
                                    @click="$emit('bukti', b)">Lihat
                                    &amp; Cetak Bukti</button>

                                <button v-if="b.status === 'Selesai'" :class="[btn, btnGaris, 'min-w-44']"
                                    @click="$emit('bukti', b)">Lihat
                                    Bukti</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>