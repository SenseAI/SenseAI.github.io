---
layout: default
title: coding with spice
---

# API Documentation

## Device Compatibility List

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

```json
[
	{
		"id":"23bb76f0-482b-11e5-a230-95b571d65c97",
		"name":"OnePlus One",
		"osVersion":"<5.0.0",
	}, ...
]
```

#### Example Code

```python
url = '{}/device/compat'.format(base_url)
params = { 'onlyTempV2' : 'yes' }

r = requests.get(url, params=params)

if not r.status_code==200:
	raise Exception('an error occurred')

devices = r.json()['message']['devices']

print 'Supported Devices'

for device in devices:
	print '\t' + device['name'] + ' ' + device['osVersion']
```

outputs:

```
Supported Devices
	Samsung Galaxy S5 4.4.2
	Samsung Galaxy S5 >=5.0
	Samsung Galaxy S5 4.4.4
	Samsung Galaxy S4  *
```


## List Active Environments (Device Clients)

#### URL

```
GET https://senseai.io/api/v2/user/:user_id/application/:application_id/environments
```

#### Response

example response message

```json
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
```

#### Example Code

```python
url = '{}/api/v2/user/_/application/{}/environments'.format(base_url,api_key)

r = requests.get(url,auth = (username,password))

if not r.status_code==200:
	raise Exception('an error occured')

environments = r.json()['message']['environments']

for environment in environments:
	print str(environment['id']) + '\t' + str(environment['commercial_name']) + '\t' + str(environment['model'])
```

outputs:

```
63d41b25c634c6aef3852d3ecd03879e.DF5310D424EC16A00968A1EEEECF0004	Samsung Galaxy S3 Mini	goldenvess3g
63d41b25c634c6aef3852d3ecd03879e.E31487BC32B59A97C5CF0BA8668C42DF	Samsung Galaxy S5	kltevzw
63d41b25c634c6aef3852d3ecd03879e.E668B385B50BE3ED3B4A128F6A3D2455	Samsung Galaxy S4	jflte
63d41b25c634c6aef3852d3ecd03879e.EAD355A4A9281EEA4B8B4440BC913064	Samsung Galaxy S3	d2vzw

```

## Query Data

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

```json
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
		  "average_sman_humidity":{  
		         "value":73.55426205721768
		  }
	   }
	}
	...
]
```

#### Example Code

```python
url = '{}/api/v2/user/_/application/{}/environment/{}/data'.format(base_url,api_key,environment_id)

r = requests.get(url, auth=(username,password) )

if not r.status_code==200:
	raise Exception('an error occurred')

dataCollection = r.json()['message']['data']

for data in dataCollection:
	print data['time'] + ' ' + str(data['derived_sensors']['temperature']['value'])	
```

outputs:

```
2015-10-26T23:03:27.951Z 15.751167806
2015-10-26T23:03:17.451Z 15.742417806
2015-10-26T23:03:06.965Z 15.733667806
2015-10-26T23:02:56.457Z 15.724917806
2015-10-26T23:02:45.956Z 15.716167806
2015-10-26T23:02:35.455Z 15.707417806
2015-10-26T23:02:24.955Z 15.7003344727
2015-10-26T23:02:14.451Z 15.698667806
2015-10-26T23:02:03.956Z 15.693667806
2015-10-26T23:01:53.458Z 15.684917806
2015-10-26T23:01:42.951Z 15.676167806
2015-10-26T23:01:32.481Z 15.667417806
2015-10-26T23:01:21.951Z 15.658667806
2015-10-26T23:01:11.450Z 15.649917806
2015-10-26T23:01:00.959Z 15.641167806
2015-10-26T23:00:50.460Z 15.632417806
2015-10-26T23:00:39.938Z 15.623667806
2015-10-26T23:00:29.450Z 15.614917806
2015-10-26T23:00:18.943Z 15.606167806
2015-10-26T23:00:08.432Z 15.5995011393

```



