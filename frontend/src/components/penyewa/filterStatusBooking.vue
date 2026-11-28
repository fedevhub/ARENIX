<script setup>
defineProps({
    modelValue: { type: String, default: 'Semua' },
    hitung: { type: Object, default: () => ({}) },
})

defineEmits(['update:modelValue'])

const opsi = [
    { nilai: 'Semua', label: 'Semua' },
    { nilai: 'Menunggu', label: 'Menunggu Bayar' },
    { nilai: 'Dikonfirmasi', label: 'Dikonfirmasi' },
    { nilai: 'Selesai', label: 'Selesai' },
    { nilai: 'Dibatalkan', label: 'Dibatalkan' },
]
</script>

<template>
    <div class="flex flex-wrap gap-3">
        <button v-for="o in opsi" :key="o.nilai" type="button"
            class="flex h-10.5 items-center gap-3 rounded-full border px-5 text-[13.5px] font-bold transition-colors"
            :class="modelValue === o.nilai
                ? 'border-[#142744] bg-[#142744] text-white'
                : 'border-[#E1E8F0] bg-white text-[#142744] hover:bg-[#F4F6F8]'"
            @click="$emit('update:modelValue', o.nilai)">
            {{ o.label }}
            <span class="flex h-5.5 min-w-6.5 items-center justify-center rounded-full px-1.5 text-xs font-extrabold"
                :class="modelValue === o.nilai ? 'bg-[#FF9638] text-white' : 'bg-[#F1F5F9] text-[#65758B]'">
                {{ hitung[o.nilai] ?? 0 }}
            </span>
        </button>
    </div>
</template>