def saveAsMongo(connector, collection, saveItems):
	_id=system.mongodb.insertOne(connector, collection, saveItems)
	return _id

def saveMongo(_id, connector, collection, saveItems):
	from system.mongodb.types import ObjectId
	filter = {"_id": ObjectId(_id)}
	update=system.mongodb.replaceOne(connector, collection, filter, saveItems)
	return _id
	
def configPayload(save, connector, collection, filename, nodes, edges, eamUnlimited, config, username, _id=None, meetingId=None, version='V260518'):
	saveDate=system.date.now()
	payload={
		"nodes": nodes,
		"edges": edges,
		"eamUnlimited": eamUnlimited,
		"config": {},
		"version": version,
		"username": username,
		"saveDate": saveDate,
		"filename": filename
	}
	if _id is not None:
		payload['_id']=_id
		
	if meetingId is not None:
		payload['meetingId']=meetingId
	
	
	
	
	#----------------------------------mongoDB----------------------------------------
	if save and _id is not None:
		saveId=saveMongo(_id, connector, collection, payload)
	
	else:
		saveId=saveAsMongo(connector, collection, payload)
		
	
	
	
	
	
	
	return {'filename':filename, 'id':saveId, 'saveDate':saveDate, 'connector':connector, 'collection':collection, 'meetingId':meetingid, "userName":userName}