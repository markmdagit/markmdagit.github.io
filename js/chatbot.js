document.addEventListener('DOMContentLoaded', function() {
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const ticketForm = document.getElementById('ticket-form');
    const impactSelect = document.getElementById('ticket-impact');
    const urgencySelect = document.getElementById('ticket-urgency');
    const prioritySelect = document.getElementById('ticket-priority');

    // Generate a unique ticket ID
    document.getElementById('ticket-id').value = `INC-${Date.now()}`;

    // --- Priority Matrix ---
    const priorityMatrix = {
        'High': { 'High': 'High', 'Medium': 'High', 'Low': 'Medium' },
        'Medium': { 'High': 'High', 'Medium': 'Medium', 'Low': 'Low' },
        'Low': { 'High': 'Medium', 'Medium': 'Low', 'Low': 'Low' }
    };

    function updatePriority() {
        const impact = impactSelect.value;
        const urgency = urgencySelect.value;
        prioritySelect.value = priorityMatrix[impact][urgency];
    }

    impactSelect.addEventListener('change', updatePriority);
    urgencySelect.addEventListener('change', updatePriority);

    // --- Chatbot Logic ---
    const questions = [
        {
            prompt: "To start, could I get your full name, please?",
            action: (value) => { document.getElementById('ticket-caller').value = value; }
        },
        {
            prompt: "Thanks, {name}! What is your email address?",
            action: (value) => { /* Not storing email in this version */ }
        },
        {
            prompt: "Perfect. Could you provide the asset tag or serial number of your device?",
            action: (value) => { document.getElementById('ticket-asset').value = value; }
        },
        {
            prompt: "Great. Please give me a short summary of the issue.",
            action: (value) => { document.getElementById('ticket-summary').value = value; }
        },
        {
            prompt: "Excellent. Now, please describe the issue in more detail.",
            action: (value) => { document.getElementById('ticket-description').value = value; }
        },
        {
            prompt: "Thank you for the detail. Which category best fits this issue?",
            options: ['Hardware', 'Software', 'Account', 'Network', 'Other'],
            action: (value) => { document.getElementById('ticket-category').value = value; }
        },
        {
            prompt: "Got it. I have created a ticket for you. Please review the details and click 'Create Ticket' to submit."
        }
    ];

    let currentQuestionIndex = 0;

    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);
        messageElement.textContent = message;
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function askQuestion() {
        const question = questions[currentQuestionIndex];
        let prompt = question.prompt;

        if (prompt.includes('{name}')) {
            const name = document.getElementById('ticket-caller').value;
            prompt = prompt.replace('{name}', name);
        }

        addMessage(prompt, 'bot');

        if (question.options) {
            const optionsContainer = document.createElement('div');
            optionsContainer.classList.add('chat-options');
            question.options.forEach(option => {
                const button = document.createElement('button');
                button.textContent = option;
                button.addEventListener('click', () => {
                    chatInput.value = option;
                    handleUserInput();
                    optionsContainer.remove();
                });
                optionsContainer.appendChild(button);
            });
            chatWindow.appendChild(optionsContainer);
        }
    }

    function handleUserInput() {
        const userInput = chatInput.value.trim();
        if (userInput === '') return;

        addMessage(userInput, 'user');
        chatInput.value = '';

        const question = questions[currentQuestionIndex];
        if (question.action) {
            question.action(userInput);
        }

        currentQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            askQuestion();
        }
    }

    chatSendBtn.addEventListener('click', handleUserInput);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleUserInput();
        }
    });

    // --- Form Submission ---
    ticketForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Ticket submitted successfully!');
        ticketForm.reset();
        document.getElementById('ticket-id').value = `INC-${Date.now()}`;

        // Reset chatbot
        currentQuestionIndex = 0;
        chatWindow.innerHTML = '';
        askQuestion();
    });

    // Start the conversation
    askQuestion();
});
