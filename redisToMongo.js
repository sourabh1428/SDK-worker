const { createClient } = require('redis');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Redis and MongoDB configuration
const redisClient = createClient({
    password: process.env.redis_password,
    socket: {
        host: 'redis-16608.c273.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 16608
    }
});

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// MongoDB collection
const dbName = 'test_db';
const collectionName = 'userEvents'; // Change to your MongoDB collection name

async function transferData() {
    console.log("Transferring data to mongo....");
    
  try {
    // Connect to Redis
    await redisClient.connect();


    // Connect to MongoDB
    await client.connect();
   ;

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Fetch hash keys from Redis
    const redisKeys = await redisClient.keys('*'); // Adjust the pattern if needed

    for (const key of redisKeys) {
      // Fetch hash fields and values
      const hashData = await redisClient.hGetAll(key);

      if (Object.keys(hashData).length > 0) {
        for (const [field, value] of Object.entries(hashData)) {
          // Parse events data
          const events = JSON.parse(value);

          // Update or insert the document in MongoDB
          await collection.updateOne(
            { MMID: field },
            { 
              $push: { events: { $each: events } } 
            },
            { upsert: true } // If MMID does not exist, create a new document
          );

        
        }
      }
    }
    console.log("Successfully transferred user events to mongo");
    
  } catch (error) {
    console.error("Error during data transfer:", error);
  } finally {
    // Close MongoDB connection
    await client.close();

    
    // Close Redis connection
    await redisClient.quit(); // Use quit() instead of disconnect()
    
  }
}

// Run the transfer function


module.exports=transferData;