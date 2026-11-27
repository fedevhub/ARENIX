<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { AlertCircle, ChevronDown, Search } from 'lucide-vue-next'

import tableLapangan from '@/components/admin/lapangan/tableLapangan.vue'
import formLapangan from '@/components/admin/lapangan/formLapangan.vue'
import { Input } from '@/components/ui/input'
import Button from '@/components/ui/button/Button.vue'

import {
    getLapangan,
    tambahLapangan as tambahLapanganAPI,
    editLapangan as editLapanganAPI,
    hapusLapangan as deleteLapanganAPI,
} from '@/services/lapanganService'

import { getJenis } from '@/services/jenisService'

const CACHE_KEY = 'daftar_lapangan'

function bacaCacheLapangan() {
    const cachedLapangan = sessionStorage.getItem(CACHE_KEY)

    if (cachedLapangan === null) return []

    try {
        const lapangan = JSON.parse(cachedLapangan)

        if (!Array.isArray(lapangan)) {
            throw new TypeError('Cache lapangan harus berupa array.')
        }

        return lapangan
    } catch (error) {
        console.error('Cache lapangan tidak valid:', error)
        sessionStorage.removeItem(CACHE_KEY)
        return []
    }
}

const daftarLapangan = ref(bacaCacheLapangan())
const daftarJenis = ref([])

const loading = ref(daftarLapangan.value.length === 0)
const loadingJenis = ref(false)

const errorMessage = ref('')
const pencarian = ref('')
const filterJenis = ref('Semua')

const opsiJenis = computed(() => [
    {
        value: 'Semua',
        label: 'Semua Jenis',
    },
    ...daftarJenis.value.map((jenis) => ({
        value: String(jenis._id ?? jenis.id),
        label: jenis.nama,
    })),
])

async function ambilDaftarJenis() {
    loadingJenis.value = true

    try {
        const response = await getJenis()

        const jenis = response.data.data ?? response.data

        if (!Array.isArray(jenis)) {
            throw new TypeError('Respons API jenis tidak valid.')
        }

        daftarJenis.value = jenis

    } catch (error) {
        console.error('Gagal mengambil jenis:', error)
    } finally {
        loadingJenis.value = false
    }
}

const halamanSaatIni = ref(1)
const itemPerHalaman = ref(8)

watch([pencarian, filterJenis], () => {
    halamanSaatIni.value = 1
})

const lapanganDitampilkan = computed(() => {
    const query = pencarian.value.trim().toLowerCase()

    return daftarLapangan.value.filter((lapangan) => {

        const matchQuery =
            !query ||
            [
                lapangan.nama,
                lapangan.jenis,
                lapangan.jam_buka,
                lapangan.jam_tutup,
                lapangan.jam_mulai_lampu,
                lapangan.status,
            ].some((value) =>
                String(value ?? '').toLowerCase().includes(query)
            )

        // Filter berdasarkan ID jenis dari koleksi jenis
        const idJenisLapangan =
            lapangan.jenis_id?._id ??
            lapangan.jenis_id ??
            lapangan.jenis?._id ??
            lapangan.jenis

        const matchJenis =
            filterJenis.value === 'Semua' ||
            String(idJenisLapangan) === String(filterJenis.value)

        return matchQuery && matchJenis
    })
})

const totalHalaman = computed(() =>
    Math.max(
        1,
        Math.ceil(
            lapanganDitampilkan.value.length /
            itemPerHalaman.value
        )
    )
)

const lapanganPaginasi = computed(() => {
    const mulai =
        (halamanSaatIni.value - 1) *
        itemPerHalaman.value

    return lapanganDitampilkan.value.slice(
        mulai,
        mulai + itemPerHalaman.value
    )
})

const infoRentangData = computed(() => {
    if (!lapanganDitampilkan.value.length) {
        return {
            mulai: 0,
            akhir: 0,
            total: 0,
        }
    }

    const mulai =
        (halamanSaatIni.value - 1) *
        itemPerHalaman.value + 1

    const akhir = Math.min(
        halamanSaatIni.value * itemPerHalaman.value,
        lapanganDitampilkan.value.length
    )

    return {
        mulai,
        akhir,
        total: lapanganDitampilkan.value.length,
    }
})

const formTerbuka = ref(false)
const lapanganDipilih = ref(null)
const simpanLoading = ref(false)

async function ambilLapangan() {
    loading.value = true
    errorMessage.value = ''

    try {
        const response = await getLapangan()

        const lapangan = response.data.data ?? response.data

        if (!Array.isArray(lapangan)) {
            throw new TypeError(
                'Respons API lapangan tidak berisi daftar lapangan.'
            )
        }

        daftarLapangan.value = lapangan

        sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify(lapangan)
        )

    } catch (error) {
        console.error('Gagal mengambil lapangan:', error)

        errorMessage.value =
            error.response?.data?.message ??
            'Gagal memperbarui data lapangan. Data tersimpan tetap ditampilkan.'

    } finally {
        loading.value = false
    }
}

