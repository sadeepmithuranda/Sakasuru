# Single image: Fastify API + the built web app served from the same origin.
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile
ENV VITE_API_URL=/
RUN pnpm build

FROM node:22-alpine AS run
WORKDIR /app
RUN corepack enable && addgroup -S app && adduser -S app -G app
ENV NODE_ENV=production
COPY --from=build /app /app
RUN pnpm prune --prod --ignore-scripts || true
USER app
ENV PORT=4000 WEB_DIST_DIR=/app/apps/web/dist
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:4000/health || exit 1
CMD ["node", "apps/api/dist/server.js"]
