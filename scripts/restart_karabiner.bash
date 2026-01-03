#!/usr/bin/env bash
# Restart Karabiner Elements console user server

launchctl kickstart -k "gui/$(id -u)/org.pqrs.service.agent.karabiner_console_user_server"
