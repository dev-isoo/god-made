 import { auth, db, storage } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";


// ======================================================
// GODMADE ADMIN DASHBOARD
// ======================================================

console.log("GODMADE admin.js loaded.");


// ======================================================
// GET ELEMENTS
// ======================================================

const frameForm = document.getElementById("frameForm");

const frameName = document.getElementById("frameName");
const framePrice = document.getElementById("framePrice");
const frameTagline = document.getElementById("frameTagline");
const frameDescription = document.getElementById("frameDescription");

const frameImage = document.getElementById("frameImage");

const selectedFile = document.getElementById("selectedFile");

const imagePreview = document.getElementById("imagePreview");
const previewImage = document.getElementById("previewImage");

const uploadBtn = document.getElementById("uploadBtn");

const progressContainer =
    document.getElementById("progressContainer");

const progressStatus =
    document.getElementById("progressStatus");

const progressPercent =
    document.getElementById("progressPercent");

const progressFill =
    document.getElementById("progressFill");

const message =
    document.getElementById("message");

const framesList =
    document.getElementById("framesList");

const adminEmail =
    document.getElementById("adminEmail");

const logoutBtn =
    document.getElementById("logoutBtn");


// ======================================================
// AUTH CHECK
// ======================================================

onAuthStateChanged(auth, (user) => {

    if (user) {

        console.log("Admin logged in:", user.email);

        if (adminEmail) {
            adminEmail.textContent = user.email;
        }

        loadFrames();

    } else {

        console.log("No admin logged in.");

        window.location.href = "login.html";
    }

});


// ======================================================
// LOGOUT
// ======================================================

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            await signOut(auth);

            window.location.href = "login.html";

        } catch (error) {

            console.error("Logout error:", error);

        }

    });

}


// ======================================================
// IMAGE SELECT
// ======================================================

if (frameImage) {

    frameImage.addEventListener("change", (event) => {

        console.log("File input changed.");

        const file = event.target.files[0];

        if (!file) {

            console.log("No file selected.");

            selectedFile.textContent =
                "No image selected";

            imagePreview.style.display = "none";

            previewImage.src = "";

            return;
        }


        console.log("Selected file:", file.name);

        console.log("File type:", file.type);

        console.log("File size:", file.size);


        // Check image
        if (!file.type.startsWith("image/")) {

            showMessage(
                "Please select a valid image file.",
                "error"
            );

            frameImage.value = "";

            return;
        }


        // Maximum 10MB
        if (file.size > 10 * 1024 * 1024) {

            showMessage(
                "Image is too large. Maximum size is 10MB.",
                "error"
            );

            frameImage.value = "";

            return;
        }


        // Show filename
        selectedFile.textContent =
            "Selected: " + file.name;


        // Create preview
        const reader = new FileReader();


        reader.onload = (e) => {

            console.log("Image preview loaded.");

            previewImage.src =
                e.target.result;

            imagePreview.style.display =
                "block";
        };


        reader.onerror = () => {

            console.error(
                "Could not read image."
            );

            showMessage(
                "Could not preview this image.",
                "error"
            );

        };


        reader.readAsDataURL(file);

    });

}


// ======================================================
// FORM SUBMIT
// ======================================================

