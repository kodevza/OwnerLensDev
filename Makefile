.PHONY: dev build preview new clean

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

new:
	npm run new:note -- "$(slug)" "$(title)"

clean:
	rm -rf dist .astro node_modules
