const hue = require('./UISrefresh');
const transferData = require('./redisToMongo');

// function refreshInterval() {
//     // Define the minimum and maximum delay in milliseconds (0 to 60,000 ms for up to 1 minute)
//     const minDelay = 10000; // Minimum delay (e.g., immediately)
//     const maxDelay = 60000; // Maximum delay (e.g., 1 minute)

//     // Generate a random delay between minDelay and maxDelay
//     const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

//     // Execute the transferData and hue functions
//     console.log("Transfer from redis to mongo done and UISrefresh");

//     transferData();
//     hue();

//     // Schedule the next refresh
//     setTimeout(refreshInterval, randomDelay);
// }

// // Start the refresh cycle
// refreshInterval();

const express = require('express');
const app = express();
const port = 4000;

// Keep-alive route
setInterval(()=>{
    hue();

    transferData();

},30000)

app.get('/keep-alive', (req, res) => {
  res.json({data:'I am alive - from worker'});
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
