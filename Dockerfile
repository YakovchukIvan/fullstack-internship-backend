FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install


FROM node:20-alpine AS development
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
CMD ["npm", "run", "start:dev"]


FROM node:20-alpine AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build


FROM build AS test
ENV NODE_ENV=test
CMD ["npm", "run", "test"]