# Venv Activator

A simple VS Code extension to activate Python virtual environments with a single command.

## Features

- Automatically detects common virtual environment directories in your workspace
- Smart detection of directories ending with 'venv' or 'env'
- Option to create a new virtual environment if none exists
- Allows you to select an existing custom virtual environment directory
- Works on Windows, macOS, and Linux
- Activates the virtual environment in the integrated terminal

## Usage

1. Open a workspace containing a Python project with a virtual environment
2. Use the command palette (Ctrl+Shift+P or Cmd+Shift+P on macOS) and type "Activate Venv"
3. Alternatively, use the keyboard shortcut Ctrl+Shift+A (Cmd+Shift+A on macOS)

The extension will:
- First look for common virtual environment directories (`venv`, `.venv`, `env`, `.env`, `virtualenv`, etc.)
- Also detect any directory ending with 'venv' or 'env' (e.g., `project-venv`, `backend-env`)
- If found, activate it automatically
- If multiple environments are found, prompt you to select which one to activate
- If no environment is found, offer to create a new one or select an existing one

## Requirements

- VS Code 1.60.0 or higher

## Extension Settings

This extension does not contribute any settings yet.

## Known Issues

- The extension currently only activates the first workspace folder if multiple are open.

## Release Notes

### 0.1.0

Initial release:
- Basic functionality to detect and activate virtual environments
- Support for Windows, macOS, and Linux