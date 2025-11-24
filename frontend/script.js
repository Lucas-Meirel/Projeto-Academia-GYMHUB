const chat = document.getElementById('chat-container')
chat.style.visibility = 'hidden'
document.getElementById('whatsapp-button').addEventListener('click', function () {
    if (chat.style.visibility == 'visible') {
        chat.style.visibility = 'hidden'
    } else {
        chat.style.visibility = 'Visible'
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const chatLog = document.getElementById("chat-log");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

    async function sendMessage() {
        const message = userInput.value.trim();
        if (message === "") return;
        addMessageToLog("Você", message);
        userInput.value = "";
        try {
                const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: message }),
            });

            if (!response.ok) {
                throw new Error('Erro na resposta da API');
            }
            const data = await response.json();
            addMessageToLog("Gemini", data.text);
        } catch (error) {
            console.error("Erro:", error);
            addMessageToLog("Erro", "Não foi possível conectar ao bot.");
        }
    }

    function addMessageToLog(sender, message) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        if (sender === "Você") {
            messageElement.classList.add("user-message");
        } else {
            messageElement.classList.add("bot-message");
        }
        const senderStrong = document.createElement("strong");
        senderStrong.textContent = `${sender}: `;
        const messageText = document.createTextNode(message);
        messageElement.appendChild(senderStrong);
        messageElement.appendChild(messageText);
        chatLog.appendChild(messageElement);
        chatLog.scrollTop = chatLog.scrollHeight;
    }
});