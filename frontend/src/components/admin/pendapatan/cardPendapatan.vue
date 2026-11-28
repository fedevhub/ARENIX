<script setup>
import { onMounted, ref } from 'vue'

import { Card, CardContent } from '@/components/ui/card'
import { getPendapatanData } from '@/services/pendapatanService'

const data = ref({
    total_pendapatan: 0,
    total_booking: 0,
    booking_selesai: 0,
    booking_dibatalkan: 0,
})

const loading = ref(false)

// Format Rp110k, Rp1,5jt, dan seterusnya
function formatRupiahSingkat(angka) {
    const nilai = Number(angka) || 0

    if (nilai >= 1_000_000_000) {
        return `Rp${(nilai / 1_000_000_000).toFixed(1).replace('.', ',')}M`
    }

    if (nilai >= 1_000_000) {
        return `Rp${(nilai / 1_000_000).toFixed(1).replace('.', ',')}jt`
    }

    if (nilai >= 1_000) {
        return `Rp${Math.round(nilai / 1_000)}k`
    }

    return `Rp${nilai.toLocaleString('id-ID')}`
}

async function ambilRingkasanPendapatan() {
    loading.value = true

    try {
        const response = await getPendapatanData()
        const hasil = response.data.data ?? response.data

        data.value = {
            total_pendapatan: hasil.total_pendapatan ?? 0,
            total_booking: hasil.total_booking ?? 0,
            booking_selesai: hasil.booking_selesai ?? 0,
            booking_dibatalkan: hasil.booking_dibatalkan ?? 0,
        }
    } catch (error) {
        console.error('Gagal mengambil ringkasan pendapatan:', error)
    } finally {
        loading.value = false
    }
}

onMounted(ambilRingkasanPendapatan)
</script>

<template>
    <div class="grid grid-cols-1 gap-4 py-3 sm:grid-cols-2 xl:grid-cols-4">

        <Card class="shadow-sm">
            <CardContent class="flex flex-col gap-1 px-5 py-0">
                <p class="text-md font-semibold text-[#64748B]">
                    Total Pendapatan
                </p>

                <p class="text-3xl font-bold leading-tight text-[#FF9638]">
                    {{ loading ? 'Memuat...' : formatRupiahSingkat(data.total_pendapatan) }}
                </p>
            </CardContent>
        </Card>

        <Card class="shadow-sm">
            <CardContent class="flex flex-col gap-1 px-5 py-0">
                <p class="text-md font-semibold text-[#64748B]">
                    Total Booking
                </p>

                <p class="text-4xl font-bold leading-tight text-[#FF9638]">
                    {{ loading ? '...' : data.total_booking }}
                </p>
            </CardContent>
        </Card>

        <Card class="shadow-sm">
            <CardContent class="flex flex-col gap-1 px-5 py-0">
                <p class="text-md font-semibold text-[#64748B]">
                    Booking Selesai
                </p>

                <p class="text-4xl font-bold leading-tight text-[#FF9638]">
                    {{ loading ? '...' : data.booking_selesai }}
                </p>
            </CardContent>
        </Card>

        <Card class="shadow-sm">
            <CardContent class="flex flex-col gap-1 px-5 py-0">
                <p class="text-md font-semibold text-[#64748B]">
                    Booking Dibatalkan
                </p>

                <p class="text-4xl font-bold leading-tight text-[#FF9638]">
                    {{ loading ? '...' : data.booking_dibatalkan }}
                </p>
            </CardContent>
        </Card>

    </div>
</template>
