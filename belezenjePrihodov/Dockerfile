# Use an official Node.js runtime as the base image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json (if present)
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application files (including .env)
COPY . .

# Expose the port the app runs on
EXPOSE 5002

# Command to run the application
CMD ["node", "index.js"]
