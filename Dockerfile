FROM node:22-bookworm-slim

WORKDIR /app

ENV DATABASE_URL=file:/tmp/build.db
ENV DEFAULT_CURRENCY=USD

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY . .

RUN npm run db:setup
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["sh", "-lc", "npm run db:migrate && npm run db:seed && npm start -- --hostname 0.0.0.0 --port ${PORT:-3000}"]
