const request = require("request")
const $ = require("jquery")

$(() => {
	let readerValue = "" // accumulates incoming value from card reader
	let readerTimeout // timeout for keystrokes

	let manualSignin = false

	// TODO possibly remove the button, and only allow manual if they're not in the directory?
	$("#form-dirinfo-button").on("click", (event) => {
		event.preventDefault()
		manualSignin = !manualSignin

		let $target = $(event.target)
		let $formDirinfo = $("#form-dirinfo")

		if(manualSignin) {
			$("#form-message").text("Welcome! Please fill out the form to sign in.")

			$target.text("Use card reader")

			$formDirinfo.slideDown()
			$formDirinfo.find("input").prop("disabled", false)
		} else {
			$("#form-message").text("Welcome! Please swipe your ID to sign in.")
			$target.text("Sign in manually")

			$formDirinfo.slideUp()
			$("#form-survey").slideUp()
			$formDirinfo.find("input").val('')
			$formDirinfo.find("input").prop("disabled", true)
		}
	})

	// only show survey if ID has been completed
	$("#form-dirinfo").find("input").on("keyup", (event) => {
		let allFilledOut = true // initialize to true; one empty element makes it false
		$("#form-dirinfo").find("input").each((i, val) => {
			allFilledOut = (allFilledOut & ($(val).val() !== ""))
			})
		if(allFilledOut) {
			$("#form-survey").slideDown()
		} else {
			$("#form-survey").slideUp()
		}
	})

	$(window).on("keydown", (event) => {
		if(manualSignin) {
			return
		}

		event.preventDefault()
		clearTimeout(readerTimeout)

		if(event.keyCode === 16) { // shift and ctrl
			return
		} else if(event.keyCode === 13) { // enter
			const eidMatch = readerValue.match(/%A(.+) /)
			if(eidMatch === null) { // if no EID, the reader likely errored out
				// TODO create timeout so "please try again" does not stay on screen
				$("#form-message").text("Please try again.")
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

				if(result.school !== "School of Engineering") {
					$("#form-message").text("Only Engineering majors may use the Maker Studio.")
					return
				}

				console.log(result)

				for(let key in result) {
					$(`#form-dirinfo-${key}`).val(result[key])
				}

				$("#form-dirinfo").slideDown(400, () => {
					$("#form-survey").slideDown()
				})
			})
	}

	$("#footer-quit").on("click", () => {
		window.close()
	})

	$("#footer-reload").on("click", () => {
		window.location.reload()
	})

// show error and reset everything
	const showError = (message) => {
		readerValue = ""
	}
})
