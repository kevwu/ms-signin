const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

const pjson = require("./package")

let win

let createWindow = () => {
	const windowOptions = {
		width: 800, height: 600, frame: false
	}

	if(pjson.env === "DEV") {
		windowOptions.fullscreen = false
		windowOptions.webPreferences = {
			zoomFactor: 1.25
		}
	}

	win = new BrowserWindow(windowOptions)

	win.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}))

	if(pjson.env === "DEV") {
		win.webContents.openDevTools()
	}

	win.on('closed', () => {
		win = null
	})
}

// startup
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	if(process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if(win === null) {
		createWindow()
	}
})
