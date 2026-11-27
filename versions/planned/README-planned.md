# Planned site: how to update it

Everything you'll change lives in the data block at the top of `script.js`.

## Flip a project to Built
Find the project in `PROJECTS` and change `status: 'progress'` to `status: 'built'`.

## Swap a target number for a measured one
Each bullet or stat with `target: true` shows a yellow "Target" label, and stats not measured yet show "—".
Put the real number in `v`, delete `target: true`, and keep `how` saying how you measured it
(for example `how: 'Logic analyzer · 20 tries'`).

## Add a photo
The website shows one photo per project (the one your roadmap marks for the website); the label says which shot it is.
Each project has a `photos` list. Every entry is one picture slot with a label saying what goes there
(for example `{ src: null, label: 'hsync on the scope' }`). The first one is the main picture; the rest show as thumbnails.
1. Put the image in `img/` (for example `img/vga-patterns.jpg`, roughly 16:10).
2. Set `src: 'img/vga-patterns.jpg'` on that slot. The "Photo coming soon" box is replaced automatically.
3. Add or remove slots freely. Use `light: true` for renders on a white background so they get framed.

## Add the code link or a demo video
Set `repo: 'https://github.com/kabirvirk1206/...'` (and optionally `video: '...'`) on the project.

## Link a focus version
Projects are grouped by area: FPGA, Embedded, PCB, Software. That is the default order.
Send `kabirvirk.me/?focus=embedded` or `?focus=pcb` to put that area on top for those applications.
The focus changes the area order, the experience order and which resume the Resume buttons download.
To add a project, give it `area: 'pcb' | 'embedded' | 'fpga' | 'software'`; it appears in that group.

## Resumes
Put the PDFs in `resumes/` with these names:
fpgal_V3.pdf, pcb_designl_V3.pdf, embeddedl_V3.pdf (main) and
fpgab_V3.pdf, pcb_designb_V3.pdf, embeddedb_V3.pdf (summary versions).

## Experience
`EXPERIENCE` holds the 2 co-ops (`group: 'coop'`) and the 3 design-team entries (`group: 'team'`).
`EXPERIENCE_ORDER` sets the order on the page. WARG Electrical carries the LDO board and its photo.
