# Base image
FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Expose the port Cloud Run expects
EXPOSE 5000

# Start the application
CMD ["npm", "start"]