/**
 * LDPC Peeling Decoder Interactive Simulation
 *
 * This script performs the following steps:
 * 1.  Sets up an LDPC code by selecting a predefined parity-check matrix (H)
 * and deriving its generator matrix (G).
 * 2.  Generates a random message, encodes it into a codeword, and simulates
 * erasures by replacing some bits with '?'.
 * 3.  Uses D3.js to render a Tanner graph, a visual representation of the code,
 * with variable nodes (circles) and check nodes (squares).
 * 4.  Correctly calculates and displays the initial values of the check nodes
 * based on the known (non-erased) variable nodes.
 * 5.  Creates an interactive quiz that randomly asks the user to identify
 * the correct messages being passed in one of two directions:
 * a) Check-to-Variable (recovery step)
 * b) Variable-to-Check (update step)
 * 6.  Provides feedback on the user's answer, explaining the core principles
 * of the peeling decoder.
 */

// --- 1. LDPC Code Setup ---

const predefinedParityCheckMatrices = [
    {
        H: [
            [1, 1, 0, 1, 1, 0, 0],
            [1, 0, 1, 0, 0, 1, 0],
            [0, 1, 1, 1, 0, 0, 1],
        ],
        k: 4,
        n: 7,
    },
    {
        H: [
            [1, 0, 1, 1, 1, 0, 0],
            [0, 1, 1, 0, 0, 1, 0],
            [1, 1, 0, 0, 0, 0, 1],
        ],
        k: 4,
        n: 7,
    },
    {
        H: [
            [0, 1, 1, 0, 1, 0, 0],
            [1, 0, 1, 1, 0, 1, 0],
            [1, 1, 0, 0, 0, 0, 1],
        ],
        k: 4,
        n: 7,
    },
    {
        H: [
            [1, 0, 0, 1, 1, 0, 0],
            [0, 1, 0, 1, 0, 1, 0],
            [1, 1, 1, 0, 0, 0, 1],
        ],
        k: 4,
        n: 7,
    },
];

/**
 * Computes the generator matrix G from a systematic parity-check matrix H.
 * H is assumed to be in the form [P^T | I], so G = [I | P].
 * @param {number[][]} H - The parity-check matrix.
 * @param {number} k - The message length.
 * @param {number} n - The codeword length.
 * @returns {number[][]} The generator matrix G.
 */
function getGeneratorMatrix(H, k, n) {
    const rows = H.length;
    const PTranspose = H.map(row => row.slice(0, k));
    const P = Array.from({ length: k }, (_, i) =>
        Array.from({ length: rows }, (_, j) => PTranspose[j][i])
    );
    const identityK = Array.from({ length: k }, (_, i) =>
        Array.from({ length: k }, (_, j) => (i === j ? 1 : 0))
    );
    return identityK.map((row, i) => [...row, ...P[i]]);
}

/**
 * Selects a random H matrix and computes its corresponding G matrix.
 * @returns {object} An object containing the generator and parity-check matrices.
 */
function generateLDPCMatrices() {
    const randomIndex = Math.floor(Math.random() * predefinedParityCheckMatrices.length);
    const { H, k, n } = predefinedParityCheckMatrices[randomIndex];
    const G = getGeneratorMatrix(H, k, n);
    return {
        generatorMatrix: G,
        parityCheckMatrix: H,
    };
}

const { generatorMatrix: G, parityCheckMatrix: H } = generateLDPCMatrices();

// --- 2. Message Encoding and Error Simulation ---

/**
 * Generates a random binary message of length k.
 * @param {number} k - The length of the message.
 * @returns {number[]} The random message vector.
 */
function generateRandomMessage(k) {
    return Array.from({ length: k }, () => Math.floor(Math.random() * 2));
}

/**
 * Encodes a message using the generator matrix G.
 * @param {number[]} message - The message vector.
 * @param {number[][]} G - The generator matrix.
 * @returns {number[]} The resulting codeword.
 */
function encodeMessage(message, G) {
    const n = G[0].length;
    const codeword = new Array(n).fill(0);
    for (let j = 0; j < n; j++) {
        for (let i = 0; i < message.length; i++) {
            codeword[j] = (codeword[j] + message[i] * G[i][j]) % 2;
        }
    }
    return codeword;
}

/**
 * Introduces erasures ('?') into a codeword to simulate a noisy channel.
 * @param {number[]} codeword - The original codeword.
 * @param {number} errorRate - The probability of a bit being erased.
 * @returns {string[]} The received word with erasures.
 */
