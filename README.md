# Python Venv Activator

A VS Code extension that simplifies Python virtual environment management. With a single command, you can create and activate virtual environments without leaving your editor.


## Features

- **One-click activation** of Python virtual environments
- **Smart detection** of existing environments (venv, .venv, etc.)
- **Auto-detection** of environments with names ending in "venv" or "env"
- **Create new environments** if none exist
- **Properly updates terminal prompt** to show the active environment
- **Works reliably** on Windows, macOS, and Linux

## Installation

### From VSIX file

1. Download the `.vsix` file from the [latest release](https://github.com/yourusername/venv-activate/releases)
2. In VS Code, go to Extensions view (Ctrl+Shift+X)
3. Click the "..." (More Actions) button at the top of the Extensions view
4. Select "Install from VSIX..." and choose the downloaded file

### Building from source

```bash
# Clone the repository
git clone https://github.com/yourusername/venv-activate.git
cd venv-activator

# Install dependencies
npm install

# Compile the extension
npm run compile

# Package the extension
npx vsce package

# Install the generated .vsix file
code --install-extension venv-activator-0.1.0.vsix
```

## Usage

1. Open a workspace containing a Python project
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) to open the Command Palette
3. Type "Activate Venv" and select the command

The extension will:

- Look for existing virtual environments in your workspace
- If found, activate it in a new terminal with the environment name in the prompt
- If multiple environments are found, let you choose which one to activate
- If no environment is found, offer to create a new one

You can also use the keyboard shortcut: `Ctrl+Shift+A` (or `Cmd+Shift+A` on macOS)

## How It Works

When you run the "Activate Venv" command, the extension:

1. Searches your workspace for directories named: `venv`, `.venv`, `env`, `.env`, `virtualenv`, etc.
2. Also detects any directory ending with "venv" or "env" (e.g., `my-project-venv`, `backend-env`)
3. If no environment is found, offers to create a new one or let you select an existing one
4. Creates a dedicated terminal with the environment name in the prompt
5. Activates the environment and shows confirmation

## Windows Terminal Display

On Windows, the extension ensures the virtual environment name is displayed in the terminal prompt by:

1. Setting the prompt format with `prompt (venv) $P$G`
2. Running the activation script `venv\Scripts\activate`
3. Showing the Python executable path to confirm activation

## Configuration

This extension has no configurable settings yet. Future versions may include options for:
- Custom virtual environment locations
- Default environment name
- Custom terminal commands

## Requirements

- VS Code 1.60.0 or higher
- Python installed on your system

## Contributing

Contributions are welcome! Feel free to [open an issue](https://github.com/karthyick/venv-activate/issues) or submit a pull request.

## License

This extension is licensed under the [MIT License](LICENSE).