<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { AlertCircle, ChevronDown, Search } from 'lucide-vue-next'
import tableTarif from '@/components/admin/tarif/tableTarif.vue'
import formTarif from '@/components/admin/tarif/formTarif.vue'
import { Input } from '@/components/ui/input'
import Button from '@/components/ui/button/Button.vue'
import {
    getTarif,
    tambahTarif as tambahTarifAPI,
    editTarif as editTarifAPI,
    hapusTarif as deleteTarifAPI,
} from '@/services/tarifService'

import { getLapangan } from '@/services/lapanganService'

const lapanganList = ref([])

async function ambilLapangan() {
    try {
        const response = await getLapangan()
        const data = response.data.data ?? response.data

        lapanganList.value = Array.isArray(data) ? data : []

        console.log('Data lapangan berhasil diambil:', lapanganList.value)
    } catch (error) {
        console.error('Gagal mengambil data lapangan:', error)
        lapanganList.value = []
    }
}

const CACHE_KEY = 'daftar_tarif'

function bacaCacheTarif() {
    const cachedTarif = sessionStorage.getItem(CACHE_KEY)
    if (cachedTarif === null) return []

    try {
        const tarif = JSON.parse(cachedTarif)
        if (!Array.isArray(tarif)) {
            throw new TypeError('Cache tarif harus berupa array.')
        }
        return tarif
    } catch (error) {
        console.error('Cache tarif tidak valid:', error)
        sessionStorage.removeItem(CACHE_KEY)
        return []
    }
}

const daftarTarif = ref(bacaCacheTarif())
const loading = ref(daftarTarif.value.length === 0)
const errorMessage = ref('')
const pencarian = ref('')

// Pagination State
const halamanSaatIni = ref(1)
const itemPerHalaman = ref(8)

watch([pencarian], () => {
    halamanSaatIni.value = 1
})

const tarifDitampilkan = computed(() => {
    const query = pencarian.value.trim().toLowerCase()

    return daftarTarif.value.filter((tarif) => {
        const matchQuery =
            !query ||
            [tarif.lapangan_id, tarif.tipe_hari, tarif.mulai_lampu, tarif.harg_per_jam].some((value) =>
                String(value ?? '').toLowerCase().includes(query)
            )

        return matchQuery
    })
})

const totalHalaman = computed(() =>
    Math.max(1, Math.ceil(tarifDitampilkan.value.length / itemPerHalaman.value))
)

const tarifPaginasi = computed(() => {
    const mulai = (halamanSaatIni.value - 1) * itemPerHalaman.value
    return tarifDitampilkan.value.slice(mulai, mulai + itemPerHalaman.value)
})

const infoRentangData = computed(() => {
    if (!tarifDitampilkan.value.length) return { mulai: 0, akhir: 0, total: 0 }
    const mulai = (halamanSaatIni.value - 1) * itemPerHalaman.value + 1
    const akhir = Math.min(
        halamanSaatIni.value * itemPerHalaman.value,
        tarifDitampilkan.value.length
    )
    return { mulai, akhir, total: tarifDitampilkan.value.length }
})

const formTerbuka = ref(false)
const tarifDipilih = ref(null)
const simpanLoading = ref(false)

async function ambilTarif() {
    loading.value = true
    errorMessage.value = ''

    try {
        const response = await getTarif()
        const tarif = response.data.data ?? response.data

        if (!Array.isArray(tarif)) {
            throw new TypeError('Respons API tarif tidak berisi daftar tarif.')
        }

        daftarTarif.value = tarif
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(daftarTarif.value))
    } catch (error) {
        console.error('Gagal mengambil tarif:', error)
        errorMessage.value =
            error.response?.data?.message ??
            'Gagal memperbarui data tarif. Data tersimpan tetap ditampilkan.'
    } finally {
        loading.value = false
    }
}

function tambahTarif() {
    tarifDipilih.value = null
    formTerbuka.value = true
}

