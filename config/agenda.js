import Agenda from "agenda";
import dotenv from "dotenv";
import Checkout from "../Models/checkoutModel.js"; // Import the Checkout model

dotenv.config(); // Load environment variables

// Create a new agenda instance with MongoDB URI and a specific collection name
const agenda = new Agenda({
  db: { address: process.env.URI, collection: process.env.AGENDA_COLLECTION },
  processEvery: process.env.AGENDA_PROCESS_INTERVAL, // Poll interval
  maxConcurrency: process.env.AGENDA_MAX_CONCURRENCY,
});

// Define a job to update the checkout status
agenda.define("update checkout status to processing", async (job) => {
  const { checkoutId } = job.attrs.data;
  try {
    const checkout = await Checkout.findById(checkoutId);

    if (checkout && checkout.status == "Pending") {
      checkout.status = "Processing";
      await checkout.save();
      console.log(`Checkout ${checkoutId} status updated to Processing`);
    } else {
      console.error(`Checkout ${checkoutId} not found`);
    }
  } catch (error) {
    console.error(`Error updating checkout ${checkoutId}: `, error);
  }
});

// Export the agenda instance
export default agenda;
