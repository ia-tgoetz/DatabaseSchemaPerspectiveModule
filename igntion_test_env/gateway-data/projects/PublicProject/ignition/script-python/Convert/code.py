import json
import os
import re
import sys
#	typeID[id]=[id]
typeMatch={
  "Container": {
    "default": {
      "paletteId": "container",
      "typeId": "container"
    }
  },
  "Client": {
    "CellPhoneBlue": {
      "paletteId": "BluePhone",
      "typeId": "Client"
    },
    "CellPhoneWhite": {
      "paletteId": "WhitePhone",
      "typeId": "Client"
    },
    "ClientKeyboardBlue-Left": {
      "paletteId": "KBBlueLeft",
      "typeId": "Client"
    },
    "ClientKeyboardBlue-Right": {
      "paletteId": "KBBlueLeft",
      "typeId": "Client"
    },
    "ClientKeyboardWhite-Left": {
      "paletteId": "KBWhiteLeft",
      "typeId": "Client"
    },
    "ClientKeyboardWhite-Right": {
      "paletteId": "KBWhiteLeft",
      "typeId": "Client"
    },
    "ClientLaptopBlue-Left": {
      "paletteId": "LTBlueLeft",
      "typeId": "Client"
    },
    "ClientLaptopBlue-Right": {
      "paletteId": "LTWhiteLeft",
      "typeId": "Client"
    },
    "ClientLaptopWhite-Left": {
      "paletteId": "LTWhiteLeft",
      "typeId": "Client"
    },
    "ClientLaptopWhite-Right": {
      "paletteId": "LTWhiteLeft",
      "typeId": "Client"
    },
    "ClientPanelBlank": {
      "paletteId": "BlankPanel",
      "typeId": "Client"
    },
    "ClientPanelBlue-Left": {
      "paletteId": "BluePanel",
      "typeId": "Client"
    },
    "ClientPanelWhite-Left": {
      "paletteId": "WhitePanel",
      "typeId": "Client"
    },
    "ClientScreen": {
      "paletteId": "WhitePanel",
      "typeId": "Client"
    },
    "HMI-Ignition": {
      "paletteId": "WhitePanel",
      "typeId": "Client"
    },
    "default": {
      "paletteId": "KBBlueLeft",
      "typeId": "Client"
    }
  },
  "Comms": {
    "Cell-Tower": {
      "paletteId": "cell-tower",
      "typeId": "infrastructure"
    },
    "LIMs": {
      "paletteId": "lims-system",
      "typeId": "infrastructure"
    },
    "Satellite": {
      "paletteId": "satellite",
      "typeId": "infrastructure"
    },
    "default": {
      "paletteId": "cell-tower",
      "typeId": "infrastructure"
    }
  },
  "Connection": {
    "default": {
      "paletteId": "paletteId",
      "typeId": "typeId"
    }
  },
  "Connector": {
    "AWS": {
      "paletteId": "aws-cloud",
      "typeId": "cloud-provider"
    },
    "Azure": {
      "paletteId": "azure-cloud",
      "typeId": "cloud-provider"
    },
    "Google": {
      "paletteId": "gcp-cloud",
      "typeId": "cloud-provider"
    },
    "Internet": {
      "paletteId": "internet-cloud",
      "typeId": "cloud-provider"
    },
    "default": {
      "paletteId": "aws-cloud",
      "typeId": "cloud-provider"
    }
  },
  "Custom": {
    "default": {
      "paletteId": "paletteId",
      "typeId": "typeId"
    }
  },
  "Database": {
    "AmazonRDS": {
      "paletteId": "RDS",
      "typeId": "Database"
    },
    "AzureSQL": {
      "paletteId": "AzureSQL",
      "typeId": "Database"
    },
    "MariaDB": {
      "paletteId": "MariaDB",
      "typeId": "Database"
    },
    "MySQL": {
      "paletteId": "MySQL",
      "typeId": "Database"
    },
    "OracleSQL": {
      "paletteId": "Oracle",
      "typeId": "Database"
    },
    "PostgreSQL": {
      "paletteId": "Postgres",
      "typeId": "Database"
    },
    "SQLServer": {
      "paletteId": "MSSQL",
      "typeId": "Database"
    },
    "SQLite": {
      "paletteId": "SQLite",
      "typeId": "Database"
    },
    "Snowflake": {
      "paletteId": "Snowflake",
      "typeId": "Database"
    },
    "Timescale": {
      "paletteId": "Snowflake",
      "typeId": "Database"
    },
    "default": {
      "paletteId": "SQLDB",
      "typeId": "Database"
    }
  },
  "Device": {
    "PLCBlue-Left": {
      "paletteId": "DeviceBlue",
      "typeId": "Device"
    },
    "PLCBlue-Right": {
      "paletteId": "DeviceBlue",
      "typeId": "Device"
    },
    "PLCGray-Left": {
      "paletteId": "DeviceGray",
      "typeId": "Device"
    },
    "PLCGray-Right": {
      "paletteId": "DeviceGray",
      "typeId": "Device"
    },
    "PLCOrange-Left": {
      "paletteId": "DeviceOrange",
      "typeId": "Device"
    },
    "PLCOrange-Right": {
      "paletteId": "DeviceOrange",
      "typeId": "Device"
    },
    "PLCPurple-Left": {
      "paletteId": "DevicePurple",
      "typeId": "Device"
    },
    "PLCPurple-Right": {
      "paletteId": "DevicePurple",
      "typeId": "Device"
    },
    "default": {
      "paletteId": "DeviceBlue",
      "typeId": "Device"
    }
  },
  "Firewall": {
    "default": {
      "paletteId": "firewall",
      "typeId": "network-component"
    }
  },
  "IIOT": {
    "IoT-Bridge": {
      "paletteId": "IIOTBridge",
      "typeId": "Broker"
    },
    "MQTT-Server": {
      "paletteId": "Broker",
      "typeId": "Broker"
    },
    "default": {
      "paletteId": "Broker",
      "typeId": "Broker"
    }
  },
  "Kafka": {
    "default": {
      "paletteId": "kafka",
      "typeId": "enterprise-system"
    }
  },
  "Label": {
    "default": {
      "paletteId": "Label",
      "typeId": "Label"
    }
  },
  "LoadBalancer": {
    "default": {
      "paletteId": "load-balancer",
      "typeId": "network-component"
    }
  },
  "MongoDB": {
    "default": {
      "paletteId": "MongoDB",
      "typeId": "MongoDB"
    }
  },
  "Note": {
    "default": {
      "paletteId": "Note",
      "typeId": "Note"
    }
  },
  "OPCUA": {
    "default": {
      "paletteId": "opc-ua",
      "typeId": "Device"
    }
  },
  "ReverseProxy": {
    "default": {
      "paletteId": "reverse-proxy",
      "typeId": "network-component"
    }
  },
  "Usersource": {
    "default": {
      "paletteId": "usersource",
      "typeId": "usersource"
    }
  },
  "cloud": {
    "default": {
      "paletteId": "cloud",
      "typeId": "cloud"
      }
  },
  "default": {
    "default": {
      "paletteId": "standard",
      "typeId": "standard"
    }
  },
  "edge-iiot": {
    "default": {
      "paletteId": "edge-iiot",
      "typeId": "edge-iiot"
    }
  },
  "edge": {
    "default": {
      "paletteId": "edge-iiot",
      "typeId": "edge-iiot"
    }
  },
  "edge-panel": {
    "default": {
      "paletteId": "edge-panel",
      "typeId": "edge-panel"
    }
  },
  "panel": {
    "default": {
      "paletteId": "edge-panel",
      "typeId": "edge-panel"
    }
  },
  "server": {
    "default": {
      "paletteId": "server",
      "typeId": "server"
    }
  },
  "standard": {
    "default": {
      "paletteId": "standard",
      "typeId": "standard"
    }
  }
}

