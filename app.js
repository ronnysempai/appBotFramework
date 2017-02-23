var restify = require('restify');
var builder = require('botbuilder');
var Promise = require('bluebird');
var request = require('request-promise').defaults({ encoding: null });
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
var cadenaMenu="Si deseas enviar una imagen ingresa 1";
bot.dialog('/', [
    function (session) {
        c=0;
        console.log(session.message.text);
        builder.Prompts.text(session, 'Hola, soy el agente de recepcion de denuncias Cual es tu nombre?');
        //builder.Prompts.text(session, 'Cual es tu nombre?');
        
    },
    function (session, results){
            //session.send('Hola %s!', results.response);
            //session.send('%s',cadenaMenu);
            // create the card based on selection
            //var selectedCardName = results.response.entity;
            //var card = createCard(selectedCardName, session);
            //var card = createMyCard(session);
            // attach the card to the reply message
            //var msg = new builder.Message(session).addAttachment(card);
            //session.send(msg);       
            recibirImagen(session);
    }
]);

function createMyCard(session) {
    return new builder.HeroCard(session)
        .title('Atencion Ciudadana')
        .subtitle('—')
        .text('Por favor presione un boton para escojer una opcion del siguiente menu.')
        .images([
            //builder.CardImage.create(session, 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg')
            builder.CardImage.create(session, 'https://lh6.ggpht.com/U0n-NfYLqO7WMRHElgPgKyXDtDbwwzzAznk2HrL5o-rXzy-N-uqQ0qWVKDkWWz8TAaM=w300')
        ])
        .buttons([
            builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', 'Enviar una foto')
        ]);
}


/**/
/*
*/
function recibirImagen(session){
        var msg = session.message;
    if (msg.attachments.length) {

        // Message with attachment, proceed to download it.
        // Skype & MS Teams attachment URLs are secured by a JwtToken, so we need to pass the token from our bot.
        var attachment = msg.attachments[0];
        var fileDownload = checkRequiresToken(msg)
            ? requestWithToken(attachment.contentUrl)
            : request(attachment.contentUrl);

        fileDownload.then(
            function (response) {

                // Send reply with attachment type & size
                var reply = new builder.Message(session)
                    .text('Attachment of %s type and size of %s bytes received.', attachment.contentType, response.length);
                session.send(reply);

            }).catch(function (err) {
                console.log('Error downloading attachment:', { statusCode: err.statusCode, message: err.response.statusMessage });
            });

    } else {

        // No attachments were sent
        var reply = new builder.Message(session)
            .text('Hi there! This sample is intented to show how can I receive attachments but no attachment was sent to me. Please try again sending a new message with an attachment.');
        session.send(reply);
    }

}
// Request file with Authentication Header
var requestWithToken = function (url) {
    return obtainToken().then(function (token) {
        return request({
            url: url,
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/octet-stream'
            }
        });
    });
};

// Promise for obtaining JWT Token (requested once)
var obtainToken = Promise.promisify(connector.getAccessToken.bind(connector));

var checkRequiresToken = function (message) {
    return message.source === 'skype' || message.source === 'msteams';
};
