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
    p-3 md:p-6 
    bg-gradient-to-t from-transparent to-transparent backdrop-blur-md 
    border border-white/40 z-10 " 
    class:col-span-3={featured} >

    <span class="text-label  md:text-xl text-[--brand] group-hover:text-[--brand] group-hover:font-semibold">
        {content.label}
    </span>
    <span class="text-amount md:text-3xl font-semibold text-white">
        {content.amount}
    </span>
    <span class="text-unit  md:text-3xl text-white/10  group-hover:text-white/70 group-hover:font-semibold">
        {content.unit}
    </span>

    <div class="grid place-content-end justify-start  auto-rows-max invisible group-hover:visible">
        <span class="text-label text-white/40">
            Source
        </span>
        <span class="text-sub text-white/80">
            {content.source} 
        </span>
    </div>

    <!-- <div class="grid place-items-end">
        <span class="text-xl text-white/40">
            {trend.arrow} {trend.amount} {trend.unit} 
        </span>
    </div> -->
</div>