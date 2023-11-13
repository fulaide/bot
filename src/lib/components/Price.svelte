<script>
    export let data
   
    import { browser } from '$app/environment'; 
    import { onMount } from 'svelte';

    import Tile from '$lib/components/Tile.svelte'
    import Logo from '$lib/assets/shimmer.svg'
    import Blur from '$lib/assets/blur.svg'

    import marked  from '$lib/helper/marked';
    import { formatCurrency , formatShimmerAmount} from "$lib/helper/formatting.js"

    onMount(()=> {
        
    })

    $: {
        if (browser) { 
            formatData(data)
            console.log(
                "browser", data
            )
        }
    }


    let price = {}
    let volume = {}
    let rank = {}
    let onchain = {}
    let tvl = {}
    let tx = {}
    let defiVol = {}

    async function formatData(dat) {

        price = {
            label: "Price",
            amount: `${await formatCurrency(dat.usdPrice, "")}`,
            unit: "$",
            source: "Bitfinex",
        }
        volume = {
            label: "24h Volume",
            amount: `${await formatCurrency(dat.totalVolume, "")}`,
            unit: "$",
            source: "Bitfinex",
        }
        rank = {
            label: "Rank",
            amount: `${dat.rank.toLocaleString()}`,
            unit: "No.",
            source: "DefiLlama",
        }
        onchain = {
            label: "Onchain",
            amount: `${await formatCurrency(await formatShimmerAmount(dat.onChainAmount), '')}`,
            unit: "SMR",
            source: "Shimmer API",
        }
        tvl = {
            label: "TVL",
            amount: `${await formatCurrency(dat.tvl, '')}`,
            unit: "$",
            source: "DefiLlama",
        }
        tx = {
            label: "24h Defi TX",
            amount: `${dat.defiTx24hr.toLocaleString()}`,
            unit: "TX",
            source: "GeckoTerminal",
        }
        defiVol = {
            label: "24h Defi Vol",
            amount: `${await formatCurrency(dat.defiTotalVolume, '')}`,
            unit: "$",
            source: "GeckoTerminal",
        }
    } 

</script>

<!-- <nav class="w-full h-10 fixed inset-0 z-20">
    <img src={Logo} alt="">
</nav> -->

<!-- {#if data }    
    {#each Object.entries(data.formatedData) as [label, value] }
        <li class="">
            
            <span>
                {value}
                
                {@html marked( value)}
            </span>
        </li>
    {/each}                               
{/if}   -->


<main class="grid place-content-center min-h-[100dvh] bg-[--base] relative px-6 py-3">

   
    <!-- <img src={Blur} alt="" class="absolute top-0 left-0 h-full"> -->

    <div class="grid grid-cols-1  mb-5 md:mb-20 text-center ">
        <span class=" uppercase text-lg md:text-xl  tracking-[0.5rem] text-[--brand] mb-4">
            Dashboard
        </span>
        <h1 class=" uppercase text-2xl md:text-5xl  font-semibold tracking-[1.8rem] text-white  mb-2">Shimmer</h1>
        <h3 class=" uppercase text-lg md:text-2xl  font-semibold  tracking-[0.5rem] text-white">
            EVM
        </h3>
    </div>

   
    <div class="grid grid-cols-2  md:grid-cols-3 lg:grid-cols-4  gap-3 md:gap-6">
        
        <Tile content={price} featured={false} />
       
        <Tile content={volume} />
        <Tile content={tvl} />
        <Tile content={rank} />
        <Tile content={onchain} />
        <Tile content={defiVol} />
        <Tile content={tx} />
    
    
        <ul class="order-book grid w-full p-3 md:p-6 bg-gradient-to-t from-transparent to-transparent backdrop-blur-md border border-white/40 z-10 col-span-full">
            <span class="text-lg md:text-xl text-[--brand]">
                Order Book
            </span>

            <li class="grid grid-cols-[1fr,_2fr,_2fr] gap-x-5 mt-1"> 
                <span class="text-lg font-semibold text-white/40">
                    Depth
                </span>
                <span class=" text-lg font-semibold text-white/40">
                    Buy  <span class="font-normal">| SMR</span>
                </span>

                <span class=" text-lg font-semibold text-white/40">
                    Sell  <span class="font-normal">| SMR</span>
                </span>
            </li>

            {#if data }    
                <!-- {#each Object.entries(data.book) as [label, value] } -->
                {#each data.book as item, index }
                    <li class="grid grid-cols-[1fr,_2fr,_2fr] gap-x-5 items-center border-b-2 border-b-white/40 last:border-0 py-5">

                        <div class="depth grid grid-flow-col auto-cols-max items-center gap-2 ">
                            <span class="text-md md:text-lg text-white/40">+/-</span>
                            <span class="text-lg  md:text-3xl font-semibold text-white">
                                {item.percent}%
                            </span>
                        </div>
        
                        <span class="buy text-lg md:text-3xl font-semibold text-green-700">
                            {item.neg}
                        </span>
        
                        <span class="buy text-lg md:text-3xl font-semibold text-red-700">
                            {item.pos}
                        </span>
                    </li>
                {/each}                               
            {/if}  
        </ul>

    </div>
    
</main>