function tambahLapangan() {
    lapanganDipilih.value = null
    formTerbuka.value = true
}

function editLapangan(lapangan) {
    lapanganDipilih.value = lapangan
    formTerbuka.value = true
}


async function simpanFormLapangan(data) {
    if (simpanLoading.value) return

    if (!data.jenis_id) {
        alert('Silakan pilih jenis lapangan.')
        return
    }

    if (!lapanganDipilih.value && !(data.gambar instanceof File)) {
        alert('Silakan pilih gambar lapangan.')
        return
    }

    simpanLoading.value = true

    const modeEdit = Boolean(lapanganDipilih.value)

    try {
        if (modeEdit) {
            const id =
                lapanganDipilih.value._id ??
                lapanganDipilih.value.id

            await editLapanganAPI(id, data)
        } else {
            await tambahLapanganAPI(data)
        }

        formTerbuka.value = false

        await ambilLapangan()

        alert(
            modeEdit
                ? 'Lapangan berhasil diperbarui.'
                : 'Lapangan berhasil ditambahkan.'
        )

    } catch (error) {
        console.error(
            'Gagal menyimpan lapangan:',
            error.response?.data ?? error
        )

        alert(
            error.response?.data?.message ??
            error.message ??
            'Gagal menyimpan lapangan.'
        )

    } finally {
        simpanLoading.value = false
    }
}


async function hapusLapangan(id) {
    if (!confirm('Yakin ingin menghapus lapangan ini?')) {
        return
    }

    try {
        await deleteLapanganAPI(id)

        daftarLapangan.value =
            daftarLapangan.value.filter(
                (lapangan) =>
                    (lapangan._id ?? lapangan.id) !== id
            )

        sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify(daftarLapangan.value)
        )

        if (halamanSaatIni.value > totalHalaman.value) {
            halamanSaatIni.value = totalHalaman.value
        }

    } catch (error) {
        console.error('Gagal menghapus lapangan:', error)

        alert(
            error.response?.data?.message ??
            'Gagal menghapus lapangan.'
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
    ambilLapangan()
    ambilDaftarJenis()
})
</script>

<template>
    <main class="min-h-full bg-[#F4F6F8] p-6 md:p-8" style="font-family: 'DM Sans', Arial, sans-serif">

        <!-- HEADER -->
        <div>
            <h1 class="font-display text-3xl font-extrabold tracking-tight text-[#142744] md:text-4xl">
                Kelola Lapangan
            </h1>

            <div class="mt-1 flex flex-row items-center justify-between">
                <p class="text-base font-medium text-slate-600">
                    Kelola dan pantau data lapangan Arenix
                </p>

                <p class="text-base font-medium text-slate-600">
                    {{ tanggal }}
                </p>
            </div>
        </div>

        <!-- TOOLBAR -->
        <div class="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">

            <!-- PENCARIAN -->
            <div class="relative w-full sm:w-64">
                <Search :size="15"
                    class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                <Input v-model="pencarian" type="text" placeholder="Cari data..."
                    class="h-10 rounded-[10px] border-slate-200 bg-white pl-9 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[#142744] focus-visible:ring-0" />
            </div>

            <!-- FILTER JENIS -->
            <div class="relative">
                <select v-model="filterJenis" :disabled="loadingJenis"
                    class="h-10 w-44 appearance-none rounded-[10px] border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-600 outline-none focus:border-[#142744] disabled:cursor-wait disabled:opacity-60">
                    <option v-for="opsi in opsiJenis" :key="opsi.value" :value="opsi.value">
                        {{ opsi.label }}
                    </option>
                </select>

                <ChevronDown :size="16"
                    class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <!-- TAMBAH DATA -->
            <Button
                class="ml-auto h-10 rounded-[10px] bg-[#FF9638] px-6 text-sm font-bold text-white shadow-none hover:bg-[#FF8C24]"
                @click="tambahLapangan">
                Tambah Data
            </Button>
        </div>

        <!-- ERROR ALERT -->
        <div v-if="errorMessage" role="alert"
            class="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" />
            <span>{{ errorMessage }}</span>
        </div>

        <!-- TABEL LAPANGAN -->
        <div class="mt-6">
            <tableLapangan :lapangan="lapanganPaginasi" :loading="loading" :halaman-saat-ini="halamanSaatIni"
                :total-halaman="totalHalaman" :info-rentang="infoRentangData" @edit="editLapangan"
                @delete="hapusLapangan" @ganti-halaman="halamanSaatIni = $event" />
        </div>

        <!-- MODAL FORM -->
        <formLapangan v-model:open="formTerbuka" :lapangan="lapanganDipilih" :jenis-options="daftarJenis"
            :loading="simpanLoading" @save="simpanFormLapangan" />

    </main>
</template>
