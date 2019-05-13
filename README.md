# LinTo-Skills-Core
Here are crucial LinTo skill, without them a process will possibly can't be guaranteed to work the expected way

## LinTo Skills
Here is the recommanded skills to be used for LinTO
Here a brief resume of LinTo core skills by categories.

### STT
Regroup the STT (Speach To Text) nodes that will allow to transcript in text what is say to LinTo
Here is the format require for Input / Ouput to allow those node to work

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
The LinStt node allow to request to the Linagora Spech To Text API
The require node configuration are :
-  _URL_ : The URL where is located the API
-  _Option_ : Allow to prepare the request for a `stream` or `file`

##### Bing
The Bing node allow to request the [Bing Spech To Text API](https://docs.microsoft.com/en-us/azure/cognitive-services/speech/home)
The node require configuration are :
-  _Key_ : your subscription key for bing
-  _Language_ : Select the language that you speak to LinTo
-  _Mode_ : Select the reconition mode for the transcription

### NLU
Regroup all NLU (Natural Language Understanding) node that will allow to detect which skill to use
Here is the format require for Input / Ouput to allow those node to work

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
    nlu : {
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
The [Tock (The Open Conversation Kit)](https://voyages-sncf-technologies.github.io/tock/fr/) node allow to make a request and format the output desired for a skill
The node require configuration are :
-  _URL_ : The URL where is located the API
-  _Application Name_ : The application name created into Tock API to use

### Settings
Regroup the settings nodes that will allow to customize the current flow

##### Language
The language skill allow to choose the output language of LinTo. The particularity of this node is that he don't get any input / output. He just need to be place in the workflow for working. He is also optional, if he don't choose LinTo will select the system default language.
The node require configuration is :
-  _Language_ : Select the output STT for LinTo

##### Prepare
Prepare will simply format the TOPIC to publish based on the MQTT Topic Input received.
It also configure specific data for the workflow