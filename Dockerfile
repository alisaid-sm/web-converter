FROM mcr.microsoft.com/playwright:v1.24.0-focal

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]