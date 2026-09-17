# Meta Lead POC

Shows a Meta Lead Ad test submission live in an already-open React Native
screen, no manual action on the device.

## How it works

1. You submit a test lead in Meta's Lead Testing Tool.
2. Meta sends a `leadgen` webhook to the server.
3. The server reads the `leadgen_id` and calls the Graph API for the lead's
   fields.
4. The server emits `new_lead` over a socket.
5. The open app receives the event and adds the lead to the top of the list.

## Setup

### Server

```
cd server
npm install
cp .env.example .env   # fill in META_PAGE_ACCESS_TOKEN
npm start
```

Expose it with ngrok and use the forwarding HTTPS URL as the webhook
callback URL in the Meta app dashboard (subscribe to the `leadgen` field).

### Mobile

```
npx create-expo-app mobile
cd mobile
npm install socket.io-client
```

Replace the generated `App.tsx` with the one in this repo's `mobile/`
folder, set `SERVER_URL` to your ngrok URL, then run:

```
npx expo start
```

Open it in Expo Go before submitting the test lead.

## Assumptions

- This is a PoC using Meta's Lead Testing Tool, not a live ad.
- ngrok is used to expose the local server over HTTPS during the demo.
- The access token lives in `.env` and is never committed.
- Built with AI assistance and reviewed/adjusted by hand.
