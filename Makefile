VERSION=5.1
build:
	docker build -t rainbond/rbd-docs:${VERSION} .
debug:
	hugo server -D	
search-index:
	@hugo || { echo "Error: hugo build failed"; exit 1; }
	@algolia-client  recoder update --recodersFile public/algolia.json || { echo "Error: algolia index update failed"; exit 1; }
	rm -rf public/*