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

import Button from '@/components/ui/button/Button.vue'

const props = defineProps({
    open: Boolean,
    jenis: {
        type: Object,
        default: null,
    },
    loading: Boolean,
})

const emit = defineEmits(['update:open', 'save'])

const form = ref({
    nama: '',
})

const isEditMode = computed(() => !!props.jenis)

watch(
    () => [props.open, props.jenis],
    () => {
        if (!props.open) return

        const user = props.jenis

        form.value = {
            nama: user?.nama ?? '',
        }
    },
    { immediate: true }
)

function tutupModal() {
    if (props.loading) return

    emit('update:open', false)
}

function simpanJenis() {
    const nama = form.value.nama.trim()

    if (!nama) return

    emit('save', { nama })
}
</script>

<template>
    <Dialog :open="open" @update:open="emit('update:open', $event)">
        <DialogContent class="w-[55vw] sm:max-w-[450px] gap-0 overflow-hidden rounded-[24px] border border-gray-300 p-0"
            :show-close-button="false" @open-auto-focus="(event) => event.preventDefault()">
            <!-- Header -->
            <DialogHeader class="flex flex-row items-center justify-between border-b border-gray-300 px-8 py-4">
                <DialogTitle class="text-2xl font-black text-black">
                    {{ isEditMode ? 'Edit Jenis Lapangan' : 'Tambah Jenis Lapangan' }}
                </DialogTitle>
            </DialogHeader>

            <!-- Form -->
            <form @submit.prevent="simpanJenis">
                <div class="grid grid-cols-1 gap-3 p-8">

                    <!-- Nama Lengkap -->
                    <div>
                        <label for="nama" class="mb-2 block text-sm font-medium text-gray-800">
                            Nama jenis lapangan
                            <span class="text-red-600">*</span>
                        </label>

                        <Input id="nama" v-model="form.nama" placeholder="Masukkan nama jenis lapangan" required
                            :disabled="loading" />
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
