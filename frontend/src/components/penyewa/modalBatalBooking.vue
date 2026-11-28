<script setup>
import { AlertTriangle } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { kodeBooking, lapanganLabel, rentangJam, rupiah, tanggalSingkat } from '@/lib/format'

defineProps({
    open: { type: Boolean, default: false },
    booking: { type: Object, default: null },
    loading: { type: Boolean, default: false },
    galat: { type: String, default: '' },
})

defineEmits(['update:open', 'konfirmasi'])
</script>

<template>
    <Dialog :open="open" @update:open="(v) => !loading && $emit('update:open', v)">
        <DialogContent class="w-[90vw] gap-0 overflow-hidden rounded-[28px] p-0 sm:max-w-[520px]"
            :show-close-button="false">
            <DialogHeader class="items-center px-9 pb-2 pt-8 text-center">
                <div class="flex size-16 items-center justify-center rounded-full bg-[#FEEFEF] text-[#DC2626]">
                    <AlertTriangle :size="28" />
                </div>
                <DialogTitle class="mt-3 text-2xl font-semibold text-[#142744]">
                    Batalkan booking {{ booking ? kodeBooking(booking) : '' }}?
                </DialogTitle>
                <DialogDescription class="text-sm leading-relaxed text-[#65758B]">
                    Slot jam main akan dibuka kembali untuk penyewa lain. Tindakan ini tidak dapat dibatalkan.
                </DialogDescription>
            </DialogHeader>

            <div v-if="booking" class="mx-9 mt-3 rounded-xl bg-[#F0F3F8] px-5 py-4 text-sm">
                <p class="font-bold text-[#142744]">{{ lapanganLabel(booking) }}</p>
                <p class="mt-1 text-xs text-[#65758B]">
                    {{ tanggalSingkat(booking.tanggal) }} • {{ rentangJam(booking.jam_mulai, booking.jam_selesai) }} •
                    {{ rupiah(booking.total_biaya) }}
                </p>
            </div>

            <p v-if="galat" role="alert" class="mx-9 mt-3 text-sm text-red-600">{{ galat }}</p>

            <DialogFooter class="flex flex-row gap-4 px-9 pb-8 pt-6">
                <button type="button" :disabled="loading"
                    class="h-12 flex-1 rounded-xl border-2 border-[#D5DFEC] bg-white text-sm font-bold text-[#142744] transition-colors hover:bg-[#F4F6F8] disabled:opacity-50"
                    @click="$emit('update:open', false)">
                    Kembali
                </button>
                <button type="button" :disabled="loading"
                    class="h-12 flex-1 rounded-xl bg-[#DC2626] text-sm font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-50"
                    @click="$emit('konfirmasi')">
                    {{ loading ? 'Memproses...' : 'Ya, Batalkan' }}
                </button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>