<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'

const props = defineProps({
    items: { type: Array, default: () => [] },
})

const aktivitasTerbaru = computed(() => props.items.slice(0, 5))
</script>

<template>
    <div class="rounded-xl border border-[#E8EDF3] bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
            <h2 class="text-base font-semibold text-[#12284C]">
                Aktivitas Terbaru
            </h2>

            <span>
                <RouterLink to="/admin/log-aktivitas"
                    class="inline-flex items-center gap-2 text-xs font-semibold text-[#FF9638] hover:text-[#E98228]">
                    Lihat Selengkapnya
                    <ArrowRight :size="15" />
                </RouterLink>
            </span>
        </div>

        <ul v-if="aktivitasTerbaru.length" class="mt-4 space-y-3">
            <li v-for="(a, i) in aktivitasTerbaru" :key="a.id || i" class="flex items-center gap-3">
                <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EAF2FF]">
                    <span class="size-2 rounded-full bg-[#1D4ED8]" />
                </span>

                <div class="min-w-0">
                    <p class="truncate text-xs font-semibold text-[#12284C]">
                        {{ a.aksi }}
                    </p>

                    <p class="mt-0.5 text-[10px] text-[#94A3B8]">
                        {{ a.pelaku }} • {{ a.waktu }}
                    </p>
                </div>
            </li>
        </ul>

        <div v-else class="flex h-36 items-center justify-center text-sm text-gray-400">
            Belum ada aktivitas
        </div>
    </div>
</template>
