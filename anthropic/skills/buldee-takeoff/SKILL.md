---
name: buldee-takeoff
description: Build a quantity takeoff (quantities only, no pricing) from a job's uploaded plans, specs and addenda, on the Buldee Estimate Template, and save it as an Excel file.
---

# Buldee Takeoff

Use this skill for every Take Off run on Buldee. You run unattended: there is no one to answer questions during the run. Never stop to ask; make the most reasonable assumption, write it under Key Assumptions, and keep going.

The deliverable is always ONE .xlsx file built on the **Buldee Estimate Template**.

**This skill does quantities only. No pricing.** Leave Price Each (F), Mark up % (H) and Price basis (L) blank; keep the formulas in G, I, K so they fill in once prices are added. Pricing is done by the separate estimate tool.

## 0. Inputs and output (always first)
- **Job files:** everything under `/mnt/session/uploads/job/` (drawings, specs, addenda, bid form, site photos). List them all with sizes, then read each one. Don't skip files.
- **Template:** `assets/Buldee Estimate Template.xlsx` in this skill's directory. Always copy it; never edit the original.
- **Company letterhead (optional):** `/mnt/session/uploads/company/company.json` (name, slogan, address, phone, email, website) and `/mnt/session/uploads/company/logo.png`. If present, put the logo at B1 (~200x200 px) and the slogan in C1 (uppercase). If absent, leave B1 empty and put the company name, or nothing, in C1.
- **Job name:** given in the kickoff message. Put it in A1.
- **Output:** save the finished file as `/mnt/session/outputs/<Job name> - Buldee Estimate Template.xlsx`. Save nothing else in `/mnt/session/outputs/`.
- **Tools:** use Python. Install what you need with `pip install openpyxl pymupdf pillow` (PyMuPDF reads PDF text with positions and renders pages to images; use it wherever these steps mention pdftotext or pdftoppm). Recalculate with LibreOffice if it is available; if not, verify every formula by reading the cells back with openpyxl.

## 1. Gather inputs
- Drawings (PDF plans, finish schedules, door/window/fixture schedules), spec book, bid form, addenda.
- Read the bid form / scope of work to learn exactly what the contractor must install vs. what is by owner, by others, or alternates. Read every addendum and apply changes.
- **Fill the project information block (A1 and rows 5-11) before any quantities.** This is required on every run. Search, in this order: the drawing cover sheet and title blocks (project name, owner, architect); spec 00 11 13 Advertisement / Invitation to Bid and 00 21 13 Instructions to Bidders (bid date and time); 00 41 00 Bid Form; 00 52 00 Agreement, 00 73 00 Supplementary Conditions and 01 10 00 Summary (start, substantial and final completion, contract time, liquidated damages); any project info sheet. Addenda override all of these, including changed bid dates. A1 = the full project name as written on the cover sheet (fall back to the job name). B5 Owner, B6 Architect, B7 bid date and time, B8 start date, B9 finish date, B10 duration (e.g. "180 calendar days"), B11 liquidated damages (e.g. "$500 per calendar day"). Write "Not stated in the documents" for anything that isn't there; never leave B5-B11 empty. List each source sheet or section in KEY ASSUMPTIONS.

## 2. Do the takeoff
- Go sheet by sheet through the drawings; read schedules and keynotes, not just plan graphics. Use the drawing scale to measure (LF, SF, SY, CY, EA, LS, etc.).
- Put each item under its CSI division. Record the spec section or plan tag (e.g. "09 65 13 / RB-1", "Door 104A", "A-201 note 4") in the Spec / tag column.
- Net qty = measured quantity. Qty incl. waste = net x (1 + waste). Default waste: flooring/tile/ACT/gypsum board 10%, carpet tile 5-10%, paint 5%, base/trim 5-10%, counted items (doors, fixtures, accessories) 0%. State the factor used.
- Do not price anything: no unit prices, markup or price basis notes.
- Never invent quantities you can't see. If a sheet is missing or unreadable, flag it in Key Assumptions instead of guessing.

