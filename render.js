const request = require("request")
const $ = require("jquery")

// accumulates incoming value from card reader
let readerValue = ""
let readerTimeout // timeout for keystrokes

$(window).on("keydown", (event) => {
	event.preventDefault()

	clearTimeout(readerTimeout)

	if(event.keyCode === 16) { // shift
		return
	} else if(event.keyCode === 13) { // enter
		const eidMatch = readerValue.match(/%A(.+) /)
		if(eidMatch === null) { // if no EID, the reader likely errored out
			console.log("Reader error.")
			console.log(readerValue)
			readerValue = ""
			return
		}

		const eidVal = eidMatch[1].toLowerCase().replace(' ', '');
		console.log(eidVal)
		queryDirectory(eidVal)

		readerValue = ""

		return
	}

	readerValue += event.key

	// stray keystrokes are cleared
	readerTimeout = setTimeout(() => {
		console.log("Clearing stray keystrokes.")
		readerValue = ""
	}, 400)
})

const queryDirectory = (eid) => {
	console.log("EID: " + eid)

	// thank you Abhishek
	const getInfo = (html, field, cleanup) => {
		const PATTERN = ":[\\s\\S]*?<td>[\\s]+(.+)<";
		let match = html.match(new RegExp(field + PATTERN));
		if(!match || match.length < 2)
			return "n/a"

		let out = match[1].trim();
		if(cleanup) {
			let m = out.match(/>(.*?)</);
			if(m.length > 1)
				out = m[1];
		}
		return out;
	}


	request.post(
		`https://directory.utexas.edu/index.php?q=${eid}&scope=all&submit=Search`,
		(err, httpResponse, body) => {
			if(err !== null) {
				console.log("http error:")
				console.log(err)
			}

			let result = {
				name: getInfo(body, "Name"),
				eid: eid,
				school: getInfo(body, "School/College"),
				major: getInfo(body, "Major"),
				classification: getInfo(body, "Classification"),
				email: getInfo(body, "Email", true),
			};

			console.log(result)
		})
}