function introduceErrors(codeword, errorRate = 0.3) {
    const corrupted = codeword.map(bit => Math.random() < errorRate ? '?' : bit.toString());
    // Ensure at least one error is present for the quiz to be meaningful
    if (!corrupted.includes('?')) {
        const randomIndex = Math.floor(Math.random() * codeword.length);
        corrupted[randomIndex] = '?';
    }
    return corrupted;
}

const message = generateRandomMessage(G.length);
const codeword = encodeMessage(message, G);
const receivedWord = introduceErrors(codeword);


// --- 3. Tanner Graph Visualization with D3.js ---

// SVG dimensions and layout constants
const width = 600;
const height = 400;
const nodeRadius = 10;
const bitXShiftLabel = 100;
const checkXShiftLabel = 15;
const yLabelShift = -10;
const bitNodeStartX = 100;
const bitNodeSpacingY = 80;
const checkNodeStartX = 500;
const checkNodeSpacingY = 100;
const verticalOffset = 50;

// Append SVG to the designated container
const svg = d3.select("#tannerGraph")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Create data structures for nodes and links
let bitNodes = H[0].map((_, j) => ({
    id: "x" + j,
    type: "x",
    x: bitNodeStartX,
    y: j * bitNodeSpacingY + verticalOffset,
    peeled: false,
    value: receivedWord[j],
}));

let checkNodes = H.map((_, i) => ({
    id: "z" + i,
    type: "z",
    x: checkNodeStartX,
    y: i * checkNodeSpacingY + verticalOffset,
    peeled: false,
    value: 0, // Initialize value to 0, will be calculated next
}));

let nodes = [...bitNodes, ...checkNodes];
let currentDirection = Math.random() < 0.5 ? 'check-to-bit' : 'bit-to-check';

let links = [];
H.forEach((row, i) => {
    row.forEach((val, j) => {
        if (val === 1) {
            links.push({
                source: "x" + j,
                target: "z" + i,
                // Dotted lines for known bits, solid for erased
                isDotted: bitNodes[j].value !== '?' && currentDirection === 'check-to-bit'
            });
        }
    });
});

// Draw links (edges)
svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("x1", d => bitNodes.find(n => n.id === d.source).x)
    .attr("y1", d => bitNodes.find(n => n.id === d.source).y)
    .attr("x2", d => checkNodes.find(n => n.id === d.target).x)
    .attr("y2", d => checkNodes.find(n => n.id === d.target).y)
    .attr("stroke-width", 2)
    .attr("stroke", "#999")
    .style("stroke-dasharray", d => d.isDotted ? "5,5" : "none");

// Draw nodes (circles for bits, squares for checks)
svg.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .enter()
    .append(d => document.createElementNS("http://www.w3.org/2000/svg", d.type === "x" ? "circle" : "rect"))
    .attr("r", d => d.type === "x" ? nodeRadius : null)
    .attr("width", d => d.type === "z" ? nodeRadius * 2 : null)
    .attr("height", d => d.type === "z" ? nodeRadius * 2 : null)
    .attr("fill", d => d.type === "x" ? "blue" : "green")
    .attr("cx", d => d.type === "x" ? d.x : null)
    .attr("cy", d => d.type === "x" ? d.y : null)
    .attr("x", d => d.type === "z" ? d.x - nodeRadius : null)
    .attr("y", d => d.type === "z" ? d.y - nodeRadius : null);

// --- 4. Calculate and Display Initial Node Values ---

// Calculate the initial value of each check node based on its known neighbors
checkNodes.forEach(checkNode => {
    const connectedKnownBits = links
        .filter(link => link.target === checkNode.id)
        .map(link => bitNodes.find(n => n.id === link.source))
        .filter(node => node.value !== '?');

    let partialSum = 0;
    connectedKnownBits.forEach(bit => {
        partialSum ^= parseInt(bit.value);
    });

    checkNode.value = currentDirection === 'check-to-bit' ? partialSum : 0;
});

// Draw labels with correct initial values
svg.append("g")
    .attr("class", "labels")
    .selectAll("foreignObject")
    .data(nodes)
    .enter()
    .append("foreignObject")
    .attr("x", d => d.type === "x" ? d.x - nodeRadius - bitXShiftLabel : d.x + nodeRadius + checkXShiftLabel)
    .attr("y", d => d.y + yLabelShift)
    .attr("width", 100)
    .attr("height", 30)
    .append("xhtml:div")
    .style("font-size", "15px")
    .html(d => {
        const sub = d.id.slice(1);
        const displayValue = (d.type === 'z' && currentDirection !== 'check-to-bit') ? '0' : d.value;
        return `\\(${d.id[0]}_{${sub}}: ${displayValue}\\)`;
    });


