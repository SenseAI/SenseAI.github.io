---
layout: default
title: API Documentation
---

<div id="apiDocumentation" class="group">
  <h1>API Documentation</h1>
  <a class="headerlink" href="#apiDocumentation"></a>
</div>

<div id="apiGeneral" class="group">
  <h2 class="page-header">General</h2>
  <a class="headerlink" href="#apiConventions"></a>
</div>
<div id="apiConventions" class="group">
  <h3>Conventions</h3>
  <a class="headerlink" href="#apiConventions"></a>
</div>


##### Authentication

Where required, Basic Auth is used for user/developer level api access.

##### Time

Where timestamps are required either an ISO-8601 date string or a milliseconds-since-epoch(UTC), can be used interchangeably

<div id="apiDocsAndCode" class="group">
  <h3>Documentation Code Examples</h3>
  <a class="headerlink" href="#apiDocsAndCode"></a>
</div>

Throughout the API documentation we use the Python language to illustrate example usage.  For the examples to work the following imports are necessary:

{% highlight python %}
import requests
import time
import datetime
{% endhighlight %}

We use [requests](http://docs.python-requests.org/en/latest/) for the http library in these examples, but the features used are expected to be present in most mature http libraries in popular languages.

<div id="apiResource" class="group">
  <h3>Resource Descriptors</h3>
  <a class="headerlink" href="#apiResource"></a>
</div>

It is useful to look at how SenseAI's backend resources are organized, in order to understand the possibilites for resource access.  The resource relationships visible to the developer can be summed up as follows:

**users** *have* **applications** : a user who is a developer can create applications (which represent a mobile device application which embeds an SDK), each of these are identified by an api_key, which are used to initiate the SDK along with the user_id

**application** *have* **environments** : for each application, each device which uses an instance of the SDK is referred to as an environment, this environment tracks and identifies the mobile devices

**user** *have* **environments** : users can link environments to their account through a pin challenge, this is used for individual app users to view their own data from the usage of senseAI APIs

**environments** *have* **data** : each environment generates timestamped data

These relationships create the following possible resource descriptors:

`/user/:user_id/`
`/user/:user_id/environment/:environment_id/`
`/user/:user_id/environment/:environment_id/data`
`/user/:user_id/environments`
`/user/:user_id/application/:application_id/`
`/user/:user_id/applications`
`/user/:user_id/application/:application_id/environment/:environment_id`
`/user/:user_id/application/:application_id/environment/:environment_id/data`
`/user/:user_id/application/:application_id/environments`

<div id="apiResponse" class="group">
  <h3>Response Envelope</h3>
  <a class="headerlink" href="#apiResponse"></a>
</div>

All response bodies are JSON encoded.  All JSON responses have a standard response envelope which can be used to obtain meta-data about the response in addition to the message payload.  An example for `GET /user/_` is seen below.

#### Example Response

{% highlight json %}
{
  "links": {
    "self": "https://senseai-staging.com/api/v2/user/_/"
  },
  "status": {
    "code": 200,
    "text": "OK"
  },
  "error": null,
  "message": {
    "user": {
      "id": "f507b1fa6bb4916b555816e89e7cea03",
      "email": "foo@bar.com",
      "roles": [
        "user",
        "developer:basic"
      ],
      "unit_preference": "imperial",
      "created": 1432655398966,
    }
  }
}
{% endhighlight %}

#### Response Envelope Keys

| **key**     |  **description**                                                       |
|-------------|------------------------------------------------------------------------|
| links.self  | a canonical version of the resource being accessed                     |
| links.next  | if the resource has multiple parts, the link to the next part          |
| status.code | same as the http response status code                                  |
| status.text | the description of the http response status code                       |
| error       | if an error occurred, a description of that error                      |
| message     | the payload of the resource accessed (typically this is what you want) |



<div id="apiPagination" class="group">
  <h3>Pagination</h3>
  <a class="headerlink" href="#apiPagination"></a>
</div>

For large collections of resources pagination is necessary.  Two query params control pagination in resources with plurality: `limit` determines the number of items returned at a time, `offset` is the id of the last item obtained by the caller.  If the `links.next` field exists in the response body, that link (constructed using limit and offset) can be followed in order to obtain the next set of items.  Pagination terminates when `links.next` is undefined.  See List Environment Example below for a code example.

<div id="apiRoutes" class="group">
  <h2 class="page-header">API Routes</h2>
  <a class="headerlink" href="#apiRoutes"></a>
</div>

<div id="apiCompatibility" class="group">
  <h3>List Device Compatibility</h3>
  <a class="headerlink" href="#apiCompatibility"></a>
</div>

Get a list of SDK compatible devices, ones for which software sensors have been calibrated.

#### URL

```
GET https://senseai.io/api/v2/device/compat
```

#### Options


| query param | description                                                 |
--------------|-------------------------------------------------------------|
| onlyTempV2  | only show entries which are calibrated V2 Temperature Model |

#### Response

example response message

{% highlight json %}
[
  {
    "id":"23bb76f0-482b-11e5-a230-95b571d65c97",
    "name":"OnePlus One",
    "osVersion":"<5.0.0",
  },
  ...
]
{% endhighlight %}

#### Example Code

{% highlight python %}
url = '{}/device/compat'.format(base_url)
params = { 'onlyTempV2' : 'yes' }

r = requests.get(url, params=params)

if not r.status_code==200:
  raise Exception('an error occurred')

devices = r.json()['message']['devices']

print 'Supported Devices'

for device in devices:
  print '\t' + device['name'] + ' ' + device['osVersion']
{% endhighlight %}

outputs:

```
Supported Devices
  Samsung Galaxy S5 4.4.2
  Samsung Galaxy S5 >=5.0
  Samsung Galaxy S5 4.4.4
  Samsung Galaxy S4  *
```

<div id="apiEnvironments" class="group">
  <h3>List Environments for an Application</h3>
  <a class="headerlink" href="#apiEnvironments"></a>
</div>

List the environments registered with an api_key.  This requires pagination since this list can be quite large depending on the distribution of an app using sdk.

#### URL

```
GET https://senseai.io/api/v2/user/:user_id/application/:application_id/environments
```

#### Response

example response message

{% highlight json %}
[
  {
    "id": "63d41b25c634c6aef3852d3ecd03879e.FED2E1F1F1CE09667A891A55E1E7D1DA",
    "updated": 1445871149421,
    "model": "t0lte",
    "device_id": "2bb9f350-4203-11e5-b07c-71c60df92d2d",
    "sdk_version": "0.6.0",
    "api_key": "63d41b25c634c6aef3852d3ecd03879e",
    "client_id": "FED2E1F1F1CE09667A891A55E1E7D1DA",
    "timestamp": 1445867995878,
    "commercial_name": "Samsung Galaxy Note2",
    "os_version": "4.1.2"
  },
  ...
]
{% endhighlight %}

#### Example

{% highlight python %}

url = '{}/api/v2/user/_/application/{}/environments'.format(base_url,api_key)

environment_ids = []

while True:

  r = requests.get(url,auth = (username,password))

  if not r.status_code==200:
    raise Exception(r.status_code)

  body = r.json()

  environment_ids += [ e['id'] for e in body['message']['environments'] ]

  if 'next' in body['links']:
    url = body['links']['next']
  else:
    break

for e_id in environment_ids:
  print e_id

{% endhighlight %}

outputs:

```
63d41b25c634c6aef3852d3ecd03879e.0107D0DF2157D7EC4552C1B0D6A691BF
63d41b25c634c6aef3852d3ecd03879e.117D788E7A5A61DD32BBF4619F73AFA5
63d41b25c634c6aef3852d3ecd03879e.2C49FD6AB5C58975961B18E773097646
63d41b25c634c6aef3852d3ecd03879e.8E3B20F445235E6DB92C132D5408B6E4
63d41b25c634c6aef3852d3ecd03879e.9383AB36613529BE35CB2F818C3049B5
63d41b25c634c6aef3852d3ecd03879e.96BD8335CDC067E1B5461EDAA270672B
63d41b25c634c6aef3852d3ecd03879e.A5BADB55D70CFA1D7B33A34F99AD44DD
...
```

<div id="apiQueryData" class="group">
  <h3>Query Data from an Environment in an Application</h3>
  <a class="headerlink" href="#apiQueryData"></a>
</div>

#### URL

```
GET https://senseai.io/api/v2/user/:user_id/application/:application_id/environment/:environment_id/data
```

#### Options

parameter        |   description
-----------------|--------------------------------------
**start**        | beginning of time indexed window (ISO or unix time allowed)
**end**          | end of time indexed window
**limit**        | pagination: the number of data points to return (default is 20, max is 100)
**order**        | 'descending' or 'ascending' (default is descending, accepts any abbreviations)

#### Response

example response message:

{% highlight json %}
[
  {
    "environment_id":"63d41b25c634c6aef3852d3ecd03879e.E668B385B50BE3ED3B4A128F6A3D2455",
    "time":"2015-10-26T18:38:05.136Z",
    "location":{
       "longitude":3.6662295,
       "latitude":43.3977541,
       "accuracy":35.19900131225586
    },
    "derived_sensors":{
      "temperature":{
        "value":20.622745768229166,
        "confidence":0.9999999963628308
      }
    },
    "normalized_sensors":{
      "lux":{
        "value":0.36372525855
      }
    },
    "raw_sensors":{
      "average_sman_pressure":{
        "value":1012.5
      },
    }
    "average_sman_humidity":{
      "value":73.55426205721768
    }
  },
  ...
]
{% endhighlight %}

#### Example 1

Get Most Recent Data

{% highlight python %}
url = '{}/api/v2/user/_/application/{}/environment/{}/data'.format(base_url,api_key,environment_id)

r = requests.get(url, auth=(username,password) )

if not r.status_code==200:
  raise Exception('an error occurred')

for data in r.json()['message']['data']:
  print data['time'] + '\t\t' + str(data['derived_sensors']['temperature']['value'])
{% endhighlight %}

outputs:

```
2015-10-27T00:11:55.922Z		24.3639510091
2015-10-27T00:11:45.426Z		24.5896988932
2015-10-27T00:11:34.938Z		24.4411124674
2015-10-27T00:11:24.438Z		24.2773323568
2015-10-27T00:11:13.933Z		24.4989135742
2015-10-27T00:11:03.426Z		24.3469091797
2015-10-27T00:10:52.928Z		24.5173982747
2015-10-27T00:10:42.438Z		24.3765844727
2015-10-27T00:10:31.935Z		24.5652490234

```

#### Example 2

Page Through All Data

{% highlight python %}
url = '{}/api/v2/user/_/application/{}/environment/{}/data'.format(base_url,api_key,environment_id)

params = {}

while True:

  r = requests.get(url, auth = (username,password), params=params )

  if not r.status_code == 200:
    raise Exception('an error occured')

  dataCollection = r.json()['message']['data']

  if len(dataCollection) == 0:
    break

  for data in dataCollection:
    print data['time'] + '\t' + str(data['derived_sensors']['temperature']['value'])

  params['end'] = data['time']

{% endhighlight %}

#### Example 3

Poll For Data

{% highlight python %}

url = '{}/api/v2/user/_/application/{}/environment/{}/data'.format(base_url,api_key,environment_id)

params = {"order": "ascending",
          "start": datetime.datetime.utcnow().isoformat() }

while True:
  r = requests.get(url, auth = (username,password), params=params )

  if not r.status_code == 200:
    raise Exception('an error occured')

  dataCollection = r.json()['message']['data']

  for data in dataCollection:
    print data['time'] + '\t' + str(data['derived_sensors']['temperature']['value'])


  if len(dataCollection) > 0:
    params['start'] = data['time']

  time.sleep(60*15) # pause 15 minutes and poll again
{% endhighlight %}

<div id="apiApplicationInfo" class="group">
  <h3>Get Application Info</h3>
  <a class="headerlink" href="#apiApplicationInfo"></a>
</div>

#### URL

```
GET https://senseai.io/api/v2/user/:user_id/application/:application_id
```

#### Response

example response message

{% highlight json %}
{
  "application": {
    "name": "Foo",
    "api_key": "a673b59c13f703a461bfd3b4e7244302",
    "user_id": "f507b1fa6bb4916b555816e89e7cea03",
    "configuration": {
      "master_switch": true,
      "collection_rate": 20,
      "post_diagnostic_data": false
    }
  }
}
{% endhighlight %}

<div id="apiRemoteConfig" class="group">
  <h3>Remote Configuration</h3>
  <a class="headerlink" href="#apiRemoteConfig"></a>
</div>

Certain SDK parameters can be adjusted in the field, this should be done using the following:

#### URL


```
PUT https://senseai.io/api/v2/user/:user_id/application/:application_id/configure
```

#### Request Body

example request body

{% highlight json %}
{
  "master_switch": true,
  "collection_rate": 20,
  "post_diagnostic_data": false
}
{% endhighlight %}

<div id="apiGeoBound" class="group">
  <h3>Application Level Geo Bounds</h3>
  <a class="headerlink" href="#apiGeoBound"></a>
</div>

Get the bounding box for recent data in an application.

#### URL

```
GET /api/v2/user/:user_id/application/:application_id/data/geo/bounds
```

#### Response

{% highlight json %}
{
  "min": {
    "latitude": 37.32581779360771,
    "longitude": -122.02696233987808
  },
  "max": {
    "latitude": 44.95370104908943,
    "longitude": -77.26228326559067
  }
}
{% endhighlight %}

<div id="apiGeoQuery" class="group">
  <h3>Application Level Geo Query</h3>
  <a class="headerlink" href="#apiGeoQuery"></a>
</div>

Application Level Geo Bounds Info

Get most recent data for an application for a specified region.  Return is a list of datapoints with environment information populated.

#### URL

```
GET /api/v2/user/:user_id/application/:application_id/data/geo
```

#### Options

parameter        |   description
-----------------|--------------------------------------
**latitude[0]**        | latitude for first component of bounding box
**longitude[0]**          | longitude for first component of bounding box
**latitude[1]**        | latitude for second component of bounding box
**longitude[1]**        | longitude for second component of bounding box

#### Response

A list of data with environment info populated.

<div id="sdkDocumentation" class="group">
  <h1>SDK Documentation</h1>
  <a class="headerlink" href="#sdkDocumentation"></a>
</div>

<div id="sdkGeneral" class="group">
  <h2 class="page-header">About the SDK</h2>
  <a class="headerlink" href="#sdkGeneral"></a>
</div>

#### Introduction

This document explains what the Sense Ai SDK for Android is and how to integrate it into your application.  Please review these details prior to implementation.  Please contact [help@senseai.io](mailto:help@senseai.io) for additional support.

The purpose of the Sense Ai SDK is to normalize and extend the sensing capabilities of Android devices, enabling the measurement of comparable physical and context variables in the neighborhood of any supported device.  A complete list of the measurements can be found below.  Please note that the SDK is compatible with Android SDK versions 15 and up.

#### Basics of Operation

At the core of the SDK is a Service that curates measurements derived from sensors and other data sources, and tags them with the time and last known location. The Service can be configured so that it is constantly running (even if the parent app has been killed) either at a fast rate or at a slow rate.  Alternatively, it can be configured on a timer to sleep, wake up at a set frequency to make a measurement, and then go back to sleep.  The timer period is 15 minutes by default but can be configured remotely from the developer portal.  Measurements and predictions are not instantaneou and require at least 40 seconds of on-time.

Results are communicated from the SDK to the parent app via a Local Broadcast. To receive updates from the SDK the developer will need to extend and register the KelvinWakefulBroadcastReceiver from the SDK. This will allow the parent app to receive updates while in the foreground, background or after being killed.

<div id="sdkBasicImplementation" class="group">
    <h2 class="page-header">Implementation Overview</h2>
  <a class="headerlink" href="#sdkBasicImplementation"></a>
</div>

#### Connect to the SDK

The developer accesses the SDK through a class called KelvinInit. The [`KelvinInit`](Archive/io/senseai/kelvinsdk/KelvinInit.html) class allows the developer to use their api key and developer id to authenticate with the SDK, to set the mode of data collection, to get the current data collection mode and to ask the Sense Ai servers for a PIN which can be used to associate a device with the Sense Ai data portal.

To begin using the SDK the [getInstance()](Archive/io/senseai/kelvinsdk/KelvinInit.html#getInstance(android.content.Context)) method must be called. This method returns immediately with a reference to [`KelvinInit`](Archive/io/senseai/kelvinsdk/KelvinInit.html).

Before the SDK can be used it must be connected to. To do this the [connect()](Archive/io/senseai/kelvinsdk/KelvinInit.html#connect(java.lang.String,%20java.lang.String,%20io.senseai.kelvinsdk.KelvinInit.ConnectionCallbacks)) method must be called. [connect()](Archive/io/senseai/kelvinsdk/KelvinInit.html#connect(java.lang.String,%20java.lang.String,%20io.senseai.kelvinsdk.KelvinInit.ConnectionCallbacks)) is asynchronous because the SDK needs to authenticate the application and ensure device compatibility. The [connect()](Archive/io/senseai/kelvinsdk/KelvinInit.html#connect(java.lang.String,%20java.lang.String,%20io.senseai.kelvinsdk.KelvinInit.ConnectionCallbacks)) method requires an api key and developer id which can be obtained from our developer web portal. The [`ConnectionCallback`](Archive/io/senseai/kelvinsdk/KelvinInit.ConnectionCallbacks.html) is used to let the application know when the SDK is connected, is compatible or if the connection failed. Once the connection callback indicates that the SDK is connected and compatible then the rest of the SDK methods are able to be called. If any of the other methods are called prior to the SDK being connected, then a RuntimeException will be thrown.

#### Adjust SDK Settings

If the developer desires to change the rate of data collection the [setDataMode()](Archive/io/senseai/kelvinsdk/KelvinInit.html#setDataMode(io.senseai.kelvinsdk.OperatingMode)) method can be called and supplied with one of four modes: OperatingMode.ALWAYS_FAST, OperatingMode.ALWAYS_SLOW, OperatingMode.TIMER and OperatingMode.OFF. The ALWAYS_SLOW and ALWAYS_FAST modes put the SDK in a mode where data is constantly collected to make predictions. Predictions will occur either every 40 seconds or every 10 seconds respectively. To set the SDK to TIMER mode the TIMER argument is supplied and the SDK will revert back to sleeping for period of time then waking up and making a prediction. If starting out in TIMER mode it will take 60 seconds before a prediction is returned. The period of the timer is set through the developer portal. OperatingMode.OFF will stop the data collection from occurring. Data collection will not occur again until the mode is set to something other than OperatingMode.OFF.

#### Receive data from the SDK

The SDK contains a public abstract class, [`KelvinWakefulBroadcastReceiver`](Archive/io/senseai/kelvinsdk/KelvinWakefulBroadcastReceiver.html) that extends `WakefulBroadcastReceiver` and is used to receive updates from the Sense Ai SDK.  The developer needs to create and register instances of this [`KelvinWakefulBroadcastReceiver`](Archive/io/senseai/kelvinsdk/KelvinWakefulBroadcastReceiver.html) wherever updates are required. For instance, in an app that wants to log temperature and location data, the developer might create an instance of the [`WakefulBroadcastReceiver`](Archive/io/senseai/kelvinsdk/KelvinWakefulBroadcastReceiver.html) in their Application class and register it in onCreate() of the Application class.  Whenever a broadcast is received the receiver can fire off an IntentService to do work such as persisting the values to a database. This ensures that data can be collected and persisted even if the parent app has been killed or is in the background. In other instances, it may only be important to collect data in an Activity or Fragment and so the broadcast receiver can just be registered/unregistered in onStart() and onPause().

Note that it is not necessary to initialize the Sense Ai SDK in a service. It creates a Service internally to ensure that it can outlive the class that instantiates it so the predictions can be made whether the app is in the foreground, background or has been killed. The Service is still susceptible to the OS killing it because of memory pressure, however it will automatically start again once the OS allows it.

The SDK doesn’t cache predictions, it simply returns them to the parent app and the parent app can use them however it needs to.

<div id="sdkGetStarted" class="group">
    <h2 class="page-header">Getting Started</h2>
  <a class="headerlink" href="#sdkGetStarted"></a>
</div>

<ol>
<li> Register for API key and Developer id</li>
 <ul>
   <li>Create an account <a href="https://senseai.io/home/products_and_services">here:</a></li>
   <li>Log In to get your developer id.</li>
   <li>Generate an API key using your app’s package name. Note, if the package name ever changes, you must retrieve a new API key.</li>
 </ul>
<li>Add library files to your project</li>
<ul>
   <li>Your project structure should include the following directories: Project-Dir/app/<b>libs/</b></li>
   <li>Add the following file to the <b>/libs</b> directory: <b>kelvinsdk-production-onlinesdk-release-0.7.0.aar</b> </li>

  </ul>
<li>Setup project in Gradle</li>
   <ul>
   <li>Note on Google Play Services: Version 7.0.0 is required.  The SDK requires “base” and “location” packages, but if you are using any other Google Play Services packages such as “analytics” you must also use version 7.0.0 of those packages.</li>
   <li>Locate your app’s build.gradle file (There will most likely be two build.gradle files. Use the build.gradle in your module’s directory, not the higher-level, project-wide build.gradle file). Merge the following statements into your module’s build.gradle file:
    {% highlight groovy %}

    android {
      packagingOptions {
          exclude 'META-INF/LICENSE.txt'
      }
      repositories {
          flatDir {
              dirs 'libs'
          }
      }
    }

    dependencies {
        compile fileTree(dir: 'libs', include: ['*.jar'])
        compile 'com.android.support:appcompat-v7:21.0.3'
        compile (name:'kelvinsdk-onlinesdk-release-prod-0-6-0', ext:'aar')
        compile 'org.apache.commons:commons-math3:3.3'
        compile 'com.google.code.gson:gson:2.3.1'
        compile 'com.github.zafarkhaja:java-semver:0.9.0'
        compile 'com.koushikdutta.ion:ion:2.1.3'
        compile 'com.google.android.gms:play-services-base:7.0.0'
        compile 'com.google.android.gms:play-services-location:7.0.0'
    }
    {% endhighlight %}
  </li>
  </ul>

<li> Manifest setup </li>
    <ul>
    <li> Add the following lines (in bold) to your AndroidManifest.xml file:

    {% highlight xml %}

    <manifest
      xmlns:android="http://schemas.android.com/apk/res/android"
      package="com.example.app" >

      <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
      <uses-permission android:name="android.permission.INTERNET" />

      <application android :name=”.Your Application Class Name” >
        ...
      </application>
    </manifest>
    {% endhighlight %}


   * <b>Note if you’re not extending the application class you can disregard the android:name=”my.applicationclass.name” line.</b>
   </li>
   </ul>
<li>Setup complete</li>
  <ul>
     <li>Your project is now setup to run the SDK and resolve the SDK's dependencies</li>
   </ul>
</ol>


<div id="sdkOtherSetupNotes" class="group">
    <h2 class="page-header">Other Setup Notes</h2>
  <a class="headerlink" href="#sdkOtherSetupNotes"></a>
</div>

#### Proguard Setup

<ul>
<li>If you are using ProGuard or DexGuard to shrink, optimize and obfuscate your source code,
you will need to include the following definitions either in your existing proguard file or in a new
proguard file that will need to be specified to be used during your build:

    {% highlight python %}

    -keepattributes Signature
    -keepattributes *Annotation*

    -keep class sun.misc.Unsafe { *; }
    -keep class com.google.gson.stream.** { *; }
    -dontwarn com.google.*

    -keep class io.senseai.kelvinsdk.** { *; }
    -dontwarn io.senseai.kelvinsdk.**
    -keep class org.apache.commons.** { *; }
    -dontwarn org.apache.commons.**
    -keep class com.google.common.** { *; }
    -dontwarn com.google.common.**
    -dontwarn javax.annotation.**
    -keep class com.koushikdutta.ion.** { *; }
    -dontwarn com.koushikdutta.ion.**
    -keep class com.github.zafarkhaja.** { *; }
    -dontwarn com.github.zafarkhaja.**
    -keep public interface io.senseai.onlinesdk.KelvinInit.ControlCallbacks {*;}
    -keep public interface io.senseai.onlinesdk.KelvinInit.ConnectionCallbacks {*;}

    {% endhighlight %}

</li>
</ul>

#### Google Play Services
<ul>
  <li>
  This SDK uses Google Play Services version 7.0.0 Fused Location Api. Before you instantiate the SDK it is important to verify that the version of Google Play Services on the device is at least at 7.0.0. If you don’t do this the location will not be tagged to the predictions returned by the SDK. This <a href="http://www.androiddesignpatterns.com/2013/01/google-play-services-setup.html">link</a> provides a detailed tutorial on how to accomplish this.
  </li>
</ul>

#### Json Structure of Prediction object

<ul>
<li>
  The Prediction object that is returned to the client app has a toJson() method which makes serializing the
  object into a json formatted string easy.
</li>
  <li>
    For Basic level accounts, the Prediction object has the following example structure:
    {% highlight json %}
{
    "time": 1445891343445,
    "location": {
        "latitude": 44.9783833,
        "longitude": -93.3083898,
        "accuracy": 37.5
    },
    "derived_sensors": {
        "temperature": {
            "value": 15.123828124999942,
            "confidence": 0.2099999999791275
        }
    }
}
    {% endhighlight %}


  </li>
  <li>
    For Premium level accounts, the Predictions object has the following example structure:
      {% highlight json %}
{
    "time": 1445891343445,
    "location": {
        "latitude": 44.9783833,
        "longitude": -93.3083898,
        "accuracy": 37.5
    },
    "derived_sensors": {
        "temperature": {
            "value": 15.123828124999942,
            "confidence": 0.2099999999791275
        },
        "is_inside": {
            "value": true
        }
    },
    "normalized_sensors": {
        "pressure": {
            "value": 988.583984375
        },
        "lux": {
            "value": 9.09313146375
        }
    },
    "raw_sensors": {
        "average_sman_light": {
            "value": 9.09313146375
        },
        "average_sman_humidity": {
            "value": 43.2221
        }
    }
}
      {% endhighlight %}

  </li>
</ul>

<div id="sdkPublicApi" class="group">
    <h2 class="page-header">Public API</h2>
  <a class="headerlink" href="#sdkPublicApi"></a>
</div>

<a class="" href="/Archive/index.html">SDK Documentation</a>

<div id="sdkReleaseNotes" class="group">
    <h2 class="page-header">Release Notes</h2>
  <a class="headerlink" href="#sdkReleaseNotes"></a>
</div>

#### V0.6.0
  * Added Prediction Object to return results to parent app
  * Added toJson() method to Prediction object to serialize it for parent app
  * Changed db schema and how predictions vs. diagnostic data vs. sensor data is stored
  * Added network call for local weather data when in TIMER mode
  * Added OFF mode to public API
  * Added db table to store when device was last plugged in and what the battery level was to help with charging model
  * Added new device parameters to Session response to account for new models
  * Added new temperature model
  * Disabled onSurface data collection and prediction
  * Added isIndoor model
  * Temperature accuracy changed to temperature confidence
  * Added different temperature confidence algorithm
  * Calculating and obfuscating device UUID differently
  * Added normalized data calculations
  * Added 'Account' field to Session response to differentiate basic vs premium accounts
  * Fixed bug when location is turned off on the device
  * Bug fixes

#### V0.5.x
  * Changed public API to use a dedicated thread to perform getter and setter operations
  * Started doing data collection on separate threads
  * Added a connect() method so that parent app can get a reference without forcing a connection
  * Added isConnected(), isConnecting() and isCompatible() methods to public API
  * Split callbacks up into ConnectionCallbacks and ControlCallbacks so user isn't forced to register for control callbacks during connection
  * Added handler that performs callbacks from KelvinInit on whatever thread getInstance was called from
  * Removed getPredictionNow() method
  * Added a class that checks for file validity when a new Session is downloaded
  * Added new temperature model with support for charging, screen brightness and cpu
  * Added support for One Plus One nightly build sys fs files changing
  * Added onSurface model
