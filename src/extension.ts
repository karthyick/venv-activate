// src/extension.ts
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    console.log('Venv Activator extension is now active');
    
    // Import os module for temp directory
    const os = require('os');

    let disposable = vscode.commands.registerCommand('venv-activator.activateVenv', async () => {
        // Get the current workspace folder
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder is open');
            return;
        }

        // Look for common virtual environment directory names
        const commonVenvDirs = ['venv', '.venv', 'env', '.env', 'virtualenv', 'python-venv', 'py-venv', 'py-env', 'python-env'];
        let venvPath: string | undefined;
        
        // First check for exact matches
        for (const dir of commonVenvDirs) {
            const potentialPath = path.join(workspaceFolder.uri.fsPath, dir);
            if (fs.existsSync(potentialPath)) {
                venvPath = potentialPath;
                break;
            }
        }
        
        // If not found, look for directories ending with 'venv' or 'env'
        if (!venvPath) {
            try {
                const files = fs.readdirSync(workspaceFolder.uri.fsPath);
                const venvDirs = files.filter(file => {
                    const fullPath = path.join(workspaceFolder.uri.fsPath, file);
                    const isDir = fs.statSync(fullPath).isDirectory();
                    return isDir && (file.endsWith('venv') || file.endsWith('env'));
                });
                
                if (venvDirs.length > 0) {
                    venvPath = path.join(workspaceFolder.uri.fsPath, venvDirs[0]);
                    
                    // If multiple matches found, show a quick pick to select one
                    if (venvDirs.length > 1) {
                        const selectedDir = await vscode.window.showQuickPick(venvDirs, {
                            placeHolder: 'Multiple virtual environments found. Select one:'
                        });
                        
                        if (selectedDir) {
                            venvPath = path.join(workspaceFolder.uri.fsPath, selectedDir);
                        }
                    }
                }
            } catch (error) {
                console.error('Error scanning directory:', error);
            }
        }

        for (const dir of commonVenvDirs) {
            const potentialPath = path.join(workspaceFolder.uri.fsPath, dir);
            if (fs.existsSync(potentialPath)) {
                venvPath = potentialPath;
                break;
            }
        }

        // If no venv found, offer to create one or select existing
        if (!venvPath) {
            const options = ['Create new virtual environment', 'Select existing virtual environment', 'Cancel'];
            const selection = await vscode.window.showQuickPick(options, {
                placeHolder: 'No virtual environment found. What would you like to do?'
            });

            if (!selection || selection === 'Cancel') {
                return;
            }

            if (selection === 'Create new virtual environment') {
                // Ask for venv name
                const venvName = await vscode.window.showInputBox({
                    prompt: 'Enter name for the new virtual environment',
                    placeHolder: 'venv',
                    value: 'venv'
                });

                if (!venvName) {
                    vscode.window.showInformationMessage('Operation cancelled');
                    return;
                }

        // Create the virtual environment path
                venvPath = path.join(workspaceFolder.uri.fsPath, venvName);
                
                // Check if directory already exists
                if (fs.existsSync(venvPath)) {
                    const overwrite = await vscode.window.showWarningMessage(
                        `Directory '${venvName}' already exists. Do you want to use it anyway?`,
                        'Yes', 'No'
                    );
                    
                    if (overwrite !== 'Yes') {
                        vscode.window.showInformationMessage('Operation cancelled');
                        return;
                    }
                } else {
                    // Create the virtual environment using terminal
                    let terminal = vscode.window.activeTerminal;
                    if (!terminal) {
                        terminal = vscode.window.createTerminal('Python Environment');
                    }
                    
                    terminal.show();
                    
                    // Use the system Python to create a new virtual environment
                    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
                    terminal.sendText(`${pythonCommand} -m venv "${venvName}"`);
                    
                    // Give it more time to create the environment (5 seconds)
                    vscode.window.showInformationMessage(`Creating virtual environment '${venvName}'...`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    
                    vscode.window.showInformationMessage(`Virtual environment '${venvName}' created successfully`);
                }
            } else {
                // Select existing virtual environment
                const selectedFolder = await vscode.window.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    openLabel: 'Select Virtual Environment Directory',
                    defaultUri: workspaceFolder.uri
                });

                if (!selectedFolder || selectedFolder.length === 0) {
                    vscode.window.showInformationMessage('No virtual environment selected');
                    return;
                }

                venvPath = selectedFolder[0].fsPath;
            }
        }

        // Determine the activation script path based on OS
		const isWindows = process.platform === 'win32';
		const activateScriptPath = isWindows 
			? path.join(venvPath, 'Scripts', 'activate.bat')  // Include .bat extension explicitly
			: path.join(venvPath, 'bin', 'activate');
	
		let activateExists = false;
		let retryCount = 0;
		const maxRetries = 5;
		
		while (!activateExists && retryCount < maxRetries) {
			// Wait longer between retries (3 seconds instead of 2)
			vscode.window.showInformationMessage(`Waiting for activation script to be available (attempt ${retryCount + 1}/${maxRetries})...`);
			await new Promise(resolve => setTimeout(resolve, 3000));
			activateExists = fs.existsSync(activateScriptPath);
			retryCount++;
		}
	
		if (!activateExists) {
			vscode.window.showErrorMessage(`Activation script not found at ${activateScriptPath} after ${maxRetries} attempts. The virtual environment may not be properly set up.`);
			return;
		}
	
		// Get workspace path for cd command
		const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath || '';
		
		// Create a terminal name that clearly shows it's for the venv
		const venvName = path.basename(venvPath);
		const terminalName = `Python: ${venvName}`;
		
		vscode.window.showInformationMessage(`Terminal Virtual environment trying to set for : ${isWindows ? 'Windows' : 'Unix'}`);

		// On Windows, we'll create a completely new terminal approach
		if (isWindows) {
			try {
				// Create a new terminal with specific shell args to customize cmd
				// This is a different approach that directly uses cmd's initialization options
				const terminal = vscode.window.createTerminal({
					name: terminalName,
					shellPath: "cmd.exe",
					// The /K flag keeps the terminal open after running the command
					// The PROMPT sets the prompt format - using $E[1;32m for green color to stand out
					shellArgs: [
						"/K",
						`PROMPT=$E[1;32m(${venvName})$E[0m $P$G && cd /D "${workspacePath}" && "${activateScriptPath}" && echo. && echo Virtual environment '${venvName}' activated successfully! && echo. && where python`
					]
				});
				
				terminal.show();
				const activateCmd = path.relative(workspaceFolder.uri.fsPath, path.join(venvPath, 'Scripts', 'activate'));
				terminal.sendText(activateCmd);
				vscode.window.showInformationMessage(`Terminal Virtual environment activated: ${venvName}`);

			} catch (error) {
				console.error('Error creating terminal:', error);
				// Fallback to a basic approach
				const terminal = vscode.window.createTerminal(terminalName);
				terminal.show();
				terminal.sendText(`cd /d "${workspacePath}" && "${activateScriptPath}" && echo Virtual environment activated`);
			}
		} else {
			// On Unix, use source to activate
			const terminal = vscode.window.createTerminal({
				name: terminalName,
				shellPath: '/bin/bash',
				shellArgs: ['-c', `cd "${workspacePath}" && source "${activateScriptPath}" && export PS1="\\e[0;32m(${venvName})\\e[m \\w\\$ " && bash`]
			});
			terminal.show();
		}
	
		vscode.window.showInformationMessage(`Virtual environment activated: ${venvName}`);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}