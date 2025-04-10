FROM node:16.13.0-alpine as build
ENV PORT=5000
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY ./package*.json ./
RUN npm install
COPY . .
RUN npm run build
#EXPOSE 5000
#CMD ["serve", "-s", "build"]

FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d
EXPOSE 5000
CMD ["nginx", "-g", "daemon off;"]