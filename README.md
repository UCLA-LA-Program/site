# UCLA Learning Assistant Website

This monorepo contains the code for the Learning Assistant website at UCLA. This is not an informational website; it is actively used by both LAs and PDT to manage the feedback and observation cycle each quarter.

Please visit <https://www.laprogramucla.com> to see the production website.

## Development Requirements/Tech Stack

- Node.js (preferably LTS)
- Python 3.14

We use:

- Next.js on the frontend deployed through Vercel
- Python on the backend run through AWS Lambdas
- AWS for infrastructure, managed using Terraform

### Frontend/Backend

To develop the app, run:

```bash
cd frontend
npm i
npm run start
```

This starts a Next.js development server in the `frontend` directory at <http://localhost:3000>. You can see any changes you make in real time here. For more information, including in-depth development patterns, please read [frontend/README.md](frontend/README.md) before proceeding.

To develop API routes, make any changes you wish to make to `backend`, then make a PR targeting `main`. Please refer to [backend/README.md](backend/README.md) for more information on how to access AWS resources in a way that allows for both test and production deployments with the same code.

Once the Github Actions pipelines run, check the PR for a comment with instructions on how to set your environment variables properly to allow your locally hosted app to access a testing version of the API; this will let you test front-end and back-end changes together without affecting production data.

### Infrastructure

Please refer to [terraform/README.md](terraform/README.md) for more information. This should not need to be edited more than roughly once a quarter (for new database deployments).
