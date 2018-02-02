const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const fs = require("fs")

const pjson = require("./package")

const LOGFILE = "./log.json"

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

ipcMain.on("submit", (event, data) => {
	let log
	if(fs.existsSync(LOGFILE)) {
		log = JSON.parse(fs.readFileSync(LOGFILE).toString())
	} else {
		log = {
			entries: []
		}
	}

	log.entries.push(data)

	fs.writeFileSync(LOGFILE, JSON.stringify(log))
})

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
