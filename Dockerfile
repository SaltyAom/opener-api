FROM node:12.2.0-slim
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
# RUN apt-get update && apt-get install -y \
# 	curl \
# 	git

# RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - \
# 	&& curl -sL https://deb.nodesource.com/setup_8.x | bash - \
# 	&& curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
# 	&& echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

# RUN apt-get update && apt-get install -y \
#	libcairo2-dev \
#	libjpeg-dev \
#	libpango1.0-dev \
#	libgif-dev \
#	libpng-dev \
#	build-essential \
#	g++

RUN yarn
COPY . .
EXPOSE 4000
cmd ["yarn", "start"]