function editTarif(tarif) {
    tarifDipilih.value = tarif
    formTerbuka.value = true
}

async function simpanFormTarif(data) {
    if (simpanLoading.value) return

    simpanLoading.value = true
    const modeEdit = Boolean(tarifDipilih.value)

    try {
        if (modeEdit) {
            await editTarifAPI(tarifDipilih.value._id ?? tarifDipilih.value.id, data)
        } else {
            await tambahTarifAPI(data)
        }

        formTerbuka.value = false
        await ambilTarif()

        alert(
            modeEdit
                ? 'Tarif berhasil diperbarui.'
                : 'Tarif berhasil ditambahkan.'
        )
    } catch (error) {
        console.error('Gagal menyimpan tarif:', error.response?.data ?? error)

        const errors = error.response?.data?.errors
        const firstError = errors ? Object.values(errors).flat()[0] : null

        alert(
            firstError ??
            error.response?.data?.message ??
            'Gagal menyimpan tarif.'
        )
    } finally {
        simpanLoading.value = false
    }
}

async function hapusTarif(id) {
    if (!confirm('Yakin ingin menghapus tarif ini?')) return

    try {
        await deleteTarifAPI(id)

        daftarTarif.value = daftarTarif.value.filter(
            (tarif) => (tarif._id ?? tarif.id) !== id
        )

        sessionStorage.setItem(CACHE_KEY, JSON.stringify(daftarTarif.value))

        if (halamanSaatIni.value > totalHalaman.value) {
            halamanSaatIni.value = totalHalaman.value
        }
    } catch (error) {
        console.error('Gagal menghapus tarif:', error)
        alert(
            error.response?.data?.message ??
            'Gagal menghapus tarif.'
        )
    }
}

const tanggal = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
}).format(new Date())

onMounted(() => {
    ambilTarif()
    ambilLapangan()
})
</script>

<template>
    <main class="min-h-full bg-[#F4F6F8] p-6 md:p-8" style="font-family: 'DM Sans', Arial, sans-serif">
        <!-- Header -->
        <div>
            <h1 class="font-display text-3xl font-extrabold tracking-tight text-[#142744] md:text-4xl">
                Kelola Tarif
            </h1>
            <div class="mt-1 flex flex-row items-center justify-between">
                <p class="text-base font-medium text-slate-600">Kelola dan pantau tarif lapangan Arenix</p>
                <p class="text-base font-medium text-slate-600">{{ tanggal }}</p>
            </div>
        </div>

        <!-- Toolbar: cari + filter + tambah -->
        <div class="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div class="relative w-full sm:w-64">
                <Search :size="15"
                    class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input v-model="pencarian" type="text" placeholder="Cari data..."
                    class="h-10 rounded-[10px] border-slate-200 bg-white pl-9 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[#142744] focus-visible:ring-0" />
            </div>

            <Button
                class="ml-auto h-10 rounded-[10px] bg-[#FF9638] px-6 text-sm font-bold text-white shadow-none hover:bg-[#FF8C24]"
                @click="tambahTarif">
                Tambah Data
            </Button>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" role="alert"
            class="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" />
            <span>{{ errorMessage }}</span>
        </div>

        <!-- Tabel Pengguna -->
        <div class="mt-6">
            <tableTarif :tarif="tarifPaginasi" :lapangan-list="lapanganList" :loading="loading"
                :halaman-saat-ini="halamanSaatIni" :total-halaman="totalHalaman" :info-rentang="infoRentangData"
                @edit="editTarif" @delete="hapusTarif" @ganti-halaman="halamanSaatIni = $event" />
        </div>

        <!-- Modal Form -->
        <formTarif v-model:open="formTerbuka" :tarif="tarifDipilih" :lapangan-list="lapanganList"
            :loading="simpanLoading" @save="simpanFormTarif" />
    </main>
</template>