'''missing
Firewall


Filter
Connection
Container

Custom Handler

'''


groupIDs={
  "standard": "standard",
  "Device": "Device",
  "Label": "Label",
  "edge-iiot": "edge-iiot",
  "cloud": "cloud",
  "edge-panel": "edge-panel",
  "Note": "Note",
  "Database": "Database",
  "MongoDB": "MongoDB",
  "Client": "Client",
  "Connector": "cloud-provider",
  "server": "server",
  "Comms": "infrastructure",
  "IIOT": "Broker",
  "Kafka": "Kafka",
  "ReverseProxy": "network-component",
  "LoadBalancer": "network-component",
  "Usersource": "Usersource",
  "Firewall": "network-component",
  "OPCUA": "Device"
}

subTypeKeys={
	"Database": "DBType",
	"Device": "image",
	"Client": "image",
	"IIOT": "image",
	"Connector": "image",
	"Comms": "image"
	}
	


	
# Mapping for connection types
conn_mapping = {
	"MQTT": "mqtt",
	"OPC-UA": "opc-ua",
	"Gateway Network": "gateway-network",
	"Kafka": "kafka",
	"Standard": "standard",
	"Device Driver": "device-driver",
	"MongoDB": "mongodb",
	"Client": "client",
	"DB": "db"
	}

def defineHandle(loc):
	x=loc['x']
	y=loc['y']
	if x==0:
		side="left"
		point=4-(y*4)
	elif x==1:
		side="right"
		point=4-(y*4)
	elif y==1:
		side="top"
		point=(x*4)
	else:
		side="bottom"
		point=(x*4)
	
	handle="{}-{}".format(side,int(point))
	return handle

