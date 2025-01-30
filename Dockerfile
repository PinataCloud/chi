FROM oven/bun:1 AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  sqlite3

# Copy package files first for better caching
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy rest of the files
COPY . ./

# Build the binary
RUN bun build src/index.ts --compile --outfile server

# Final stage
FROM debian:bookworm-slim

WORKDIR /app

# Install SQLite
RUN apt-get update && apt-get install -y \
  sqlite3 \
  && rm -rf /var/lib/apt/lists/*

# Copy only the compiled binary and create the database directory
COPY --from=builder /app/server ./server
COPY --from=builder /app/queue.db ./queue.db

# Ensure the database file is writable
RUN touch queue.db && chmod 666 queue.db

# Run the binary
CMD ["./server"]
