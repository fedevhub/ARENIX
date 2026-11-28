<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertCircle, ArrowLeft, LandPlot } from 'lucide-vue-next'

import pilihTanggal from '@/components/shared/pilihTanggal.vue'
import pilihSlot from '@/components/shared/pilihSlot.vue'
import bannerLogin from '@/components/penyewa/bannerLogin.vue'

import { useJadwalLapangan } from '@/composables/useJadwalLapangan'
import { useMulaiBooking } from '@/composables/useMulaiBooking'
import { getUser, isLoggedIn } from '@/lib/auth'
import { gambarUrl, jam, rupiah } from '@/lib/format'
import { hargaHari } from '@/lib/booking'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const login = isLoggedIn()
const bisaBooking = login && getUser()?.role === 'penyewa'
const { mulai } = useMulaiBooking()

const {
    lapangan, tarifLapangan, tanggal, pilihan, slots, aktif,
    loading, loadingJadwal, error, muatAwal, gantiTanggal,
} = useJadwalLapangan(id)

const TARIF_WEEKDAY_DEFAULT = 55000
const TAMBAHAN_WEEKEND_DEFAULT = 20000
const TAMBAHAN_LAMPU_DEFAULT = 15000

// Tarif khusus dari admin dipakai terlebih dahulu. Bila kombinasinya belum
// dibuat, tampilkan aturan tarif standar agar informasi lapangan tetap lengkap.
const tarifWeekday = computed(() =>
    tarifLapangan.value?.Weekday?.dasar ?? TARIF_WEEKDAY_DEFAULT,
)
const tarifWeekend = computed(() =>
    tarifLapangan.value?.Weekend?.dasar
    ?? tarifWeekday.value + TAMBAHAN_WEEKEND_DEFAULT,
)
const tambahanLampu = computed(() => {
    const weekday = tarifLapangan.value?.Weekday
    const weekend = tarifLapangan.value?.Weekend

    if (weekday?.lampu != null && weekday?.dasar != null) {
        return weekday.lampu - weekday.dasar
    }

    if (weekend?.lampu != null && weekend?.dasar != null) {
        return weekend.lampu - weekend.dasar
    }

    return TAMBAHAN_LAMPU_DEFAULT
})

const info = computed(() => [
    { label: 'Jam operasional', nilai: `${jam(lapangan.value.jam_buka)} – ${jam(lapangan.value.jam_tutup)} WIB` },
    { label: 'Tarif weekday', nilai: `${rupiah(tarifWeekday.value)} / jam` },
    { label: 'Tarif weekend', nilai: `${rupiah(tarifWeekend.value)} / jam` },
    { label: 'Tambahan lampu', nilai: `${rupiah(tambahanLampu.value)} / booking` },
])

const catatanJadwal = computed(() =>
    bisaBooking
        ? ''
        : `Slot hanya bisa dilihat. ${login ? 'Hanya akun penyewa yang dapat booking.' : 'Login untuk memilih slot.'}`,
)

function lanjut() {
    if (!pilihan.value) return
    mulai(id, { tanggal: tanggal.value, mulai: pilihan.value.mulai, selesai: pilihan.value.selesai })
}

onMounted(() => muatAwal())
</script>