// --- 5. Interactive Quiz Logic ---


// Helper utility functions
function insertUndcore(str) { return str[0] + '_' + str.slice(1); }

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateInvalidMessages(count) {
    const invalidMessages = [];
    let attempts = 0;
    while (invalidMessages.length < count && attempts < 20) {
        const bitNode = bitNodes[Math.floor(Math.random() * bitNodes.length)];
        const checkNode = checkNodes[Math.floor(Math.random() * checkNodes.length)];
        const linkExists = links.some(link => link.source === bitNode.id && link.target === checkNode.id);
        if (!linkExists) {
            invalidMessages.push({
                message: `\\(\\mu_{${insertUndcore(bitNode.id)}\\to ${insertUndcore(checkNode.id)}} = ${Math.floor(Math.random() * 2)}\\)`
            });
        }
        attempts++;
    }
    return invalidMessages;
}

function ensureNonEmpty(messages) {
    if (messages.length === 0) {
        messages.push(...generateInvalidMessages(1));
        if (messages.length === 0) {
            messages.push({ message: "No valid messages found." });
        }
    }
}

/**
 * Determines the correct messages from Check Nodes to Bit Nodes.
 * This is the "recovery" step of the peeling decoder.
 * @returns {object} An object indicating if messages were found and the messages themselves.
 */
function getCheckToBitMessages() {
    let messages = [];
    let foundMessage = false;

    checkNodes.forEach(checkNode => {
        if (checkNode.peeled) return;

        const connectedBitNodes = links
            .filter(link => link.target === checkNode.id)
            .map(link => bitNodes.find(n => n.id === link.source))
            .filter(node => !node.peeled);

        const erasedBitNodes = connectedBitNodes.filter(node => node.value === '?');

        if (erasedBitNodes.length === 1) {
            foundMessage = true;
            const erasedNode = erasedBitNodes[0];
            const messageValue = checkNode.value;
            messages.push({
                message: `\\(\\mu_{${insertUndcore(checkNode.id)}\\to ${insertUndcore(erasedNode.id)}} = ${messageValue}\\)`
            });
        }
    });

    return { found: foundMessage, messages };
}

/**
 * ### FUNCTION UPDATED ###
 * Determines the correct messages from Bit Nodes to Check Nodes.
 * This is the "update" step. All known variable nodes send their value
 * to all their neighbors.
 * @returns {object} An object indicating if messages were found and the messages themselves.
 */
function getBitToCheckMessages() {
    let messages = [];
    let foundMessage = false;

    bitNodes.forEach(bitNode => {
        // A message is sent if the variable node's value is known
        if (bitNode.value !== '?') {
            foundMessage = true;
            const connectedCheckNodes = links
                .filter(link => link.source === bitNode.id)
                .map(link => checkNodes.find(n => n.id === link.target));

            connectedCheckNodes.forEach(checkNode => {
                messages.push({
                    message: `\\(\\mu_{${insertUndcore(bitNode.id)}\\to ${insertUndcore(checkNode.id)}} = ${bitNode.value}\\)`
                });
            });
        }
    });
    return { found: foundMessage, messages };
}


/**
 * ### FUNCTION UPDATED ###
 * Generates the multiple-choice quiz options and displays them in the form.
 */
