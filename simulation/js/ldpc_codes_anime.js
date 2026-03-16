// set of H matrices for LDPC codes

// const setOfH = [
//     [
//         [1, 0, 1, 0, 1],
//         [0, 1, 1, 1, 0],
//         [1, 1, 0, 1, 0],
//     ],
//     [
//         [1, 0, 1, 0, 1, 1, 0],
//         [0, 1, 1, 1, 0, 0, 1],
//         [1, 1, 0, 1, 0, 0, 0],
//     ],
//     [
//         [1, 0, 1, 0, 1, 1],
//         [1, 1, 0, 0, 0, 1],
//         [0, 1, 1, 1, 0, 0],
//         [0, 0, 0, 1, 1, 0],
//     ],
//     [
//         [0, 0, 1, 1, 0, 0, 0],
//         [1, 1, 0, 0, 1, 0, 0],
//         [0, 1, 1, 0, 0, 1, 0],
//         [1, 0, 0, 0, 0, 0, 1],
//     ],

// ];

// select a random H matrix

const rows = Math.floor(Math.random() * 3) + 3;
const cols = Math.floor(Math.random() * 3) + rows + 1;

const { setOfH, correctOption } = generateParityCheckMatrixOptions(rows, cols);
// const correctOption = Math.floor(Math.random() * setOfH.length);
const H = setOfH[correctOption];

// SVG dimensions
const width = 600;
const height = 400;
const nodeRadius = 10;
const bitXShiftLabel = 40;
const checkXShiftLabel = 15;
const yLabelShift = 5;

// Append an SVG element to the #sentCodeword element
const svg = d3.select("#tannerGraph")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Define layout variables
const bitNodeStartX = 100;
const bitNodeSpacingY = 80;
const checkNodeStartX = 500;
const checkNodeSpacingY = 100;
const verticalOffset = 50;

// Define variable nodes (bits) and check nodes (parity checks)
const bitNodes = H[0].map((_, j) => ({
    id: "x" + j,
    type: "x",
    x: bitNodeStartX,
    y: j * bitNodeSpacingY + verticalOffset
}));

const checkNodes = H.map((_, i) => ({
    id: "z" + i,
    type: "z",
    x: checkNodeStartX,
    y: i * checkNodeSpacingY + verticalOffset
}));

const nodes = [...bitNodes, ...checkNodes];


// Create links (edges) between bits and checks based on H matrix
const links = [];
H.forEach((row, i) => {
    row.forEach((val, j) => {
        if (val === 1) {
            links.push({ source: "x" + j, target: "z" + i });
        }
    });
});

// Add the links to the SVG
const link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("stroke-width", 2)
    .attr("stroke", "#999");

// Add the nodes to the SVG
const node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("r", nodeRadius)
    .attr("fill", d => d.type === "x" ? "blue" : "green")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

// Add labels for the nodes
const labels = svg.append("g")
    .attr("class", "labels")
    .selectAll("text")
    .data(nodes)
    .enter().append("text")
    .attr("x", d => d.type === "x" ? d.x - nodeRadius - bitXShiftLabel : d.x + nodeRadius + checkXShiftLabel) // Shift labels based on node type
    .attr("y", d => d.y + yLabelShift)
    .text(d => d.id);

// Update the positions of the links
function updateLinks() {
    link.attr("x1", d => bitNodes.find(n => n.id === d.source).x)
        .attr("y1", d => bitNodes.find(n => n.id === d.source).y)
        .attr("x2", d => checkNodes.find(n => n.id === d.target).x)
        .attr("y2", d => checkNodes.find(n => n.id === d.target).y);
}

// Drag behavior functions
function dragstarted(event, d) {
    if (!event.active) {
        d3.select(this).raise().attr("stroke", "black");
    }
}

function dragged(event, d) {
    // Update x and y positions freely as the node is dragged
    d.x = event.x;
    d.y = event.y;

    // Update node positions
    d3.select(this)
        .attr("cx", d.x)
        .attr("cy", d.y);

    // Update labels positions
    labels.filter(l => l.id === d.id)
        .attr("x", d.type === "x" ? d.x - nodeRadius - bitXShiftLabel : d.x + nodeRadius + checkXShiftLabel)
        .attr("y", d.y + yLabelShift);

    // Update the links connected to this node
    updateLinks();
}

function dragended(event, d) {
    d3.select(this).attr("stroke", null);
}