<template>
    <div class="mx-auto max-w-[1296px] px-8 pb-16 pt-8 sm:px-10 lg:px-[72px]">
        <button type="button"
            class="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E1E8F0] bg-white px-5 text-sm font-bold text-[#142744] shadow-[0_2px_8px_rgba(20,39,68,0.04)] transition-colors hover:bg-[#F4F6F8]"
            @click="router.push('/lapangan')">
            <ArrowLeft :size="16" /> Kembali
        </button>

        <div v-if="error" role="alert"
            class="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" /> {{ error }}
        </div>

        <div v-if="loading" class="mt-6 h-96 animate-pulse rounded-3xl bg-white" />

        <template v-else-if="lapangan">
            <!-- Foto + info -->
            <div class="mt-6 grid gap-6 lg:grid-cols-2">
                <div class="h-72 overflow-hidden rounded-3xl bg-slate-100 lg:h-auto lg:min-h-[330px]">
                    <img v-if="lapangan.gambar" :src="gambarUrl(lapangan.gambar)" :alt="lapangan.nama"
                        class="h-full w-full object-cover" />
                    <div v-else class="flex h-full items-center justify-center text-slate-300">
                        <LandPlot :size="48" />
                    </div>
                </div>

                <div class="rounded-3xl border border-[#E1E8F0] bg-white p-6 shadow-[0_2px_8px_rgba(20,39,68,0.04)]">
                    <div class="flex items-center justify-between gap-2">
                        <span class="rounded-full bg-[#EAF1FF] px-3.5 py-1.5 text-[11px] font-bold text-[#2358D6]">
                            {{ lapangan.jenis_id?.nama ?? '-' }}
                        </span>
                        <span class="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold"
                            :class="aktif ? 'bg-[#E9F9F0] text-[#0E8A4F]' : 'bg-[#FFF3E7] text-[#B45309]'">
                            <span class="size-1.5 rounded-full" :class="aktif ? 'bg-[#10B981]' : 'bg-[#F59E0B]'" />
                            {{ aktif ? 'Aktif' : 'Maintenance' }}
                        </span>
                    </div>

                    <h1 class="mt-2 text-4xl font-semibold leading-tight text-[#142744]">{{ lapangan.nama }}</h1>
                    <p v-if="lapangan.deskripsi" class="mt-1 text-sm text-[#65758B]">{{ lapangan.deskripsi }}</p>

                    <dl class="mt-4">
                        <div v-for="i in info" :key="i.label"
                            class="flex items-center justify-between gap-4 border-t border-[#EEF2F7] py-3.5 text-sm">
                            <dt class="text-[#65758B]">{{ i.label }}</dt>
                            <dd class="font-bold text-[#142744]">{{ i.nilai }}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <!-- Maintenance -->
            <template v-if="!aktif">
                <h2 class="mt-8 text-2xl font-semibold text-[#142744]">Jadwal &amp; slot kosong</h2>
                <p
                    class="mt-4 rounded-2xl border border-[#FBD9B5] bg-[#FFF1E3] p-5 text-sm font-semibold text-[#B45309]">
                    Lapangan sedang maintenance dan belum bisa dibooking.
                </p>
            </template>

            <!-- Jadwal & slot -->
            <template v-else>
                <div
                    class="mt-6 rounded-3xl border border-[#E1E8F0] bg-white p-6 shadow-[0_2px_8px_rgba(20,39,68,0.04)]">
                    <pilihTanggal tertanam judul="Jadwal & slot kosong" :catatan="catatanJadwal" :model-value="tanggal"
                        :tarif-lapangan="tarifLapangan" @update:model-value="gantiTanggal" />

                    <pilihSlot tertanam v-model="pilihan" class="mt-6" :slots="slots" :tanggal="tanggal"
                        :loading="loadingJadwal" :harga-per-jam="hargaHari(tarifLapangan, tanggal)"
                        :readonly="!bisaBooking" />

                    <button v-if="bisaBooking" type="button" :disabled="!pilihan"
                        class="mt-6 h-12 w-full rounded-xl bg-[#FF9638] text-sm font-bold text-white transition-colors hover:bg-[#FF8C24] disabled:cursor-not-allowed disabled:opacity-50"
                        @click="lanjut">
                        Booking lapangan
                    </button>
                </div>

                <div v-if="!login" class="mt-6">
                    <bannerLogin gelap judul="Mau booking lapangan ini?"
                        teks="Daftar akun dan login dulu untuk memilih jam main dan membuat booking." />
                </div>
            </template>
        </template>
    </div>
</template>
