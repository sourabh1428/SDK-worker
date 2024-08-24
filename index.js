const {hue} = require('./UISrefresh');

const {transferData}=require('./redisToMongo');
setInterval(()=>{
    console.log("refresed at "+Date.now()+"ms");
    transferData();
    hue();
    

},60000);