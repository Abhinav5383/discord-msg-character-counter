let totalMessages = 0;
let totalCharacters = 0;
let processing = false;
const iterationDelay_ms = 2000; // 2 Seconds
const msgContainerId = "message-content-";
const countedListClass = "counted-list";

const sleep = async (time_ms = 1_000) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve("Sleep finished");
		}, time_ms);
	});
};

const timestamp = () => {
	const currDate = new Date();
	const minutes = currDate.getMinutes();
	const seconds = currDate.getSeconds();

	return `[${currDate.getHours()}:${minutes < 10 ? `0${minutes}` : minutes}:${
		seconds < 10 ? `0${seconds}` : seconds
	}] `;
};

const getMessageGroupListItems = () => {
	const searchResultsList = Array.from(
		document.querySelectorAll("#search-results ul li[role='listitem']"),
	);

	return searchResultsList;
};

const getUncountedMessagesList = () => {
	const messageContainersList = [];

	const searchResultsList = getMessageGroupListItems();

	for (const li of searchResultsList) {
		if (li.classList.contains(countedListClass)) continue;

		const containers = Array.from(
			li.querySelectorAll("div[role='button'] div[role='article'] div div"),
		);

		li.classList.add(countedListClass);

		let container = containers.at(-1);
		if (!container.id.startsWith(msgContainerId)) {
			for (const containerElem of containers) {
				if (containerElem.id.startsWith(msgContainerId)) {
					container = containerElem;
				}
			}
		}

		if (container.id.startsWith(msgContainerId)) {
			messageContainersList.push(container);
		}
	}

	return messageContainersList;
};

const countLetters = () => {
	const msgContainers = getUncountedMessagesList();
	for (const msgContainer of msgContainers) {
		try {
			totalMessages += 1;
			totalCharacters = totalCharacters + msgContainer.innerText.length;
		} catch (error) {
			console.log({ error });
		}
	}
};

const waitForMessagesToLoad = async (
	waitDuration_ms = 15_000,
	interval_ms = 250,
) => {
	return new Promise((resolve) => {
		const maxIterations = waitDuration_ms / interval_ms;
		let currIterationsCount = 0;
		const intervalRef = setInterval(() => {
			if (currIterationsCount > maxIterations) {
				clearInterval(intervalRef);
				throw new Error(
					"WaitForMessagesToLoad timed out after",
					waitDuration_ms,
					" ms",
				);
			}

			currIterationsCount++;
			const messagesList = getMessageGroupListItems();
			if (messagesList?.length > 0) {
				resolve(true);
				clearInterval(intervalRef);
			}
		}, interval_ms);
	});
};

const loadPreviousStats = () => {
	try {
		const data = document.cookie;
		const parsedData = JSON.parse(data);

		totalMessages = Number.parseInt(parsedData?.totalMessages);
		totalCharacters = Number.parseInt(parsedData?.totalCharacters);
	} catch (error) {
		totalMessages = 0;
		totalCharacters = 0;
	}
};

const saveCurrStats = (data) => {
	try {
		document.cookie = JSON.stringify(data);
	} catch (error) {
		console.log(timestamp(), "ERROR SAVING DATA TO DOCUMENT COOKIE", { error });
	}
};

const clickHandler = async () => {
	if (processing === true) {
		return console.log(
			timestamp(),
			"Still processing the last request. Wait for that to finish.",
		);
	}
	console.log(timestamp(), "STARTING COUNTING...");
	processing = true;
	loadPreviousStats();

	let iterations = 0;
	const maxTries = 5;
	let tries = 0;
	while (true) {
		if (tries > maxTries) break;
		iterations++;

		try {
			countLetters();

			const nextButton = Array.from(
				document.body.querySelectorAll(
					"button.endButton__45c13.pageButton_bf9853.button__581d0.lookBlank_a5b4ca.colorTransparent__3e3c7.sizeMedium__60c12.grow__4c8a4",
				),
			)[1];
			if (nextButton?.disabled === false) {
				nextButton.click();
				await waitForMessagesToLoad();
			} else {
				break;
			}
		} catch (error) {
			tries++;
			console.log({ error });
			await sleep(5_000);
		}

		await sleep(iterationDelay_ms);
		const currData = {
			totalMessages,
			totalCharacters: totalCharacters,
		};
		saveCurrStats(currData);
		console.log(timestamp(), currData);

		if (iterations > 0 && iterations % 15 === 0) {
			const duration_s = 15;
			console.log(
				timestamp(),
				`SLEEPING FOR ${duration_s} SECONDS TO PREVENT BEING RATE LIMITED...`,
			);
			await sleep(duration_s * 1000);
		}
	}

	console.log("\n\n\n");
	console.log(timestamp(), "COUNTING FINISHED.");
	console.log(timestamp(), {
		totalMessages,
		totalCharacters: totalCharacters,
	});

	document.cookie = JSON.stringify({
		totalMessages: 0,
		totalCharacters: 0,
	});
	processing = false;
	console.log(timestamp(), "CLEARED TEMPORARY STATS FROM DOCUMENT COOKIE");
};

const button = document.createElement("button");
button.innerText = "Sum up letters";
button.style.position = "fixed";
button.style.top = "1rem";
button.style.left = "1rem";
button.style.padding = "0.5rem 1.5rem";
button.style.borderRadius = "0.25rem";
button.style.zIndex = "9999";

document.body.appendChild(button);
button.addEventListener("click", clickHandler);
