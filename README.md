# Credee - A tool to aid in social media credibility research

> **Warning**
> The project is still in its early phases, probably contains ugly code, and lots of experimentation is going on. Don't rely on anything here.

## Development

The repository is structured as a **TypeScript** mono-repo, using `pnpm` and `turbo` for dependency management and paralelization respectively. **Please check `.nvmrc` and the `engines` section** in `package.json` to determine the required versions for `node` and `pnpm`.

### Folder structure

- `/packages` - contains all modules of the application
  - `/shared` - shared dependencies for all modules. Please read more about how this is used below.
  - `/www` - the web application, built with SolidJS.
  - `/api` - the backend server, built with `tRPC`, `PostgreSQL` as a database and `kysely` as query builder.
  - `/worker` - background workers for web scrapers, built with `BullMQ` and `Redis`
  - `/docker` - sample `docker-compose.yml` for testing and documentation.

### Building for production

`Turbo` allows us to build all packages in parallel while also building all dependent packages in the right order. You can just run `pnpm build` and all will work magically✨. Additionally, commands for building all docker images are provided with `pnpm build:api`, `pnpm build:www` and `pnpm build:worker`.

> **Note**
> The `shared` folder was created for a special purpose. Because we want to keep type-safety various types or utilities are shared, same went for the `Queue` instance of BullMQ. When building the `api` docker image we hit a problem where `playwright` was also installed in the `api` even though it's only used by the `worker`. As such, we moved some dependencies to a `shared` packages so `api` no longer depends on `worker`.
