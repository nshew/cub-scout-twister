{
    // TODO: identify quadrants with limbs
    /**
     * The original spinner code comes from
     * https://gist.github.com/bencentra/5790501
     */

    const SVG_NS = "http://www.w3.org/2000/svg";
    const CIRCLE_RADIUS = 200;

    const SPEEDS = {
        FAST: 30,
        NORMAL: 50,
        SLOW: 100,
        DEBUG: 500,
    };
    const SPEED = SPEEDS.FAST;

    const COLOR_VALUES = {
        lion:    "rgb(99.2%, 72.2%, 13.7%)",
        tiger:   "rgb(96.9%, 55.3%, 17.6%)",
        wolf:    "rgb(92.9%, 10.2%, 22.7%)",
        bear:    "rgb(59.2%, 83.5%, 78.4%)",
        webelos: "rgb(0%, 23.9%, 44.3%)",
        sign:    "white",
    };
    const ACTIONS = Object.keys(COLOR_VALUES);

    const LIMBS = [
        "right-hand",
        "right-foot",
        "left-foot",
        "left-hand",
    ];

    const NUM_SLICES = LIMBS.length * ACTIONS.length - 2;
    let currentLimb = 0;
    let actionOffset = 0;

    let slices = []; // Array of wheel slice objects
    let isSpinning = false; // Is the arrow spinning?
    let rotation = 0; // Arrow rotation
    let currentSlice = 0; // Current slice the arrow is over
    let arrowDomEl; // DOM Object for the spinner arrow
    let spinnerDomEl; // DOM Object for the svg container
    let spinButtonDomEl; // DOM Object for the spin wheel <button>

    let imgColorDomEl;
    let imgLimbDomEl;

    // Basic wheel "slice" object for drawing SVG
    function Slice (num, parent) {
        // Select the next color and limb in the cycle.
        this.action = ACTIONS[(num + actionOffset) % ACTIONS.length];
        this.limb  = LIMBS[currentLimb];
        console.debug('slice number', num, 'assigned', this.action, 'on', this.limb);

        /*
         * Limit the "sign" action to "hand" limbs. If we get that
         * combo, we still need to increment currentLimb so that
         * the section building can continue. Further, we have to
         * note the offset for calculations of which action to use
         * and when to increment the action (after the 4th or 5th).
         */
        if (this.action === "sign" &&
            (this.limb === LIMBS[1] || this.limb === LIMBS[2])
        ) {
            currentLimb++;
            actionOffset++;
            throw new Error("Can't combine sign with feet!");
        } else if ((num + 1 + actionOffset) % ACTIONS.length === 0) {
            currentLimb++;
        }

        // Set instance vars
        this.parent = parent;
        this.id = "slice_" + this.action + "_" + this.limb;

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
        slice.setAttributeNS(null, "fill", COLOR_VALUES[this.action]);

        // add click-to-select event to sections
        slice.addEventListener("click", () => {
            // TODO: move pointer
            imgColorDomEl.src = "../images/" + this.action + ".png";
            imgLimbDomEl.src = "../images/" + this.limb + ".png";
        });

        // Add the slice to the group
        this.object.appendChild(slice);
        this.parent.appendChild(this.object);
    }

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
            toggleSpinning.spinInt = setInterval(spinWheel, SPEED);
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
            imgColorDomEl.src = "../images/" + slices[newSlice].action + ".png";
            imgLimbDomEl.src = "../images/" + slices[newSlice].limb + ".png";
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

        imgColorDomEl = document.getElementById("current-color");
        imgLimbDomEl = document.getElementById("current-limb");

        // resize SVG container to match specified spinner size
        spinnerDomEl.style.width = spinnerDomEl.style.height = CIRCLE_RADIUS * 2 + 'px';

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

        // Generate the wheel sections
        for (let i = 0; i < NUM_SLICES; i++) {
            try {
                slices[i] = new Slice (i, wheelDomEl);
            } catch (e) {
                console.error("Can't combine sign with feet!", i);
                i--;
            }
        }

        // Highlight the first slice
//        slices[0].toggleOverlay();
        imgColorDomEl.src = "../images/" + slices[currentSlice].action + ".png";
        imgLimbDomEl.src = "../images/" + slices[currentSlice].limb + ".png";

        // watch for key triggers
        document.addEventListener("keyup", (event) => {
            if (event.code === "Space" || event.code === "Enter") {
                toggleSpinning();
            }
        });

        }, false);
}
