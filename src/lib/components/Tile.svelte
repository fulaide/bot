<script>
export let content = {
    label: "TVL",
    amount: "0.0487",
    unit: "$",
    source: "Bitfinex",
}
// export let trend = {
//     amount: "1,45",
//     unit: "%",
//     arrow: "up",
// }
// export let active = false

export let featured = false
</script>


<div class="
    group h-full 
    grid col-span-1 grid-rows-[max-content,_max-content,_max-content,_1fr]   
    px-3 md:px-6  pt-3 pb-5 md:pt-6 md:pb-8
    bg-gradient-to-t from-transparent to-transparent backdrop-blur-md 
    border border-white/40 z-10 " 
    class:col-span-2={featured} >

    <span class="text-label  text-[--brand] group-hover:hidden  group-hover:text-[--brand] group-hover:font-semibold">
        {content.label}
    </span>
    <span class="text-amount  font-semibold text-white  group-hover:hidden">
        
     {content.amount}
        <span class="text-unit  text-white/10  group-hover:text-white/70 group-hover:font-semibold ml-1">
            {content.unit}
        </span>
    </span>

    <span class="text-label text-white/40 hidden group-hover:block">
        Source
    </span>
    <span class="text-sub text-white/80 hidden group-hover:block">
        {content.source} 
    </span>

    
    <!-- <div class="grid place-content-end justify-start  auto-rows-max invisible group-hover:visible">
        <span class="text-label text-white/40">
            Source
        </span>
        <span class="text-sub text-white/80">
            {content.source} 
        </span>
    </div> -->

    <!-- <div class="grid place-items-end">
        <span class="text-xl text-white/40">
            {trend.arrow} {trend.amount} {trend.unit} 
        </span>
    </div> -->
</div>