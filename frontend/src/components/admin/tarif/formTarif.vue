<script setup>
import { ref, computed, watch } from 'vue'
import { Save, ArrowLeft } from 'lucide-vue-next'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import Button from '@/components/ui/button/Button.vue'

const props = defineProps({
    open: Boolean,

    tarif: {
        type: Object,
        default: null,
    },

    lapanganList: {
        type: Array,
        default: () => [],
    },

    loading: Boolean,
})

const emit = defineEmits(['update:open', 'save'])

const TAMBAHAN_WEEKEND = 20000
const TAMBAHAN_LAMPU = 15000

const form = ref({
    lapangan_id: '',
    tipe_hari: '',
    pakai_lampu: '',
    harga_dasar: '',
})

const errorForm = ref('')

const isEditMode = computed(() => !!props.tarif)

const daftarLapangan = computed(() => {
    return props.lapanganList
        .map((item) => ({
            id: String(item._id ?? item.id ?? ''),
            nama: item.nama ?? '',
            status: item.status,
        }))
        .filter((item) => item.id && item.nama)
})

// Perhitungan total harga per jam
const totalHargaPerJam = computed(() => {
    const base = Number(form.value.harga_dasar) || 0

    if (base <= 0) return 0

    let total = base

    if (form.value.tipe_hari === 'weekend') {
        total += TAMBAHAN_WEEKEND
    }

    if (form.value.pakai_lampu === 'ya') {
        total += TAMBAHAN_LAMPU
    }

    return total
})

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(angka)
}

// Mengisi form ketika tambah atau edit
watch(
    () => [props.open, props.tarif],
    () => {
        if (!props.open) return

        errorForm.value = ''

        const tarif = props.tarif

        // Mendukung lapangan_id berupa ObjectId atau object hasil populate
        const lapanganId =
            tarif?.lapangan_id?._id ??
            tarif?.lapangan_id?.id ??
            tarif?.lapangan_id ??
            ''

        let hargaDasarAwal =
            tarif?.harga_dasar ?? tarif?.harga_per_jam ?? ''

        // Menghitung kembali harga dasar jika hanya harga_per_jam yang tersedia
        if (
            tarif &&
            tarif.harga_dasar == null &&
            tarif.harga_per_jam != null
        ) {
            let dasar = Number(tarif.harga_per_jam)

            if (tarif.tipe_hari === 'weekend') {
                dasar -= TAMBAHAN_WEEKEND
            }

            if (tarif.pakai_lampu === 'ya') {
                dasar -= TAMBAHAN_LAMPU
            }

            hargaDasarAwal = Math.max(0, dasar)
        }

        form.value = {
            lapangan_id: lapanganId ? String(lapanganId) : '',

            tipe_hari: tarif?.tipe_hari?.toLowerCase() ?? '',

            pakai_lampu:
                tarif?.pakai_lampu === true || tarif?.pakai_lampu === 'ya'
                    ? 'ya'
                    : tarif?.pakai_lampu === false || tarif?.pakai_lampu === 'tidak'
                        ? 'tidak'
                        : '',

            harga_dasar: hargaDasarAwal,
        }
    },
    { immediate: true }
)

function tutupModal() {
    if (props.loading) return

    emit('update:open', false)
}

function simpanTarif() {
    errorForm.value = ''

    if (!form.value.lapangan_id) {
        errorForm.value = 'Silakan pilih lapangan.'
        return
    }

    if (!form.value.tipe_hari) {
        errorForm.value = 'Silakan pilih tipe hari.'
        return
    }

    if (!form.value.pakai_lampu) {
        errorForm.value = 'Silakan pilih penggunaan lampu.'
        return
    }

    if (
        form.value.harga_dasar === '' ||
        Number(form.value.harga_dasar) <= 0
    ) {
        errorForm.value = 'Tarif dasar harus lebih dari 0.'
        return
    }

    emit('save', {
        lapangan_id: form.value.lapangan_id,

        tipe_hari: form.value.tipe_hari === 'weekday'
            ? 'Weekday'
            : 'Weekend',

        pakai_lampu: form.value.pakai_lampu === 'ya',

        harga_per_jam: totalHargaPerJam.value,
    })
}
</script>

