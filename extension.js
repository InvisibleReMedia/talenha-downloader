// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const axios = require('axios');

const fs = require('fs');

const path = require('path');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * 
 * @param {string} folderPath the workspace folder path
 * @param {string} dir the path where to download
 * @param {string} name the file name to download
 * @param {string} url the url to download
 * @param {string} session the session string
 */
async function TalenhaDownloadFile(folderPath, dir, name, url, session) {

	// Configuration retrieval
	const resp = await axios.request({
		url : url + "?path=" + dir + "&name=" + name,
		method : "get",
		headers:{
			Cookie: "session=" + session + ";"
		}
	});

	if (resp.data) {

		const filePath = path.join(folderPath, dir);
		await fs.mkdir(filePath, { recursive: true }, async (err, newPath) => {
			if (err) {
				console.error('Error creating directory:', err);
				vscode.window.showErrorMessage('Failed to create directory.');
			} else {
				console.log('Directory created:', newPath);
		
				const fileFullPath = path.join(filePath, name);
				const content = resp.data;
			
				try {
					// Write the file
					await fs.writeFileSync(fileFullPath, resp.data);
					console.log('File written successfully:', fileFullPath);
					vscode.window.showInformationMessage('Fichier créé.');
				} catch (error) {
					console.error('Error writing file:', error);
					vscode.window.showErrorMessage(`Failed to write file: ${error.message}`);
				}
			}
		});				
	} else {
		return vscode.window.showErrorMessage('Une erreur est survenue. Vous n\'êtes pas authentifié sur le site');
	}

}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "talenha-downloader" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('talenha-downloader.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Talenha Downloader!');
	});

	context.subscriptions.push(disposable);

	let reader = vscode.commands.registerCommand('talenha-downloader.ReadTalenhaFile', async function() {

		try {

			// Configuration retrieval
			const config = vscode.workspace.getConfiguration('talenha-downloader');

			if (!vscode.workspace.workspaceFolders) {
				return vscode.window.showErrorMessage('Il faudrait ouvrir un projet avant.');
			}
	
			const folderPath = decodeURI(vscode.workspace.workspaceFolders[0].uri
				.toString(true)
				.split(':///')[1]);
		
			const dir = await vscode.window.showInputBox({ placeHolder: 'Sélectionnez un chemin' });
			const name = await vscode.window.showInputBox({ placeHolder: 'Sélectionner un nom de fichier' });

			if (!dir || !name) {
				return vscode.window.showErrorMessage('Annulé. Veuillez spécifier un chemin et un nom de fichier.');
			}

			const userName = config.get('username', 'olivier');
			const password = config.get('password', 'PJo70NOE8N0xdf8hXXG7');
			const authentURL = config.get('authenticationURL', 'http://localhost/JAlpha/verifyUser.php');

			const respAuthent = await axios.get(
				authentURL + "?user=" + userName + "&pass=" + password
			);

			console.log(respAuthent);

			const readServerUrl = config.get('serverUrl', 'http://localhost/JAlpha/readfile.php');
			const resp = await axios.request({
				url : readServerUrl + "?path=" + dir + "&name=" + name,
				method : "get",
				headers:{
					Cookie: "session=" + respAuthent.data + ";"
				}
			});

			if (resp.data) {

				const filePath = path.join(folderPath, dir);
				await fs.mkdir(filePath, { recursive: true }, async (err, newPath) => {
					if (err) {
						console.error('Error creating directory:', err);
						vscode.window.showErrorMessage('Failed to create directory.');
					} else {
						console.log('Directory created:', newPath);
				
						const fileFullPath = path.join(filePath, name);
						const content = resp.data;
					
						try {
							// Write the file
							await fs.writeFileSync(fileFullPath, resp.data);
							console.log('File written successfully:', fileFullPath);
							vscode.window.showInformationMessage('Fichier créé.');
						} catch (error) {
							console.error('Error writing file:', error);
							vscode.window.showErrorMessage(`Failed to write file: ${error.message}`);
						}
					}
				});				
			} else {
				return vscode.window.showErrorMessage('Une erreur est survenue. Vous n\'êtes pas authentifié sur le site');
			}
		

		} catch(error) {
			console.error(error);
			vscode.window.showErrorMessage('Une erreur est survenue', error);
		}

	});

	context.subscriptions.push(reader);

	let writer = vscode.commands.registerCommand('talenha-downloader.WriteTalenhaFile', function() {

	});

	context.subscriptions.push(writer);

	let repository = vscode.commands.registerCommand('talenha-downloader.DownloadTalenhaRepository', async function() {

		try {

			// Configuration retrieval
			const config = vscode.workspace.getConfiguration('talenha-downloader');

			if (!vscode.workspace.workspaceFolders) {
				return vscode.window.showErrorMessage('Il faudrait ouvrir un projet avant.');
			}
	
			const folderPath = decodeURI(vscode.workspace.workspaceFolders[0].uri
				.toString(true)
				.split(':///')[1]);


			const userName = config.get('username', 'olivier');
			const password = config.get('password', 'PJo70NOE8N0xdf8hXXG7');
			const authentURL = config.get('authenticationURL', 'http://localhost/JAlpha/verifyUser.php');

			const respAuthent = await axios.get(
				authentURL + "?user=" + userName + "&pass=" + password
			);

			console.log(respAuthent);

			const getServerUrl = config.get('getlanguagesURL', 'http://localhost/JAlpha/getlanguages.php');
			const respList = await axios.request({
				url : getServerUrl,
				method : "get",
				headers:{
					Cookie: "session=" + respAuthent.data + ";"
				}
			});

			const getLanguageURL = config.get('readlanguagesURL', 'http://localhost/JAlpha/readlanguage.php');

			if (respList.data) {

				const fileList = respList.data.split('\n');
				for(const file of fileList) {

					// download the file and save it to the folderPath
					const dir = file.split('/').slice(0, -1).join('/');
					const filename = file.split('/').slice(-1).join('');

					TalenhaDownloadFile(path.join(folderPath, 'languages'), dir, filename, getLanguageURL, respAuthent.data);
				}

			}

		} catch(error) {
			console.error(error);
			vscode.window.showErrorMessage('Une erreur est survenue', error);
		}

	});

	context.subscriptions.push(repository);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
