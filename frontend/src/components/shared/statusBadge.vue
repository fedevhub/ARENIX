<script setup>
import { labelStatus } from '@/lib/format'

defineProps({
    status: { type: String, default: '' },
})

// Warna sesuai desain Figma
const kelas = {
    Menunggu: 'bg-[#FFF1E3] text-[#C2570C]',
    Dikonfirmasi: 'bg-[#E7F8EF] text-[#0E7C47]',
    Selesai: 'bg-[#EEF1F6] text-[#65758B]',
    Dibatalkan: 'bg-[#FEEFEF] text-[#DC2626]',
}
</script>

<template>
    <span class="inline-flex items-center whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] font-bold"
        :class="kelas[status] ?? 'bg-gray-100 text-gray-600'">
        {{ labelStatus(status) }}
    </span>
</template>