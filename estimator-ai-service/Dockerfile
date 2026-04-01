FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
# (Assumes package.json exists in context)
COPY package*.json ./
RUN npm install --omit=dev

# Copy ALL source code (This was the fix!)
COPY . .

EXPOSE 8080

CMD ["node", "server.js"]
