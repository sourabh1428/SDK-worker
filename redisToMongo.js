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

// MongoDB collections
const dbName = 'test_db';
const userEventCollectionName = 'userEvent';
const allEventsCollectionName = 'all_events_done';

async function transferData() {
    console.log("Transferring data to MongoDB...");

    try {
        // Connect to Redis
        await redisClient.connect();

        // Connect to MongoDB
        await client.connect();

        const db = client.db(dbName);
        const userEventCollection = db.collection(userEventCollectionName);
        const allEventsCollection = db.collection(allEventsCollectionName);

        // Fetch hash keys from Redis
        const redisKeys = await redisClient.keys('*'); // Adjust the pattern if needed

        for (const key of redisKeys) {
            // Fetch hash fields and values
            const hashData = await redisClient.hGetAll(key);

            if (Object.keys(hashData).length > 0) {
                for (const [field, value] of Object.entries(hashData)) {
                    // Parse events data
                    const events = JSON.parse(value);

                    // Update or insert the document in the userEvent collection
                    await userEventCollection.updateOne(
                        { MMID: field },
                        { 
                            $push: { events: { $each: events } } 
                        },
                        { upsert: true } // If MMID does not exist, create a new document
                    );

                    // Insert each event into the all_events_done collection as separate documents
                    for (const event of events) {
                        await allEventsCollection.insertOne({
                            MMID: field,
                            eventName: event.eventName, // Assuming event object has an eventName property
                            eventTime: event.eventTime  // Assuming event object has an eventTime property
                        });
                    }
                }

                // Clear the Redis key after transferring the data
                await redisClient.del(key);
                console.log(`Cleared Redis cache for key: ${key}`);
            }
        }

        console.log("Successfully transferred data to MongoDB");

    } catch (error) {
        console.error("Error during data transfer:", error);
    } finally {
        // Close MongoDB connection
        await client.close();
        console.log("MongoDB connection closed");

        // Close Redis connection
        await redisClient.quit(); // Use quit() instead of disconnect()
        console.log("Redis connection closed");
    }
}

// Export the function
module.exports = transferData;
