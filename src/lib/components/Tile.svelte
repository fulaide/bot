<script>
export let content = {
    label: "TVL",
    amount: "0.0487",
    unit: "$",
    source: "Bitfinex",
}

import up from '$lib/assets/up.svg'
import down from '$lib/assets/down.svg'
import stable from '$lib/assets/stable.svg'

export let trend = undefined
// export let trend = {
//     amount: "1,45",
//     unit: "%",
//     arrow: "up",
// }
// export let active = false

export let featured = false

const trendarrow = () => {
    if (!trend) return

    if (trend.arrow == "stable") {
        return stable
    } else if (trend.arrow == "up") {
        return up 
    } else {
        return down
    }
    return up
}  


</script>


<div class="
    group h-full 
    grid col-span-1 grid-rows-[max-content,_max-content,_max-content,_1fr]   
    px-3 md:px-6  pt-3 pb-3 md:pt-6 md:pb-8
    bg-gradient-to-t from-transparent to-transparent backdrop-blur-md 
    border border-white/40 z-10 " 
    class:col-span-2={featured} >

    <span class="text-label  text-white/40 group-hover:hidden  group-hover:text-[--brand] group-hover:font-semibold select-none">
        {content.label}
    </span>

    <span class="text-amount  font-semibold text-white  group-hover:hidden select-none">
     {content.amount}
        <span class="text-unit  text-white/10  group-hover:text-white/70 group-hover:font-semibold ml-1 select-none">
            {content.unit}
        </span>
    </span>

    <span class="text-label text-white/40 hidden group-hover:block select-none">
        Source
    </span>
    <span class="text-sub text-white/80 hidden group-hover:block select-none">
        {content.source} 
    </span>


    {#if trend}
        <div class="grid place-content-end justify-start  auto-rows-max ">

            <div class="flex gap-1 justify-start items-start h-full">
                <img src={trendarrow()} alt="">

                <span class="text-xl text-white/40 select-none">
                   {trend.amount} {trend.unit} 
                </span>
            </div>
        </div>
    {/if}
    
    <!-- <div class="grid place-content-end justify-start  auto-rows-max invisible group-hover:visible">
        <span class="text-label text-white/40">
            Source
        </span>
        <span class="text-sub text-white/80">
            {content.source} 
        </span>
    </div> -->

    
</div>