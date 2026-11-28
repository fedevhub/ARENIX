<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { AlertCircle, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-vue-next'

import headerHalaman from '@/components/shared/headerHalaman.vue'
import tableBooking from '@/components/petugas/tableBooking.vue'
import { getBookings } from '@/services/bookingService'
import { useAksiBooking } from '@/composables/useAksiBooking'
import { kodeBooking, namaPenyewa } from '@/lib/format'

const router = useRouter()

const bookings = ref([])
const loading = ref(true)
const error = ref('')

const pencarian = ref('')
const filterStatus = ref('Semua')
const filterTanggal = ref('')

const halaman = ref(1)
const perHalaman = 8

async function muat() {
    loading.value = true
    error.value = ''
    try {
        const params = {}
        if (filterStatus.value !== 'Semua') params.status = filterStatus.value
        if (filterTanggal.value) params.tanggal = filterTanggal.value

        const res = await getBookings(params)
        bookings.value = res.data.data ?? []
    } catch (e) {
        error.value = e.response?.data?.message ?? 'Gagal memuat daftar booking.'
    } finally {
        loading.value = false
    }
}

const aksi = useAksiBooking(muat)

const tersaring = computed(() => {
    const q = pencarian.value.trim().toLowerCase()
    if (!q) return bookings.value
    return bookings.value.filter(
        (b) =>
            kodeBooking(b).toLowerCase().includes(q) ||
            namaPenyewa(b).toLowerCase().includes(q),
    )
})

const totalHalaman = computed(() => Math.max(1, Math.ceil(tersaring.value.length / perHalaman)))

const tampil = computed(() => {
    const mulai = (halaman.value - 1) * perHalaman
    return tersaring.value.slice(mulai, mulai + perHalaman)
})

const rentang = computed(() => {
    const total = tersaring.value.length
    if (!total) return { mulai: 0, akhir: 0, total }
    const mulai = (halaman.value - 1) * perHalaman + 1
    return { mulai, akhir: Math.min(halaman.value * perHalaman, total), total }
})

watch([pencarian, filterStatus, filterTanggal], () => { halaman.value = 1 })
watch([filterStatus, filterTanggal], muat)

onMounted(muat)
</script>

<template>
    <div class="min-h-full p-4 sm:p-6 md:p-8">
        <headerHalaman judul="Daftar Booking" subjudul="Kelola, konfirmasi, dan pantau seluruh booking lapangan" />

        <div class="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[#E1E8F0] bg-white p-4">
            <div class="relative w-full sm:w-72">
                <Search :size="15"
                    class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input v-model="pencarian" type="text" placeholder="Cari kode / nama penyewa..."
                    class="h-10 w-full rounded-[10px] border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#142744]" />
            </div>

            <div class="relative">
                <select v-model="filterStatus"
                    class="h-10 w-44 appearance-none rounded-[10px] border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-600 outline-none focus:border-[#142744]">
                    <option value="Semua">Semua status</option>
                    <option value="Menunggu">Menunggu Bayar</option>
                    <option value="Dikonfirmasi">Dikonfirmasi</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                </select>
                <ChevronDown :size="16"
                    class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <input v-model="filterTanggal" type="date"
                class="h-10 rounded-[10px] border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#142744]" />

            <button v-if="filterTanggal" type="button" class="text-xs font-bold text-[#65758B] hover:underline"
                @click="filterTanggal = ''">
                Hapus tanggal
            </button>

            <RouterLink to="/petugas/lapangan"
                class="ml-auto flex h-10 items-center rounded-[10px] bg-[#FF9638] px-6 text-sm font-bold text-white hover:bg-[#FF8C24]">
                + Ajukan Booking
            </RouterLink>
        </div>

        <div v-if="error" role="alert"
            class="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" /> {{ error }}
        </div>

        <section class="mt-6 overflow-hidden rounded-3xl border border-[#E1E8F0] bg-white shadow-[0_2px_8px_rgba(20,39,68,0.04)]">
            <tableBooking tertanam :bookings="tampil" :loading="loading" :sibuk="aksi.sedangProses.value"
                @detail="(b) => router.push(`/petugas/booking/${b._id}`)"
                @struk="(b) => router.push(`/petugas/booking/${b._id}/struk`)" @konfirmasi="aksi.konfirmasi"
                @selesai="aksi.selesai" @batal="aksi.batal" />
            <footer v-if="!loading && rentang.total > 0"
                class="flex flex-col items-center justify-between gap-4 border-t border-[#EEF2F7] px-6 py-4 sm:flex-row">
                <p class="text-xs text-[#65758B]">
                    Menampilkan <b class="text-[#142744]">{{ rentang.mulai }}</b> –
                    <b class="text-[#142744]">{{ rentang.akhir }}</b> dari
                    <b class="text-[#142744]">{{ rentang.total }}</b> booking
                </p>

                <div class="flex items-center gap-1.5">
                    <button type="button" :disabled="halaman === 1"
                        class="flex size-8 items-center justify-center rounded-lg border border-[#E1E8F0] text-[#142744] disabled:cursor-not-allowed disabled:opacity-40"
                        @click="halaman--">
                        <ChevronLeft :size="16" />
                    </button>
                    <button v-for="n in totalHalaman" :key="n" type="button"
                        class="flex size-8 items-center justify-center rounded-lg text-xs font-bold transition-colors"
                        :class="halaman === n
                            ? 'bg-[#142744] text-white'
                            : 'border border-[#E1E8F0] bg-white text-[#142744] hover:bg-[#F4F6F8]'" @click="halaman = n">
                        {{ n }}
                    </button>
                    <button type="button" :disabled="halaman === totalHalaman"
                        class="flex size-8 items-center justify-center rounded-lg border border-[#E1E8F0] text-[#142744] disabled:cursor-not-allowed disabled:opacity-40"
                        @click="halaman++">
                        <ChevronRight :size="16" />
                    </button>
                </div>
            </footer>
        </section>
    </div>
</template>
