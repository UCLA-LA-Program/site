export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    _ctx: ExecutionContext,
  ) {
    const headers = { "x-cron-secret": env.CRON_SECRET };

    switch (controller.cron) {
      case "0 8 * * *": {
        const init_endpoints = [
          "/api/cron/init-sections",
          "/api/cron/init-las",
          "/api/cron/init-section-assignments",
        ];

        for (const endpoint of init_endpoints) {
          const res = await fetch(`${env.APP_URL}${endpoint}`, {
            method: "POST",
            headers,
          });
          const body = await res.text();
          console.log(`${endpoint}: ${res.status} — ${body}`);
          if (!res.ok) throw new Error(`${endpoint} failed: ${res.status}`);
        }
        break;
      }
      case "0 8 * * 1": {
        const res = await fetch(`${env.APP_URL}/api/cron/process-withdraws`, {
          method: "POST",
          headers,
        });
        const body = await res.text();
        console.log(`process-withdraws: ${res.status} — ${body}`);
        break;
      }
      case "*/30 * * * *": {
        const res = await fetch(`${env.APP_URL}/api/cron/backup`, {
          method: "POST",
          headers,
        });
        const body = await res.text();
        console.log(`backup: ${res.status} — ${body}`);
        break;
      }
    }
  },
} satisfies ExportedHandler<Env>;
