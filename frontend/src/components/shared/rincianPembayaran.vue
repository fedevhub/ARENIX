<script setup>
import { computed } from 'vue'
import { rupiah } from '@/lib/format'

const props = defineProps({
    booking: { type: Object, required: true },
    labelTotal: { type: String, default: 'Total Tagihan' },
    ringkas: { type: Boolean, default: false }, // tampilan penyewa: 2 baris + kotak total
})

const r = computed(() => props.booking.rincian ?? {})
const sewa = computed(() => props.booking.durasi_jam * (r.value.harga_dasar_per_jam ?? 0))
const lampu = computed(() => (r.value.jam_lampu ?? 0) * (r.value.tambahan_lampu_per_jam ?? 0))
</script>

<template>
    <!-- Tampilan ringkas (sesuai Figma penyewa) -->
    <div v-if="ringkas">
        <dl class="space-y-3 text-sm">
            <div class="flex justify-between gap-4">
                <dt class="text-[#65758B]">
                    Sewa lapangan ({{ booking.durasi_jam }} jam × {{ rupiah(r.harga_dasar_per_jam) }})
                </dt>
                <dd class="font-bold text-[#142744]">{{ rupiah(sewa) }}</dd>
            </div>
            <div class="flex justify-between gap-4">
                <dt class="text-[#65758B]">
                    Tambahan lampu<template v-if="(r.jam_lampu ?? 0) > 0">
                        (sekali per booking)</template>
                </dt>
                <dd class="font-bold text-[#142744]">{{ rupiah(lampu) }}</dd>
            </div>
        </dl>

        <div class="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-[#F0F3F8] px-5 py-5">
            <span class="text-sm font-bold text-[#142744]">{{ labelTotal }}</span>
            <span class="text-3xl font-bold text-[#142744]">{{ rupiah(booking.total_biaya) }}</span>
        </div>
    </div>

    <!-- Tampilan lengkap (asli) -->
    <dl v-else class="space-y-3 text-sm">
        <div class="flex justify-between gap-4">
            <dt class="text-[#65758B]">Tarif Lapangan ({{ r.tipe_hari ?? '-' }})</dt>
            <dd class="font-semibold text-[#142744]">{{ rupiah(r.harga_dasar_per_jam) }} / jam</dd>
        </div>
        <div class="flex justify-between gap-4">
            <dt class="text-[#65758B]">
                Sewa Lapangan ({{ booking.durasi_jam }} jam × {{ rupiah(r.harga_dasar_per_jam) }})
            </dt>
            <dd class="font-semibold text-[#142744]">{{ rupiah(sewa) }}</dd>
        </div>
        <div class="flex justify-between gap-4">
            <dt class="text-[#65758B]">
                Tambahan Lampu (sekali per booking)
            </dt>
            <dd class="font-semibold text-[#142744]">{{ rupiah(lampu) }}</dd>
        </div>
        <div class="flex items-center justify-between border-t border-dashed border-[#E1E8F0] pt-3">
            <dt class="font-extrabold text-[#142744]">{{ labelTotal }}</dt>
            <dd class="text-xl font-extrabold text-[#FF9638]">{{ rupiah(booking.total_biaya) }}</dd>
        </div>
    </dl>
</template>
