// import required modules
var stripe = require("stripe")('sk_test_QUj6ryULIrBzRhJDb8D2cZgM');
const {MongoClient, ObjectID} = require('mongodb'); // destructuring
// const experiment = require('./experiment') // function to run


var obj = new ObjectID(); //new instance of ObjectID
const dbName = 'ie-experimentation'; // specifies what db to look at
// const card_networks = ['tok_visa', 'tok_visa_debit', 'tok_mastercard_debit', 'tok_mastercard_prepaid', 'tok_amex', 'tok_discover', 'tok_diners', 'tok_jcb', 'tok_unionpay', 'tok_br','tok_ca','tok_mx'];
const card_networks = ['tok_visa', 'tok_visa_debit', 'tok_mastercard_debit', 'tok_mastercard_prepaid'];
var no_tests = 550



MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    if (err) {
        return console.log('Unable to connect to mongodb server'); // if err, return won't let success message play
    }
    console.log('Connected to MongoDB server');
    const db = client.db(dbName);

    async function experiment() {
        card_networks.forEach(async (token) => {
            for (let i = 0; i <= no_tests; i++) {
                let charge_info = {
                    amount: 500,
                    currency: 'hkd',
                    description: 'Example charge',
                    source: token,
                };
                const start_time = new Date();
                await stripe.charges.create(charge_info).then((charge) => {
                    const end_time = new Date();
                    const transaction = {
                        token_used: token,
                        transaction_speed: end_time - start_time,
                        charge_obj: charge
                    };
                    db.collection(token).insertOne(transaction, (err, result) => {
                        if (err) {
                            return console.log('Unable to insert charge', err);
                        }
                    });
                }).catch((err) => {
                    console.log('Stripe did not return a charge object', err)
                });

            }
        });
        // resolve(0)
        // client.close()
    }

    experiment()
    //     .then((result) => {
    //     client.close()
    // }).catch((err)=>{
    //     console.log("Some errors were made during the experiment",err)
    // })

});

