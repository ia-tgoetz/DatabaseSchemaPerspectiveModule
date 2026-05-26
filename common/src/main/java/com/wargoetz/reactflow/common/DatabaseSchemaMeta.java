package com.wargoetz.reactflow.common;

import com.inductiveautomation.ignition.common.jsonschema.JsonSchema;
import com.inductiveautomation.perspective.common.api.BrowserResource;
import com.inductiveautomation.perspective.common.api.ComponentDescriptor;
import com.inductiveautomation.perspective.common.api.ComponentDescriptorImpl;
import com.inductiveautomation.perspective.common.api.ComponentEventDescriptor;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.Set;

public class DatabaseSchemaMeta {

    public static final String COMPONENT_ID = "com.wargoetz.reactflow.databaseschema";
    public static final String MODULE_ID = "com.wargoetz.reactflow";

    // Forces the client bundle to load first 
    public static final BrowserResource JS_RESOURCE = new BrowserResource(
        "databaseschema-0-shared-js", 
        "/res/" + MODULE_ID + "/WARGoetzComponents.js", 
        BrowserResource.ResourceType.JS
    );

    // Forces the designer bundle to load second
    public static final BrowserResource DESIGNER_JS_RESOURCE = new BrowserResource(
        "databaseschema-1-designer-js", 
        "/res/" + MODULE_ID + "/WARGoetzDesigner.js", 
        BrowserResource.ResourceType.JS
    );

    // Loads the CSS last
    public static final BrowserResource CSS_RESOURCE = new BrowserResource(
        "databaseschema-2-shared-css", 
        "/res/" + MODULE_ID + "/WARGoetzComponents.css",
        BrowserResource.ResourceType.CSS
    );

    public static final JsonSchema ROW_CLICK_EVENT_SCHEMA = JsonSchema.parse(new ByteArrayInputStream("{ \"type\": \"object\", \"properties\": { \"tableId\": { \"type\": \"string\" }, \"column\": { \"type\": \"string\" } } }".getBytes(StandardCharsets.UTF_8)));
    public static final JsonSchema ERROR_EVENT_SCHEMA = JsonSchema.parse(new ByteArrayInputStream("{ \"type\": \"object\", \"properties\": { \"source\": { \"type\": \"string\" }, \"message\": { \"type\": \"string\" }, \"stack\": { \"type\": \"string\" } } }".getBytes(StandardCharsets.UTF_8)));

    public static final ComponentDescriptor DESCRIPTOR = ComponentDescriptorImpl.ComponentBuilder.newBuilder()
            .setId(COMPONENT_ID)
            .setModuleId(MODULE_ID)
            .setPaletteCategory("WARGoetz") 
            .setName("Database Schema")
            .addPaletteEntry("", "Database Schema", "Visualizes SQL Historian schemas.", null, null)
            .setDefaultMetaName("dbSchema")
            .setResources(Set.of(JS_RESOURCE, DESIGNER_JS_RESOURCE, CSS_RESOURCE))
            .setEvents(Set.of(
                new ComponentEventDescriptor("onRowClick", "Fired when a user clicks on a specific column row in a table.", ROW_CLICK_EVENT_SCHEMA),
                new ComponentEventDescriptor("onCanvasError", "Fired when a canvas rendering or interaction error occurs.", ERROR_EVENT_SCHEMA)
            ))
            .setSchema(JsonSchema.parse(DatabaseSchemaMeta.class.getResourceAsStream("/databaseschema.props.json")))
            .build();
}