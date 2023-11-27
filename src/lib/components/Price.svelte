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
    import { invalidate , invalidateAll } from '$app/navigation';


    //////store
    import trend from '$lib/stores/trendStore.js';

    //$: trendis = $trend === 1;
    let currenTrend = "+24hr"
 	//$: currenTrend = trendis ? trendTabOptions[0] : currenTrend
     $: currenTrend = $trend === 1 ? trendTabOptions[0] : currenTrend
     $: currenTrend = $trend === 3 ? trendTabOptions[1] : currenTrend
     $: currenTrend = $trend === 7 ? trendTabOptions[2] : currenTrend

    const trendTabOptions= [ "+24hr", "3d", "7d"]

    function updateTrend(option) {
        switch (option) {
            case "+24hr":
                trend.set(1)
                break;
            case "3d":
                trend.set(3)
                break;
            case "7d":
                trend.set(7)
                break;
            default:
                break;
        }

     //   invalidateAll(); 
       // invalidate((url) => url.pathname === '/');
        //console.log("trend is ", $trend)
    }

    onMount(()=> {
        
    })

    $: {
        if (browser) { 
            formatData(data.pageData)
            console.log(
                "browser", data
            )
            //formatTrendData(data.trendDataPrice)
            formatTrendData(data.trendData)
        }
    }


    let price = {}
    let volume = {}
    let rank = {}
    let onchain = {}
    let tvl = {}
    let tx = {}
    let defiVol = {}

    let priceTrend, volumeTrend, rankTrend, onchainTrend, tvlTrend, txTrend, defiVolTrend = {}

    async function formatTrendData(dat) {
        priceTrend = {
            amount: dat.price.differance,
            unit: "%",
            arrow: dat.price.trend,
        }
        volumeTrend = {
            amount: dat.volume.differance,
            unit: "%",
            arrow: dat.volume.trend,
        }
        rankTrend = {
            amount: dat.rank.differance,
            unit: "%",
            arrow: dat.rank.trend,
        }
        onchainTrend = {
            amount: dat.onchain.differance,
            unit: "%",
            arrow: dat.onchain.trend,
        }
        tvlTrend = {
            amount: dat.tvl.differance,
            unit: "%",
            arrow: dat.tvl.trend,
        }
        txTrend = {
            amount: dat.tx.differance,
            unit: "%",
            arrow: dat.tx.trend,
        }
        defiVolTrend = {
            amount: dat.defiVol.differance,
            unit: "%",
            arrow: dat.defiVol.trend,
        }
    }

    async function formatData(dat) {

        price = {
            label: "Price",
            amount: `${await formatCurrency(dat.price, "")}`,
            unit: "$",
            source: "Bitfinex",
        }
        volume = {
            label: "24h Volume",
            amount: `${await formatCurrency(dat.volume, "")}`,
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
            amount: `${await formatCurrency(await formatShimmerAmount(dat.onchain), '')}`,
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
            amount: `${dat.tx.toLocaleString()}`,
            unit: "TX",
            source: "GeckoTerminal",
        }
        defiVol = {
            label: "24h Defi Vol",
            amount: `${await formatCurrency(dat.defiVol, '')}`,
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

    <div class="tab-bar grid w-full place-content-center mb-5">
        <ul class="flex gap-2"> 
            {#each trendTabOptions as option }
                
            <li class="bg-[--base] px-3 py-1  text-white/50 cursor-pointer hover:bg-[--strong]" on:click={()=> updateTrend(option) } class:active={currenTrend === option} >
                <span class="text-sm ">{option}</span>
            </li>
            {/each}
        </ul>
    </div>
    
    
    <div class="grid grid-cols-2  md:grid-cols-3 lg:grid-cols-4  gap-3 md:gap-6">
        
        <Tile content={price} featured={false} trend={priceTrend} />
        <Tile content={volume}  trend={volumeTrend}/>
        <Tile content={tvl} trend={tvlTrend}/> 
        <Tile content={rank} trend={rankTrend}/>
        
        <Tile content={tx} trend={txTrend} />
        <Tile content={defiVol} trend={defiVolTrend} />
        
        <Tile content={onchain} featured trend={onchainTrend} />
        <Book book={data.pageData.book}  />
        
    </div>

    <footer class="sticky bottom-0 left-0 pt-5">
        <span class="text-sm  text-white/50  ">
            Data from: {data.pageData.currentTime.date} at {data.pageData.currentTime.atTime} <span class="text-xs">- No guarantee for accuracy - this is not trading advice. Do your own research!</span>
        </span>
    </footer>
</section>

<style>
    section {
        background-image: url(./../assets/blur.svg);
    }
    .active {
        background-color: var(--brand) !important;
        color:  var(--base)  !important;
    }
</style>