<script setup>
import { onMounted, ref } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { getDashboardData } from '@/services/dashboardService'

const data = 
    ref({ pengguna: 0, lapangan: 0, booking: 0, pendapatan: 0 })
    onMounted(async () => { try { data.value = (await getDashboardData()).data } catch { } })
</script>
<template>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 py-3">
        <Card class="shadow-sm">
            <CardContent class="flex flex-col gap-0 px-5">
                <p class="text-md font-semibold text-[#64748B]">Pengguna</p>
                <p class="text-4xl font-bold leading-tight text-[#FF9638]">
                    {{ data.pengguna }}
                </p>
            </CardContent>
        </Card>
        <Card class="shadow-sm">
            <CardContent class="flex flex-col gap-0 px-5">
                <p class="text-md font-semibold text-[#64748B]">Lapangan</p>
                <p class="text-4xl font-bold leading-tight text-[#FF9638]">
                    {{ data.lapangan }}
                </p>
            </CardContent>
        </Card>
        <Card class="shadow-sm">
            <CardContent class="flex flex-col gap-0 px-5">
                <p class="text-md font-semibold text-[#64748B]">Booking</p>
                <p class="text-4xl font-bold leading-tight text-[#FF9638]">
                    {{ data.booking }}
                </p>
            </CardContent>
        </Card>
        <Card class="shadow-sm">
            <CardContent class="flex flex-col gap-0 px-5">
                <p class="text-md font-semibold text-[#64748B]">Pendapatan</p>
                <p class="text-4xl font-bold leading-tight text-[#FF9638]">
                    {{ data.pendapatan }}
                </p>
            </CardContent>
        </Card>
    </div>
</template>
