{
    /**
     * The original spinner code comes from
     * https://gist.github.com/bencentra/5790501
     */

    const SVG_NS = "http://www.w3.org/2000/svg";
    const CIRCLE_RADIUS = 200;

    const COLORS = {
        LION:  "rgb(99.2%, 72.2%, 13.7%)",
        TIGER: "rgb(96.9%, 55.3%, 17.6%)",
        WOLF:  "rgb(92.9%, 10.2%, 22.7%)",
        BEAR:  "rgb(59.2%, 83.5%, 78.4%)",
        SIGN:  "white",
    };

    const RANKS = Object.keys(COLORS);
//    const NUM_SLICES = 4 * RANKS.length;
    const NUM_SLICES = 18;

    let slices = []; // Array of wheel slice objects
    let isSpinning = false; // Is the arrow spinning?
    let rotation = 0; // Arrow rotation
    let currentSlice = 0; // Current slice the arrow is over
    let arrowDomEl; // DOM Object for the spinner arrow
    let spinnerDomEl; // DOM Object for the svg container
    let spinButtonDomEl; // DOM Object for the spin wheel <button>

    let imgActionDomEl;

    // Basic wheel "slice" object for drawing SVG
    function Slice(num, parent) {
        // Select the next rank in the cycle.
        this.rank = RANKS[num % RANKS.length];

        // Set instance vars
        this.parent = parent;
        this.id = "slice_" + this.rank + "_" + num;

        let size = 360/NUM_SLICES;
        let offset = num * size;

        let x1 = Math.floor(CIRCLE_RADIUS + 180 * Math.cos(Math.PI * (-90 + offset       )/180));
        let y1 = Math.floor(CIRCLE_RADIUS + 180 * Math.sin(Math.PI * (-90 + offset       )/180));
        let x2 = Math.floor(CIRCLE_RADIUS + 180 * Math.cos(Math.PI * (-90 + offset + size)/180));
        let y2 = Math.floor(CIRCLE_RADIUS + 180 * Math.sin(Math.PI * (-90 + offset + size)/180));

        //
        // Draw the object
        //

        // Create a group to store the slice in
        this.object = document.createElementNS(SVG_NS, "g");

        // Create the slice object
        let slice = document.createElementNS(SVG_NS, "path");
        slice.setAttributeNS(null, "id", this.id);

        /**
         * The path draw command is essentially:
         *  M - move to circle center
         *  L - draw a radial line outward to the first (clockwise) arc endpoint
         *  A - draw minor arc
         *  Z - close the path (return to center)
         */
        slice.setAttributeNS(null, "d", `M ${CIRCLE_RADIUS} ${CIRCLE_RADIUS} L ${x1} ${y1} A 180 180 0 0 1 ${x2} ${y2} Z`);

        // Randomize the color of the slice and finish styling
        slice.setAttributeNS(null, "fill", COLORS[this.rank]);

        // Add the slice to the group
        this.object.appendChild(slice);

        // Create the highlight for the slice
        let overlay = document.createElementNS(SVG_NS, "path");
        overlay.setAttributeNS(null, "d", `M ${CIRCLE_RADIUS} ${CIRCLE_RADIUS} L ${x1} ${y1} A 180 180 0 0 1 ${x2} ${y2} Z`);
        overlay.setAttributeNS(null, "class", "section-highlight");
        overlay.setAttributeNS(null, "opacity", "0");

        // Add the highlight for the slice to the group
        this.object.appendChild(overlay);

        this.parent.appendChild(this.object);
    }
    Slice.prototype = {
        toggleOverlay: function() {
            let overlay = this.object.childNodes[1];
            if (overlay.getAttribute("opacity") === "0") {
                overlay.setAttributeNS(null, "opacity", "1");
            } else {
                overlay.setAttributeNS(null, "opacity", "0");
            }
        }
    };

    // Toggle the spinning of the wheel
    function toggleSpinning() {
        // Toggle the spinning animation
        if (isSpinning) {
            // Stop the arrow
            isSpinning = false;
            clearInterval(toggleSpinning.spinInt);
            spinButtonDomEl.removeAttribute("disabled");
        } else {
            // Start spinning the arrow
            isSpinning = true;
//            toggleSpinning.spinInt = setInterval(spinWheel, 1000/60);
            toggleSpinning.spinInt = setInterval(spinWheel, 55); // smaller is faster
            // Set how long the wheel will be spinning
            let duration = Math.floor(Math.random() * 2000) + 1000;
            setTimeout(toggleSpinning, duration);
            // Disable the spin button
            spinButtonDomEl.setAttribute("disabled", "true");
        }
    }

    // Animation step for spinning the wheel arrow
    function spinWheel () {
        // Rotate the spinner arrow
        rotation = (rotation + 12) % 360;
        arrowDomEl.setAttributeNS(null, "transform", `rotate(${rotation},${CIRCLE_RADIUS},${CIRCLE_RADIUS})`);

        // Highlight the slice the arrow is above
        let newSlice = Math.floor(rotation / (360/NUM_SLICES));
        if (newSlice != currentSlice) {
            slices[currentSlice].toggleOverlay();
            imgActionDomEl.src = "../images/" + slices[newSlice].rank.toLowerCase() + ".png";
            slices[newSlice].toggleOverlay();
            currentSlice = newSlice;
        }
    }

    // Document ready event
    document.addEventListener("DOMContentLoaded", () => {
        // Get a handle to all necessary DOM elements
        const wheelDomEl = document.getElementById("spinner-board"); // DOM Object for the spinner board
        arrowDomEl = document.getElementById("spinner-arrow"); // DOM Object for the spinner arrow
        spinButtonDomEl = document.getElementById("spinner-button"); // DOM Object for the spin wheel <button>
        spinnerDomEl = document.getElementById("spinner");

        imgActionDomEl = document.getElementById("current-action");

        // resize SVG container to match specified spinner size
        spinnerDomEl.style.width = spinnerDomEl.style.height = CIRCLE_RADIUS * 2 + 'px';

//        const circleSvgEl = document.createElementNS(SVG_NS, "circle");
//        circleSvgEl.setAttributeNS(null, "data-name", "foo");
//        circleSvgEl.setAttributeNS(null, "cx", CIRCLE_RADIUS);
//        circleSvgEl.setAttributeNS(null, "cy", CIRCLE_RADIUS);
//        circleSvgEl.setAttributeNS(null, "r", CIRCLE_RADIUS);
//        spinnerDomEl.prepend(circleSvgEl);

        // center spinner peg
        const spinnerPegOuterSvgEl = document.getElementById("spinner-peg-outer");
        spinnerPegOuterSvgEl.setAttributeNS(null, "cx", CIRCLE_RADIUS);
        spinnerPegOuterSvgEl.setAttributeNS(null, "cy", CIRCLE_RADIUS);
        const spinnerPegInnerSvgEl = document.getElementById("spinner-peg-inner");
        spinnerPegInnerSvgEl.setAttributeNS(null, "cx", CIRCLE_RADIUS);
        spinnerPegInnerSvgEl.setAttributeNS(null, "cy", CIRCLE_RADIUS);

        // center arrow
        const spinnerArrowSvgEl = document.getElementById("spinner-arrow");
        spinnerArrowSvgEl.setAttributeNS(null, "d", `M ${CIRCLE_RADIUS - 5} ${CIRCLE_RADIUS} l 0 -130 l -7 0 l 12 -15 l 12 15 l -7 0 l 0 130 Z`);

//        drawBounding("spinner-arrow");

        // Generate the wheel sections
        for (let i = 0; i < NUM_SLICES; i++) {
            slices[i] = new Slice(i, wheelDomEl);
        }

        // Highlight the first slice
        slices[0].toggleOverlay();
    }, false);

//    function drawBounding (elementID)
//    {
//        const spinnerArrowBoundingBox = document.getElementById(elementID).getBBox();
//        const boundingBox = document.createElementNS(SVG_NS, "rect");
//        boundingBox.setAttributeNS(null, "x", spinnerArrowBoundingBox.x);
//        boundingBox.setAttributeNS(null, "y", spinnerArrowBoundingBox.y);
//        boundingBox.setAttributeNS(null, "width", spinnerArrowBoundingBox.width);
//        boundingBox.setAttributeNS(null, "height", spinnerArrowBoundingBox.height);
//        boundingBox.setAttributeNS(null, "fill-opacity", "0");
//        boundingBox.setAttributeNS(null, "stroke", "red");
//        spinnerDomEl.appendChild(boundingBox);
//    }
}
