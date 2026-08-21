import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// GODMADE FRAMES
// Load frames from Firebase Firestore
// ==========================================

const framesTrack =
    document.getElementById("framesTrack");


// ==========================================
// LOAD FRAMES
// ==========================================

async function loadFrames() {

    if (!framesTrack) {
        console.error("framesTrack was not found.");
        return;
    }

    try {

        const framesQuery = query(
            collection(db, "frames"),
            orderBy("createdAt", "desc")
        );

        const snapshot =
            await getDocs(framesQuery);


        // Clear old frames

        framesTrack.innerHTML = "";


        // ==========================================
        // NO FRAMES
        // ==========================================

        if (snapshot.empty) {

            framesTrack.innerHTML = `
                <div class="no-frames">

                    <h3>
                        No frames available yet.
                    </h3>

                    <p>
                        New GODMADE originals will appear here soon.
                    </p>

                </div>
            `;

            return;
        }


        // ==========================================
        // CREATE EACH FRAME
        // ==========================================

        snapshot.forEach((frameDoc) => {

            const frame = frameDoc.data();


            // ==========================================
            // ONLY SHOW PUBLISHED FRAMES
            // ==========================================

            if (frame.published === false) {
                return;
            }


            // ==========================================
            // CREATE CARD
            // ==========================================

            const frameCard =
                document.createElement("article");

            frameCard.className =
                "frame-card";


            // ==========================================
            // GET IMAGE
            // ==========================================

            const imageURL =
                frame.imageURL || frame.image || "";


            // ==========================================
            // SAVE DATA
            // ==========================================

            frameCard.dataset.id =
                frameDoc.id;

            frameCard.dataset.name =
                frame.name || "GODMADE Original";

            frameCard.dataset.price =
                frame.price || 0;

            frameCard.dataset.image =
                imageURL;

            frameCard.dataset.description =
                frame.description || "";

            frameCard.dataset.tagline =
                frame.tagline || "";


            // ==========================================
            // FRAME HTML
            // ==========================================

            frameCard.innerHTML = `

                <div class="frame-image">

                    <img
                        src="${escapeHTML(imageURL)}"
                        alt="${escapeHTML(
                            frame.name ||
                            "GODMADE Frame"
                        )}"
                        loading="lazy"
                    >

                </div>


                <div class="frame-info">

                    <h3>
                        ${escapeHTML(
                            frame.name ||
                            "GODMADE Original"
                        )}
                    </h3>


                    <p class="frame-tagline">

                        ${escapeHTML(
                            frame.tagline ||
                            "Every picture tells a story."
                        )}

                    </p>


                    <p>

                        ${
                            frame.description
                                ? escapeHTML(
                                    shortenText(
                                        frame.description
                                    )
                                )
                                : "Every picture tells a story."
                        }

                    </p>


                    <span class="frame-price">

                        ₦${formatPrice(
                            frame.price
                        )}

                    </span>

                </div>

            `;


            // ==========================================
            // IMAGE ERROR HANDLER
            // ==========================================

            const image =
                frameCard.querySelector("img");

            if (image) {

                image.addEventListener(
                    "error",
                    () => {

                        console.error(
                            "Frame image failed to load:",
                            imageURL
                        );

                        image.alt =
                            "GODMADE image unavailable";

                    }
                );

            }


            // ==========================================
            // CLICK FRAME
            // ==========================================

            frameCard.addEventListener(
                "click",
                () => {

                    openFrameModal({

                        id:
                            frameDoc.id,

                        name:
                            frame.name ||
                            "GODMADE Original",

                        price:
                            frame.price || 0,

                        image:
                            imageURL,

                        description:
                            frame.description || "",

                        tagline:
                            frame.tagline || ""

                    });

                }
            );


            // ==========================================
            // ADD CARD TO PAGE
            // ==========================================

            framesTrack.appendChild(
                frameCard
            );

        });


    } catch (error) {

        console.error(
            "Error loading frames:",
            error
        );


        framesTrack.innerHTML = `

            <div class="no-frames">

                <h3>
                    Unable to load frames.
                </h3>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>

        `;

    }

}


