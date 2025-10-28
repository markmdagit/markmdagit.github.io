// --- Game State ---
let deck = [];
let gridPiles = new Array(10).fill(null); // Stores only the top card of each pile
let hand = new Array(5).fill(null);
let currentCard = null;
let selectedHandCardIndex = null;
let selectedGridCardIndex = null; // <-- NEW: To track selected grid card

// --- DOM Elements ---
const deckEl = document.getElementById('deck');
const deckCountEl = document.getElementById('deck-count');
const currentCardSpotEl = document.getElementById('current-card-spot');
const gridContainerEl = document.getElementById('grid-container');
const handContainerEl = document.getElementById('hand-container');
const restartButton = document.getElementById('restart-button');
const messageBox = document.getElementById('message-box');
const messageTitle = document.getElementById('message-title');
const messageText = document.getElementById('message-text');
const messageCloseButton = document.getElementById('message-close-button');

// --- Constants ---
const SUITS = ['♣', '♦', '♥', '♠'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const VALUES = { 'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'Free Card': 0 };

// --- Game Logic ---

/**
 * Creates a single card element
 */
function createCardElement(card) {
    if (!card) return null;

    const el = document.createElement('div');
    el.classList.add('card');

    let displayRank = card.rank;
    let displaySuit = card.suit;

    if (card.rank === 'Free Card') {
        el.classList.add('joker'); // Keep 'joker' class for styling
        el.innerHTML = `<span>FREE CARD</span>`;
    } else {
        if (card.suit === '♥' || card.suit === '♦') {
            el.classList.add('red');
        } else {
            el.classList.add('black');
        }

        el.innerHTML = `
            <span class="card-sm self-start">${displayRank} ${displaySuit}</span>
            <span>${displayRank}</span>
            <span class="card-sm self-end transform rotate-180">${displayRank} ${displaySuit}</span>
        `;
    }
    return el;
}

/**
 * Renders the entire game state to the DOM
 */
function updateUI() {
    // 1. Render Deck
    deckCountEl.textContent = deck.length;
    if (deck.length === 0) {
        deckEl.classList.remove('card-back', 'cursor-pointer');
        deckEl.classList.add('card-spot');
    } else {
        deckEl.classList.add('card-back', 'cursor-pointer');
        deckEl.classList.remove('card-spot');
    }

    // 2. Render Current Card
    currentCardSpotEl.innerHTML = ''; // Clear spot
    if (currentCard) {
        const cardEl = createCardElement(currentCard);
        cardEl.classList.add('selected'); // Show it's the active card
        currentCardSpotEl.appendChild(cardEl);
    } else {
        currentCardSpotEl.innerHTML = `<span>Draw</span>`;
        currentCardSpotEl.classList.add('card-spot');
    }

    // 3. Render Grid Piles
    gridContainerEl.innerHTML = '';
    gridPiles.forEach((card, index) => {
        const spotEl = document.createElement('div');
        spotEl.classList.add('card-spot');
        spotEl.dataset.index = index;

        if (card) {
            const cardEl = createCardElement(card);
            // NEW: Highlight selected grid card
            if (index === selectedGridCardIndex) {
                cardEl.classList.add('selected');
            }
            spotEl.innerHTML = ''; // Clear 'empty' text
            spotEl.appendChild(cardEl);
        }

        spotEl.addEventListener('click', () => onClickGridSpot(index));
        gridContainerEl.appendChild(spotEl);
    });

    // 4. Render Hand
    handContainerEl.innerHTML = '';
    hand.forEach((card, index) => {
        const spotEl = document.createElement('div');
        spotEl.classList.add('card-spot');
        spotEl.dataset.index = index;

        if (card) {
            const cardEl = createCardElement(card);
            if (index === selectedHandCardIndex) {
                cardEl.classList.add('selected');
            }
            spotEl.innerHTML = ''; // Clear 'empty' text
            spotEl.appendChild(cardEl);
        }

        spotEl.addEventListener('click', () => onClickHandSpot(index));
        handContainerEl.appendChild(spotEl);
    });

    // 5. Check Game State (Win/Loss)
    if (currentCard) {
        checkLossCondition();
    } else if (deck.length === 0 && hand.every(c => c === null)) {
        checkWinCondition();
    }
}

/**
 * Checks if a card can be placed on a pile
 */
function isValidMove(cardToPlay, pileCard) {
    // 1. Can always place on an empty spot (if moving from grid, pileCard can't be null)
    // But for deck/hand, this is true.
    if (!pileCard) {
        return true;
    }

    // 2. Jokers are wild
    if (cardToPlay.rank === 'Free Card' || pileCard.rank === 'Free Card') {
        return true;
    }

    // 3. Check sequence logic
    const vPlay = VALUES[cardToPlay.rank];
    const vPile = VALUES[pileCard.rank];

    // Ascending
    if (vPlay === vPile + 1) return true;
    // Descending
    if (vPlay === vPile - 1) return true;
    // Wrap-around (Ace on King)
    if (vPile === 13 && vPlay === 1) return true;
    // Wrap-around (King on Ace)
    if (vPile === 1 && vPlay === 13) return true;

    return false;
}

/**
 * Handles clicking on the draw deck
 */
function onDrawCard() {
    // Can't draw if a card is already waiting
    if (currentCard) return;
    // Can't draw if deck is empty
    if (deck.length === 0) return;

    currentCard = deck.pop();
    selectedHandCardIndex = null; // Deselect hand card
    selectedGridCardIndex = null; // <-- NEW: Deselect grid card
    updateUI();
}

/**
 * Handles clicking on one of the 10 grid spots
 */
function onClickGridSpot(index) {
    const pileCard = gridPiles[index];
    let cardToPlay = null;
    let isFromHand = false;
    let isFromGrid = false;

    // --- Part 1: Determine what card we are TRYING to play ---
    if (currentCard) {
        cardToPlay = currentCard;
    }
    else if (selectedHandCardIndex !== null) {
        cardToPlay = hand[selectedHandCardIndex];
        isFromHand = true;
    }
    else if (selectedGridCardIndex !== null) {
        // Prevent clicking the same card
        if (selectedGridCardIndex === index) {
            selectedGridCardIndex = null; // Deselect
            updateUI();
            return;
        }
        cardToPlay = gridPiles[selectedGridCardIndex];
        isFromGrid = true;
    }

    // --- Part 2: Try to PLAY a card ---
    if (cardToPlay) {
        // Check if the move is valid
        if (isValidMove(cardToPlay, pileCard)) {
            // Place the card
            gridPiles[index] = cardToPlay;

            // Clear the card's origin
            if (isFromHand) {
                hand[selectedHandCardIndex] = null;
                selectedHandCardIndex = null;
            } else if (isFromGrid) {
                gridPiles[selectedGridCardIndex] = null; // <-- NEW: Empty the grid spot it came from
                selectedGridCardIndex = null;
            } else {
                currentCard = null;
            }

            updateUI();
        }
    }
    // --- Part 3: If no card was to play, SELECT this spot ---
    else if (pileCard) { // Can only select a non-empty spot
        selectedGridCardIndex = index;
        selectedHandCardIndex = null; // Deselect hand
        updateUI();
    }
}

/**
 * Handles clicking on one of the 5 hand spots
 */
function onClickHandSpot(index) {
    const handCard = hand[index];

    // Case 1: Placing the Current Card into an empty hand spot
    if (currentCard && !handCard) {
        hand[index] = currentCard;
        currentCard = null;
        selectedGridCardIndex = null; // Deselect grid
        updateUI();
    }
    // Case 2: Selecting a hand card to play
    else if (!currentCard && handCard) {
        if (selectedHandCardIndex === index) {
            // Deselect if clicking the same card
            selectedHandCardIndex = null;
        } else {
            // Select a new card
            selectedHandCardIndex = index;
            selectedGridCardIndex = null; // <-- NEW: Deselect grid
        }
        updateUI();
    }
}

/**
 * Checks if the player has lost (no valid moves)
 */
function checkLossCondition() {
    if (!currentCard) return; // Not in a loss state if no card is drawn

    // Check if hand is full
    const handIsFull = hand.every(c => c !== null);
    if (!handIsFull) return; // Can still move to hand

    // Check if card can be placed on any grid pile
    const canPlaceOnGrid = gridPiles.some(pileCard => isValidMove(currentCard, pileCard));
    if (canPlaceOnGrid) return;

    // If hand is full AND card can't be placed on grid... GAME OVER
    showModal(
        'Game Over',
        'Your hand is full and you have no valid moves for the drawn card.'
    );
}

/**
 * Checks if the player has won
 */
function checkWinCondition() {
    if (deck.length === 0 && currentCard === null && hand.every(c => c === null)) {
        // NEW: Also check if grid is empty (or full, depending on goal)
        // For this game, the goal is just to clear the deck.
        showModal(
            'You Win!',
            'Congratulations! You successfully placed all 108 cards.'
        );
    }
}

/**
 * Shows the win/loss message box
 */
function showModal(title, text) {
    messageTitle.textContent = title;
    messageText.textContent = text;
    messageBox.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
}

/**
 * Hides the win/loss message box
 */
function hideModal() {
    messageBox.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
}

/**
 * Initializes the game state
 */
function startGame() {
    deck = [];
    gridPiles = new Array(10).fill(null);
    hand = new Array(5).fill(null);
    currentCard = null;
    selectedHandCardIndex = null;
    selectedGridCardIndex = null; // <-- NEW: Reset on start

    hideModal();

    // Create 2 decks of standard cards
    for (let i = 0; i < 2; i++) {
        for (const suit of SUITS) {
            for (const rank of RANKS) {
                deck.push({
                    suit: suit,
                    rank: rank,
                    value: VALUES[rank]
                });
            }
        }
    }

    // Add 4 Jokers
    for (let i = 0; i < 4; i++) {
        deck.push({
            suit: 'Free Card',
            rank: 'Free Card',
            value: VALUES['Free Card']
        });
    }

    // Shuffle the deck
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // Initial deal: 10 cards to the grid
    for(let i = 0; i < 10; i++) {
        gridPiles[i] = deck.pop();
    }

    updateUI();
}

// --- Event Listeners ---
deckEl.addEventListener('click', onDrawCard);
restartButton.addEventListener('click', startGame);
messageCloseButton.addEventListener('click', startGame);

// --- Start Game ---
startGame();
