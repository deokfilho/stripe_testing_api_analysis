// import required modules
var stripe = require("stripe")('sk_test_QUj6ryULIrBzRhJDb8D2cZgM');
const {MongoClient, ObjectID} = require('mongodb'); // destructuring
// const experiment = require('./experiment') // function to run
var ping = require("net-ping");
const target = "103.246.38.196";


var obj = new ObjectID(); //new instance of ObjectID
const dbName = 'ping_usd'; // specifies what db to look at
// const card_networks = ['tok_visa', 'tok_visa_debit', 'tok_mastercard_debit', 'tok_mastercard_prepaid', 'tok_amex', 'tok_discover', 'tok_diners', 'tok_jcb', 'tok_unionpay', 'tok_br','tok_ca','tok_mx'];
const card_networks = ['tok_visa', 'tok_visa_debit', 'tok_mastercard_debit'];
var no_tests = 100

var session = ping.createSession ();
const sent = new Date();

function get_ping(){
    return new Promise(resolve=>{
        session.pingHost(target, function (error, target) {
            if (error)
                console.log (target + ": " + error.toString ());
            else{
                const rcvd = new Date() - sent;
                console.log (target + ": Alive");
                resolve(rcvd)
            }
        });
    });
}

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
                    async function final() {
                        var result = await get_ping();
                        const start_time = new Date();
                        await stripe.charges.create(charge_info).then((charge) => {
                            const end_time = new Date();
                            const transaction = {
                                token_used: token,
                                transaction_speed: end_time - start_time,
                                ping:result,
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
                final();
                }
            });
        resolve(0)
        // client.close()
    }

    experiment().then((result) => {
        client.close()
    }).catch((err)=>{
        console.log("Some errors were made during the experiment",err)
    })

});