### Electrical takeoff (Div 26, 27, 28) — follow these steps in order
Count from the electrical, fire alarm, technology, mechanical, plumbing and door hardware drawings and schedules. Each count gets its own line with the sheet or tag in column B.
1. **Lighting fixtures:** count every fixture by fixture type from the lighting fixture schedule and the reflected ceiling / lighting plans (include exit and emergency lights and lighting controls/sensors).
2. **Outlets:** count receptacles (duplex, quad, GFCI, dedicated, USB) and switches.
3. **Ceiling fire devices:** count ceiling-mounted fire/life-safety devices (smoke and heat detectors, ceiling horn/strobes and speaker/strobes).
4. **Fire alarm devices:** count all other fire alarm devices (pull stations, wall horn/strobes, modules, duct detectors, panels/boosters).
5. **Data drops:** count data/telecom outlets and the drops at each (WAPs, phones, AV, cameras).
6. **Floor boxes:** count floor boxes and poke-throughs.
7. **New panels and breakers:** count new panelboards and the breakers needed (from panel schedules and one-line diagrams; if there are no schedules, estimate breakers from the new circuits and say so).
8. **Service:** check the one-line diagram, load calcs and notes to see if a **new or upgraded electrical service** is needed (new switchgear, transformer, meter, utility work). If yes, add it as its own line; if unclear, flag it under Key Assumptions.
9. **HVAC:** count all HVAC devices and units needing power or control wiring (RTUs, AHUs, unit ventilators, fan coils, exhaust fans, VAV boxes, unit heaters, condensing units, mini-splits, thermostats/controls), with disconnects.
10. **Plumbing connections:** count every plumbing fixture/equipment needing an electrical connection (water heaters, sensor faucets and flush valves, EWCs/bottle fillers, pumps, sump/ejector pumps).
11. **Door security hook-ups:** count all doors needing security or power hook-ups from the door hardware schedule and security plans (card readers, electric strikes, mag locks, electrified hardware, door operators/push buttons, door contacts, intercoms).
Add a short electrical count summary under Key Assumptions so it can be checked against the electrician's quote.

### Wall types (Div 0908 Wall Assemblies) — separate by composition
1. Find every wall/partition type in the wall type legend, partition schedule and details (e.g. W1, P2A, CMU-1). Record each type's full composition: stud size/gauge/spacing (or CMU size), GWB layers and type on each side, insulation, sound sealant, fire rating, STC, height (to ceiling, above ceiling, or to deck), and special items (abuse-resistant board, cement board, deflection head, backing).
2. Measure the LF of each wall type on every floor plan, and the height from sections/legend. Wall SF = LF × height. Deduct openings larger than 10 SF only if the drawings make that clear; otherwise don't deduct and say so.
3. On the **Summary** tab, under Div 0908, put **one line per wall type**: Item = wall type tag + short description, Spec / tag = full composition, Net qty = wall SF (linked to the Walls tab), Unit = SF.

### "Walls" tab — component takeoff per wall type
Add a second sheet named **Walls** (same fonts, header colors and borders as Summary). For each wall type, a block:
- Block header row (fill D9E1F2, bold): wall type tag and composition.
- Input rows: LF, height, wall SF (= LF × height), stud spacing.
- Component rows, columns: **Component | Spec / size | Basis | Net qty | Waste % | Qty incl. waste | Unit**. Use Excel formulas that reference the block's LF / SF cells. Typical components:
  - Studs: wall LF ÷ spacing + 1 per run, plus extras at openings/ends → EA (by length)
  - Top and bottom track (or deflection track): 2 × LF → LF
  - GWB per side per layer, by board type: wall SF × layers → SF, and sheets (÷ 32 for 4x8, ÷ 40 for 4x10, ÷ 48 for 4x12) → EA
  - Insulation / sound batts: wall SF → SF
  - Acoustic or fire-rated sealant at top/bottom: 2 × LF per side → LF
  - Corner bead / J-trim / control joints → LF
  - Tape & finish: GWB face SF → SF (finish level per spec)
  - CMU walls instead: block = wall SF × 1.125 → EA; mortar, grout, rebar, joint reinforcement, bond beams/lintels
  - Backing, shaft liner, cement board, abuse-resistant board where the type calls for it
- Default waste: GWB 10%, studs/track 5%, insulation 5%, CMU 5%, sealant 10%.
At the bottom of the Walls tab, add a **Component totals** table that sums each component across all wall types (e.g. total 5/8" Type X GWB SF and sheets, total 3-5/8" 20 ga studs, total track LF) for ordering and sub comparison.

