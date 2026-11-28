<script setup>
    import adminSidebar from '@/components/layout/AdminSidebar.vue'
</script>

<template>
    <div class="h-screen overflow-hidden">
        <adminSidebar />

        <main
            class="h-screen overflow-x-hidden overflow-y-auto bg-[#f5f5f5] pt-16 lg:ml-58 lg:pt-0"
        >
        <RouterView />
        </main>
    </div>
</template>

