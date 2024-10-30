const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const TodoModel = require("./Models/TodoSchema");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());


// CONNECT TO DATABASE MONGODB
const connectToMongoDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true, 
    });
    console.log("Connected to MondoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
connectToMongoDatabase();

app.get("/get", async (req, res) => {
  try {
    const selectAllTask = await TodoModel.find();
    res.status(200).json(selectAllTask);
  } catch (error) {
    console.log("error getting task", error);
    res
      .status(500)
      .json({ error: "failed to view task", details: error.message });
  }
});

app.post("/add", async (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ error: "Task is required!" });
  }
  try {
    const result = await TodoModel.create({ task });
    res.json(result);
  } catch (error) {
    console.log("error creating task", error);
    res
      .status(500)
      .json({ error: "Failed create task", details: error.message });
  }
});

app.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const task = await TodoModel.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    task.done = !task.done;
    await task.save();
    res.json(task);
  } catch (error) {
    console.error("Error toggling task:", err);
    res.status(500).json({ error: "Failed to toggle task" });
  }
});

app.put("/updateTask/:id", async (req, res) => {
  const { id } = req.params;
  const { task } = req.body;

  try {
    const updatedTask = await TodoModel.findByIdAndUpdate(
      id,
      { task: task },
      { new: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ error: "fail to update task" });
    }
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error toggling task:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

app.delete("/delete/:id", (req, res) => {
  const { id } = req.params;
  TodoModel.findByIdAndDelete({ _id: id })
    .then((result) => res.json(result))
    .catch((err) => res.json(err));
});

app.listen(3001, () => {
  console.log("Server connected on port 3001");
});
