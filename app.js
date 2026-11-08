// Module 13: Portfolios and Items are saved on the server (EC2), not in localStorage
let portfolios = [];          // copy of the server data
let selectedId = null;        // which Portfolio is shown on the right

// ---------- Talk to the server ----------

// GET: ask the server for all Portfolios
async function loadPortfolios() {
    const response = await fetch('api/portfolios.php');
    portfolios = await response.json();
    showPortfolioList();
    showSelectedPortfolio();
}

// POST: send ONE new thing to the server as form fields (FormData)
async function postForm(url, formData) {
    const response = await fetch(url, {
        method: 'POST',
        body: formData                  // same fields a normal form submit would send
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || 'Could not save');
    }
    return result;
}

// ---------- Show data on the page ----------

function showPortfolioList() {
    const list = document.querySelector('#portfolio-list');
    list.innerHTML = '';
    document.querySelector('#list-empty').hidden = portfolios.length > 0;
    for (const portfolio of portfolios) {
        const button = document.createElement('button');
        button.className = 'btn btn-light portfolio-btn text-start';
        if (portfolio.id === selectedId) button.classList.add('active');
        button.textContent = portfolio.displayName + ' (' + portfolio.items.length + ' items)';
        button.addEventListener('click', () => {
            selectedId = portfolio.id;
            showPortfolioList();
            showSelectedPortfolio();
        });
        list.appendChild(button);
    }
}

function showSelectedPortfolio() {
    const portfolio = portfolios.find(p => p.id === selectedId);
    if (!portfolio) return;
    document.querySelector('#portfolio-name').textContent = portfolio.displayName;
    document.querySelector('#portfolio-enjoy').textContent = portfolio.whatIEnjoy;
    document.querySelector('#portfolio-tried').textContent = portfolio.whatIveTried;
    document.querySelector('#portfolio-curious').textContent = portfolio.whatImCuriousAbout;

    const list = document.querySelector('#item-list');
    list.innerHTML = '';
    for (const item of portfolio.items) {
        const card = document.createElement('div');
        card.className = 'item-card rounded-3 p-3';
        const title = document.createElement('h3');
        title.className = 'h6 fw-bold mb-1';
        title.textContent = item.title + ' · ' + item.type + ' · ' + item.date;
        const text = document.createElement('p');
        text.className = 'small mb-1';
        text.textContent = item.description + ' — Skills: ' + item.skills.join(', ');
        card.append(title, text);
        for (const url of item.evidence) {
            const link = document.createElement('a');
            link.href = url;
            link.textContent = url;
            link.target = '_blank';
            link.className = 'small d-block';
            card.appendChild(link);
        }
        list.appendChild(card);
    }
}

// ---------- Forms ----------

document.querySelector('#portfolio-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const error = document.querySelector('#portfolio-error');
    try {
        const formData = new FormData(event.target);   // every input that has a name
        const created = await postForm('api/portfolios.php', formData);
        error.textContent = '';
        event.target.reset();
        selectedId = created.id;
        await loadPortfolios();          // read back from the server
    } catch (e) {
        error.textContent = e.message;
    }
});

document.querySelector('#item-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const error = document.querySelector('#item-error');
    if (!selectedId) {
        error.textContent = 'Choose a Portfolio first.';
        return;
    }
    try {
        const formData = new FormData(event.target);
        formData.append('portfolioId', selectedId);    // which Portfolio this Item belongs to
        await postForm('api/items.php', formData);
        error.textContent = '';
        event.target.reset();
        await loadPortfolios();          // read back from the server
    } catch (e) {
        error.textContent = e.message;
    }
});

loadPortfolios();   // when the page opens
