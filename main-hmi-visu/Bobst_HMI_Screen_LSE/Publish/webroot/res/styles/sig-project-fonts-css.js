const $_documentContainer = document.createElement('template');
$_documentContainer.innerHTML = `<custom-style><style>@font-face {font-family: 'roboto-regular'; src: url('res/resources/fonts/roboto-regular.ttf');} </style></custom-style>`;
document.head.appendChild($_documentContainer.content);