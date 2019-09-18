FROM node:lts-alpine


ARG PAPER_FILE_NUMBER_PATTERN
ARG RAZZLE_FLAGS
ARG RAZZLE_GA_ID

ENV RAZZLE_PAPER_FILE_NUMBER_PATTERN ${PAPER_FILE_NUMBER_PATTERN}
ENV RAZZLE_FLAGS ${RAZZLE_FLAGS}
ENV RAZZLE_GA_ID ${RAZZLE_GA_ID}
#API connectivity
ENV RAZZLE_CONNECTION_STRING=${RAZZLE_CONNECTION_STRING}


# USER root
ADD ./ /web
WORKDIR /web

COPY package.json . 

COPY yarn.lock . 

RUN yarn install --production
RUN yarn build
EXPOSE 3000
ENTRYPOINT [ "yarn", "start" ]
# # New stage
# FROM nginx:1.15-alpine

# # Get artifact
# COPY --from=builder /web/build /usr/share/nginx/html/
# # Login as node user
# EXPOSE 80

