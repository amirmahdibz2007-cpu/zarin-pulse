FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/analytics/package.json packages/analytics/package.json
COPY packages/etl/package.json packages/etl/package.json
COPY packages/calendar/package.json packages/calendar/package.json
COPY packages/insights/package.json packages/insights/package.json
RUN npm ci
COPY . .
RUN npm run build
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
