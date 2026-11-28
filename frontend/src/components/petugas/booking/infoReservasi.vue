<script setup>
import { computed } from 'vue'
import { kodeBooking, namaPenyewa, noHpPenyewa, tanggalWaktu } from '@/lib/format'

const props = defineProps({
    booking: { type: Object, required: true },
})

const petugasPencatat = computed(() =>
    props.booking.dibuat_oleh?.nama
    ?? props.booking.riwayat?.find((item) => item.aksi === 'Konfirmasi Pembayaran')?.user_id?.nama
    ?? '-',
)
</script>

<template>
    <section class="rounded-2xl border border-[#E1E8F0] bg-white p-6">
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-extrabold text-[#142744]">Informasi Reservasi</h2>
            <span class="rounded-lg bg-[#F4F6F8] px-3 py-1 text-sm font-extrabold text-[#142744]">
                {{ kodeBooking(booking) }}
            </span>
        </div>

        <dl class="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
            <div>
                <dt class="text-xs text-[#65758B]">Nama Penyewa</dt>
                <dd class="mt-0.5 font-bold text-[#142744]">{{ namaPenyewa(booking) }}</dd>
            </div>
            <div>
                <dt class="text-xs text-[#65758B]">Nomor Telepon / WhatsApp</dt>
                <dd class="mt-0.5 font-bold text-[#142744]">{{ noHpPenyewa(booking) }}</dd>
            </div>
            <div>
                <dt class="text-xs text-[#65758B]">Tipe Pemesanan</dt>
                <dd class="mt-0.5 font-bold text-[#142744]">
                    {{ booking.tipe === 'Walk-in' ? 'Walk-in (Petugas)' : 'Online (Akun Penyewa)' }}
                </dd>
            </div>
            <div>
                <dt class="text-xs text-[#65758B]">Waktu Dibuat</dt>
                <dd class="mt-0.5 font-bold text-[#142744]">{{ tanggalWaktu(booking.created_at) }}</dd>
            </div>
            <div>
                <dt class="text-xs text-[#65758B]">Petugas Pencatat</dt>
                <dd class="mt-0.5 font-bold text-[#142744]">{{ petugasPencatat }}</dd>
            </div>
            <div>
                <dt class="text-xs text-[#65758B]">Metode Pembayaran</dt>
                <dd class="mt-0.5 font-bold text-[#142744]">Tunai / Transfer di Tempat</dd>
            </div>
        </dl>

        <p v-if="booking.catatan" class="mt-5 rounded-xl bg-[#FFF3E7] px-4 py-3 text-sm text-[#B45309]">
            <span class="font-bold">Catatan:</span> {{ booking.catatan }}
        </p>
    </section>
</template>
