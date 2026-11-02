# Abigail & Praise — Wedding Invitation

Animated, mobile-first wedding invitation with RSVP, QR tickets and a door scanner.

- **Invitation:** wax-seal envelope intro, scroll story, countdown, schedule, maps, colours, RSVP.
- **Ticket:** guests who accept get a QR ticket they can save to their phone.
- **Scanner:** `/#/scan` is a PIN-protected page that scans tickets at the entrance.
- **Data:** RSVPs and check-ins live in a Google Sheet.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

With no backend configured the site runs in **demo mode**: RSVPs and check-ins are saved in the browser, and the
scanner PIN is `1234`. Good for trying everything out; not for the real event.

## Change the details

Everything wedding-specific is in [src/config.ts](src/config.ts): names, hosts, date, venues, colours, RSVP numbers,
music file. Replace the artwork in `public/art/` and the music in `public/audio/`.

Placeholders to replace before launch:

- The music is `public/audio/everything-is-perfect.mp3`. To change it, drop in another file and update `music` in the config.
- `public/art/*` are cropped from the printed card. Higher-resolution originals will look sharper.
- Map pins use a text search. Open each map on the site and, if a pin is off, set a more exact `mapQuery`.

## Connect the Google Sheet

1. Create a new Google Sheet (any name).
2. **Extensions → Apps Script.** Delete the starter code and paste in [apps-script/Code.gs](apps-script/Code.gs).
3. **Project Settings (gear) → Script Properties → Add property:** `SCANNER_PIN` = the PIN your door team will use.
4. **Deploy → New deployment → type: Web app.**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Authorise when asked, then copy the **Web app URL**.
6. Copy `.env.example` to `.env` and set `VITE_API_URL` to that URL. (On a host such as Netlify or Vercel, set it as
   an environment variable instead.)
7. Rebuild. The first RSVP creates an `RSVPs` tab with the columns
   `Timestamp | Ticket ID | Name | Phone | Attending | Guests | Checked In At`.

If you change `Code.gs` later, use **Deploy → Manage deployments → Edit → New version** so the same URL updates.

## Door check-in

Open `https://your-site/#/scan` on the phone at the entrance and enter the PIN.

- Green **Welcome** shows the guest's name and party size and marks them as in.
- Orange **Already checked in** shows when the ticket was first scanned.
- Red **Invalid ticket** means the code is not on the list.
- Search by name, phone or ticket ID covers guests whose QR will not scan.
- The guest list is cached on the scanner phone. If the signal drops, scans are checked against the cache and synced
  when the connection returns (the "to sync" badge shows how many are waiting). Load the scanner once with a good
  connection before the event.

## How tickets stay safe

- The QR contains only a random ticket ID, nothing personal.
- Each ticket works once; a second scan shows the original check-in time.
- Looking up a ticket needs the guest's name **and** phone, and a phone number that already RSVP'd cannot be
  overwritten under a different name.
- The scanner PIN is stored in Apps Script, never in the website code.

## Known limits

- A screenshot of a ticket can be shared, but only the first person to arrive gets in, and the party size is shown at
  the door.
- The site is open: anyone with the link can RSVP. If you need a closed list, personal invite links are the next step.
- Apps Script takes 1–2 seconds per request.
