FROM --platform=linux/amd64 node:18-alpine

RUN apk add libc6-compat

WORKDIR /app

COPY PDFToOfficeService/package.json ./
COPY PDFToOfficeService/src ./src

RUN npm install

EXPOSE 19113

CMD ["node", "src/index.js"]