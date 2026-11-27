<script setup>
    import adminSidebar from '@/components/layout/AdminSidebar.vue'
</script>

<template>
    <div class="h-screen overflow-hidden">
        <adminSidebar />

        <main
            class="ml-58 h-screen overflow-y-auto bg-[#f5f5f5]"
        >
        <RouterView />
        </main>
    </div>
</template>

