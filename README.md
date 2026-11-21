# familienplaner
Ein App für Familienkalendar, Termine und Erinnerungen

Für die optionale Einrichtung von Familienkonten und Supabase Free siehe
[SUPABASE_SETUP.md](./SUPABASE_SETUP.md). Bestehende Planerdaten bleiben lokal,
bis ihre Synchronisierung separat implementiert und getestet wurde.

Unter „Einstellungen → Ferien & Feiertage“ lassen sich Deutschland mit
Bundesland sowie Kroatien auswählen. Die Ferien- und Feiertagsdaten werden
direkt und ohne personenbezogene Angaben von der OpenHolidays API geladen und
lokal zwischengespeichert. Kroatien wird vom API derzeit ohne regionale
Unterteilung angeboten; noch nicht veröffentlichte Schulferiendaten werden
nicht ergänzt oder geschätzt. Erinnerungen erscheinen nur bei geöffneter
Anwendung; Push-Mitteilungen bei geschlossener Anwendung sind nicht eingerichtet.

## Einkaufsliste

Die Einkaufsliste wird lokal im Browser gespeichert. Sie kann von Mitgliedern
verwendet werden, die dasselbe Browserprofil auf diesem Gerät nutzen; eine
Synchronisierung zwischen Geräten oder über Supabase ist noch nicht aktiv.
Artikel, eigene Geschäfte und Favoriten bleiben erhalten, bis sie manuell
geändert oder entfernt werden.

## Stundenplan

Der Stundenplan, Hausaufgaben, Klassenarbeiten, Schulpflichten und einmalige
Planänderungen werden je Kinderprofil im lokalen Browser gespeichert. Eltern-
und Kinderansichten richten sich nach dem ausgewählten Profil; diese lokale
Auswahl ist keine Anmeldung und keine sichere Zugriffskontrolle. Eine
Supabase-Synchronisierung, geräteübergreifende Freigabe und Push-Mitteilungen
sind nicht aktiv. Für Schulferien und gesetzliche Feiertage wird ausschließlich
die pro Kind eingestellte Schulregion bei OpenHolidays abgefragt.
