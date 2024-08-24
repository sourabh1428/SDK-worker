const hue = require('./UISrefresh');

const transferData=require('./redisToMongo');
setInterval(()=>{
    console.log("Transfer and UISrefresh");
    
    transferData();
    hue(); 
},60000);



