import mongoose from "mongoose";
import { Vehicle } from "../models/vehicleModel";
import { vechicleData } from "./data";
import { MONGO_URI } from "../config/env";

const seedVehicles = async () => {
  try {
    await mongoose.connect(MONGO_URI! as string);
    await Vehicle.deleteMany();
    await Vehicle.insertMany(vechicleData);
    console.log("Seeding vehicles completed successfully! 🌱");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.connection.close();
  }
};

await seedVehicles();
