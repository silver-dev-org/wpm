## Contributing to WPM
add new challenges
locate code blocks in data folder and add the block with the following format example considering spaces and line breaks \n

"id": 1,
"title": "Hello World",
"language": "js",
"blocks": [
  "console.log(\"Hello, World!\");\n"
]

update build
open command console in game folder and type npm run build
this will be located in the dist\assets inside game folder.
rename to game and replace the existing version inside website\public\game
