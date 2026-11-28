<script setup>
import { computed } from 'vue'
import { Check, X } from 'lucide-vue-next'
import { tanggalWaktu } from '@/lib/format'

const props = defineProps({
    booking: { type: Object, required: true },
})

const cari = (aksi) => props.booking.riwayat?.find((r) => r.aksi === aksi)

const langkah = computed(() => {
    const b = props.booking
    const s = b.status
    const konf = cari('Konfirmasi Pembayaran')
    const sel = cari('Selesaikan Booking')
    const bat = cari('Batalkan Booking')
    const sudahKonf = s === 'Dikonfirmasi' || s === 'Selesai'

    const dibuat = {
        judul: 'Booking dibuat',
        ket: tanggalWaktu(b.created_at) + (b.dibuat_oleh?.nama ? ` • oleh ${b.dibuat_oleh.nama}` : ''),
        state: 'selesai',
    }

    if (s === 'Dibatalkan') {
        return [
            dibuat,
            {
                judul: 'Dibatalkan',
                ket: bat ? `${tanggalWaktu(bat.waktu)}${bat.user_id?.nama ? ` • oleh ${bat.user_id.nama}` : ''}` : 'Booking dibatalkan',
                state: 'batal',
            },
        ]
    }

    const peran = konf?.user_id?.role
        ? konf.user_id.role.charAt(0).toUpperCase() + konf.user_id.role.slice(1)
        : 'Petugas'

    return [
        dibuat,
        {
            judul: 'Menunggu pembayaran',
            ket: sudahKonf ? 'Pembayaran diterima di kasir' : 'Menunggu pembayaran di kasir',
            state: sudahKonf ? 'selesai' : 'aktif',
        },
        {
            judul: 'Dikonfirmasi',
            ket: konf
                ? (konf.user_id?.nama ? `Dikonfirmasi oleh ${konf.user_id.nama} (${peran})` : tanggalWaktu(konf.waktu))
                : 'Dikonfirmasi oleh petugas',
            state: s === 'Selesai' ? 'selesai' : s === 'Dikonfirmasi' ? 'aktif' : 'tunggu',
        },
        {
            judul: 'Selesai',
            ket: sel ? tanggalWaktu(sel.waktu) : 'Setelah jadwal main berakhir',
            state: s === 'Selesai' ? 'selesai' : 'tunggu',
        },
    ]
})

const kelasBulat = {
    selesai: 'bg-[#10B981] text-white',
    aktif: 'border-2 border-[#FF9638] bg-white',
    tunggu: 'border-2 border-[#D5DFEC] bg-white',
    batal: 'bg-[#DC2626] text-white',
}
</script>

<template>
    <ol>
        <li v-for="(l, i) in langkah" :key="l.judul" class="relative flex gap-4 pb-7 last:pb-0">
            <span v-if="i < langkah.length - 1" class="absolute left-[12px] top-[26px] h-[calc(100%-26px)] w-0.5"
                :class="l.state === 'selesai' ? 'bg-[#0E8A4F]' : 'bg-[#D5DFEC]'" />

            <span class="relative flex size-[26px] shrink-0 items-center justify-center rounded-full"
                :class="kelasBulat[l.state]">
                <Check v-if="l.state === 'selesai'" :size="14" :stroke-width="3" />
                <X v-else-if="l.state === 'batal'" :size="14" :stroke-width="3" />
                <span v-else-if="l.state === 'aktif'" class="size-2 rounded-full bg-[#FF9638]" />
            </span>

            <div>
                <p class="text-sm font-bold" :class="l.state === 'tunggu' ? 'text-[#8A97AA]' : 'text-[#142744]'">
                    {{ l.judul }}
                </p>
                <p class="mt-0.5 text-xs" :class="l.state === 'tunggu' ? 'text-[#8A97AA]' : 'text-[#65758B]'">
                    {{ l.ket }}
                </p>
            </div>
        </li>
    </ol>
</template>