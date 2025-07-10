import { inngest } from "../client.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";

export const onUserSignup = inngest.createFunction(
  { id: "on-user-signup", retries: 2 },
  { event: "user/signup" },
  async ({ event, step }) => {
    try {
      const { email } = event.data;

      const user = await step.run("get-user", async () => {
        const u = await User.findOne({ email });
        if (!u) throw new NonRetriableError("User no longer exists");
        return u;
      });

      await step.run("send-welcome-email", async () => {
        await sendMail(
          user.email,
          "Welcome to Ticket AI",
          `Hi ${user.email},\n\nThanks for signing up!`
        );
      });

      return { success: true };
    } catch (err) {
      console.error("❌ on-user-signup error:", err.message);
      return { success: false };
    }
  }
);