### Floor types (Div 09 Finishes) — separate by type
1. Find every floor finish type in the room finish schedule, finish legend, finish plans and specs (e.g. LVT-1, VCT-2, CPT-1, RF-1 rubber, CT-1 ceramic tile, EP-1 epoxy, SC sealed concrete). Record each type's product/spec section, size, pattern and any prep the spec requires (leveling, moisture mitigation, removal of existing).
2. Measure the SF of each floor type room by room (from finish plans or the finish schedule × room areas). Keep base, thresholds and transitions with the floor type they belong to.
3. On the **Summary** tab, under Div 09, put for each floor type **two lines**: the floor material line (Item = floor type tag + description, Spec / tag = product/spec section, Net qty = SF linked to the Flooring tab, Unit = SF) and directly under it a **labor line** ("<floor type> – Installation labor", same SF, Unit = SF).

### "Flooring" tab — takeoff per floor type
Add a sheet named **Flooring** (same fonts, header colors and borders as Summary). For each floor type, a block:
- Block header row (fill D9E1F2, bold): floor type tag, product and spec section.
- Room rows: Room no. / name | SF (so the total can be checked against the drawings).
- Component rows, columns: **Component | Spec / size | Basis | Net qty | Waste % | Qty incl. waste | Unit**, with formulas referencing the block's total SF:
  - Floor material → SF (and cartons/boxes/rolls where the spec gives a size)
  - Adhesive / mortar & grout (tile) → SF or EA
  - Floor prep: leveling/patching, primer, moisture mitigation if specified → SF
  - Removal of existing flooring if in scope → SF
  - Base for that floor type (rubber/tile base) → LF
  - Transitions / thresholds / reducer strips → LF or EA
  - Sealer / finish coats (sealed concrete, VCT wax, epoxy coats) → SF
- **Last row of every floor type block: a Labor row** – "Installation labor – <floor type>", Net qty = the floor type's total SF, Unit = SF (no price; the estimate skill prices it).
- Default waste: carpet tile 5-10%, broadloom 10-15%, VCT/LVT 5-10%, ceramic/porcelain tile 10%, rubber 5-10%, base 5-10%, epoxy/sealer 5%.
At the bottom of the Flooring tab, add a **Floor type totals** table: floor type | SF | material qty incl. waste | labor SF.
- **Drawing renderings per room:** next to each room's row (column I), insert a cropped rendering of that room, marked up per "Drawing renderings" below: room outlined/shaded in the floor type's color, with the floor type and SF written on the image.

### Ceiling types (Div 09 Finishes) — separate by type
1. List every ceiling type from the reflected ceiling plans, ceiling legend, room finish schedule and specs (e.g. ACT-1 2x2, ACT-2 2x4, ACT-3 washable/moisture-resistant, GWB ceiling/soffit, specialty/wood/metal panels, open-to-structure painted). Record each type's product, tile size, edge, grid type/color, ceiling height and spec section.
2. Measure the SF of each ceiling type room by room, and the room perimeter (for wall angle).
3. On the **Summary** tab, under Div 09, put for each ceiling type **two lines**: the material line (Item = ceiling type tag + description, Spec / tag = product/spec section, Net qty = SF linked to the ACT tab, Unit = SF) and directly under it a **labor line** ("<ceiling type> – Installation labor", same SF, Unit = SF).

