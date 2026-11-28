<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertCircle, ArrowLeft, Lock } from 'lucide-vue-next'

import pilihTanggal from '@/components/shared/pilihTanggal.vue'
import pilihSlot from '@/components/shared/pilihSlot.vue'
import ringkasanBooking from '@/components/shared/ringkasanBooking.vue'
import { Input } from '@/components/ui/input'

import { useJadwalLapangan } from '@/composables/useJadwalLapangan'
import { buatBooking } from '@/services/bookingService'
import { getUser } from '@/lib/auth'
import { hargaHari } from '@/lib/booking'

const route = useRoute()
const router = useRouter()
const id = route.params.lapanganId

const user = getUser() ?? {}

const {
    lapangan, tarifLapangan, tanggal, pilihan, slots, durasi, aktif,
    lampuAktif, lampuTersedia, tambahanLampuPerJam, biaya,
    loading, loadingJadwal, error,
    muatAwal, muatJadwal, gantiTanggal,
} = useJadwalLapangan(id)

const catatan = ref('')
const galat = ref('')
const menyimpan = ref(false)

const bisaKirim = computed(() => aktif.value && Boolean(pilihan.value) && biaya.value.tersedia)

async function kirim() {
    galat.value = ''
    if (!pilihan.value) {
        galat.value = 'Pilih jam main terlebih dahulu.'
        return
    }

    menyimpan.value = true
    try {
        const res = await buatBooking({
            lapangan_id: id,
            tanggal: tanggal.value,
            jam_mulai: pilihan.value.mulai,
            jam_selesai: pilihan.value.selesai,
            pakai_lampu: lampuAktif.value,
            catatan: catatan.value.trim(),
        })

        router.replace(`/penyewa/booking/${res.data.data._id}/berhasil`)
    } catch (e) {
        galat.value = e.response?.data?.message ?? 'Gagal membuat booking.'
        pilihan.value = null
        await muatJadwal()
    } finally {
        menyimpan.value = false
    }
}

onMounted(() => muatAwal({
    tanggal: route.query.tanggal,
    mulai: route.query.mulai,
    selesai: route.query.selesai,
}))
</script>

<template>
    <div class="mx-auto max-w-[1296px] px-8 pb-16 pt-8 sm:px-10 lg:px-[72px]">
        <button type="button"
            class="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E1E8F0] bg-white px-5 text-sm font-bold text-[#142744] shadow-[0_2px_8px_rgba(20,39,68,0.04)] transition-colors hover:bg-[#F4F6F8]"
            @click="router.back()">
            <ArrowLeft :size="16" /> Kembali
        </button>

        <h1 class="mt-10 text-4xl font-semibold leading-tight text-[#142744] md:text-[40px]">Booking lapangan</h1>
        <p class="mt-1 text-base text-[#65758B]">Pilih tanggal dan jam main. Data penyewa diambil dari akunmu.</p>

        <div v-if="error || galat" role="alert"
            class="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" /> {{ galat || error }}
        </div>

        <div v-if="loading" class="mt-6 h-96 animate-pulse rounded-3xl bg-white" />

        <p v-else-if="lapangan && !aktif"
            class="mt-6 rounded-2xl border border-[#FBD9B5] bg-[#FFF1E3] p-5 text-sm font-semibold text-[#B45309]">
            Lapangan sedang maintenance dan belum bisa dibooking.
        </p>

        <div v-else-if="lapangan" class="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_400px]">
            <div class="space-y-6">
                <!-- Jadwal + slot dalam satu kartu -->
                <div class="rounded-3xl border border-[#E1E8F0] bg-white p-6 shadow-[0_2px_8px_rgba(20,39,68,0.04)]">
                    <pilihTanggal tertanam :model-value="tanggal" :tarif-lapangan="tarifLapangan"
                        @update:model-value="gantiTanggal" />

                    <pilihSlot tertanam v-model="pilihan" class="mt-5" :slots="slots" :tanggal="tanggal"
                        :loading="loadingJadwal" :harga-per-jam="hargaHari(tarifLapangan, tanggal)" />
                </div>

                <!-- Data penyewa -->
                <section
                    class="rounded-3xl border border-[#E1E8F0] bg-white p-6 shadow-[0_2px_8px_rgba(20,39,68,0.04)]">
                    <h2 class="text-2xl font-semibold text-[#142744]">Data penyewa</h2>
                    <p class="mt-1 text-xs text-[#65758B]">Diambil dari akun kamu. Hubungi petugas jika ada yang salah.
                    </p>

                    <div class="mt-5 grid gap-5 sm:grid-cols-2">
                        <div>
                            <label class="mb-2 block text-sm font-bold text-[#142744]">Nama penyewa *</label>
                            <div class="relative">
                                <Input :model-value="user.nama" readonly
                                    class="h-12! rounded-xl border-[#E1E8F0] bg-[#F4F6F8] pr-11 text-[#142744] shadow-none" />
                                <Lock :size="16"
                                    class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8A97AA]" />
                            </div>
                        </div>
                        <div>
                            <label class="mb-2 block text-sm font-bold text-[#142744]">
                                Nomor WhatsApp / Telepon *
                            </label>
                            <div class="relative">
                                <Input :model-value="user.no_hp" readonly
                                    class="h-12! rounded-xl border-[#E1E8F0] bg-[#F4F6F8] pr-11 text-[#142744] shadow-none" />
                                <Lock :size="16"
                                    class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8A97AA]" />
                            </div>
                        </div>
                        <div class="sm:col-span-2">
                            <label for="catatan" class="mb-2 block text-sm font-bold text-[#142744]">
                                Catatan (opsional)
                            </label>
                            <textarea id="catatan" v-model="catatan" rows="2" maxlength="300" :disabled="menyimpan"
                                placeholder="Contoh: kami datang 15 menit sebelum jadwal"
                                class="w-full rounded-xl border border-[#E1E8F0] bg-[#F4F6F8] px-4 py-3 text-sm text-[#142744] outline-none placeholder:text-[#8A97AA] focus:border-[#142744] focus:bg-white" />
                        </div>
                    </div>
                </section>
            </div>

            <div class="lg:sticky lg:top-24">
                <ringkasanBooking :lapangan="lapangan" :tanggal="tanggal" :pilihan="pilihan" :durasi="durasi"
                    :pakai-lampu="lampuAktif" :lampu-tersedia="lampuTersedia"
                    :tambahan-lampu-per-jam="tambahanLampuPerJam" :biaya="biaya" :loading="menyimpan"
                    :bisa-kirim="bisaKirim" label-tombol="Buat Booking"
                    hint="Bayar di kasir setelah booking dibuat. Booking bisa dibatalkan sebelum pembayaran dikonfirmasi petugas."
                    @submit="kirim" />
            </div>
        </div>
    </div>
</template>
