import { auth, db } from "../js/firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ============================================================
// CLOUDINARY
// ============================================================

const CLOUDINARY_CLOUD_NAME = "ecd8rvtk";

const CLOUDINARY_UPLOAD_PRESET =
    "photography_portfolio";

const CLOUDINARY_UPLOAD_URL =
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


// ============================================================
// DOM ELEMENTS
// ============================================================

const frameForm =
    document.getElementById("frameForm");

const frameImage =
    document.getElementById("frameImage");

const selectedFile =
    document.getElementById("selectedFile");

const imagePreview =
    document.getElementById("imagePreview");

const previewImage =
    document.getElementById("previewImage");

const fileUploadBox =
    document.getElementById("fileUploadBox");

const uploadBtn =
    document.getElementById("uploadBtn");

const progressContainer =
    document.getElementById("progressContainer");

const progressFill =
    document.getElementById("progressFill");

const progressPercent =
    document.getElementById("progressPercent");

const progressStatus =
    document.getElementById("progressStatus");

const message =
    document.getElementById("message");

const framesList =
    document.getElementById("framesList");

const frameCount =
    document.getElementById("frameCount");

const logoutBtn =
    document.getElementById("logoutBtn");

const adminEmail =
    document.getElementById("adminEmail");


// ============================================================
// MESSAGES
// ============================================================

function showMessage(
    text,
    type = "success"
) {

    if (!message) return;

    message.textContent = text;

    message.className =
        "lg:col-span-2 text-[13px] leading-relaxed rounded-sm px-4 py-3";

    if (type === "success") {

        message.classList.add(
            "bg-moss",
            "text-cream"
        );

    } else {

        message.classList.add(
            "bg-red-700",
            "text-cream"
        );

    }

    message.classList.remove(
        "hidden"
    );
}


function clearMessage() {

    if (!message) return;

    message.textContent = "";

    message.classList.add(
        "hidden"
    );
}


// ============================================================
// HELPERS
// ============================================================

function formatPrice(value) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return value || "";
    }

    return `₦${number.toLocaleString("en-NG")}`;
}


