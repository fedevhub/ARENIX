<script setup>
import { jam, rupiah } from '@/lib/format'

defineProps({
    tarifLapangan: { type: Object, default: null },
    jamMulaiLampu: { type: String, default: '' },
})

const baris = ['Weekday', 'Weekend']

const TARIF_WEEKDAY_DEFAULT = 55000
const TAMBAHAN_WEEKEND_DEFAULT = 20000
const TAMBAHAN_LAMPU_DEFAULT = 15000

function hargaDasar(tarifLapangan, tipe) {
    if (tarifLapangan?.[tipe]?.dasar != null) return tarifLapangan[tipe].dasar
    if (tipe === 'Weekend') {
        return (tarifLapangan?.Weekday?.dasar ?? TARIF_WEEKDAY_DEFAULT) + TAMBAHAN_WEEKEND_DEFAULT
    }
    return TARIF_WEEKDAY_DEFAULT
}

function tambahanLampu(tarifLapangan, tipe) {
    const tarif = tarifLapangan?.[tipe]
    if (tarif?.lampu != null && tarif?.dasar != null) return tarif.lampu - tarif.dasar
    return TAMBAHAN_LAMPU_DEFAULT
}
</script>

<template>
    <section class="rounded-2xl border border-[#E1E8F0] bg-white p-6">
        <h2 class="text-lg font-extrabold text-[#142744]">Tarif lapangan</h2>

        <table class="mt-4 w-full text-left text-sm">
            <thead>
                <tr class="bg-[#F1F5F9] text-xs font-bold text-[#65758B]">
                    <th class="rounded-l-lg px-4 py-2.5">Tipe Hari</th>
                    <th class="px-4 py-2.5">Harga/Jam</th>
                    <th class="rounded-r-lg px-4 py-2.5">Lampu Nyala</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="tipe in baris" :key="tipe" class="border-b border-[#E1E8F0] last:border-0">
                    <td class="px-4 py-3 font-semibold text-[#142744]">{{ tipe }}</td>
                    <td class="px-4 py-3 text-[#142744]">
                        {{ rupiah(hargaDasar(tarifLapangan, tipe)) }}
                    </td>
                    <td class="px-4 py-3 text-[#142744]">
                        {{ rupiah(tambahanLampu(tarifLapangan, tipe)) }}
                    </td>
                </tr>
            </tbody>
        </table>

        <p class="mt-3 text-xs text-[#65758B]">
            Biaya lampu ditambahkan sekali per booking jika digunakan
            <template v-if="jamMulaiLampu">(untuk booking mulai pukul {{ jam(jamMulaiLampu) }}).</template>
        </p>
    </section>
</template>
