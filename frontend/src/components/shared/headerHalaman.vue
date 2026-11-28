<script setup>
import { tanggalPanjang, toYMD } from '@/lib/format'

defineProps({
    judul: { type: String, required: true },
    subjudul: { type: String, default: '' },
    tampilTanggal: { type: Boolean, default: true },
})

const hariIni = tanggalPanjang(toYMD())
</script>

<template>
    <div>
        <h1 class="text-4xl font-semibold leading-tight text-[#142744] md:text-[40px]">{{ judul }}</h1>
        <div class="mt-1 flex flex-wrap items-center justify-between gap-2">
            <p class="text-[15px] text-[#65758B]">{{ subjudul }}</p>
            <p v-if="tampilTanggal" class="text-[15px] text-[#142744]">{{ hariIni }}</p>
        </div>
    </div>
</template>