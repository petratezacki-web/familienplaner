(function () {
  const speicherSchluessel = "familienSprachEinstellungenV1";
  const sprachen = {
    de: "de-DE",
    hr: "hr-HR",
    en: "en-GB"
  };
  const katalog = {
    "1 Tag vorher": ["1 dan ranije", "1 day before"],
    "14 Tage vorher": ["14 dana ranije", "14 days before"],
    "2 Tage vorher": ["2 dana ranije", "2 days before"],
    "2 Tage vor Schulbeginn an das Ferienende erinnern": [
      "Podsjeti 2 dana prije početka škole, na kraju praznika",
      "Remind me 2 days before school starts"
    ],
    "3 Tage vorher": ["3 dana ranije", "3 days before"],
    "7 Tage vorher": ["7 dana ranije", "7 days before"],
    "Abbrechen": ["Odustani", "Cancel"],
    "Abmelden": ["Odjava", "Sign out"],
    "Abmelden fehlgeschlagen": ["Odjava nije uspjela", "Sign-out failed"],
    "Änderungen speichern": ["Spremi promjene", "Save changes"],
    "Am selben Tag": ["Istog dana", "On the same day"],
    "Alles Wichtige an einem Ort": [
      "Sve važno na jednom mjestu",
      "Everything important in one place"
    ],
    "Alle Termine": ["Svi termini", "All events"],
    "Anmelden": ["Prijava", "Sign in"],
    "Anmeldung ist fehlgeschlagen:": [
      "Prijava nije uspjela:",
      "Sign-in failed:"
    ],
    "App-Sprache": ["Jezik aplikacije", "App language"],
    "Auf diesem Gerät kann die Sprache nicht gespeichert werden.": [
      "Jezik nije moguće spremiti na ovom uređaju.",
      "The language could not be saved on this device."
    ],
    "Baden-Württemberg": ["Baden-Württemberg", "Baden-Württemberg"],
    "Bald Geburtstag": ["Uskoro rođendan", "Upcoming birthday"],
    "🎂 Bald Geburtstag": ["🎂 Uskoro rođendan", "🎂 Upcoming birthday"],
    "🎉 Heute Geburtstag": ["🎉 Danas je rođendan", "🎉 Birthday today"],
    "Bayern": ["Bavarska", "Bavaria"],
    "Deutschland": ["Njemačka", "Germany"],
    "Bezeichnung": ["Naziv", "Name"],
    "Bildausschnitt anpassen": ["Prilagodi fotografiju", "Adjust photo"],
    "Berlin": ["Berlin", "Berlin"],
    "Benachrichtigungen & Töne": ["Obavijesti i zvukovi", "Notifications & sounds"],
    "Bis": ["Do", "To"],
    "Brandenburg": ["Brandenburg", "Brandenburg"],
    "Bremen": ["Bremen", "Bremen"],
    "Brückentag-Vorschlag": ["Prijedlog spojenog vikenda", "Bridge-day suggestion"],
    "Brückentag-Vorschläge": ["Prijedlozi spojenih vikenda", "Bridge-day suggestions"],
    "Bundesland in Deutschland": ["Savezna pokrajina u Njemačkoj", "German state"],
    "Code kopieren": ["Kopiraj kod", "Copy code"],
    "Daten jetzt aktualisieren": ["Ažuriraj podatke", "Update data now"],
    "Datenquelle:": ["Izvor podataka:", "Data source:"],
    "Datum": ["Datum", "Date"],
    "Dein Name in der Familie": ["Tvoje ime u obitelji", "Your name in the family"],
    "Diese Grundstufe verbindet Konten und Familienmitgliedschaften. Termine, Geburtstage, Fotos und andere Planerdaten bleiben vorerst lokal und werden noch nicht synchronisiert.": [
      "Ova početna verzija povezuje račune i članstva u obitelji. Termini, rođendani, fotografije i ostali podaci zasad ostaju lokalno i još se ne sinkroniziraju.",
      "This initial version connects accounts and family memberships. Events, birthdays, photos, and other planner data remain local and are not synced yet."
    ],
    "Diese Woche ♡": ["Ovaj tjedan ♡", "This week ♡"],
    "Die Geburtstage werden nur in diesem Browser gespeichert. Gemeinsame Synchronisierung und Push-Erinnerungen benötigen einen Serverdienst und sind noch nicht eingerichtet.": [
      "Rođendani se spremaju samo u ovom pregledniku. Zajednička sinkronizacija i push podsjetnici zahtijevaju poslužiteljsku uslugu koja još nije postavljena.",
      "Birthdays are stored only in this browser. Shared syncing and push reminders require a server service, which is not set up yet."
    ],
    "Diese Woche sind keine offenen Termine geplant.": [
      "Ovaj tjedan nema otvorenih termina.",
      "No upcoming events are planned this week."
    ],
    "Di": ["Uto", "Tue"],
    "Do": ["Čet", "Thu"],
    "E-Mail": ["E-pošta", "Email"],
    "E-Mail des eingeladenen Kontos": ["E-pošta pozvanog računa", "Email of the invited account"],
    "Einkaufsliste": ["Popis za kupnju", "Shopping list"],
    "Filter": ["Filtar", "Filter"],
    "Unsere Einkaufsliste": [
      "Naš popis za kupnju ♡",
      "Our shopping list ♡"
    ],
    "Gemeinsam einkaufen, nichts vergessen.": [
      "Kupujmo zajedno i ne zaboravimo ništa.",
      "Shop together and don't forget a thing."
    ],
    "Artikel hinzufügen": ["Dodaj namirnicu", "Add item"],
    "Artikel bearbeiten": ["Uredi namirnicu", "Edit item"],
    "Artikelname": ["Naziv namirnice", "Item name"],
    "Menge (optional)": ["Količina (nije obavezno)", "Quantity (optional)"],
    "Einheit": ["Jedinica mjere", "Unit"],
    "Keine Einheit": ["Bez jedinice", "No unit"],
    "Liter": ["Litra", "Liter"],
    "Stück": ["Komad", "Piece"],
    "Packung": ["Pakiranje", "Pack"],
    "Geschäft": ["Trgovina", "Store"],
    "Ohne Geschäft": ["Bez trgovine", "No store"],
    "Notiz (optional)": ["Bilješka (nije obavezno)", "Note (optional)"],
    "Einkaufsdatum (optional)": [
      "Datum kupnje (nije obavezno)",
      "Shopping date (optional)"
    ],
    "{{done}} von {{total}} Artikeln erledigt": [
      "Dovršeno {{done}} od {{total}} namirnica",
      "{{done}} of {{total}} items completed"
    ],
    "{{count}} offen": ["{{count}} preostalih", "{{count}} open"],
    "Gekaufte Artikel entfernen": [
      "Ukloni kupljene namirnice",
      "Remove purchased items"
    ],
    "Favoriten": ["Favoriti", "Favorites"],
    "Artikel speichern": ["Spremi namirnicu", "Save item"],
    "Geschäfte verwalten": ["Upravljaj trgovinama", "Manage stores"],
    "Eigenes Geschäft hinzufügen": [
      "Dodaj vlastitu trgovinu",
      "Add a custom store"
    ],
    "Geschäft hinzufügen": ["Dodaj trgovinu", "Add store"],
    "Geschäftsname": ["Naziv trgovine", "Store name"],
    "Entfernen": ["Ukloni", "Remove"],
    "Alle Artikel": ["Sve namirnice", "All items"],
    "Heute einkaufen": ["Kupiti danas", "Shop today"],
    "Noch offen": ["Još nije kupljeno", "Still needed"],
    "Bereits gekauft": ["Već kupljeno", "Already purchased"],
    "Als gekauft markieren": ["Označi kao kupljeno", "Mark as purchased"],
    "Gekauft": ["Kupljeno", "Purchased"],
    "Kaufmarkierung aufgehoben.": [
      "Oznaka kupljenog proizvoda je poništena.",
      "Purchased mark removed."
    ],
    "Artikel als gekauft markiert.": [
      "Namirnica je označena kao kupljena.",
      "Item marked as purchased."
    ],
    "Zu Favoriten hinzufügen": ["Dodaj u favorite", "Add to favorites"],
    "Aus Favoriten entfernen": ["Ukloni iz favorita", "Remove from favorites"],
    "Favorit erneut hinzufügen": [
      "Ponovno dodaj omiljenu namirnicu",
      "Add favorite again"
    ],
    "Geschäft ändern": ["Promijeni trgovinu", "Change store"],
    "Artikel löschen": ["Obriši namirnicu", "Delete item"],
    "Notiz:": ["Bilješka:", "Note:"],
    "Einkaufen am": ["Kupiti do", "Buy by"],
    "Hinzugefügt von": ["Dodao/la", "Added by"],
    "Keine Artikel für diesen Filter.": [
      "Nema namirnica za ovaj filtar.",
      "No items match this filter."
    ],
    "Keine Artikel in diesem Geschäft.": [
      "U ovoj trgovini nema namirnica.",
      "No items in this store."
    ],
    "Noch keine eigenen Geschäfte.": [
      "Još nema vlastitih trgovina.",
      "No custom stores yet."
    ],
    "Bitte einen Artikelnamen eingeben.": [
      "Unesi naziv namirnice.",
      "Enter an item name."
    ],
    "Bitte einen Geschäftsnamen eingeben.": [
      "Unesi naziv trgovine.",
      "Enter a store name."
    ],
    "Bitte ein Geschäft auswählen.": [
      "Odaberi trgovinu.",
      "Select a store."
    ],
    "Die Menge muss größer als Null sein.": [
      "Količina mora biti veća od nule.",
      "Quantity must be greater than zero."
    ],
    "Dieses Geschäft gibt es bereits.": [
      "Ta trgovina već postoji.",
      "That store already exists."
    ],
    "Diesen Artikel gibt es in diesem Geschäft bereits. Menge erhöhen?": [
      "Ta namirnica već postoji u ovoj trgovini. Povećati količinu?",
      "This item is already in this store. Increase the quantity?"
    ],
    "Die Einheiten unterscheiden sich. Der Artikel wird separat geführt.": [
      "Mjerne jedinice se razlikuju pa će namirnice biti navedene zasebno.",
      "The units differ, so the items will remain separate."
    ],
    "Geschäft wirklich entfernen? Zugeordnete Artikel werden zu „Ohne Geschäft“ verschoben.": [
      "Zaista ukloniti trgovinu? Pridružene namirnice premjestit će se u kategoriju „Bez trgovine“.",
      "Remove this store? Its items will be moved to “No store”."
    ],
    "Diesen Artikel wirklich löschen?": [
      "Zaista obrisati ovu namirnicu?",
      "Delete this item?"
    ],
    "Alle gekauften Artikel entfernen?": [
      "Ukloniti sve kupljene namirnice?",
      "Remove all purchased items?"
    ],
    "Artikel hinzugefügt.": ["Namirnica je dodana.", "Item added."],
    "Artikel aktualisiert.": ["Namirnica je ažurirana.", "Item updated."],
    "Artikel gelöscht.": ["Namirnica je obrisana.", "Item deleted."],
    "Menge erhöht.": ["Količina je povećana.", "Quantity increased."],
    "Artikel verschoben.": ["Namirnica je premještena.", "Item moved."],
    "Geschäft hinzugefügt.": ["Trgovina je dodana.", "Store added."],
    "Geschäft gespeichert.": ["Trgovina je spremljena.", "Store saved."],
    "Geschäft entfernt.": ["Trgovina je uklonjena.", "Store removed."],
    "Aus Favoriten entfernt.": [
      "Namirnica je uklonjena iz favorita.",
      "Item removed from favorites."
    ],
    "Zu Favoriten hinzugefügt.": [
      "Namirnica je dodana u favorite.",
      "Item added to favorites."
    ],
    "Favorit erneut hinzugefügt.": [
      "Omiljena namirnica ponovno je dodana.",
      "Favorite added to the list again."
    ],
    "Gekaufte Artikel entfernt.": [
      "Kupljene namirnice su uklonjene.",
      "Purchased items removed."
    ],
    "Die Einkaufsliste konnte nicht geladen werden.": [
      "Popis za kupnju nije moguće učitati.",
      "The shopping list could not be loaded."
    ],
    "Die Einkaufsliste konnte nicht gespeichert werden.": [
      "Popis za kupnju nije moguće spremiti.",
      "The shopping list could not be saved."
    ],
    "Der Artikel konnte nicht gefunden werden.": [
      "Namirnica nije pronađena.",
      "The item could not be found."
    ],
    "Einladung annehmen": ["Prihvati pozivnicu", "Accept invitation"],
    "Einladungscode": ["Kod pozivnice", "Invitation code"],
    "Einladungscode erstellen": ["Izradi kod pozivnice", "Create invitation code"],
    "Einladungscode erstellt. Teile ihn nur sicher mit der eingeladenen Person.": [
      "Kod pozivnice je izrađen. Podijeli ga s pozvanom osobom na siguran način.",
      "Invitation code created. Share it securely with the invited person."
    ],
    "Einladungscode wurde kopiert.": ["Kod pozivnice je kopiran.", "Invitation code copied."],
    "Einmaliger Einladungscode (7 Tage gültig)": [
      "Jednokratni kod pozivnice (vrijedi 7 dana)",
      "One-time invitation code (valid for 7 days)"
    ],
    "Einstellungen": ["Postavke", "Settings"],
    "Einstellungen für": ["Postavke za", "Settings for"],
    "Einstellungen konnten nicht gespeichert werden.": [
      "Postavke nije moguće spremiti.",
      "Settings could not be saved."
    ],
    "Einstellungen auf diesem Gerät gespeichert.": [
      "Postavke su spremljene na ovom uređaju.",
      "Settings saved on this device."
    ],
    "Einstellungen werden auf diesem Gerät gespeichert. Die Klangvorschau funktioniert bei geöffneter Seite. Erinnerungen für Ferien und Feiertage verwenden den ausgewählten Ton und berücksichtigen Vibration sowie Ruhezeiten. Termin-Erinnerungen erscheinen, solange die App geöffnet ist. Push-Mitteilungen bei geschlossener App benötigen später einen Serverdienst.": [
      "Postavke se spremaju na ovom uređaju. Pregled zvuka radi dok je stranica otvorena. Podsjetnici za praznike i blagdane koriste odabrani zvuk te poštuju vibraciju i vrijeme tišine. Podsjetnici za termine prikazuju se dok je aplikacija otvorena. Push obavijesti kada je aplikacija zatvorena zahtijevaju poslužiteljsku uslugu.",
      "Settings are saved on this device. Sound previews work while the page is open. Holiday reminders use the selected sound and respect vibration and quiet hours. Appointment reminders appear while the app is open. Push notifications when it is closed will require a server service."
    ],
    "Erinnern:": ["Podsjeti:", "Remind:"],
    "Erinnerung": ["Podsjetnik", "Reminder"],
    "Erinnerung schließen": ["Zatvori podsjetnik", "Dismiss reminder"],
    "Erinnerungen": ["Podsjetnici", "Reminders"],
    "Erinnerungen für Ferien und Feiertage aktivieren": [
      "Uključi podsjetnike za praznike i blagdane",
      "Enable holiday reminders"
    ],
    "Termin-Erinnerungen erscheinen, solange die App geöffnet ist. Push-Mitteilungen bei geschlossener App benötigen später einen Serverdienst.": [
      "Podsjetnici za termine prikazuju se dok je aplikacija otvorena. Push obavijesti kada je aplikacija zatvorena zahtijevaju poslužiteljsku uslugu.",
      "Appointment reminders appear while the app is open. Push notifications when it is closed will require a server service."
    ],
    "Familie": ["Obitelj", "Family"],
    "Familie erstellen": ["Izradi obitelj", "Create family"],
    "Familie erstellt. Du bist als Administrator eingetragen.": [
      "Obitelj je izrađena. Dodijeljena ti je uloga administratora.",
      "Family created. You are an administrator."
    ],
    "Familien-Notizen": ["Obiteljske bilješke", "Family notes"],
    "Familienkonto": ["Obiteljski račun", "Family account"],
    "Familienkonto & Verbindung": ["Obiteljski račun i povezivanje", "Family account & connection"],
    "Familienmitglied hinzufügen": ["Dodaj člana obitelji", "Add family member"],
    "Familienname": ["Prezime obitelji", "Family name"],
    "Familienrolle": ["Uloga u obitelji", "Family role"],
    "Familienbereiche": ["Obiteljske cjeline", "Family spaces"],
    "Feiertage und Schulferien werden ohne personenbezogene Daten direkt von OpenHolidays geladen. Die zuletzt geladenen Daten bleiben offline verfügbar.": [
      "Blagdani i školski praznici preuzimaju se izravno s OpenHolidaysa, bez osobnih podataka. Posljednji preuzeti podaci dostupni su i izvan mreže.",
      "Holidays and school breaks are loaded directly from OpenHolidays without personal data. The most recently downloaded data remain available offline."
    ],
    "Ferien & Feiertage": ["Praznici i blagdani", "School breaks & holidays"],
    "Ferieninformationen werden aktualisiert …": [
      "Podaci o praznicima i blagdanima se ažuriraju …",
      "Holiday information is being updated …"
    ],
    "Ferieninformationen werden geladen …": [
      "Podaci o praznicima i blagdanima se učitavaju …",
      "Holiday information is loading …"
    ],
    "Ferieneinstellungen konnten nicht gespeichert werden.": [
      "Postavke praznika i blagdana nije moguće spremiti.",
      "Holiday settings could not be saved."
    ],
    "Offline: Es werden die zuletzt gespeicherten Daten angezeigt.": [
      "Izvan mreže: prikazuju se posljednji spremljeni podaci.",
      "Offline: showing the most recently saved data."
    ],
    "OpenHolidays ist momentan nicht erreichbar. Vorhandene gespeicherte Daten wurden beibehalten.": [
      "OpenHolidays trenutačno nije dostupan. Postojeći spremljeni podaci su sačuvani.",
      "OpenHolidays is currently unavailable. Existing saved data have been preserved."
    ],
    "OpenHolidays lieferte leere Daten; zuletzt gespeicherte Einträge wurden beibehalten.": [
      "OpenHolidays nije vratio podatke; posljednji spremljeni unosi su sačuvani.",
      "OpenHolidays returned no data; the most recently saved entries have been preserved."
    ],
    "Für mindestens einen Abruf sind noch keine gespeicherten Daten vorhanden.": [
      "Za barem jedan zahtjev još nema spremljenih podataka.",
      "No saved data are available yet for at least one request."
    ],
    "Fr": ["Pet", "Fri"],
    "Freien Tag speichern": ["Spremi slobodan dan", "Save day off"],
    "Freitag": ["petak", "Friday"],
    "Fröhliche Glocken": ["Vesela zvona", "Cheerful bells"],
    "Geburtstag": ["Rođendan", "Birthday"],
    "Geburtstag bearbeiten": ["Uredi rođendan", "Edit birthday"],
    "Geburtstag löschen": ["Izbriši rođendan", "Delete birthday"],
    "Geburtsdatum (TT.MM.JJJJ, Geburtsjahr optional)": [
      "Datum rođenja (DD.MM.GGGG, godina rođenja nije obavezna)",
      "Date of birth (DD.MM.YYYY, birth year optional)"
    ],
    "Geburtsjahr, optional": ["Godina rođenja, nije obavezna", "Birth year, optional"],
    "Geburtstage": ["Rođendani", "Birthdays"],
    "Geburtstag hinzufügen": ["Dodaj rođendan", "Add birthday"],
    "Gehört zu (optional)": ["Član obitelji (nije obavezno)", "Assigned to (optional)"],
    "Gemeinsam": ["Zajednički", "Shared"],
    "Gemeinsam planen. Gemeinsam leben.": [
      "Planiramo zajedno. Živimo zajedno.",
      "Plan together. Live together."
    ],
    "Gesamt": ["Ukupno", "Total"],
    "Geschlecht (optional)": ["Spol (nije obavezno)", "Gender (optional)"],
    "Gesetzliche Feiertage": ["Zakonski blagdani", "Public holidays"],
    "Gesetzlicher Feiertag": ["Zakonski blagdan", "Public holiday"],
    "Gesetzlicher arbeitsfreier Tag": ["Zakonski neradni dan", "Official day off"],
    "Hallo, Familie! ♡": ["Bok, obitelji! ♡", "Hello, family! ♡"],
    "Hamburg": ["Hamburg", "Hamburg"],
    "Herbstferien": ["Jesenski praznici", "Autumn break"],
    "Hessen": ["Hessen", "Hesse"],
    "Heute ist alles frei – genießt die gemeinsame Zeit!": [
      "Danas nemamo ništa na rasporedu – uživajte u zajedničkom vremenu!",
      "Nothing planned today—enjoy your time together!"
    ],
    "Hintergrundbild anpassen": ["Prilagodi pozadinsku fotografiju", "Adjust background photo"],
    "Hintergrundbild entfernen": ["Ukloni pozadinsku fotografiju", "Remove background image"],
    "Hintergrundbild ändern": ["Promijeni pozadinsku fotografiju", "Change background image"],
    "Hintergrundbild verwalten": ["Upravljanje pozadinskom fotografijom", "Manage background image"],
    "Hinzufügen": ["Dodaj", "Add"],
    "Jedes Familienmitglied hat seine eigene Farbe.": [
      "Svaki član obitelji ima svoju boju.",
      "Each family member has their own color."
    ],
    "Kalender": ["Kalendar", "Calendar"],
    "Kalenderlegende": ["Legenda kalendara", "Calendar legend"],
    "Keine Angabe": ["Nije navedeno", "Not specified"],
    "Kind": ["Dijete", "Child"],
    "Klare Doppeltöne": ["Jasni dvostruki tonovi", "Clear double tones"],
    "Kommende Geburtstage": ["Nadolazeći rođendani", "Upcoming birthdays"],
    "Konto erstellen": ["Izradi račun", "Create account"],
    "Konto erstellt und angemeldet.": ["Račun je izrađen i prijavljeni ste.", "Account created and signed in."],
    "Konto erstellt. Bitte bestätige deine E-Mail und melde dich danach an.": [
      "Račun je izrađen. Potvrdi svoju e-poštu, a zatim se prijavi.",
      "Account created. Please verify your email, then sign in."
    ],
    "Kroatien": ["Hrvatska", "Croatia"],
    "Kroatien wird landesweit unterstützt. OpenHolidays meldet derzeit keine kroatischen Unterregionen.": [
      "Hrvatska je podržana na državnoj razini. OpenHolidays trenutačno ne navodi hrvatske podregije.",
      "Croatia is supported nationwide. OpenHolidays currently lists no Croatian subdivisions."
    ],
    "Lange Wochenenden & Brückentage vorschlagen": [
      "Predloži produžene vikende i spojene dane",
      "Suggest long weekends and bridge days"
    ],
    "Lernimpuls": ["Podsjetnik za učenje", "Study reminder"],
    "Mama": ["Mama", "Mom"],
    "Meine Farbe": ["Moja boja", "My color"],
    "Mecklenburg-Vorpommern": ["Mecklenburg-Zapadno Pomorje", "Mecklenburg-Western Pomerania"],
    "Männlich": ["Muško", "Male"],
    "Mi": ["Sri", "Wed"],
    "Mit Einladung beitreten": ["Pridruži se pozivnicom", "Join with invitation"],
    "Mitglieder einladen": ["Pozovi članove", "Invite members"],
    "Mitgliedseinstellungen können auf diesem Gerät nicht gespeichert werden.": [
      "Postavke člana nije moguće spremiti na ovom uređaju.",
      "Member settings could not be saved on this device."
    ],
    "Möchtest du diesen Geburtstag wirklich löschen?": [
      "Želiš li zaista izbrisati ovaj rođendan?",
      "Are you sure you want to delete this birthday?"
    ],
    "Möchtest du diesen Termin wirklich löschen?": [
      "Želiš li zaista izbrisati ovaj termin?",
      "Are you sure you want to delete this event?"
    ],
    "Monat": ["Mjesec", "Month"],
    "Mo": ["Pon", "Mon"],
    "Nachname": ["Prezime", "Last name"],
    "Name": ["Ime", "Name"],
    "Neuer Termin": ["Novi termin", "New event"],
    "Neuer Terminname:": ["Novi naziv termina:", "New event name:"],
    "Normal": ["Uobičajeno", "Normal"],
    "Niedersachsen": ["Donja Saska", "Lower Saxony"],
    "Nordrhein-Westfalen": ["Sjeverna Rajna-Vestfalija", "North Rhine-Westphalia"],
    "Normale Termine": ["Obični termini", "Regular events"],
    "Noch keine Familienmitglieder.": ["Još nema članova obitelji.", "No family members yet."],
    "Noch keine Geburtstage eingetragen.": ["Još nema unesenih rođendana.", "No birthdays have been added yet."],
    "Open Database License (ODbL)": ["Open Database License (ODbL)", "Open Database License (ODbL)"],
    "OpenHolidays API": ["OpenHolidays API", "OpenHolidays API"],
    "OpenHolidays-Daten werden täglich geprüft. Letzte verfügbare Daten bleiben offline abrufbar.": [
      "Podaci OpenHolidaysa provjeravaju se svakodnevno. Posljednji dostupni podaci mogu se pregledavati izvan mreže.",
      "OpenHolidays data are checked daily. The latest available data remain accessible offline."
    ],
    "Papa": ["Tata", "Dad"],
    "Passwort": ["Lozinka", "Password"],
    "Persönliche Einstellungen für jedes Familienmitglied.": [
      "Osobne postavke za svakog člana obitelji.",
      "Personal settings for each family member."
    ],
    "Priorität": ["Važnost", "Priority"],
    "Dringend": ["Hitno", "Urgent"],
    "Wichtig": ["Važno", "Important"],
    "Zusätzliche Notizen": ["Dodatne bilješke", "Additional notes"],
    "Notizen oder Details (optional)": [
      "Bilješke ili pojedinosti (nije obavezno)",
      "Notes or details (optional)"
    ],
    "Uhrzeit": ["Vrijeme", "Time"],
    "Termin bearbeiten": ["Uredi termin", "Edit event"],
    "Termin nicht gefunden.": ["Termin nije pronađen.", "Event not found."],
    "Termine konnten nicht geladen werden.": [
      "Termine nije moguće učitati.",
      "Events could not be loaded."
    ],
    "Termine konnten nicht gespeichert werden.": [
      "Termine nije moguće spremiti.",
      "Events could not be saved."
    ],
    "Keine geplanten Termine.": [
      "Nema planiranih termina.",
      "No planned events."
    ],
    "Noch keine erledigten Termine.": [
      "Još nema dovršenih termina.",
      "No completed events yet."
    ],
    "Unsere geplanten Termine": [
      "Naši planirani termini",
      "Our planned events"
    ],
    "Vergangene und erledigte Termine": [
      "Prošli i dovršeni termini",
      "Past and completed events"
    ],
    "Bitte alle Felder ausfüllen!": ["Ispuni sva polja!", "Please fill in all fields!"],
    "Bitte füge zuerst unter „Unsere Familie“ ein Familienmitglied hinzu.": [
      "Najprije dodaj člana obitelji u odjeljku „Naša obitelj”.",
      "Add a family member under “Our family” first."
    ],
    "Bitte gib einen Namen ein!": ["Unesi ime!", "Please enter a name!"],
    "Bitte gib einen Namen und ein gültiges Geburtsdatum ein.": [
      "Unesi ime i valjan datum rođenja.",
      "Enter a name and a valid date of birth."
    ],
    "Bitte gib ein gültiges Geburtsjahr ein oder lass es leer.": [
      "Unesi valjanu godinu rođenja ili ostavi polje praznim.",
      "Enter a valid birth year or leave it blank."
    ],
    "Bitte gib eine Bezeichnung und ein gültiges Datum ein.": [
      "Unesi naziv i valjan datum.",
      "Enter a name and a valid date."
    ],
    "Bitte gib Familienname und deinen Namen ein.": [
      "Unesi naziv obitelji i svoje ime.",
      "Enter the family name and your name."
    ],
    "Bitte gib Einladungscode und deinen Namen ein.": [
      "Unesi kod pozivnice i svoje ime.",
      "Enter the invitation code and your name."
    ],
    "Bitte gib E-Mail und Passwort ein.": ["Unesi e-poštu i lozinku.", "Enter your email and password."],
    "Bitte gib eine gültige Projekt-URL ein.": ["Unesi valjani URL projekta.", "Enter a valid project URL."],
    "Bitte Mama, Papa oder Kind eingeben!": [
      "Unesi Mama, Tata ili Dijete!",
      "Enter Mom, Dad, or Child!"
    ],
    "Bitte wähle eine Familie und gib die E-Mail ein.": [
      "Odaberi obitelj i unesi e-poštu.",
      "Choose a family and enter the email address."
    ],
    "Publishable Key oder öffentlicher anon-Key": [
      "Javni publishable ili anon ključ",
      "Publishable key or public anon key"
    ],
    "Rheinland-Pfalz": ["Porajnje-Falačka", "Rhineland-Palatinate"],
    "Rolle (Mama, Papa, Kind):": ["Uloga (Mama, Tata, Dijete):", "Role (Mom, Dad, Child):"],
    "Ruhezeiten": ["Vrijeme tišine", "Quiet hours"],
    "Sa": ["Sub", "Sat"],
    "So": ["Ned", "Sun"],
    "Saarland": ["Saarland", "Saarland"],
    "Sachsen": ["Saska", "Saxony"],
    "Sachsen-Anhalt": ["Saska-Anhalt", "Saxony-Anhalt"],
    "Samstag": ["subota", "Saturday"],
    "Sanfter Klang": ["Nježan zvuk", "Gentle tone"],
    "Schleswig-Holstein": ["Schleswig-Holstein", "Schleswig-Holstein"],
    "Schön, dass wir zusammen sind. 🩷": [
      "Lijepo je što smo zajedno. 🩷",
      "So glad we're together. 🩷"
    ],
    "Schulferien": ["Školski praznici", "School holidays"],
    "Schulfreie Tage": ["Dani bez nastave", "School-free days"],
    "Schulfreien Tag hinzufügen": ["Dodaj dan bez nastave", "Add a school-free day"],
    "Schulfreier Tag": ["Dan bez nastave", "School-free day"],
    "Schultests & Lernen": ["Školski testovi i učenje", "School tests & study"],
    "Senden": ["Pošalji", "Send"],
    "Sie sind angemeldet.": ["Prijavljeni ste.", "You are signed in."],
    "Speichern": ["Spremi", "Save"],
    "Start": ["Početak", "Start"],
    "Stundenplan": ["Raspored sati", "Timetable"],
    "Supabase-Projekt-URL": ["URL Supabase projekta", "Supabase project URL"],
    "Termin hinzufügen": ["Dodaj termin", "Add event"],
    "Termin an diesem Tag hinzufügen": ["Dodaj termin za ovaj dan", "Add an event on this day"],
    "Termin erledigt!": ["Termin je dovršen!", "Event completed!"],
    "Termin gelöscht!": ["Termin je izbrisan!", "Event deleted!"],
    "Termin gespeichert!": ["Termin je spremljen!", "Event saved!"],
    "Thüringen": ["Tiringija", "Thuringia"],
    "Töne aktivieren": ["Uključi zvukove", "Enable sounds"],
    "Unsere Familie": ["Naša obitelj", "Our family"],
    "Unsere Termine": ["Naši termini", "Our events"],
    "✅ Verlauf": ["✅ Povijest", "✅ History"],
    "Verbindung speichern & prüfen": ["Spremi i provjeri povezivanje", "Save and check connection"],
    "Verlauf": ["Povijest", "History"],
    "Verwende nur den öffentlichen Publishable/anon-Key, niemals einen Secret- oder service_role-Key.": [
      "Koristi samo javni publishable/anon ključ, nikada tajni ni service_role ključ.",
      "Use only the public publishable/anon key, never a secret or service_role key."
    ],
    "Vibration aktivieren": ["Uključi vibraciju", "Enable vibration"],
    "Vibration hängt von Gerät und Browser ab.": [
      "Vibracija ovisi o uređaju i pregledniku.",
      "Vibration depends on the device and browser."
    ],
    "Vibration testen": ["Testiraj vibraciju", "Test vibration"],
    "Vibration wird von diesem Gerät oder Browser nicht unterstützt.": [
      "Ovaj uređaj ili preglednik ne podržava vibraciju.",
      "Vibration is not supported by this device or browser."
    ],
    "Vibration ist auf diesem Gerät derzeit nicht verfügbar.": [
      "Vibracija trenutačno nije dostupna na ovom uređaju.",
      "Vibration is currently unavailable on this device."
    ],
    "Von": ["Od", "From"],
    "Vorname": ["Ime", "First name"],
    "Vorheriger Monat": ["Prethodni mjesec", "Previous month"],
    "Weitere Feiertage": ["Ostali blagdani", "Other holidays"],
    "Weiblich": ["Žensko", "Female"],
    "Wichtige Termine": ["Važni termini", "Important events"],
    "Wähle mindestens ein Land aus, um Ferien und Feiertage zu laden.": [
      "Odaberi barem jednu državu za učitavanje praznika i blagdana.",
      "Select at least one country to load school breaks and holidays."
    ],
    "Ziehe das Foto zum Verschieben. Nutze zwei Finger zum Zoomen.": [
      "Povuci fotografiju za pomicanje. Zumiraj s dva prsta.",
      "Drag the photo to move it. Use two fingers to zoom."
    ],
    "Die Anpassung gilt für dieses Gerät und bleibt nach dem Neuladen erhalten.": [
      "Prilagodba vrijedi za ovaj uređaj i ostaje spremljena nakon ponovnog učitavanja.",
      "This adjustment applies to this device and is saved after reloading."
    ],
    "▶ Anhören": ["▶ Poslušaj", "▶ Listen"],
    "Zoom": ["Zumiranje", "Zoom"],
    "Zurück": ["Natrag", "Back"],
    "Zurücksetzen": ["Vrati početno", "Reset"],
    "Heute ist ein gesetzlicher Feiertag": ["Danas je državni blagdan", "Today is a public holiday"],
    "Heute ist schulfrei": ["Danas nema nastave", "There is no school today"],
    "Heute beginnen die ": ["Danas počinju ", " starts today"],
    "Morgen ist ein gesetzlicher Feiertag": ["Sutra je državni blagdan", "Tomorrow is a public holiday"],
    "Heute Geburtstag": ["Danas je rođendan", "Birthday today"],
    "Weitere Feiertage an diesem Tag": ["Još blagdana na ovaj dan", "More holidays on this day"],
    "Details schließen": ["Zatvori pojedinosti", "Close details"],
    "Erinnerungen schließen": ["Zatvori podsjetnike", "Close reminders"],
    "✓ Erledigt": ["✓ Gotovo", "✓ Done"],
    "✓ Erledigt!": ["✓ Dovršeno!", "✓ Completed!"],
    "✓ Speichern": ["✓ Spremi", "✓ Save"],
    "✏️ Bearbeiten": ["✏️ Uredi", "✏️ Edit"],
    "🗑️ Löschen": ["🗑️ Izbriši", "🗑️ Delete"],
    "Löschen": ["Izbriši", "Delete"],
    "Die Einstellungen konnten nicht gespeichert werden.": [
      "Postavke nije moguće spremiti.",
      "Settings could not be saved."
    ],
    "Die Klangvorschau wird von diesem Browser nicht unterstützt.": [
      "Ovaj preglednik ne podržava zvučni pregled.",
      "This browser does not support sound previews."
    ],
    "Die Klangvorschau konnte nicht gestartet werden.": [
      "Zvučni pregled nije moguće pokrenuti.",
      "The sound preview could not be started."
    ],
    "Möchtest du das gespeicherte Hintergrundbild wirklich entfernen?": [
      "Želiš li zaista ukloniti spremljenu pozadinsku fotografiju?",
      "Are you sure you want to remove the saved background image?"
    ],
    "Einstellungen konnten nicht geladen werden. Bitte prüfe den lokalen Speicher.": [
      "Postavke nije moguće učitati. Provjeri lokalnu pohranu.",
      "Settings could not be loaded. Check local storage."
    ],
    "Familienmitglieder konnten nicht geladen werden.": [
      "Članove obitelji nije moguće učitati.",
      "Family members could not be loaded."
    ],
    "Die Auswahl ordnet Einstellungen einem Mitglied zu, ist aber keine Anmeldung.": [
      "Odabir povezuje postavke s članom, ali ne predstavlja prijavu.",
      "This selection assigns settings to a member; it is not a sign-in."
    ],
    "Bitte zuerst ein Foto auswählen.": ["Najprije odaberi fotografiju.", "Select a photo first."],
    "Das Foto konnte nicht für die Vorschau geladen werden.": [
      "Fotografiju nije moguće učitati za pregled.",
      "The photo could not be loaded for preview."
    ],
    "Das Foto konnte nicht gespeichert werden. Bitte prüfe den verfügbaren Speicherplatz.": [
      "Fotografiju nije moguće spremiti. Provjeri raspoloživi prostor.",
      "The photo could not be saved. Check available storage."
    ],
    "Das Foto konnte nicht vorbereitet werden. Bitte wähle ein anderes Bild.": [
      "Fotografiju nije moguće pripremiti. Odaberi drugu sliku.",
      "The photo could not be prepared. Choose another image."
    ],
    "Die ausgewählte Bilddatei konnte nicht geöffnet werden.": [
      "Odabranu slikovnu datoteku nije moguće otvoriti.",
      "The selected image file could not be opened."
    ],
    "Die ausgewählte Bilddatei konnte nicht gelesen werden.": [
      "Odabranu slikovnu datoteku nije moguće pročitati.",
      "The selected image file could not be read."
    ],
    "Die Geburtstage konnten nicht gespeichert werden.": [
      "Rođendane nije moguće spremiti.",
      "Birthdays could not be saved."
    ],
    "Dieser Geburtstag wurde nicht gefunden.": ["Rođendan nije pronađen.", "This birthday could not be found."],
    "Dieser Termin wurde nicht gefunden.": ["Termin nije pronađen.", "This event could not be found."],
    "Die Anmeldung ist fehlgeschlagen: ": ["Prijava nije uspjela: ", "Sign-in failed: "],
    "Die Abmeldung ist fehlgeschlagen: ": ["Odjava nije uspjela: ", "Sign-out failed: "],
    "Das Konto konnte nicht erstellt werden: ": ["Račun nije moguće izraditi: ", "Could not create account: "],
    "Die Familie konnte nicht erstellt werden: ": ["Obitelj nije moguće izraditi: ", "Could not create family: "],
    "Die Einladung konnte nicht erstellt werden: ": ["Pozivnicu nije moguće izraditi: ", "Could not create invitation: "],
    "Die Einladung konnte nicht angenommen werden: ": ["Pozivnicu nije moguće prihvatiti: ", "Could not accept invitation: "],
    "Angemeldet, aber Familienzugriff fehlgeschlagen. ": ["Prijavljeni ste, ali pristup obitelji nije uspio. ", "Signed in, but family access failed. "],
    "Bitte prüfe, ob das SQL-Schema eingerichtet wurde: ": ["Provjeri je li SQL shema postavljena: ", "Check that the SQL schema has been set up: "],
    "Deine Familienmitgliedschaften wurden sicher geladen.": ["Članstva u obitelji sigurno su učitana.", "Your family memberships were loaded securely."],
    "Du bist noch keiner Familie beigetreten.": ["Još se nisi pridružio/la obitelji.", "You have not joined a family yet."],
    "Du bist der Familie beigetreten.": ["Pridružio/la si se obitelji.", "You have joined the family."],
    "Der Anmeldestatus konnte nicht geladen werden: ": ["Nije moguće učitati status prijave: ", "Could not load sign-in status: "],
    "Angemeldet als ": ["Prijavljen/a kao ", "Signed in as "],
    "Du bist angemeldet.": ["Prijavljen/a si.", "You are signed in."],
    "Du wurdest abgemeldet.": ["Odjavljen/a si.", "You have been signed out."],
    "Die Supabase-Bibliothek konnte nicht geladen werden. ": ["Supabase biblioteku nije moguće učitati. ", "The Supabase library could not be loaded. "],
    "Die Supabase-Bibliothek konnte nicht geladen werden. Bitte prüfe deine Internetverbindung.": [
      "Supabase biblioteku nije moguće učitati. Provjeri internetsku vezu.",
      "The Supabase library could not be loaded. Check your internet connection."
    ],
    "Bitte prüfe deine Internetverbindung.": ["Provjeri internetsku vezu.", "Check your internet connection."],
    "Die Supabase-Verbindung konnte nicht initialisiert werden.": ["Supabase vezu nije moguće pokrenuti.", "Could not initialize the Supabase connection."],
    "Für Supabase muss die Projekt-URL mit https:// beginnen.": ["URL Supabase projekta mora počinjati s https://.", "The Supabase project URL must start with https://."],
    "Bitte gib den öffentlichen Publishable/anon-Key ein.": ["Unesi javni publishable/anon ključ.", "Enter the public publishable/anon key."],
    "Dieser Schlüssel ist geheim. Verwende ausschließlich den Publishable-Key oder öffentlichen anon-Key.": [
      "Ovaj je ključ tajan. Koristi isključivo publishable ključ ili javni anon ključ.",
      "This key is secret. Use only a publishable key or public anon key."
    ],
    "Die Projektkonfiguration konnte nicht lokal gespeichert werden.": ["Konfiguraciju projekta nije moguće lokalno spremiti.", "Could not save project configuration locally."],
    "Projektkonfiguration gespeichert. Melde dich an, um den geschützten Datenbankzugriff zu prüfen.": [
      "Konfiguracija projekta je spremljena. Prijavi se za provjeru zaštićenog pristupa bazi.",
      "Project configuration saved. Sign in to check protected database access."
    ],
    "Automatisches Kopieren nicht möglich. Markiere den Code und kopiere ihn manuell.": [
      "Automatsko kopiranje nije moguće. Označi kod i kopiraj ga ručno.",
      "Automatic copying is unavailable. Select the code and copy it manually."
    ],
    "TT": ["DD", "DD"],
    "MM": ["MM", "MM"],
    "JJJJ": ["GGGG", "YYYY"],
    "Was steht an?": ["Što je na rasporedu?", "What is happening?"],
    "z. B. Pädagogischer Tag": ["npr. stručni dan", "e.g. staff development day"],
    "https://dein-projekt.supabase.co": ["https://tvoj-projekt.supabase.co", "https://your-project.supabase.co"],
    "Geburtstag am ": ["Rođendan ", "Birthday on "],
    "Geburtstag von ": ["Rođendan člana ", "Birthday for "],
    "Farbmarkierung für ": ["Oznaka boje za ", "Color marker for "],
    "Gemeinsamer Termin": ["Zajednički termin", "Shared event"],
    "Landesweit": ["Na državnoj razini", "Nationwide"],
    "Name:": ["Ime:", "Name:"],
    "Bitte einen Namen eingeben!": ["Unesi ime!", "Please enter a name!"],
    "Die gespeicherte Supabase-Konfiguration ist ungültig.": [
      "Spremljena Supabase konfiguracija nije valjana.",
      "The saved Supabase configuration is invalid."
    ],
    "Benachrichtigungseinstellungen konnten nicht geladen werden.": [
      "Postavke obavijesti nije moguće učitati.",
      "Notification settings could not be loaded."
    ],
    "Die Familienliste ist ungültig.": ["Popis članova obitelji nije valjan.", "The family list is invalid."],
    "Die Sprache wird auf diesem Gerät je Familienmitglied gespeichert.": [
      "Jezik se na ovom uređaju sprema zasebno za svakog člana obitelji.",
      "Language is saved separately for each family member on this device."
    ],
    "Die Feiertagssprache konnte nicht aktualisiert werden.": [
      "Nije moguće promijeniti jezik praznika i blagdana.",
      "Holiday language could not be updated."
    ],
    "Feiertag": ["Blagdan", "Holiday"],
    "Nächster Monat": ["Sljedeći mjesec", "Next month"],
    "Tag": ["Dan", "Day"],
    "Konto erstellt. Du bist als Administrator eingetragen.": [
      "Račun je izrađen. Dodijeljena ti je uloga administratora.",
      "Account created. You are registered as an administrator."
    ],
    "Die Verbindung konnte nicht gespeichert werden.": [
      "Povezivanje nije moguće spremiti.",
      "The connection could not be saved."
    ],
    "Unser Stundenplan ♡": ["Naš raspored sati ♡", "Our Timetable ♡"],
    "Schule, Aufgaben und Termine gut organisiert.": [
      "Raspored, zadaće i obveze na jednom mjestu.",
      "School, homework, and events in one place."
    ],
    "Kind auswählen": ["Odaberi dijete", "Choose a child"],
    "Die Profil-Auswahl auf diesem Gerät ist keine Anmeldung.": [
      "Odabir profila na ovom uređaju nije prijava.",
      "Choosing a profile on this device is not authentication."
    ],
    "Land der Schule": ["Država škole", "School country"],
    "Bitte auswählen": ["Odaberi", "Please select"],
    "Bundesland / Region": ["Savezna pokrajina / regija", "State / region"],
    "Schulplaner-Bereiche": ["Dijelovi školskog planera", "School planner sections"],
    "Samstag anzeigen": ["Prikaži subotu", "Show Saturday"],
    "+ Unterricht hinzufügen": ["+ Dodaj školski sat", "+ Add lesson"],
    "Unterricht hinzufügen": ["Dodaj školski sat", "Add lesson"],
    "Fach *": ["Predmet *", "Subject *"],
    "Wochentag *": ["Dan u tjednu *", "Weekday *"],
    "Stunde / Reihenfolge": ["Školski sat / redoslijed", "Lesson / order"],
    "Beginn": ["Početak", "Start"],
    "Ende": ["Završetak", "End"],
    "Raum": ["Učionica", "Room"],
    "Lehrkraft": ["Učitelj/ica", "Teacher"],
    "Fachfarbe": ["Boja predmeta", "Subject color"],
    "Notizen": ["Bilješke", "Notes"],
    "Wochentag auswählen": ["Odaberi dan u tjednu", "Choose a weekday"],
    "Einmalige Planänderung hinzufügen": [
      "Dodaj jednokratnu izmjenu rasporeda",
      "Add a one-time schedule change"
    ],
    "Änderung": ["Izmjena", "Change"],
    "Stunde fällt aus": ["Sat je otkazan", "Lesson cancelled"],
    "Fach ersetzen": ["Zamijeni predmet", "Replace subject"],
    "Zusätzliche Stunde": ["Dodatni sat", "Additional lesson"],
    "Regelmäßige Stunde": ["Redovni školski sat", "Regular lesson"],
    "Neues Fach (bei Ersatz / Zusatz)": [
      "Novi predmet (za zamjenu / dodatak)",
      "New subject (for replacement / addition)"
    ],
    "Änderung speichern": ["Spremi izmjenu", "Save change"],
    "Einmalige Planänderungen": [
      "Jednokratne izmjene rasporeda",
      "One-time schedule changes"
    ],
    "Anzeige": ["Prikaz", "View"],
    "Erledigt": ["Završeno", "Completed"],
    "Alle Aufgaben": ["Sve zadaće", "All homework"],
    "+ Hausaufgabe hinzufügen": ["+ Dodaj domaću zadaću", "+ Add homework"],
    "Hausaufgabe hinzufügen": ["Dodaj domaću zadaću", "Add homework"],
    "Fällig am": ["Rok", "Due date"],
    "Erinnerung": ["Podsjetnik", "Reminder"],
    "Beschreibung *": ["Opis *", "Description *"],
    "Keine Erinnerung": ["Bez podsjetnika", "No reminder"],
    "Tests erscheinen auch einmalig im Familienkalender.": [
      "Testovi se kao jednokratni termini prikazuju i u obiteljskom kalendaru.",
      "Tests also appear as one-time events in the family calendar."
    ],
    "+ Klassenarbeit / Test hinzufügen": [
      "+ Dodaj ispit / test",
      "+ Add exam / test"
    ],
    "Klassenarbeit / Test hinzufügen": [
      "Dodaj ispit / test",
      "Add exam / test"
    ],
    "Lernerinnerung": ["Podsjetnik za učenje", "Study reminder"],
    "Lernstoff": ["Gradivo", "Study material"],
    "+ Schulpflicht hinzufügen": [
      "+ Dodaj školsku obvezu",
      "+ Add school obligation"
    ],
    "Erinnerung am Vorabend oder am Tag der Aufgabe.": [
      "Podsjetnik večer prije ili na dan obveze.",
      "Reminder the evening before or on the due date."
    ],
    "Schulpflicht hinzufügen": ["Dodaj školsku obvezu", "Add school obligation"],
    "Aufgabe *": ["Obveza *", "Task *"],
    "z. B. Sportsachen mitbringen": [
      "npr. ponijeti sportsku opremu",
      "e.g. bring sports kit"
    ],
    "Am Vorabend": ["Večer prije", "The evening before"],
    "Lege zuerst ein Kinderprofil in „Unsere Familie“ an.": [
      "Najprije dodaj profil djeteta u odjeljku „Naša obitelj“.",
      "First add a child profile in “Our Family”."
    ],
    "Wähle ein Eltern- oder Kinderprofil über die Spracheinstellungen aus.": [
      "Odaberi roditeljski ili dječji profil u postavkama jezika.",
      "Choose a parent or child profile in language settings."
    ],
    "Dieses Kinderprofil wurde in der Familienliste nicht gefunden.": [
      "Ovaj dječji profil nije pronađen na popisu članova obitelji.",
      "This child profile was not found in the family list."
    ],
    "Kinderprofile können nur den eigenen Stundenplan öffnen.": [
      "Dječji profili mogu otvoriti samo vlastiti raspored.",
      "Child profiles can only open their own timetable."
    ],
    "Die lokalen Stundenplandaten konnten nicht gelesen werden.": [
      "Lokalne podatke rasporeda nije moguće pročitati.",
      "Local timetable data could not be read."
    ],
    "Die Änderungen konnten nicht gespeichert werden. Prüfe den freien Speicherplatz.": [
      "Izmjene nije moguće spremiti. Provjeri slobodan prostor za pohranu.",
      "Changes could not be saved. Check available storage space."
    ],
    "Wähle das Land und die Region, in der dieses Kind zur Schule geht.": [
      "Odaberi državu i regiju u kojoj ovo dijete pohađa školu.",
      "Choose the country and region where this child attends school."
    ],
    "Kein Unterricht:": ["Nema nastave:", "No classes:"],
    "Keine Stunden für diesen Tag eingetragen.": [
      "Za ovaj dan nema unesenih školskih sati.",
      "No lessons are entered for this day."
    ],
    "Keine einmaligen Planänderungen.": [
      "Nema jednokratnih izmjena rasporeda.",
      "No one-time schedule changes."
    ],
    "Keine Hausaufgaben eingetragen.": [
      "Nema unesenih domaćih zadaća.",
      "No homework has been entered."
    ],
    "Keine Klassenarbeiten oder Tests eingetragen.": [
      "Nema unesenih ispita ni testova.",
      "No exams or tests have been entered."
    ],
    "Keine Schulpflichten eingetragen.": [
      "Nema unesenih školskih obveza.",
      "No school obligations have been entered."
    ],
    "Unterricht gespeichert.": ["Školski sat je spremljen.", "Lesson saved."],
    "Möchtest du diese Unterrichtsstunde löschen?": [
      "Želiš li izbrisati ovaj školski sat?",
      "Do you want to delete this lesson?"
    ],
    "Unterricht gelöscht.": ["Školski sat je izbrisan.", "Lesson deleted."],
    "Hausaufgabe gespeichert.": ["Domaća zadaća je spremljena.", "Homework saved."],
    "Hausaufgabe gelöscht.": ["Domaća zadaća je izbrisana.", "Homework deleted."],
    "Möchtest du diese Hausaufgabe wirklich löschen?": [
      "Želiš li izbrisati ovu domaću zadaću?",
      "Do you really want to delete this homework?"
    ],
    "Test gespeichert.": ["Test je spremljen.", "Test saved."],
    "Test gelöscht.": ["Test je izbrisan.", "Test deleted."],
    "Möchtest du diesen Test wirklich löschen?": [
      "Želiš li izbrisati ovaj test?",
      "Do you really want to delete this test?"
    ],
    "Schulpflicht gespeichert.": [
      "Školska obveza je spremljena.",
      "School obligation saved."
    ],
    "Schulpflicht gelöscht.": [
      "Školska obveza je izbrisana.",
      "School obligation deleted."
    ],
    "Möchtest du diese Schulpflicht wirklich löschen?": [
      "Želiš li izbrisati ovu školsku obvezu?",
      "Do you really want to delete this school obligation?"
    ],
    "Änderung gespeichert.": ["Izmjena je spremljena.", "Change saved."],
    "Änderung gelöscht.": ["Izmjena je izbrisana.", "Change deleted."],
    "Möchtest du diese Änderung wirklich löschen?": [
      "Želiš li izbrisati ovu izmjenu?",
      "Do you really want to delete this change?"
    ],
    "Fach und Beschreibung sind erforderlich.": [
      "Predmet i opis su obavezni.",
      "Subject and description are required."
    ],
    "Bitte wähle ein gültiges Datum.": [
      "Odaberi valjan datum.",
      "Please choose a valid date."
    ],
    "Bitte wähle zuerst ein Fach aus dem Wochenplan.": [
      "Najprije odaberi predmet iz tjednog rasporeda.",
      "Choose a subject from the weekly timetable first."
    ],
    "Keine Ferien- oder Feiertagsdaten für diese Schulregion verfügbar.": [
      "Podaci o praznicima i blagdanima nisu dostupni za ovu školsku regiju.",
      "Holiday data is not available for this school region."
    ],
    "Ferien- und Feiertagsdaten konnten nicht geladen werden; verfügbare gespeicherte Daten werden verwendet.": [
      "Podatke o praznicima i blagdanima nije moguće učitati; koriste se dostupni spremljeni podaci.",
      "Holiday data could not be loaded; available cached data is being used."
    ],
    "Hausaufgabe fällig:": ["Rok domaće zadaće:", "Homework due:"],
    "Lernzeit:": ["Vrijeme za učenje:", "Study time:"],
    "Schulaufgabe:": ["Školska obveza:", "School task:"],
    "Klassenarbeit": ["Ispit", "Exam"],
    "Woche": ["Tjedan", "Week"],
    "Offene Hausaufgaben": ["Nedovršene domaće zadaće", "Outstanding homework"],
    "Schule": ["Škola", "School"],
    "Fälligkeit": ["Rok", "Due"],
    "Nur auf diesem Gerät gespeichert. Supabase-Synchronisierung und Push-Mitteilungen sind nicht eingerichtet.": [
      "Sprema se samo na ovom uređaju. Supabase sinkronizacija i push obavijesti nisu postavljene.",
      "Saved only on this device. Supabase sync and push notifications are not configured."
    ],
    "Bearbeiten": ["Uredi", "Edit"],
    "Hausaufgaben": ["Domaće zadaće", "Homework"],
    "Klassenarbeiten & Tests": ["Ispiti i testovi", "Exams & tests"],
    "Schulpflichten": ["Školske obveze", "School obligations"],
    "Datum *": ["Datum *", "Date *"],
    "Notiz": ["Bilješka", "Note"],
    "Einstellungen öffnen": ["Otvori postavke", "Open settings"],
    "Bitte wähle eine Stunde dieses Wochentags.": [
      "Odaberi školski sat za ovaj dan u tjednu.",
      "Choose a lesson for this weekday."
    ],
    "Schulregion wurde gespeichert.": [
      "Školska regija je spremljena.",
      "School region saved."
    ],
    "Unterricht bearbeiten": ["Uredi školski sat", "Edit lesson"],
    "Hausaufgabe bearbeiten": ["Uredi domaću zadaću", "Edit homework"],
    "Test bearbeiten": ["Uredi test", "Edit test"],
    "Schulpflicht bearbeiten": ["Uredi školsku obvezu", "Edit school obligation"],
    "Fach und Wochentag sind erforderlich.": [
      "Predmet i dan u tjednu su obavezni.",
      "Subject and weekday are required."
    ],
    "Fach und Datum sind erforderlich.": [
      "Predmet i datum su obavezni.",
      "Subject and date are required."
    ],
    "Aufgabe und Datum sind erforderlich.": [
      "Obveza i datum su obavezni.",
      "Task and date are required."
    ]
  };

  const dynamicPatterns = [
    [/^Geburtstag am (\d{2}\.\d{2}) hinzufügen$/, function (match, datum, lang) {
      return lang === "hr"
        ? "Dodaj rođendan " + datum
        : "Add birthday on " + datum;
    }],
    [/^Geburtstag von (.+) bearbeiten oder löschen$/, function (match, name, lang) {
      return lang === "hr"
        ? "Uredi ili izbriši rođendan člana " + name
        : "Edit or delete " + name + "'s birthday";
    }],
    [/^Möchtest du (.+) wirklich löschen\?$/, function (match, name, lang) {
      return lang === "hr"
        ? "Želiš li zaista izbrisati " + name + "?"
        : "Are you sure you want to delete " + name + "?";
    }],
    [/^Farbmarkierung für (.+)$/, function (match, name, lang) {
      return (lang === "hr" ? "Oznaka boje za " : "Color marker for ") + name;
    }],
    [/^(.+) · (Mama|Papa|Kind)$/, function (match, name, rolle, lang) {
      const rollen = {
        hr: { Mama: "Mama", Papa: "Tata", Kind: "Dijete" },
        en: { Mama: "Mom", Papa: "Dad", Kind: "Child" }
      };
      return name + " · " + (rollen[lang][rolle] || rolle);
    }],
    [/^Brückentag-Vorschlag zu (.+)$/, function (match, name, lang) {
      return (lang === "hr" ? "Prijedlog spojenog dana uz " : "Bridge-day suggestion for ") + name;
    }],
    [/^Zeitraum: (.+)$/, function (match, datum, lang) {
      return (lang === "hr" ? "Razdoblje: " : "Period: ") + datum;
    }],
    [/^Land\/Region: (.+)$/, function (match, land, lang) {
      return (lang === "hr" ? "Država/regija: " : "Country/region: ") + land;
    }],
    [/^Dauer: (\d+) Tage?$/, function (match, tage, lang) {
      return lang === "hr"
        ? "Trajanje: " + tage + (tage === "1" ? " dan" : " dana")
        : "Duration: " + tage + (tage === "1" ? " day" : " days");
    }],
    [/^Art: (Schulferien|Schulfreier Tag|Gesetzlicher Feiertag|Brückentag-Vorschlag|Weiterer Feiertag)$/, function (match, art, lang) {
      const arts = {
        hr: {
          "Schulferien": "Školski praznici",
          "Schulfreier Tag": "Dan bez nastave",
          "Gesetzlicher Feiertag": "Zakonski blagdan",
          "Brückentag-Vorschlag": "Prijedlog spojenog dana",
          "Weiterer Feiertag": "Ostali blagdan"
        },
        en: {
          "Schulferien": "School holidays",
          "Schulfreier Tag": "School-free day",
          "Gesetzlicher Feiertag": "Public holiday",
          "Brückentag-Vorschlag": "Bridge-day suggestion",
          "Weiterer Feiertag": "Other holiday"
        }
      };
      return (lang === "hr" ? "Vrsta: " : "Type: ") + arts[lang][art];
    }],
    [/^Gesetzlicher arbeitsfreier Tag: (Ja|Nein)$/, function (match, jaNein, lang) {
      return (lang === "hr" ? "Zakonski neradni dan: " : "Official day off: ") +
        (lang === "hr"
          ? (jaNein === "Ja" ? "Da" : "Ne")
          : (jaNein === "Ja" ? "Yes" : "No"));
    }],
    [/^Hinweis: Nur ein Vorschlag, kein bestätigter arbeitsfreier Tag\.$/, function (match, unused, lang) {
      return lang === "hr"
        ? "Napomena: samo prijedlog, nije potvrđen neradni dan."
        : "Note: suggestion only, not a confirmed day off.";
    }],
    [/^Langes Wochenende rund um (.+)$/, function (match, name, lang) {
      return (lang === "hr" ? "Produženi vikend oko blagdana " : "Long weekend around ") + name;
    }],
    [/^Heute ist ein gesetzlicher Feiertag: (.+)\.$/, function (match, name, lang) {
      return (lang === "hr" ? "Danas je zakonski blagdan: " : "Today is a public holiday: ") + name + ".";
    }],
    [/^Morgen ist ein gesetzlicher Feiertag: (.+)\.$/, function (match, name, lang) {
      return (lang === "hr" ? "Sutra je zakonski blagdan: " : "Tomorrow is a public holiday: ") + name + ".";
    }],
    [/^Heute ist schulfrei: (.+)\.$/, function (match, name, lang) {
      return (lang === "hr" ? "Danas nema nastave: " : "There is no school today: ") + name + ".";
    }],
    [/^Morgen ist schulfrei: (.+)\.$/, function (match, name, lang) {
      return (lang === "hr" ? "Sutra nema nastave: " : "There is no school tomorrow: ") + name + ".";
    }],
    [/^In (\d+) Tagen ist ein gesetzlicher Feiertag: (.+)\.$/, function (match, days, name, lang) {
      return (lang === "hr" ? "Zakonski blagdan " + (days === "1" ? "je za 1 dan: " : "je za " + days + " dana: ") : "Public holiday in " + days + " days: ") + name + ".";
    }],
    [/^In (\d+) Tagen ist schulfrei: (.+)\.$/, function (match, days, name, lang) {
      return (lang === "hr" ? "Nastave nema za " + days + " dana: " : "No school in " + days + " days: ") + name + ".";
    }],
    [/^Heute beginnen die (.+)\. Wir wünschen euch eine wunderschöne Ferienzeit!$/, function (match, name, lang) {
      return lang === "hr"
        ? "Danas počinju " + name + ". Želimo vam prekrasne praznike!"
        : name + " start today. Have a wonderful holiday!";
    }],
    [/^Heute beginnen die (.+)!$/, function (match, name, lang) {
      return (lang === "hr" ? "Danas počinju " : "Starting today: ") + name + "!";
    }],
    [/^In (\d+) Tag(?:en)? beginnen die (.+)!$/, function (match, days, name, lang) {
      return (lang === "hr"
        ? "Za " + days + (days === "1" ? " dan počinju " : " dana počinju ")
        : name + " begin in " + days + (days === "1" ? " day" : " days")) +
        (lang === "hr" ? name : "") + "!";
    }],
    [/^In 2 Tagen beginnt die Schule wieder\.$/, function (match, unused, lang) {
      return lang === "hr"
        ? "Škola ponovno počinje za 2 dana."
        : "School starts again in 2 days.";
    }],
    [/^Für (.+) liegen bei OpenHolidays derzeit keine Schulferiendaten für (.+) vor\.$/, function (match, land, jahre, lang) {
      return lang === "hr"
        ? "OpenHolidays trenutačno nema podatke o školskim praznicima za " + land + " za " + jahre + "."
        : "OpenHolidays currently has no school holiday data for " + land + " for " + jahre + ".";
    }],
    [/^Angemeldet als (.+)$/, function (match, email, lang) {
      return (lang === "hr" ? "Prijavljen/a kao " : "Signed in as ") + email;
    }],
    [/^Die Anmeldung ist fehlgeschlagen: (.+)$/, function (match, fehler, lang) {
      return (lang === "hr" ? "Prijava nije uspjela: " : "Sign-in failed: ") + fehler;
    }],
    [/^Die Abmeldung ist fehlgeschlagen: (.+)$/, function (match, fehler, lang) {
      return (lang === "hr" ? "Odjava nije uspjela: " : "Sign-out failed: ") + fehler;
    }],
    [/^Das Konto konnte nicht erstellt werden: (.+)$/, function (match, fehler, lang) {
      return (lang === "hr" ? "Račun nije moguće izraditi: " : "Could not create account: ") + fehler;
    }],
    [/^Die Familie konnte nicht erstellt werden: (.+)$/, function (match, fehler, lang) {
      return (lang === "hr" ? "Obitelj nije moguće izraditi: " : "Could not create family: ") + fehler;
    }],
    [/^Die Einladung konnte nicht erstellt werden: (.+)$/, function (match, fehler, lang) {
      return (lang === "hr" ? "Pozivnicu nije moguće izraditi: " : "Could not create invitation: ") + fehler;
    }],
    [/^Die Einladung konnte nicht angenommen werden: (.+)$/, function (match, fehler, lang) {
      return (lang === "hr" ? "Pozivnicu nije moguće prihvatiti: " : "Could not accept invitation: ") + fehler;
    }],
    [/^Der Anmeldestatus konnte nicht geladen werden: (.+)$/, function (match, fehler, lang) {
      return (lang === "hr" ? "Nije moguće učitati status prijave: " : "Could not load sign-in status: ") + fehler;
    }],
    [/^Angemeldet, aber Familienzugriff fehlgeschlagen\. Bitte prüfe, ob das SQL-Schema eingerichtet wurde: (.+)$/, function (match, fehler, lang) {
      return (lang === "hr"
        ? "Prijavljeni ste, ali pristup obitelji nije uspio. Provjerite je li SQL shema postavljena: "
        : "Signed in, but family access failed. Check that the SQL schema has been set up: ") + fehler;
    }],
    [/^(.+) hat heute Geburtstag(?: und wird (\d+) Jahre alt)?\.$/, function (match, name, alter, lang) {
      const zusatz = alter
        ? (lang === "hr" ? " i puni " + alter + " godina" : " and turns " + alter)
        : "";
      return lang === "hr"
        ? name + " danas slavi rođendan" + zusatz + "."
        : name + " has a birthday today" + zusatz + ".";
    }],
    [/^(.+) hat am (.+) Geburtstag(?: und wird (\d+) Jahre alt)?\.$/, function (match, name, datum, alter, lang) {
      const zusatz = alter
        ? (lang === "hr" ? " i puni " + alter + " godina" : " and turns " + alter)
        : "";
      return lang === "hr"
        ? name + " slavi rođendan " + datum + zusatz + "."
        : name + " has a birthday on " + datum + zusatz + ".";
    }],
    [/^(.+) · wird (\d+) Jahre alt$/, function (match, datum, alter, lang) {
      return datum + (lang === "hr"
        ? " · puni " + alter + " godina"
        : " · turns " + alter);
    }],
    [/^(\d+) Tage vorher$/, function (match, tage, lang) {
      return lang === "hr"
        ? tage + (tage === "1" ? " dan ranije" : " dana ranije")
        : tage + (tage === "1" ? " day before" : " days before");
    }]
  ];

  function normalisiere(text) {
    return String(text).replace(/\s+/g, " ").trim();
  }

  function urediDinamicki(text, sprache) {
    for (const [muster, formatter] of dynamicPatterns) {
      const treffer = text.match(muster);
      if (treffer) return formatter.apply(null, treffer.concat(sprache));
    }

    for (const [prefix, texte] of Object.entries(katalog)) {
      if (prefix.endsWith(": ") && text.startsWith(prefix)) {
        return texte[sprache === "hr" ? 0 : 1] + text.slice(prefix.length);
      }
    }

    const sicherheitsPraefixe = [
      ["Die Supabase-Bibliothek konnte nicht geladen werden. ", "hr", "Supabase biblioteku nije moguće učitati. "],
      ["Die Supabase-Bibliothek konnte nicht geladen werden. ", "en", "The Supabase library could not be loaded. "],
      ["Die Supabase-Verbindung konnte nicht initialisiert werden.", "hr", "Supabase vezu nije moguće pokrenuti."],
      ["Die Supabase-Verbindung konnte nicht initialisiert werden.", "en", "Could not initialize the Supabase connection."]
    ];
    for (const [prefix, lang, translated] of sicherheitsPraefixe) {
      if (sprache === lang && text.startsWith(prefix)) {
        return translated + text.slice(prefix.length);
      }
    }
    return null;
  }

  const textQuellen = new WeakMap();
  const attributQuellen = new WeakMap();
  let aktuelleSprache = "de";

  function uebersetze(text, sprache) {
    const lang = sprache || aktuelleSprache;
    if (lang === "de") return text;
    const original = normalisiere(text);
    const eintrag = katalog[original];
    if (eintrag) return eintrag[lang === "hr" ? 0 : 1];
    return urediDinamicki(original, lang) || text;
  }

  function textKnotenUebersetzen(knoten) {
    if (!textQuellen.has(knoten)) textQuellen.set(knoten, knoten.nodeValue);
    const quelle = textQuellen.get(knoten);
    const getrimmt = quelle.trim();
    if (!getrimmt) return;
    const vorne = quelle.match(/^\s*/)[0];
    const hinten = quelle.match(/\s*$/)[0];
    const ergebnis = uebersetze(getrimmt);
    const neu = vorne + ergebnis + hinten;
    if (knoten.nodeValue !== neu) knoten.nodeValue = neu;
  }

  const uebersetzbareAttribute = [
    "placeholder",
    "title",
    "aria-label",
    "alt"
  ];

  function attributUebersetzen(element, attribut) {
    if (element.closest("[data-i18n-ignore]")) return;
    if (!attributQuellen.has(element)) attributQuellen.set(element, {});
    const quellen = attributQuellen.get(element);
    if (!Object.prototype.hasOwnProperty.call(quellen, attribut)) {
      quellen[attribut] = element.getAttribute(attribut);
    }
    const quelle = quellen[attribut];
    const ergebnis = uebersetze(quelle);
    if (element.getAttribute(attribut) !== ergebnis) {
      element.setAttribute(attribut, ergebnis);
    }
  }

  function baumUebersetzen(knoten) {
    if (knoten.nodeType === Node.TEXT_NODE) {
      if (!knoten.parentElement ||
          /^(SCRIPT|STYLE|TEXTAREA)$/i.test(knoten.parentElement.tagName) ||
          knoten.parentElement.isContentEditable ||
          knoten.parentElement.closest("[data-i18n-ignore]")) return;
      textKnotenUebersetzen(knoten);
      return;
    }
    if (knoten.nodeType !== Node.ELEMENT_NODE &&
        knoten.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;

    if (knoten.nodeType === Node.ELEMENT_NODE) {
      if (knoten.closest("[data-i18n-ignore]")) return;
      uebersetzbareAttribute.forEach(function (attribut) {
        if (knoten.hasAttribute(attribut)) {
          attributUebersetzen(knoten, attribut);
        }
      });
      if (knoten instanceof HTMLInputElement &&
          ["button", "submit", "reset"].includes(knoten.type) &&
          knoten.hasAttribute("value")) {
        attributUebersetzen(knoten, "value");
      }
    }
    knoten.childNodes.forEach(baumUebersetzen);
  }

  function ladeEinstellungen() {
    try {
      const daten = JSON.parse(localStorage.getItem(speicherSchluessel) || "{}");
      return daten && !Array.isArray(daten) && typeof daten === "object"
        ? {
          device: ["de", "hr", "en"].includes(daten.device)
            ? daten.device
            : "de",
          activeMemberId: typeof daten.activeMemberId === "string"
            ? daten.activeMemberId
            : "",
          members: daten.members && typeof daten.members === "object"
            ? daten.members
            : {}
        }
        : { device: "de", activeMemberId: "", members: {} };
    } catch (fehler) {
      console.error("Language preferences could not be read.", fehler);
      return { device: "de", activeMemberId: "", members: {} };
    }
  }

  let einstellungen = ladeEinstellungen();
  const sprachauswahl = document.getElementById("spracheAuswahl");
  const mitgliedAuswahl =
    document.getElementById("einstellungenMitgliedAuswahl");
  const spracheHinweis = document.getElementById("spracheHinweis");

  function aktuelleMitgliedsSprache(id) {
    const language = id && einstellungen.members[id];
    return ["de", "hr", "en"].includes(language) ? language : "de";
  }

  function locale() {
    return sprachen[aktuelleSprache] || sprachen.de;
  }

  function wendeSpracheAn(sprache) {
    if (!Object.prototype.hasOwnProperty.call(sprachen, sprache)) sprache = "de";
    aktuelleSprache = sprache;
    document.documentElement.lang = sprache;
    sprachauswahl.value = sprache;
    baumUebersetzen(document.body);
    document.dispatchEvent(new CustomEvent("familienplaner:languagechange", {
      detail: { language: sprache, locale: locale() }
    }));

    const ferien = window.familienplanerFeiertage;
    if (ferien && typeof ferien.setLanguage === "function") {
      ferien.setLanguage(sprache).catch(function (fehler) {
        console.error("Holiday language could not be updated.", fehler);
        spracheHinweis.textContent = uebersetze(
          "Die Feiertagssprache konnte nicht aktualisiert werden.",
          sprache
        );
      });
    }
  }

  function speichereEinstellungen() {
    try {
      localStorage.setItem(speicherSchluessel, JSON.stringify(einstellungen));
      spracheHinweis.textContent = uebersetze(
        "Die Sprache wird auf diesem Gerät je Familienmitglied gespeichert."
      );
      return true;
    } catch (fehler) {
      console.error("Language preferences could not be saved.", fehler);
      spracheHinweis.textContent = uebersetze(
        "Auf diesem Gerät kann die Sprache nicht gespeichert werden."
      );
      return false;
    }
  }

  function wechselMitglied() {
    const id = mitgliedAuswahl.value;
    einstellungen.activeMemberId = id || "";
    if (id) {
      speichereEinstellungen();
      wendeSpracheAn(aktuelleMitgliedsSprache(id));
    } else {
      speichereEinstellungen();
      wendeSpracheAn(einstellungen.device);
    }
  }

  sprachauswahl.addEventListener("change", function () {
    const sprache = sprachauswahl.value;
    const id = mitgliedAuswahl.value;
    if (id) {
      einstellungen.activeMemberId = id;
      einstellungen.members[id] = sprache;
    } else {
      einstellungen.device = sprache;
    }
    speichereEinstellungen();
    wendeSpracheAn(sprache);
  });
  mitgliedAuswahl.addEventListener("change", wechselMitglied);

  document.getElementById("einstellungenButton")
    .addEventListener("click", function () {
      window.setTimeout(function () {
        const ansicht = document.getElementById("einstellungenAnsicht");
        if (ansicht.hidden) return;
        const gespeicherteId = einstellungen.activeMemberId;
        if (gespeicherteId && Array.from(mitgliedAuswahl.options).some(
          function (option) {
            return option.value === gespeicherteId;
          }
        ) && mitgliedAuswahl.value !== gespeicherteId) {
          mitgliedAuswahl.value = gespeicherteId;
          mitgliedAuswahl.dispatchEvent(new Event("change"));
        } else if (mitgliedAuswahl.value) {
          wechselMitglied();
        }
      }, 0);
    });

  const beobachter = new MutationObserver(function (aenderungen) {
    aenderungen.forEach(function (aenderung) {
      if (aenderung.type === "characterData") {
        if (aenderung.target.parentElement &&
            aenderung.target.parentElement.closest("[data-i18n-ignore]")) {
          return;
        }
        textKnotenUebersetzen(aenderung.target);
        return;
      }
      if (aenderung.type === "attributes") {
        attributUebersetzen(aenderung.target, aenderung.attributeName);
        return;
      }
      aenderung.addedNodes.forEach(baumUebersetzen);
    });
  });
  beobachter.observe(document.body, {
    attributes: true,
    attributeFilter: uebersetzbareAttribute.concat(["value"]),
    characterData: true,
    childList: true,
    subtree: true
  });

  const alertOriginal = window.alert;
  const confirmOriginal = window.confirm;
  const promptOriginal = window.prompt;
  window.alert = function (message) {
    return alertOriginal.call(window, uebersetze(String(message)));
  };
  window.confirm = function (message) {
    return confirmOriginal.call(window, uebersetze(String(message)));
  };
  window.prompt = function (message, defaultValue) {
    return promptOriginal.call(
      window,
      uebersetze(String(message)),
      defaultValue
    );
  };

  function normalizeRole(rolle) {
    const value = String(rolle || "").trim().toLocaleLowerCase();
    const rollen = {
      mama: "Mama",
      mom: "Mama",
      mother: "Mama",
      tata: "Papa",
      dad: "Papa",
      father: "Papa",
      dijete: "Kind",
      child: "Kind"
    };
    return rollen[value] || rolle;
  }

  window.familienplanerI18n = {
    t: function (text, sprache) {
      return uebersetze(String(text), sprache);
    },
    locale: locale,
    language: function () {
      return aktuelleSprache;
    },
    normalizeRole: normalizeRole
  };

  const aktiverMitgliedsSchluessel = einstellungen.activeMemberId;
  wendeSpracheAn(
    aktiverMitgliedsSchluessel
      ? aktuelleMitgliedsSprache(aktiverMitgliedsSchluessel)
      : einstellungen.device
  );
})();
