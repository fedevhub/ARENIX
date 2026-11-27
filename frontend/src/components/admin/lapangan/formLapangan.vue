<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { Save, ArrowLeft, ImagePlus, X } from 'lucide-vue-next'

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
    lapangan: {
        type: Object,
        default: null,
    },
    jenisOptions: {
        type: Array,
        default: () => [],
    },
    loading: Boolean,
})

const emit = defineEmits(['update:open', 'save'])

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const BASE_URL = API_URL.replace(/\/api\/?$/, '')

function gambarUrl(gambar) {
    if (!gambar) return ''

    // Jika sudah berupa URL lengkap
    if (/^https?:\/\//i.test(gambar)) {
        return gambar
    }

    const path = gambar.replace(/\\/g, '/').replace(/^\/+/, '')

    // Jika sudah memiliki folder uploads
    if (path.startsWith('uploads/')) {
        return `${BASE_URL}/${path}`
    }

    // Jika hanya nama file
    return `${BASE_URL}/uploads/lapangan/${path}`
}

const errorGambar = ref('')

const gambarFile = ref(null)
const gambarPreview = ref('')
const fileInputRef = ref(null)

const form = ref({
    gambar: null,
    nama: '',
    jenis: '',
    jam_buka: '',
    jam_tutup: '',
    jam_mulai_lampu: '',
    status: '',
})

const isEditMode = computed(() => !!props.lapangan)

function revokePreview() {
    if (gambarPreview.value?.startsWith('blob:')) {
        URL.revokeObjectURL(gambarPreview.value)
    }

    gambarPreview.value = ''
}

watch(
    () => [props.open, props.lapangan],
    () => {
        if (!props.open) return

        revokePreview()

        errorGambar.value = ''
        gambarFile.value = null

        if (fileInputRef.value) {
            fileInputRef.value.value = ''
        }

        const lapangan = props.lapangan

        form.value = {
            gambar: lapangan?.gambar ?? null,
            nama: lapangan?.nama ?? '',
            jenis: lapangan?.jenis_id?._id
                ?? lapangan?.jenis_id
                ?? lapangan?.jenis
                ?? '',
            jam_buka: lapangan?.jam_buka ?? '',
            jam_tutup: lapangan?.jam_tutup ?? '',
            jam_mulai_lampu: lapangan?.jam_mulai_lampu ?? '',
            status: lapangan?.status ?? '',
        }

        gambarPreview.value = gambarUrl(lapangan?.gambar)
    },
    { immediate: true }
)

onBeforeUnmount(() => {
    revokePreview()
})

function triggerFileInput() {
    fileInputRef.value?.click()
}

function pilihGambar(event) {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
        errorGambar.value = 'File harus berupa gambar.'
        event.target.value = ''
        return
    }

    if (file.size > 5 * 1024 * 1024) {
        errorGambar.value = 'Ukuran gambar maksimal 5 MB.'
        event.target.value = ''
        return
    }

    revokePreview()

    gambarFile.value = file
    gambarPreview.value = URL.createObjectURL(file)

    errorGambar.value = ''
}

function hapusGambar() {
    revokePreview()

    gambarFile.value = null
    form.value.gambar = null
    errorGambar.value = ''

    if (fileInputRef.value) {
        fileInputRef.value.value = ''
    }
}

function tutupModal() {
    if (props.loading) return
    emit('update:open', false)
}


function simpanLapangan() {
    if (!form.value.nama || !form.value.jenis ||
        !form.value.jam_buka || !form.value.jam_tutup ||
        !form.value.jam_mulai_lampu || !form.value.status) {
        return
    }

    if (!gambarFile.value && !form.value.gambar) {
        errorGambar.value = 'Gambar wajib diunggah.'
        return
    }

    emit('save', {
        nama: form.value.nama,
        jenis_id: form.value.jenis,
        gambar: gambarFile.value,
        jam_buka: form.value.jam_buka,
        jam_tutup: form.value.jam_tutup,
        jam_mulai_lampu: form.value.jam_mulai_lampu,
        status: form.value.status,
    })
}

</script>

