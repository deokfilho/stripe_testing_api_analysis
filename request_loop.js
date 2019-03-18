// import required modules
var stripe = require("stripe")("sk_test_0u689SMB55iSkwdUvd5523DQ");
const {MongoClient, ObjectID} = require('mongodb'); // destructuring
// const experiment = require('./experiment') // function to run


var obj = new ObjectID(); //new instance of ObjectID
const dbName = 'ie-experimentation'; // specifies what db to look at
const card_networks = ['tok_visa', 'tok_visa_debit', 'tok_mastercard_debit', 'tok_mastercard_prepaid', 'tok_amex', 'tok_discover', 'tok_diners', 'tok_jcb', 'tok_unionpay'];

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    if (err) {
        return console.log('Unable to connect to mongodb server'); // if err, return won't let success message play
    }
    console.log('Connected to MongoDB server');
    const db = client.db(dbName);



    async function experiment(token) {
        var i;
        var j = 100;
        var exp_start = new Date();
        for (i = 1; i<= j; i++){
            try{
                var start = new Date();
                const res = await callStripe(i, start, token);
                console.log(res)
                console.log('\n')
                await insert_db(res,token);

            }
            catch(error){
                console.log('dun goofed boio... ', error)
            }
        }
        var exp_finish = new Date() - exp_start
        console.log('\n\n\n**FINISHED TEST**\nTOTAL TIME: ', exp_finish * .001, 'sec\nAVG.  TIME: ', exp_finish / j * .001, 'sec\n\n')
        client.close();
    }



    async function callStripe(i, start, token) {
        const charge = await stripe.charges.create({
            amount: 999,
            currency: 'usd',
            description: 'Example charge',
            source: token,
        });
        var cur = new Date()
        const result = {
            'testnum': i,
            'initiated': cur,
            'duration': cur - start,
            'id': charge.id
        }
        // console.log(result)
        // console.log('\n\n')
        return result
    }

    async function insert_db(res,token) {
        db.collection(token).insertOne({
            token_used:token,
            charge_obj:res
            }, (err, result) => {
              if (err) {
                return console.log('Unable to insert charge', err);
              }
            })
    }

    card_networks.forEach((token) => {
        experiment(token);
    })


});


