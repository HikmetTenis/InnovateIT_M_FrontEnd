# Use Node.js as the base image
FROM node:21.6.2

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the app's source code to the container
COPY . .

# Build the React app
RUN npm run build

# Serve the build
CMD ["npx", "serve", "-s", "build"]