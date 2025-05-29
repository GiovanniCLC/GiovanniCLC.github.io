document.addEventListener('DOMContentLoaded', () => {
    const chatLog = document.getElementById('chat-log');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const body = document.body;
    const themeIcon = themeToggleButton.querySelector('i'); // Pega o ícone dentro do botão

    // Função para aplicar o tema salvo ou o padrão do sistema
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            body.classList.remove('dark-mode');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }

    // Verifica se há um tema salvo no localStorage
    let currentTheme = localStorage.getItem('theme');

    // Se não houver tema salvo, verifica a preferência do sistema (opcional)
    if (!currentTheme) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            currentTheme = 'dark';
        } else {
            currentTheme = 'light'; // Padrão
        }
    }

    applyTheme(currentTheme); // Aplica o tema ao carregar a página

    // Event listener para o botão de alternar tema
    themeToggleButton.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            localStorage.setItem('theme', 'light');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    });

    // Função para adicionar mensagem ao log do chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        const p = document.createElement('p');
        p.textContent = text;
        messageDiv.appendChild(p);
        chatLog.appendChild(messageDiv);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    // Função para enviar mensagem
    async function sendMessage() {
        const userText = userInput.value.trim();
        if (userText === '') return;

        addMessage(userText, 'user');
        userInput.value = '';

        const thinkingMessageDiv = document.createElement('div');
        thinkingMessageDiv.classList.add('message', 'bot');
        const pThinking = document.createElement('p');
        pThinking.textContent = "Digitando...";
        thinkingMessageDiv.appendChild(pThinking);
        chatLog.appendChild(thinkingMessageDiv);
        chatLog.scrollTop = chatLog.scrollHeight;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userText }),
            });

            chatLog.removeChild(thinkingMessageDiv); // Remove o "Digitando..."

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ reply: `Erro HTTP ${response.status}` }));
                throw new Error(errorData.reply || errorData.error || `Erro ${response.status}`);
            }

            const data = await response.json();
            addMessage(data.reply, 'bot');

        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            if (chatLog.contains(thinkingMessageDiv)) { // Verifica se ainda existe antes de tentar remover
                 chatLog.removeChild(thinkingMessageDiv);
            }
            addMessage(`Desculpe, ocorreu um erro: ${error.message}`, 'bot');
        }
    }

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
});