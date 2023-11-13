<script>
    import "../app.css";
    import Lenis from '@studio-freight/lenis'

    import { browser } from '$app/environment'; 
    import { onMount } from 'svelte';


    let lenis

    onMount(()=> {
       
    })

    $: {
        if (browser) { 
            const lenis = new Lenis()

            // lenis.on('scroll', (e) => {
            //     console.log(e)
            // })

            function raf(time) {
                lenis.raf(time)
                requestAnimationFrame(raf)
            }

            requestAnimationFrame(raf)
            
        }
    }

</script>
  


<main class="flex flex-col min-h-screen noise overflow-x-hidden">
    <span class="dotted-background pointer-events-none"></span>
    <slot />
</main>
