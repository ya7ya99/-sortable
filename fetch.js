const mytable = document.getElementById("mytable"); // table in html
const search = document.getElementById("search") // search input
const Next = document.getElementsByClassName("next")[0] // next button
const prev = document.getElementsByClassName("prev")[0] // prev button
const last = document.getElementsByClassName("last")[0] // the last page 
const max = document.getElementsByClassName("max")[0] // the max page
const page = document.getElementsByClassName("page")[0] // the number of pages

let CurrentPage = 1
let defaultPage = 20;
let data;


// Fetch Section

fetch('https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json')
    .then((response) => response.json())
    .then((heroes) => {
        data = heroes;
        loadData(data);
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
    });


// Pagination Section

last.addEventListener("click", () => {
    CurrentPage = 1;
    loadCurrentPageData();
});

Next.addEventListener("click", () => {
    if (CurrentPage < Math.ceil(data.length / defaultPage)) {
        CurrentPage++;
        loadCurrentPageData();
    }
});

prev.addEventListener("click", () => {
    if (CurrentPage > 1) {
        CurrentPage--;
        loadCurrentPageData();
    }
});

max.addEventListener("click", () => {
    const maxPage = Math.ceil(data.length / defaultPage);
    CurrentPage = maxPage;
    loadCurrentPageData();
});

function loadCurrentPageData() {
    const start = (CurrentPage - 1) * defaultPage;
    const end = start + defaultPage;
    const pageData = data.slice(start, end);
    page.innerHTML = CurrentPage
    loadData(pageData);
}

document.getElementById("select").addEventListener("change", () => {
    CurrentPage = 1
    loadCurrentPageData()
    if (+select.value > 0 && +select.value <= data.length) {
        defaultPage = +select.value;
    } else if (select.value === "all") {
        defaultPage = data.length;
    }
    loadData(data);
});



// Loadata section

const loadData = (heroes) => {
    mytable.innerHTML = '';
    let pageCount = 0;
    const trhead = document.createElement("tr")
    trhead.innerHTML =
        `<th>Icon</th>
        <th data-sort="name">Name</th>
        <th data-sort="fullName">Full Name</th>
        <th data-sort="powerstats">Powerstats</th>
        <th data-sort="race">Race</th>
        <th data-sort="gender">Gender</th>
        <th data-sort="height">Height</th>
        <th data-sort="weight">Weight</th>
        <th data-sort="placeOfBirth">Place Of Birth </th>
        <th data-sort="alignment">Alignment</th>`
    mytable.appendChild(trhead)

    sort()

    for (let hero of heroes) {
        if (pageCount >= defaultPage) break;

        const tr = document.createElement("tr");

        const powers = `
            <ul>
                <li>Combat: ${hero.powerstats.combat}</li>
                <li>Durability: ${hero.powerstats.durability}</li>
                <li>Intelligence: ${hero.powerstats.intelligence}</li>
                <li>Power: ${hero.powerstats.power}</li>
                <li>Speed: ${hero.powerstats.speed}</li>
                <li>Strength: ${hero.powerstats.strength}</li>
            </ul>`;

        tr.innerHTML = `
            <td><img src="${hero.images.md}" alt="${hero.name}"></td>
            <td>${hero.name}</td>
            <td>${hero.biography.fullName}</td>
            <td>${powers}</td>
            <td>${hero.appearance.race}</td>
            <td>${hero.appearance.gender}</td>
            <td>${hero.appearance.height.join(', ')}</td>
            <td>${hero.appearance.weight.join(', ')}</td>
            <td>${hero.biography.placeOfBirth}</td>
            <td>${hero.biography.alignment}</td>
        `;
        mytable.appendChild(tr);
        pageCount++;
    }
}


// Search section

search.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredData = data.filter(hero => hero.name.toLowerCase().includes(searchTerm));
    loadData(filteredData);
});

// Sort Section

let sortOrder = {};
function sort() {
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.dataset.sort;
            sortOrder[key] = sortOrder[key] === 'asc' ? 'desc' : 'asc';
            sortHeroes(key, sortOrder[key]);
        });
    });

}

function sortHeroes(key, order) {
    const getValue = (hero, key) => {
        switch (key) {
            case 'name':
                return hero.name;
            case 'fullName':
                return hero.biography.fullName;
            case 'race':
                return hero.appearance.race;
            case 'gender':
                return hero.appearance.gender;
            case 'height':
                if (hero.appearance.height.length > 1) {
                    if (hero.appearance.height.length > 1 && hero.appearance.height[1].slice(-6) == 'meters') {
                        return hero.appearance.height[1] ? parseInt(hero.appearance.height[1]) * 100 : Infinity;
                    }
                    return hero.appearance.height[1] ? parseInt(hero.appearance.height[1]) : Infinity;
                } else {
                    return '-'
                }
            case 'weight':
                hero.appearance.weight[1] = hero.appearance.weight[1].replaceAll(',', '')
                if (hero.appearance.weight[1].slice(-4) == 'tons') {
                    return hero.appearance.weight[1] ? parseInt(hero.appearance.weight[1]) * 1000 : Infinity;
                }
                return hero.appearance.weight[1] ? parseInt(hero.appearance.weight[1]) : Infinity;
            case 'placeOfBirth':
                return hero.biography.placeOfBirth;
            case 'alignment':
                return hero.biography.alignment;
            case 'powerstats':
                return calculateTotalPowerstats(hero.powerstats);
            default:
                return '';
        }
    };

    data.sort((a, b) => {
        let aValue = getValue(a, key);
        let bValue = getValue(b, key);
        if (aValue === '' || aValue === null || aValue === undefined || aValue == '-' || aValue === NaN) return 1;
        if (bValue === '' || bValue === null || bValue === undefined || bValue == '-' || aValue === NaN) return -1;
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        if (aValue < bValue) return order === 'asc' ? -1 : 1;
        if (aValue > bValue) return order === 'asc' ? 1 : -1;
        return 0;
    });

    loadData(data);
}

function calculateTotalPowerstats(powerstats) {
    return Object.values(powerstats).reduce((total, stat) => total + (parseInt(stat) || 0), 0);
}