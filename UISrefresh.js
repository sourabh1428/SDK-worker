const { MongoClient, ServerApiVersion , ObjectId } = require('mongodb');
// MongoDB connection
require('dotenv').config()
const express= require('express');

const app = express();

app.use(express.json());



const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Ensure the MongoDB client connects before starting the server
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("UIS WORKER STARTED!");
  } catch (error) {
    console.error("Error connecting to MongoDB IN THE WORKER OF UIS:", error);
  }
}

connectToMongoDB();

async function getAllCampaigns(){
            try{
             let allcampaigns=await client.db('test_db').collection("campaigns");
         
             let data=await allcampaigns.find({}).toArray();
            console.log(data);
                
             return(data)
            }catch(error){
             console.log(error);
            }
}
async function UIS(segment_id) {
    try {
    


        // Search for segment info
        const segment_info = await client.db('test_db').collection("campaigns").findOne({ segment_id: segment_id });

        if (!segment_info) {
            return "Segment not found";
        }

        // Fetch all user events
        const audience = await client.db('test_db').collection("userEvent").find({}).toArray();
        let ans = [];

        // Iterate through each user's events
        for (let i = 0; i < audience.length; i++) {
            const events = audience[i].events;
            
            // Iterate through each event of the user
            for (let j = 0; j < events.length; j++) {
                const event = events[j];
                
                // Check if the event matches the segment_info's event
                if (event.eventName === segment_info.event) {
                    ans.push(audience[i].MMID);
                    break; // Exit the loop for this user once a match is found
                }
            }
        }


        // Update segment_info with ans array
    
       
        try{
           
        // Update the document in the campaigns collection with the ans array
        const updateResult = await client.db('test_db').collection("segments").updateOne(
            {segment_id: segment_info.segment_id }, // Use _id assuming it's the primary key
            { $set: { users: ans } }
        );
       
        if(updateResult.acknowledged===true)return ans;
        else{
            return ("failed")
        }
    }catch(e){
        console.log(e);
        return( "Failed to update segment info with ans array." );
    }
        // if (updateResult.modifiedCount === 1) {
        //     res.json({ message: "Segment info updated successfully with ans array." });
        // } else {
        //     res.status(500).json({ message: "Failed to update segment info with ans array." });
        // }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching UIS" });
    }
}

async function hue(){
    let ans=[];
    ans=await getAllCampaigns();
  
        for(let i=0;i<ans.length;i++){
            let x=UIS(ans[i].segment_id);
            console.log("segment refreshed it's segment id: "+ans[i].segment_id);
         
        }
  
  }
  
  setInterval(() => {
    hue();
  }, 20000);