function formatDate(timestamp) {

    if (!timestamp) {
        return "";
    }

    try {

        const date =
            timestamp.toDate
                ? timestamp.toDate()
                : new Date(timestamp);

        return date.toLocaleDateString(
            "en-NG",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

    } catch {

        return "";

    }
}


function getErrorMessage(error) {

    console.error(
        "GODMADE admin error:",
        error
    );

    if (
        error?.code ===
        "permission-denied"
    ) {

        return (
            "Firestore permission denied. " +
            "Check your Firestore Rules."
        );

    }

    if (error?.message) {

        return error.message;

    }

    return (
        "Something went wrong. " +
        "Open the browser console for details."
    );
}


// ============================================================
// CREATE FRAME CARD
// ============================================================

function buildFrameCard(
    frameId,
    frame
) {

    const card =
        document.createElement("article");

    card.className =
        "contact-frame";

    card.dataset.frameId =
        frameId;


    // --------------------------------------------------------
    // IMAGE
    // --------------------------------------------------------

    const imageWrap =
        document.createElement("div");

    imageWrap.className =
        "w-full h-[230px] bg-umber/10 overflow-hidden";


    const image =
        document.createElement("img");

    image.src =
        frame.imageURL || "";

    image.alt =
        frame.name ||
        "Portfolio frame";

    image.className =
        "w-full h-full object-cover block";

    image.loading =
        "lazy";


    imageWrap.appendChild(
        image
    );


    // --------------------------------------------------------
    // CONTENT
    // --------------------------------------------------------

    const content =
        document.createElement("div");

    content.className =
        "p-5";


    const info =
        document.createElement("div");

    info.className =
        "space-y-1 mb-5";


    // NAME

    const name =
        document.createElement("h3");

    name.className =
        "font-serif text-[19px] text-umber leading-snug";

    name.textContent =
        frame.name ||
        "Untitled frame";


    // PRICE

    const price =
        document.createElement("p");

    price.className =
        "text-[14px] text-moss font-semibold";

    price.textContent =
        formatPrice(
            frame.price
        );


    // TAGLINE

    const tagline =
        document.createElement("p");

    tagline.className =
        "text-[13px] text-umber/65 leading-relaxed";

    tagline.textContent =
        frame.tagline ||
        "";


    info.append(
        name,
        price,
        tagline
    );


    // DESCRIPTION

    if (frame.description) {

        const description =
            document.createElement("p");

        description.className =
            "text-[12px] text-umber/50 leading-relaxed pt-2";

        description.textContent =
            frame.description;

        info.appendChild(
            description
        );
    }


    // DATE

    const date =
        formatDate(
            frame.createdAt
        );

    if (date) {

        const dateElement =
            document.createElement("p");

        dateElement.className =
            "text-[11px] uppercase tracking-[0.14em] text-moss/60 pt-2";

        dateElement.textContent =
            date;

        info.appendChild(
            dateElement
        );
    }


    // --------------------------------------------------------
    // DELETE BUTTON
    // --------------------------------------------------------

    const deleteButton =
        document.createElement("button");

    deleteButton.type =
        "button";

    deleteButton.className =
        "delete-btn";

    deleteButton.dataset.action =
        "delete-trigger";

    deleteButton.innerHTML = `
        <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
            <polyline points="3 6 5 6 21 6"></polyline>

            <path
                d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
            ></path>

            <path d="M10 11v6"></path>

            <path d="M14 11v6"></path>

            <path
                d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"
            ></path>
        </svg>

        Delete frame
    `;


    // --------------------------------------------------------
    // CUSTOM DELETE CONFIRMATION
    // --------------------------------------------------------

    const confirmRow =
        document.createElement("div");

    confirmRow.className =
        "delete-confirm-row";

    confirmRow.dataset.role =
        "confirm-row";


    const confirmText =
        document.createElement("p");

    confirmText.className =
        "text-[12px] text-umber/70 flex-1";

    confirmText.textContent =
        "Delete this frame?";


    const cancelButton =
        document.createElement("button");

    cancelButton.type =
        "button";

    cancelButton.className =
        "delete-confirm-cancel";

    cancelButton.dataset.action =
        "cancel-delete";

    cancelButton.textContent =
        "Cancel";


    const confirmButton =
        document.createElement("button");

    confirmButton.type =
        "button";

    confirmButton.className =
        "delete-confirm-submit";

    confirmButton.dataset.action =
        "confirm-delete";

    confirmButton.textContent =
        "Delete";


    confirmRow.append(
        confirmText,
        cancelButton,
        confirmButton
    );


    // --------------------------------------------------------
    // ASSEMBLE CARD
    // --------------------------------------------------------

    content.append(
        info,
        deleteButton,
        confirmRow
    );

    card.append(
        imageWrap,
        content
    );


    return card;
}


// ============================================================
// LOAD FRAMES
// ============================================================

async function loadFrames() {

    if (!framesList) {
        return;
    }

    framesList.innerHTML = "";


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "frames"
                )
            );


        const frames =
            snapshot.docs
                .map(
                    (frameDoc) => ({
                        id: frameDoc.id,
                        data: frameDoc.data()
                    })
                )
                .sort(
                    (a, b) => {

                        const aTime =
                            a.data.createdAt
                                ?.toMillis?.() || 0;

                        const bTime =
                            b.data.createdAt
                                ?.toMillis?.() || 0;

                        return (
                            bTime -
                            aTime
                        );
                    }
                );


        // COUNT

        if (frameCount) {

            frameCount.textContent =
                `${frames.length} ${
                    frames.length === 1
                        ? "frame"
                        : "frames"
                }`;
        }


        // EMPTY

        if (!frames.length) {

            const empty =
                document.createElement(
                    "div"
                );

            empty.className =
                "lg:col-span-3 py-14 text-center text-umber/55 text-[14px]";

            empty.textContent =
                "No frames uploaded yet.";

            framesList.appendChild(
                empty
            );

            return;
        }


        // CREATE CARDS

        frames.forEach(
            ({ id, data }) => {

                framesList.appendChild(
                    buildFrameCard(
                        id,
                        data
                    )
                );

            }
        );

    } catch (error) {

        console.error(
            "Unable to load frames:",
            error
        );

        showMessage(
            getErrorMessage(error),
            "error"
        );
    }
}


// ============================================================
// DELETE FRAME
// ============================================================

