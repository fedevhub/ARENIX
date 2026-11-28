<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { AlertCircle, ChevronDown, Search, X } from 'lucide-vue-next'
import tableJenis from '@/components/admin/jenis/tableJenis.vue'
import formJenis from '@/components/admin/jenis/formJenis.vue'
import { Input } from '@/components/ui/input'
import Button from '@/components/ui/button/Button.vue'
import {
    getJenis,
    tambahJenis as tambahJenisAPI,
    editJenis as editJenisAPI,
    hapusJenis as deleteJenisAPI,
} from '@/services/jenisService'

const CACHE_KEY = 'daftar_jenis'

function bacaCacheJenis() {
    const cachedJenis = sessionStorage.getItem(CACHE_KEY)
    if (cachedJenis === null) return []

    try {
        const jenis = JSON.parse(cachedJenis)
        if (!Array.isArray(jenis)) {
            throw new TypeError('Cache jenis harus berupa array.')
        }
        return jenis
    } catch (error) {
        console.error('Cache jenis tidak valid:', error)
        sessionStorage.removeItem(CACHE_KEY)
        return []
    }
}

const daftarJenis = ref(bacaCacheJenis())
const loading = ref(daftarJenis.value.length === 0)
const errorMessage = ref('')
const pencarian = ref('')

// Pagination State
const halamanSaatIni = ref(1)
const itemPerHalaman = ref(8)


const jenisDitampilkan = computed(() => {
    const query = pencarian.value.trim().toLowerCase()

    return daftarJenis.value.filter((jenis) => {
        const matchQuery =
            !query ||
            [jenis.nama].some((value) =>
                String(value ?? '').toLowerCase().includes(query)
            )

        return matchQuery
    })
})

const totalHalaman = computed(() =>
    Math.max(1, Math.ceil(jenisDitampilkan.value.length / itemPerHalaman.value))
)

const jenisPaginasi = computed(() => {
    const mulai = (halamanSaatIni.value - 1) * itemPerHalaman.value
    return jenisDitampilkan.value.slice(mulai, mulai + itemPerHalaman.value)
})

const infoRentangData = computed(() => {
    if (!jenisDitampilkan.value.length) return { mulai: 0, akhir: 0, total: 0 }
    const mulai = (halamanSaatIni.value - 1) * itemPerHalaman.value + 1
    const akhir = Math.min(
        halamanSaatIni.value * itemPerHalaman.value,
        jenisDitampilkan.value.length
    )
    return { mulai, akhir, total: jenisDitampilkan.value.length }
})

const formTerbuka = ref(false)
const jenisDipilih = ref(null)
const simpanLoading = ref(false)

async function ambilJenis() {
    loading.value = true
    errorMessage.value = ''

    try {
        const response = await getJenis()
        const jenis = response.data.data ?? response.data

        if (!Array.isArray(jenis)) {
            throw new TypeError('Respons API jenis tidak berisi daftar jenis.')
        }

        daftarJenis.value = jenis
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(daftarJenis.value))
    } catch (error) {
        console.error('Gagal mengambil jenis:', error)
        errorMessage.value =
            error.response?.data?.message ??
            'Gagal memperbarui data jenis. Data tersimpan tetap ditampilkan.'
    } finally {
        loading.value = false
    }
}

function tambahJenis() {
    jenisDipilih.value = null
    formTerbuka.value = true
}

function editJenis(jenis) {
    jenisDipilih.value = jenis
    formTerbuka.value = true
}

async function simpanFormJenis(data) {
    if (simpanLoading.value) return

    simpanLoading.value = true
    const modeEdit = Boolean(jenisDipilih.value)

    try {
        if (modeEdit) {
            await editJenisAPI(jenisDipilih.value._id ?? jenisDipilih.value.id, data)
        } else {
            await tambahJenisAPI(data)
        }

        formTerbuka.value = false
        await ambilJenis()

        alert(
            modeEdit
                ? 'Jenis lapangan berhasil diperbarui.'
                : 'Jenis lapangan berhasil ditambahkan.'
        )
    } catch (error) {
        console.error('Gagal menyimpan jenis:', error.response?.data ?? error)

        const errors = error.response?.data?.errors
        const firstError = errors ? Object.values(errors).flat()[0] : null

        alert(
            firstError ??
            error.response?.data?.message ??
            'Gagal menyimpan jenis.'
        )
    } finally {
        simpanLoading.value = false
    }
}

async function hapusJenis(id) {
    if (!confirm('Yakin ingin menghapus jenis ini?')) return

    try {
        await deleteJenisAPI(id)

        daftarJenis.value = daftarJenis.value.filter(
            (jenis) => (jenis._id ?? jenis.id) !== id
        )

        sessionStorage.setItem(CACHE_KEY, JSON.stringify(daftarJenis.value))

        if (halamanSaatIni.value > totalHalaman.value) {
            halamanSaatIni.value = totalHalaman.value
        }
    } catch (error) {
        console.error('Gagal menghapus jenis:', error)
        alert(
            error.response?.data?.message ??
            'Gagal menghapus jenis.'
        )
    }
}

const tanggal = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
}).format(new Date())

onMounted(ambilJenis)
</script>

<template>
    <main class="min-h-full bg-[#F4F6F8] p-4 sm:p-6 md:p-8" style="font-family: 'DM Sans', Arial, sans-serif">
        <!-- Header -->
        <div>
            <h1 class="font-display text-3xl font-extrabold tracking-tight text-[#142744] md:text-4xl">
                Kelola Jenis Lapangan
            </h1>
            <div class="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p class="text-base font-medium text-slate-600">Kelola dan pantau jenis lapangan Arenix</p>
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

            <Button
                class="ml-auto h-10 rounded-[10px] bg-[#FF9638] px-6 text-sm font-bold text-white shadow-none hover:bg-[#FF8C24]"
                @click="tambahJenis">
                Tambah Data
            </Button>
        </div>

        <div v-if="errorMessage" role="alert"
            class="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" />
            <span>{{ errorMessage }}</span>
        </div>

        <div class="mt-6">
            <tableJenis :jenis="jenisPaginasi" :loading="loading" :halaman-saat-ini="halamanSaatIni"
                :total-halaman="totalHalaman" :info-rentang="infoRentangData" @edit="editJenis"
                @delete="hapusJenis" @ganti-halaman="halamanSaatIni = $event" />
        </div>

        <formJenis v-model:open="formTerbuka" :jenis="jenisDipilih" :loading="simpanLoading"
            @save="simpanFormJenis" />
    </main>
</template>
