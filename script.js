
document.addEventListener("DOMContentLoaded", loadExpenses);

const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const totalExpenses = document.getElementById("total-expenses");
const categorySummary = document.getElementById("category-summary");
const searchInput = document.getElementById("search");
const filterMonth = document.getElementById("filter-month");

let chart; // chart.js instance

// Add Expense
expenseForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const description = document.getElementById("description").value;
  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  if (description && amount && category && date) {
    const expense = { description, amount, category, date };
    saveExpense(expense);
    displayExpense(expense);
    updateSummary();
    expenseForm.reset();
  }
});

// Display Expense Row
function displayExpense(expense) {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${expense.description}</td>
    <td>₹${expense.amount}</td>
    <td>${expense.category}</td>
    <td>${expense.date}</td>
    <td>
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    </td>
  `;

  // Delete
  row.querySelector(".delete-btn").addEventListener("click", () => {
    row.remove();
    deleteExpense(expense);
    updateSummary();
  });

  // Edit
  row.querySelector(".edit-btn").addEventListener("click", () => {
    document.getElementById("description").value = expense.description;
    document.getElementById("amount").value = expense.amount;
    document.getElementById("category").value = expense.category;
    document.getElementById("date").value = expense.date;
    row.remove();
    deleteExpense(expense);
    updateSummary();
  });

  expenseList.appendChild(row);
}

// Save Expense to localStorage
function saveExpense(expense) {
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  expenses.push(expense);
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

// Load Expenses from localStorage
function loadExpenses() {
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  expenses.forEach(expense => displayExpense(expense));
  updateSummary();
}

// Delete Expense
function deleteExpense(expenseToDelete) {
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  expenses = expenses.filter(exp =>
    !(exp.description === expenseToDelete.description &&
      exp.amount === expenseToDelete.amount &&
      exp.category === expenseToDelete.category &&
      exp.date === expenseToDelete.date)
  );
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

// Update Summary + Chart
function updateSummary() {
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  let total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  totalExpenses.textContent = `Total Expenses: ₹${total}`;

  let categoryTotals = {};
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + parseFloat(exp.amount);
  });

  categorySummary.innerHTML = "";
  for (let cat in categoryTotals) {
    const p = document.createElement("p");
    p.textContent = `${cat}: ₹${categoryTotals[cat]}`;
    categorySummary.appendChild(p);
  }

  updateChart(categoryTotals);
}

// Chart.js
function updateChart(categoryTotals) {
  const ctx = document.getElementById("expenseChart").getContext("2d");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: ["#3498db", "#e74c3c", "#f39c12", "#2ecc71", "#9b59b6"]
      }]
    }
  });
}

// Filters
function applyFilters() {
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  let filtered = expenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(searchInput.value.toLowerCase()) ||
                          exp.category.toLowerCase().includes(searchInput.value.toLowerCase());

    const matchesMonth = filterMonth.value ? exp.date.startsWith(filterMonth.value) : true;

    return matchesSearch && matchesMonth;
  });

  expenseList.innerHTML = "";
  filtered.forEach(exp => displayExpense(exp));
  updateSummary();
}

function resetFilters() {
  searchInput.value = "";
  filterMonth.value = "";
  expenseList.innerHTML = "";
  loadExpenses();
}

// Dark Mode Toggle
const toggleBtn = document.getElementById("toggle-mode");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  if (document.body.classList.contains("dark-mode")) {
    toggleBtn.textContent = "☀️ Light Mode";
  } else {
    toggleBtn.textContent = "🌙 Dark Mode";
  }
});