async function deleteFrame(
    frameId,
    card
) {

    try {

        const confirmButton =
            card.querySelector(
                '[data-action="confirm-delete"]'
            );


        if (confirmButton) {

            confirmButton.disabled =
                true;

            confirmButton.textContent =
                "Deleting...";
        }


        await deleteDoc(
            doc(
                db,
                "frames",
                frameId
            )
        );


        card.remove();


        await loadFrames();


        showMessage(
            "Frame deleted.",
            "success"
        );


    } catch (error) {

        console.error(
            "Unable to delete frame:",
            error
        );


        showMessage(
            getErrorMessage(error),
            "error"
        );


        const confirmButton =
            card.querySelector(
                '[data-action="confirm-delete"]'
            );


        if (confirmButton) {

            confirmButton.disabled =
                false;

            confirmButton.textContent =
                "Delete";
        }
    }
}


// ============================================================
// CUSTOM DELETE UI
// ============================================================

if (framesList) {

    framesList.addEventListener(
        "click",
        (event) => {

            const button =
                event.target.closest(
                    "button"
                );

            if (!button) {
                return;
            }


            const card =
                button.closest(
                    "[data-frame-id]"
                );

            if (!card) {
                return;
            }


            const action =
                button.dataset.action;


            const confirmRow =
                card.querySelector(
                    '[data-role="confirm-row"]'
                );


            const deleteButton =
                card.querySelector(
                    '[data-action="delete-trigger"]'
                );


            // ------------------------------------------------
            // SHOW CUSTOM CONFIRMATION
            // ------------------------------------------------

            if (
                action ===
                "delete-trigger"
            ) {

                confirmRow?.classList.add(
                    "active"
                );


                if (deleteButton) {

                    deleteButton.style.display =
                        "none";
                }


                return;
            }


            // ------------------------------------------------
            // CANCEL
            // ------------------------------------------------

            if (
                action ===
                "cancel-delete"
            ) {

                confirmRow?.classList.remove(
                    "active"
                );


                if (deleteButton) {

                    deleteButton.style.display =
                        "flex";
                }


                return;
            }


            // ------------------------------------------------
            // ACTUAL DELETE
            // ------------------------------------------------

            if (
                action ===
                "confirm-delete"
            ) {

                deleteFrame(
                    card.dataset.frameId,
                    card
                );

            }

        }
    );
}


// ============================================================
// IMAGE PREVIEW
// ============================================================

if (frameImage) {

    frameImage.addEventListener(
        "change",
        () => {

            const file =
                frameImage.files?.[0];


            if (!file) {

                selectedFile.textContent =
                    "No image selected";

                imagePreview.classList.add(
                    "hidden"
                );

                previewImage.src =
                    "";

                return;
            }


            selectedFile.textContent =
                file.name;


            const reader =
                new FileReader();


            reader.onload =
                (event) => {

                    previewImage.src =
                        event.target.result;

                    imagePreview.classList.remove(
                        "hidden"
                    );
                };


            reader.readAsDataURL(
                file
            );
        }
    );
}


// ============================================================
// DRAG & DROP
// ============================================================

if (fileUploadBox) {

    [
        "dragenter",
        "dragover"
    ].forEach(
        (eventName) => {

            fileUploadBox.addEventListener(
                eventName,
                (event) => {

                    event.preventDefault();

                    fileUploadBox.classList.add(
                        "drag-over"
                    );
                }
            );

        }
    );


    [
        "dragleave",
        "drop"
    ].forEach(
        (eventName) => {

            fileUploadBox.addEventListener(
                eventName,
                (event) => {

                    event.preventDefault();

                    fileUploadBox.classList.remove(
                        "drag-over"
                    );
                }
            );

        }
    );


    fileUploadBox.addEventListener(
        "drop",
        (event) => {

            const file =
                event.dataTransfer?.files?.[0];


            if (
                !file ||
                !frameImage
            ) {

                return;
            }


            const dataTransfer =
                new DataTransfer();


            dataTransfer.items.add(
                file
            );


            frameImage.files =
                dataTransfer.files;


            frameImage.dispatchEvent(
                new Event(
                    "change",
                    {
                        bubbles: true
                    }
                )
            );

        }
    );
}


