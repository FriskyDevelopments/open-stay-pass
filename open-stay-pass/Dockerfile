FROM node:22-alpine
WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm install
COPY src ./src
RUN npm run build
CMD ["node", "-e", "import('./dist/server.js').then(({createDemoServer})=>createDemoServer().listen(process.env.PORT||8787))"]
