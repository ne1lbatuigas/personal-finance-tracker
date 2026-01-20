const form = document.getElementById('finance-form');
const list = document.getElementById('finance-list');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const description = document.getElementById('description').value;
  const amount = Number(document.getElementById('amount').value);
  const type = document.getElementById('type').value;

  const transaction = { description, amount, type };

  transactions.push(transaction);
  saveAndRender();
  form.reset();
});

function saveAndRender() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderTransactions();
  updateChart();
}

function renderTransactions() {
  list.innerHTML = "";
  transactions.forEach(t => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${t.description}</td>
      <td>${t.amount}</td>
      <td>${t.type}</td>
    `;
    list.appendChild(row);
  });
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

  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        data: [income, expense]
      }]
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

