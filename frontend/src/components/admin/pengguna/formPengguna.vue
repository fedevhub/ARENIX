<script setup>
import { ref, computed, watch } from 'vue'
import { Eye, EyeOff, X, Save, ArrowLeft } from 'lucide-vue-next'

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
    pengguna: {
        type: Object,
        default: null,
    },
    loading: Boolean,
})

const emit = defineEmits(['update:open', 'save'])

const showPassword = ref(false)

const form = ref({
    nama: '',
    username: '',
    password: '',
    no_hp: '',
    role: '',
})

const isEditMode = computed(() => !!props.pengguna)

watch(
    () => [props.open, props.pengguna],
    () => {
        if (!props.open) return

        const user = props.pengguna

        form.value = {
            nama: user?.nama ?? '',
            username: user?.username ?? '',
            password: '',
            no_hp: user?.no_hp ?? '',
            role: String(user?.role ?? '').toLowerCase(),
        }

        showPassword.value = false
    },
    { immediate: true }
)

function tutupModal() {
    if (props.loading) return

    emit('update:open', false)
}

function simpanPengguna() {
    emit('save', {
        nama: form.value.nama,
        username: form.value.username,
        no_hp: form.value.no_hp,
        role: form.value.role,

        ...(!isEditMode.value
            ? { password: form.value.password }
            : {}),
    })
}
</script>

<template>
    <Dialog :open="open" @update:open="emit('update:open', $event)">
        <DialogContent class="w-[85vw] sm:max-w-[550px] gap-0 overflow-hidden rounded-[24px] border border-gray-300 p-0"
            :show-close-button="false" @open-auto-focus="(event) => event.preventDefault()">
            <!-- Header -->
            <DialogHeader class="flex flex-row items-center justify-between border-b border-gray-300 px-8 py-4">
                <DialogTitle class="text-2xl font-black text-black">
                    {{ isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna' }}
                </DialogTitle>
            </DialogHeader>

            <!-- Form -->
            <form @submit.prevent="simpanPengguna">
                <div class="grid grid-cols-1 gap-3 p-8">

                    <!-- Nama Lengkap -->
                    <div>
                        <label for="nama" class="mb-2 block text-sm font-medium text-gray-800">
                            Nama Lengkap
                            <span class="text-red-600">*</span>
                        </label>

                        <Input id="nama" v-model="form.nama" placeholder="Masukkan nama lengkap" required
                            :disabled="loading" />
                    </div>

                    <!-- Username -->
                    <div>
                        <label for="username" class="mb-2 block text-sm font-medium text-gray-800">
                            Username
                            <span class="text-red-600">*</span>
                        </label>

                        <Input id="username" v-model="form.username" placeholder="Masukkan username" required
                            :disabled="loading" />
                    </div>

                    <!-- Password -->
                    <div>
                        <label for="password" class="mb-2 block text-sm font-medium text-gray-800">
                            Password

                            <span v-if="!isEditMode" class="text-red-600">
                                *
                            </span>
                        </label>

                        <div class="relative">
                            <Input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
                                :placeholder="isEditMode
                                        ? 'Password tidak dapat diubah'
                                        : 'Masukkan password'
                                    " class="pr-10" autocomplete="new-password" :required="!isEditMode"
                                :disabled="isEditMode || loading" />

                            <button type="button"
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
                                :aria-label="showPassword
                                        ? 'Sembunyikan password'
                                        : 'Tampilkan password'
                                    " :disabled="isEditMode || loading" @click="showPassword = !showPassword">
                                <EyeOff v-if="showPassword" :size="18" />

                                <Eye v-else :size="18" />
                            </button>
                        </div>
                    </div>

                    <!-- Nomor HP -->
                    <div>
                        <label for="no_hp" class="mb-2 block text-sm font-medium text-gray-800">
                            Nomor HP
                            <span class="text-red-600">*</span>
                        </label>

                        <Input id="no_hp" v-model="form.no_hp" type="tel" placeholder="08xxxxxxxxx" required
                            :disabled="loading" />
                    </div>

                    <!-- Role -->
                    <div>
                        <label for="role" class="mb-2 block text-sm font-medium text-gray-800">
                            Role
                            <span class="text-red-600">*</span>
                        </label>

                        <Select v-model="form.role" :disabled="loading">
                            <SelectTrigger id="role" class="w-full">
                                <SelectValue placeholder="Pilih role" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="admin">
                                    Admin
                                </SelectItem>

                                <SelectItem value="petugas">
                                    Petugas
                                </SelectItem>

                                <SelectItem value="penyewa">
                                    Penyewa
                                </SelectItem>
                            </SelectContent>
                        </Select>
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
