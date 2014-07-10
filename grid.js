/*!
 * Ext JS Library 3.2.1
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */

Ext.data.LoopProxy = function(config){
    
	Ext.apply(this, config);
    Ext.data.LoopProxy.superclass.constructor.call(this, config);
};

Ext.extend(Ext.data.LoopProxy, Ext.data.DataProxy, {
    doRequest : function(action, rs, params, reader, callback, scope, options) {
       if (this.directFn)
           this.directFn(arguments);
   },
    onRead : function(action, trans, result, res) {
       console.log(">> onRead:", arguments);
    },
    onWrite : function(action, trans, result, res, rs) {
       console.log(">> onWrite:", arguments);
    }
});

Ext.onReady(function(){

    var storeBack = new Ext.data.Store({
        storeId: 'back',
		url: 'api/zone',
		autoSave: true,
		restful: true,	
		reader: new Ext.data.JsonReader({		
			root: 'data', 
			idProperty: '_id_',
			fields: [
				'_id_',
				'name',
				'devices'
			]
		}),
		writer: new Ext.data.JsonWriter({
			writeAllFields: true
		}) 
	}); 

	Ext.util.Observable.capture(storeBack, function(evname) {
		console.log("STORY BACK:  " + evname, arguments);
	});

	var storeFront = new Ext.data.Store({
		storeId: 'front',
		restful: true,
		/*proxy: new Ext.data.LoopProxy({
			directFn: function() {
				console.log(">> request", arguments[0][0]);
			}
		}),*/ 
		reader: new Ext.data.JsonReader({
			root: 'devices',
			fields: [
				'trigger_field',
				'trigger_predicate',
				'trigger_value'
			]
		})/*, 
		writer: new Ext.data.JsonWriter({
			writeAllFields: true,
			createRecord: function(record) {
    			console.log(">> create", arguments);
    			return record.data;
			},
			updateRecord: function(record) {
				console.log(">> update", arguments);
			},
			destroyRecord: function(record) {
				console.log(">> destroy", arguments);
			}
		})*/
	});
    
	var gridFront = new Ext.grid.GridPanel({ 
        width: 540,
        height :200,
		frame: true,
        renderTo: 'gridFront',
		store: storeFront,
        columns: [{
			header: 'Field', 
			dataIndex: 'trigger_field'
		},{
			header: 'Predicate',
			dataIndex: 'trigger_predicate'
		},{
			header: 'Value',
			dataIndex: 'trigger_value'
		}],
		viewConfig: {
			forceFit: true
		}	
    });

	var gridBack = new Ext.grid.GridPanel({
		width: 540,
		height: 200,
		frame: true,
		renderTo: 'gridBack',
		store: storeBack, 
		tbar: [{
            text: 'Add',
            handler: onAdd
        }, '-', {
			text: 'Edit',
			handler: onEdit
		}, '-', {
            text: 'Remove',
            handler: onRemove
        }, '-', {
			text: 'Save',
			handler: onSave
		}, '-' ],
		viewConfig: {
			forceFit: true
		},	
		columns: [{
			header: 'ID',
			dataIndex: '_id_'
		},{
			header: 'Name',
			dataIndex: 'name'
		},{
			header: 'Devices',
			dataIndex: 'devices'
		}],
		listeners: {
			_add: function(store, record) {
				console.log(">> _add", arguments);
				storeFront.loadData(record.data);
				gridFront.getView().refresh();			
			},
			_edit: function(store, record) {
				storeFront.loadData(record.data);
			},
			_remove: function(store, record) {
				storeFront.loadData(record.data);
			}
		}	
	});
	gridBack.addEvents('_add', '_edit', '_remove');

	function onAdd(btn, ev) { 
		console.log(">> add:", arguments);
		var record = new storeBack.recordType({
			_id_: '0000',
			name: 'test1',
			devices: [{
				trigger_field: 'foo1',
				trigger_predicate: 'is',
				trigger_value: 'bar1'
			},{
				trigger_field: 'foo2',
				trigger_predicate: 'is',
				trigger_value: 'bar2'
			}]
		});	
		storeBack.insert(0, record);
		gridBack.fireEvent('_add', gridBack, record);
		return true;	
	}

	function onEdit(btn, ev) {
		console.log(">> edit:", arguments);
		var record = gridBack.getSelectionModel().getSelected();
		if (!record)
			return false;
		record.beginEdit();
		record.data.name = 'bar';
		record.markDirty();
		record.endEdit();
		gridBack.fireEvent('_edit', gridBack, record);
		return true;
	}

 	function onRemove(btn, ev) {
		console.log(">> remove:", arguments); 
		var record = gridBack.getSelectionModel().getSelected();
        if (!record) 
            return false; 
        storeBack.remove(record);
		gridBack.fireEvent('_remove', gridBack, record);
		return true;
	}

	function onSave(btn, ev) {
		storeBack.save();
	}
	
    storeBack.load();
});
