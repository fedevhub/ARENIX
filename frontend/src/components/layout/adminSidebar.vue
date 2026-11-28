<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LogOut, Menu, User, X } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

// Ubah `to` kalau path di router kamu berbeda
const menus = [
    { label: 'Dashboard', to: '/admin/dashboard' },
    { label: 'Pengguna', to: '/admin/pengguna' },
    { label: 'Jenis Lapangan', to: '/admin/jenis' },
    { label: 'Lapangan', to: '/admin/lapangan' },
    { label: 'Tarif', to: '/admin/tarif' },
    { label: 'Pendapatan', to: '/admin/pendapatan' },
    { label: 'Log Aktivitas', to: '/admin/log-aktivitas' },
]

function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user')) || {}
    } catch {
        return {}
    }
}

const user = getUser()
const roleLabel = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Admin'
const displayName = user.nama || user.username || '-'
const mobileTerbuka = ref(false)

const isActive = (to) => route.path === to || route.path.startsWith(to + '/')

function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('isLogin')
    localStorage.removeItem('user')
    router.push('/login')
}

function tutupMenu() {
    mobileTerbuka.value = false
}
</script>

<template>
    <button type="button" aria-label="Buka menu admin"
        class="fixed left-4 top-3 z-40 flex size-10 items-center justify-center rounded-xl bg-[#142B4D] text-white shadow-lg lg:hidden"
        @click="mobileTerbuka = true">
        <Menu class="size-5" />
    </button>

    <button v-if="mobileTerbuka" type="button" aria-label="Tutup menu"
        class="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" @click="tutupMenu" />

    <!-- Lebar w-58 (232px) = sama dengan ml-58 di adminLayout.vue -->
    <aside class="fixed inset-y-0 left-0 z-50 flex w-58 -translate-x-full flex-col bg-[#142B4D] transition-transform duration-200 lg:translate-x-0"
        :class="mobileTerbuka ? 'translate-x-0' : ''">
        <button type="button" aria-label="Tutup menu admin"
            class="absolute right-3 top-3 flex size-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 lg:hidden"
            @click="tutupMenu">
            <X class="size-5" />
        </button>
        <!-- Brand -->
        <div class="h-20 shrink-0 px-6 pt-5">
            <h1 class="text-2xl font-extrabold leading-none text-white">ARENIX</h1>
            <p class="mt-1.5 pl-1 text-[8px] font-semibold uppercase leading-none tracking-wide text-[#AFC4DF]">
                Sports Court System
            </p>
        </div>
        <div class="mx-5 border-t border-[#34506F]" />

        <!-- Menu -->
        <nav class="mt-3 flex flex-col gap-2 pl-4 pr-3.5" aria-label="Menu admin">
            <RouterLink v-for="menu in menus" :key="menu.to" :to="menu.to"
                :aria-current="isActive(menu.to) ? 'page' : undefined"
                class="relative ml-0.5 flex h-10 items-center rounded-lg pl-4 text-[13px] transition-colors" :class="isActive(menu.to)
                    ? 'bg-[#24466F] font-semibold text-white'
                    : 'font-normal text-[#C1D0E2] hover:bg-white/5 hover:text-white'" @click="tutupMenu">
                <span v-if="isActive(menu.to)"
                    class="absolute -left-0.5 top-0 h-full w-[3px] rounded-full bg-[#FF9638]" />
                {{ menu.label }}
            </RouterLink>
        </nav>

        <!-- User + Logout -->
        <div class="mt-auto px-5 pb-6">
            <div class="mb-4 border-t border-[#34506F]" />
            <div class="flex h-14 items-center gap-2.5 rounded-xl bg-white px-3">
                <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#142744]">
                    <User class="size-4 text-white" />
                </div>
                <div class="min-w-0 flex-1">
                    <p class="truncate text-[13px] font-bold leading-tight text-[#142744]">{{ roleLabel }}</p>
                    <p class="truncate text-[10px] font-medium leading-tight text-slate-500">{{ displayName }}</p>
                </div>
                <button type="button" aria-label="Keluar" title="Keluar"
                    class="shrink-0 rounded-md p-1 text-[#FF0000] transition-opacity hover:opacity-70" @click="logout">
                    <LogOut class="size-4" />
                </button>
            </div>
        </div>
    </aside>
</template>
