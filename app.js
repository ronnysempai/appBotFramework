var restify = require('restify');
var builder = require('botbuilder');
var Promise = require('bluebird');
var request = require('request-promise').defaults({ encoding: null });
var http = require('http');
var fs = require('fs');
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
var bot = new builder.UniversalBot(connector, [
    function (session) {
        session.send("Hola.");
        session.beginDialog('rootMenu');
    },
    function (session, results) {
        session.endConversation("Fue un placer servirle.");
    }
]);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

/*bot.dialog('/', function (session) {
    session.send("Hello World");
});
*/
var c=0;
var card=1;
var selectedCardName=3;
var recibiendoImagen=0;
var comisarias='Informacion de Comisarias \n';
var hospitales='Informacion de Hospitales \n';
var denuncias='Denuncias';
var CardNames = [comisarias,hospitales,denuncias];

bot.dialog('rootMenu', [
    function (session) {
        console.log(session.message.text);
        recibirImagen(session);
        builder.Prompts.choice(session, 'Buenos dias,este es el canal informativo de atencion ciudadana'
        +' puedes elegir una opcion de la siguiente lista ,Que opcion quieres?', CardNames, {
            maxRetries: 3,
            retryPrompt: 'disculpe, se ingreso una opcion invalida'
        });

    },
    function (session, results){
        
        selectedCardName = results.response.entity;
        console.log(results.response);
        if(selectedCardName!=denuncias){
            card = seleccionarOpcion(selectedCardName, session);
        // attach the card to the reply message
        var msg = new builder.Message(session).addAttachment(card);
        session.send(msg);    
        }else{
            console.log('*************** imagen***********************');
            session.send("Ahora ud puede enviar la imagen de su denuncia.");
            session.beginDialog('recibirImagen');

        }
    }
]);

bot.dialog('recibirImagen', [
    function (session) {
        recibirImagen(session);
    },
    function (session, results) {
        
        
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
            builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', 'Mas Informacion')
        ]);
}

function createCardInformacionComisarias(session){
    //var listaComisarias="Distrito 1-Sur Lugar: Instalaciones de la Comisaría del distrito, ubicado en la ciudadela Nueve de Octubre, calle Sexta y Av. Séptima (atrás de APROFE).(Contacto: Comisario de Policía, Abg. Félix Lavayen Consuegra, 0999642149)"
    var listaComisarias="Distrito 1-Sur "
    +" "
    //+"Distrito 2-Esteros Lugar: Instalaciones de la Comisaría del distrito, ubicada en la Unidad de Vigilancia Comunitaria (UVC), en la ciudadela Los Esteros diagonal al colegio José María Egas. (Contacto: Comisario de Policía, Abg. Luis Vivar Gaybort, 0997953241)";
    +"Distrito 2-Esteros "
    +"Distrito 3-Nueve de Octubre "
    +"Distrito 4-Portete "
    +"Distrito 5-Centro ";
    
    return new builder.HeroCard(session)
        .title('Comisarias Comisarias')
        .subtitle('—')
        .text(listaComisarias)
        .images([
            //builder.CardImage.create(session, 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg')
            builder.CardImage.create(session, 'https://lh6.ggpht.com/U0n-NfYLqO7WMRHElgPgKyXDtDbwwzzAznk2HrL5o-rXzy-N-uqQ0qWVKDkWWz8TAaM=w300')
        ])
        .buttons([
            builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', 'Mas Informacion')
        ]);
}

/*function createCardInformacionHospitales(session){
    //var listaComisarias="Distrito 1-Sur Lugar: Instalaciones de la Comisaría del distrito, ubicado en la ciudadela Nueve de Octubre, calle Sexta y Av. Séptima (atrás de APROFE).(Contacto: Comisario de Policía, Abg. Félix Lavayen Consuegra, 0999642149)"
    var listaComisarias="Distrito 1-Sur "
    +" <b> - </b>"
    //+"Distrito 2-Esteros Lugar: Instalaciones de la Comisaría del distrito, ubicada en la Unidad de Vigilancia Comunitaria (UVC), en la ciudadela Los Esteros diagonal al colegio José María Egas. (Contacto: Comisario de Policía, Abg. Luis Vivar Gaybort, 0997953241)";
    +"Distrito 2-Esteros "
    +"Distrito 3-Nueve de Octubre "
    +"Distrito 4-Portete "
    +"Distrito 5-Centro ";
    
    return new builder.HeroCard(session)
        .title('Comisarias Comisarias')
        .subtitle('—')
        .text(listaComisarias)
        .images([
            //builder.CardImage.create(session, 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg')
            builder.CardImage.create(session, 'https://lh6.ggpht.com/U0n-NfYLqO7WMRHElgPgKyXDtDbwwzzAznk2HrL5o-rXzy-N-uqQ0qWVKDkWWz8TAaM=w300')
        ])
        .buttons([
            builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', 'Mas Informacion')
        ]);
}*/

function createCardInformacionHospitales2(session) {
    var listaComisarias="Distrito 1-Sur "
    +" "
    +"Distrito 2-Esteros "
    +"Distrito 3-Nueve de Octubre "
    +"Distrito 4-Portete "
    +"Distrito 5-Centro ";
    return new builder.ThumbnailCard(session)
        .title('Hospitales')
        .subtitle('-')
        .text('-\n'+listaComisarias)
        .images([
            builder.CardImage.create(session, 'https://lh6.ggpht.com/U0n-NfYLqO7WMRHElgPgKyXDtDbwwzzAznk2HrL5o-rXzy-N-uqQ0qWVKDkWWz8TAaM=w300')
        ])
        .buttons([
            builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', 'Mas Informacion')
        ]);
}

function seleccionarOpcion(selectedCardName, session) {
    switch (selectedCardName) {
        case comisarias:
            return createCardInformacionComisarias(session);
        case hospitales:
            return createCardInformacionHospitales2(session);
        case denuncias:
            return 1;    
        default:
            return 0;
    }
}

/**/
/*
*/
function recibirImagen(session){

    var msg = session.message;
    if (msg.attachments.length){
        // Message with attachment, proceed to download it.
        // Skype & MS Teams attachment URLs are secured by a JwtToken, so we need to pass the token from our bot.
        var attachment = msg.attachments[0];
        var fileDownload = checkRequiresToken(msg)
            ? requestWithToken(attachment.contentUrl)
            : request(attachment.contentUrl);

        fileDownload.then(
            function (response) {
                // Send reply with attachment type & size
                var mensajeExito='La imagen ha sido cargada exitosamente.';
                var reply = new builder.Message(session)
                    //.text('Attachment of %s type and size of %s bytes received.', attachment.contentType, response.length);
                    .text(mensajeExito);
                console.log(attachment);
                //guardarImagen(attachment.contentUrl);    
                session.send(reply);
                session.endDialog("");
            }).catch(function (err) {
                console.log('Error downloading attachment:', { statusCode: err.statusCode, message: err.response.statusMessage });
            });

    } /*else {
        // No attachments were sent
        var reply = new builder.Message(session)
        .text('Ahora ud puede enviar la imagen de su denuncia.');
        session.send(reply);
    }*/
    
}
function guardarImagen(url){
    var file = fs.createWriteStream("file.jpg");
    var request = http.get(url, function(response) {
        response.pipe(file);
    });
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
