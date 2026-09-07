/* =====================================
   GRAVITY LAB
   ===================================== */


/* =========================
   GET HTML ELEMENTS
========================= */

const canvas = document.getElementById("space");

const ctx = canvas.getContext("2d");

const gravitySlider = document.getElementById("gravity");
const sizeSlider = document.getElementById("size");
const massSlider = document.getElementById("mass");

const gravityValue = document.getElementById("gravityValue");
const sizeValue = document.getElementById("sizeValue");
const massValue = document.getElementById("massValue");

const planetCount = document.getElementById("planetCount");
const fpsDisplay = document.getElementById("fps");

const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const clearBtn = document.getElementById("clearBtn");

const colorButtons = document.querySelectorAll(".color-btn");


/* =========================
   VARIABLES
========================= */

let planets = [];

let gravity = 1;

let selectedColor = "#7c5cff";

let paused = false;

let lastTime = 0;

let frameCounter = 0;

let fpsTimer = 0;


/* =========================
   CANVAS SIZE
========================= */

function resizeCanvas() {

    const rect = canvas.getBoundingClientRect();

    /*
        IMPORTANT:

        CSS controls the visual size.
        Canvas width/height control
        the actual drawing resolution.
    */

    canvas.width = rect.width;
    canvas.height = rect.height;

}


/* Run once */

resizeCanvas();


/* Resize whenever browser changes */

window.addEventListener("resize", resizeCanvas);


/* =========================
   PLANET CLASS
========================= */

class Planet {

    constructor(x, y) {

        /* Position */

        this.x = x;
        this.y = y;


        /* Settings */

        this.radius = Number(sizeSlider.value);

        this.mass = Number(massSlider.value);

        this.color = selectedColor;


        /*
            Give the planet a small
            random movement.
        */

        this.vx = (Math.random() - 0.5) * 0.8;

        this.vy = (Math.random() - 0.5) * 0.8;


        /* Trail */

        this.trail = [];

    }


    /* =========================
       UPDATE PLANET
    ========================= */

    update() {

        let forceX = 0;

        let forceY = 0;


        /*
            Calculate gravity from
            every other planet.
        */

        for (let other of planets) {

            if (other === this) {
                continue;
            }


            let dx = other.x - this.x;

            let dy = other.y - this.y;


            let distance = Math.sqrt(
                dx * dx + dy * dy
            );


            /*
                Prevent division by zero
                and crazy forces.
            */

            if (distance < 25) {
                distance = 25;
            }


            /*
                Simplified gravity.

                Higher mass =
                stronger attraction.

                Higher gravity =
                stronger attraction.
            */

            const strength =
                gravity *
                other.mass /
                (distance * distance);


            forceX +=
                (dx / distance) *
                strength;

            forceY +=
                (dy / distance) *
                strength;

        }


        /* Apply force */

        this.vx += forceX * 0.08;

        this.vy += forceY * 0.08;


        /*
            Friction.

            Keeps planets from
            becoming ridiculously fast.
        */

        this.vx *= 0.999;

        this.vy *= 0.999;


        /* Maximum speed */

        const maxSpeed = 5;

        const speed = Math.sqrt(
            this.vx * this.vx +
            this.vy * this.vy
        );


        if (speed > maxSpeed) {

            this.vx =
                (this.vx / speed) *
                maxSpeed;

            this.vy =
                (this.vy / speed) *
                maxSpeed;

        }


        /* Save trail */

        this.trail.push({
            x: this.x,
            y: this.y
        });


        if (this.trail.length > 20) {

            this.trail.shift();

        }


        /* Move planet */

        this.x += this.vx;

        this.y += this.vy;


        /* =========================
           WALL COLLISION
        ========================= */


        if (this.x - this.radius < 0) {

            this.x = this.radius;

            this.vx *= -0.8;

        }


        if (this.x + this.radius > canvas.width) {

            this.x =
                canvas.width - this.radius;

            this.vx *= -0.8;

        }


        if (this.y - this.radius < 0) {

            this.y = this.radius;

            this.vy *= -0.8;

        }


        if (this.y + this.radius > canvas.height) {

            this.y =
                canvas.height - this.radius;

            this.vy *= -0.8;

        }

    }


    /* =========================
       DRAW PLANET
    ========================= */

