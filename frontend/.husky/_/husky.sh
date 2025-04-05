#!/usr/bin/env sh
if [ -z "$husky_skip_init" ]; then
  debug () {
    if [ "$HUSKY_DEBUG" = "1" ]; then
      echo "husky (debug) - $1"
    fi
  }

  readonly hook_name="$(basename -- "$0")"
  debug "starting $hook_name..."

  if [ "$HUSKY" = "0" ]; then
    debug "HUSKY env variable is set to 0, skipping hook"
    exit 0
  fi

  if [ -f ~/.husky/skip ]; then
    debug "~/.husky/skip file exists, skipping hook"
    exit 0
  fi

  if [ "$hook_name" = "pre-push" ] && [ "$HUSKY_PRE_PUSH" = "0" ]; then
    debug "HUSKY_PRE_PUSH env variable is set to 0, skipping hook"
    exit 0
  fi

  if [ "$hook_name" = "pre-commit" ] && [ "$HUSKY_PRE_COMMIT" = "0" ]; then
    debug "HUSKY_PRE_COMMIT env variable is set to 0, skipping hook"
    exit 0
  fi

  export readonly husky_skip_init=1
  sh -e "$0" "$@"
  exitCode="$?"

  if [ $exitCode != 0 ]; then
    echo "husky - $hook_name hook exited with code $exitCode (error)"
  fi

  exit $exitCode
fi 