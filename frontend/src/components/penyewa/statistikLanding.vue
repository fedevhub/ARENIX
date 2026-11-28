<script setup>
import { computed } from 'vue'
import { jam, rupiah } from '@/lib/format'

const props = defineProps({
    daftar: { type: Array, default: () => [] },
})

const aktif = computed(() => props.daftar.filter((l) => l.status === 'Aktif'))

const kartu = computed(() => {
    const buka = props.daftar.map((l) => l.jam_buka).filter(Boolean).sort()
    const tutup = props.daftar.map((l) => l.jam_tutup).filter(Boolean).sort()
    const harga = props.daftar.map((l) => l.harga).filter((h) => typeof h === 'number')

    return [
        { nilai: props.daftar.length, label: 'Lapangan' },
        {
            nilai: buka.length ? `${jam(buka[0])}–${jam(tutup[tutup.length - 1])}` : '-',
            label: 'Jam operasional',
        },
        { nilai: harga.length ? rupiah(Math.min(...harga)) : '-', label: 'Mulai dari /jam' },
        {
            nilai: `${aktif.value.reduce((t, l) => t + (l.slotTersedia ?? 0), 0)} slot`,
            label: 'Slot tersedia hari ini',
        },
    ]
})
</script>

<template>
    <div class="relative z-10 mx-auto -mt-16 max-w-[1440px] px-6 lg:px-[72px]">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="k in kartu" :key="k.label" class="rounded-2xl border border-[#E1E8F0] bg-white p-6 shadow-sm">
                <p class="text-2xl font-extrabold text-[#142744]">{{ k.nilai }}</p>
                <p class="mt-1 text-sm font-semibold text-[#65758B]">{{ k.label }}</p>
            </div>
        </div>
    </div>
</template>