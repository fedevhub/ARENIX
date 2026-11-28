<script setup>
import {
    computed,
    onMounted,
    onBeforeUnmount,
    ref,
    watch
} from 'vue'

import {
    AlertCircle,
    ArrowRight,
    FileDown,
    X
} from 'lucide-vue-next'

import flatpickr from 'flatpickr'
import { Indonesian } from 'flatpickr/dist/l10n/id.js'
import 'flatpickr/dist/flatpickr.css'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import tablePendapatan from '@/components/admin/pendapatan/tablePendapatan.vue'
import CardPendapatan from '@/components/admin/pendapatan/cardPendapatan.vue'

import { getPendapatan } from '@/services/pendapatanService'

// ========================================
// STATE
// ========================================

const daftarPendapatan = ref([])
const loading = ref(false)
const errorMessage = ref('')
const pencarian = ref('')

// Pagination
const halamanSaatIni = ref(1)
const itemPerHalaman = ref(8)

// Date picker
const inputTanggalMulai = ref(null)
const inputTanggalAkhir = ref(null)

let pickerMulai = null
let pickerAkhir = null

// Tanggal filter internal: YYYY-MM-DD
const tanggalMulai = ref('')
const tanggalAkhir = ref('')

const tanggalMulaiDiterapkan = ref('')
const tanggalAkhirDiterapkan = ref('')

// Tanggal hari ini
const tanggal = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
}).format(new Date())

// ========================================
// KONFIGURASI DATE PICKER
// ========================================

const konfigurasiDatePicker = {
    locale: Indonesian,

    // Format penyimpanan
    dateFormat: 'Y-m-d',

    // Format tampilan
    altInput: true,
    altFormat: 'd/m/Y',

    disableMobile: true,
    allowInput: true,

    altInputClass:
        'h-10 w-[190px] rounded-[10px] border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#F79338]',
}

// ========================================
// MENGAMBIL DATA PENDAPATAN
// ========================================

async function ambilPendapatan() {
    loading.value = true
    errorMessage.value = ''

    try {
        const response = await getPendapatan()

        const hasil = response.data.data ?? response.data

        if (!Array.isArray(hasil)) {
            throw new TypeError(
                'Respons API tidak berisi daftar pendapatan.'
            )
        }

        daftarPendapatan.value = hasil

    } catch (error) {
        console.error(
            'Gagal mengambil data pendapatan:',
            error
        )

        errorMessage.value =
            error.response?.data?.message ??
            'Gagal mengambil data pendapatan.'

    } finally {
        loading.value = false
    }
}

// ========================================
// INISIALISASI DATE PICKER
// ========================================

function inisialisasiDatePicker() {
    pickerMulai = flatpickr(
        inputTanggalMulai.value,
        {
            ...konfigurasiDatePicker,

            onChange(selectedDates, dateStr) {
                tanggalMulai.value = dateStr

                if (pickerAkhir) {
                    pickerAkhir.set(
                        'minDate',
                        dateStr || null
                    )
                }
            }
        }
    )

    pickerAkhir = flatpickr(
        inputTanggalAkhir.value,
        {
            ...konfigurasiDatePicker,

            onChange(selectedDates, dateStr) {
                tanggalAkhir.value = dateStr
            }
        }
    )
}

// ========================================
// FORMAT TANGGAL
// ========================================

function ubahKeFormatIndonesia(value) {
    if (!value) {
        return 'Semua tanggal'
    }

    const [tahun, bulan, hari] = value.split('-')

    return `${hari}/${bulan}/${tahun}`
}

function formatTanggal(value) {
    if (!value) return '-'

    const tanggalValue = String(value).slice(0, 10)
    const [tahun, bulan, hari] = tanggalValue.split('-')

    if (!tahun || !bulan || !hari) {
        return '-'
    }

    return `${hari}/${bulan}/${tahun}`
}

// ========================================
// TERAPKAN FILTER TANGGAL
// ========================================

function terapkanFilterTanggal() {
    if (
        tanggalMulai.value &&
        tanggalAkhir.value &&
        tanggalMulai.value > tanggalAkhir.value
    ) {
        errorMessage.value =
            'Tanggal mulai tidak boleh melebihi tanggal akhir.'

        return
    }

    errorMessage.value = ''

    tanggalMulaiDiterapkan.value =
        tanggalMulai.value

    tanggalAkhirDiterapkan.value =
        tanggalAkhir.value

    halamanSaatIni.value = 1
}

// ========================================
// CLEAR FILTER TANGGAL
// ========================================

