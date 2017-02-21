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
    function (session, results){
            session.send('Hola %s!', results.response);
            // create the card based on selection
            var selectedCardName = results.response.entity;
            //var card = createCard(selectedCardName, session);
            var card = createMyCard(session);
            // attach the card to the reply message
            var msg = new builder.Message(session).addAttachment(card);
            session.send(msg);       
    }
]);

function createMyCard(session) {
    return new builder.HeroCard(session)
        .title('Recepcion de Denuncias')
        .subtitle(' — ')
        .text('-')
        .images([
            //builder.CardImage.create(session, 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg')
            builder.CardImage.create(session, 'https://lh6.ggpht.com/U0n-NfYLqO7WMRHElgPgKyXDtDbwwzzAznk2HrL5o-rXzy-N-uqQ0qWVKDkWWz8TAaM=w300')
        ])
        .buttons([
            builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', 'Get Started')
        ]);
}
