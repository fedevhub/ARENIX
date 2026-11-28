<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertCircle, ArrowLeft, LandPlot } from 'lucide-vue-next'

import pilihTanggal from '@/components/shared/pilihTanggal.vue'
import pilihSlot from '@/components/shared/pilihSlot.vue'
import tableTarif from '@/components/shared/tableTarif.vue'
import { useJadwalLapangan } from '@/composables/useJadwalLapangan'
import { gambarUrl, jam } from '@/lib/format'
import { hargaHari } from '@/lib/booking'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const {
    lapangan, tarifLapangan, tanggal, pilihan, slots, aktif,
    loading, loadingJadwal, error, muatAwal, gantiTanggal,
} = useJadwalLapangan(id)

function lanjut() {
    if (!pilihan.value) return
    router.push({
        path: `/petugas/booking/baru/${id}`,
        query: { tanggal: tanggal.value, mulai: pilihan.value.mulai, selesai: pilihan.value.selesai },
    })
}

onMounted(() => muatAwal())
</script>

<template>
    <div class="mx-auto min-h-full max-w-[1296px] p-4 sm:p-6 md:p-10">
        <button type="button" class="inline-flex h-11 items-center gap-2 rounded-xl border border-[#E1E8F0] bg-white px-5 text-sm font-bold text-[#142744] shadow-[0_2px_8px_rgba(20,39,68,0.04)] transition-colors hover:bg-[#F4F6F8]"
            @click="router.push('/petugas/lapangan')">
            <ArrowLeft :size="16" /> Kembali
        </button>

        <div v-if="error" role="alert"
            class="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" /> {{ error }}
        </div>

        <div v-if="loading" class="h-96 animate-pulse rounded-2xl bg-white" />

        <template v-else-if="lapangan">
            <div class="flex flex-wrap items-center gap-3 mt-3">
                <h1 class="text-3xl font-extrabold text-[#142744] md:text-4xl">{{ lapangan.nama }}</h1>
                <span class="rounded-full px-3 py-1 text-xs font-bold"
                    :class="aktif ? 'bg-green-100 text-green-700' : 'bg-[#FFF3E7] text-[#B45309]'">
                    {{ aktif ? 'Aktif' : 'Maintenance' }}
                </span>
            </div>

            <div class="mt-6 grid gap-6 lg:grid-cols-[400px_1fr]">
                <!-- Kiri: informasi + tarif -->
                <div class="space-y-6">
                    <section class="overflow-hidden rounded-2xl border border-[#E1E8F0] bg-white">
                        <div class="h-52 bg-slate-100">
                            <img v-if="lapangan.gambar" :src="gambarUrl(lapangan.gambar)" :alt="lapangan.nama"
                                class="h-full w-full object-cover" />
                            <div v-else class="flex h-full items-center justify-center text-slate-300">
                                <LandPlot :size="40" />
                            </div>
                        </div>
                        <div class="p-6">
                            <h2 class="text-lg font-extrabold text-[#142744]">Informasi lapangan</h2>
                            <dl class="mt-4 space-y-3 text-sm">
                                <div class="flex justify-between">
                                    <dt class="text-[#65758B]">Jenis Lapangan</dt>
                                    <dd class="font-bold text-[#142744]">{{ lapangan.jenis_id?.nama ?? '-' }}</dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-[#65758B]">Jam Buka</dt>
                                    <dd class="font-bold text-[#142744]">{{ jam(lapangan.jam_buka) }} WIB</dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-[#65758B]">Jam Tutup</dt>
                                    <dd class="font-bold text-[#142744]">{{ jam(lapangan.jam_tutup) }} WIB</dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-[#65758B]">Lampu Mulai</dt>
                                    <dd class="font-bold text-[#142744]">{{ jam(lapangan.jam_mulai_lampu) }} WIB</dd>
                                </div>
                            </dl>
                        </div>
                    </section>

                    <tabelTarif :tarif-lapangan="tarifLapangan" :jam-mulai-lampu="lapangan.jam_mulai_lampu" />
                </div>

                <!-- Kanan: jadwal -->
                <div class="space-y-6">
                    <p v-if="!aktif"
                        class="rounded-2xl border border-[#FDE2C3] bg-[#FFF3E7] p-5 text-sm font-semibold text-[#B45309]">
                        Lapangan sedang maintenance dan belum bisa dibooking.
                    </p>

                    <template v-else>
                        <pilihTanggal :model-value="tanggal" :tarif-lapangan="tarifLapangan"
                            @update:model-value="gantiTanggal" />

                        <pilihSlot v-model="pilihan" :slots="slots" :tanggal="tanggal" :loading="loadingJadwal"
                            :harga-per-jam="hargaHari(tarifLapangan, tanggal)" />

                        <button type="button" :disabled="!pilihan"
                            class="h-12 w-full rounded-xl bg-[#FF9638] text-sm font-extrabold text-white transition-colors hover:bg-[#FF8C24] disabled:cursor-not-allowed disabled:opacity-50"
                            @click="lanjut">
                            Booking lapangan
                        </button>
                    </template>
                </div>
            </div>
        </template>
    </div>
</template>
