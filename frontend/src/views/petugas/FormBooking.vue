<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertCircle, ArrowLeft } from 'lucide-vue-next'

import pilihTanggal from '@/components/shared/pilihTanggal.vue'
import pilihSlot from '@/components/shared/pilihSlot.vue'
import ringkasanBooking from '@/components/shared/ringkasanBooking.vue'
import { Input } from '@/components/ui/input'

import { useJadwalLapangan } from '@/composables/useJadwalLapangan'
import { buatBooking } from '@/services/bookingService'
import { hargaHari } from '@/lib/booking'

const route = useRoute()
const router = useRouter()
const id = route.params.lapanganId

const {
    lapangan, tarifLapangan, tanggal, pilihan, slots, durasi, aktif,
    lampuAktif, lampuTersedia, tambahanLampuPerJam, biaya,
    loading, loadingJadwal, error,
    muatAwal, muatJadwal, gantiTanggal,
} = useJadwalLapangan(id)

const form = reactive({ nama: '', hp: '', catatan: '' })
const galat = ref('')
const menyimpan = ref(false)

const bisaKirim = computed(
    () => aktif.value && Boolean(pilihan.value) && biaya.value.tersedia &&
        form.nama.trim().length > 0 && form.hp.trim().length >= 8,
)

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
            nama_penyewa: form.nama.trim(),
            no_hp_penyewa: form.hp.trim(),
            catatan: form.catatan.trim(),
        })

        router.replace(`/petugas/booking/${res.data.data._id}`)
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
    <div class="mx-auto min-h-full max-w-[1296px] p-4 sm:p-6 md:p-10">
        <button type="button" class="inline-flex h-11 items-center gap-2 rounded-xl border border-[#E1E8F0] bg-white px-5 text-sm font-bold text-[#142744] shadow-[0_2px_8px_rgba(20,39,68,0.04)] transition-colors hover:bg-[#F4F6F8]"
            @click="router.back()">
            <ArrowLeft :size="16" /> Kembali
        </button>

        <h1 class="text-3xl font-extrabold text-[#142744] md:text-4xl mt-3">Booking lapangan</h1>
        <p class="mt-1 text-base text-[#65758B]">Pilih tanggal dan jam main, lalu isi data penyewa.</p>

        <div v-if="error || galat" role="alert"
            class="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" /> {{ galat || error }}
        </div>

        <div v-if="loading" class="mt-6 h-96 animate-pulse rounded-2xl bg-white" />

        <p v-else-if="lapangan && !aktif"
            class="mt-6 rounded-2xl border border-[#FDE2C3] bg-[#FFF3E7] p-5 text-sm font-semibold text-[#B45309]">
            Lapangan sedang maintenance dan belum bisa dibooking.
        </p>

        <div v-else-if="lapangan" class="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
            <div class="space-y-6">
                <pilihTanggal :model-value="tanggal" :tarif-lapangan="tarifLapangan"
                    @update:model-value="gantiTanggal" />

                <pilihSlot v-model="pilihan" :slots="slots" :tanggal="tanggal" :loading="loadingJadwal"
                    :harga-per-jam="hargaHari(tarifLapangan, tanggal)" />

                <section class="rounded-2xl border border-[#E1E8F0] bg-white p-6">
                    <h2 class="text-lg font-extrabold text-[#142744]">Data penyewa</h2>
                    <p class="text-xs text-[#65758B]">Booking dibuat oleh petugas atas nama penyewa.</p>

                    <div class="mt-5 grid gap-5 sm:grid-cols-2">
                        <div>
                            <label for="nama" class="mb-2 block text-sm font-medium text-[#142744]">
                                Nama penyewa <span class="text-red-600">*</span>
                            </label>
                            <Input id="nama" v-model="form.nama" placeholder="Contoh: Rizky Pratama"
                                class="h-10! rounded-lg" :disabled="menyimpan" />
                        </div>
                        <div>
                            <label for="hp" class="mb-2 block text-sm font-medium text-[#142744]">
                                Nomor WhatsApp / Telepon <span class="text-red-600">*</span>
                            </label>
                            <Input id="hp" v-model="form.hp" type="tel" placeholder="08xx-xxxx-xxxx"
                                class="h-10! rounded-lg" :disabled="menyimpan" />
                        </div>
                        <div class="sm:col-span-2">
                            <label for="catatan" class="mb-2 block text-sm font-medium text-[#142744]">
                                Catatan (opsional)
                            </label>
                            <textarea id="catatan" v-model="form.catatan" rows="3" maxlength="300" :disabled="menyimpan"
                                placeholder="Contoh: penyewa datang 15 menit sebelum jadwal untuk pelunasan di kasir"
                                class="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-[#142744]" />
                        </div>
                    </div>
                </section>
            </div>

            <div class="lg:sticky lg:top-6">
                <ringkasanBooking :lapangan="lapangan" :tanggal="tanggal" :pilihan="pilihan" :durasi="durasi"
                    :pakai-lampu="lampuAktif" :lampu-tersedia="lampuTersedia"
                    :tambahan-lampu-per-jam="tambahanLampuPerJam" :biaya="biaya" :loading="menyimpan"
                    :bisa-kirim="bisaKirim" hint="Periksa kembali jadwal dan data penyewa sebelum melanjutkan."
                    @submit="kirim" />
            </div>
        </div>
    </div>
</template>
