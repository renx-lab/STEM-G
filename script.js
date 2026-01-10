/**
 * STEM12G Memory Vault - Login Logic
 * Created by Renz Nollora
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginCard = document.querySelector('.polaroid-card');
    const loginBtn = document.getElementById('loginBtn');

    // 1. Listen for the form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevents the page from refreshing

        // Get the values entered by the user
        const user = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value.trim();

        // 2. The Exclusive Credential Check
        // Username: STEM12G | Password: dontbeastranger
        if (user === "STEM12G" && pass === "dontbeastranger") {
            handleSuccess();
        } else {
            handleFailure();
        }
    });

    /**
     * Actions to take when login is correct
     */
    function handleSuccess() {
        // Disable button to prevent double clicks
        loginBtn.disabled = true;
        loginBtn.innerText = "Opening Vault...";

        // Add a smooth fade-out effect to the card
        loginCard.style.transition = "all 0.8s ease";
        loginCard.style.opacity = "0";
        loginCard.style.transform = "translateY(-40px) rotate(0deg) scale(0.9)";

        // Redirect to the Memories Gallery after the animation finishes
        setTimeout(() => {
            window.location.href = "memories.html"; 
        }, 1000);
    }

    /**
     * Actions to take when login is incorrect
     */
    function handleFailure() {
        // Clear the password field for security
        document.getElementById('password').value = "";

        // Apply the CSS shake animation
        loginCard.classList.add('shake');

        // Show your custom error message
        alert("Access Denied. Ask Renz Nollora for the password.");

        // Remove the 'shake' class after animation ends (500ms)
        // This allows the user to trigger the shake again on the next fail
        setTimeout(() => {
            loginCard.classList.remove('shake');
        }, 500);
    }
});
