lint:
	pnpm run generate:dates && pnpm run format && pnpm run lint && pnpm run typecheck

preview:
	pnpm run fetch:previews

up:
	pnpm run dev