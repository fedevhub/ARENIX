<script setup>
import { computed } from 'vue'

const props = defineProps({
    title: { type: String, required: true },
    items: { type: Array, default: () => [] },
    variant: { type: String, default: 'single' },
})

const max = computed(() =>
    Math.max(0, ...props.items.map(item => Number(item.value) || 0))
)

const adaData = computed(() => max.value > 0)

const tinggi = (value) => {
    if (!max.value || !value) return '0%'
    return `${(Number(value) / max.value) * 100}%`
}

const formatNilai = (value) => {
    if (props.variant === 'single') {
        if (value >= 1_000_000) {
            return `${(value / 1_000_000).toFixed(1).replace('.', ',')}jt`
        }

        if (value >= 1_000) {
            return `${Math.round(value / 1_000)}k`
        }

        return String(value)
    }

    return String(value)
}
</script>

<template>
    <div class="rounded-xl border border-[#E8EDF3] bg-white p-5 shadow-sm">
        <h2 class="text-base font-semibold text-[#12284C]">
            {{ title }}
        </h2>

        <div v-if="adaData" class="mt-5 flex h-64 items-end justify-around gap-3">
            <div v-for="item in items" :key="item.label"
                class="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                <span class="text-[10px] font-semibold text-[#64748B]">
                    {{ Number(item.value) > 0 ? formatNilai(Number(item.value)) : '' }}
                </span>

                <div class="flex w-full flex-1 items-end justify-center">
                    <div v-if="Number(item.value) > 0" class="w-8 max-w-full rounded-t-md transition-all duration-300"
                        :class="variant === 'stacked'
                            ? 'bg-[#DCEBFA]'
                            : 'bg-[#FF9638]'" :style="{ height: tinggi(item.value) }" />
                </div>

                <span class="whitespace-nowrap text-[11px] text-[#64748B]">
                    {{ item.label }}
                </span>
            </div>
        </div>

        <div v-else class="mt-4 flex h-64 flex-col items-center justify-center text-center">
            <p class="text-sm font-semibold text-[#64748B]">
                Belum ada data
            </p>
            <p class="mt-1 text-xs text-gray-400">
                Data grafik akan muncul setelah terdapat transaksi.
            </p>
        </div>
    </div>
</template>
