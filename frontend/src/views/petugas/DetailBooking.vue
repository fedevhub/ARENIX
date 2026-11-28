<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertCircle, ArrowLeft, LandPlot } from 'lucide-vue-next'

import statusBadge from '@/components/shared/statusBadge.vue'
import rincianPembayaran from '@/components/shared/rincianPembayaran.vue'
import timelineBooking from '@/components/shared/timelineBooking.vue'
import infoReservasi from '@/components/petugas/booking/infoReservasi.vue'
import infoJadwal from '@/components/petugas/booking/infoJadwal.vue'
import panelTindakan from '@/components/petugas/booking/panelTindakan.vue'

import { getBookingDetail } from '@/services/bookingService'
import { useAksiBooking } from '@/composables/useAksiBooking'
import { gambarUrl } from '@/lib/format'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const booking = ref(null)
const loading = ref(true)
const error = ref('')

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

const aksi = useAksiBooking(muat)

onMounted(muat)
</script>

<template>
    <div class="mx-auto min-h-full max-w-[1296px] p-4 sm:p-6 md:p-10">
        <button type="button" class="inline-flex h-11 items-center gap-2 rounded-xl border border-[#E1E8F0] bg-white px-5 text-sm font-bold text-[#142744] shadow-[0_2px_8px_rgba(20,39,68,0.04)] transition-colors hover:bg-[#F4F6F8]"
            @click="router.push('/petugas/booking')">
            <ArrowLeft :size="16" /> Kembali
        </button>

        <div v-if="error" role="alert"
            class="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" /> {{ error }}
        </div>

        <div v-if="loading" class="h-96 animate-pulse rounded-2xl bg-white" />

        <template v-else-if="booking">
            <div class="flex flex-wrap items-center gap-4">
                <div>
                    <h1 class="text-3xl mt-3 font-extrabold text-[#142744] md:text-4xl">Detail Booking</h1>
                    <p class="mt-1 text-base text-[#65758B]">
                        Informasi lengkap reservasi, status pembayaran, dan tindakan petugas.
                    </p>
                </div>
                <statusBadge :status="booking.status" class="ml-auto" />
            </div>

            <div class="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_450px]">
                <div class="space-y-6">
                    <infoReservasi :booking="booking" />
                    <infoJadwal :booking="booking" />

                    <section class="rounded-2xl border border-[#E1E8F0] bg-white p-6">
                        <h2 class="mb-5 text-lg font-extrabold text-[#142744]">Riwayat Aktivitas</h2>
                        <timelineBooking :booking="booking" />
                    </section>
                </div>

                <div class="space-y-6">
                    <section class="rounded-2xl border border-[#E1E8F0] bg-white p-6">
                        <h2 class="text-lg font-extrabold text-[#142744]">Ringkasan Pembayaran</h2>

                        <div class="mt-4 flex items-center gap-3 rounded-xl bg-[#F4F6F8] p-3">
                            <div class="size-14 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                                <img v-if="booking.lapangan_id?.gambar" :src="gambarUrl(booking.lapangan_id.gambar)"
                                    :alt="booking.lapangan_id.nama" class="h-full w-full object-cover" />
                                <div v-else class="flex h-full items-center justify-center text-slate-400">
                                    <LandPlot :size="20" />
                                </div>
                            </div>
                            <div>
                                <p class="font-extrabold text-[#142744]">{{ booking.lapangan_id?.nama }}</p>
                                <p class="text-xs text-[#65758B]">
                                    {{ booking.lapangan_id?.jenis_id?.nama }} • Tarif {{ booking.rincian?.tipe_hari }}
                                </p>
                            </div>
                        </div>

                        <div class="mt-5">
                            <rincianPembayaran :booking="booking" />
                        </div>
                    </section>

                    <panelTindakan :booking="booking" :loading="aksi.sedangProses.value"
                        @konfirmasi="aksi.konfirmasi(booking)" @selesai="aksi.selesai(booking)"
                        @batal="aksi.batal(booking)" @struk="router.push(`/petugas/booking/${id}/struk`)" />
                </div>
            </div>
        </template>
    </div>
</template>
