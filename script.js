// Theme toggle logic
const modeToggle = document.getElementById('mode-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedMode = localStorage.getItem('theme-mode');
if (savedMode === 'light') {
  document.body.classList.add('light-mode');
  modeToggle.textContent = '☀️ Light Mode';
} else {
  document.body.classList.remove('light-mode');
  modeToggle.textContent = '🌙 Dark Mode';
}
modeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  modeToggle.textContent = isLight ? '☀️ Light Mode' : '🌙 Dark Mode';
  localStorage.setItem('theme-mode', isLight ? 'light' : 'dark');
  updateChart(); // Update chart label color on mode change
});
const form = document.getElementById('finance-form');
const list = document.getElementById('finance-list');


let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let editIndex = null;

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const description = document.getElementById('description').value;
  const amount = Number(document.getElementById('amount').value);
  const type = document.getElementById('type').value;

  const transaction = { description, amount, type };

  if (editIndex !== null) {
    transactions[editIndex] = transaction;
    editIndex = null;
  } else {
    transactions.push(transaction);
  }
  saveAndRender();
  form.reset();
  form.querySelector('button[type="submit"]').textContent = 'Add Entry';
});

function saveAndRender() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderTransactions();
  updateChart();
}

function renderTransactions() {
  list.innerHTML = "";
  transactions.forEach((t, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${t.description}</td>
      <td>${t.amount}</td>
      <td>${t.type}</td>
      <td>
        <button class="edit-btn" data-idx="${idx}">Edit</button>
        <button class="delete-btn" data-idx="${idx}">Delete</button>
      </td>
    `;
    list.appendChild(row);
  });

  // Attach event listeners for edit and delete
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const idx = this.getAttribute('data-idx');
      editTransaction(idx);
    });
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const idx = this.getAttribute('data-idx');
      deleteTransaction(idx);
    });
  });
}

function editTransaction(idx) {
  const t = transactions[idx];
  document.getElementById('description').value = t.description;
  document.getElementById('amount').value = t.amount;
  document.getElementById('type').value = t.type;
  editIndex = Number(idx);
  form.querySelector('button[type="submit"]').textContent = 'Update Entry';
}

function deleteTransaction(idx) {
  transactions.splice(idx, 1);
  saveAndRender();
}

// Load stored data on refresh
renderTransactions();

const ctx = document.getElementById('financeChart');
let chart;

function updateChart() {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  if (chart) chart.destroy();

  // Detect mode for label color
  const isLight = document.body.classList.contains('light-mode');
  const labelColor = isLight ? '#23283a' : '#f3f4f6';

  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        data: [income, expense]
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: labelColor,
            font: { weight: 'bold' }
          }
        }
      }
    }
  });
}

updateChart();

document.getElementById('export-btn').addEventListener('click', () => {
  let csv = "Description,Amount,Type\n";

  transactions.forEach(t => {
    csv += `${t.description},${t.amount},${t.type}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = "finance-data.csv";
  a.click();
});

