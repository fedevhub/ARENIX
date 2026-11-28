<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PetugasSidebar from '@/components/layout/petugasSidebar.vue'

const route = useRoute()

const fokus = computed(() => Boolean(route.meta.fokus))
</script>

<template>
    <div class="h-screen overflow-hidden">
        <PetugasSidebar v-if="!fokus" />

        <main class="h-screen overflow-x-hidden overflow-y-auto bg-[#F4F6F8]"
            :class="fokus ? '' : 'pt-16 lg:ml-58 lg:pt-0'">
            <RouterView />
        </main>
    </div>
</template>
