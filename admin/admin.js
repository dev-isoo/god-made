import { auth, db } from "../js/firebase-config.js";

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
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";




// ======================================================
// GODMADE ADMIN DASHBOARD
// ======================================================

console.log("GODMADE admin.js loaded.");

const CLOUDINARY_CLOUD_NAME = "ecd8rvtk";
const CLOUDINARY_UPLOAD_PRESET = "photography_portfolio";
const CLOUDINARY_UPLOAD_URL =
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


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
                // UPLOAD TO CLOUDINARY
                // ==================================================

                console.log(
                    "Uploading image to Cloudinary..."
                );

                progressStatus.textContent =
                    "Uploading image...";

                const cloudinaryFormData =
                    new FormData();

                cloudinaryFormData.append(
                    "file",
                    file
                );

                cloudinaryFormData.append(
                    "upload_preset",
                    CLOUDINARY_UPLOAD_PRESET
                );

                cloudinaryFormData.append(
                    "folder",
                    "portfolio/frames"
                );

                const cloudinaryResponse =
                    await fetch(
                        CLOUDINARY_UPLOAD_URL,
                        {
                            method: "POST",
                            body: cloudinaryFormData
                        }
                    );

                if (!cloudinaryResponse.ok) {
                    const errorText =
                        await cloudinaryResponse.text();

                    throw new Error(
                        `Cloudinary upload failed: ${errorText}`
                    );
                }

                const cloudinaryData =
                    await cloudinaryResponse.json();

                const imageURL =
                    cloudinaryData.secure_url;

                const cloudinaryPublicId =
                    cloudinaryData.public_id;

                console.log(
                    "Cloudinary upload complete:",
                    imageURL
                );

                progressFill.style.width =
                    "100%";

                progressPercent.textContent =
                    "100%";

                progressStatus.textContent =
                    "Saving frame...";

                const frameData = {
                    name: name,
                    price: price,
                    tagline: tagline,
                    description: description,
                    imageURL: imageURL,
                    cloudinaryPublicId: cloudinaryPublicId,
                    createdAt: serverTimestamp(),
                    createdBy: user.uid
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

                progressStatus.textContent =
                    "Complete!";

                showMessage(
                    "✅ Frame uploaded successfully!",
                    "success"
                );

                frameForm.reset();

                selectedFile.textContent =
                    "No image selected";

                previewImage.src = "";

                imagePreview.style.display =
                    "none";

                await loadFrames();

                setTimeout(() => {
                    uploadBtn.disabled = false;
                    uploadBtn.textContent =
                        "Upload & Add Frame";
                    progressContainer.style.display =
                        "none";
                    progressFill.style.width =
                        "0%";
                    progressPercent.textContent =
                        "0%";
                }, 1500);

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


async function loadFrames() {

    if (!framesList) {
        return;
    }


    framesList.innerHTML =
        `<div class="loading">
            Loading frames...
        </div>`;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "frames"
                )
            );

        framesList.innerHTML = "";

        if (snapshot.empty) {
            framesList.innerHTML =
                `<div class="empty">
                    No frames added yet.
                </div>`;
            return;
        }

        const frames = snapshot.docs
            .map((frameDoc) => ({
                doc: frameDoc,
                data: frameDoc.data()
            }))
            .sort((a, b) => {
                const aTimestamp = a.data.createdAt;
                const bTimestamp = b.data.createdAt;

                const aTime =
                    aTimestamp?.toMillis?.() ||
                    (aTimestamp
                        ? new Date(aTimestamp).getTime()
                        : 0);

                const bTime =
                    bTimestamp?.toMillis?.() ||
                    (bTimestamp
                        ? new Date(bTimestamp).getTime()
                        : 0);

                return bTime - aTime;
            });

        frames.forEach(({ doc: frameDoc, data: frame }) => {
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


function formatPrice(price) {

    return (
        Number(price) || 0
    ).toLocaleString("en-NG");

}

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
// GENERALIZED ERROR MESSAGE
// ======================================================

function getFirebaseErrorMessage(
    error
) {

    console.error(
        "Application error:",
        error
    );

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