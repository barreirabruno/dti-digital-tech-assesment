# Stage 1: Build the TypeScript app
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json first to install dependencies
COPY package*.json ./
RUN npm install

# Copy the TypeScript source files
COPY . .

# Run the build command from package.json
RUN npm run build

# Stage 2: Run the application
FROM node:18-alpine

WORKDIR /app

# Copy only the compiled output and production dependencies
COPY --from=build /app/dist ./dist
COPY package*.json ./
RUN npm install --production

# Expose the port
EXPOSE 80

# Start the app using the "start" script
CMD ["npm", "start"]