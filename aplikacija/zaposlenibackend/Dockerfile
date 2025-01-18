# Use Node.js base image
FROM node:16-alpine

# Install build dependencies
RUN apk add --no-cache python3 py3-pip make g++ sqlite

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json, and install dependencies
COPY package.json package-lock.json ./
RUN npm install --build-from-source

# Copy application code
COPY . .

# Expose the application port
EXPOSE 7000

# Start the application
CMD ["node", "index.js"]
