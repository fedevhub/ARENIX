<template>
    <footer class="mt-20 bg-[#142744] border-t border-[#1F3A5C]">
        <div class="mx-auto max-w-[1200px] px-6 py-12 lg:px-8 lg:py-16">

            <div class="flex flex-col gap-10 lg:flex-row lg:justify-between lg:items-start">

                <!-- Kiri: Brand & Deskripsi -->
                <div class="max-w-sm">
                    <div class="flex items-center gap-3">
                        <!-- Opsional: Bisa tambahkan logo icon di sini -->
                        <div>
                            <p class="text-2xl font-extrabold leading-none text-white tracking-wide">ARENIX</p>
                            <p class="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8BA3C7]">
                                Sports Court System
                            </p>
                        </div>
                    </div>
                    <p class="mt-5 text-sm leading-relaxed text-[#A9BCD6]">
                        Sewa lapangan olahraga jadi lebih mudah, cepat, dan transparan. Mainkan olahraga favoritmu tanpa
                        ribet.
                    </p>
                </div>

                <!-- Kanan: Navigasi -->
                <div class="flex gap-16 sm:gap-24">
                    <!-- Kolom Menu 1 -->
                    <div>
                        <h4 class="text-sm font-bold text-white mb-4">Menu</h4>
                        <nav class="flex flex-col gap-3 text-sm font-medium text-[#A9BCD6]">
                            <RouterLink to="/" class="transition-colors hover:text-white">Beranda</RouterLink>
                            <RouterLink to="/lapangan" class="transition-colors hover:text-white">Lapangan & Jadwal
                            </RouterLink>
                        </nav>
                    </div>

                    <!-- Kolom Menu 2 -->
                    <div>
                        <h4 class="text-sm font-bold text-white mb-4">Akun</h4>
                        <nav class="flex flex-col gap-3 text-sm font-medium text-[#A9BCD6]">
                            <RouterLink to="/login" class="transition-colors hover:text-white">Masuk</RouterLink>
                            <RouterLink to="/register" class="transition-colors hover:text-white">Daftar Akun
                            </RouterLink>
                        </nav>
                    </div>
                </div>

            </div>

            <!-- Garis Pemisah & Copyright -->
            <div
                class="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#29466B] pt-6 text-xs text-[#8BA3C7]">
                <p>© 2026 Arenix Sports Center. Semua hak dilindungi.</p>
                <div class="flex gap-4">
                    <a href="#" class="hover:text-white transition-colors">Kebijakan Privasi</a>
                    <a href="#" class="hover:text-white transition-colors">Syarat & Ketentuan</a>
                </div>
            </div>

        </div>
    </footer>
</template>