<template>
    <Dialog :open="open" @update:open="emit('update:open', $event)">
        <DialogContent
            class="w-[90vw] sm:max-w-[700px] gap-0 overflow-hidden rounded-[24px] border border-gray-300 p-0"
            border-gray-300 p-0 :show-close-button="false" @open-auto-focus="(event) => event.preventDefault()">
            <!-- Header -->
            <DialogHeader class="flex flex-row items-center justify-between border-b border-gray-300 px-8 py-5">
                <DialogTitle class="text-2xl font-black text-black">
                    {{ isEditMode ? 'Edit Lapangan' : 'Tambah Lapangan' }}
                </DialogTitle>
            </DialogHeader>

            <form @submit.prevent="simpanLapangan">
                <div class="grid grid-cols-1 gap-x-10 gap-y-4 px-8 py-5 sm:grid-cols-2">

                    <!-- Nama Lapangan -->
                    <div class="min-w-0">
                        <label for="nama" class="mb-2 block text-sm font-medium text-gray-800">
                            Nama Lapangan <span class="text-red-600">*</span>
                        </label>

                        <Input id="nama" v-model="form.nama" placeholder="Contoh: Lapangan Futsal A"
                            class="!h-10 w-full rounded-lg" required :disabled="loading" />
                    </div>

                    <!-- Jenis Lapangan -->
                    <div class="min-w-0">
                        <label for="jenis" class="mb-2 block text-sm font-medium text-gray-800">
                            Jenis Lapangan <span class="text-red-600">*</span>
                        </label>

                        <Select v-model="form.jenis" :disabled="loading">
                            <SelectTrigger class="!h-10 w-full rounded-lg">
                                <SelectValue placeholder="Pilih jenis lapangan" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem v-for="jenis in jenisOptions" :key="jenis._id" :value="jenis._id">
                                    {{ jenis.nama }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <!-- Jam Buka -->
                    <div class="min-w-0">
                        <label for="jam_buka" class="mb-2 block text-sm font-medium text-gray-800">
                            Jam Buka <span class="text-red-600">*</span>
                        </label>

                        <Input id="jam_buka" v-model="form.jam_buka" type="time" class="!h-10 w-full rounded-lg"
                            required :disabled="loading" />
                    </div>

                    <!-- Jam Tutup -->
                    <div class="min-w-0">
                        <label for="jam_tutup" class="mb-2 block text-sm font-medium text-gray-800">
                            Jam Tutup <span class="text-red-600">*</span>
                        </label>

                        <Input id="jam_tutup" v-model="form.jam_tutup" type="time" class="!h-10 w-full rounded-lg"
                            required :disabled="loading" />
                    </div>

                    <!-- Jam Nyala Lampu -->
                    <div class="min-w-0">
                        <label for="jam_mulai_lampu" class="mb-2 block text-sm font-medium text-gray-800">
                            Jam Nyala Lampu <span class="text-red-600">*</span>
                        </label>

                        <Input id="jam_mulai_lampu" v-model="form.jam_mulai_lampu" type="time"
                            class="!h-10 w-full rounded-lg" required :disabled="loading" />
                    </div>

                    <!-- Status -->
                    <div class="min-w-0">
                        <label for="status" class="mb-2 block text-sm font-medium text-gray-800">
                            Status <span class="text-red-600">*</span>
                        </label>

                        <Select v-model="form.status" :disabled="loading" required>
                            <SelectTrigger id="status" class="!h-10 w-full rounded-lg">
                                <SelectValue placeholder="Pilih Status" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="Aktif">Aktif</SelectItem>
                                <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <!-- Gambar Upload - Kolom Kiri -->
                    <div class="min-w-0">
                        <label class="mb-2 block text-sm font-medium text-gray-800">
                            Gambar <span class="text-red-600">*</span>
                        </label>

                        <input ref="fileInputRef" id="gambar" type="file" accept="image/*" class="hidden"
                            :disabled="loading" @change="pilihGambar" />

                        <button type="button" :disabled="loading" @click="triggerFileInput"
                            class="flex !h-10 w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-3.5 text-left transition hover:border-[#F79338] disabled:opacity-50">
                            <ImagePlus :size="19" class="shrink-0 text-gray-600" />

                            <span class="truncate text-sm text-gray-600">
                                {{ gambarFile?.name || (form.gambar ? 'Gambar tersimpan' : 'Klik untuk mengunggah foto') }}
                            </span>
                        </button>

                        <p v-if="errorGambar" class="mt-1.5 text-xs text-red-600">
                            {{ errorGambar }}
                        </p>

                        <p v-else class="mt-1.5 text-xs text-gray-400">
                            PNG, JPG (maks. 5MB)
                        </p>
                    </div>

                    <div v-if="gambarPreview"
                        class="group relative h-24 w-full overflow-hidden rounded-lg border border-gray-200">
                        <img :src="gambarPreview" alt="Preview Gambar Lapangan" class="h-full w-full object-cover" />

                        <button type="button" :disabled="loading" @click="hapusGambar"
                            class="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition group-hover:opacity-100">
                            <X :size="18" />
                        </button>
                    </div>

                    <div v-else
                        class="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-400">
                        Belum ada gambar
                    </div>
                </div>

                <!-- Footer -->
                <DialogFooter class="flex flex-row justify-end gap-3 border-t border-gray-200 px-8 py-4">
                    <Button type="button" variant="outline" class="gap-2" :disabled="loading" @click="tutupModal">
                        <ArrowLeft :size="18" />
                        Kembali
                    </Button>

                    <Button type="submit" class="gap-2 bg-[#F79338] text-white hover:bg-[#E98228]" :disabled="loading">
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
