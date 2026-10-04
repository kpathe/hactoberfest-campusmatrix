import Goal from "../models/Goal.js";
import Connection from "../models/Connection.js";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import { createNotification } from "../utils/notification.js";

export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id })
      .populate("assigner", "name username email")
      .sort({ createdAt: -1 });

    return res.status(200).json(goals);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching goals", error: error.message });
  }
};

export const createGoal = async (req, res) => {
  try {
    const { title, description, category, priority, deadline, targetUserId } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Goal title is required" });
    }

    const goalUserId = targetUserId || req.user._id;
    const isSelfGoal = goalUserId.toString() === req.user._id.toString();

    const goal = await Goal.create({
      user: goalUserId,
      assigner: isSelfGoal ? null : req.user._id,
      title: title.trim(),
      description: description || "",
      category: category || "General",
      priority: priority || "Medium",
      deadline: deadline || null,
      status: "Pending",
      completed: false,
    });

    if (!isSelfGoal) {
      await createNotification({
        user: targetUserId,
        type: "goal_assigned",
        title: "New Goal Assigned",
        body: `${req.user.name} assigned you a new goal: "${title}"`,
        link: "/goals",
      });
    }

    const populatedGoal = await Goal.findById(goal._id)
      .populate("user", "name username email")
      .populate("assigner", "name username email");

    return res.status(201).json(populatedGoal);
  } catch (error) {
    return res.status(500).json({ message: "Error creating goal", error: error.message });
  }
};

export const getAssignedGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ assigner: req.user._id })
      .populate("user", "name username email")
      .sort({ createdAt: -1 });

    return res.status(200).json(goals);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching assigned goals", error: error.message });
  }
};

export const getAssignableMentees = async (req, res) => {
  try {
    const connections = await Connection.find({
      mentor: req.user._id,
      status: "accepted",
    }).populate("mentee", "name username email year");

    const mentees = connections.map((c) => c.mentee).filter(Boolean);

    return res.status(200).json(mentees);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching assignable mentees", error: error.message });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, priority, deadline, status, completed } = req.body;

    const goal = await Goal.findById(id);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Ensure only goal owner or assigner can update
    if (
      goal.user.toString() !== req.user._id.toString() &&
      goal.assigner?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to update this goal" });
    }

    if (title !== undefined) goal.title = title.trim();
    if (description !== undefined) goal.description = description;
    if (category !== undefined) goal.category = category;
    if (priority !== undefined) goal.priority = priority;
    if (deadline !== undefined) goal.deadline = deadline;
    if (status !== undefined) goal.status = status;
    if (completed !== undefined) {
      goal.completed = completed;
      if (completed) {
        goal.status = "Completed";
        // Gamification boost upon completion
        await Profile.findOneAndUpdate(
          { user: goal.user },
          { $inc: { gamificationPoints: 25, totalDynamicScore: 25 } }
        );
      }
    }

    await goal.save();

    const updatedGoal = await Goal.findById(id)
      .populate("user", "name username email")
      .populate("assigner", "name username email");

    return res.status(200).json(updatedGoal);
  } catch (error) {
    return res.status(500).json({ message: "Error updating goal", error: error.message });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await Goal.findById(id);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (
      goal.user.toString() !== req.user._id.toString() &&
      goal.assigner?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to delete this goal" });
    }

    await Goal.deleteOne({ _id: id });
    return res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting goal", error: error.message });
  }
};
