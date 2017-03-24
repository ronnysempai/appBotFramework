var restify = require('restify');
var builder = require('botbuilder');
var Promise = require('bluebird');
var request = require('request-promise').defaults({ encoding: null });
var http = require('http');
var fs = require('fs'),
    needle = require('needle'),
    //request = require('request'),
    speechService = require('./speech-service.js'),
    url = require('url');
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
var comisarias='Comisarias \n';
var hospitales='Hospitales \n';
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
        
        selectedOption = results.response.entity;
        
        if(selectedOption!=denuncias){
            card = seleccionarOpcion(selectedOption, session);
        // attach the card to the reply message
        var msg = new builder.Message(session).addAttachment(card);
        session.send(msg);    
        }else{
            session.beginDialog('denuncias');
        }   
    }
]);

bot.dialog('denuncias', [
    function (session, args) {
        builder.Prompts.choice(session, "Escoja una opcion.", ["Texto","Voz","Foto"], {
            maxRetries: 3,
            retryPrompt: 'disculpe, se ingreso una opcion invalida'
        });
        
    },
    function (session, results) {
        var opcion = results.response.entity;      
        switch (opcion){
            case 'Foto':
                    console.log('*************** imagen***********************');
                    session.send("Ahora ud puede enviar la imagen de su denuncia.");
                    session.beginDialog('recibirImagen');    
                break;
            case 'Voz':
                session.beginDialog('enviaVoz');
                break;
            case 'Texto':
                //session.beginDialog('ingreseTexto');
                session.send("Ahora ud puede enviar su denuncia como un mensaje:");
                session.beginDialog("ingreseTexto");
                break;  
             default:
                session.endDialog("");     
                break;
            }
    }
]);

