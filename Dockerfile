FROM node:22.22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22.22-alpine
ENV NODE_ENV=production PORT=3000 STORE_DIR=/var/lib/chrono IMPORT_DIR=/import VAULT_DIR=/vault
WORKDIR /app
# 서버 런타임 의존성(썸네일용 sharp). Alpine(musl)용 바이너리를 받는다.
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY server.mjs store.mjs internal-api.mjs obsidian.mjs thumbs.mjs ./
COPY src/data.ts ./src/
# named volume이 이 소유권을 이어받아 node 사용자가 DB와 미디어를 쓸 수 있다.
RUN mkdir -p /var/lib/chrono /import && chown node:node /var/lib/chrono /import
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.mjs"]
