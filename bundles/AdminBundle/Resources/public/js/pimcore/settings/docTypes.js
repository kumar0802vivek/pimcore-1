/**
 * Pimcore
 *
 * This source file is available under two different licenses:
 * - GNU General Public License version 3 (GPLv3)
 * - Pimcore Commercial License (PCL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 * @copyright  Copyright (c) Pimcore GmbH (http://www.pimcore.org)
 * @license    http://www.pimcore.org/license     GPLv3 and PCL
 */

pimcore.registerNS("pimcore.settings.document.doctypes");
pimcore.settings.document.doctypes = Class.create({

    initialize: function () {

        this.getTabPanel();
    },

    activate: function () {
        var tabPanel = Ext.getCmp("pimcore_panel_tabs");
        tabPanel.setActiveItem("pimcore_document_types");
    },

    getTabPanel: function () {

        if (!this.panel) {
            this.panel = new Ext.Panel({
                id: "pimcore_document_types",
                title: t("document_types"),
                iconCls: "pimcore_icon_doctypes",
                border: false,
                layout: "fit",
                closable: true,
                items: [this.getRowEditor()]
            });

            var tabPanel = Ext.getCmp("pimcore_panel_tabs");
            tabPanel.add(this.panel);
            tabPanel.setActiveItem("pimcore_document_types");


            this.panel.on("destroy", function () {
                pimcore.globalmanager.remove("document_types");
            }.bind(this));

            pimcore.layout.refresh();
        }

        return this.panel;
    },

    getRowEditor: function () {

        this.store = pimcore.globalmanager.get("document_types_store");

        var typesColumns = [
            {
                text: t("name"),
                flex: 100,
                sortable: true,
                dataIndex: 'name',
                editor: new Ext.form.TextField({})
            },
            {
                text: t("group"),
                flex: 100,
                sortable: true,
                dataIndex: 'group',
                editor: new Ext.form.TextField({})
            },
            {
                text: t("controller"),
                flex: 200,
                sortable: true,
                dataIndex: 'controller',
                editor: new Ext.form.ComboBox({
                    store: new Ext.data.JsonStore({
                        autoDestroy: true,
                        autoLoad: true,
                        proxy: {
                            type: 'ajax',
                            url: Routing.generate('pimcore_admin_misc_getavailablecontroller_references'),
                            reader: {
                                type: 'json',
                                rootProperty: 'data'
                            }
                        },
                        fields: ["name"]
                    }),
                    triggerAction: "all",
                    typeAhead: true,
                    queryMode: "local",
                    anyMatch: true,
                    editable: true,
                    forceSelection: false,
                    displayField: 'name',
                    valueField: 'name',
                    matchFieldWidth: false,
                    listConfig: {
                        maxWidth: 400
                    }
                })
            },
            {
                text: t("template"),
                flex: 50,
                sortable: true,
                dataIndex: 'template',
                editor: new Ext.form.ComboBox({
                    store: new Ext.data.Store({
                        autoDestroy: true,
                        proxy: {
                            type: 'ajax',
                            url: Routing.generate('pimcore_admin_misc_getavailabletemplates'),
                            reader: {
                                type: 'json',
                                rootProperty: 'data'
                            }
                        },
                        fields: ["path"]
                    }),
                    queryMode: 'local',
                    triggerAction: "all",
                    displayField: 'path',
                    valueField: 'path',
                    matchFieldWidth: false,
                    listConfig: {
                        maxWidth: 400
                    }
                })
            },
            {
                text: t("type"),
                flex: 50,
                sortable: true,
                dataIndex: 'type',
                editor: new Ext.form.ComboBox({
                    triggerAction: 'all',
                    editable: false,
                    store: ["page", "snippet", "email", "newsletter", "printpage", "printcontainer"]
                })
            },
            {
                text: t("priority"),
                flex: 50,
                sortable: true,
                dataIndex: 'priority',
                editor: new Ext.form.ComboBox({
                    store: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    mode: "local",
                    editable: false,
                    triggerAction: "all"
                })
            },
            {
                xtype: 'checkcolumn',
                text: t("static"),
                dataIndex: 'staticGeneratorEnabled',
                width: 40,
                renderer: function (value, metaData, record) {
                    return (record.get('type') !== "page") ? '' : this.defaultRenderer(value, metaData);
                },
                listeners: {
                    beforecheckchange: function (el, rowIndex, checked, eOpts) {
                        if (this.store.getAt(rowIndex).get("type") !== "page") {
                            record.set('staticGeneratorEnabled', false);
                            return false;
                        }
                    }.bind(this),
                    checkChange: function (column, rowIndex, checked, eOpts) {
                        var record = this.store.getAt(rowIndex);
                        record.set('staticGeneratorEnabled', checked);
                    }.bind(this)
                }
            },
            {
                text: t("creationDate"),
                sortable: true,
                dataIndex: 'creationDate',
                editable: false,
                width: 130,
                hidden: true,
                renderer: function (d) {
                    if (d !== undefined) {
                        var date = new Date(d * 1000);
                        return Ext.date.format(date, "Y-m-d H:i:s");
                    } else {
                        return "";
                    }
                }
            },
            {
                text: t("modificationDate"),
                sortable: true,
                dataIndex: 'modificationDate',
                editable: false,
                width: 130,
                hidden: true,
                renderer: function (d) {
                    if (d !== undefined) {
                        var date = new Date(d * 1000);
                        return Ext.date.format(date, "Y-m-d H:i:s");
                    } else {
                        return "";
                    }
                }
            },
            {
                xtype: 'actioncolumn',
                menuText: t('delete'),
                width: 30,
                items: [{
                    tooltip: t('delete'),
                    icon: "/bundles/pimcoreadmin/img/flat-color-icons/delete.svg",
                    handler: function (grid, rowIndex) {
                        grid.getStore().removeAt(rowIndex);
                    }.bind(this)
                }]
            }, {
                xtype: 'actioncolumn',
                menuText: t('translate'),
                width: 30,
                items: [{
                    tooltip: t('translate'),
                    icon: "/bundles/pimcoreadmin/img/flat-color-icons/collaboration.svg",
                    handler: function (grid, rowIndex) {
                        var rec = grid.getStore().getAt(rowIndex);
                        try {
                            pimcore.globalmanager.get("translationadminmanager").activate(rec.data.name);
                        }
                        catch (e) {
                            pimcore.globalmanager.add("translationadminmanager",
                                new pimcore.settings.translation.admin(rec.data.name));
                        }
                    }.bind(this)
                }]
            }
        ];


        this.cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        });

        this.grid = Ext.create('Ext.grid.Panel', {
            frame: false,
            autoScroll: true,
            bodyCls: "pimcore_editable_grid",
            store: this.store,
            columns: {
                items: typesColumns,
                defaults: {
                    renderer: Ext.util.Format.htmlEncode
                },
            },
            columnLines: true,
            trackMouseOver: true,
            stripeRows: true,
            selModel: Ext.create('Ext.selection.RowModel', {}),
            plugins: [
                this.cellEditing
            ],
            tbar: {
                cls: 'pimcore_main_toolbar',
                items: [
                    {
                        text: t('add'),
                        handler: this.onAdd.bind(this),
                        iconCls: "pimcore_icon_add"
                    }
                ]
            },
            viewConfig: {
                forceFit: true
            }
        });

        pimcore.plugin.broker.fireEvent("prepareDocumentTypesGrid", this.grid, this);

        return this.grid;
    },

    onAdd: function (btn, ev) {
        this.grid.store.insert(0, {
            name: t('new_document_type'),
            type: "page"
        });
    }
});
