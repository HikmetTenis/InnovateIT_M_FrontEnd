# Base image
FROM node:21.6.2

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Set environment variables
ENV NODE_ENV=production

# Expose the port Cloud Run expects
EXPOSE 5000

# Start the application
CMD ["npm", "start"]