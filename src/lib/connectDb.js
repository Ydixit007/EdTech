import mongoose from "mongoose";

let cachedConnect = null;

export async function connectDB() {
  if (cachedConnect) {
    console.log("using cached DB connection");
    return cachedConnect;
  }
  try {
    const connect = await mongoose.connect(process.env.DATABASE_URL, {
      dbName: "EdTech",
    });
    cachedConnect = connect.connection;
    console.log("Database connected!");
    return cachedConnect;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
