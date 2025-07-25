import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "ai-ticket-assistant",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
