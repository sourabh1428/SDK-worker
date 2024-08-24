const hue = require('./UISrefresh');

const transferData=require('./redisToMongo');
setInterval(()=>{
 
    transferData();
    hue(); 
},6000);