bot.dialog('ingreseTexto', [
    function (session) {
    builder.Prompts.text(session, "Por favor envie su Ubicacion.");
    var data = { method: "sendMessage", parameters: { text: "<b>Por favor Comparta su Ubicacion o su Contacto.</b>", parse_mode: "HTML", reply_markup: { keyboard: [ [ { text: "Comparta su Ubicacion", request_location: true } ],[ { text: "Comparta su Contacto", request_contact: true } ] ] } } };
    const message = new builder.Message(session);
    message.setChannelData(data);
    session.send(message);
    },
    function (session, results) {
        
        if(session.message.entities.length != 0){
            session.userData.lat = session.message.entities[0].geo.latitude;
            session.userData.lon = session.message.entities[0].geo.longitude;
            console.log('//////Latitud:'+session.message.entities[0].geo.latitude);
            console.log('//////Longitud:'+session.message.entities[0].geo.longitude);
            session.endDialog();
        }else
        if(session.message.sourceEvent.message.contact){
            console.dir(session.message.sourceEvent.message.contact);    
        }
        else{
            session.endDialog("Sorry, I didn't get your location.");
        }
        session.endDialog(""); 
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
    var listaComisarias="Distrito 1-Sur "
    +" "
    //+"Distrito 2-Esteros Lugar: Instalaciones de la Comisaría del distrito, ubicada en la Unidad de Vigilancia Comunitaria (UVC), en la ciudadela Los Esteros diagonal al colegio José María Egas. (Contacto: Comisario de Policía, Abg. Luis Vivar Gaybort, 0997953241)";
    +'\n\nDistrito 2-Esteros '
    +"Distrito 3-Nueve de Octubre "
    +"Distrito 4-Portete "
    +"Distrito 5-Centro ";   
    return new builder.HeroCard(session)
        .title('Comisarias Comisarias')
        //.subtitle('—')
        .text(listaComisarias)
        .images([
            builder.CardImage.create(session, 'https://lh6.ggpht.com/U0n-NfYLqO7WMRHElgPgKyXDtDbwwzzAznk2HrL5o-rXzy-N-uqQ0qWVKDkWWz8TAaM=w300')
        ])
        .buttons([
            builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', 'Mas Informacion')
        ]);
}

function createCardInformacionHospitales2(session) {
    var listaComisarias="Distrito 1-Sur "
    +" "
    +"Distrito 2-Esteros "
    +"Distrito 3-Nueve de Octubre "
    +"Distrito 4-Portete "
    +"Distrito 5-Centro ";

    return new builder.ThumbnailCard(session)
        .title('Hospitales')
        //.subtitle('-')
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

/*codigo recibir Imagen*/
bot.dialog('recibirImagen', [
    function (session) {
        recibirImagen(session);
    },
    function (session, results) {
        
        
    }
]);

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
                guardarImagen(attachment.contentUrl);    
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
    console.log('CREANDO ARCHIVO PARA IMAGEN ');
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
/*--fin codigo recibir Imagen-*/

/*codigo para voz*/
bot.dialog('enviaVoz', session => {
    if (hasAudioAttachment(session)) {
        var stream = getAudioStreamFromAttachment(session.message.attachments[0]);
        console.log('/////////////Audio/////////////');
        proccesSpeechToText(session.message.attachments[0].contentUrl,function(text){
            session.send(processText(text));
            session.endDialog("");
        });
        /*console.log(session.message.attachments[0]);
        speechService.getTextFromAudioStream(stream)
            .then(text => {
                session.send(processText(text));
                session.endDialog("");
            })
            .catch(error => {
                session.send('Oops! Something went wrong. Try again later.');
                console.error(error);
            });*/
    } else {
        //session.send('Enviaste una nota de voz? Escucho mas de una persona. Trata de nuevo , por favor');
        session.send('Por favor envia una nota de voz? ');
    }
});
//=========================================================
// Utilities
//=========================================================
const hasAudioAttachment = session => {
    return session.message.attachments.length > 0 &&
        (session.message.attachments[0].contentType === 'audio/wav' || 
            session.message.attachments[0].contentType === 'audio/ogg' ||
            session.message.attachments[0].contentType === 'audio/oga' ||
         session.message.attachments[0].contentType === 'application/octet-stream');
};

const getAudioStreamFromAttachment = attachment => {
    var headers = {};
    if (isSkypeAttachment(attachment)) {
        // The Skype attachment URLs are secured by JwtToken,
        // you should set the JwtToken of your bot as the authorization header for the GET request your bot initiates to fetch the image.
        // https://github.com/Microsoft/BotBuilder/issues/662
        connector.getAccessToken((error, token) => {
            var tok = token;
            headers['Authorization'] = 'Bearer ' + token;
            headers['Content-Type'] = 'application/octet-stream';

            return needle.get(attachment.contentUrl, { headers: headers });
        });
    }
    headers['Content-Type'] = attachment.contentType;
    return needle.get(attachment.contentUrl, { headers: headers });
};

const isSkypeAttachment = attachment => {
    if (url.parse(attachment.contentUrl).hostname.substr(-'skype.com'.length) === 'skype.com') {
        return true;
    }
    return false;
};

const processText = (text) => {
    var result = '\n\nEsta es tu denuncia : ' + text + '.';
    if (result.match("nombre") || result.match("NOMBRE") ) {
        var iNombre=text.toLowerCase().indexOf("nombre es")+9;
        var fNombre=text.indexOf(" ",iNombre);
        var nombre=text.substr(iNombre, fNombre);
        result="Hola "+nombre+' '+result;
    }
    if (text && text.length > 0 && false) {
        const wordCount = text.split(' ').filter(x => x).length;
        result += '\n\nConteo de Palabras: ' + wordCount;

        const characterCount = text.replace(/ /g, '').length;
        result += '\n\nConteo de Caracteres: ' + characterCount;

        const spaceCount = text.split(' ').length - 1;
        result += '\n\nConteo de espacios: ' + spaceCount;

        const m = text.match(/[aeiou]/gi);
        const vowelCount = m === null ? 0 : m.length;
        result += '\n\nConteo de Vocales: ' + vowelCount;
    }
    return result;
};
/*------------------------------*/
/**/
/*Speech-to-Text Watson*/
var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
var speech_to_text = new SpeechToTextV1 ({
  username: "d147be33-ef46-4d02-9322-a27fc1e93a92",
  password: "fsEZQSFcYcV3"
});

var params = {
  model: 'es-ES_NarrowbandModel',
  content_type: 'audio/ogg',
  continuous: true,
  'interim_results': true,
  'max_alternatives': 3,
  'word_confidence': false,
  timestamps: false,
  keywords: ['colorado', 'tornado', 'tornadoes'],
  'keywords_threshold': 0.5
};
// Create the stream.
//var recognizeStream = speech_to_text.createRecognizeStream(params);
var recognizeStream;
function proccesSpeechToText(url,fnSuccess){
    var name_file='file_2.oga';
    recognizeStream= speech_to_text.createRecognizeStream(params)
// Pipe in the audio.
//fs.createReadStream(name_file).pipe(recognizeStream);
    url = url.replace('https:', 'http:');
    console.log(url);
    http.get(url, response => {
      response.pipe(recognizeStream);
      transcription(fnSuccess);
    }); 
}

function transcription(fnSuccess){
// Pipe out the transcription to a file.
//recognizeStream.pipe(fs.createWriteStream('transcription.txt'));
// Get strings instead of buffers from 'data' events.
recognizeStream.setEncoding('utf8');
// Listen for events.
recognizeStream.on('results', function(event) { onEvent('Results:', event); });
recognizeStream.on('data', function(event) { onEvent('Data:', event); });
recognizeStream.on('error', function(event) { onEvent('Error:', event); });
recognizeStream.on('close', function(event) { onEvent('Close:', event); });
recognizeStream.on('speaker_labels', function(event) { onEvent('Speaker_Labels:', event); });
// Displays events on the console.
    function onEvent(name, event) {   
      console.log(name, JSON.stringify(event, null, 2));
      console.log('*++++++++++++++++++++'+name+'****************************')
      if("Data:"==name)
      fnSuccess(event);
    };  
}
/**/
