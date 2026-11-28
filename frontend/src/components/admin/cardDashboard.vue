<script setup>
import { computed } from 'vue'

const props = defineProps({
    pengguna: { type: Number, default: 0 },
    lapangan: { type: Number, default: 0 },
    booking: { type: Number, default: 0 },
    pendapatan: { type: Number, default: 0 },
})

const angka = (n) => new Intl.NumberFormat('id-ID').format(n)

const rupiahSingkat = (n) => {
    if (n >= 1_000_000_000) {
        return `Rp${(n / 1_000_000_000).toFixed(1).replace('.', ',')}M`
    }

    if (n >= 1_000_000) {
        return `Rp${(n / 1_000_000).toFixed(1).replace('.', ',')}jt`
    }

    if (n >= 1_000) {
        return `Rp${Math.round(n / 1_000)}k`
    }

    return `Rp${angka(n)}`
}

const cards = computed(() => [
    { label: 'Total Pengguna', value: angka(props.pengguna) },
    { label: 'Total Lapangan', value: angka(props.lapangan) },
    { label: 'Total Booking', value: angka(props.booking) },
    { label: 'Pendapatan', value: rupiahSingkat(props.pendapatan) },
])
</script>

<template>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="card in cards" :key="card.label"
            class="rounded-xl border border-[#E8EDF3] bg-white px-5 py-5 shadow-sm">
            <p class="text-sm font-semibold text-[#64748B]">
                {{ card.label }}
            </p>

            <p class="mt-2 text-3xl font-bold leading-tight text-[#FF9638] md:text-4xl">
                {{ card.value }}
            </p>
        </div>
    </div>
</template>