def getSubType(typeN, conf):
	subTypeKey=subTypeKeys.get(typeN, None)
	system.perspective.print("typeN: "+ typeN)
	if subTypeKey is not None:
		system.perspective.print("subTypeKey: "+ subTypeKey)
		system.perspective.print("Config: " + str(conf))
		subType=conf['config'].get(subTypeKey, "default")
		if subType is None:
			subType="default" 
	else:
		subType= "default"
		
	system.perspective.print("subType: "+ str(subType))
	return subType
	
def getIds(config):
	typeN=config.get('type', "default")
	system.perspective.print(typeN)
	parent=typeMatch.get(typeN, "default")
	system.perspective.print(parent)
	subType=getSubType(typeN, config)
	mapped=parent.get(subType)
	return mapped
	

def convert_architecture(old_data, palette_conns=None, importType="Mongo"):
	"""
	Converts a single architecture object from the old format to the new format.
	"""
	nodes = {}
	edges = {}
	
	components = old_data.get('components', {})
	containers_list = old_data.get('containers', [])
	containerIndex={}
	containerCount=len(containers_list)
	for x in range(containerCount):
		containerIndex[containers_list[x].keys()[0]]=containerCount-x
		
		
	xLocs=[]
	yLocs=[]
	
	for x in components:
		top=components[x].get('top')
		left=components[x].get('left')
		xLocs.append(left) # -(width/2))
		yLocs.append(top) # -(height/2))
	xLocsAVG=min(xLocs) #sum(xLocs) / len(xLocs)
	yLocsAVG=min(yLocs) #sum(yLocs) / len(yLocs)
	

	system.perspective.print(containerIndex)
	if importType=="Mongo":
		config = old_data.get('config', {})
	else:
		config = old_data['structure'].get('configs', {})
	connections = old_data.get('connections',{})
	
	# Merge spatial data (left, top, width, height)
	all_spatial = {}
	all_spatial.update(components)
	for c_group in containers_list:
		all_spatial.update(c_group)
		
	# Mapping for node types to new typeId/paletteId
	# Pass 1: Create nodes
	oldNodeTypes=[]
	for uuid, spatial in all_spatial.items():
		
		conf = config.get(uuid, {})
		old_type = conf.get('type', None)
		oldNodeTypes.append(old_type)
		# Determine typeId and paletteId
#		if old_type.lower() not in ['container', 'connection']:
		Ids=getIds(conf)
		system.perspective.print("IDs: "+str(Ids))
		try:
			system.perspective.print(Ids)
			type_id = Ids["typeId"]
		except:
			system.perspective.print("************ERROR"+str(Ids))
			continue 
		palette_id = Ids["paletteId"]
		
		
		node = {
			"paletteId": palette_id,
			"typeId": type_id,
			"label": conf.get('name', type_id),
			"x": (spatial.get('left', 0)  - xLocsAVG )* 1.5,
			"y": (spatial.get('top', 0) -  yLocsAVG) * 1.5,
			"width": spatial.get('width', 100) * 1.5,
			"height": spatial.get('height', 100) * 1.5,
			"inactive": False,
			"configs": conf.get('config', {}),
			"tooltip": conf.get('desc', ''),
			"supportedConnections": palette_conns.get(palette_id, []) if palette_conns else [],
			"hideHandles": False
		}
		
		# Specific fields for containers
		if type_id.lower() == 'container':
			backColor=conf['config'].get('backColor',"var(--neutral-50)")
			if backColor.startswith("--"):
				backColor='var({})'.format(backColor)
		
		
			node["zIndex"] = (containerIndex[uuid]*-1)
			node['style'] = {"backgroundColor": backColor}
			node['hideHandles'] = True
		
		# Specific fields for Notes
		elif type_id == 'Note':
			node["text"] = conf.get('desc', '')
			node['hideHandles'] = True
		nodes[uuid] = node


	# Pass 2: Create edges
	# We need to find connections in config and determine their source and target
	oldEdgeTypes=[]
	for uuid in connections.keys():
		source, target=connections[uuid].keys()
		sourceHandle = defineHandle(connections[uuid][source])
		targetHandle = defineHandle(connections[uuid][target])
		
		
	
		if source and target:
			old_conn_type = config[uuid]['config'].get('connectionType', 'MQTT')
			oldEdgeTypes.append(old_conn_type)
			connectionType=conn_mapping[old_conn_type]
			
			edges[uuid] ={
			  "source": source,
			  "sourceHandle": sourceHandle,
			  "target": target,
			  "targetHandle": targetHandle,
			  "lineType": "smoothstep",
			  "dashed": False,
			  "arrow": False,
			  "showLabel": False,
			  "connectionType": connectionType,
			  "waypoints": []
			}
			
	return {
		"nodes": nodes,
		"oldNodeTypes": list(set(oldNodeTypes)),
		"oldEdgeTypes": list(set(oldEdgeTypes)),
		"edges": edges,
		"enabled": True,
		"enableOnClickEvents": True,
		"snapEnabled": True,
		"snapPixels": 15,
		"edgeWidth": 6,
		"handleCount": 5
	}
