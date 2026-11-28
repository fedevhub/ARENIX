<script setup>
import { computed } from 'vue'
import { jam, rupiah, tanggalPanjang, toMinutes } from '@/lib/format'

const props = defineProps({
    slots: { type: Array, default: () => [] },
    modelValue: { type: Object, default: null }, // { mulai, selesai } | null
    tanggal: { type: String, default: '' },
    hargaPerJam: { type: Number, default: null },
    loading: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false }, // tamu: hanya lihat
})

const emit = defineEmits(['update:modelValue'])

const idxMulai = computed(() =>
    props.modelValue ? props.slots.findIndex((s) => s.mulai === props.modelValue.mulai) : -1,
)
const idxSelesai = computed(() =>
    props.modelValue ? props.slots.findIndex((s) => s.selesai === props.modelValue.selesai) : -1,
)

const dipilih = (i) => idxMulai.value >= 0 && i >= idxMulai.value && i <= idxSelesai.value

const durasi = computed(() =>
    props.modelValue
        ? (toMinutes(props.modelValue.selesai) - toMinutes(props.modelValue.mulai)) / 60
        : 0,
)

const jumlahTersedia = computed(() => props.slots.filter((s) => s.status === 'Tersedia').length)

function pilih(a, b) {
    emit('update:modelValue', { mulai: props.slots[a].mulai, selesai: props.slots[b].selesai })
}

function klik(i) {
    if (props.readonly) return

    const s = props.slots[i]
    if (s.status !== 'Tersedia' && !dipilih(i)) return

    if (idxMulai.value < 0) return pilih(i, i)

    const a = idxMulai.value
    const b = idxSelesai.value

    // Perluas pilihan ke slot yang bersebelahan (harus berurutan)
    if (i === a - 1 && s.status === 'Tersedia') return pilih(i, b)
    if (i === b + 1 && s.status === 'Tersedia') return pilih(a, i)

    if (dipilih(i)) {
        if (a === b) return emit('update:modelValue', null)
        if (i === a) return pilih(a + 1, b)
        if (i === b) return pilih(a, b - 1)
        return pilih(i, i)
    }

    pilih(i, i)
}

function labelStatus(s, i) {
    if (!props.readonly && dipilih(i)) return 'Dipilih'
    return s.status
}

function kelas(s, i) {
    if (!props.readonly && dipilih(i)) return 'border-[#142744] bg-[#142744] text-white'
    if (s.status === 'Tersedia') {
        return props.readonly
            ? 'border-green-200 bg-green-50 text-[#142744] cursor-default'
            : 'border-[#E1E8F0] bg-white text-[#142744] hover:border-[#FF9638]'
    }
    return 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400'
}
</script>

<template>
    <section class="rounded-2xl border border-[#E1E8F0] bg-white p-6">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
                <h2 class="text-lg font-extrabold text-[#142744]">
                    {{ readonly ? 'Slot jam main' : 'Pilih jam main' }}
                </h2>
                <p class="text-xs text-[#65758B]">
                    {{ readonly ? 'Slot hanya bisa dilihat.' : 'Pilih slot berurutan • 1 slot = 1 jam' }}
                </p>
            </div>

            <div v-if="modelValue && !readonly"
                class="rounded-full bg-[#FFF3E7] px-4 py-1.5 text-xs font-bold text-[#B45309]">
                {{ durasi }} jam • {{ jam(modelValue.mulai) }}-{{ jam(modelValue.selesai) }}
            </div>
            <div v-else-if="readonly" class="flex items-center gap-3 text-xs font-semibold text-[#65758B]">
                <span class="flex items-center gap-1.5"><i class="size-2.5 rounded-full bg-green-500" />Tersedia</span>
                <span class="flex items-center gap-1.5"><i class="size-2.5 rounded-full bg-slate-300" />Terisi</span>
            </div>
        </div>

        <div v-if="loading" class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <div v-for="n in 8" :key="n" class="h-20 animate-pulse rounded-xl bg-slate-100" />
        </div>

        <p v-else-if="!slots.length" class="mt-6 rounded-xl bg-[#F4F6F8] py-10 text-center text-sm text-[#65758B]">
            Tidak ada slot pada tanggal ini.
        </p>

        <div v-else class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <button v-for="(s, i) in slots" :key="s.mulai" type="button"
                :disabled="readonly || (s.status !== 'Tersedia' && !dipilih(i))"
                class="rounded-xl border px-3 py-3 text-left transition-colors" :class="kelas(s, i)" @click="klik(i)">
                <p class="text-sm font-extrabold">{{ jam(s.mulai) }}-{{ jam(s.selesai) }}</p>
                <p class="mt-0.5 text-xs" :class="!readonly && dipilih(i) ? 'text-white/70' : 'text-[#65758B]'">
                    {{ hargaPerJam != null ? rupiah(hargaPerJam) : '-' }}
                </p>
                <p class="mt-1.5 text-[11px] font-bold">{{ labelStatus(s, i) }}</p>
            </button>
        </div>

        <p class="mt-4 text-xs text-[#65758B]">
            {{ tanggal ? `${tanggalPanjang(tanggal)} • ` : '' }}{{ jumlahTersedia }} slot tersedia.
            <span v-if="!readonly">Slot terisi tidak dapat dipilih.</span>
        </p>
    </section>
</template>