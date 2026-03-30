export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    _ctx: ExecutionContext,
  ) {
    const headers = { "x-cron-secret": env.CRON_SECRET };

    switch (controller.cron) {
      case "0 8 * * *":
        await fetch(`${env.APP_URL}/api/cron/init-las`, { method: "POST", headers });
        console.log("Successfully initialized LAs");
        break;
      case "0 8 * * 1":
        await fetch(`${env.APP_URL}/api/cron/process-withdraws`, { method: "POST", headers });
        console.log("Successfully processed withdraws");
        break;
    }
  },
} satisfies ExportedHandler<Env>;
