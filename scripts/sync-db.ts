import sequelize from "../src/lib/sequelize";
import { Conversation, Message, Reaction } from "../src/models";

async function sync() {
    try {
        console.log("Syncing Conversation...");
        await Conversation.sync({ alter: true });
        console.log("Syncing Message...");
        await Message.sync({ alter: true });
        console.log("Syncing Reaction...");
        await Reaction.sync({ alter: true });
        console.log("Database synced successfully (Messaging modules)");
    } catch (error) {
        console.error("Error syncing database:", error);
    } finally {
        await sequelize.close();
    }
}

sync();