function clearFilterTanggal() {
    // Kosongkan tanggal mulai dan akhir
    tanggalMulai.value = ''
    tanggalAkhir.value = ''

    tanggalMulaiDiterapkan.value = ''
    tanggalAkhirDiterapkan.value = ''

    // Bersihkan date picker
    if (pickerMulai) {
        pickerMulai.clear()
        pickerMulai.set('minDate', null)
    }

    if (pickerAkhir) {
        pickerAkhir.clear()
        pickerAkhir.set('minDate', null)
    }

    // Reset halaman dan pesan error
    halamanSaatIni.value = 1
    errorMessage.value = ''
}

// ========================================
// FORMAT RUPIAH
// ========================================

function formatUang(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(angka) || 0)
}

function ambilTotalBayar(item) {
    return Number(
        item.total_bayar ??
        item.total_harga ??
        item.total_pembayaran ??
        item.total_biaya ??
        0
    )
}

// ========================================
// FILTER DAN PENCARIAN
// ========================================

const pendapatanDitampilkan = computed(() => {
    const keyword = pencarian.value
        .trim()
        .toLowerCase()

    return daftarPendapatan.value.filter((item) => {
        const namaPenyewa =
            item.user_id?.nama ||
            item.user_id?.username ||
            item.nama_penyewa ||
            ''

        const namaLapangan =
            item.lapangan_id?.nama || ''

        const tanggalBooking = item.tanggal
            ? formatTanggal(item.tanggal)
            : ''

        const tanggalData =
            String(item.tanggal ?? '').slice(0, 10)

        const durasi = String(
            item.durasi_jam || ''
        )

        const cocokPencarian =
            !keyword ||
            namaPenyewa.toLowerCase().includes(keyword) ||
            namaLapangan.toLowerCase().includes(keyword) ||
            tanggalBooking.toLowerCase().includes(keyword) ||
            durasi.includes(keyword)

        const cocokTanggalMulai =
            !tanggalMulaiDiterapkan.value ||
            tanggalData >= tanggalMulaiDiterapkan.value

        const cocokTanggalAkhir =
            !tanggalAkhirDiterapkan.value ||
            tanggalData <= tanggalAkhirDiterapkan.value

        return (
            cocokPencarian &&
            cocokTanggalMulai &&
            cocokTanggalAkhir
        )
    })
})

// ========================================
// EKSPOR PDF
// ========================================

function eksporPDF() {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
    })

    const dataPDF = pendapatanDitampilkan.value

    // Header
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(20, 39, 68)

    doc.text(
        'LAPORAN PENDAPATAN ARENIX',
        14,
        18
    )

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)

    doc.text(
        `Periode: ${ubahKeFormatIndonesia(tanggalMulaiDiterapkan.value)} - ${ubahKeFormatIndonesia(tanggalAkhirDiterapkan.value)}`,
        14,
        26
    )

    doc.text(
        `Tanggal ekspor: ${new Date().toLocaleDateString('id-ID')}`,
        14,
        32
    )

    // Ringkasan
    const totalPendapatan = dataPDF.reduce(
        (total, item) => {
            return total + ambilTotalBayar(item)
        },
        0
    )

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(20, 39, 68)

    doc.text(
        `Total Transaksi: ${dataPDF.length}`,
        14,
        42
    )

    doc.text(
        `Total Pendapatan: ${formatUang(totalPendapatan)}`,
        14,
        48
    )

    // Tabel PDF
    autoTable(doc, {
        startY: 55,

        head: [[
            'No',
            'Nama Penyewa',
            'Nama Lapangan',
            'Tanggal',
            'Durasi',
            'Total Bayar',
        ]],

        body: dataPDF.map((item, index) => [
            index + 1,

            item.user_id?.nama ||
            item.user_id?.username ||
            item.nama_penyewa ||
            '-',

            item.lapangan_id?.nama || '-',

            formatTanggal(item.tanggal),

            `${Number(item.durasi_jam) || 0} Jam`,

            formatUang(ambilTotalBayar(item)),
        ]),

        theme: 'grid',

        headStyles: {
            fillColor: [20, 39, 68],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 3,
        },

        bodyStyles: {
            fontSize: 9,
            textColor: [51, 65, 85],
            cellPadding: 3,
        },

        alternateRowStyles: {
            fillColor: [245, 247, 250],
        },

        columnStyles: {
            0: {
                halign: 'center',
                cellWidth: 13
            },

            1: {
                cellWidth: 48
            },

            2: {
                cellWidth: 48
            },

            3: {
                halign: 'center',
                cellWidth: 35
            },

            4: {
                halign: 'center',
                cellWidth: 30
            },

            5: {
                halign: 'right',
                cellWidth: 45
            },
        },

        margin: {
            left: 14,
            right: 14,
            bottom: 18,
        },

        didDrawPage: () => {
            const halaman =
                doc.internal.getNumberOfPages()

            const tinggi =
                doc.internal.pageSize.height

            doc.setFontSize(8)
            doc.setTextColor(148, 163, 184)

            doc.text(
                `Arenix - Laporan Pendapatan | Halaman ${halaman}`,
                14,
                tinggi - 8
            )
        },
    })

    const namaFile =
        `Laporan-Pendapatan-Arenix-${new Date()
            .toISOString()
            .slice(0, 10)}.pdf`

    doc.save(namaFile)
}

