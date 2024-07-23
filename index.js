document.addEventListener("DOMContentLoaded", function () {
  //dom elements
  const loginForm = document.getElementById("loginForm");
  const loginFormSection = document.getElementById("loginFormSection");
  const mainPage = document.getElementById("mainPage");
  const logoutButton = document.getElementById("logoutButton");
  const usernameDisplay = document.getElementById("usernameDisplay");
  const invoicesTableBody = document
    .getElementById("invoicesTable")
    .getElementsByTagName("tbody")[0];
  const invoiceLinesTableBody = document
    .getElementById("invoiceLinesTable")
    .getElementsByTagName("tbody")[0];
  const invoiceLinesSection = document.getElementById("invoiceLinesSection");

  let products = [];
  let currentUser = null;

  //show login form on page load
  loginFormSection.style.display = "block";
  mainPage.style.display = "none";

  //event listeners
  loginForm.addEventListener("submit", handleLoginFormSubmit);
  logoutButton.addEventListener("click", handleLogout);

  //data fetch
  async function fetchData(endpoint) {
    const response = await fetch(
      `https://bever-aca-assignment.azurewebsites.net/${endpoint}`
    );
    const data = await response.json();
    return data.value;
  }

  //login form
  async function handleLoginFormSubmit(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const users = await fetchData("Users");
    const user = users.find(
      (user) => user.Name === username && user.Password === password
    );
    if (user) {
      currentUser = user;
      loginFormSection.style.display = "none";
      mainPage.style.display = "block";
      usernameDisplay.innerText = user.Name;
      usernameDisplay.style.display = "inline";
      logoutButton.style.display = "inline";
      await fetchProducts();
      await fetchInvoices(user.UserId);
    } else {
      alert("Invalid username or password");
    }
  }

  //logout
  function handleLogout() {
    mainPage.style.display = "none";
    loginFormSection.style.display = "block";
    usernameDisplay.style.display = "none";
    logoutButton.style.display = "none";
    invoicesTableBody.innerHTML = "";
    invoiceLinesTableBody.innerHTML = "";
    invoiceLinesSection.style.display = "none";
    currentUser = null;
  }

  //invoices fetch
  async function fetchInvoices(userId) {
    const invoices = await fetchData("Invoices");
    const userInvoices = invoices.filter(
      (invoice) => invoice.UserId === userId
    );
    invoicesTableBody.innerHTML = "";
    for (const invoice of userInvoices) {
      const row = invoicesTableBody.insertRow();
      addRadioButtonCell(row, invoice.InvoiceId);
      addTextCell(row, invoice.Name);
      addTextCell(row, new Date(invoice.PaidDate).toLocaleDateString());
      const invoiceTotalAmount = await calculateInvoiceTotalAmount(
        invoice.InvoiceId
      );
      addTextCell(row, invoiceTotalAmount.toFixed(2));
    }
  }

  //invoice lines fetch
  async function fetchInvoiceLines(invoiceId) {
    const invoiceLines = await fetchData("InvoiceLines");
    const filteredLines = invoiceLines.filter(
      (line) => line.InvoiceId === invoiceId
    );
    invoiceLinesTableBody.innerHTML = "";
    filteredLines.forEach((line) => {
      const row = invoiceLinesTableBody.insertRow();
      const product = products.find(
        (product) => product.ProductId === line.ProductId
      );
      const totalLineAmount = line.Quantity * product.Price;
      addTextCell(row, product.Name);
      addTextCell(row, product.Price.toFixed(2));
      addTextCell(row, line.Quantity);
      addTextCell(row, totalLineAmount.toFixed(2));
    });
    invoiceLinesSection.style.display = "block";
  }

  //products fetch
  async function fetchProducts() {
    products = await fetchData("Products");
  }

  //total amount calculation
  async function calculateInvoiceTotalAmount(invoiceId) {
    const invoiceLines = await fetchData("InvoiceLines");
    const filteredLines = invoiceLines.filter(
      (line) => line.InvoiceId === invoiceId
    );
    return filteredLines.reduce((total, line) => {
      const product = products.find(
        (product) => product.ProductId === line.ProductId
      );
      return total + line.Quantity * product.Price;
    }, 0);
  }

  //radio button
  function addRadioButtonCell(row, invoiceId) {
    const cell = row.insertCell();
    const radioBtn = document.createElement("input");
    radioBtn.type = "radio";
    radioBtn.name = "selectedInvoice";
    radioBtn.value = invoiceId;
    radioBtn.addEventListener("change", () => fetchInvoiceLines(invoiceId));
    cell.appendChild(radioBtn);
  }

  //insert corresponding text to a cell
  function addTextCell(row, text) {
    const cell = row.insertCell();
    cell.innerText = text;
  }
});
