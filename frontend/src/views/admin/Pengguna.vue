<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { AlertCircle, ChevronDown, Search, X } from 'lucide-vue-next'
import tablePengguna from '@/components/admin/pengguna/tablePengguna.vue'
import formPengguna from '@/components/admin/pengguna/formPengguna.vue'
import { Input } from '@/components/ui/input'
import Button from '@/components/ui/button/Button.vue'
import {
    getPengguna,
    tambahPengguna as tambahPenggunaAPI,
    editPengguna as editPenggunaAPI,
    hapusPengguna as deletePenggunaAPI,
} from '@/services/penggunaService'

const CACHE_KEY = 'daftar_pengguna'

function bacaCachePengguna() {
    const cachedPengguna = sessionStorage.getItem(CACHE_KEY)
    if (cachedPengguna === null) return []

    try {
        const pengguna = JSON.parse(cachedPengguna)
        if (!Array.isArray(pengguna)) {
            throw new TypeError('Cache pengguna harus berupa array.')
        }
        return pengguna
    } catch (error) {
        console.error('Cache pengguna tidak valid:', error)
        sessionStorage.removeItem(CACHE_KEY)
        return []
    }
}

const daftarPengguna = ref(bacaCachePengguna())
const loading = ref(daftarPengguna.value.length === 0)
const errorMessage = ref('')
const pencarian = ref('')
const filterRole = ref('Semua')
const opsiRole = [
    { label: 'Semua role', value: 'Semua' },
    { label: 'Admin', value: 'Admin' },
    { label: 'Petugas', value: 'Petugas' },
    { label: 'Penyewa', value: 'Penyewa' },
]

// Pagination State
const halamanSaatIni = ref(1)
const itemPerHalaman = ref(8)

watch([pencarian, filterRole], () => {
    halamanSaatIni.value = 1
})

const penggunaDitampilkan = computed(() => {
    const query = pencarian.value.trim().toLowerCase()

    return daftarPengguna.value.filter((pengguna) => {
        const matchRole =
            filterRole.value === 'Semua' ||
            pengguna.role?.toLowerCase() === filterRole.value.toLowerCase()

        const matchQuery =
            !query ||
            [pengguna.nama, pengguna.username, pengguna.no_hp, pengguna.role].some((value) =>
                String(value ?? '').toLowerCase().includes(query)
            )

        return matchRole && matchQuery
    })
})

const totalHalaman = computed(() =>
    Math.max(1, Math.ceil(penggunaDitampilkan.value.length / itemPerHalaman.value))
)

const penggunaPaginasi = computed(() => {
    const mulai = (halamanSaatIni.value - 1) * itemPerHalaman.value
    return penggunaDitampilkan.value.slice(mulai, mulai + itemPerHalaman.value)
})

const infoRentangData = computed(() => {
    if (!penggunaDitampilkan.value.length) return { mulai: 0, akhir: 0, total: 0 }
    const mulai = (halamanSaatIni.value - 1) * itemPerHalaman.value + 1
    const akhir = Math.min(
        halamanSaatIni.value * itemPerHalaman.value,
        penggunaDitampilkan.value.length
    )
    return { mulai, akhir, total: penggunaDitampilkan.value.length }
})

const formTerbuka = ref(false)
const penggunaDipilih = ref(null)
const simpanLoading = ref(false)

async function ambilPengguna() {
    loading.value = true
    errorMessage.value = ''

    try {
        const response = await getPengguna()
        const pengguna = response.data.data ?? response.data

        if (!Array.isArray(pengguna)) {
            throw new TypeError('Respons API pengguna tidak berisi daftar pengguna.')
        }

        daftarPengguna.value = pengguna
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(daftarPengguna.value))
    } catch (error) {
        console.error('Gagal mengambil pengguna:', error)
        errorMessage.value =
            error.response?.data?.message ??
            'Gagal memperbarui data pengguna. Data tersimpan tetap ditampilkan.'
    } finally {
        loading.value = false
    }
}

function tambahPengguna() {
    penggunaDipilih.value = null
    formTerbuka.value = true
}

