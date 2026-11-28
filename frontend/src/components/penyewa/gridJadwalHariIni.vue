<script setup>
import { computed } from 'vue'
import { jam } from '@/lib/format'
import { Info } from 'lucide-vue-next'

const props = defineProps({
    daftar: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
})

const aktif = computed(() => props.daftar.filter((l) => l.status === 'Aktif'))
// Landing page cukup menampilkan ringkasan agar tabel tidak terlalu panjang.
const aktifTerbatas = computed(() => aktif.value.slice(0, 5))

// Generate jam dari 08.00 sampai 23.00 (bisa disesuaikan)
const kolom = computed(() => {
    const semuaJam = []
    for (let i = 8; i <= 23; i++) {
        const jamStr = `${i.toString().padStart(2, '0')}:00`
        semuaJam.push(jamStr)
    }
    return semuaJam
})

const statusDi = (lapangan, mulai) =>
    lapangan.slotsHariIni.find((s) => s.mulai === mulai)?.status ?? null

const kelas = {
    Tersedia: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 cursor-pointer transition-all duration-200',
    Terisi: 'bg-slate-50 text-slate-400 border border-slate-200',
    Lewat: 'bg-transparent text-slate-300 border border-transparent',
}
</script>

<template>
    <div class="rounded-2xl border border-[#E1E8F0] bg-white shadow-sm overflow-hidden flex flex-col">

        <!-- Header Info & Legenda -->
        <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8FAFC] px-6 py-4 border-b border-[#E1E8F0] shrink-0">
            <p class="text-[13px] text-[#65758B] flex items-center gap-2">
                <Info class="size-4 text-[#FF9638] shrink-0" />
                <span>Geser tabel ke kanan untuk melihat jam lainnya. Pilih jam hijau untuk booking.</span>
            </p>
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-1.5">
                    <span class="size-2.5 rounded-full bg-emerald-400"></span>
                    <span class="text-[11px] font-semibold text-[#142744]">Tersedia</span>
                </div>
                <div class="flex items-center gap-1.5">
                    <span class="size-2.5 rounded-full bg-slate-300"></span>
                    <span class="text-[11px] font-semibold text-[#142744]">Terisi</span>
                </div>
            </div>
        </div>

        <!-- Area Tabel yang bisa di-scroll -->
        <div class="overflow-x-auto relative custom-scrollbar">
            <table class="w-full text-left border-separate border-spacing-y-1">
                <!-- Head Tabel -->
                <thead>
                    <tr class="text-[11px] font-bold uppercase tracking-wider text-[#65758B]">
                        <!-- Sticky Kolom Kiri -->
                        <th class="sticky left-0 z-20 bg-white px-6 py-3 min-w-[180px] border-r border-[#E1E8F0]">
                            Lapangan
                        </th>
                        <th v-for="k in kolom" :key="k" class="px-3 py-3 text-center min-w-[80px]">
                            {{ jam(k) }}
                        </th>
                    </tr>
                </thead>

                <!-- Body Tabel -->
                <tbody>
                    <tr v-if="loading">
                        <td :colspan="kolom.length + 1" class="px-6 py-12 text-center">
                            <div class="flex flex-col items-center gap-3">
                                <div
                                    class="size-6 animate-spin rounded-full border-2 border-[#FF9638] border-t-transparent">
                                </div>
                                <p class="text-sm text-[#65758B]">Memuat jadwal...</p>
                            </div>
                        </td>
                    </tr>

                    <tr v-else-if="!aktif.length">
                        <td :colspan="kolom.length + 1" class="px-6 py-12 text-center text-sm text-[#65758B]">
                            Belum ada lapangan aktif.
                        </td>
                    </tr>

                    <!-- Data Baris -->
                    <tr v-for="l in aktifTerbatas" v-else :key="l._id" class="group">

                        <!-- Sticky Kolom Kiri (Lapangan) -->
                        <!-- Ditambahkan shadow agar terlihat memisahkan diri saat di-scroll -->
                        <td
                            class="sticky left-0 z-20 bg-[#F8FAFC] group-hover:bg-[#F1F5F9] px-6 py-3 border-r border-[#E1E8F0] transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                            <p class="text-[13px] font-bold text-[#142744] whitespace-nowrap">{{ l.nama }}</p>
                            <p class="text-[11px] text-[#65758B] mt-0.5 whitespace-nowrap">{{ l.jenis_id?.nama }}</p>
                        </td>

                        <!-- Slot Jam -->
                        <td v-for="k in kolom" :key="k"
                            class="bg-[#F8FAFC] px-1 py-3 text-center group-hover:bg-[#F1F5F9] transition-colors">
                            <span v-if="statusDi(l, k)"
                                class="mx-auto block w-[64px] max-w-full rounded-lg py-2 text-[11px] font-bold"
                                :class="kelas[statusDi(l, k)]">
                                {{ statusDi(l, k) }}
                            </span>
                            <span v-else class="text-slate-300">–</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
/* Kustomisasi Scrollbar agar lebih tipis dan elegan */
.custom-scrollbar::-webkit-scrollbar {
    height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #F8FAFC;
    border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94A3B8;
}
</style>
