const mongoose = require('mongoose');
const config = require('../config');

// 🚨 MongoDB URI
const MONGO_URI = 'mongodb+srv://Zanta-MD:Akashkavindu12345@cluster0.y7xsqsi.mongodb.net/?appName=Cluster0'; 
const OWNER_KEY = config.OWNER_NUMBER;

// Schema Definition
const SettingsSchema = new mongoose.Schema({
    id: { type: String, default: OWNER_KEY, unique: true }, 
    botName: { type: String, default: config.DEFAULT_BOT_NAME },
    ownerName: { type: String, default: config.DEFAULT_OWNER_NAME },
    prefix: { type: String, default: config.DEFAULT_PREFIX }
});

const Settings = mongoose.model('Settings', SettingsSchema);

let isConnected = false;

// Database Connection
async function connectDB() {
    if (isConnected) return;
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        isConnected = true;
        console.log("✅ MongoDB Connected!");
    } catch (error) {
        console.error("❌ MongoDB Error:", error);
    }
}

// Get Bot Settings
async function getBotSettings() {
    if (!OWNER_KEY) {
        return { 
            botName: config.DEFAULT_BOT_NAME, 
            ownerName: config.DEFAULT_OWNER_NAME, 
            prefix: config.DEFAULT_PREFIX 
        };
    }

    try {
        let settings = await Settings.findOne({ id: OWNER_KEY });
        if (!settings) {
            settings = await Settings.create({
                id: OWNER_KEY,
                botName: config.DEFAULT_BOT_NAME,
                ownerName: config.DEFAULT_OWNER_NAME,
                prefix: config.DEFAULT_PREFIX
            });
            console.log(`[DB] Created settings for: ${OWNER_KEY}`);
        }
        return {
            botName: settings.botName,
            ownerName: settings.ownerName,
            prefix: settings.prefix
        };
    } catch (e) {
        console.error('[DB] Fetch Error:', e);
        return { 
            botName: config.DEFAULT_BOT_NAME, 
            ownerName: config.DEFAULT_OWNER_NAME, 
            prefix: config.DEFAULT_PREFIX 
        };
    }
}

// Update Bot Settings
async function updateSetting(key, value) {
    if (!OWNER_KEY) return false;
    try {
        const update = { [key]: value };
        const result = await Settings.findOneAndUpdate(
            { id: OWNER_KEY },
            { $set: update },
            { new: true, upsert: true }
        );
        return !!result;
    } catch (e) {
        console.error(`[DB] Update Error (${key}):`, e);
        return false;
    }
}

module.exports = { connectDB, getBotSettings, updateSetting };
