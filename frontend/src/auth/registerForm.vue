<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'

const router = useRouter()
const nama = ref('')
const username = ref('')
const password = ref('')
const no_hp = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

const inputClass =
    'h-10 rounded-lg border-0 bg-white px-3 text-sm text-black placeholder:text-gray-400 dark:bg-white'

async function handleRegister() {
    if (!nama.value.trim() || !username.value.trim() || !no_hp.value.trim() || !password.value) {
        error.value = 'Semua field wajib diisi.'
        return
    }
    if (!/^\d{10,15}$/.test(no_hp.value.trim())) {
        error.value = 'No. Hp harus berupa angka, 10 sampai 15 digit.'
        return
    }
    if (password.value.length < 6) {
        error.value = 'Password minimal 6 karakter.'
        return
    }

    error.value = ''
    loading.value = true

    try {
        await api.post('/auth/register', {
            nama: nama.value.trim(),
            username: username.value.trim(),
            password: password.value,
            no_hp: no_hp.value.trim(),
        })
        await router.push('/login')
    } catch (err) {
        error.value = err.response?.data?.message || 'Pendaftaran gagal. Coba lagi.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <form class="flex flex-col gap-4" @submit.prevent="handleRegister">
        <div class="mb-2 flex flex-col items-center gap-1 text-center">
            <h1 class="text-2xl font-bold text-white">Buat Akun Baru</h1>
            <p class="text-xs text-white">Daftar untuk mulai menyewa lapangan.</p>
        </div>

        <div class="flex flex-col gap-1.5">
            <label for="nama" class="text-xs font-medium text-white">Nama Lengkap</label>
            <Input id="nama" v-model="nama" type="text" placeholder="Masukkan nama lengkap" autocomplete="name" required
                :class="inputClass" />
        </div>

        <div class="flex flex-col gap-1.5">
            <label for="username" class="text-xs font-medium text-white">Username</label>
            <Input id="username" v-model="username" type="text" placeholder="Masukkan username" autocomplete="username"
                required :class="inputClass" />
        </div>

        <div class="flex flex-col gap-1.5">
            <label for="password" class="text-xs font-medium text-white">Password</label>
            <div class="relative">
                <Input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
                    placeholder="Masukkan password" autocomplete="new-password" required
                    :class="[inputClass, 'pr-10']" />
                <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
                    :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                    @click="showPassword = !showPassword">
                    <EyeOff v-if="showPassword" class="size-4" />
                    <Eye v-else class="size-4" />
                </button>
            </div>
        </div>

        <div class="flex flex-col gap-1.5">
            <label for="no_hp" class="text-xs font-medium text-white">No. Hp</label>
            <Input id="no_hp" v-model="no_hp" type="tel" inputmode="numeric" placeholder="08xxxxxxxxxx"
                autocomplete="tel" required :class="inputClass" />
        </div>

        <p v-if="error" class="text-xs text-red-300">{{ error }}</p>

        <Button type="submit" :disabled="loading"
            class="mt-2 h-10 w-full rounded-lg bg-[#F7943A] text-sm font-semibold text-white hover:bg-[#e8852d]">
            {{ loading ? 'Memproses...' : 'Daftar' }}
        </Button>

        <p class="text-center text-xs text-white/60">
            Sudah Punya Akun?
            <RouterLink to="/login" class="font-medium text-white hover:underline">Masuk</RouterLink>
        </p>
    </form>
</template>