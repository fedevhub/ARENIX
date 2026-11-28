<script setup>
import { Inbox } from 'lucide-vue-next'
import statusBadge from '@/components/shared/statusBadge.vue'
import {
    kodeBooking, lapanganLabel, namaPenyewa, rentangJam, rupiah,
} from '@/lib/format'

defineProps({
    bookings: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    sibuk: { type: Boolean, default: false },
    tertanam: { type: Boolean, default: false }, // tanpa bingkai luar sendiri (dipasang di dalam kartu induk)
})

defineEmits(['detail', 'konfirmasi', 'selesai', 'batal', 'struk'])

const btn = 'inline-flex h-9 items-center justify-center whitespace-nowrap rounded-xl px-4 text-xs font-bold transition-colors disabled:opacity-50'
const btnGaris = 'border border-[#D5DFEC] bg-white text-[#142744] shadow-[0_1px_2px_rgba(20,39,68,0.03)] hover:bg-[#F8FAFC]'
</script>

<template>
    <div :class="tertanam
        ? 'overflow-hidden rounded-2xl border border-[#EEF2F7] bg-white'
        : 'overflow-hidden rounded-t-3xl border-x border-t border-[#E1E8F0] bg-white'">
        <div class="overflow-x-auto">
            <table class="w-full min-w-[820px] border-collapse text-left text-sm">
                <thead>
                    <tr class="bg-[#0F2342] text-[11px] font-bold uppercase tracking-wider text-white">
                        <th class="py-4 pl-6 pr-3">Kode</th>
                        <th class="px-4 py-4">Penyewa</th>
                        <th class="px-4 py-4">Lapangan &amp; Jam</th>
                        <th class="px-4 py-4">Total</th>
                        <th class="px-4 py-4">Status</th>
                        <th class="py-4 pl-4 pr-6">Aksi Cepat</th>
                    </tr>
                </thead>

                <tbody class="divide-y divide-[#EEF2F7] bg-white">
                    <template v-if="loading && !bookings.length">
                        <tr v-for="n in 5" :key="n" class="animate-pulse">
                            <td class="py-6 pl-6 pr-3">
                                <div class="h-4 w-20 rounded bg-slate-100" />
                            </td>
                            <td v-for="k in 4" :key="k" class="px-4 py-6">
                                <div class="h-4 rounded bg-slate-100" />
                            </td>
                            <td class="py-6 pl-4 pr-6">
                                <div class="h-9 w-28 rounded-xl bg-slate-100" />
                            </td>
                        </tr>
                    </template>

                    <tr v-else-if="!bookings.length">
                        <td colspan="6">
                            <div class="flex min-h-52 flex-col items-center justify-center px-6 py-10 text-center">
                                <Inbox :size="36" class="text-slate-300" />
                                <p class="mt-3 font-bold text-[#142744]">Belum ada booking</p>
                                <p class="text-sm text-[#65758B]">Booking yang sesuai akan tampil di sini.</p>
                            </div>
                        </td>
                    </tr>

                    <tr v-for="b in bookings" v-else :key="b._id"
                        class="align-middle transition-colors hover:bg-[#F8FAFC]/80">
                        <td class="whitespace-nowrap py-5 pl-6 pr-3">
                            <button type="button" class="text-[13px] font-bold text-[#142744] hover:underline"
                                @click="$emit('detail', b)">
                                {{ kodeBooking(b) }}
                            </button>
                        </td>
                        <td class="px-4 py-5 text-[13px] font-bold text-[#142744]">
                            {{ namaPenyewa(b) }}<span v-if="b.tipe === 'Walk-in'" class="font-bold">
                                (Walk-in)</span>
                        </td>
                        <td class="px-4 py-5">
                            <p class="text-[13px] font-bold leading-snug text-[#142744]">{{ lapanganLabel(b) }}</p>
                            <p class="mt-0.5 text-xs text-[#65758B]">{{ rentangJam(b.jam_mulai, b.jam_selesai) }} ({{
                                b.durasi_jam }} jam)</p>
                        </td>
                        <td class="whitespace-nowrap px-4 py-5 text-[13px] font-bold text-[#142744]">
                            {{ rupiah(b.total_biaya) }}
                        </td>
                        <td class="whitespace-nowrap px-4 py-5">
                            <statusBadge :status="b.status" />
                        </td>
                        <td class="py-5 pl-4 pr-6">
                            <div class="flex flex-wrap items-center gap-2">
                                <template v-if="b.status === 'Menunggu'">
                                    <button :disabled="sibuk"
                                        :class="[btn, 'bg-[#FF9638] px-5 text-white hover:bg-[#FF8C24]']"
                                        @click="$emit('konfirmasi', b)">Konfirmasi</button>
                                    <button :disabled="sibuk"
                                        :class="[btn, 'border border-[#F9C5C5] bg-[#FEEFEF] text-[#DC2626] hover:bg-[#FDE2E2]']"
                                        @click="$emit('batal', b)">Batalkan</button>
                                </template>

                                <template v-else-if="b.status === 'Dikonfirmasi'">
                                    <button :disabled="sibuk"
                                        :class="[btn, 'bg-[#142744] px-5 text-white hover:bg-[#1c3a63]']"
                                        @click="$emit('selesai', b)">Tandai Selesai</button>
                                    <button :class="[btn, btnGaris]" @click="$emit('struk', b)">Struk</button>
                                </template>

                                <button v-else-if="b.status === 'Selesai'" :class="[btn, btnGaris]"
                                    @click="$emit('struk', b)">Lihat &amp;
                                    Cetak Bukti</button>

                                <button v-else :class="[btn, btnGaris]" @click="$emit('detail', b)">Lihat
                                    Detail</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>