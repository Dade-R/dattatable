import { Components } from "gd-sprest-bs";

export interface ITiles {
    filter?: (value: string | string[], item?: Components.ICheckboxGroupItem) => void;
    search?: (value: string) => void;
}

export interface ITilesProps {
    bodyFields?: [string];
    bodyTemplate?: string;
    colSize?: number;
    el: HTMLElement;
    filterFields?: [string];
    items: any[];
    onBodyRendered?: (el?: HTMLElement, item?: any) => void;
    onCardRendered?: (el?: HTMLElement, item?: any) => void;
    onCardRendering?: (item?: Components.ICardProps) => void;
    onFooterRendered?: (el?: HTMLElement, item?: any) => void;
    onHeaderRendered?: (el?: HTMLElement, item?: any) => void;
    onPaginationRendered?: (el?: HTMLElement) => void;
    onSubTitleRendered?: (el?: HTMLElement, item?: any) => void;
    onTitleRendered?: (el?: HTMLElement, item?: any) => void;
    paginationLimit?: number;
    showFooter?: boolean;
    showHeader?: boolean;
    showPagination?: boolean;
    subTitleFields?: [string];
    subTitleTemplate?: string;
    titleFields?: [string];
    titleTemplate?: string;
}

/**
 * Tiles
 */
export class Tiles implements ITiles {
    private _tiles: Components.ICardGroup = null;
    private _activeFilterValue: string = null;
    private _activeSearchValue: string = null;
    private _pagination: Components.IPagination = null;
    private _props: ITilesProps;

    // Constructor
    constructor(props: ITilesProps) {
        // Save the properties
        this._props = props;

        // Render the tile
        this.render();
    }

    // Filters the tile
    filter(values: string[] = []) {
        this._activeFilterValue = values.join('|');

        // Parse all tile
        let tiles = this._props.el.querySelectorAll(".card");
        for (let i = 0; i < tiles.length; i++) {
            // Hide the tile
            tiles[i].parentElement.classList.add("d-none");
        }

        // Update the tiles
        this.updateTiles();
    }

    // Renders the dashboard
    private render() {
        // Render the tile
        this.renderTiles();

        // Update the tiles
        this.updateTiles();
    }

    // Generate the card properties
    private generateCard(item: any): Components.ICardProps {
        let filterValues: string[] = [];

        // See if the filter field is specified
        if (this._props.filterFields) {
            // Parse the fields
            for (let i = 0; i < this._props.filterFields.length; i++) {
                let filterField = this._props.filterFields[i];

                // Get the filter values
                let filters = item[filterField] || [];
                filters = filters["results"] || [filters];

                // Append the values
                filterValues = filterValues.concat(filters);
            }
        }

        // See if the body fields exist
        let bodyContent = this._props.bodyTemplate || "";
        if (this._props.bodyFields) {
            // Parse the fields
            for (let i = 0; i < this._props.bodyFields.length; i++) {
                let field = this._props.bodyFields[i];
                let value = item[field] || "";

                // See if there is a template
                if (this._props.bodyTemplate) {
                    // Replace the values
                    let pattern = new RegExp("({" + field + "})", "g")
                    bodyContent = bodyContent.replace(pattern, value);
                } else {
                    // Append the value
                    bodyContent += value;
                }
            }
        }

        // See if the sub-title fields exist
        let subTitleContent = this._props.subTitleTemplate || "";
        if (this._props.subTitleFields) {
            // Parse the fields
            for (let i = 0; i < this._props.subTitleFields.length; i++) {
                let field = this._props.subTitleFields[i];
                let value = item[field] || "";

                // See if there is a template
                if (this._props.subTitleTemplate) {
                    // Replace the values
                    let pattern = new RegExp("({" + field + "})", "g")
                    subTitleContent = subTitleContent.replace(pattern, value);
                } else {
                    // Append the value
                    subTitleContent += value;
                }
            }
        }

        // See if the sub-title fields exist
        let titleContent = this._props.titleTemplate || "";
        if (this._props.titleFields) {
            // Parse the fields
            for (let i = 0; i < this._props.titleFields.length; i++) {
                let field = this._props.titleFields[i];
                let value = item[field] || "";

                // See if there is a template
                if (this._props.titleTemplate) {
                    // Replace the values
                    let pattern = new RegExp("({" + field + "})", "g")
                    titleContent = titleContent.replace(pattern, value);
                } else {
                    // Append the value
                    titleContent += value;
                }
            }
        }

        // Set the card props
        let cardProps: Components.ICardProps = {
            onRender: (el, card) => {
                // See if filters exist
                if (filterValues && filterValues.length > 0) {
                    // Set the data filter value
                    el.setAttribute("data-filter", filterValues.join('|'));
                }

                // Call the event
                this._props.onCardRendered ? this._props.onCardRendered(el, card) : null;
            },
            body: [{
                content: bodyContent,
                data: item,
                subTitle: subTitleContent,
                title: titleContent,
                onRender: (el, card) => {
                    let item = card.data;

                    // Call the events
                    this._props.onTitleRendered ? this._props.onTitleRendered(el.querySelector(".card-title"), item) : null;
                    this._props.onSubTitleRendered ? this._props.onSubTitleRendered(el.querySelector(".card-subtitle"), item) : null;
                    this._props.onBodyRendered ? this._props.onBodyRendered(el, item) : null;
                }
            }]
        };

        // See if we are showing the header
        let showHeader = typeof (this._props.showHeader) === "boolean" ? this._props.showHeader : true;
        if (showHeader) {
            cardProps.header = {
                onRender: (el) => {
                    this._props.onHeaderRendered ? this._props.onHeaderRendered(el, item) : null;
                }
            };
        }

        // See if we are showing the footer
        let showFooter = typeof (this._props.showFooter) === "boolean" ? this._props.showFooter : true;
        if (showFooter) {
            cardProps.footer = {
                onRender: (el) => {
                    this._props.onFooterRendered ? this._props.onFooterRendered(el, item) : null;
                }
            };
        }

        // Call the event
        this._props.onCardRendering ? this._props.onCardRendering(cardProps) : null;

        // Return the card properties
        return cardProps;
    }

