<script>
    export let data
   
    import { browser } from '$app/environment'; 
    import { onMount } from 'svelte';

    import Tile from '$lib/components/Tile.svelte'
    import Logo from '$lib/assets/shimmer.svg'
    import Blur from '$lib/assets/blur.svg'

    import marked  from '$lib/helper/marked';
    import { formatCurrency , formatShimmerAmount} from "$lib/helper/formatting.js"
    import Header from '$lib/components/Header.svelte';
    import Book from './Book.svelte';

    onMount(()=> {
        
    })

    $: {
        if (browser) { 
            formatData(data)
            // console.log(
            //     "browser", data
            // )
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

<nav class="w-full h-10 fixed hidden inset-0 z-20 md:block">
    <img src={Logo} alt="">
</nav>

<section class="grid place-content-center min-h-[100dvh] bg-[--base] relative px-6 py-3 bg-right-top">

    <Header />
    
    
    <div class="grid grid-cols-2  md:grid-cols-3 lg:grid-cols-4  gap-3 md:gap-6">
        
        <Tile content={price} featured={false} />
        <Tile content={volume} />
        <Tile content={tvl} />
        <Tile content={rank} />
        
        <Tile content={tx}  />
        <Tile content={defiVol}  />
        
        <Tile content={onchain} featured />
        <Book book={data.book}  />
        
    
    </div>

    <footer class="sticky bottom-0 left-0 pt-5">
        <span class="text-eyebrow  text-white/30  ">
            Data at: {data.currentTime} <span class="text-sm">- No guarantee for accuracy - this is not trading advice. Do your own research!</span>
        </span>
    </footer>
</section>

<style>
    section {
        background-image: url(./../assets/blur.svg);
    }
</style>