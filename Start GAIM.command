#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
/usr/bin/env bash "${DIR}/dev.sh"
