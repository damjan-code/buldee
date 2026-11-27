---
name: "estimate"
description: "Price a Daskal LLC takeoff: fill unit prices, markup and price basis in the Estimating Template from past Daskal bids, and produce the bid estimate."
---

# Estimate (Daskal pricing)

Use when the user asks to price, estimate, or put numbers on a Daskal takeoff, or asks "what's our bid" for a project. This skill starts where the **daskal-takeoff** skill ends: the takeoff has quantities, and this skill adds prices.

The deliverable is an .xlsx file in the same **Estimating Template** layout as the takeoff (load the xlsx skill before building).

## 0. Running on Buldee (read first; this overrides any later step about Dropbox, the user's computer, asking questions or where to save)
You run unattended on the Buldee website: nobody can answer questions during the run. Never stop to ask (no AskUserQuestion). Make the most reasonable assumption, write it under Key Assumptions, and keep going. Skip "pick the project": the files were already uploaded.
- **Job files:** everything under `/mnt/session/uploads/job/`. List them all with sizes.
- **Takeoff:** if the uploads include a takeoff (.xlsx on the Estimating / Buldee Estimate Template layout), price that one. If not, run the **daskal-takeoff** skill on the uploaded drawings, specs and addenda first (all of it, including the project information block), then price the result. Don't price from drawings without a takeoff.
- **Markup %:** given in the kickoff message. Use it; never ask.
- **Template:** the takeoff is already on the Buldee Estimate Template (`assets/Buldee Estimate Template.xlsx` in the daskal-takeoff skill). Wherever this skill says Estimating Template, use it.
- **Company letterhead (optional):** `/mnt/session/uploads/company/company.json` and `logo.png`, used as the daskal-takeoff skill's section 0 describes.
- **Output:** save exactly one file in `/mnt/session/outputs/`, named exactly as the kickoff message says (`<Job name> - Buldee Estimate Template.xlsx`). It is the priced estimate. Save nothing else there.
- **Pricing sources on Buldee:** Daskal's past bids, the SUBs list and the Vendors Masterlist are not available here and must never be guessed at or quoted. Use, in order: (1) sub and supplier quotes among the uploaded files, (2) past bids or estimates the user uploaded, (3) current market prices for the project's region (web search), each marked as a market estimate in column L. Read "past Daskal bid" in the steps below as "past bid the user uploaded". Where the steps say to name subs from the SUBs list, name the trade that still needs a quote instead.
- **Tools:** use Python (`pip install openpyxl pymupdf pillow python-docx`). Recalculate with LibreOffice if available; if not, verify every formula by reading the cells back with openpyxl.

## 1. Collect pricing sources
- Past Daskal bids: estimate/takeoff files in other projects' `7. Estimating` folders, plus `00. Low Bids` and `0. Archive Bids`. Prefer recent bids (last 2 years), similar building type (schools, libraries, municipal), and NJ.
- Sub and supplier quotes saved in the project folder, if any. A real quote for this project beats any past-bid price.
- `SUBs list.xlsx` and the latest `VENDORS MASTERLIST` to see who to get quotes from for each trade.

## 2. Price each line
- Fill **Price Each (F)** for every takeoff line. Keep the takeoff quantities exactly as they are; if a quantity looks wrong, flag it under Key Assumptions instead of changing it.
- Fill **Price basis (L)** with where the price came from, e.g. "Randolph HS 11-2026 – $4.25/SF installed", "ABC Flooring quote 11/20/26", "Market est. – confirm with sub".
- Order of preference: quote for this job > past Daskal bid > current NJ market price (search the web). Mark every market price as an estimate.
- Make clear whether a unit price is installed (material + labor) or material only.
- **Mark up % (H):** use the markup % the user gave on every line.
- **Plumbing (Div 22):** price as material for fixtures + material for piping & accessories, then double the whole material total for the plumbing line (labor = material). No separate overhead & profit: Mark up % = 0 on plumbing lines.
- Never invent a price source. If nothing reliable exists, use a market estimate and say so in column L.

## 3. Formulas and layout
Same template as the takeoff (sheet "Summary"):
A Item | B Spec / tag | C Net qty | D Qty incl. waste | E Unit | F Price Each | G Cost Item | H Mark up % | I Mark up Value | J spacer | K Total Value | L Price basis (past Daskal bids)
- G = D*F, I = G*H, K = G+I (real Excel formulas).
- Division totals: `=SUM(G{header}:INDEX(G:G,ROW()-1))` for G, I, K.
- Grand total = sum of the division total cells.
- Currency `\$#,##0;"($"#,##0\);\-` for F, G, I, K; H as 0%.
- Under "KEY ASSUMPTIONS / ITEMS TO CONFIRM", add: prices that are market estimates, trades that still need sub quotes (with names from the SUBs list), exclusions and alternates.

## 4. Build and save
- Copy the takeoff file (never edit the original) and fill in columns F, H, L. Recalculate (LibreOffice headless) and check for #REF!/#VALUE!.
- File name: `<Project Name> - Estimate.xlsx`. Save it in the project's `7. Estimating` folder (device_commit_files) and send it in the chat. Never overwrite an existing file; add a version number instead.

## 5. Check and deliver
- Compare the cost per SF (grand total ÷ building/renovated area) with similar past Daskal bids and flag big differences.
- Check that every line has a price and a price basis.
- Reply briefly: grand total, the 3-5 biggest divisions, and the prices that most need a sub quote. Don't recap every line.