
  #!/usr/bin/env bash

  set -euo pipefail

  ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  HOST_OPENAPI_URL="${HOST_OPENAPI_URL:-http://localhost:5205/openapi/v1.json}"
  DOCKER_OPENAPI_URL="${DOCKER_OPENAPI_URL:-http://host.docker.internal:5205/openapi/v1.json}"
  OUTPUT_DIR="${OUTPUT_DIR:-/workspace/frontend/generated/api}"

  curl --fail --silent --show-error "$HOST_OPENAPI_URL" > /dev/null

  mkdir -p "$ROOT_DIR/frontend/generated"

  docker run --rm \
    -v "$ROOT_DIR:/workspace" \
    openapitools/openapi-generator-cli:v7.12.0 \
    generate \
      -i "$DOCKER_OPENAPI_URL" \
      -g typescript-axios \
      -o "$OUTPUT_DIR"