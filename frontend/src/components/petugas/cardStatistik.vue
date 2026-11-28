<script setup>
defineProps({
    label: { type: String, required: true },
    nilai: { type: [Number, String], default: 0 },
})
</script>

<template>
    <div class="rounded-2xl border border-[#E1E8F0] bg-white px-5 py-5 shadow-[0_2px_8px_rgba(20,39,68,0.04)]">
        <p class="text-xs font-bold text-[#65758B]">{{ label }}</p>
        <p class="mt-2 text-[32px] font-bold leading-tight text-[#FF9638]">{{ nilai }}</p>
    </div>
</template>