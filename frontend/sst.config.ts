// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "frontend",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: "us-west-2",
        },
      },
    };
  },
  async run() {
    if ($app.stage === "production") {
      new sst.aws.Nextjs("la_program", {
        domain: {
          name: "laprogramucla.com",
          redirects: ["www.laprogramucla.com"],
        },
      });
    } else {
      new sst.aws.Nextjs("la_program", {
        domain: {
          name: `dev.${$app.stage}.laprogramucla.com`,
        },
      });
    }
  },
});
