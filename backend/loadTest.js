const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/shorten';

const TOTAL_REQUESTS = 1000; // Total number of requests to send

function randomUrl() {
    const id = Math.floor(Math.random() * 1000000);
    return `http://example.com/${id}`;
}

async function sendRequest(){
    const original_url = randomUrl();
    const start = Date.now();
    try{
        const res = await fetch(BASE_URL, {
            method: 'POST',
            headers : { 'Content-Type': 'application/json'},
            body: JSON.stringify({ original_url})
        });
        const data = await res.json();
        const duration = Date.now() - start;
        if (res.ok){
            return { success: true, duration, short_url: data.short_url};
        }
        else{
            return {success: false, duration, error: data.error || 'Unknown error'};
        }
    }catch (err){
        return {success: false, duration: 0, error: err.message || 'Network error'};
    }
}

async function runLoadTest(){
    console.log(`Starting load test: ${TOTAL_REQUESTS} requests...`);
    const results = [];
    const concurrent = 50; // Number of concurrent requests
    let running = [];
    for (let i = 0; i < TOTAL_REQUESTS; i++) {
        const promise = sendRequest().then(result => {
            results.push(result);
            console.log(`Request ${i + 1}/${TOTAL_REQUESTS}:`, result);
        });
        running.push(promise);
        if (running.length >= concurrent){
            await Promise.race(running);
            running = running.filter(p => !p.isFulfilled);
        }
    }


    await Promise.all(running);

    const successes = results.filter(r => r.success).length;
    const failures = results.length - successes;
    const avgTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

    console.log(`Load test complete!`);
    console.log(`Success: ${successes}`);
    console.log(`Failures: ${failures}`);
    console.log(`Average response time: ${avgTime.toFixed(2)} ms`);
}

runLoadTest();