// Lytter etter når DOM er lastet
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');

    // Sjekker om brukeren er logget inn basert på session storage
    if (sessionStorage.name) {
        // Brukeren er logget inn
        loginButton.textContent = "Logout";
        // Legger til en hendelseslytter for å logge ut brukeren
        loginButton.addEventListener('click', () => {
            sessionStorage.clear();
            window.location.reload(); // Oppdaterer siden for å gjenspeile endringer
        });
    } else {
        // Brukeren er ikke logget inn
        loginButton.innerHTML = '';
        // Legger til en lenke for å logge inn eller registrere seg
        loginButton.innerHTML += `<a href="./HTML/Login.html">Login / Register</a>`;
    }
});

// Legger til et produkt i handlekurven
const addToShoppingCart = async (product) => {
    try {
        // Sender en forespørsel om å legge til produkt i handlekurven
        const response = await fetch('/add-to-cart', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userID: sessionStorage.userID,
                itemName: product.itemName,
                price: product.price,
                quantity: product.quantity,
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data) {
            console.log(data);
        } else {
            console.log('Empty response');
        }
    } catch (error) {
        console.error('Error:', error);
        // Omdiriger til feilside eller innloggingsside ved feil
    }
}

// Kjøres hvis det er et skjema til stede
if (document.querySelector(".form")) {
    const form = [...document.querySelector('.form').children];

    // Viser skjemaet med en forsinkelse for animasjon
    form.forEach((item, i) => {
        setTimeout(() => {
            item.style.opacity = 1;
        }, i * 100);
    })

    // Henter skjemaelementene
    const name = document.querySelector('.name') || null;
    const email = document.querySelector('.email');
    const password = document.querySelector('.password');
    const submitBtn = document.querySelector('.submit-btn');

    // Legger til hendelseslyttere basert på om det er innloggingsside eller registreringsside
    if (name == null) { // Innloggingsside
        submitBtn.addEventListener('click', () => {
            fetch('/login-user', {
                method: 'post',
                headers: new Headers({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({
                    email: email.value,
                    password: password.value
                })
            })
                .then(res => res.json())
                .then(data => {
                    validateData(data);
                    console.log(JSON.stringify(data));
                })
        })
    } else { // Registreringsside
        submitBtn.addEventListener('click', () => {
            fetch('/register-user', {
                method: 'post',
                headers: new Headers({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({
                    name: name.value,
                    email: email.value,
                    password: password.value
                })
            })
                .then(res => res.json())
                .then(data => {
                    validateData(data);
                })
        })
    }
}

// Validerer data og håndterer resultatet
const validateData = (data) => {
    if (!data.name) {
        alertBox(data);
    } else {
        sessionStorage.name = data.name;
        sessionStorage.email = data.email;
        sessionStorage.userID = data.id;
        location.href = '/';
    }
}

// Viser en varselboks med en melding
const alertBox = (data) => {
    const alertContainer = document.querySelector('.alert-box');
    const alertMsg = document.querySelector('.alert');
    alertMsg.innerHTML = data;

    alertContainer.style.top = `5%`;
    setTimeout(() => {
        alertContainer.style.top = null;
    }, 5000);
}

// Henter elementene i handlekurven og viser dem
const showItemsInShoppingCart = async () => {
    try {
        // Henter elementer fra handlekurven
        const response = await fetch('/get-cart-items');

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Pars responsen som JSON
        const items = await response.json();

        // Får tak i handlekurv-elementet
        let shoppingBag = document.getElementById("shoppingCartItems");

        // Tømmer tidligere innhold
        shoppingBag.innerHTML = "";

        if (items.length === 0) {
            // Ingen elementer i handlekurven
            const noItemsMessage = document.createElement('div');
            noItemsMessage.textContent = "There are no items in your bag";
            shoppingBag.appendChild(noItemsMessage);
        } else {
            // Viser elementer i handlekurven
            items.forEach(item => {
                // Lager et nytt div-element for hvert element
                const itemElement = document.createElement('div');

                // Setter innerHTML av div med elementdetaljer
                itemElement.innerHTML = `
                    <div class="shoppingCart_item">
                        <span id="shoppingCart_itemName">${item.item_name}</span>
                    </div>
                `;
                document.querySelector('#shoppingCartQuantity').innerHTML += `
                    <span id="shoppingCart_itemQuantity">Quantity: ${item.quantity}</span>
                    `;
                document.querySelector('#shoppingCartPrice').innerHTML += `
                    <span id="shoppingCart_itemPrice">Price: ${item.price}</span>
                    `;
                
                // Legger til elementet i handlekurven
                shoppingBag.appendChild(itemElement);
            });
        }
    } catch (error) {
        // Håndterer feil
        console.error('Error getting cart items:', error);
        // Kan vise en feilmelding til brukeren
    }
}