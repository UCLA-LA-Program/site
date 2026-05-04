#!/bin/bash
rm -rf .wrangler/state/v3/d1
npx wrangler d1 export data --remote --output=./scripts/data.sql
npx wrangler d1 execute data --local --file "./scripts/data.sql"
