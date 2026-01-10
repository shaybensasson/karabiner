#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Compiling keysim.swift..."
swiftc -O -o keysim keysim.swift

echo "Done! Binary: $SCRIPT_DIR/keysim"
