var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: '661ed9ab-edf1-4d04-99a8-8eb99ec982dd',//process.env.MICROSOFT_APP_ID,
    appPassword: 'HfytdoRJWjeubfuUkXzYEhV'//process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

/*bot.dialog('/', function (session) {
    session.send("Hello World");
});
*/
var c=0;
bot.dialog('/', [
    function (session) {
        c=0;
        console.log(session.message.text);
        builder.Prompts.text(session, 'Hola, soy el agente de recepcion de denuncias Cual es tu nombre?');
        //builder.Prompts.text(session, 'Cual es tu nombre?');
    },
    function (session, results) {
        c++;
        session.send('Hola %s!', results.response);
        if(c>0){
            // create the card based on selection
            var selectedCardName = results.response.entity;
            var card = createCard(selectedCardName, session);

            // attach the card to the reply message
            var msg = new builder.Message(session).addAttachment(card);
            session.send(msg);       
        }
        
    }
]);