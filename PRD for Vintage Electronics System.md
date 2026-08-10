# **PRD for Vintage Electronics System**

[https://gemini.google.com/app/2d77a925c342dfb7](https://gemini.google.com/app/2d77a925c342dfb7)

*User prompt: help me create a PRD doc for a Product/system to support the buying, reapairing, storage/organisation, and selling, of old electronics (mostly vintage audio gear)*

# **System Specification & Contract Document**

**Vintage Audio Lifecycle Management Platform**

> * **Project:** Bespoke Inventory & Repair Tracking Application  
> * **Stack:** React, FastAPI (Python), PostgreSQL  
> * **Status:** Initial Technical Specification for Development  
> * **Date:** August 2026

## **1\. System Overview & Architecture**

This document serves as the technical specification and development contract for a bespoke, self-hosted web application designed to manage the lifecycle of vintage audio equipment. The system will track units from initial acquisition, through the repair and parts-ordering phase, to final multi-channel sale, providing true net profit calculations.

**Target Infrastructure** The application is designed as a monolithic API backend with a decoupled single-page application (SPA) frontend, suitable for deployment via Docker containers on a local network server (e.g., Ubuntu/Linux environment).

### **1.1 Technology Stack**

> * **Frontend:** React.js, utilising a component library (e.g., Material-UI or Tailwind CSS) for rapid, responsive UI development.  
> * **Backend:** Python 3.x using the FastAPI framework for high-performance, asynchronous REST API endpoints.  
> * **Database:** PostgreSQL 15+, managed via an ORM (e.g., SQLAlchemy or SQLModel).

## **2\. Database Schema (Entity Relationship)**

The system requires a normalised relational structure to prevent data duplication and allow for accurate financial roll-ups.

### **Table: inventory\_units**

The core table representing physical hardware.

| Column Name | Data Type | Constraints & Notes |
| :---- | :---- | :---- |
| unit\_id | UUID | Primary Key |
| brand | VARCHAR(100) | e.g., Pioneer, Kenwood |
| model\_number | VARCHAR(100) | e.g., PD-6030, CT-F500 |
| serial\_number | VARCHAR(100) | Unique identifier for the specific physical unit |
| category | VARCHAR(50) | Enum: CD Player, Turntable, Amplifier, etc. |
| acquisition\_source | VARCHAR(100) | e.g., eBay, Car Boot |
| base\_cost | DECIMAL(10,2) | Initial purchase price in GBP (£) |
| cosmetic\_condition | VARCHAR(50) | Mint, Good, Fair, Poor, For Parts |
| system\_status | VARCHAR(50) | Enum: Triage, On Bench, Waiting Parts, Ready to Sell, Sold, Scrapped |
| created\_at | TIMESTAMP | Default: CURRENT\_TIMESTAMP |

### **Table: repair\_logs**

Tracks the technical workbench phase and prioritisation.

| Column Name | Data Type | Constraints & Notes |
| :---- | :---- | :---- |
| log\_id | UUID | Primary Key |
| unit\_id | UUID | Foreign Key \-\> inventory\_units(unit\_id) |
| priority | INTEGER | 1 (High) to 3 (Low) |
| initial\_symptoms | TEXT | Diagnostic baseline |
| action\_plan | TEXT | Required steps (e.g., 'replace 3 pulleys') |
| bench\_notes | TEXT | Running log of measurements and fixes |
| updated\_at | TIMESTAMP | On update current\_timestamp |

### **Table: part\_orders**

Tracks procurement and ETAs, directly impacting the total cost basis.

| Column Name | Data Type | Constraints & Notes |
| :---- | :---- | :---- |
| part\_id | UUID | Primary Key |
| unit\_id | UUID | Foreign Key \-\> inventory\_units(unit\_id) |
| description | VARCHAR(255) | Specific component name |
| supplier | VARCHAR(100) | e.g., Farnell, eBay, Mouser |
| cost | DECIMAL(10,2) | Include shipping if applicable |
| order\_status | VARCHAR(50) | Enum: To Order, Ordered, Shipped, Received, Installed |
| eta\_date | DATE | Nullable, expected delivery |

### **Table: sales\_listings**

Tracks the exit strategy across multiple platforms.

| Column Name | Data Type | Constraints & Notes |
| :---- | :---- | :---- |
| listing\_id | UUID | Primary Key |
| unit\_id | UUID | Foreign Key \-\> inventory\_units(unit\_id) |
| platform | VARCHAR(50) | e.g., Reverb, eBay, Facebook Marketplace |
| target\_price | DECIMAL(10,2) | Desired sale value |
| listing\_url | VARCHAR(255) | Direct link to live ad |
| final\_sale\_price | DECIMAL(10,2) | Nullable until sold |
| platform\_fees | DECIMAL(10,2) | Calculated or manual entry |
| shipping\_costs | DECIMAL(10,2) | Outbound postage |
| is\_active | BOOLEAN | True whilst listing is live |

## **3\. Core API Endpoints (FastAPI Contract)**

The backend will expose the following RESTful routes for the frontend application.

`# Inventory Management`  
`GET    /api/v1/inventory/           -> List all units (Supports filters: status, category)`  
`POST   /api/v1/inventory/           -> Create a new intake record`  
`GET    /api/v1/inventory/{id}       -> Get detailed view of a single unit`  
`PUT    /api/v1/inventory/{id}/status-> Update unit status (e.g., move to "On Bench")`

`# Workbench & Parts`  
`GET    /api/v1/inventory/{id}/parts -> Get all parts associated with a unit`  
`POST   /api/v1/inventory/{id}/parts -> Log a new part order for a unit`  
`PUT    /api/v1/parts/{part_id}      -> Update part status (e.g., "Received" -> "Installed")`

`GET    /api/v1/inventory/{id}/repair-> Get repair log`  
`PUT    /api/v1/inventory/{id}/repair-> Update bench notes or priority`

`# Finance & Exits`  
`GET    /api/v1/finance/profit/{id}  -> Calculate true net profit for a unit`

## **4\. User Interface (UI) Requirements**

> * **Dashboard:** A high-level view showing total units in stock, units awaiting parts, and quick links to high-priority repairs.  
> * **Inventory Grid:** A data table view (similar to Notion) but with sortable headers, filtering capabilities, and a quick-view modal for each unit.  
> * **Workbench Kanban:** A visual board displaying units as cards, categorised by status columns (Triage \-\> Waiting Parts \-\> On Bench \-\> Ready for Sale).  
> * **Financial Roll-up View:** A dedicated view showing the computed formula: Net Profit \= final\_sale\_price \- (base\_cost \+ sum(parts\_cost) \+ platform\_fees \+ shipping\_costs).

## **5\. Future Integration Roadmap**

Whilst out of scope for Version 1.0, the architecture must support:

> * **Reverb/eBay API Webhooks:** Automated status updates. Receiving a webhook from eBay when an item sells to automatically trigger a "delist" command to the Reverb API.  
> * **Barcode/QR Generation:** Creating physical labels linking to the unit\_id UUID for rapid inventory scanning.

---

*User prompt: Can you create some mockups of what you expect the GUI/workflow to look like?*

Response: Here is a conceptual look at how the graphical user interface could be structured in React, keeping things highly utilitarian and tailored for workshop use. I have mapped out three of the core screens using wireframe-style layouts.

### **1\. The Dashboard (Home View)**

This is your command centre when you first open the app, giving you an immediate snapshot of what needs your attention before you pick up a soldering iron.

**\[ ☰ RetroGear OS \]** Dashboard | Inventory | Workbench | Sales

**Overview** \[ Total Units in Stock: **42** \] \[ Units on Bench: **3** \] \[ Waiting on Parts: **5** \] \[ 30-Day Profit: **£345.50** \]

**Action Required (High Priority)**

> * **\[\!\] Part Arrived:** 3x Tracking Pulleys for Pioneer PD-6030 (Move to Bench?)  
> * **\[\!\] Listing Sold:** NAD 302 Amplifier sold on eBay. (Record final sale price and dispatch).

**Quick Intake** \[ \+ Log New Purchase \] \[ \+ Add Loose Part \]

### **2\. The Inventory Grid (The Notion Upgrade)**

This replaces your Notion list. It is a highly dense data table with sortable column headers, allowing you to quickly filter down to exactly what you are looking for.

**\[ ☰ RetroGear OS \]** Dashboard | Inventory | Workbench | Sales

\[Filter: All Categories ▾\] \[Filter: All Statuses ▾\] \[ Search: Make, Model, SN... \]

| Unit ID | Brand | Model | Category | Status | Serial Number | Base Cost |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **045** | Pioneer | PD-6030 | CD Transport | On Bench | SN-998273 | £45.00 |
| **046** | Aiwa | AD-6400 | Tape Deck | Waiting Parts | SN-110938 | £15.00 |
| **047** | NAD | 302 | Amplifier | Ready to Sell | SN-773645 | £30.00 |
| **048** | Pro-Ject | T1 Phono SB | Turntable | Triage | SN-882190 | £80.00 |

*Clicking any row opens the Unit Detail / Financial Roll-up modal.*

### **3\. The Workbench Kanban**

This view is optimised for a tablet or laptop sitting on your physical workbench. It visually tracks the progression of your current repair workload.

**\[ ☰ RetroGear OS \]** Dashboard | Inventory | Workbench | Sales

**Triage (Just Arrived)**

**Pro-Ject T1 Phono SB** Priority: Low *Symptoms: Motor spins, but phono stage output is dead. Needs multi-meter testing.* \[ Move to Bench ➔ \]

**Waiting on Parts**

**Aiwa AD-6400** Priority: Med *Blocker: Awaiting replacement capstan belts from WebSpareParts (ETA: 12 Aug).* \[ Mark Parts Received ➔ \]

**On The Bench**

**Pioneer PD-6030** Priority: High *Action: Replace all 3 pulleys in the transport mechanism. Clean laser lens.* \[ Log Notes \] \[ Mark Ready for Sale ➔ \]

**Ready for Sale**

**NAD 302** *Action: Fully serviced. Ground loop hum resolved. Cleaned chassis.* \[ Create Listing ➔ \]

### **4\. The Unit Detail & Financial Roll-up (Modal)**

When you click on a specific unit from the Inventory Grid, this view slides over. It houses the true profit calculation.

**\[ ← Back to Inventory \]**

## **Pioneer PD-6030 (CD Transport)**

Status: Ready to Sell | Unit ID: 045

**\[ Hardware Details \]** | **\[ Repair Log \]** | **\[ Parts Consumed \]** | **\[ Financials & Exit \]**

**Financial Summary**

> * **Base Purchase Cost:** £45.00  
> * **Parts Total:** £12.50 *(3x Pulleys: £8.00, Drawer Belt: £4.50)*  
> * **Total Cost Basis:** **£57.50**

**Sales Outbound**

> * **Target Price:** £150.00  
> * **Active Links:** \[ eBay ↗ \] \[ Reverb ↗ \]  
> * **Final Sale Price:** £140.00  
> * **Platform Fees (eBay 10.9%):** £15.26  
> * **Shipping Paid:** £8.99

**True Net Profit Calculation:** £140.00 \- (£57.50 \+ £15.26 \+ £8.99) \= **£58.25**

Which of these specific views would you like to start building the React frontend components for first?

---

