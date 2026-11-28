<script setup>
import { ChevronDown, Search } from 'lucide-vue-next'

defineProps({
    pencarian: { type: String, default: '' },
    jenis: { type: String, default: 'Semua' },
    status: { type: String, default: 'Semua' },
    opsiJenis: { type: Array, default: () => [] },
    total: { type: Number, default: 0 },
})

defineEmits(['update:pencarian', 'update:jenis', 'update:status'])
</script>

<template>
    <div
        class="flex flex-wrap items-center gap-3 rounded-2xl border border-[#E1E8F0] bg-white p-4 shadow-[0_2px_8px_rgba(20,39,68,0.04)]">
        <div class="relative w-full sm:w-[365px]">
            <Search :size="17" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A97AA]" />
            <input type="text" :value="pencarian" placeholder="Cari nama lapangan..."
                class="h-11 w-full rounded-xl border border-[#E1E8F0] bg-[#F4F6F8] pl-10 pr-3 text-sm text-[#142744] outline-none placeholder:text-[#8A97AA] focus:border-[#142744] focus:bg-white"
                @input="$emit('update:pencarian', $event.target.value)" />
        </div>

        <div class="relative">
            <select :value="jenis"
                class="h-11 w-44 appearance-none rounded-xl border border-[#E1E8F0] bg-[#F4F6F8] pl-4 pr-10 text-sm text-[#65758B] outline-none focus:border-[#142744] focus:bg-white"
                @change="$emit('update:jenis', $event.target.value)">
                <option value="Semua">Semua Jenis</option>
                <option v-for="j in opsiJenis" :key="j" :value="j">{{ j }}</option>
            </select>
            <ChevronDown :size="16"
                class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A97AA]" />
        </div>

        <div class="relative">
            <select :value="status"
                class="h-11 w-44 appearance-none rounded-xl border border-[#E1E8F0] bg-[#F4F6F8] pl-4 pr-10 text-sm text-[#65758B] outline-none focus:border-[#142744] focus:bg-white"
                @change="$emit('update:status', $event.target.value)">
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Maintenance</option>
            </select>
            <ChevronDown :size="16"
                class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A97AA]" />
        </div>

        <p class="ml-auto pr-2 text-xs font-bold text-[#65758B]">{{ total }} lapangan</p>
    </div>
</template>