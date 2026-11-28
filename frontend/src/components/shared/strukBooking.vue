<script setup>
import { computed } from 'vue'
import {
    jam, kodeBooking, lapanganLabel, namaPenyewa, rupiah,
    tanggalPanjang, tanggalWaktu,
} from '@/lib/format'

const props = defineProps({
    booking: { type: Object, required: true },
})

const konfirmasi = computed(() =>
    props.booking.riwayat?.find((r) => r.aksi === 'Konfirmasi Pembayaran'),
)

const r = computed(() => props.booking.rincian ?? {})
const sewa = computed(() => props.booking.durasi_jam * (r.value.harga_dasar_per_jam ?? 0))
const lampu = computed(() => (r.value.jam_lampu ?? 0) * (r.value.tambahan_lampu_per_jam ?? 0))
</script>

<template>
    <article
        class="mx-auto w-full max-w-[560px] overflow-hidden rounded-[32px] border border-[#E1E8F0] bg-white shadow-[0_2px_8px_rgba(20,39,68,0.04)] print:max-w-full print:rounded-none print:border-0 print:shadow-none print:[-webkit-print-color-adjust:exact] print:[print-color-adjust:exact]">
        <!-- Header -->
        <header class="flex items-start justify-between gap-4 bg-[#142744] px-9 pb-12 pt-8">
            <div>
                <p class="text-[28px] font-semibold leading-none text-white">ARENIX</p>
                <p class="mt-2 text-[9px] font-semibold uppercase text-[#C9D6E8]">
                    Bukti Reservasi Lapangan Resmi
                </p>
            </div>
            <span class="rounded-full bg-[#E3F5EC] px-5 py-2 text-xs font-bold text-[#0E7C47]">
                LUNAS / VALID
            </span>
        </header>

        <div class="px-9 pb-12 pt-8">
            <!-- Kode booking -->
            <div>
                <p class="text-[11px] font-semibold uppercase text-[#65758B]">Kode Booking</p>
                <p class="mt-1 text-4xl font-bold leading-tight text-[#142744]">{{ kodeBooking(booking) }}</p>
                <p class="mt-2 text-[11px] text-[#65758B]">
                    Diterbitkan: {{ tanggalWaktu(konfirmasi?.waktu ?? booking.created_at) }}
                    <template v-if="konfirmasi?.user_id?.nama"> • Dikonfirmasi oleh: {{ konfirmasi.user_id.nama }}
                        (Petugas)</template>
                </p>
            </div>

            <div class="my-5 border-t border-dashed border-[#D5DFEC]" />

            <!-- Data booking -->
            <dl class="space-y-4 text-sm">
                <div class="flex justify-between gap-4">
                    <dt class="text-[#65758B]">Nama Penyewa</dt>
                    <dd class="text-right font-bold text-[#142744]">
                        {{ namaPenyewa(booking) }}<span v-if="booking.tipe === 'Walk-in'"> (Walk-in)</span>
                    </dd>
                </div>
                <div class="flex justify-between gap-4">
                    <dt class="text-[#65758B]">Lapangan</dt>
                    <dd class="text-right font-bold text-[#142744]">{{ lapanganLabel(booking) }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                    <dt class="text-[#65758B]">Tanggal Main</dt>
                    <dd class="text-right font-bold text-[#142744]">{{ tanggalPanjang(booking.tanggal) }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                    <dt class="text-[#65758B]">Jadwal &amp; Durasi</dt>
                    <dd class="text-right font-bold text-[#FF8A1F]">
                        {{ jam(booking.jam_mulai) }} – {{ jam(booking.jam_selesai) }} WIB ({{ booking.durasi_jam }} Jam)
                    </dd>
                </div>
            </dl>

            <div class="my-5 border-t border-[#E1E8F0]" />

            <!-- Pembayaran -->
            <dl class="space-y-4 text-sm">
                <div class="flex justify-between gap-4">
                    <dt class="text-[#65758B]">
                        Sewa Lapangan ({{ booking.durasi_jam }} jam × {{ rupiah(r.harga_dasar_per_jam) }})
                    </dt>
                    <dd class="font-bold text-[#142744]">{{ rupiah(sewa) }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                    <dt class="text-[#65758B]">Tambahan Lampu (sekali per booking)</dt>
                    <dd class="font-bold text-[#142744]">{{ rupiah(lampu) }}</dd>
                </div>
            </dl>

            <div class="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-[#EDF1F6] px-6 py-5">
                <span class="text-base font-bold text-[#142744]">Total Dibayar</span>
                <span class="text-[32px] font-bold leading-tight text-[#142744]">{{ rupiah(booking.total_biaya)
                    }}</span>
            </div>

            <footer class="mt-8 text-center text-[11px] leading-relaxed text-[#65758B]">
                <p>Tunjukkan bukti booking ini kepada petugas lapangan 15 menit sebelum jadwal main.</p>
                <p class="mt-1">Terima kasih telah bermain di Arenix Sports Center.</p>
            </footer>
        </div>
    </article>
</template>
