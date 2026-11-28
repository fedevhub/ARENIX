<script setup>
import { computed } from 'vue'
import { ArrowRight, CheckCircle2, Clock, ShieldCheck, Sparkles } from 'lucide-vue-next'

// --- IMPORT GAMBAR DARI FOLDER ASSETS ---
import bgImage from '../../assets/bg login-register.png'
import cardImage from '../../assets/hero.png' // Sesuaikan dengan nama file di folder assets Anda

const props = defineProps({
    login: { type: Boolean, default: false },
    daftar: { type: Array, default: () => [] },
})

// Gunakan variabel hasil import tadi
const fileBackground = bgImage
const fileCardKanan = cardImage

const keunggulan = [
    { icon: Clock, teks: 'Konfirmasi Cepat' },
    { icon: ShieldCheck, teks: 'Jadwal Terjamin' },
    { icon: CheckCircle2, teks: 'Bayar di Kasir' },
]
</script>

<template>
    <section class="relative isolate overflow-hidden pt-3">
        <div class="absolute inset-0 -z-10">
            <img :src="fileBackground" alt="Background Lapangan" loading="eager" fetchpriority="high"
                class="h-full w-full object-cover object-center" />

            <div class="absolute inset-0 bg-gradient-to-br from-[#0F1F38] to-[#1A345B] opacity-0" />
            <div class="absolute inset-0 bg-gradient-to-r from-[#081120]/95 via-[#0B1729]/80 to-[#0B1729]/45" />
            <div class="absolute inset-0 bg-gradient-to-t from-[#081120]/80 via-transparent to-[#081120]/40" />
        </div>

        <div
            class="relative mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">

            <!-- Kolom Kiri -->
            <div class="flex flex-col items-start">
                <!-- Badge -->
                <div
                    class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-[#FFB36B] backdrop-blur-md">
                    <Sparkles class="size-3.5" />
                    <span>Reservasi Arena Olahraga</span>
                </div>

                <!-- Headline -->
                <h1
                    class="mt-6 text-[36px] font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[56px]">
                    Main lebih seru,
                    <span class="mt-1.5 block text-[#FF9638]">
                        booking tanpa ribet.
                    </span>
                </h1>

                <p class="mt-5 max-w-[480px] text-base leading-relaxed text-[#B7C6DC]">
                    Pilih lapangan favoritmu dan amankan jam main dalam hitungan detik.
                    Praktis, transparan, dan langsung siap bertanding.
                </p>

                <!-- Tombol Aksi -->
                <div class="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                    <RouterLink to="/lapangan"
                        class="group inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-[#FF9638] px-7 text-sm font-bold text-[#1A1206] transition-colors hover:bg-[#FFA64D]">
                        <span>Pilih Lapangan Sekarang</span>
                        <ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" />
                    </RouterLink>

                    <RouterLink v-if="!login" to="/register"
                        class="inline-flex h-[52px] items-center justify-center rounded-xl border border-white/20 bg-white/[0.06] px-7 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:border-white/35 hover:bg-white/[0.12]">
                        Buat Akun Gratis
                    </RouterLink>
                    <RouterLink v-else to="/penyewa/riwayat"
                        class="inline-flex h-[52px] items-center justify-center rounded-xl border border-white/20 bg-white/[0.06] px-7 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:border-white/35 hover:bg-white/[0.12]">
                        Riwayat Booking
                    </RouterLink>
                </div>

                <!-- Keunggulan -->
                <div class="mt-9 flex w-full flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6">
                    <div v-for="item in keunggulan" :key="item.teks"
                        class="flex items-center gap-2 text-xs font-medium text-[#B7C6DC] sm:text-[13px]">
                        <component :is="item.icon" class="size-4 text-[#FF9638]" />
                        <span>{{ item.teks }}</span>
                    </div>
                </div>
            </div>

            <div class="relative mx-auto w-full max-w-[480px] lg:max-w-none">
                <div class="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] p-2 shadow-2xl shadow-black/50 backdrop-blur-md">
                    <div class="relative h-[280px] overflow-hidden rounded-xl sm:h-[360px] lg:h-[420px]">

                        <!-- Menggunakan file card statis -->
                        <img :src="fileCardKanan" alt="Lapangan Arenix" class="h-full w-full object-cover" />

                        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                        <!-- Info di dalam kartu -->
                        <div
                            class="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-xl border border-white/15 bg-black/40 px-4 py-3 backdrop-blur-md">
                            <div>
                                <p class="text-xs font-medium text-white/70">Lapangan tersedia</p>
                                <p class="mt-0.5 text-sm font-bold text-white">Booking sekarang</p>
                            </div>
                            <div class="flex size-9 items-center justify-center rounded-lg bg-[#FF9638]">
                                <ArrowRight class="size-4 text-[#1A1206]" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Floating badge: instan -->
                <div
                    class="absolute -right-3 bottom-6 flex items-center gap-2.5 rounded-xl border border-white/15 bg-[#0F1F38]/80 px-3.5 py-2.5 shadow-lg shadow-black/40 backdrop-blur-md sm:-right-5">
                    <div class="flex size-8 items-center justify-center rounded-lg bg-emerald-400/15">
                        <CheckCircle2 class="size-4 text-emerald-400" />
                    </div>
                    <div>
                        <p class="text-sm font-bold leading-none text-white">Instan</p>
                        <p class="mt-1 text-[10px] font-medium text-white/60">Konfirmasi</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>