# Picture Sharing API

Back-end-only Express API for registering users and storing picture metadata in a global in-memory object. Uploaded file bytes are handled in memory and discarded. All records are lost when the server restarts, as permitted by the assignment.

## Hosted application

Render URL: https://summer-resit-2026-picture-api-exibelpower.onrender.com

## Environment configuration

Copy `.env.example` to `.env` for local development:

```env
PORT=3000
```

The real `.env` file is excluded from Git. Render provides `PORT` automatically.

## Setup

```bash
npm install
npm test
npm start
```

The local server uses `http://localhost:3000`.

## Endpoints

| Method | Endpoint | Input |
|---|---|---|
| POST | `/register` | JSON: `email`, `firstname`, `lastname` |
| GET | `/` | Returns users' first name, last name, and active state |
| PUT | `/` | JSON: `email` |
| DELETE | `/` | JSON: `email` |
| POST | `/pictures/:email` | One multipart file in field `picture` |
| GET | `/pictures/:email` | URL email |
| GET | `/pictures/visible/:email` | URL email |
| PUT | `/pictures/visible/:visible` | JSON: `email`, `pic` |
| PUT | `/pictures` | JSON: `email`, `pic`, `description` |

`pic` accepts `0` or `pic0`. All responses are JSON using the JSend `success`, `fail`, or `error` format. Uploaded pictures receive a random 10-digit filename with the original extension.
