<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertCircle, ArrowLeft, LandPlot, Printer } from 'lucide-vue-next'

import statusBadge from '@/components/shared/statusBadge.vue'
import rincianPembayaran from '@/components/shared/rincianPembayaran.vue'
import timelineBooking from '@/components/shared/timelineBooking.vue'
import modalBatalBooking from '@/components/penyewa/modalBatalBooking.vue'

import { batalkanBooking, getBookingDetail } from '@/services/bookingService'
import {
    gambarUrl, kodeBooking, namaPenyewa, rentangJam, tanggalPanjang, tanggalWaktu,
} from '@/lib/format'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const booking = ref(null)
const loading = ref(true)
const error = ref('')

const modalBatal = ref(false)
const membatalkan = ref(false)
const galatBatal = ref('')

const menunggu = computed(() => booking.value?.status === 'Menunggu')
const bisaBukti = computed(() => ['Dikonfirmasi', 'Selesai'].includes(booking.value?.status))

async function muat() {
    error.value = ''
    try {
        const res = await getBookingDetail(id)
        booking.value = res.data.data
    } catch (e) {
        error.value = e.response?.data?.message ?? 'Gagal memuat detail booking.'
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
    <div class="mx-auto max-w-[1296px] px-8 pb-16 pt-8 sm:px-10 lg:px-[72px]">
        <button type="button"
            class="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E1E8F0] bg-white px-5 text-sm font-bold text-[#142744] shadow-[0_2px_8px_rgba(20,39,68,0.04)] transition-colors hover:bg-[#F4F6F8]"
            @click="router.push('/penyewa/riwayat')">
            <ArrowLeft :size="16" /> Kembali
        </button>

        <div v-if="error" role="alert"
            class="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" /> {{ error }}
        </div>

        <div v-if="loading" class="mt-6 h-96 animate-pulse rounded-3xl bg-white" />

        <template v-else-if="booking">
            <div class="mt-9 flex flex-wrap items-center justify-between gap-4">
                <h1 class="text-3xl font-semibold leading-tight text-[#142744] md:text-[40px]">
                    Detail Booking {{ kodeBooking(booking) }}
                </h1>
                <statusBadge :status="booking.status" />
            </div>

            <div class="mt-5 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
                <div class="space-y-6">
                    <!-- Informasi booking -->
                    <section
                        class="rounded-3xl border border-[#E1E8F0] bg-white p-6 shadow-[0_2px_8px_rgba(20,39,68,0.04)]">
                        <h2 class="text-xl font-semibold text-[#142744]">Informasi booking</h2>

                        <div class="mt-4 flex items-center gap-5">
                            <div class="size-[100px] shrink-0 overflow-hidden rounded-2xl bg-slate-200">
                                <img v-if="booking.lapangan_id?.gambar" :src="gambarUrl(booking.lapangan_id.gambar)"
                                    :alt="booking.lapangan_id.nama" class="h-full w-full object-cover" />
                                <div v-else class="flex h-full items-center justify-center text-slate-400">
                                    <LandPlot :size="28" />
                                </div>
                            </div>
                            <div>
                                <p class="text-2xl font-semibold leading-tight text-[#142744]">
                                    {{ booking.lapangan_id?.nama }}
                                </p>
                                <span v-if="booking.lapangan_id?.jenis_id?.nama"
                                    class="mt-2 inline-block rounded-full bg-[#EAF1FF] px-3.5 py-1 text-[11px] font-bold text-[#2358D6]">
                                    {{ booking.lapangan_id.jenis_id.nama }}
                                </span>
                                <p class="mt-2 text-sm text-[#65758B]">Booking atas nama {{ namaPenyewa(booking) }}</p>
                            </div>
                        </div>

                        <div class="my-5 border-t border-[#EEF2F7]" />

                        <dl class="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
                            <div>
                                <dt class="text-xs text-[#65758B]">Tanggal main</dt>
                                <dd class="mt-0.5 font-bold text-[#142744]">{{ tanggalPanjang(booking.tanggal) }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-[#65758B]">Jam main</dt>
                                <dd class="mt-0.5 font-bold text-[#142744]">
                                    {{ rentangJam(booking.jam_mulai, booking.jam_selesai) }}
                                </dd>
                            </div>
                            <div>
                                <dt class="text-xs text-[#65758B]">Durasi</dt>
                                <dd class="mt-0.5 font-bold text-[#142744]">{{ booking.durasi_jam }} jam</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-[#65758B]">Dibuat pada</dt>
                                <dd class="mt-0.5 font-bold text-[#142744]">{{ tanggalWaktu(booking.created_at) }}</dd>
                            </div>
                        </dl>

                        <p v-if="booking.catatan" class="mt-5 rounded-xl bg-[#FFF1E3] px-4 py-3 text-sm text-[#C2570C]">
                            <span class="font-bold">Catatan:</span> {{ booking.catatan }}
                        </p>
                    </section>

                    <!-- Rincian pembayaran -->
                    <section
                        class="rounded-3xl border border-[#E1E8F0] bg-white p-6 shadow-[0_2px_8px_rgba(20,39,68,0.04)]">
                        <h2 class="mb-3 text-xl font-semibold text-[#142744]">Rincian pembayaran</h2>
                        <rincianPembayaran ringkas :booking="booking"
                            :label-total="bisaBukti ? 'Total dibayar' : 'Total pembayaran'" />
                    </section>
                </div>

                <div class="space-y-6">
                    <!-- Status -->
                    <section
                        class="rounded-3xl border border-[#E1E8F0] bg-white p-6 shadow-[0_2px_8px_rgba(20,39,68,0.04)]">
                        <h2 class="mb-5 text-xl font-semibold text-[#142744]">Status booking</h2>
                        <timelineBooking :booking="booking" />
                    </section>

                    <!-- Aksi -->
                    <section
                        class="rounded-3xl border border-[#E1E8F0] bg-white p-6 shadow-[0_2px_8px_rgba(20,39,68,0.04)]">
                        <h2 class="text-xl font-semibold text-[#142744]">Aksi</h2>

                        <div class="mt-4 space-y-3">
                            <button v-if="bisaBukti" type="button"
                                class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FF9638] text-sm font-bold text-white transition-colors hover:bg-[#FF8C24]"
                                @click="router.push(`/penyewa/booking/${id}/bukti`)">
                                <Printer :size="16" /> Lihat &amp; Cetak Bukti
                            </button>
                            <button v-else type="button" disabled
                                class="h-12 w-full cursor-not-allowed rounded-xl bg-[#EEF1F6] text-sm font-bold text-[#8A97AA]">
                                Lihat &amp; Cetak Bukti
                            </button>

                            <button v-if="menunggu" type="button"
                                class="h-12 w-full rounded-xl border border-[#F9C5C5] bg-[#FEEFEF] text-sm font-bold text-[#DC2626] transition-colors hover:bg-[#FDE2E2]"
                                @click="modalBatal = true">
                                Batalkan Booking
                            </button>
                            <button v-else type="button" disabled
                                class="h-12 w-full cursor-not-allowed rounded-xl bg-[#EEF1F6] text-sm font-bold text-[#8A97AA]">
                                Batalkan Booking
                            </button>
                        </div>

                        <p class="mt-4 max-w-[300px] text-xs leading-relaxed text-[#65758B]">
                            <template v-if="menunggu">
                                Bukti tersedia setelah pembayaran dikonfirmasi. Pembatalan hanya bisa dilakukan sebelum
                                pembayaran dikonfirmasi petugas.
                            </template>
                            <template v-else-if="bisaBukti">
                                Booking yang sudah dikonfirmasi tidak bisa dibatalkan sendiri. Hubungi petugas jika
                                perlu perubahan jadwal.
                            </template>
                            <template v-else>Booking ini sudah dibatalkan.</template>
                        </p>
                    </section>
                </div>
            </div>
        </template>

        <modalBatalBooking v-model:open="modalBatal" :booking="booking" :loading="membatalkan" :galat="galatBatal"
            @konfirmasi="batalkan" />
    </div>
</template>
