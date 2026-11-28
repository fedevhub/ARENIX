<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertCircle, Check, Wallet } from 'lucide-vue-next'

import statusBadge from '@/components/shared/statusBadge.vue'
import modalBatalBooking from '@/components/penyewa/modalBatalBooking.vue'

import { batalkanBooking, getBookingDetail } from '@/services/bookingService'
import { kodeBooking, lapanganLabel, namaPenyewa, rentangJam, rupiah, tanggalPanjang } from '@/lib/format'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const booking = ref(null)
const loading = ref(true)
const error = ref('')

const modalBatal = ref(false)
const membatalkan = ref(false)
const galatBatal = ref('')

async function muat() {
    try {
        const res = await getBookingDetail(id)
        booking.value = res.data.data
    } catch (e) {
        error.value = e.response?.data?.message ?? 'Gagal memuat booking.'
    } finally {
        loading.value = false
    }
}

async function batalkan() {
    membatalkan.value = true
    galatBatal.value = ''
    try {
        await batalkanBooking(id)
        modalBatal.value = false
        await muat()
    } catch (e) {
        galatBatal.value = e.response?.data?.message ?? 'Gagal membatalkan booking.'
    } finally {
        membatalkan.value = false
    }
}

onMounted(muat)
</script>

<template>
    <div class="mx-auto max-w-[728px] px-6 py-12">
        <div v-if="error" role="alert"
            class="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" /> {{ error }}
        </div>

        <div v-else-if="loading" class="h-[640px] animate-pulse rounded-[32px] bg-white" />

        <div v-else-if="booking"
            class="rounded-[32px] border border-[#E1E8F0] bg-white p-8 shadow-[0_2px_8px_rgba(20,39,68,0.04)] sm:p-10">
            <!-- Header -->
            <div class="text-center">
                <span class="mx-auto flex size-[76px] items-center justify-center rounded-full bg-[#E3F5EC]">
                    <span class="flex size-[52px] items-center justify-center rounded-full bg-[#10B981]">
                        <Check :size="28" :stroke-width="3" class="text-white" />
                    </span>
                </span>
                <h1 class="mt-5 text-[28px] font-semibold leading-tight text-[#142744]">
                    {{ booking.status === 'Dibatalkan' ? 'Booking dibatalkan' : 'Booking berhasil dibuat' }}
                </h1>
                <p v-if="booking.status === 'Menunggu'" class="mt-2 text-sm text-[#65758B]">
                    Selesaikan pembayaran di kasir agar petugas bisa mengonfirmasi.
                </p>
            </div>

            <!-- Kode booking -->
            <div class="mt-7 flex items-start justify-between gap-3 rounded-2xl bg-[#F0F3F8] px-6 py-5">
                <div>
                    <p class="text-[11px] font-bold uppercase text-[#65758B]">Kode Booking</p>
                    <p class="mt-1 text-[32px] font-bold leading-tight text-[#142744]">{{ kodeBooking(booking) }}</p>
                </div>
                <statusBadge :status="booking.status" class="mt-2" />
            </div>

            <!-- Rincian -->
            <dl class="mt-6 space-y-3.5 text-sm">
                <div class="flex justify-between gap-4">
                    <dt class="text-[#65758B]">Lapangan</dt>
                    <dd class="text-right font-bold text-[#142744]">{{ lapanganLabel(booking) }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                    <dt class="text-[#65758B]">Tanggal main</dt>
                    <dd class="text-right font-bold text-[#142744]">{{ tanggalPanjang(booking.tanggal) }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                    <dt class="text-[#65758B]">Jam main</dt>
                    <dd class="text-right font-bold text-[#142744]">
                        {{ rentangJam(booking.jam_mulai, booking.jam_selesai) }} ({{ booking.durasi_jam }} jam)
                    </dd>
                </div>
                <div class="flex justify-between gap-4">
                    <dt class="text-[#65758B]">Atas nama</dt>
                    <dd class="text-right font-bold text-[#142744]">{{ namaPenyewa(booking) }}</dd>
                </div>
            </dl>

            <div class="my-5 border-t border-[#EEF2F7]" />

            <div class="flex items-center justify-between gap-3">
                <span class="text-sm font-bold text-[#142744]">Total yang harus dibayar</span>
                <span class="text-[32px] font-bold leading-tight text-[#142744]">{{ rupiah(booking.total_biaya)
                    }}</span>
            </div>

            <!-- Langkah selanjutnya -->
            <div v-if="booking.status === 'Menunggu'"
                class="mt-6 flex gap-4 rounded-2xl border border-[#FBD9B5] bg-[#FFF1E3] p-5">
                <Wallet :size="20" class="mt-0.5 shrink-0 text-[#C2570C]" />
                <div>
                    <p class="text-sm font-bold text-[#142744]">Langkah selanjutnya</p>
                    <p class="mt-1.5 max-w-md text-xs leading-relaxed text-[#65758B]">
                        Datang ke kasir dan bayar sesuai total di atas. Setelah petugas mengonfirmasi,
                        bukti booking bisa dilihat dan dicetak.
                    </p>
                </div>
            </div>

            <!-- Aksi -->
            <div class="mt-6 space-y-3">
                <button type="button"
                    class="h-12 w-full rounded-xl bg-[#FF9638] px-5 text-sm font-bold text-white transition-colors hover:bg-[#FF8C24]"
                    @click="router.push(`/penyewa/booking/${id}`)">
                    Lihat Detail Booking
                </button>

                <div class="flex flex-wrap gap-3">
                    <button v-if="booking.status === 'Menunggu'" type="button"
                        class="h-11 min-w-40 flex-1 rounded-xl border border-[#F9C5C5] bg-[#FEEFEF] px-5 text-sm font-bold text-[#DC2626] transition-colors hover:bg-[#FDE2E2]"
                        @click="modalBatal = true">
                        Batalkan Booking
                    </button>
                    <RouterLink to="/"
                        class="flex h-11 min-w-40 flex-1 items-center justify-center rounded-xl border-2 border-[#D5DFEC] bg-white px-5 text-sm font-bold text-[#142744] transition-colors hover:bg-[#F4F6F8]">
                        Kembali ke Beranda
                    </RouterLink>
                </div>
            </div>
        </div>

        <modalBatalBooking v-model:open="modalBatal" :booking="booking" :loading="membatalkan" :galat="galatBatal"
            @konfirmasi="batalkan" />
    </div>
</template>