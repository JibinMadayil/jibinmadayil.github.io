(function () {
    // Function to handle clicks on navigation buttons
    [...document.querySelectorAll(".control")].forEach(button => {
        button.addEventListener("click", function() {
            document.querySelector(".active-btn").classList.remove("active-btn");
            this.classList.add("active-btn");
            document.querySelector(".active").classList.remove("active");
            document.getElementById(button.dataset.id).classList.add("active");
        });
    });

    // Function to handle clicks on the theme button
    document.querySelector(".theme-btn").addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
    });

    // Function to handle clicks on the "View More" button in the portfolio section
    const viewMoreBtn = document.getElementById("view-more-blogs");
    const githubLink = "https://github.com/JibinMadayil";
    const novyproLink = "https://www.novypro.com/profile_projects/jibinmadayil-john";

    viewMoreBtn.addEventListener("click", function(event) {
        event.preventDefault();

        // Create a modal or dropdown menu for user selection
        const choice = confirm("Do you want to view more on GitHub? Click OK for GitHub or Cancel for Novypro.");
        
        if (choice) {
            window.location.href = githubLink;
        } else {
            window.location.href = novyproLink;
        }
    });
})();
