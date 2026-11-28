<script setup>
import { UserPlus, LogIn, CalendarCheck, CreditCard } from 'lucide-vue-next'

const langkah = [
    { icon: UserPlus, judul: 'Daftar akun', teks: 'Buat akun dengan nama, username, dan nomor WhatsApp.' },
    { icon: LogIn, judul: 'Login', teks: 'Masuk ke akunmu untuk mulai membuat booking.' },
    { icon: CalendarCheck, judul: 'Pilih jadwal', teks: 'Pilih lapangan, tanggal, dan jam main yang masih kosong.' },
    { icon: CreditCard, judul: 'Bayar & cetak', teks: 'Bayar di kasir, petugas konfirmasi, lalu cetak bukti booking.' },
]
</script>

<template>
    <div class="relative max-w-[1000px] mx-auto py-4">

        <!-- Garis Penghubung Horizontal (Hanya Desktop) -->
        <!-- Diletakkan di top-1/2 (tengah) dan dikurangi setengah tinggi ikon -->
        <div
            class="absolute top-1/2 left-[10%] right-[10%] hidden -translate-y-1/2 h-[2px] bg-gradient-to-r from-[#E1E8F0] via-[#FF9638]/30 to-[#E1E8F0] lg:block" />

        <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
            <div v-for="(l, i) in langkah" :key="l.judul" class="group relative flex flex-col items-center text-center">

                <!-- Ikon dalam Lingkaran -->
                <div
                    class="relative flex size-20 items-center justify-center rounded-full bg-white border border-[#E1E8F0] shadow-[0_4px_12px_rgba(20,39,68,0.06)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#FF9638] group-hover:shadow-[0_8px_20px_rgba(255,150,56,0.15)]">
                    <component :is="l.icon"
                        class="size-8 text-[#65758B] transition-colors duration-300 group-hover:text-[#FF9638]" />

                    <!-- Badge Angka -->
                    <span
                        class="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full bg-[#142744] text-[11px] font-bold text-white ring-4 ring-white transition-colors duration-300 group-hover:bg-[#FF9638]">
                        {{ i + 1 }}
                    </span>
                </div>

                <!-- Teks -->
                <div class="mt-6 px-2">
                    <h3 class="text-base font-bold text-[#142744]">{{ l.judul }}</h3>
                    <p class="mt-2 text-[13px] leading-relaxed text-[#65758B]">{{ l.teks }}</p>
                </div>

            </div>
        </div>
    </div>
</template>