### "ACT" tab — ceiling material takeoff per type
Add a sheet named **ACT** (same fonts, header colors and borders as Summary). For each ceiling type (ACT and all other ceiling types), a block:
- Block header row (fill D9E1F2, bold): ceiling type tag, product, size and spec section.
- Room rows: Room no. / name | SF | perimeter LF | ceiling height.
- Component rows, columns: **Component | Spec / size | Basis | Net qty | Waste % | Qty incl. waste | Unit**, with formulas referencing the block's total SF and perimeter. For ACT:
  - Ceiling tiles → SF and cartons (by carton SF from the spec/product)
  - Main tees (12', 4' o.c.) → SF ÷ 4 = LF, and pieces (÷ 12)
  - 4' cross tees → SF ÷ 8 = EA
  - 2' cross tees (2x2 grid only) → SF ÷ 8 = EA
  - Wall angle / molding → perimeter LF, and pieces (÷ 10 or 12)
  - Hanger wire → SF ÷ 16 = EA (one every 4' along mains), plus attachments
  - Seismic/perimeter clips, compression posts if specified
  For GWB ceilings/soffits: framing (furring channel, carrier channel, hangers), GWB SF and sheets, tape & finish, access panels. For specialty ceilings: panels, suspension system and trim per the manufacturer.
- **Last row of every ceiling type block: a Labor row** – "Installation labor – <ceiling type>", Net qty = the ceiling type's total SF, Unit = SF (no price; the estimate skill prices it).
- Default waste: ceiling tiles 5-10%, grid 5%, wall angle 10%, GWB 10%.
At the bottom of the ACT tab, add a **Ceiling type totals** table: ceiling type | SF | tiles/cartons | main tee LF | cross tees EA | wall angle LF | labor SF.
- **Drawing renderings:** beside the ceiling blocks, insert the reflected ceiling plan crops used, with every room tagged in its ceiling type's color ("ACT-1 947 SF"), plus shaded crops for corridor/alternate areas.

### Painting (Div 09 Finishes) — one line on Summary, detail on a "Paint" tab
1. On the **Summary** tab, under Div 09, put painting as **one line item only**: "Painting – all areas", Net qty = the **total paint area in SF** (linked to the Paint tab total), Unit = SF.
2. Add a sheet named **Paint** with **one row per room**, columns: **Room no. | Room name | Perimeter LF | Wall height | Wall SF | Openings deducted SF | Net wall SF | Ceiling / deck SF | Doors painted (EA) | Frames painted (EA) | Other SF (shelving, pipe enclosures) | Total paint SF | Paint codes | Notes | PT-1 SF | PT-2 SF | PT-3 SF | PT-4 SF**.
   - Perimeter from the room finish schedule; wall height = ceiling height from the RCP (to deck where exposed).
   - Net wall SF = perimeter × height – openings (deduct only clearly shown openings over 10 SF; state whether windows were deducted).
   - Ceiling SF only where painted (GWB ceilings; exposed deck = floor SF × 1.3 for flutes/structure).
   - Doors at 21 SF per side (42 SF per door), frames at 17 SF – or state your own factor.
   - Total paint SF = net wall + ceiling + doors + frames + other (formulas). Split the same area into the paint-code columns so they sum to the total.
   - Include every room in scope; note the paint codes from the finish schedule.
3. At the bottom: a **TOTAL** row, a **Paint totals by code** table (PT-1, PT-2 … with SF and description), and a check row (sum of codes = total).
4. **Drawing renderings:** the finish legend/paint schedule and interior elevations used.

### Plumbing (Div 22) — full piping takeoff on a "Plumbing" tab
Take off **all piping and associated accessories**, not just fixtures, from the plumbing plans, risers, details, schedules and spec sections (22 05 xx, 22 07 19, 22 11 16, 22 13 16 etc.). Sections on the tab:
1. **Fixtures & equipment** by tag with make/model (sinks, lavs, WCs, eyewash, EWC, water heaters, pumps, mixing valves).
2. **Piping by system, size and material** – CW, HW, HWR, sanitary, vent, gas, storm, condensate – measured on the plans at scale plus risers/drops to fixtures; one row per system + size + material.
3. **Fittings** – counted where practical, otherwise an allowance per 100 LF (state it).
4. **Valves & specialties** – shut-offs, isolation, balancing, check, TMVs, backflow, cleanouts, water hammer arrestors.
5. **Hangers & supports** – LF ÷ hanger spacing per spec, by size; riser clamps.
6. **Insulation** – LF by size and thickness per 22 07 19.
7. **Sleeves, firestopping, core drills, connections to existing, demo/capping, testing & disinfection, camera/water-jet scoping.**
8. A **Piping totals by system** table and the marked-up plumbing drawings (runs traced in a color per system, fixtures numbered, LF written on each run).
On Summary, Div 22 gets one line per fixture type, one per piping system (total LF), and one each for valves, fittings, hangers, insulation and accessories, linked to the Plumbing tab.

### Division 01 — General Requirements: always exactly three rows
On **Summary**, Div 01 has **only these three rows**, in this order (no other Div 01 lines):
1. **Office** – home-office / project-management costs (PM, estimating, submittals, RFIs, closeout & O&M, bonds & insurance). Qty = project duration in **MO** (from Project Info / bid form, contract start to final completion); Spec / tag = what's included and the source of the duration.
2. **Site management** – on-site supervision and site costs (superintendent, temporary protection & dust partitions, temporary facilities/toilets, dumpsters, cleaning, safety, layout). Qty = on-site duration in **WK** (start of on-site work to substantial/final completion); Spec / tag = what's included and the dates used.
3. **Allowance** – every allowance stated in the bid form / Section 01 21 00 (cash, contingency, unit-price allowances). Qty = 1 **LS** per allowance (or the stated allowance quantity); Spec / tag = the allowance description and the **dollar amount from the documents**. If the documents state no allowance (or $0), keep the row with Qty 0 and write "No allowance stated (Bid Form …)".
Put the detail behind these three rows (durations, dates, items included, allowance text) in Key Assumptions.

### BOND row — directly under "Total Division 01"
Insert a row named **BOND** immediately below the "Total Division 01 - General Requirements" row (row 19 when Div 01 has its three rows), styled like a total row:
- C = 1, D = `=C`, E = `LS`; B = "Performance & payment bond = 1.85% of overall value after mark up; no mark up on bond".
- **F (Price Each) = `=0.0185*(sum of the K (Total Value) cells of every division total row)`** – i.e. 1.85% of the overall value after mark up of all divisions. Never include the bond row itself (no circular reference) and never include the alternates block.
- G = `=D*F`; **H (Mark up %) = 0** always; I = `=G*H`; K = `=G+I`.
- The **grand total** row adds the bond row: G, I, K = sum of all division total cells **+ the BOND row**.
- This is the one priced formula the takeoff writes; it shows $0 until the estimate skill fills in prices.
- Build note: write the BOND row right after Div 01's total row while looping the divisions, then fill its F formula after all division total rows are known (they are needed for the 1.85% sum).

### Doors (Div 08) — "Doors-Hardware" tab by opening
1. List the doors **by opening**: one row per opening from the door schedule and plans, columns: **Opening no. | Room / location | No. of leaves (1 = single, 2 = pair) | Leaf size (W × H × thickness) | Door type & material | Door finish | Frame type & material | Frame finish | Fire rating | Hardware set | Glazing / lite | Electrified hardware (Y/N) | Notes**.
2. Below the openings, separate counts with formulas:
   - **Leaves** – total door leaves (sum of the leaves column), broken down by door type/material/size (e.g. "SCW 2'-9" × 7'-0" – 22 leaves").
   - **Frames** – one per opening, broken down by frame type/size (single vs pair, HM/aluminum/wood, rated or not).
   - **Hardware** – one set per opening, broken down by hardware set number; also list the hardware components per set when the spec/hardware schedule gives them (hinges/pivots, locksets/exit devices, closers, stops, flush bolts, silencers, kick plates, weatherstripping) with quantities = items per set × openings using that set.
   - Also count glazing/vision lites, transoms/sidelites and electrified hardware (cross-check with Electrical step 11).
3. On **Summary**, Div 08 gets separate lines for **door leaves**, **frames** and **hardware sets** (one line per type/set where they differ), linked to the Doors-Hardware tab – never a single "doors" line.
4. **Drawing renderings:** the door schedule crop and plan crops with each opening circled and labeled with its opening number.

### Trade tabs — one tab per trade, each with drawing renderings
Besides Summary, the workbook gets **one tab per trade**, each with its own takeoff table (**Item | Spec / tag | Basis | Net qty | Waste % | Qty incl. waste | Unit**) and the marked-up drawings it was taken from: **Walls · Flooring · ACT · Paint · Demo · Concrete-Structural · Masonry · Metals · Carpentry · Thermal-Moisture · Doors-Hardware · Specialties-Equipment · Casework-Furnishings · Fire Protection · Plumbing · HVAC · Electrical · FA-Comm-Security**. A trade with no drawings still gets its tab with a red note saying so. Summary lines link to the trade tabs.

### Drawing renderings (all trade tabs)
- Render sheets with `pdftoppm` (90–110 dpi), crop to the area taken off and mark up with PIL: areas shaded semi-transparent per type with a label; linear items traced in a bold color per type/system (CW blue, HW red, HWR orange); counted items circled and numbered; every image gets a dark header band with the sheet number and what was taken off.
- Keep crops at least ~760 px wide so the header fits; save as JPEG quality ~72, 700–1100 px wide.
- Insert with `openpyxl.drawing.image.Image`: per-room images on that room's row (set the row height to fit), other images stacked in column I with a caption cell above each.
- If a sheet has no searchable text (common on MEP sheets), say so and count visually from the rendering.

## 3. Template layout (sheet "Summary" plus the trade tabs described in section 2, each with drawing renderings; Arial 10, thin borders)
Header block:
- A1 project name (Arial 16 bold, row height 62); company logo anchored at B1 (~200x200 px) when provided; C1 the company slogan (Arial 14 bold, color 1F4E9E).
- Row 4 header: A "Item", B "Info" — bold white text on fill 1F3864, centered.
- Rows 5-11: Owner, Architect, Bid date / time, Start date, Finish date, Duration, Liquidated damages (labels bold in A, values in B). Fill from the bid documents.

Estimate table header, row 13 (height 42, bold white on 1F3864, centered):
A Item | B Spec / tag | C Net qty | D Qty incl. waste | E Unit | F Price Each | G Cost Item | H Mark up % | I Mark up Value | J (spacer, width 2) | K Total Value | L Price basis

Column widths: A 95.7, B 106.6, C 12, D 15, E 7, F 12, G 14, H 11, I 14, J 2, K 36.1, L 132.6.

Divisions, in this order, each = a bold division header row with fill D9E1F2, then item rows, then a bold "Total Division XX - Name" row:
01 General Requirements; 02 Existing Conditions; 03 Concrete; 04 Masonry (Patching & Parging); 05 Metals; 06 Wood, Plastics & Composites; 07 Thermal & Moisture Protection; 08 Openings; 09 Finishes; 0908 Wall Assemblies; 10 Specialties; 11 Equipment; 12 Furnishings (Window Shades); 13 Special Construction; 14 Conveying Equipment; 21 Fire Suppression; 22 Plumbing (Fixtures); 23 HVAC (Mechanical); 25 Integrated Automation; 26 Electrical (Lighting); 27 Communications; 28 Electronic Safety & Security; 31 Earthwork; 32 Exterior Improvements; 33 Utilities; 34 Transportation; 35 Waterway & Marine Construction.
Keep every division even if empty (header + total row with $0 / dash).

Item row formulas (row n):
- D = C*(1+waste) (or a typed value if counted)
- G = D*F
- I = G*H
- K = G+I

Division total row formulas (G, I, K): `=SUM(G{header}:INDEX(G:G,ROW()-1))` (same for I, K) — this auto-expands when rows are inserted.
Grand total row "GRAND TOTAL - ALL DIVISIONS" (bold, fill D9E1F2): G, I, K = sum of every division total cell (not a SUM over the whole column, to avoid double counting).
Currency format for F, G, I, K: `\$#,##0;"($"#,##0\);\-`; H as 0%; C/D as #,##0.

Below the grand total, add an **ALTERNATES – NOT IN BASE BID** block (shaded, one line per alternate item with its quantity, not included in the grand total). Then leave one blank row, then "KEY ASSUMPTIONS / ITEMS TO CONFIRM" (bold) followed by a numbered list: exclusions, alternates, by-owner items, missing sheets, waste factors, RFIs to send.

## 4. Build method
- Copy the template (never edit the user's original). Load with openpyxl, delete rows 14 to the end, then write the division blocks, totals, grand total and assumptions fresh, copying cell styles from the template's header/division/total rows. The logo at B1 stays because rows 1-13 are untouched. Then add the **Walls** sheet and link each Div 0908 line on Summary to its wall type's SF on Walls (e.g. `=Walls!E8`). Then add the **Flooring** sheet and link each floor type's material and labor lines on Summary to its SF on Flooring. Then add the **ACT** sheet and link each ceiling type's material and labor lines on Summary to its SF on ACT. Then add the **Paint** sheet (single Summary line), the **Plumbing** tab and the remaining trade tabs; link their Summary lines and insert the marked-up drawings on every trade tab.
- Use real Excel formulas, not hard-coded results. Recalculate (LibreOffice headless) and check for #REF!/#VALUE! before delivering.
- File name: `<Job name> - Buldee Estimate Template.xlsx`, saved in `/mnt/session/outputs/` (section 0).

## 4b. Proven working steps (from a practice run)

**A. Read the documents**
1. Copy the job files and the template into `/workspace/work/` with short names (plans.pdf, specs.pdf, add1.pdf, template.xlsx).
2. Read any project info sheet or the bid form for owner, bid date, LDs, duration, bonds; fill rows 5–11.
3. Extract text with `pdftotext -layout` for the whole set and one file per page.
4. **Map every PDF page to its sheet number** from the drawing list on the title sheet and each page's title block. MEP sheets often write numbers differently (`P2.0` vs `P.2.0`) – search both; if a page has no text, render it and read the title block.
5. In the spec book read: Bid Form (00 41 00) for **alternates and unit prices**; 01 10 00 for scope, work by owner and owner-furnished items; the table of contents. Read every **addendum** in full, list which sheets it revises or adds, and use the addendum version of those sheets.
6. Use the **room schedule** on the finish plan (room no., area, perimeter, finishes) for flooring, ceilings and paint.

**B. Look at the drawings**
7. Render with `pdftoppm -r 50` for overview and `-r 90–110` cropped into quadrants for schedules, legends and details. Read the legends (construction, RCP, electrical symbols) before counting.
8. **MEP sheets are often vector-only (no searchable text)**: count visually from the rendering and say so.
9. Scale: at R dpi, 1/4"=1'-0" = R/4 px per ft; 1/16"=1'-0" = R/16 px per ft. Measure unlabeled runs/areas from pixel coordinates and mark them "scaled ±%".
10. Where the design repeats, count one typical room carefully, check any odd room (e.g. a larger one), then multiply; list which rooms were checked.

**C. Locate rooms for renderings**
11. Get room-tag positions with `pdftotext -bbox` (points; px = pt × dpi / 72).
12. Automatic room outlines (flood fill) fail because door openings connect rooms – define each room's rectangle by eye on a 50-dpi render, keep them in a dict (page + x0,y0,x1,y1), draw them all on one test image and check before use.
13. On RCP sheets mark each room with a colored circle + label at the tag position; on plans shade the room rectangle; on MEP sheets trace runs and number counted items.

**D. Build the workbook (openpyxl)**
14. Load the template, capture the styles of rows 13, 14, 15 and 68, then delete rows 14 to the end.
15. Build the trade tabs first (hard inputs blue, formulas black; Qty incl. waste `=ROUNDUP(D*(1+E),0)`).
16. Then write Summary: Net qty `='<Tab>'!D<row>`, Qty incl. waste `='<Tab>'!F<row>` (always quote sheet names). Division totals `=SUM(G{hdr}:INDEX(G:G,ROW()-1))`; grand total = sum of division total cells; alternates block below it, excluded.
17. Recalculate (LibreOffice headless if available; keep the embedded images); confirm zero errors and check the image count with `unzip -l file.xlsx | grep -c media`.
18. Read back with `data_only=True` and check: floor-type SF = scheduled room SF; ceiling SF by type = room SF; paint codes sum to the paint total; Summary lines equal their tab values.

**E. Key Assumptions must include** scope (rooms in/out), addenda applied, scaled quantities and their accuracy, typical-room assumptions, items not quantified on drawings (carried LS), the electrical count summary, plumbing assumptions (sizes/insulation not legible), waste factors, and the RFI list (sheet conflicts, missing legends, missing trade drawings).

## 5. Check and deliver
- Spot-check the 5 largest quantities against the drawings; check that each wall type's SF on Summary matches the Walls tab, each floor type's SF matches the Flooring tab, each ceiling type's SF matches the ACT tab, the painting line matches the Paint tab, every trade tab's totals match its Summary lines and every trade tab has its drawings; and that the total formulas reference the right rows.
- Send the file, then give a short reply: which divisions have work, the number of line items, SF per wall type, SF per floor type, SF per ceiling type, the electrical count summary, and the top items to confirm. Don't recap every line.