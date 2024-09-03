// Krever nødvendige moduler
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const knex = require('knex');

// Konfigurerer tilkobling til PostgreSQL-databasen
const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'herollicob',
        database: 'loginformyaarsoppgave'
    }
})

// Oppretter en express-app
const app = express();

// Angir den initielle stien for statiske filer
let initialPath = path.join(__dirname, "public");

// Bruker body-parser for å tolke JSON-data
app.use(bodyParser.json());
// Setter opp statiske filer
app.use(express.static(initialPath));

// Definerer ruter for hovedsiden og andre sider
app.get('/', (req, res) => {
    res.sendFile(path.join(initialPath, "HTML/index.html"));
})
    
app.get('/login', (req, res) => {
    res.sendFile(path.join(initialPath, "HTML/Login.html"));
})

app.get('/register', (req, res) => {
    res.sendFile(path.join(initialPath, "HTML/register.html"));
})

// Behandler registrering av bruker
app.post('/register-user', (req, res) => {
    const { name, email, password } = req.body;

    // Sjekker om alle felt er fylt ut
    if(!name.length || !email.length || !password.length){
        res.json('fill all the fields');
    } else {
        // Setter inn bruker i databasen
        db("users").insert({
            name: name,
            email: email,
            password: password
        })
        .returning(["name", "email"])
        .then(data => {
            res.json(data[0])
        })
        .catch(err => {
            // Håndterer feil, for eksempel hvis e-posten allerede finnes i databasen
            if(err.detail.includes('already exists')){
                res.json('email already exists');
            }
        })
    }
})

// Behandler innlogging av bruker
app.post('/login-user', (req, res) => {
    const {email, password } = req.body;

    // Henter brukerinformasjon fra databasen
    db.select('name', 'email', 'id')
    .from('users')
    .where({
        email: email,
        password: password
    })
    .then(data => {
        if(data.length){
            res.json(data[0]);
        } else{
            res.json('email or password is incorrect');
        }
    })
})

// Behandler tillegging av element til handlekurven
app.post('/add-to-cart', async (req, res) => {
    try {
        const { userID, itemName, price, quantity } = req.body;

        // Setter inn element i handlekurven i databasen
        await db("shopping_cart").insert({
            user_id: userID,
            item_name: itemName,
            price: price,
            quantity: quantity,
        });

        res.status(201).json({ success: true, message: "Item added to cart successfully." });
    } catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// Behandler henting av elementer fra handlekurven
app.get('/get-cart-items', async (req, res) => {
    try {
        // Henter alle elementer fra shopping_cart-tabellen
        const items = await db("shopping_cart").select('*')

        // Sender tilbake hentede elementer
        res.status(200).json(items);
    } catch (error) {
        // Håndterer feil
        console.error("Error getting cart items:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// Lytter etter forespørsler på port 3000
app.listen(3000, () => {
    console.log('listening on port 3000......')
})
