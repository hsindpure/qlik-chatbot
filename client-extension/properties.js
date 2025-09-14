define([], function() {
  'use strict';
  return {
    type: 'items',
    component: 'accordion',
    items: {
      settings: {
        uses: 'settings',
        items: {
          backend: {
            type: 'items',
            label: 'AI Backend',
            items: {
              apiUrl: {
                ref: 'props.apiUrl',
                label: 'AI Backend URL (POST /ai-query)',
                type: 'string',
                defaultValue: ''
              },
              objectIds: {
                ref: 'props.objectIds',
                label: 'Comma-separated Qlik Object IDs to include (optional)',
                type: 'string',
                defaultValue: ''
              },
              maxRows: {
                ref: 'props.maxRows',
                label: 'Max rows to request per object (backend may limit)',
                type: 'integer',
                defaultValue: 200
              }
            }
          }
        }
      }
    }
  };
});