function generateMessageOptions() {
    const form = document.getElementById('form1');
    form.innerHTML = '';
    const questionPrompt = document.getElementById('awgnTopQuestion');

    let options = [];
    let correctMessages;

    if (currentDirection === 'check-to-bit') {
        questionPrompt.innerHTML = `Consider the Tanner graph below. Messages are being passed from <b>check nodes (right) to variable nodes (left)</b>. Identify the messages in this round by selecting the correct option.`;
        correctMessages = getCheckToBitMessages();

        options.push({ id: 'correct', messages: correctMessages.found ? correctMessages.messages : [{ message: "No recovery is possible in this step." }] });

        const wrongDirection = getBitToCheckMessages();
        ensureNonEmpty(wrongDirection.messages);
        options.push({ id: 'wrong-direction', messages: wrongDirection.messages });

        let invalidDegreeMessages = [];
        checkNodes.forEach(node => {
            if (!node.peeled) {
                const erasedCount = links.filter(link => link.target === node.id && bitNodes.find(n => n.id === link.source).value === '?').length;
                if (erasedCount > 1) {
                    const bitNodeId = links.find(link => link.target === node.id).source;
                    invalidDegreeMessages.push({ message: `\\(\\mu_{${insertUndcore(node.id)}\\to ${insertUndcore(bitNodeId)}} = ${Math.floor(Math.random()*2)}\\)` });
                }
            }
        });
        ensureNonEmpty(invalidDegreeMessages);
        options.push({ id: 'invalid-degree', messages: invalidDegreeMessages });

    } else { // bit-to-check
        questionPrompt.innerHTML = `Consider the Tanner graph below. Messages are being passed from <b>variable nodes (left) to check nodes (right)</b>. Identify the messages in this round by selecting the correct option.`;
        correctMessages = getBitToCheckMessages(); // This now returns correct messages

        // The correct answer option
        options.push({ id: 'correct', messages: correctMessages.found ? correctMessages.messages : [{ message: "No updates can be sent." }] });

        // Distractor: The messages for the wrong direction (recovery)
        const wrongDirection = getCheckToBitMessages();
        ensureNonEmpty(wrongDirection.messages);
        options.push({ id: 'wrong-direction', messages: wrongDirection.messages });

        // Distractor: A message from an erased ('?') node, which is invalid
        let invalidSourceMessages = [];
        const erasedNode = bitNodes.find(node => node.value === '?');
        if (erasedNode) {
            const connection = links.find(link => link.source === erasedNode.id);
            if (connection) {
                invalidSourceMessages.push({ message: `\\(\\mu_{${insertUndcore(erasedNode.id)}\\to ${insertUndcore(connection.target)}} = ${Math.floor(Math.random()*2)}\\)` });
            }
        }
        ensureNonEmpty(invalidSourceMessages);
        options.push({ id: 'invalid-source', messages: invalidSourceMessages });
    }

    // Add a generic "No message sent" distractor
    options.push({ id: 'no-message', messages: [{ message: "No message will be sent." }] });

    const shuffledOptions = shuffleArray(options);
    shuffledOptions.forEach((option) => {
        const div = document.createElement('div');
        div.className = 'option';
        div.style.paddingTop = '0.4em';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'message-set';
        radio.id = option.id;
        const label = document.createElement('label');
        label.htmlFor = option.id;
        label.innerHTML = `<span>${option.messages.map(msg => msg.message).join(', ')}</span>`;
        div.appendChild(radio);
        div.appendChild(label);
        form.appendChild(div);
    });

    if (typeof MathJax !== 'undefined') {
        MathJax.typesetPromise();
    }
}

// --- 6. UI Event Handlers ---

/**
 * ### FUNCTION UPDATED ###
 * Handles the "Submit" button click, checks the answer, and provides feedback.
 */
function NextRound() {
    const observation = document.getElementById("tannerQuestionObservation");
    const form = document.getElementById('form1');
    const selectedOption = Array.from(form.elements).find(el => el.checked);

    if (!selectedOption) {
        observation.innerHTML = "Please select an option before proceeding.";
        observation.style.color = "red";
        return;
    }

    if (selectedOption.id === 'correct') {
        observation.innerHTML = "Correct! You've identified the right message passing direction and conditions.";
        observation.style.color = "green";
    } else {
        let feedback = "Incorrect. ";
        if (selectedOption.id === 'wrong-direction') {
            const dir = currentDirection === 'check-to-bit' ? 'check nodes (right) to variable nodes (left)' : 'variable nodes (left) to check nodes (right)';
            feedback += `Remember the question asked for messages from <b>${dir}</b>.`;
        } else if (currentDirection === 'check-to-bit' && selectedOption.id === 'invalid-degree') {
            feedback += "A check node can only resolve a bit's value if it's connected to exactly one unknown bit."
        } else if (currentDirection === 'bit-to-check') {
            // Corrected feedback for the bit-to-check direction
            feedback += "In the update step, messages are sent from all *known* variable nodes (those not marked with '?')."
        } else {
            feedback += "Please review the conditions for message passing."
        }
        observation.innerHTML = feedback;
        observation.style.color = "red";
    }
}

/**
 * Handles the "Reset" button click, reloading the page for a new problem.
 */
function Reset() {
    document.getElementById("tannerQuestionObservation").innerHTML = "";
    location.reload();
}

// --- Initial Execution ---
generateMessageOptions();