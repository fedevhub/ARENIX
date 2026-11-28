<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LogOut, Menu, User, X } from 'lucide-vue-next'
import { getUser, isLoggedIn, logout as hapusSesi } from '@/lib/auth'

const route = useRoute()
const router = useRouter()

const user = ref(getUser())
const login = ref(isLoggedIn())
const scrolled = ref(false)
const mobileMenuTerbuka = ref(false)

const isBeranda = computed(() => route.path === '/')

function cekScroll() {
    if (!isBeranda.value) {
        scrolled.value = true
        return
    }
    scrolled.value = window.scrollY > 20
}

onMounted(() => {
    cekScroll()
    window.addEventListener('scroll', cekScroll, { passive: true })
})

onUnmounted(() => {
    window.removeEventListener('scroll', cekScroll)
})

watch(() => route.fullPath, () => {
    user.value = getUser()
    login.value = isLoggedIn()
    cekScroll()
    mobileMenuTerbuka.value = false
})

const menuAktif = (nama) => {
    if (nama === 'beranda') return route.path === '/'
    if (nama === 'lapangan') return route.path.startsWith('/lapangan') || route.path.startsWith('/penyewa/booking/baru')
    if (nama === 'riwayat') return route.path.startsWith('/penyewa') && !route.path.startsWith('/penyewa/booking/baru')
    return false
}

function logout() {
    hapusSesi()
    login.value = false
    user.value = null
    router.push('/')
}
</script>