if (frameForm) {

    frameForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            console.log(
                "Frame form submitted."
            );


            const user =
                auth.currentUser;


            if (!user) {

                showMessage(
                    "You are not logged in. Please login again.",
                    "error"
                );

                return;
            }


            // ==================================================
            // GET VALUES
            // ==================================================

            const name =
                frameName.value.trim();

            const price =
                Number(framePrice.value);

            const tagline =
                frameTagline.value.trim();

            const description =
                frameDescription.value.trim();

            const file =
                frameImage.files[0];


            // ==================================================
            // VALIDATION
            // ==================================================

            if (!name) {

                showMessage(
                    "Please enter the frame name.",
                    "error"
                );

                return;
            }


            if (!price || price < 0) {

                showMessage(
                    "Please enter a valid price.",
                    "error"
                );

                return;
            }


            if (!tagline) {

                showMessage(
                    "Please enter a short description.",
                    "error"
                );

                return;
            }


            if (!description) {

                showMessage(
                    "Please enter the full description.",
                    "error"
                );

                return;
            }


            if (!file) {

                showMessage(
                    "Please choose an image first.",
                    "error"
                );

                return;
            }


            // ==================================================
            // DISABLE BUTTON
            // ==================================================

            uploadBtn.disabled = true;

            uploadBtn.textContent =
                "Uploading...";


            progressContainer.style.display =
                "block";

            progressFill.style.width =
                "0%";

            progressPercent.textContent =
                "0%";

            progressStatus.textContent =
                "Preparing image...";

            hideMessage();


            try {

                // ==================================================
                // CREATE UNIQUE FILE NAME
                // ==================================================

                const timestamp =
                    Date.now();

                const random =
                    Math.random()
                        .toString(36)
                        .substring(2, 9);


                const extension =
                    getFileExtension(file.name);


                const fileName =
                    `${timestamp}_${random}.${extension}`;


                // ==================================================
                // FIREBASE STORAGE PATH
                // ==================================================

                const storagePath =
                    `frames/${fileName}`;


                console.log(
                    "Uploading to:",
                    storagePath
                );


                const storageRef =
                    ref(
                        storage,
                        storagePath
                    );


                // ==================================================
                // START UPLOAD
                // ==================================================

                const uploadTask =
                    uploadBytesResumable(
                        storageRef,
                        file,
                        {
                            contentType: file.type
                        }
                    );


                uploadTask.on(

                    "state_changed",

                    // ------------------------------------------
                    // PROGRESS
                    // ------------------------------------------

                    (snapshot) => {

                        const percent =
                            Math.round(
                                (
                                    snapshot.bytesTransferred /
                                    snapshot.totalBytes
                                ) * 100
                            );


                        console.log(
                            "Upload:",
                            percent + "%"
                        );


                        progressFill.style.width =
                            percent + "%";


                        progressPercent.textContent =
                            percent + "%";


                        progressStatus.textContent =
                            "Uploading image...";

                    },


                    // ------------------------------------------
                    // ERROR
                    // ------------------------------------------

                    (error) => {

                        console.error(
                            "Firebase Storage upload error:",
                            error
                        );


                        uploadBtn.disabled =
                            false;

                        uploadBtn.textContent =
                            "Upload & Add Frame";


                        progressContainer.style.display =
                            "none";


                        showMessage(
                            getFirebaseErrorMessage(error),
                            "error"
                        );

                    },


                    // ------------------------------------------
                    // COMPLETE
                    // ------------------------------------------

                    async () => {

                        try {

                            console.log(
                                "Image upload complete."
                            );


                            progressStatus.textContent =
                                "Getting image URL...";


                            // ==========================================
                            // GET IMAGE URL
                            // ==========================================

                            const imageURL =
                                await getDownloadURL(
                                    uploadTask.snapshot.ref
                                );


                            console.log(
                                "Image URL:",
                                imageURL
                            );


                            // ==========================================
                            // SAVE FRAME TO FIRESTORE
                            // ==========================================

                            progressStatus.textContent =
                                "Saving frame...";


                            const frameData = {

                                name: name,

                                price: price,

                                tagline: tagline,

                                description: description,

                                imageURL: imageURL,

                                storagePath: storagePath,

                                createdAt:
                                    serverTimestamp(),

                                createdBy:
                                    user.uid

                            };


                            const frameDoc =
                                await addDoc(
                                    collection(
                                        db,
                                        "frames"
                                    ),
                                    frameData
                                );


                            console.log(
                                "Frame saved:",
                                frameDoc.id
                            );


                            // ==========================================
                            // SUCCESS
                            // ==========================================

                            progressFill.style.width =
                                "100%";

                            progressPercent.textContent =
                                "100%";

                            progressStatus.textContent =
                                "Complete!";


                            showMessage(
                                "✅ Frame uploaded successfully!",
                                "success"
                            );


                            // ==========================================
                            // RESET FORM
                            // ==========================================

                            frameForm.reset();


                            selectedFile.textContent =
                                "No image selected";


                            previewImage.src =
                                "";


                            imagePreview.style.display =
                                "none";


                            // ==========================================
                            // RELOAD FRAMES
                            // ==========================================

                            await loadFrames();


                            // ==========================================
                            // RESET BUTTON
                            // ==========================================

                            setTimeout(() => {

                                uploadBtn.disabled =
                                    false;

                                uploadBtn.textContent =
                                    "Upload & Add Frame";

                                progressContainer.style.display =
                                    "none";

                                progressFill.style.width =
                                    "0%";

                            }, 1500);

                        } catch (error) {

                            console.error(
                                "Error saving frame:",
                                error
                            );


                            uploadBtn.disabled =
                                false;

                            uploadBtn.textContent =
                                "Upload & Add Frame";


                            progressContainer.style.display =
                                "none";


                            showMessage(
                                getFirebaseErrorMessage(error),
                                "error"
                            );

                        }

                    }

                );

            } catch (error) {

                console.error(
                    "Upload setup error:",
                    error
                );


                uploadBtn.disabled =
                    false;

                uploadBtn.textContent =
                    "Upload & Add Frame";


                progressContainer.style.display =
                    "none";


                showMessage(
                    getFirebaseErrorMessage(error),
                    "error"
                );

            }

        }

    );

}


// ======================================================
// LOAD EXISTING FRAMES
// ======================================================