// ============================================================
// UPLOAD FORM
// ============================================================

if (frameForm) {

    frameForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            clearMessage();


            const user =
                auth.currentUser;


            const file =
                frameImage?.files?.[0];


            if (!user) {

                showMessage(
                    "You must be signed in to upload a frame.",
                    "error"
                );

                return;
            }


            if (!file) {

                showMessage(
                    "Choose an image first.",
                    "error"
                );

                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                showMessage(
                    "Please choose a valid image file.",
                    "error"
                );

                return;
            }


            const name =
                document
                    .getElementById(
                        "frameName"
                    )
                    ?.value
                    .trim();


            const price =
                document
                    .getElementById(
                        "framePrice"
                    )
                    ?.value
                    .trim();


            const tagline =
                document
                    .getElementById(
                        "frameTagline"
                    )
                    ?.value
                    .trim();


            const description =
                document
                    .getElementById(
                        "frameDescription"
                    )
                    ?.value
                    .trim();


            if (
                !name ||
                !price ||
                !tagline ||
                !description
            ) {

                showMessage(
                    "Complete all frame information before uploading.",
                    "error"
                );

                return;
            }


            uploadBtn.disabled =
                true;


            progressContainer.classList.remove(
                "hidden"
            );


            progressStatus.textContent =
                "Uploading image...";


            progressPercent.textContent =
                "0%";


            progressFill.style.width =
                "10%";


            try {

                // ------------------------------------------------
                // CLOUDINARY
                // ------------------------------------------------

                const formData =
                    new FormData();


                formData.append(
                    "file",
                    file
                );


                formData.append(
                    "upload_preset",
                    CLOUDINARY_UPLOAD_PRESET
                );


                formData.append(
                    "folder",
                    "portfolio/frames"
                );


                progressFill.style.width =
                    "35%";


                progressPercent.textContent =
                    "35%";


                const response =
                    await fetch(
                        CLOUDINARY_UPLOAD_URL,
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                if (!response.ok) {

                    const errorText =
                        await response.text();


                    throw new Error(
                        `Cloudinary upload failed: ${errorText}`
                    );
                }


                const cloudinaryData =
                    await response.json();


                const imageURL =
                    cloudinaryData.secure_url;


                progressFill.style.width =
                    "70%";


                progressPercent.textContent =
                    "70%";


                progressStatus.textContent =
                    "Saving frame...";


                // ------------------------------------------------
                // FIRESTORE
                // ------------------------------------------------

                await addDoc(
                    collection(
                        db,
                        "frames"
                    ),
                    {

                        name,

                        price,

                        tagline,

                        description,

                        imageURL,

                        cloudinaryPublicId:
                            cloudinaryData.public_id ||
                            "",

                        createdAt:
                            serverTimestamp(),

                        createdBy:
                            user.uid

                    }
                );


                // ------------------------------------------------
                // SUCCESS
                // ------------------------------------------------

                progressFill.style.width =
                    "100%";


                progressPercent.textContent =
                    "100%";


                progressStatus.textContent =
                    "Complete";


                showMessage(
                    "Frame uploaded successfully.",
                    "success"
                );


                frameForm.reset();


                selectedFile.textContent =
                    "No image selected";


                imagePreview.classList.add(
                    "hidden"
                );


                previewImage.src =
                    "";


                await loadFrames();


            } catch (error) {

                showMessage(
                    getErrorMessage(error),
                    "error"
                );


            } finally {

                setTimeout(
                    () => {

                        uploadBtn.disabled =
                            false;


                        progressContainer.classList.add(
                            "hidden"
                        );


                        progressFill.style.width =
                            "0%";


                        progressPercent.textContent =
                            "0%";


                        progressStatus.textContent =
                            "Preparing...";

                    },
                    900
                );
            }

        }
    );
}


// ============================================================
// LOGOUT
// ============================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(
                    auth
                );

            } catch (error) {

                showMessage(
                    getErrorMessage(error),
                    "error"
                );

            }

        }
    );
}


// ============================================================
// AUTH
// ============================================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "./login.html";

            return;
        }


        if (adminEmail) {

            adminEmail.textContent =
                user.email ||
                "Authenticated admin";
        }


        await loadFrames();

    }
);