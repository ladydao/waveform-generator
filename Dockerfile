# Build stage
FROM node:14-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

# Run stage
FROM node:14-alpine

WORKDIR /usr/src/app

# Install ffmpeg
RUN apk add --no-cache ffmpeg

# Copy built node modules and source files
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY . .

EXPOSE 3000

CMD [ "node", "server.js" ]