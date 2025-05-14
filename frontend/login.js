console.log("login.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".auth-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("/api/auth/login", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Login successful");
        window.location.href = "index.html"; // redirect to homepage
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Try again later.");
    }
  });
});
