{
    /**
     * The following spinner code comes from
     * https://gist.github.com/bencentra/5790501
     */

    const SVG_NS = "http://www.w3.org/2000/svg";

    let slices = []; // Array of wheel slice objects
    let numSlices = 6;  // Size of the circle slices
    let isSpinning = false; // Is the arrow spinning?
    let rotation = 0; // Arrow rotation
    let currentSlice = 0; // Current slice the arrow is over
    let wheel; // DOM Object for the spinner board
    let arrow; // DOM Object for the spinner arrow
    let spinButton; // DOM Object for the spin wheel <button>

    // Basic wheel "slice" object for drawing SVG
    function Slice(num, parent) {
        // Set instance vars
        this.parent = parent;
        this.size = 360/numSlices;
        this.offset = num * this.size;
        this.id = "slice_"+num;
        // Draw the object
        this.object = this.create();
        this.parent.appendChild(this.object);
    }
    Slice.prototype = {
        create:function() {
            // Create a group to store the slice in
            let g = document.createElementNS(SVG_NS, "g");
            // Create the slice object
            let slice = document.createElementNS(SVG_NS, "path");
            slice.setAttributeNS(null, "id", this.id);
            let x1 = 200 + 180 * Math.cos(Math.PI*(-90+this.offset)/180);
            let y1 = 200 + 180 * Math.sin(Math.PI*(-90+this.offset)/180);
            let x2 = 200 + 180 * Math.cos(Math.PI*(-90+this.size+this.offset)/180);
            let y2 = 200 + 180 * Math.sin(Math.PI*(-90+this.size+this.offset)/180);
            slice.setAttributeNS(null, "d", "M 200 200 L "+x1+" "+y1+" A 180 180 0 0 1 "+x2+" "+y2+"  Z");
            // Randomize the color of the slice and finish styling
            let red = Math.floor(Math.random() * 215) + 20;
            let green = Math.floor(Math.random() * 215) + 20;
            let blue = Math.floor(Math.random() * 215) + 20;
            slice.setAttributeNS(null, "fill", "rgb("+red+","+green+","+blue+")");
            slice.setAttributeNS(null, "stroke", "#222222");
            slice.setAttributeNS(null, "style", "stroke-width:2px");
            // Add the slice to the group
            g.appendChild(slice);
            // Create the highlight for the slice
            let overlay = document.createElementNS(SVG_NS, "path");
            overlay.setAttributeNS(null, "d", "M 200 200 L "+x1+" "+y1+" A 180 180 0 0 1 "+x2+" "+y2+"  Z");
            overlay.setAttributeNS(null, "fill", "#FFFFFF");
            overlay.setAttributeNS(null, "stroke", "#222222");
            overlay.setAttributeNS(null, "style", "stroke-width:1px");
            overlay.setAttributeNS(null, "opacity", "0");
            // Add the highlight for the slice to the group
            g.appendChild(overlay);
            return g;
        },
        toggleOverlay:function() {
            let overlay = this.object.childNodes[1];
            if (overlay.getAttribute("opacity") == 0) {
                overlay.setAttributeNS(null, "opacity", 1);
            }
            else {
                overlay.setAttributeNS(null, "opacity", 0);
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
            spinButton.removeAttribute("disabled");
        }
        else {
            // Start spinning the arrow
            isSpinning = true;
            toggleSpinning.spinInt = setInterval(spinWheel, 1000/60);
            // Set how long the wheel will be spinning
            let duration = Math.floor(Math.random() * 2000) + 1000;
            setTimeout(toggleSpinning, duration);
            // Disable the spin button
            spinButton.setAttribute("disabled", "true");
        }
    }
    // Animation step for spinning the wheel arrow
    function spinWheel() {
        // Rotate the spinner arrow
        rotation = (rotation + 12) % 360;
        arrow.setAttributeNS(null, "transform", "rotate("+rotation+",200,200)");
        // Highlight the slice the arrow is above
        let newSlice = Math.floor(rotation / (360/numSlices));
        if (newSlice != currentSlice) {
            slices[currentSlice].toggleOverlay();
            slices[newSlice].toggleOverlay();
            currentSlice = newSlice;
        }
    }
    // Document ready event
    document.addEventListener("DOMContentLoaded", function() {
        // Get a handle to all necessary DOM elements
        wheel = document.getElementById("spinner-board"); // DOM Object for the spinner board
        arrow = document.getElementById("spinner-arrow"); // DOM Object for the spinner arrow
        spinButton = document.getElementById("spinner-button"); // DOM Object for the spin wheel <button>
        // Generate the wheel sections
        for (let i = 0; i < numSlices; i++) {
            slices[i] = new Slice(i, wheel);
        }
        // Highlight the first slice
        slices[0].toggleOverlay();
    }, false);
}
