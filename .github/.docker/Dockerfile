# syntax=docker/dockerfile:1

FROM node:24-alpine as api

RUN apk add --no-cache wget ca-certificates

RUN mkdir -p \
    /home/node/app/node_modules \
    /home/node/app/dist/assets \
    && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node apps/api/package.json /home/node/app/package.json
COPY --chown=node:node apps/api/node_modules /home/node/app/node_modules
COPY --chown=node:node apps/api/dist /home/node/app/dist

VOLUME /home/node/app/dist/assets

USER node

CMD ["node", "dist/src/index.js"]

FROM nginx:alpine as ui

RUN mkdir -p /etc/nginx/http.d \
    /usr/share/nginx/html/portfolio \
    /usr/share/nginx/html/docs

RUN rm -rf /etc/nginx/conf.d/*
RUN apk update && apk add --no-cache wget ca-certificates

COPY apps/ui/dist /usr/share/nginx/html

COPY apps/portfolio/out /usr/share/nginx/html/portfolio
COPY apps/docs/out /usr/share/nginx/html/docs
COPY apps/ui/default.conf /etc/nginx/http.d/default.conf
COPY apps/dashy/out /usr/share/nginx/html/dashy

CMD ["nginx", "-g", "daemon off;"]

# ============================================================================
# Stage 3: Final Production Image (combined API + UI)
# ============================================================================
FROM node:24-alpine as production

RUN apk add --no-cache \
    nginx \
    wget \
    ca-certificates \
    supervisor \
    && rm -rf /var/cache/apk/*

RUN mkdir -p \
    /home/node/app \
    /home/node/app/dist \
    /etc/nginx/conf.d \
    /etc/nginx/http.d \
    /var/log/supervisor \
    /var/log/nginx \
    && chown -R node:node /home/node/app \
    && chown -R nginx:nginx /etc/nginx/http.d \
    && chown -R nginx:nginx /var/log/nginx

WORKDIR /home/node/app

COPY --from=api --chown=node:node /home/node/app /home/node/app

COPY --from=ui --chown=nginx:nginx /usr/share/nginx/html /usr/share/nginx/html
COPY --from=ui --chown=root:root /etc/nginx/http.d/default.conf /etc/nginx/http.d/default.conf

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

COPY --chown=root:root .github/.docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

ENV NODE_ENV=production \
    PORT=4012 \
    TZ=Europe/Berlin \
    NEXT_PUBLIC_DEFAULT_LANGUAGE=de \
    NEXT_PUBLIC_DEFAULT_THEME_MODE=dark \
    NEXT_PUBLIC_ACTIVE_SOUND=true \
    GEMINI_MODEL=gemini-2.5-flash \
    HTML_DIR=/usr/share/nginx/html \
    ACCESS_LOG=/var/log/nginx/access.log \
    LOG_LEVEL=info \
    ERROR_LOG=/var/log/nginx/error.log

VOLUME /home/node/app/dist/assets


EXPOSE 80 4012

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

LABEL maintainer="Munir Mardinli <munir@mardinli.de>"
LABEL com.centurylinklabs.watchtower.enable="true"
LABEL recreat.container="true"
LABEL container.label.group="homelab"
