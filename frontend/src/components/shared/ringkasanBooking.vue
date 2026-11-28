<script setup>
import { computed } from 'vue'
import { LandPlot } from 'lucide-vue-next'
import { gambarUrl, jam, rentangJam, rupiah, tanggalPanjang } from '@/lib/format'

const props = defineProps({
    lapangan: { type: Object, default: null },
    tanggal: { type: String, default: '' },
    pilihan: { type: Object, default: null },
    durasi: { type: Number, default: 0 },
    pakaiLampu: { type: Boolean, default: false },
    lampuTersedia: { type: Boolean, default: false },
    tambahanLampuPerJam: { type: Number, default: 0 },
    biaya: { type: Object, required: true },
    loading: { type: Boolean, default: false },
    labelTombol: { type: String, default: 'Lanjutkan booking' },
    hint: { type: String, default: '' },
    bisaKirim: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])

const infoLampu = computed(() => {
    if (props.lampuTersedia) return `Tambahan lampu ${rupiah(props.tambahanLampuPerJam)} sekali per booking.`
    if (!props.pilihan) return 'Pilih jam main untuk mengatur lampu.'
    return `Lampu hanya untuk booking mulai pukul ${jam(props.lapangan?.jam_mulai_lampu)}.`
})

const statusLampu = computed(() => {
    if (!props.pilihan) return 'Belum ditentukan'
    return props.pakaiLampu ? 'Digunakan otomatis' : 'Tidak diperlukan'
})
</script>

<template>
    <aside class="rounded-3xl border border-[#E1E8F0] bg-white p-6 shadow-[0_2px_8px_rgba(20,39,68,0.04)]">
        <h2 class="text-xl font-semibold text-[#142744]">Ringkasan booking</h2>

        <!-- Lapangan -->
        <div class="mt-5 flex items-center gap-4">
            <div class="size-[70px] shrink-0 overflow-hidden rounded-xl bg-slate-100">
                <img v-if="lapangan?.gambar" :src="gambarUrl(lapangan.gambar)" :alt="lapangan?.nama"
                    class="h-full w-full object-cover" />
                <div v-else class="flex h-full items-center justify-center text-slate-300">
                    <LandPlot :size="24" />
                </div>
            </div>
            <div class="min-w-0">
                <p class="truncate text-base font-bold text-[#142744]">{{ lapangan?.nama ?? '-' }}</p>
                <p class="text-sm text-[#65758B]">{{ lapangan?.jenis_id?.nama ?? '-' }}</p>
            </div>
        </div>

        <div class="my-5 border-t border-[#EEF2F7]" />

        <!-- Tanggal & jam -->
        <dl class="space-y-4 text-sm">
            <div>
                <dt class="text-xs text-[#65758B]">Tanggal</dt>
                <dd class="mt-1 font-bold text-[#142744]">{{ tanggal ? tanggalPanjang(tanggal) : '-' }}</dd>
            </div>
            <div>
                <dt class="text-xs text-[#65758B]">Jam main</dt>
                <dd class="mt-1 flex items-center justify-between gap-4 font-bold text-[#142744]">
                    <template v-if="pilihan">
                        <span>{{ rentangJam(pilihan.mulai, pilihan.selesai) }}</span>
                        <span class="text-[#C2570C]">{{ durasi }} jam</span>
                    </template>
                    <span v-else class="font-semibold text-[#65758B]">Belum dipilih</span>
                </dd>
            </div>
        </dl>

        <div class="my-5 border-t border-[#EEF2F7]" />

        <!-- Lampu -->
        <div>
            <p class="text-sm font-bold text-[#142744]">Penggunaan lampu</p>
            <div class="mt-2 flex h-11 items-center rounded-xl border border-[#E1E8F0] bg-[#F4F6F8] px-4 text-sm font-medium text-[#65758B]">
                {{ statusLampu }}
            </div>
            <p class="mt-2 text-xs text-[#65758B]">{{ infoLampu }}</p>
        </div>

        <div class="my-5 border-t border-[#EEF2F7]" />

        <!-- Rincian -->
        <dl class="space-y-2 text-xs">
            <div class="flex justify-between gap-4">
                <dt class="text-[#65758B]">Sewa {{ durasi }} jam × {{ rupiah(biaya.hargaDasar) }}</dt>
                <dd class="font-bold text-[#142744]">{{ rupiah(biaya.sewa) }}</dd>
            </div>
            <div class="flex justify-between gap-4">
                <dt class="text-[#65758B]">Biaya lampu</dt>
                <dd class="font-bold text-[#142744]">{{ rupiah(biaya.biayaLampu) }}</dd>
            </div>
        </dl>

        <div class="my-5 border-t border-[#EEF2F7]" />

        <div class="flex items-center justify-between gap-3">
            <span class="text-sm font-bold text-[#142744]">Total pembayaran</span>
            <span class="text-3xl font-bold text-[#142744]">{{ rupiah(biaya.total) }}</span>
        </div>

        <button type="button" :disabled="!bisaKirim || loading"
            class="mt-5 h-12 w-full rounded-xl bg-[#FF9638] text-sm font-bold text-white transition-colors hover:bg-[#FF8C24] disabled:cursor-not-allowed disabled:opacity-50"
            @click="emit('submit')">
            {{ loading ? 'Memproses...' : labelTombol }}
        </button>

        <p v-if="hint" class="mt-4 rounded-xl bg-[#FFF1E3] px-4 py-3 text-xs leading-relaxed text-[#C2570C]">
            {{ hint }}
        </p>
    </aside>
</template>
