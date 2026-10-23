FROM node:26-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# One-shot image syncing the DB schema, run by the `migrate` service before the app starts
FROM deps AS migrator
COPY drizzle.config.ts ./
COPY src/lib/server/db/schema.ts src/lib/server/db/
CMD [ "npx", "drizzle-kit", "push", "--force" ]

FROM deps AS builder
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:26-alpine
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .
EXPOSE 5173
ENV NODE_ENV=production
CMD [ "node", "build" ]
