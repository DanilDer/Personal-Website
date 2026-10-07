"use strict";

// --------------------------------------------------
// Mobile navigation
// --------------------------------------------------

const menuButton = document.querySelector("#menu-icon");
const navigation = document.querySelector("#primary-navigation");
const header = document.querySelector(".header");

const navigationLinks = navigation
    ? [...navigation.querySelectorAll('a[href^="#"]')]
    : [];

const sections = [
    ...document.querySelectorAll("main section[id]")
];

const mobileScreen = window.matchMedia("(max-width: 768px)");

function setMenu(isOpen) {
    if (!menuButton || !navigation) {
        return;
    }

    navigation.classList.toggle("active", isOpen);

    menuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
    );

    menuButton.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
    );

    menuButton.textContent = isOpen ? "×" : "☰";
}

if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
        const isOpen =
            menuButton.getAttribute("aria-expanded") === "true";

        setMenu(!isOpen);
    });

    navigationLinks.forEach((link) => {
        link.addEventListener("click", () => {
            setMenu(false);
        });
    });

    document.addEventListener("click", (event) => {
        if (header && !header.contains(event.target)) {
            setMenu(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        const isOpen =
            menuButton.getAttribute("aria-expanded") === "true";

        if (event.key === "Escape" && isOpen) {
            setMenu(false);
            menuButton.focus();
        }
    });

    mobileScreen.addEventListener("change", () => {
        setMenu(false);
    });
}

// --------------------------------------------------
// Highlight the current section in navigation
// --------------------------------------------------

let scrollUpdateScheduled = false;

function updateNavigation() {
    scrollUpdateScheduled = false;

    if (sections.length === 0) {
        return;
    }

    const headerOffset = (header?.offsetHeight ?? 0) + 24;
    let currentSection = sections[0].id;

    sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= headerOffset) {
            currentSection = section.id;
        }
    });

    const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;

    if (atBottom) {
        currentSection = sections[sections.length - 1].id;
    }

    navigationLinks.forEach((link) => {
        const isActive = link.hash === `#${currentSection}`;

        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "location");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    header?.classList.toggle("sticky", window.scrollY > 100);
}

window.addEventListener(
    "scroll",
    () => {
        if (!scrollUpdateScheduled) {
            scrollUpdateScheduled = true;
            window.requestAnimationFrame(updateNavigation);
        }
    },
    { passive: true }
);

window.addEventListener("resize", updateNavigation);
window.addEventListener("load", updateNavigation);

updateNavigation();

// --------------------------------------------------
// Automatic copyright year
// --------------------------------------------------

const copyrightYear = document.querySelector("#copyright-year");

if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
}

// --------------------------------------------------
// Resume PDF viewer
// --------------------------------------------------

const resumeButton = document.querySelector("#resume-button");
const resumeDialog = document.querySelector("#resume-dialog");
const resumeFrame = document.querySelector("#resume-frame");
const resumeCloseButton = document.querySelector("#resume-close");

let previousBodyOverflow = "";

if (
    resumeButton &&
    resumeDialog &&
    resumeFrame &&
    typeof resumeDialog.showModal === "function"
) {
    resumeButton.addEventListener("click", (event) => {
        // Preserve normal browser behavior for modified clicks.
        if (
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey
        ) {
            return;
        }

        event.preventDefault();

        if (resumeDialog.open) {
            return;
        }

        resumeFrame.src = resumeButton.href;
        resumeDialog.showModal();

        previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
    });

    resumeCloseButton?.addEventListener("click", () => {
        resumeDialog.close();
    });

    // Escape closes the native dialog automatically.
    resumeDialog.addEventListener("close", () => {
        document.body.style.overflow = previousBodyOverflow;
        resumeButton.focus();
    });

    // Clicking outside the dialog closes it.
    resumeDialog.addEventListener("click", (event) => {
        const bounds = resumeDialog.getBoundingClientRect();

        const clickedOutside =
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom;

        if (event.target === resumeDialog && clickedOutside) {
            resumeDialog.close();
        }
    });
}