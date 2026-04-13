FROM --platform=linux/amd64 ubuntu:22.04

# Avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    pkg-config \
    libudev-dev \
    libssl-dev \
    llvm \
    clang \
    cmake \
    protobuf-compiler \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 (for Anchor tests)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Solana CLI
ARG SOLANA_VERSION=2.3.0
RUN sh -c "$(curl -sSfL https://release.anza.xyz/v${SOLANA_VERSION}/install)" && \
    echo 'export PATH="/root/.local/share/solana/install/active_release/bin:$PATH"' >> /root/.bashrc
ENV PATH="/root/.local/share/solana/install/active_release/bin:${PATH}"

# Install Anchor CLI
ARG ANCHOR_VERSION=0.31.1
RUN cargo install --git https://github.com/coral-xyz/anchor --tag v${ANCHOR_VERSION} anchor-cli --locked

# Configure Solana for devnet
RUN solana config set --url devnet

# Set working directory
WORKDIR /sentinel

# Copy program source
COPY Cargo.toml Cargo.lock ./
COPY programs/ ./programs/
COPY Anchor.toml ./
COPY tsconfig.json ./
COPY package.json package-lock.json ./
COPY tests/ ./tests/

# Install Node dependencies for tests
RUN npm ci

# Build the program.
# Solana's bundled SBF toolchain can lag behind Cargo's lockfile format,
# so downgrade the lockfile header in-container while keeping pinned deps.
RUN sed -i '0,/^version = 4$/s//version = 3/' Cargo.lock \
    && anchor build

# Copy deploy script
COPY docker/solana/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
