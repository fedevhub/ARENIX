<script setup>
    import FormLogin from '@/auth/formLogin.vue'
    import bg from '@/assets/bg login-register.png'
</script>

<template>
    <div class="relative flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-10"
        :style="{ backgroundImage: `url('${bg}')` }">
        <div class="absolute inset-0 bg-black/60"></div>

        <div class="relative w-full max-w-105 rounded-3xl bg-[#162447] px-8 py-10 shadow-2xl">
            <FormLogin />
        </div>
    </div>
</template>