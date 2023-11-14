<script>
    import { onMount } from "svelte";

    export let speed = 50
    export let auto = false
    export let hover = true
    export let delay = 0
    let ref
    
    function shuffle(o) {
        for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
    }

    function shuffleEventHandler() {
        // 🏃‍♂️ Private variable: Keep track of the event in progress
        let isInProgress = false

        // 👇 Event handler implementation
        return function handleHoverEvent(e) {
            if (isInProgress || !e.target) { return }

            isInProgress = true

            let elementTextArray = []
		    let randomText = []

            const text = e.target.innerHTML

            for ( let i = 0; i < text.length; i++) {
			    elementTextArray.push(text.charAt([i]));
		    }     

            function repeatShuffle(times, index) {

                if ( index == times ) {
                    //character count is reached, now set 
                    e.target.innerHTML = text
                    return;
                }

                setTimeout( function() {
                    randomText = shuffle(elementTextArray);
                    for ( let i = 0; i < index; i++ ) {
                        randomText[i] = text[i];	
                    }
                    randomText = randomText.join('');

                    e.target.innerHTML = `${randomText}`
                    index++;
                    repeatShuffle(times, index)

                }, speed);	
            }

            repeatShuffle(text.length, 0);
            isInProgress = false
        }
    }

    function shuffleTriggerEvent(element) {
        // 🏃‍♂️ Private variable: Keep track of the event in progress
        let isInProgress = false

        const el = element

       

        // 👇 Event handler implementation
        function handleHoverEvent(el) {
            if (isInProgress || !el.innerHTML) { return }

            isInProgress = true

            let elementTextArray = []
		    let randomText = []

            const text = el.innerHTML

            for ( let i = 0; i < text.length; i++) {
			    elementTextArray.push(text.charAt([i]));
		    }     

            function repeatShuffle(times, index) {

                if ( index == times ) {
                    //character count is reached, now set 
                    el.innerHTML = text
                    return;
                }

                setTimeout( function() {
                    randomText = shuffle(elementTextArray);
                    for ( let i = 0; i < index; i++ ) {
                        randomText[i] = text[i];	
                    }
                    randomText = randomText.join('');

                    el.innerHTML = `${randomText}`
                    index++;
                    repeatShuffle(times, index)

                }, speed);	
            }

            repeatShuffle(text.length, 0);
            isInProgress = false
        }

        handleHoverEvent(el)
    }

    export const trigger = () => {
       /// console.log("triggerd from parent");
        shuffleTriggerEvent(ref)
    }

    onMount(() => {
        if (auto == true) {
            setTimeout(async () => {
                shuffleTriggerEvent(ref)
            }, delay)
        }
    })
</script>


{#if hover}
    <span bind:this={ref} on:mouseover={shuffleEventHandler()} on:focus={shuffleEventHandler()}  >
        <slot>

        </slot>
    </span>

{:else}
    <span bind:this={ref}>
        <slot>

        </slot>
    </span>
{/if}

