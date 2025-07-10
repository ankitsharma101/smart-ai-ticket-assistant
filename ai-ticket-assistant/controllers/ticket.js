import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description)
      return res
        .status(400)
        .json({ message: "Title and description required" });

    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id,
    });

    await inngest.send({
      name: "ticket/created",
      data: { ticketId: newTicket._id.toString() },
    });

    res.status(201).json({ message: "Ticket created", ticket: newTicket });
  } catch (err) {
    console.error("❌ createTicket:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTickets = async (req, res) => {
  const user = req.user;
  const filter = user.role === "user" ? { createdBy: user._id } : {};

  const tickets = await Ticket.find(filter)
    .populate("assignedTo", ["_id", "email", "role", "skills"])
    .sort({ createdAt: -1 });

  res.json({ tickets });
};

export const getTicket = async (req, res) => {
  const user = req.user;
  const filter =
    user.role === "user"
      ? { _id: req.params.id, createdBy: user._id }
      : { _id: req.params.id };

  const ticket = await Ticket.findOne(filter).populate("assignedTo", [
    "_id",
    "email",
    "role",
    "skills",
  ]);

  if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  res.json({ ticket });
};
