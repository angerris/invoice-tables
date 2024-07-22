document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const loginFormSection = document.getElementById("loginFormSection");
  const mainPage = document.getElementById("mainPage");
  const logoutButton = document.getElementById("logoutButton");
  const invoicesTable = document
    .getElementById("invoicesTable")
    .getElementsByTagName("tbody")[0];

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const usersResponse = await fetch(
      "https://bever-aca-assignment.azurewebsites.net/Users"
    );
    const usersData = await usersResponse.json();
    const users = usersData.value;
    const user = users.find(
      (user) => user.Name === username && user.Password === password
    );
    if (user) {
      loginFormSection.style.display = "none";
      mainPage.style.display = "block";
      logoutButton.style.display = "block";
      await fetchInvoices(user.UserId);
    } else {
      alert("Invalid username or password");
    }
  });

  logoutButton.addEventListener("click", function () {
    mainPage.style.display = "none";
    loginFormSection.style.display = "block";
    invoicesTable.innerHTML = "";
  });

  async function fetchInvoices(userId) {
    const invoicesResponse = await fetch(
      "https://bever-aca-assignment.azurewebsites.net/Invoices"
    );
    const invoicesData = await invoicesResponse.json();
    const userInvoices = invoicesData.value.filter(
      (invoice) => invoice.UserId === userId
    );

    userInvoices.forEach((invoice) => {
      const row = invoicesTable.insertRow();
      row.insertCell(0).innerText = invoice.Name;
      row.insertCell(1).innerText = new Date(
        invoice.PaidDate
      ).toLocaleDateString();
    });
  }
});
