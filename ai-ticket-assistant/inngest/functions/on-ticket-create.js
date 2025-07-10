import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai.js";

export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;
      console.log("🎯 on-ticket-created triggered for ticket:", ticketId);

      // Step 1: Fetch the ticket
      const ticket = await step.run("fetch-ticket", () =>
        Ticket.findById(ticketId)
      );
      if (!ticket) throw new NonRetriableError("Ticket not found");

      // Step 2: Run AI analysis
      const ai = await analyzeTicket(ticket);

      let updates = {
        status: "TODO",
      };

      if (ai) {
        updates.priority = ai.priority ?? "medium";
        updates.helpfulNotes = ai.helpfulNotes;
        updates.relatedSkills = ai.relatedSkills;
      }

      // Step 3: Try to find a suitable user
      let assignedUser = null;

      if (ai?.relatedSkills?.length > 0) {
        // First, try to find a moderator with matching skills
        assignedUser = await User.findOne({
          role: "moderator",
          skills: { $in: ai.relatedSkills },
        });

        // If not found, try to find an admin with matching skills
        if (!assignedUser) {
          assignedUser = await User.findOne({
            role: "admin",
            skills: { $in: ai.relatedSkills },
          });
        }
      }

      if (assignedUser) {
        updates.assignedTo = assignedUser._id;
        updates.status = "IN_PROGRESS";

        await sendMail(
          assignedUser.email,
          "🧠 New Ticket Assigned",
          `A new ticket titled "${ticket.title}" has been assigned to you.`
        );

        console.log("🧾 Ticket assigned to:", assignedUser.email);
      } else {
        updates.assignedNote = "No one with the required skills available";
        console.log("📝 Assigned Note:", updates.assignedNote);
      }

      // Save updates to ticket
      await Ticket.findByIdAndUpdate(ticket._id, updates);

      return { success: true };
    } catch (err) {
      console.error("❌ on-ticket-created error:", err.message);
      return { success: false };
    }
  }
);
