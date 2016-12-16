FROM node:latest
MAINTAINER nbuhay@gmail.com
WORKDIR /home/node
RUN git clone https://github.com/nbuhay/flashCards.git
WORKDIR /home/node/flashCards
RUN npm install
CMD npm start
