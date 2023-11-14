<script>
    let message = "404"
</script>

<main class="w-full min-h-[100vh] bg-[--base] overflow-x-hidden" id="error">
    <div class="error-wrapper min-h-[100dvh] w-[100vw] grid place-content-center py-[4vw] px-[5vw] lg:px-0 lg:py-[2vw]  noise">

        <div class="glitch text-6xl text-[--brand] tracking-[-7px]   " title={message}>
            {message}
        </div>
    </div>
</main>
