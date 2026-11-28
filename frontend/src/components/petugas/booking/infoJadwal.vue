<script setup>
import { computed } from 'vue'
import { jam, rentangJam, tanggalPanjang, toMinutes, fromMinutes } from '@/lib/format'

const props = defineProps({
    booking: { type: Object, required: true },
})

const slotTerpilih = computed(() => {
    const hasil = []
    const akhir = toMinutes(props.booking.jam_selesai)
    for (let m = toMinutes(props.booking.jam_mulai); m + 60 <= akhir; m += 60) {
        hasil.push(`${jam(fromMinutes(m))}-${jam(fromMinutes(m + 60))}`)
    }
    return hasil
})
</script>

<!-- <template>
    <section class="rounded-2xl border border-[#E1E8F0] bg-white p-6">
        <h2 class="text-lg font-extrabold text-[#142744]">Detail Jadwal &amp; Lapangan</h2>

        <dl class="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
            <div>
                <dt class="text-xs text-[#65758B]">Tanggal Main</dt>
                <dd class="mt-0.5 font-bold text-[#142744]">{{ tanggalPanjang(booking.tanggal) }}</dd>
            </div>
            <div>
                <dt class="text-xs text-[#65758B]">Jam Main &amp; Durasi</dt>
                <dd class="mt-0.5 font-bold text-[#142744]">
                    {{ rentangJam(booking.jam_mulai, booking.jam_selesai) }} ({{ booking.durasi_jam }} Jam)
                </dd>
            </div>
            <div class="sm:col-span-2">
                <dt class="text-xs text-[#65758B]">Slot Terpilih</dt>
                <dd class="mt-1.5 flex flex-wrap gap-2">
                    <span v-for="s in slotTerpilih" :key="s"
                        class="rounded-lg bg-[#142744] px-3 py-1 text-xs font-bold text-white">{{ s }}</span>
                </dd>
            </div>
            <div>
                <dt class="text-xs text-[#65758B]">Penggunaan Lampu</dt>
                <dd class="mt-0.5 font-bold text-[#142744]">
                    {{ booking.pakai_lampu ? 'Digunakan' : 'Tidak digunakan' }}
                </dd>
            </div>
        </dl>
    </section>
</template> -->