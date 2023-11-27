import { writable } from 'svelte/store'
import { browser } from '$app/environment';


const defaultValue = 1;
const initialValue = browser ? window.localStorage.getItem('trend') ?? defaultValue : defaultValue;
 
const trend = writable(initialValue);
 
trend.subscribe((value) => {
    if (browser) {
        window.localStorage.setItem('trend', value);
    }
});
 
export default trend;