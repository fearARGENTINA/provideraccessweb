FROM python:3.9-slim

RUN apt-get update && apt-get install -yq \
    build-essential \
    python3-dev \
    zbar-tools \
    nginx

WORKDIR /api

COPY . /api/

COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /api/logs/
RUN pip install -r requirements.txt
RUN chmod +x ./startup.sh

EXPOSE 5443

CMD [ "./startup.sh" ]