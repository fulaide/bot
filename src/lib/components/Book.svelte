<script>
    export let book

    let labels = {
        main : 'Order Book',
        depth: 'Depth',
        buy: 'Buy',
        sell: 'Sell',
        unit: 'SMR'
    }
</script>


<ul class="order-book grid w-full p-3 md:p-6 bg-gradient-to-t from-transparent to-transparent backdrop-blur-md border border-white/40 z-10 col-span-full select-none">
    <span class="text-lg md:text-xl text-white/40">
        {labels.main}
    </span>

    <li class="grid grid-cols-[1fr,_2fr,_2fr] gap-x-5 mt-0.5 md:mt-1"> 
        <span class="text-lg font-semibold text-white/40 select-none">
            {labels.depth}
        </span>
        <span class=" text-lg font-semibold text-white/40 select-none">
            {labels.buy}  <span class="font-normal">| {labels.unit} </span>
        </span>

        <span class=" text-lg font-semibold text-white/40 select-none">
            {labels.sell}  <span class="font-normal">| {labels.unit}</span>
        </span>
    </li>

    {#if book }    
        {#each book as item, index }
            <li class="grid grid-cols-[1fr,_2fr,_2fr] gap-x-5 items-center border-b-2 border-b-white/10 last:border-0 py-2 md:py-5">

                <div class="depth grid grid-flow-col auto-cols-max items-center gap-2 ">
                    <span class="text-md md:text-lg text-white/40 select-none">-/+</span>
                    <span class="text-lg  md:text-3xl font-semibold text-white select-none">
                        {item.percent}%
                    </span>
                </div>

                <span class="buy text-lg md:text-3xl font-semibold text-[--brand]">
                    {item.neg}
                </span>

                <span class="buy text-lg md:text-3xl font-semibold text-red-100/80">
                    {item.pos}
                </span>
            </li>
        {/each}                               
    {/if}  
</ul>