<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Eye, EyeOff } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'

const router = useRouter()
const route = useRoute()
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

const roleRoutes = {
    admin: '/admin/dashboard',
    petugas: '/petugas/dashboard',
    penyewa: '/',
}

const redirect =
    typeof route.query.redirect === 'string' &&
        route.query.redirect.startsWith('/') &&
        !route.query.redirect.startsWith('//')
        ? route.query.redirect
        : null

async function handleLogin() {
    if (!username.value.trim() || !password.value) {
        error.value = 'Username dan password wajib diisi.'
        return
    }

    error.value = ''
    loading.value = true

    try {
        const { data } = await api.post('/auth/login', {
            username: username.value.trim(),
            password: password.value,
        })

        const { token, user } = data
        if (!token || !user) {
            error.value = 'Respons login tidak lengkap.'
            return
        }

        const destination =
            user.role === 'penyewa' && redirect ? redirect : roleRoutes[user.role]
        if (!destination) {
            error.value = 'Login berhasil, tetapi halaman untuk role ini belum tersedia.'
            return
        }

        localStorage.setItem('token', token)
        localStorage.setItem('isLogin', 'true')
        localStorage.setItem('user', JSON.stringify(user))
        await router.push(destination)
    } catch (err) {
        error.value = err.response?.data?.message || 'Login gagal. Periksa username dan password.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <form class="flex flex-col gap-5" @submit.prevent="handleLogin">
        <div class="mb-3 flex flex-col items-center gap-1 text-center">
            <h1 class="text-2xl font-bold text-white">Selamat Datang!</h1>
            <p class="text-xs text-white">Masuk ke akunmu untuk melanjutkan.</p>
        </div>

        <div class="flex flex-col gap-1.5">
            <label for="username" class="text-xs font-medium text-white">Username</label>
            <Input id="username" v-model="username" type="text" placeholder="Masukkan username" autocomplete="username"
                required
                class="h-10 rounded-lg border-0 bg-white px-3 text-sm text-black placeholder:text-gray-400 dark:bg-white" />
        </div>

        <div class="flex flex-col gap-1.5">
            <label for="password" class="text-xs font-medium text-white">Password</label>
            <div class="relative">
                <Input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
                    placeholder="Masukkan password" autocomplete="current-password" required
                    class="h-10 rounded-lg border-0 bg-white px-3 pr-10 text-sm text-black placeholder:text-gray-400 dark:bg-white" />
                <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
                    :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                    @click="showPassword = !showPassword">
                    <EyeOff v-if="showPassword" class="size-4" />
                    <Eye v-else class="size-4" />
                </button>
            </div>
        </div>

        <p v-if="error" class="text-xs text-red-300">{{ error }}</p>

        <Button type="submit" :disabled="loading"
            class="mt-2 h-10 w-full rounded-lg bg-[#F7943A] text-sm font-semibold text-white hover:bg-[#e8852d]">
            {{ loading ? 'Memproses...' : 'Masuk' }}
        </Button>

        <p class="text-center text-xs text-white/60">
            Belum Punya Akun?
            <RouterLink to="/register" class="font-medium text-white hover:underline">Daftar</RouterLink>
        </p>
    </form>
</template>