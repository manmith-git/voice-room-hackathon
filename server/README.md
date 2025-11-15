# Signaling Server
Simple Socket.io signaling server for the Voice Room hackathon project.

Install:
  npm install

Run locally:
  npm start

Deploy:
- Push to GitHub and create a Render Web Service pointing to this repo.
- Ensure WEB service exposes the port and websockets are enabled.

The server forwards SDP/ICE and presence events only; no media or files pass through it.
