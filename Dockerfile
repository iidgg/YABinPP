FROM --platform=$BUILDPLATFORM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json yarn.lock ./
COPY src/lib/server/prisma/ src/lib/server/prisma/

RUN yarn install --frozen-lockfile

COPY . .

RUN npm run build
RUN npm prune --production

FROM --platform=$BUILDPLATFORM node:18-alpine

WORKDIR /app

RUN apk add --no-cache openssl && npm install -g prisma pm2

COPY scripts/ scripts/
COPY package.json yarn.lock process.yml ./
COPY src/lib/server/prisma/ src/lib/server/prisma/

RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/build build/

EXPOSE 3000

ENV NODE_ENV=production

CMD [ "./scripts/run.sh" ]
