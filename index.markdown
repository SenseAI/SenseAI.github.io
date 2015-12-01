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

Throughout the API documentation we use the python(2) language to illustrate example usage.  For the examples to work the following imports are necessary:

{% highlight python %}
import requests
import time
import datetime
{% endhighlight %}

We use [requests](http://docs.python-requests.org/en/latest/) for the http library in these examples, the features used are expected to be present in most mature http libraries in popular languages.

<div id="apiResource" class="group">
  <h3>Resource Descriptors</h3>
  <a class="headerlink" href="#apiResource"></a>
</div>

It is useful to too look at how SenseAI's backend resources are organized, in order to understand the possibilites for resource access.  The resource relationships visible to the developer can be summed up as follows:

**users** *have* **applications** : a user who is a developer can create applications(which represent a mobile device application which embeds an SDK), each of these are identified by an api_key, which are used to initiate the SDK along with the user_id

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

All response bodies are JSON encoded.  All JSON responses have a standard response envelope, that can be used to obtain meta-data about the response, in addition to the message payload.  An example for `GET /user/_` is seen below.

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

For large collections of resources pagination is necessary.  Two query params control pagination in resources with plurality: `limit` determines the number of items returned at a time, `offset` is the id of the last item obtained by the caller.  If the `links.next` field exists in the response body, that link (constructed using limit and offset) can be followed in order to obtain the next set of items.  Pagination terminates when links.next is undefined.  See List Environment Example below for a code example.

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

A list of data with environment info populated
