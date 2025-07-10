import { Inngest } from "inngest";

export const inngest = new Inngest({
  name: "AI Ticket Assistant",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
