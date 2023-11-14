<script>
  import Price from "$lib/components/Price.svelte";

 export let data

   //$: console.log(data)
</script>
 
<svelte:head>
    <title>ShimmerEVM Dashboard</title>
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="msapplication-starturl" content="/">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="manifest" href="./manifest.json">
</svelte:head>


<Price data={data} />
