## How to run

This repository is only the admin UI. It needs the UrbanLink .NET API to be running (with its
database) to sign in and load data. Set the API up using the backend repository's instructions,
then follow the steps below.

### Prerequisites

- [Node.js](https://nodejs.org/) (current LTS, 22 or newer) and npm
- Git
- The UrbanLink API running locally (by default at `https://localhost:7252`), with the HTTPS
  dev certificate trusted (`dotnet dev-certs https --trust`)

### Setup

```bash
git clone https://github.com/YourLAYWER/UrbanLinkWebFrontEnd.git
cd UrbanLinkWebFrontEnd
npm install
```

Create a `.env` file in the project root (copy `.env.example`) and set the API address:

```
VITE_API_BASE_URL=https://localhost:7252/api
```

Use the URL your API prints when it starts, and keep the `/api` at the end. Then start the dev
server:

```bash
npm run dev
```

Open the address Vite prints (normally <http://localhost:5173>) and sign in with an admin
account. Only accounts with the `Admin` role can use this UI.

### After pulling new changes

Run `npm install` again if `package.json` changed. Restart `npm run dev` if `.env` changed,
because Vite only reads it at startup.

### Troubleshooting

| Problem | Likely cause and fix |
| --- | --- |
| "Cannot reach the server" on the login page | The API isn't running, the port in `.env` is wrong, the dev certificate isn't trusted, or CORS blocks the request. Check that `https://localhost:7252/swagger` loads, then press F12 and read the Console tab. |
| CORS error in the browser console | The API only allows the origin `http://localhost:5173`. Run Vite on that port (stop whatever else is using it), or ask the backend owner to add your origin. |
| "Invalid email or password" | Wrong credentials, or your local database doesn't have the admin account yet. Ask the backend owner how the admin is created. |
| Changes to `.env` are ignored | Stop `npm run dev` and start it again. |

### What not to commit

`node_modules/` and `.env` must stay out of git (check `.gitignore`). Commit `package.json` and
`package-lock.json`, and never commit passwords or keys.