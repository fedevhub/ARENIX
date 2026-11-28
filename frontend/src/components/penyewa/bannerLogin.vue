<script setup>
import { computed } from 'vue'
import { Info, Lock } from 'lucide-vue-next'
import { useRoute } from 'vue-router'

const props = defineProps({
    judul: { type: String, required: true },
    teks: { type: String, default: '' },
    ikon: { type: String, default: 'lock' }, // 'lock' | 'info'
    kompak: { type: Boolean, default: false }, // satu baris, tombol lebih kecil
    gelap: { type: Boolean, default: false }, // latar navy besar
})

const route = useRoute()

const wadah = computed(() => {
    if (props.gelap) return 'rounded-3xl bg-[#142744] px-8 py-6'
    return props.kompak
        ? 'rounded-xl border border-[#FBD9B5] bg-[#FFF1E3] px-6 py-2.5'
        : 'rounded-xl border border-[#FBD9B5] bg-[#FFF1E3] px-6 py-4'
})

const ukuranTombol = computed(() => {
    if (props.kompak) return 'h-9 px-6'
    return props.gelap ? 'h-11 px-8' : 'h-11 px-7'
})

const tombolMasuk = computed(() =>
    props.gelap
        ? 'border border-[#34506F] bg-transparent text-white hover:bg-white/10'
        : 'border-2 border-[#D5DFEC] bg-white text-[#142744] hover:bg-[#F4F6F8]',
)
</script>

<template>
    <div class="flex flex-wrap items-center justify-between gap-4" :class="wadah">
        <div class="flex items-center" :class="gelap ? 'gap-6' : 'gap-4'">
            <Info v-if="ikon === 'info'" class="size-5 shrink-0 text-[#C2570C]" />
            <Lock v-else class="shrink-0" :class="gelap ? 'size-7 text-[#FF9638]' : 'size-5 text-[#C2570C]'" />

            <p v-if="kompak" class="text-sm text-[#65758B]">
                <span class="mr-1 font-bold text-[#142744]">{{ judul }}</span>{{ teks }}
            </p>
            <div v-else>
                <p :class="gelap ? 'text-2xl font-semibold text-white' : 'text-[15px] font-bold text-[#142744]'">
                    {{ judul }}
                </p>
                <p v-if="teks" class="mt-0.5" :class="gelap ? 'text-sm text-[#C9D6E8]' : 'text-xs text-[#65758B]'">
                    {{ teks }}
                </p>
            </div>
        </div>

        <div class="flex gap-3">
            <RouterLink :to="{ path: '/login', query: { redirect: route.fullPath } }"
                class="flex items-center rounded-xl text-sm font-bold transition-colors"
                :class="[ukuranTombol, tombolMasuk]">
                Masuk
            </RouterLink>
            <RouterLink :to="{ path: '/register', query: { redirect: route.fullPath } }"
                class="flex items-center rounded-xl bg-[#FF9638] text-sm font-bold text-white transition-colors hover:bg-[#FF8C24]"
                :class="ukuranTombol">
                Daftar
            </RouterLink>
        </div>
    </div>
</template>