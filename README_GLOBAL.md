# Voice Room Hackathon — JS version
This archive contains:
- server/ : Socket.io signaling server (Node.js)
- extension/ : VS Code extension (JavaScript)
- web-client/ : Browser client (HTML/JS)
- mic-helper/ : External browser page for microphone input (for VS Code users)

Quick start (local):
1. Start the signaling server:
   cd server
   npm install
   npm start

2. Serve the web-client and mic-helper folders (simple static server). Example:
   npx http-server . -p 8000
   (then open http://localhost:8000/web-client/index.html)

3. Install the extension:
   - Copy the extension folder into a VS Code extension workspace and run in Extension Host, or package with vsce.

Notes:
- The project uses Yjs + y-webrtc from CDN for collaborative documents (text). You can replace with snapshot sync if preferred.
- The extension opens an external mic-helper URL to capture microphone due to VS Code webview limitations.
- Browser will always prompt for microphone permission.
