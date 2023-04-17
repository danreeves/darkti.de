# [darkti.de](https://darkti.de/)

## Development

### Prerequisites

1. Install node, npm, [planetscale cli](https://planetscale.com/features/cli)
2. Create a planetscale account, create a database called `darktide` and a branch called `development`
3. Copy `.env.example` to `.env` and fill in the env vars
4. Run `npm install` to install dependencies
5. Run `pscale auth login` to log into planetscale
6. Run `npm run update-db` to sync the schema to your db and generate TypeScript TypeScript

Run `npm run dev` to run the server locally. It will be on port 3000 by default.

Darktide cannot request URLs with ports so in order to auth your local server you'll need to expose it to the internet using a tool like localtunnel, ngrok, or tunnelmole. If you set the `DTAUTHDATA_PATH` path in the `.env` file the server will automatically set up a localtunnel tunnel and replace the line in the DTAuth mod to point it to that domain.
