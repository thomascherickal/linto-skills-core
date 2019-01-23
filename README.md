# Linto-Skills-Core
Here are setup the crucial Linto skill, without them any Linto process can't be guaranteed to be working the expected way has planning.

## Linto Skills
Here is the list of node and what they do.

### STT
Regroup the STT (Speach To Text) nodes that will allow to transcript what is say to Linto
Here is the format require in Input / Ouput for allow to this node to work

**Input**:
```
{
    audio : Buffer Base64,
    conversationData : { } //optional json from the previous intention if a conversation is require
}
```

**Output** :
```
{
    transcript : "The transcription text",
    confidence : "The confidence of the transcription",
    conversationData : { } //optional json from the previous intention if a conversation is require
}
```
##### LinStt
The LinStt allow to request the Linagora Spech To Text API
The node require configuration are :
-  _URL_ : The URL where is located the API
-  _Option_ : Allow to prepare the request for a stream receive or a file

##### Bing
The Bing node allow to request the [Bing Spech To Text API](https://docs.microsoft.com/en-us/azure/cognitive-services/speech/home)
The node require configuration are :
-  _Key_ : You'r personal API Key from bing
-  _Language_ : Select the language that you speak to Linto
-  _Mode_ : Select the reconition mode for the transcription

### NLU
Regroup all NLU (Natural Language Understanding) node
Here is the format require in Input / Ouput for allow to this node to work

**Input** :
```
{
    transcript : "Any text transcription to detect the intent",
    confidence : "The confidence of the transcription",
    conversationData : { } //optional json from the previous intention if a conversation is require
}
```
**Output**
```
{ 
    transcript : 'text transcript',
    intent : {
        intent : 'intentDetected',
        entitiesNumber : 1, //integer of entities
        entities : [{
            entity: 'entitiesName',
            value: 'entitie text'
        }]
    },
    conversationData : { } //optional json from the previous intention if a conversation is require
}

```

##### Tock
The [Tock](https://voyages-sncf-technologies.github.io/tock/fr/)(The Open Conversation Kit) node allow to prepare, make a request and format the output desired for any Linto skill by using the Tock API
The node require configuration are :
-  _URL_ : The URL where is located the API
-  _Application Name_ : The application name created into Tock API to use

### Settings
Regroup the settings nodes that will allow to customize the current flow

##### Language
The language skill allow to choose the output language of Linto. The particularity of this node is that he don't get any input / output. He just need to be place in the workflow for working. He is also optional, if he don't choose Linto will select the system default language.
The node require configuration is :
-  _Language_ : Select the output STT for Linto

##### Publish
Publish will simply format the TOPIC to publish based on the MQTT Topic Input received.