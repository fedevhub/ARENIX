<script setup>
// import chartBar from '@/components/admin/chart-bar.vue';
import cardDashboard from '@/components/admin/cardDashboard.vue';

const tanggal = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
}).format(new Date())
</script>

<template>
    <div class="p-8">
        <h1 class="text-3xl font-display font-bold tracking-wide">Dashboard</h1>
        <div class="flex flex-row items-center justify-between">
            <p class="font-medium text-gray-500">Pantau data dan aktivitas sistem secara keseluruhan.</p>
            <p class="font-medium text-gray-500">{{ tanggal }}</p>
        </div>

        <div class="py-3">
            <cardDashboard />
        </div>
        
        <!-- <chartBar /> -->
    </div>
</template>