// ==========================================
// FRAME MODAL
// ==========================================

function openFrameModal(frame) {

    const modal =
        document.getElementById(
            "frameModal"
        );


    const modalImage =
        document.getElementById(
            "modalFrameImage"
        );


    const modalName =
        document.getElementById(
            "modalFrameName"
        );


    const modalDescription =
        document.getElementById(
            "modalFrameDescription"
        );


    const modalPrice =
        document.getElementById(
            "modalFramePrice"
        );


    const modalTagline =
        document.getElementById(
            "modalFrameTagline"
        );


    if (!modal) {

        console.error(
            "frameModal was not found."
        );

        return;
    }


    // ==========================================
    // IMAGE
    // ==========================================

    if (modalImage) {

        modalImage.src =
            frame.image || "";

        modalImage.alt =
            frame.name ||
            "GODMADE Frame";

    }


    // ==========================================
    // NAME
    // ==========================================

    if (modalName) {

        modalName.textContent =
            frame.name ||
            "GODMADE Original";

    }


    // ==========================================
    // TAGLINE
    // ==========================================

    if (modalTagline) {

        modalTagline.textContent =
            frame.tagline ||
            "";

    }


    // ==========================================
    // DESCRIPTION
    // ==========================================

    if (modalDescription) {

        modalDescription.textContent =
            frame.description ||
            "Every picture tells a story.";

    }


    // ==========================================
    // PRICE
    // ==========================================

    if (modalPrice) {

        modalPrice.textContent =
            "₦" +
            formatPrice(
                frame.price
            );

    }


    // ==========================================
    // SAVE SELECTED FRAME
    // ==========================================

    window.selectedFrame = {

        id:
            frame.id || "",

        name:
            frame.name ||
            "GODMADE Original",

        price:
            frame.price || 0,

        image:
            frame.image || "",

        description:
            frame.description || "",

        tagline:
            frame.tagline || ""

    };


    // ==========================================
    // OPEN MODAL
    // ==========================================

    modal.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";

}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeFrameModal() {

    const modal =
        document.getElementById(
            "frameModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

}


// ==========================================
// CLOSE BUTTON
// ==========================================

const closeButton =
    document.getElementById(
        "frameModalClose"
    );


if (closeButton) {

    closeButton.addEventListener(
        "click",
        closeFrameModal
    );

}


// ==========================================
// CLICK OUTSIDE MODAL
// ==========================================

const modalOverlay =
    document.getElementById(
        "frameModalOverlay"
    );


if (modalOverlay) {

    modalOverlay.addEventListener(
        "click",
        closeFrameModal
    );

}


// ==========================================
// ESCAPE KEY
// ==========================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

            closeFrameModal();

        }

    }
);


// ==========================================
// BUY FRAME
// ==========================================

const buyButton =
    document.getElementById(
        "buyFrameBtn"
    );


if (buyButton) {

    buyButton.addEventListener(
        "click",
        () => {

            const frame =
                window.selectedFrame;


            if (!frame) {

                console.error(
                    "No frame selected."
                );

                return;
            }


            const message =
                encodeURIComponent(

                    `Hello GODMADE,

I want to buy this frame:

Frame: ${frame.name}

Price: ₦${formatPrice(
    frame.price
)}

Please send me the payment and delivery details.

Thank you.`

                );


            // ==========================================
            // GODMADE WHATSAPP
            // ==========================================

            window.open(

                `https://wa.me/2348028575553?text=${message}`,

                "_blank"

            );

        }
    );

}


// ==========================================
// FORMAT PRICE
// ==========================================

function formatPrice(price) {

    const number =
        Number(price) || 0;


    return number.toLocaleString(
        "en-NG"
    );

}


// ==========================================
// SHORTEN DESCRIPTION
// ==========================================

function shortenText(text) {

    if (!text) {
        return "";
    }


    if (text.length <= 70) {
        return text;
    }


    return (
        text.substring(0, 70) +
        "..."
    );

}


// ==========================================
// BASIC HTML ESCAPE
// ==========================================

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// START
// ==========================================

loadFrames();