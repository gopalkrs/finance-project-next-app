import { serve } from "inngest/next";
import { checkBudgetAlerts } from "../../../lib/inngest/functions";
import { inngest } from "../../../lib/inngest/client";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    checkBudgetAlerts , // <-- This is where you'll always add all your functions
  ],
});