function adjustSVGSize() {
    // Get minimum and maximum x and y coordinates of the nodes
    const xValues = nodes.map(d => d.x);
    const yValues = nodes.map(d => d.y);

    const minX = Math.min(...xValues) - nodeRadius;
    const maxX = Math.max(...xValues) + nodeRadius;
    const minY = Math.min(...yValues) - nodeRadius;
    const maxY = Math.max(...yValues) + nodeRadius;

    // Calculate the width and height of the bounding box around the nodes
    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;

    // Ensure minimum SVG dimensions (so it doesn't shrink too much)
    const newWidth = Math.max(graphWidth, width);
    const newHeight = Math.max(graphHeight, height);

    // Calculate the offset to center the graph
    const offsetX = (newWidth - graphWidth) / 2;
    const offsetY = (newHeight - graphHeight) / 2;

    // Adjust the SVG width and height based on new dimensions
    svg.attr("width", newWidth).attr("height", newHeight);

    // Translate all elements to center the graph within the viewBox
    svg.attr("viewBox", `${minX - offsetX} ${minY - offsetY} ${newWidth} ${newHeight}`);
}


// Other three options that are not the chosen H matrix
const incorrectOptions = setOfH.filter(h => !arraysEqual(h, H)).slice(0, 3);

// Helper function to compare two arrays
function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i].length !== b[i].length) return false;
        for (let j = 0; j < a[i].length; j++) {
            if (a[i][j] !== b[i][j]) return false;
        }
    }
    return true;
}

// Function to create and add options to the form
function addOptionsToForm() {
    // Helper function to convert matrix to LaTeX
    function matrixToLatex(matrix) {
        return '\\begin{bmatrix}' + matrix.map(row => row.join(' & ')).join(' \\\\ ') + '\\end{bmatrix}';
    }

    // Define all options (correct and incorrect) without labeling correctness
    const options = [
        { id: 'option0', value: 'Matrix Option 0', matrix: H },
        ...incorrectOptions.map((h, index) => ({
            id: `option${index + 1}`,
            value: `Matrix Option ${index + 1}`,
            matrix: h
        }))
    ];

    // Get the form element
    const form = document.getElementById('form1');

    // Create and append options
    options.forEach(option => {
        // Create a div to contain the radio button and matrix
        const div = document.createElement('div');
        div.className = 'option';

        // Create the radio button
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'hMatrix'; // Make sure all options have the same name
        radio.id = option.id;
        radio.value = option.value;

        // Create a label for the radio button
        const label = document.createElement('label');
        label.htmlFor = option.id;
        label.style.display = 'flex';

        // Create a div for the matrix
        const matrixDiv = document.createElement('div');
        matrixDiv.className = 'matrix';
        matrixDiv.innerHTML = `$$${matrixToLatex(option.matrix)}$$`;

        // Append radio button and matrix to the label
        label.appendChild(radio);
        label.appendChild(matrixDiv);

        // Append the label to the div
        div.appendChild(label);

        // Append the div to the form
        form.appendChild(div);
    });

    // Render the MathJax content
    // MathJax.typeset();
}

// Call the function to add options to the form
addOptionsToForm();

// Initial call to update links based on static positions
updateLinks();
adjustSVGSize();



function generateParityCheckMatrix(rows, cols, maxOnesPerRow = 3) {
    // const k = Math.floor(rate * n);
    // const rows = n - k;
    // const cols = n;

    // const maxOnesPerRow = Math.floor(cols / 4);

    let H = Array.from({ length: rows }, () => Array(cols).fill(0));

    for (let i = 0; i < rows; i++) {
        let onesPositions = new Set();
        while (onesPositions.size < maxOnesPerRow) {
            let randCol = Math.floor(Math.random() * cols);
            onesPositions.add(randCol);
        }

        for (let pos of onesPositions) {
            H[i][pos] = 1;
        }
    }

    // ensure that each column has at least one 1

    for (let j = 0; j < cols; j++) {
        let ones = H.map((row) => row[j]);
        if (!ones.includes(1)) {
            let randRow = Math.floor(Math.random() * rows);
            H[randRow][j] = 1;
        }
    }

    return H;
}


