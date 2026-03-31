FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
# (Assumes package.json exists in context)
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY server.js .

EXPOSE 8080

CMD ["node", "server.js"]
