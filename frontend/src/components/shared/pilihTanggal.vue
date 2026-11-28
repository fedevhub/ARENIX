<script setup>
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import {
    BULAN_SINGKAT, HARI_SINGKAT, NAMA_BULAN,
    isWeekend, parseYMD, rupiah, tambahHari, toYMD,
} from '@/lib/format'
import { hargaHari } from '@/lib/booking'

const props = defineProps({
    modelValue: { type: String, required: true },
    tarifLapangan: { type: Object, default: null },
    jumlah: { type: Number, default: 7 },
    judul: { type: String, default: 'Pilih jadwal' },
    catatan: { type: String, default: '' }, // tambahan di baris subjudul
    tertanam: { type: Boolean, default: false }, // tanpa kartu sendiri (dipasang di dalam kartu induk)
})

const emit = defineEmits(['update:modelValue'])

const hariIni = toYMD()

// Mulai dari minggu yang memuat tanggal terpilih
const selisih = Math.max(
    0,
    Math.round((parseYMD(props.modelValue) - parseYMD(hariIni)) / 86400000),
)
const awal = ref(tambahHari(hariIni, Math.floor(selisih / props.jumlah) * props.jumlah))

const hari = computed(() =>
    Array.from({ length: props.jumlah }, (_, i) => {
        const ymd = tambahHari(awal.value, i)
        const d = parseYMD(ymd)
        return {
            ymd,
            hari: HARI_SINGKAT[d.getDay()],
            tanggal: `${d.getDate()} ${BULAN_SINGKAT[d.getMonth()]}`,
            harga: hargaHari(props.tarifLapangan, ymd),
            weekend: isWeekend(ymd),
        }
    }),
)

const judulBulan = computed(() => {
    const a = parseYMD(hari.value[0].ymd)
    const b = parseYMD(hari.value[hari.value.length - 1].ymd)
    return a.getMonth() === b.getMonth()
        ? `${NAMA_BULAN[a.getMonth()]} ${a.getFullYear()}`
        : `${NAMA_BULAN[a.getMonth()]} – ${NAMA_BULAN[b.getMonth()]} ${b.getFullYear()}`
})

const geser = (arah) => { awal.value = tambahHari(awal.value, arah * props.jumlah) }
</script>

<template>
    <section
        :class="tertanam ? '' : 'rounded-3xl border border-[#E1E8F0] bg-white p-6 shadow-[0_2px_8px_rgba(20,39,68,0.04)]'">
        <div class="flex items-start justify-between gap-3">
            <div>
                <h2 class="text-xl font-semibold text-[#142744]">{{ judul }}</h2>
                <p class="mt-1 text-xs text-[#65758B]">
                    Tarif {{ isWeekend(modelValue) ? 'weekend' : 'weekday' }} • Semua waktu dalam WIB<template
                        v-if="catatan"> • {{ catatan }}</template>
                </p>
            </div>

            <div class="flex items-center gap-2">
                <p class="text-sm font-bold text-[#142744]">{{ judulBulan }}</p>
                <button type="button" aria-label="Minggu sebelumnya" :disabled="awal <= hariIni"
                    class="flex size-7 items-center justify-center rounded-lg border border-[#E1E8F0] text-[#142744] hover:bg-[#F4F6F8] disabled:opacity-40"
                    @click="geser(-1)">
                    <ChevronLeft :size="14" />
                </button>
                <button type="button" aria-label="Minggu berikutnya"
                    class="flex size-7 items-center justify-center rounded-lg border border-[#E1E8F0] text-[#142744] hover:bg-[#F4F6F8]"
                    @click="geser(1)">
                    <ChevronRight :size="14" />
                </button>
            </div>
        </div>

        <div class="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-7">
            <button v-for="h in hari" :key="h.ymd" type="button"
                class="rounded-xl border px-2 py-2.5 text-center transition-colors" :class="h.ymd === modelValue
                    ? 'border-[#FF9638] bg-[#FFF1E3] text-[#142744]'
                    : 'border-[#E1E8F0] bg-white text-[#142744] hover:border-[#FF9638]'"
                @click="emit('update:modelValue', h.ymd)">
                <p class="text-xs text-[#65758B]">{{ h.hari }}</p>
                <p class="mt-0.5 text-sm font-bold">{{ h.tanggal }}</p>
                <p class="mt-0.5 text-[11px] font-bold"
                    :class="h.ymd === modelValue ? 'text-[#C2570C]' : 'text-[#65758B]'">
                    {{ h.harga != null ? rupiah(h.harga) : '-' }}
                </p>
            </button>
        </div>
    </section>
</template>