<template>
    <Dialog :open="open" @update:open="emit('update:open', $event)">
        <DialogContent
            class="w-[85vw] sm:max-w-[550px] gap-0 overflow-hidden rounded-[24px] border border-gray-300 bg-white p-0"
            :show-close-button="false" @open-auto-focus="(event) => event.preventDefault()">
            <!-- Header -->
            <DialogHeader class="flex flex-row items-center justify-between border-b border-gray-300 px-8 py-4">
                <DialogTitle class="text-2xl font-black text-black">
                    {{ isEditMode ? 'Edit Tarif Lapangan' : 'Tambah Tarif Lapangan' }}
                </DialogTitle>
            </DialogHeader>

            <!-- Form -->
            <form @submit.prevent="simpanTarif">
                <div class="grid grid-cols-1 gap-3 p-8">

                    <!-- Pilih Lapangan -->
                    <div>
                        <label for="lapangan_id" class="mb-2 block text-sm font-medium text-gray-800">
                            Pilih Lapangan
                            <span class="text-red-600">*</span>
                        </label>

                        <Select v-model="form.lapangan_id" :disabled="loading">
                            <SelectTrigger id="lapangan_id" class="h-10 w-full">
                                <SelectValue placeholder="Pilih lapangan" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem v-for="item in daftarLapangan" :key="item.id" :value="item.id">
                                    {{ item.nama }}
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <p v-if="daftarLapangan.length === 0" class="mt-1 text-xs text-red-500">
                            Belum ada data lapangan.
                        </p>
                    </div>

                    <!-- Tipe Hari -->
                    <div>
                        <label for="tipe_hari" class="mb-2 block text-sm font-medium text-gray-800">
                            Tipe Hari
                            <span class="text-red-600">*</span>
                        </label>

                        <Select v-model="form.tipe_hari" :disabled="loading">
                            <SelectTrigger id="tipe_hari" class="h-10 w-full">
                                <SelectValue placeholder="Pilih tipe hari" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="weekday">
                                    Weekday (Harga Tetap)
                                </SelectItem>

                                <SelectItem value="weekend">
                                    Weekend (+ Rp 20.000)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <!-- Penggunaan Lampu -->
                    <div>
                        <label for="pakai_lampu" class="mb-2 block text-sm font-medium text-gray-800">
                            Penggunaan Lampu
                            <span class="text-red-600">*</span>
                        </label>

                        <Select v-model="form.pakai_lampu" :disabled="loading">
                            <SelectTrigger id="pakai_lampu" class="h-10 w-full">
                                <SelectValue placeholder="Pilih penggunaan lampu" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="tidak">
                                    Tidak (Tanpa Tambahan)
                                </SelectItem>

                                <SelectItem value="ya">
                                    Ya (+ Rp 15.000)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <!-- Tarif Dasar -->
                    <div>
                        <label for="harga_dasar" class="mb-2 block text-sm font-medium text-gray-800">
                            Tarif Dasar Per Jam
                            <span class="text-red-600">*</span>
                        </label>

                        <Input id="harga_dasar" v-model="form.harga_dasar" type="number" min="0" step="1000"
                            placeholder="Contoh: 20000" class="h-10" :disabled="loading" />
                    </div>

                    <!-- Ringkasan Harga -->
                    <div class="rounded-xl border border-orange-100 bg-orange-50/60 px-4 py-3 text-xs text-gray-700">
                        <div class="flex items-center justify-between">
                            <span>Harga Dasar:</span>
                            <span class="font-medium">
                                {{ formatRupiah(Number(form.harga_dasar) || 0) }}
                            </span>
                        </div>

                        <div v-if="form.tipe_hari === 'weekend'"
                            class="mt-1 flex items-center justify-between text-orange-700">
                            <span>Tambahan Weekend:</span>
                            <span>+ {{ formatRupiah(TAMBAHAN_WEEKEND) }}</span>
                        </div>

                        <div v-if="form.pakai_lampu === 'ya'"
                            class="mt-1 flex items-center justify-between text-orange-700">
                            <span>Tambahan Lampu:</span>
                            <span>+ {{ formatRupiah(TAMBAHAN_LAMPU) }}</span>
                        </div>

                        <div
                            class="mt-2 flex items-center justify-between border-t border-orange-200/80 pt-2 text-sm font-bold text-gray-900">
                            <span>Total Tarif Per Jam:</span>
                            <span class="text-[#F79338]">
                                {{ formatRupiah(totalHargaPerJam) }}
                            </span>
                        </div>
                    </div>

                    <!-- Pesan Error -->
                    <p v-if="errorForm" class="text-xs font-medium text-red-600">
                        {{ errorForm }}
                    </p>
                </div>

                <!-- Footer -->
                <DialogFooter class="flex flex-row justify-end gap-3 border-t border-gray-200 px-8 py-4">
                    <Button type="button" variant="outline" class="gap-2" :disabled="loading" @click="tutupModal">
                        <ArrowLeft :size="18" />
                        Kembali
                    </Button>

                    <Button type="submit" class="gap-2 bg-[#F79338] text-white hover:bg-[#E98228]"
                        :disabled="loading || daftarLapangan.length === 0">
                        <Save :size="18" />

                        {{
                            loading
                                ? 'Menyimpan...'
                                : isEditMode
                                    ? 'Simpan Perubahan'
                                    : 'Simpan'
                        }}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>
