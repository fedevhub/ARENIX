<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AlertCircle, Info } from 'lucide-vue-next'

import filterStatusBooking from '@/components/penyewa/filterStatusBooking.vue'
import tableRiwayat from '@/components/penyewa/tableRiwayat.vue'
import modalBatalBooking from '@/components/penyewa/modalBatalBooking.vue'

import { batalkanBooking, getBookings } from '@/services/bookingService'

const router = useRouter()

const bookings = ref([])
const loading = ref(true)
const error = ref('')
const filter = ref('Semua')

const modalBatal = ref(false)
const dipilih = ref(null)
const membatalkan = ref(false)
const galatBatal = ref('')

async function muat() {
    error.value = ''
    try {
        const res = await getBookings()
        bookings.value = res.data.data ?? []
    } catch (e) {
        error.value = e.response?.data?.message ?? 'Gagal memuat riwayat booking.'
    } finally {
        loading.value = false
    }
}

const hitung = computed(() => {
    const h = { Semua: bookings.value.length, Menunggu: 0, Dikonfirmasi: 0, Selesai: 0, Dibatalkan: 0 }
    bookings.value.forEach((b) => { h[b.status] = (h[b.status] ?? 0) + 1 })
    return h
})

const tampil = computed(() =>
    filter.value === 'Semua' ? bookings.value : bookings.value.filter((b) => b.status === filter.value),
)

function mintaBatal(b) {
    dipilih.value = b
    galatBatal.value = ''
    modalBatal.value = true
}

async function batalkan() {
    membatalkan.value = true
    galatBatal.value = ''
    try {
        await batalkanBooking(dipilih.value._id)
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
    <div class="mx-auto max-w-[1440px] px-6 pb-16 pt-10 lg:px-[72px]">
        <h1 class="text-4xl font-semibold leading-tight text-[#142744] md:text-[40px]">Riwayat Booking</h1>
        <p class="mt-1 text-base text-[#65758B]">
            Semua booking yang kamu buat. Batalkan sebelum pembayaran dikonfirmasi.
        </p>

        <div class="mt-6">
            <filterStatusBooking v-model="filter" :hitung="hitung" />
        </div>

        <div v-if="error" role="alert"
            class="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" /> {{ error }}
        </div>

        <div class="mt-5">
            <tableRiwayat :bookings="tampil" :loading="loading"
                @detail="(b) => router.push(`/penyewa/booking/${b._id}`)"
                @bukti="(b) => router.push(`/penyewa/booking/${b._id}/bukti`)" @batal="mintaBatal" />
        </div>

        <modalBatalBooking v-model:open="modalBatal" :booking="dipilih" :loading="membatalkan" :galat="galatBatal"
            @konfirmasi="batalkan" />
    </div>
</template>