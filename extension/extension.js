const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('voiceRoom.open', () => {
      const panel = vscode.window.createWebviewPanel(
        'voiceRoom',
        'Voice Room',
        vscode.ViewColumn.One,
        { enableScripts: true, retainContextWhenHidden: true }
      );

      const htmlPath = path.join(context.extensionPath, 'webview', 'index.html');
      const html = fs.readFileSync(htmlPath, 'utf8');
      // replace placeholder for signaling URL if present
      panel.webview.html = html.replace(/__SIGNALING_URL__/g, process.env.SIGNALING_URL || 'http://localhost:3000');

      panel.webview.onDidReceiveMessage(async (msg) => {
        if (msg.type === 'open-mic') {
          // open external mic helper with name & ids
          const micUrlBase = process.env.MIC_HELPER_URL || 'http://localhost:8000/mic-helper/index.html';
          const micUrl = `${micUrlBase}?room=${encodeURIComponent(msg.room)}&userId=${encodeURIComponent(msg.userId)}&name=${encodeURIComponent(msg.displayName)}`;
          vscode.env.openExternal(vscode.Uri.parse(micUrl));
          vscode.window.showInformationMessage('Opened external mic helper for audio input (allow microphone).');
        } else if (msg.type === 'write-file') {
          // msg: { path, content }
          try {
            const workspaceFolder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
            if (!workspaceFolder) return;
            const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, msg.path);
            await vscode.workspace.fs.writeFile(fileUri, Buffer.from(msg.content, 'utf8'));
          } catch (e) {
            console.error('write-file error', e);
          }
        } else if (msg.type === 'request-file') {
          try {
            const workspaceFolder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
            if (!workspaceFolder) return;
            const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, msg.path);
            const data = await vscode.workspace.fs.readFile(fileUri);
            const content = Buffer.from(data).toString('utf8');
            panel.webview.postMessage({ type: 'file-content', path: msg.path, content });
          } catch (e) {
            console.error('request-file err', e);
          }
        }
      });
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
