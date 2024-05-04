
console.log('👨‍💻 Author: Saurav Hathi \n🌟 GitHub: https://github.com/sauravhathi \n🚀Linkedin: https://www.linkedin.com/in/sauravhathi');

// toast to show messages
function toast(message, type = "success") {
    const div = document.createElement("div");
    div.id = "toast";
    const text = document.createTextNode(message);
    div.appendChild(text);
    const styleList = [
        'background-color: ' + (type === 'success' ? '#350054' : '#ff0000'),
        'color: ' + (type === 'success' ? '#fff' : '#fff'),
    ];
    div.style.cssText = styleList.join(";");
    document.body.appendChild(div);
    setTimeout(() => {
        div.style.opacity = "1";
        div.style.transform = "translateY(0)";
    }, 1);
    setTimeout(() => {
        div.style.opacity = "0";
        div.style.transform = "translateY(-100%)";
        setTimeout(() => {
            document.body.removeChild(div);
        }, 500);
    }, 2000);
}

let mainContainer = document.createElement("div");
mainContainer.id = "main-container";
document.body.appendChild(mainContainer);

let chatContainer = document.createElement("div");
chatContainer.id = "chat-container";
chatContainer.classList.add("hidden");
chatContainer.addEventListener("dblclick", (e) => {
    e.stopPropagation();
});
mainContainer.appendChild(chatContainer);

let tempText = ''

document.addEventListener("keydown", (e) => {
    if ((e.altKey && (e.key === "x" || e.key === "c")) || (e.ctrlKey && e.shiftKey)) {
        let chatContainer = document.getElementById("chat-container");
        if (chatContainer.classList.contains("hidden")) {
            chatContainer.classList.remove("hidden");
        }
        else {
            chatContainer.classList.add("hidden");
        }
    }

    if ((e.ctrlKey && e.key === "b") || (e.altKey && e.key === "b")) {
        navigator.clipboard.readText().then((text) => {
            if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) {
                document.activeElement.value = text;
                document.activeElement.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }).catch((err) => {
            console.error('Failed to paste: ', err);
        });
    }
});

async function copyTextToClipboard(text) {
    if (!text) {
        return Promise.reject("Text not found");
    }

    document.getElementById("message-input").value = text;
    tempText = text;
    return navigator.clipboard.writeText(text)
        .then(() => 'Copied to clipboard!')
        .catch((error) => {
            throw new Error(`Error copying to clipboard: ${error}`);
        });
}

function watchForElement() {
    const targetSelector = 'div[aria-labelledby="each-type-question"]';

    const handleDoubleClick = (event) => {
        const targetElement = event.target.closest(targetSelector);
        if (targetElement) {
            const cleanedText = targetElement.innerText.replace(/\n{3,}/g, '\n');
            copyTextToClipboard(cleanedText)
                .then((message) => {
                    console.log(message);
                })
                .catch((error) => {
                    alert(error.message);
                });
        }
    };

    document.addEventListener('dblclick', handleDoubleClick);

    // const observer = new MutationObserver(function (mutations) {
    //     const parent = document.querySelector("div[aria-labelledby='each-type-question']");
    //     // if (parent) {
    //     //     parent.appendChild(chatContainer);
    //     //     if (document.querySelector(targetSelector)) {
    //     //         observer.disconnect();
    //     //     }
    //     // }
    //     document.body.appendChild(chatContainer);
    //     if (document.querySelector(targetSelector)) {
    //     observer.disconnect();
    //     }
    // });

    // observer.observe(document, { childList: true, subtree: true });
}

const topBar = document.createElement("div");
topBar.id = "top-bar";
chatContainer.appendChild(topBar);

const accessKey = document.createElement("input");
accessKey.id = "access-key";
accessKey.placeholder = "Access Key";
accessKey.value = localStorage.getItem("accessKey") || "access-key";
topBar.appendChild(accessKey);

const engineSelect = document.createElement("select");
engineSelect.id = "engine-select";
engineSelect.innerHTML = `
  <option value="" disabled>Select Engine</option>
  <option value="gpt3">GPT-3</option>
  <option value="gemini">Gemini Pro</option>
`;
topBar.appendChild(engineSelect);

const getAccessKey = document.createElement("a");
getAccessKey.id = "get-access-key";
getAccessKey.href = "https://github.com/sauravhathi/em#readme";
getAccessKey.target = "_blank";
getAccessKey.textContent = "Get Access Key";
topBar.appendChild(getAccessKey);

const chatMessages = document.createElement("div");
chatMessages.id = "chat-messages";
chatContainer.appendChild(chatMessages);

const userInput = document.createElement("div");
userInput.id = "user-input";
chatContainer.appendChild(userInput);

const inputField = document.createElement("textarea");
inputField.type = "text";
inputField.id = "message-input";
inputField.placeholder = "Type your message...";
inputField.scrollTo({
    top: chatMessages.scrollHeight,
    behavior: 'smooth',
});
userInput.appendChild(inputField);

const sendButton = document.createElement("button");
sendButton.id = "send-button";
sendButton.textContent = "Send";
userInput.appendChild(sendButton);

let loadingIndicator = `<div class="lds-ellipsis">
<div class="loading"></div>
<div class="loading"></div>
<div class="loading"></div>
</div>`;

function sendMessage() {
    const messageInput = document.getElementById("message-input");
    const message = messageInput.value.trim();
    if (message) {

        if (accessKey.value === "" || localStorage.getItem("accessKey") === "") {
            // toast("Please enter your access key", "error");
            return;
        }

        localStorage.setItem("accessKey", accessKey.value);

        const inputHeight = document.getElementById("message-input").scrollHeight;
        addChatMessage(message, true);
        messageInput.value = "";
        sendMessageToChatbot(message);
    }
}

inputField.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});

sendButton.addEventListener("click", () => {
    sendMessage();
});

let loading = false;

async function sendMessageToChatbot(message) {
    if (loading) {
        return;
    }

    if (accessKey.value === "") {
        // toast("Please enter your access key", "error");
        return;
    }

    loading = true;
    sendButton.disabled = true;
    inputField.disabled = true;

    const loadingDiv = document.createElement("div");
    loadingDiv.innerHTML = loadingIndicator;
    chatMessages.appendChild(loadingDiv);

    const apiUrl = "https://web-ai-beta.vercel.app/api/v1/completion";

    localStorage.setItem("accessKey", accessKey.value);

    const data = {
        prompt: message,
        engine: engineSelect.value,
        options: {
            comments: false,
            text: false
        }
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("accessKey")}`,
            },
            body: JSON.stringify(data),
        });

        if (response.status >= 400 && response.status < 600) {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }

        const responseData = await response.json();
        const botReply = responseData.data.output;
        addChatMessage(botReply, false);

        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth',
        });
    } catch (error) {
        // toast(error.message, "error");
        console.log(tempText);
        document.getElementById("message-input").value = tempText;
    } finally {
        loading = false;
        sendButton.disabled = false;
        inputField.disabled = false;

        loadingDiv.remove();

        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth',
        });
    }
}

function addChatMessage(message, isUser) {
    // document.querySelectorAll(".user-message").forEach((el) => el.remove());
    // document.querySelectorAll(".bot-message").forEach((el) => el.remove());
    const messageDiv = document.createElement("p");
    messageDiv.classList.add(isUser ? "user-message" : "bot-message");
    messageDiv.addEventListener("dblclick", () => {
        navigator.clipboard.writeText(message).then(() => { }, (err) => {
            console.error('Failed to copy: ', err);
        }
        );
    }
    );

    console.log(message);
    messageDiv.innerText = message.trim();
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth',
    });
}

watchForElement();