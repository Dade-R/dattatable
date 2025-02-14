import { Components } from "gd-sprest-bs";

// DataTables.net
import * as $ from "jquery";
import "datatables.net";
import "datatables.net-bs5";

/**
 * Data Table
 */
export interface IDataTable {
    datatable: any;
    filter: (idx: number, value?: string) => void;
    filterExact: (idx: number, value?: string) => void;
    filterMulti: (idx: number, values?: string[]) => void;
    onRendered?: (el?: HTMLElement, dt?: any) => void;
    refresh: (rows: any[]) => void;
    search: (value?: string) => void;
}

/**
 * Properties
 */
export interface IDataTableProps {
    columns: Components.ITableColumn[];
    dtProps?: any;
    el: HTMLElement;
    onRendered?: (el?: HTMLElement, dt?: any) => void;
    rows?: any[];
}

/**
 * Data Table
 */
export class DataTable implements IDataTable {
    private _datatable = null;
    private _props: IDataTableProps = null;

    // Constructor
    constructor(props: IDataTableProps) {
        // Save the properties
        this._props = props;

        // Render the table
        this.refresh(props.rows);
    }

    // Applies the datatables.net plugin
    private applyPlugin(table: Components.ITable) {
        // Render the datatable
        this._datatable = $(table.el).DataTable(this._props.dtProps);

        // Call the render event in a separate thread to ensure the dashboard object is created
        setTimeout(() => {
            this._props.onRendered ? this._props.onRendered(this._props.el, this._datatable) : null;
        }, 50);
    }

    /** Public Interface */

    // Datatables.net object
    get datatable(): any { return this._datatable; }

    // The data table element
    get el(): HTMLElement { return this._props.el; }

    // Filters the status
    filter(idx: number, value: string = "") {
        // Set the filter
        this._datatable.column(idx).search(value.replace(/[-[/\]{}()*+?.,\\^$#\s]/g, '\\$&'), true, false).draw();
    }

    // Filters the status
    filterExact(idx: number, value: string = "") {
        // Set the filter
        this._datatable.column(idx).search("^" + value.replace(/[-[/\]{}()*+?.,\\^$#\s]/g, '\\$&') + "$", true, false).draw();
    }

    // Filters multiple values against the status
    filterMulti(idx: number, values: string[] = []) {
        // Parse the values
        for (let i = 0; i < values.length; i++) {
            // Update the value
            values[i] = values[i].replace(/\|/g, '\\$&');
        }

        // Filter the values
        this.filter(idx, values.join('|'));
    }

    // Method to reload the data
    refresh(rows: any[] = []) {
        // See if the datatable exists
        if (this._datatable != null) {
            // Clear the datatable
            this._datatable.clear();
            this._datatable.destroy();
            this._datatable = null;
        }

        // Clear the datatable element
        while (this._props.el.firstChild) { this._props.el.removeChild(this._props.el.firstChild); }

        // Render the data table
        let table = Components.Table({
            el: this._props.el,
            rows,
            columns: this._props.columns
        });

        // Apply the plugin
        this.applyPlugin(table);
    }

    // Searches the datatable
    search(value: string = "") {
        // Search the table
        this._datatable.search(value).draw();
    }
}