    draw() {


        /* =====================
           TRAIL
        ===================== */

        for (
            let i = 0;
            i < this.trail.length;
            i++
        ) {

            const point = this.trail[i];

            const alpha =
                i / this.trail.length * 0.3;


            ctx.beginPath();

            ctx.arc(
                point.x,
                point.y,
                2,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `rgba(150,150,255,${alpha})`;

            ctx.fill();

        }


        /* =====================
           GLOW
        ===================== */

        ctx.save();

        ctx.shadowBlur = 25;

        ctx.shadowColor = this.color;


        /* =====================
           PLANET
        ===================== */

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = this.color;

        ctx.fill();


        ctx.restore();


        /* =====================
           HIGHLIGHT
        ===================== */

        ctx.beginPath();

        ctx.arc(
            this.x - this.radius * 0.3,

            this.y - this.radius * 0.3,

            this.radius * 0.25,

            0,

            Math.PI * 2
        );

        ctx.fillStyle =
            "rgba(255,255,255,0.65)";

        ctx.fill();

    }

}


/* =========================
   CREATE PLANET
========================= */

canvas.addEventListener("click", function(event) {

    /*
        Get exact canvas position.
    */

    const rect =
        canvas.getBoundingClientRect();


    /*
        Convert mouse position
        into canvas coordinates.
    */

    const x =
        event.clientX - rect.left;

    const y =
        event.clientY - rect.top;


    /*
        Create planet.
    */

    const planet =
        new Planet(x, y);


    /*
        Add planet to array.
    */

    planets.push(planet);


    /*
        Update number shown
        in control panel.
    */

    updateStats();


    /*
        Useful for debugging.
    */

    console.log(
        "Planet created at:",
        x,
        y
    );

});


/* =========================
   GRAVITY SLIDER
========================= */

gravitySlider.addEventListener(
    "input",
    function() {

        gravity =
            Number(this.value);

        gravityValue.textContent =
            gravity.toFixed(1);

    }
);


/* =========================
   SIZE SLIDER
========================= */

sizeSlider.addEventListener(
    "input",
    function() {

        sizeValue.textContent =
            this.value;

    }
);


/* =========================
   MASS SLIDER
========================= */

massSlider.addEventListener(
    "input",
    function() {

        massValue.textContent =
            this.value;

    }
);


/* =========================
   COLOR BUTTONS
========================= */

colorButtons.forEach(button => {

    button.addEventListener(
        "click",
        function() {

            /* Remove active */

            colorButtons.forEach(btn => {

                btn.classList.remove("active");

            });


            /* Activate clicked button */

            this.classList.add("active");


            /* Save selected color */

            selectedColor =
                this.dataset.color;

        }
    );

});


/* =========================
   PAUSE BUTTON
========================= */

pauseBtn.addEventListener(
    "click",
    function() {

        paused = !paused;


        if (paused) {

            pauseBtn.textContent =
                "▶ Resume";

        } else {

            pauseBtn.textContent =
                "⏸ Pause";

        }

    }
);


/* =========================
   RESET BUTTON
========================= */

resetBtn.addEventListener(
    "click",
    function() {

        planets = [];

        updateStats();

    }
);


/* =========================
   CLEAR BUTTON
========================= */

clearBtn.addEventListener(
    "click",
    function() {

        planets = [];

        updateStats();

    }
);


/* =========================
   UPDATE STATS
========================= */

function updateStats() {

    planetCount.textContent =
        planets.length;

}


/* =========================
   DRAW BACKGROUND
========================= */

function drawBackground() {

    /*
        Clear canvas.
    */

    ctx.fillStyle = "#050711";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
        Draw stars.
    */

    for (let i = 0; i < 150; i++) {

        const x =
            (i * 137) %
            canvas.width;

        const y =
            (i * 79) %
            canvas.height;

        const size =
            (i % 3) + 0.5;


        ctx.beginPath();

        ctx.arc(
            x,
            y,
            size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "rgba(255,255,255,0.4)";

        ctx.fill();

    }

}


/* =========================
   ANIMATION LOOP
========================= */

function animate(time) {

    /*
        Calculate time between frames.
    */

    const delta =
        time - lastTime;

    lastTime = time;


    /*
        Draw background every frame.
    */

    drawBackground();


    /*
        Only update physics
        when simulation isn't paused.
    */

    if (!paused) {


        /* Update */

        for (let planet of planets) {

            planet.update();

        }


        /* Draw */

        for (let planet of planets) {

            planet.draw();

        }

    } else {

        /*
            Even when paused,
            draw existing planets.
        */

        for (let planet of planets) {

            planet.draw();

        }

    }


    /* =====================
       FPS
    ===================== */

    frameCounter++;

    fpsTimer += delta;


    if (fpsTimer >= 1000) {

        fpsDisplay.textContent =
            frameCounter;

        frameCounter = 0;

        fpsTimer = 0;

    }


    /*
        Ask browser for next frame.
    */

    requestAnimationFrame(animate);

}


/* =========================
   START SIMULATION
========================= */

requestAnimationFrame(animate);


/* =========================
   INITIAL VALUES
========================= */

gravityValue.textContent =
    Number(gravitySlider.value).toFixed(1);

sizeValue.textContent =
    sizeSlider.value;

massValue.textContent =
    massSlider.value;

updateStats();