// ========================================
// PAGINATION
// ========================================

watch(pencarian, () => {
    halamanSaatIni.value = 1
})

const totalHalaman = computed(() =>
    Math.max(
        1,
        Math.ceil(
            pendapatanDitampilkan.value.length /
            itemPerHalaman.value
        )
    )
)

const pendapatanPaginasi = computed(() => {
    const mulai =
        (halamanSaatIni.value - 1) *
        itemPerHalaman.value

    return pendapatanDitampilkan.value.slice(
        mulai,
        mulai + itemPerHalaman.value
    )
})

const infoRentangData = computed(() => {
    const total =
        pendapatanDitampilkan.value.length

    if (total === 0) {
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
        halamanSaatIni.value *
        itemPerHalaman.value,
        total
    )

    return {
        mulai,
        akhir,
        total,
    }
})

// ========================================
// LIFECYCLE
// ========================================

onMounted(async () => {
    inisialisasiDatePicker()
    await ambilPendapatan()
})

onBeforeUnmount(() => {
    if (pickerMulai) {
        pickerMulai.destroy()
        pickerMulai = null
    }

    if (pickerAkhir) {
        pickerAkhir.destroy()
        pickerAkhir = null
    }
})
</script>

<template>
    <main class="min-h-full bg-[#F4F6F8] p-4 sm:p-6 md:p-8" style="font-family: 'DM Sans', Arial, sans-serif">
        <!-- HEADER -->
        <div>
            <h1 class="font-display text-3xl font-extrabold tracking-tight text-[#142744] md:text-4xl">
                Kelola Pendapatan
            </h1>

            <div class="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p class="text-base font-medium text-slate-600">
                    Pantau pendapatan dan riwayat booking Arenix
                </p>

                <p class="text-base font-medium text-slate-600">
                    {{ tanggal }}
                </p>
            </div>
        </div>

        <!-- CARD RINGKASAN -->
        <CardPendapatan />

        <!-- FILTER TANGGAL -->
        <div
            class="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 print:hidden">
            <!-- DATE PICKER -->
            <div class="flex flex-wrap items-center gap-2">
                <input ref="inputTanggalMulai" type="text" placeholder="DD/MM/YYYY" aria-label="Tanggal mulai" />

                <ArrowRight :size="18" class="text-slate-600" />

                <input ref="inputTanggalAkhir" type="text" placeholder="DD/MM/YYYY" aria-label="Tanggal akhir" />
            </div>

            <!-- TOMBOL AKSI -->
            <div class="flex flex-wrap items-center gap-2">

                <!-- CLEAR -->
                <button type="button" @click="clearFilterTanggal"
                    class="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">
                    <X :size="15" />
                    Clear
                </button>

                <!-- TERAPKAN -->
                <button type="button" @click="terapkanFilterTanggal"
                    class="flex h-10 min-w-[124px] items-center justify-center rounded-lg bg-[#FF9638] px-5 text-sm font-semibold text-white transition hover:bg-[#E98228]">
                    Terapkan
                </button>

                <!-- EKSPOR PDF -->
                <button type="button" @click="eksporPDF"
                    class="flex h-10 min-w-[124px] items-center justify-center gap-2 rounded-lg border border-[#FF9638] bg-white px-4 text-sm font-semibold text-[#FF9638] transition hover:bg-orange-50">
                    <FileDown :size="15" />
                    Ekspor PDF
                </button>
            </div>
        </div>

        <!-- ERROR ALERT -->
        <div v-if="errorMessage" role="alert"
            class="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle :size="20" class="shrink-0" />

            <span>{{ errorMessage }}</span>
        </div>

        <!-- TABEL PENDAPATAN -->
        <div class="mt-3">
            <tablePendapatan :pendapatan="pendapatanPaginasi" :loading="loading" :halaman-saat-ini="halamanSaatIni"
                :total-halaman="totalHalaman" :info-rentang="infoRentangData"
                @ganti-halaman="halamanSaatIni = $event" />
        </div>
    </main>
</template>
