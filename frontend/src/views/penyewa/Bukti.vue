<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertCircle, ArrowLeft, Download } from 'lucide-vue-next'

import strukBooking from '@/components/shared/strukBooking.vue'
import { getBookingDetail } from '@/services/bookingService'
import { unduhStrukPdf } from '@/lib/strukPdf'

const route = useRoute()
const router = useRouter()

const booking = ref(null)
const loading = ref(true)
const error = ref('')
const mengunduh = ref(false)

const valid = computed(() => ['Dikonfirmasi', 'Selesai'].includes(booking.value?.status))

async function unduhPdf() {
    if (!booking.value || mengunduh.value) return

    mengunduh.value = true
    try {
        unduhStrukPdf(booking.value)
    } finally {
        mengunduh.value = false
    }
}

onMounted(async () => {
    try {
        const res = await getBookingDetail(route.params.id)
        booking.value = res.data.data
    } catch (e) {
        error.value = e.response?.data?.message ?? 'Gagal memuat bukti booking.'
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="mx-auto max-w-[608px] px-6 pb-16 pt-6 print:max-w-full print:p-0">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <button type="button"
                class="inline-flex h-11 items-center gap-2 rounded-xl border border-[#E1E8F0] bg-white px-5 text-sm font-bold text-[#142744] shadow-[0_2px_8px_rgba(20,39,68,0.04)] transition-colors hover:bg-[#F4F6F8]"
                @click="router.push(`/penyewa/booking/${route.params.id}`)">
                <ArrowLeft :size="16" /> Kembali
            </button>

            <div v-if="valid">
                <button type="button" :disabled="mengunduh"
                    class="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FF9638] px-5 text-sm font-bold text-white transition-colors hover:bg-[#FF8C24] disabled:cursor-wait disabled:opacity-60"
                    @click="unduhPdf">
                    <Download :size="16" /> {{ mengunduh ? 'Menyiapkan...' : 'Unduh PDF' }}
                </button>
            </div>
        </div>

        <div v-if="error" role="alert"
            class="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" /> {{ error }}
        </div>

        <div v-else-if="loading" class="mx-auto h-[640px] animate-pulse rounded-[32px] bg-white" />

        <p v-else-if="!valid"
            class="rounded-2xl border border-[#FBD9B5] bg-[#FFF1E3] p-6 text-center text-sm font-semibold text-[#B45309]">
            Bukti booking hanya tersedia setelah pembayaran dikonfirmasi petugas.
        </p>

        <div v-else>
            <strukBooking :booking="booking" />
        </div>
    </div>
</template>
