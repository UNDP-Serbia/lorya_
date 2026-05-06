FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive \
    HOME=/root \
    NVM_DIR=/root/.nvm \
    NODE_VERSION=22.18.0 \
    YARN_VERSION=4.12.0 \
    CONDA_DIR=/opt/anaconda3

RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    build-essential \
    git \
    wget \
    bzip2 \
    && rm -rf /var/lib/apt/lists/*

# NVM
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Anaconda (system-wide style)
RUN ARCH="$(dpkg --print-architecture)" && \
    if [ "$ARCH" = "amd64" ]; then \
        ANACONDA_URL="https://repo.anaconda.com/archive/Anaconda3-2025.06-0-Linux-x86_64.sh"; \
    elif [ "$ARCH" = "arm64" ]; then \
        ANACONDA_URL="https://repo.anaconda.com/archive/Anaconda3-2025.06-0-Linux-aarch64.sh"; \
    else \
        echo "Unsupported architecture: $ARCH" && exit 1; \
    fi && \
    wget "$ANACONDA_URL" -O /tmp/anaconda.sh && \
    chmod +x /tmp/anaconda.sh && \
    bash /tmp/anaconda.sh -b -p "$CONDA_DIR" && \
    rm /tmp/anaconda.sh

# Use bash -lc for subsequent RUN commands
SHELL ["/bin/bash", "-lc"]

# Node, Yarn (via Corepack), Nest CLI
RUN source "$NVM_DIR/nvm.sh" && \
    nvm install "$NODE_VERSION" && \
    nvm alias default "$NODE_VERSION" && \
    corepack enable && \
    corepack prepare "yarn@$YARN_VERSION" --activate && \
    npm i -g @nestjs/cli

# Make Conda + Node available without needing nvm/conda init in each shell
ENV PATH="$CONDA_DIR/bin:${HOME}/.nvm/versions/node/v${NODE_VERSION}/bin:$PATH"

# Optional but nice: enable `conda activate` in interactive shells
RUN echo 'eval "$(/opt/anaconda3/bin/conda shell.bash hook)"' >> /etc/profile.d/conda.sh

# Workspace
WORKDIR /workspaces/loryamonorepo

EXPOSE 3333
EXPOSE 5173
EXPOSE 5174
EXPOSE 5175
