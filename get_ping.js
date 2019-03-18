var ping = require ("net-ping");
const target = "54.187.182.230";

var session = ping.createSession ();


function get_ping(){
    return new Promise(resolve=>{
        var sent = new Date();
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

async function final(){
    var result = await get_ping();
    return result
}