    // Renders the tiles
    private renderTiles() {
        // Parse the items
        let cards: Array<Components.ICardProps> = [];
        for (let i = 0; i < this._props.items.length; i++) {
            let item = this._props.items[i];

            // Add an tile
            cards.push(this.generateCard(item));
        }

        // Render the tiles
        this._tiles = Components.CardGroup({
            el: this._props.el,
            cards,
            colSize: this._props.colSize
        });
    }

    // Updates the visibility of the tiles
    private updateTiles() {
        let paginationLimit = this._props.paginationLimit || 10;

        // Get the pagination element
        let elPagination = this._props.el.querySelector(".tiles-pagination") as HTMLElement;
        if (elPagination) {
            // Clear the element
            while (elPagination.firstChild) { elPagination.removeChild(elPagination.firstChild); }
        } else {
            // Create the element
            elPagination = document.createElement("div");
            elPagination.classList.add("tiles-pagination");
            this._props.el.appendChild(elPagination);
        }

        // Get the elements as an array
        let elItems = Array.from(this._tiles.el.querySelectorAll(".card"));

        // Parse the items
        for (let i = elItems.length - 1; i >= 0; i--) {
            let elItem = elItems[i] as HTMLElement;

            // See if a filter value exists
            if (this._activeFilterValue) {
                let filterValues = (elItem.dataset.filter || "").split('|');

                // Parse the active filters
                let activeFilters = this._activeFilterValue.split('|');
                let showItem = false;
                for (let j = 0; j < activeFilters.length; j++) {
                    // See if the item contains the filter value
                    if (filterValues.indexOf(activeFilters[j]) >= 0) {
                        // Set the flag and break from the loop
                        showItem = true;
                        break;
                    }
                }

                // See if we are hiding the item
                if (!showItem) {
                    // Hide the item
                    elItem.parentElement.classList.add("d-none");

                    // Exclude the item from the array
                    elItems.splice(i, 1);

                    // Continue the loop
                    continue;
                }
            }

            // See if a search value exists
            if (this._activeSearchValue) {
                // See if the item doesn't contains the search value
                if (elItem.innerText.toLowerCase().indexOf(this._activeSearchValue.toLowerCase()) < 0) {
                    // Hide the item
                    elItem.parentElement.classList.add("d-none");

                    // Exclude the item from the array
                    elItems.splice(i, 1);

                    // Continue the loop
                    continue;
                }
            }
        }

        // Parse the active items to show
        for (let i = 0; i < paginationLimit; i++) {
            let elItem = elItems[i] as HTMLElement;

            // Ensure the item exists
            if (elItem) {
                // Show the item
                elItem.parentElement.classList.remove("d-none");
            } else {
                // Break from the loop
                break;
            }
        }

        // Parse the active items to hide
        for (let i = paginationLimit; i < elItems.length; i++) {
            let elItem = elItems[i] as HTMLElement;

            // Hide the item
            elItem.parentElement.classList.add("d-none");
        }

        // See if we are showing pagination
        let showPagination = typeof (this._props.showPagination) === "boolean" ? this._props.showPagination : true;
        if (showPagination) {
            // Render the pagination
            this._pagination = Components.Pagination({
                el: elPagination,
                className: "d-flex justify-content-end pt-2",
                numberOfPages: Math.ceil(elItems.length / paginationLimit),
                onClick: (pageNumber) => {
                    // Parse the items
                    for (let i = 0; i < elItems.length; i++) {
                        let elItem = elItems[i] as HTMLElement;

                        // Hide the item
                        elItem.parentElement.classList.add("d-none");
                    }

                    // Parse the items to show
                    let startIdx = (pageNumber - 1) * paginationLimit;
                    for (let i = startIdx; i < startIdx + paginationLimit && i < elItems.length; i++) {
                        let elItem = elItems[i];

                        // Show the item
                        elItem.parentElement.classList.remove("d-none");
                    }
                }
            });

            // Call the event
            this._props.onPaginationRendered ? this._props.onPaginationRendered(elPagination) : null;
        }
    }

    // Searches the tile
    search(value: string) {
        // Set the search value
        this._activeSearchValue = value || "";

        // Update the tiles
        this.updateTiles();
    }
}