import { initLAs } from "./init";
import { processWithdraws } from "./withdraw";

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ) {
    switch (controller.cron) {
      case "0 8 * * *":
        await initLAs(env);
        console.log("Successfully initialized LAs")
        break;
      case "0 8 * * 1":
        await processWithdraws(env);
        console.log("Successfully processed withdraws")
        break;
    }
  },
} satisfies ExportedHandler<Env>;