<template>
    <header class="top-0 z-50 w-full transition-all duration-300 print:hidden" :class="[
        isBeranda ? 'fixed inset-x-0' : 'sticky',
        scrolled
            ? 'border-b border-[#E1E8F0] bg-white/95 shadow-sm backdrop-blur-md'
            : 'border-b border-transparent bg-transparent'
    ]">
        <div class="mx-auto flex h-16 max-w-[1200px] items-center px-6 lg:px-8">
            <!-- Brand -->
            <RouterLink to="/" class="block shrink-0">
                <p class="text-xl font-extrabold leading-none transition-colors duration-300"
                    :class="scrolled ? 'text-[#142744]' : 'text-white'">
                    ARENIX
                </p>
                <p class="mt-1 text-[10px] font-semibold uppercase leading-none tracking-wider transition-colors duration-300"
                    :class="scrolled ? 'text-[#65758B]' : 'text-white/80'">
                    Sports Court System
                </p>
            </RouterLink>

            <!-- Menu Tengah -->
            <nav class="absolute left-1/2 hidden h-full -translate-x-1/2 items-center gap-8 lg:flex"
                aria-label="Menu utama">
                <!-- Beranda -->
                <RouterLink to="/"
                    class="relative flex h-full items-center text-sm font-semibold transition-colors duration-300"
                    :class="menuAktif('beranda')
                        ? (scrolled ? 'text-[#142744]' : 'text-white')
                        : (scrolled ? 'text-[#65758B] hover:text-[#142744]' : 'text-white/75 hover:text-white')">
                    Beranda
                    <span v-if="menuAktif('beranda')"
                        class="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#FF9638]" />
                </RouterLink>

                <!-- Lapangan -->
                <RouterLink to="/lapangan"
                    class="relative flex h-full items-center text-sm font-semibold transition-colors duration-300"
                    :class="menuAktif('lapangan')
                        ? (scrolled ? 'text-[#142744]' : 'text-white')
                        : (scrolled ? 'text-[#65758B] hover:text-[#142744]' : 'text-white/75 hover:text-white')">
                    Lapangan &amp; Jadwal
                    <span v-if="menuAktif('lapangan')"
                        class="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#FF9638]" />
                </RouterLink>

                <!-- Riwayat -->
                <RouterLink v-if="login" to="/penyewa/riwayat"
                    class="relative flex h-full items-center text-sm font-semibold transition-colors duration-300"
                    :class="menuAktif('riwayat')
                        ? (scrolled ? 'text-[#142744]' : 'text-white')
                        : (scrolled ? 'text-[#65758B] hover:text-[#142744]' : 'text-white/75 hover:text-white')">
                    Riwayat Booking
                    <span v-if="menuAktif('riwayat')"
                        class="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#FF9638]" />
                </RouterLink>
            </nav>

            <!-- Kanan: Tamu (Belum Login) -->
            <div v-if="!login" class="ml-auto flex items-center gap-2.5">
                <RouterLink :to="{ path: '/login', query: { redirect: route.fullPath } }"
                    class="flex h-10 items-center rounded-lg px-5 text-sm font-semibold transition-colors duration-300"
                    :class="scrolled
                        ? 'border border-[#E1E8F0] bg-white text-[#142744] hover:bg-[#F4F6F8]'
                        : 'border border-white/30 text-white hover:bg-white/10'">
                    Masuk
                </RouterLink>
                <RouterLink to="/register"
                    class="flex h-10 items-center rounded-lg bg-[#FF9638] px-5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#FF8C24]">
                    Daftar
                </RouterLink>
            </div>

            <!-- Kanan: Sudah Login -->
            <div v-else
                class="ml-auto flex items-center gap-2.5 rounded-xl border py-1.5 pl-2 pr-3 transition-colors duration-300"
                :class="scrolled
                    ? 'border-[#E1E8F0] bg-white'
                    : 'border-white/20 bg-white/10 backdrop-blur-md'">
                <div class="flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300"
                    :class="scrolled ? 'bg-[#142744]' : 'bg-white/20'">
                    <User class="size-4 text-white" />
                </div>
                <div class="min-w-0 max-w-28 sm:max-w-none">
                    <p class="truncate text-[13px] font-bold leading-tight transition-colors duration-300"
                        :class="scrolled ? 'text-[#142744]' : 'text-white'">
                        {{ user?.nama || user?.username }}
                    </p>
                    <p class="text-[11px] leading-tight transition-colors duration-300"
                        :class="scrolled ? 'text-[#65758B]' : 'text-white/75'">
                        Penyewa
                    </p>
                </div>
                <button type="button" aria-label="Keluar" title="Keluar"
                    class="ml-1 rounded-md p-1 transition-opacity duration-300 hover:opacity-70"
                    :class="scrolled ? 'text-[#E5252A]' : 'text-white'" @click="logout">
                    <LogOut class="size-4" />
                </button>
            </div>

            <button type="button" class="ml-2 flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors lg:hidden"
                :class="scrolled ? 'text-[#142744] hover:bg-[#F4F6F8]' : 'text-white hover:bg-white/10'"
                :aria-label="mobileMenuTerbuka ? 'Tutup menu' : 'Buka menu'"
                @click="mobileMenuTerbuka = !mobileMenuTerbuka">
                <X v-if="mobileMenuTerbuka" class="size-5" />
                <Menu v-else class="size-5" />
            </button>
        </div>

        <nav v-if="mobileMenuTerbuka"
            class="border-t border-[#E1E8F0] bg-white px-6 py-3 shadow-lg lg:hidden" aria-label="Menu utama mobile">
            <RouterLink to="/" class="block rounded-lg px-3 py-3 text-sm font-semibold"
                :class="menuAktif('beranda') ? 'bg-[#F4F6F8] text-[#142744]' : 'text-[#65758B]'">
                Beranda
            </RouterLink>
            <RouterLink to="/lapangan" class="mt-1 block rounded-lg px-3 py-3 text-sm font-semibold"
                :class="menuAktif('lapangan') ? 'bg-[#F4F6F8] text-[#142744]' : 'text-[#65758B]'">
                Lapangan &amp; Jadwal
            </RouterLink>
            <RouterLink v-if="login" to="/penyewa/riwayat" class="mt-1 block rounded-lg px-3 py-3 text-sm font-semibold"
                :class="menuAktif('riwayat') ? 'bg-[#F4F6F8] text-[#142744]' : 'text-[#65758B]'">
                Riwayat Booking
            </RouterLink>
        </nav>
    </header>
</template>