function editPengguna(pengguna) {
    penggunaDipilih.value = pengguna
    formTerbuka.value = true
}

async function simpanFormPengguna(data) {
    if (simpanLoading.value) return

    simpanLoading.value = true
    const modeEdit = Boolean(penggunaDipilih.value)

    try {
        if (modeEdit) {
            await editPenggunaAPI(penggunaDipilih.value._id ?? penggunaDipilih.value.id, data)
        } else {
            await tambahPenggunaAPI(data)
        }

        formTerbuka.value = false
        await ambilPengguna()

        alert(
            modeEdit
                ? 'Pengguna berhasil diperbarui.'
                : 'Pengguna berhasil ditambahkan.'
        )
    } catch (error) {
        console.error('Gagal menyimpan pengguna:', error.response?.data ?? error)

        const errors = error.response?.data?.errors
        const firstError = errors ? Object.values(errors).flat()[0] : null

        alert(
            firstError ??
            error.response?.data?.message ??
            'Gagal menyimpan pengguna.'
        )
    } finally {
        simpanLoading.value = false
    }
}

async function hapusPengguna(id) {
    if (!confirm('Yakin ingin menghapus pengguna ini?')) return

    try {
        await deletePenggunaAPI(id)

        daftarPengguna.value = daftarPengguna.value.filter(
            (pengguna) => (pengguna._id ?? pengguna.id) !== id
        )

        sessionStorage.setItem(CACHE_KEY, JSON.stringify(daftarPengguna.value))

        if (halamanSaatIni.value > totalHalaman.value) {
            halamanSaatIni.value = totalHalaman.value
        }
    } catch (error) {
        console.error('Gagal menghapus pengguna:', error)
        alert(
            error.response?.data?.message ??
            'Gagal menghapus pengguna.'
        )
    }
}

const tanggal = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
}).format(new Date())

onMounted(ambilPengguna)
</script>

<template>
    <main class="min-h-full bg-[#F4F6F8] p-4 sm:p-6 md:p-8" style="font-family: 'DM Sans', Arial, sans-serif">
        <!-- Header -->
        <div>
            <h1 class="font-display text-3xl font-extrabold tracking-tight text-[#142744] md:text-4xl">
                Kelola Pengguna
            </h1>
            <div class="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p class="text-base font-medium text-slate-600">Kelola dan pantau data pengguna Arenix</p>
                <p class="text-base font-medium text-slate-600">{{ tanggal }}</p>
            </div>
        </div>

        <!-- Toolbar: cari + filter + tambah -->
        <div class="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div class="relative w-full max-w-[280px]">
                <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                <input v-model="pencarian" type="text" placeholder="Cari data..."
                    class="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-xs outline-none transition focus:border-[#FF9638]" />

                <button v-if="pencarian" type="button" @click="pencarian = ''; halamanSaatIni = 1"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                    title="Hapus pencarian">
                    <X :size="15" />
                </button>
            </div>

            <div class="relative">
                <select v-model="filterRole"
                    class="h-10 w-44 appearance-none rounded-[10px] border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-600 outline-none focus:border-[#142744]">
                    <option v-for="opsi in opsiRole" :key="opsi.value" :value="opsi.value">
                        {{ opsi.label }}
                    </option>
                </select>
                <ChevronDown :size="16"
                    class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <Button
                class="ml-auto h-10 rounded-[10px] bg-[#FF9638] px-6 text-sm font-bold text-white shadow-none hover:bg-[#FF8C24]"
                @click="tambahPengguna">
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
            <tablePengguna :pengguna="penggunaPaginasi" :loading="loading" :halaman-saat-ini="halamanSaatIni"
                :total-halaman="totalHalaman" :info-rentang="infoRentangData" @edit="editPengguna"
                @delete="hapusPengguna" @ganti-halaman="halamanSaatIni = $event" />
        </div>

        <!-- Modal Form -->
        <formPengguna v-model:open="formTerbuka" :pengguna="penggunaDipilih" :loading="simpanLoading"
            @save="simpanFormPengguna" />
    </main>
</template>