// output set of H matrices for LDPC codes
function generateParityCheckMatrixOptions(rows, cols, maxOnesPerRow = 3) {
    const NUM_OPTIONS = 4;
    const setOfH = [];
    let correctOption = Math.floor(Math.random() * NUM_OPTIONS);
    for (let i = 0; i < NUM_OPTIONS; i++) {
        setOfH.push(generateParityCheckMatrix(rows, cols, maxOnesPerRow));
    }

    // if the correct option is same as any other option, regenerate the incorrect option
    for (let i = 0; i < NUM_OPTIONS; i++) {
        if (i !== correctOption && arraysEqual(setOfH[i], setOfH[correctOption])) {
            setOfH[i] = generateParityCheckMatrix(rows, cols, maxOnesPerRow);
        }
    }

    return { setOfH, correctOption };
}

function submit() {
    tannerGraphQuestion = document.getElementById("tannerGraphQuestion");
    tannerQuestionObservation = document.getElementById("tannerQuestionObservation");

    correctPrompt = "Great job! You've selected the correct parity check matrix for the Tanner graph.";
    incorrectPrompt = "No, that's not the right matrix. Please review your choice and try again.";
    wrongAgainPrompt = "Oops! You've chosen the wrong option again. Please review your choice and try again.";

    const form = document.getElementById('form1');
    const selectedOption = Array.from(form.elements).find(el => el.checked);

    if (tannerQuestionObservation.innerHTML == incorrectPrompt) {
        tannerQuestionObservation.innerHTML = wrongAgainPrompt;
        tannerQuestionObservation.style.color = "red";
    }
    else if (selectedOption && selectedOption.value === `Matrix Option ${correctOption + 1}`) {
        tannerQuestionObservation.innerHTML = correctPrompt;
        tannerQuestionObservation.style.color = "green";
    } else {
        tannerQuestionObservation.innerHTML = incorrectPrompt;
        tannerQuestionObservation.style.color = "red";
    }

}


// ... [Previous code remains the same up to the adjustSVGSize() function] ...

// Add this new function for animation
function animateMessagePassing() {
    const duration = 1000; // Duration for each animation step
    const messageRadius = 5;
    const iterations = 2;

    function varToCheck(iteration, callback) {
        links.forEach((link, index) => {
            setTimeout(() => {
                const message = svg.append("circle")
                    .attr("r", messageRadius)
                    .attr("fill", "yellow");

                const sourceNode = nodes.find(n => n.id === link.source);
                const targetNode = nodes.find(n => n.id === link.target);

                anime({
                    targets: message.node(),
                    cx: [sourceNode.x, targetNode.x],
                    cy: [sourceNode.y, targetNode.y],
                    duration: duration,
                    easing: 'easeInOutQuad',
                    complete: () => message.remove()
                });

                // Highlight the edge
                d3.select(`line[source="${link.source}"][target="${link.target}"]`)
                    .attr("stroke", "yellow")
                    .attr("stroke-width", 3)
                    .transition()
                    .duration(duration)
                    .attr("stroke", "#999")
                    .attr("stroke-width", 2);

            }, index * duration);
        });

        setTimeout(callback, links.length * duration);
    }

    function checkToVar(iteration, callback) {
        links.forEach((link, index) => {
            setTimeout(() => {
                const message = svg.append("circle")
                    .attr("r", messageRadius)
                    .attr("fill", "green");

                const sourceNode = nodes.find(n => n.id === link.source);
                const targetNode = nodes.find(n => n.id === link.target);

                anime({
                    targets: message.node(),
                    cx: [targetNode.x, sourceNode.x],
                    cy: [targetNode.y, sourceNode.y],
                    duration: duration,
                    easing: 'easeInOutQuad',
                    complete: () => message.remove()
                });

                // Highlight the edge
                d3.select(`line[source="${link.source}"][target="${link.target}"]`)
                    .attr("stroke", "green")
                    .attr("stroke-width", 3)
                    .transition()
                    .duration(duration)
                    .attr("stroke", "#999")
                    .attr("stroke-width", 2);

            }, index * duration);
        });

        setTimeout(callback, links.length * duration);
    }

    function runIteration(iteration) {
        if (iteration < iterations) {
            varToCheck(iteration, () => {
                checkToVar(iteration, () => {
                    runIteration(iteration + 1);
                });
            });
        } else {
            showCompletionMessage();
        }
    }

    function showCompletionMessage() {
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .attr("fill", "green")
            .text("Message Passing Complete")
            .style("font-size", "20px")
            .style("font-weight", "bold");
    }

    runIteration(0);
}

animateMessagePassing();