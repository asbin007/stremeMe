FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production --silent
COPY src ./src
EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "src/index.js"]
