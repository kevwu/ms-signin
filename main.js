const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

const pjson = require("./package")

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

let createWindow = () => {
	const windowOptions = {width: 800, height: 600, frame: false}

	if(pjson.env === "DEV") {
		windowOptions.fullscreen = false
	}

	win = new BrowserWindow(windowOptions)

	win.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}))

	// Open the DevTools.
	if(pjson.env === "DEV") {
		win.webContents.openDevTools()
	}

	// Emitted when the window is closed.
	win.on('closed', () => {
		win = null
	})
}

// startup
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (win === null) {
		createWindow()
	}
})