async function loadFrames() {

    if (!framesList) {
        return;
    }


    framesList.innerHTML =
        `<div class="loading">
            Loading frames...
        </div>`;


    try {

        const framesQuery =
            query(
                collection(
                    db,
                    "frames"
                ),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(
                framesQuery
            );


        framesList.innerHTML = "";


        if (snapshot.empty) {

            framesList.innerHTML =
                `<div class="empty">
                    No frames added yet.
                </div>`;

            return;
        }


        snapshot.forEach((frameDoc) => {

            const frame =
                frameDoc.data();


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "frame-item";


            item.innerHTML = `

                <div class="frame-item-image">

                    <img
                        src="${escapeHTML(
                            frame.imageURL || ""
                        )}"
                        alt="${escapeHTML(
                            frame.name || "GODMADE Frame"
                        )}"
                        loading="lazy"
                    >

                </div>


                <div class="frame-item-info">

                    <h3>
                        ${escapeHTML(
                            frame.name ||
                            "GODMADE Original"
                        )}
                    </h3>


                    <div class="frame-item-price">

                        ₦${formatPrice(
                            frame.price
                        )}

                    </div>


                    <div class="frame-item-tagline">

                        ${escapeHTML(
                            frame.tagline || ""
                        )}

                    </div>


                    <div class="frame-item-description">

                        ${escapeHTML(
                            frame.description || ""
                        )}

                    </div>


                    <button
                        class="delete-btn"
                        data-id="${frameDoc.id}"
                    >
                        Delete Frame
                    </button>

                </div>

            `;


            const deleteButton =
                item.querySelector(
                    ".delete-btn"
                );


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteFrame(
                        frameDoc.id,
                        frame.storagePath
                    );

                }
            );


            framesList.appendChild(
                item
            );

        });

    } catch (error) {

        console.error(
            "Error loading frames:",
            error
        );


        framesList.innerHTML =
            `<div class="empty">
                Unable to load frames.
                Check Firebase Firestore rules/indexes.
            </div>`;

    }

}


// ======================================================
// DELETE FRAME
// ======================================================

async function deleteFrame(
    frameId,
    storagePath
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this frame?"
        );


    if (!confirmed) {
        return;
    }


    try {

        // Delete image from Storage
        if (storagePath) {

            try {

                const imageRef =
                    ref(
                        storage,
                        storagePath
                    );

                await deleteObject(
                    imageRef
                );

            } catch (storageError) {

                console.warn(
                    "Storage image could not be deleted:",
                    storageError
                );

            }

        }


        // Delete Firestore document
        await deleteDoc(
            doc(
                db,
                "frames",
                frameId
            )
        );


        showMessage(
            "Frame deleted successfully.",
            "success"
        );


        await loadFrames();

    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        showMessage(
            getFirebaseErrorMessage(error),
            "error"
        );

    }

}


// ======================================================
// MESSAGE
// ======================================================

function showMessage(
    text,
    type
) {

    if (!message) {
        return;
    }


    message.textContent =
        text;


    message.className =
        "message " + type;

}


function hideMessage() {

    if (!message) {
        return;
    }


    message.textContent =
        "";

    message.className =
        "message";

}


// ======================================================
// FILE EXTENSION
// ======================================================

function getFileExtension(
    fileName
) {

    const parts =
        fileName.split(".");


    if (parts.length < 2) {
        return "jpg";
    }


    return parts
        .pop()
        .toLowerCase();

}


// ======================================================
// PRICE FORMAT
// ======================================================

function formatPrice(price) {

    return (
        Number(price) || 0
    ).toLocaleString("en-NG");

}


// ======================================================
// HTML ESCAPE
// ======================================================

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


// ======================================================
// FIREBASE ERROR MESSAGE
// ======================================================

function getFirebaseErrorMessage(
    error
) {

    console.error(
        "Firebase error:",
        error
    );


    if (
        error &&
        error.code ===
        "storage/unauthorized"
    ) {

        return (
            "❌ Firebase Storage rejected the upload. " +
            "Check your Firebase Storage Rules."
        );

    }


    if (
        error &&
        error.code ===
        "storage/object-not-found"
    ) {

        return (
            "❌ Firebase Storage could not find the uploaded image."
        );

    }


    if (
        error &&
        error.code ===
        "storage/quota-exceeded"
    ) {

        return (
            "❌ Firebase Storage quota has been exceeded."
        );

    }


    if (
        error &&
        error.code ===
        "permission-denied"
    ) {

        return (
            "❌ Firestore permission denied. " +
            "Check your Firestore Rules."
        );

    }


    if (
        error &&
        error.message
    ) {

        return (
            "❌ " +
            error.message
        );

    }


    return (
        "❌ Something went wrong. " +
        "Open F12 → Console to see the exact error."
    );

}