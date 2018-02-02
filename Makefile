run: data/index.json
	python3 -m http.server 9000

data/index.json: data/interesting.json index_builder.js
	nodejs index_builder.js
