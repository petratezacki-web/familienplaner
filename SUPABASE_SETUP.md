# Povezivanje Familienplanera sa Supabase Free

Ovaj vodič postavlja samo besplatni Supabase projekt. Ne uključuj nadogradnju,
plaćeni dodatak ni `service_role` ključ.

## 1. Napravi Supabase projekt

1. Prijavi se na [Supabase](https://supabase.com/dashboard) i odaberi **New project**.
2. Za organizaciju/projekt odaberi **Free** plan.
3. Kao regiju odaberi **Central EU (Frankfurt)**, ako je ponuđena pri izradi.
4. Postavi snažnu lozinku baze i spremi je u upravitelj lozinki. Ta se lozinka
   ne unosi u Familienplaner.
5. Nemoj odabirati plaćeni plan ili dodatni kapacitet.

Supabase Free trenutačno uključuje ograničenu pohranu, a neaktivni projekti
mogu biti pauzirani. Provjeri aktualna ograničenja na
[stranici cijena](https://supabase.com/pricing). Odabir Frankfurta određuje
primarnu regiju podataka, ali sam po sebi nije potvrda usklađenosti sa svim
propisima o privatnosti.

## 2. Postavi zaštićene tablice

1. U Supabase nadzornoj ploči otvori **SQL Editor**.
2. Stvori novi upit.
3. Otvori datoteku [`supabase-schema.sql`](./supabase-schema.sql), kopiraj cijeli
   sadržaj u SQL Editor i odaberi **Run**.
4. Provjeri da se upit završio bez pogreške prije nego što nastaviš.

Skripta postavlja obitelji, članstva, jednokratne pozivnice i buduće zajedničke
zapise. Uključuje Row Level Security (RLS), uskraćuje izravan pristup
neprijavljenim korisnicima i ograničava zapise na članove obitelji. Privatni
zapis može čitati samo član kojem pripada; zajednički zapis vide članovi iste
obitelji. RLS treba ostati uključen na svim tablicama.

## 3. Poveži aplikaciju s projektom

1. Poslužuj aplikaciju preko lokalnog web-poslužitelja za razvoj ili HTTPS
   stranice. Nemoj je pokretati dvostrukim klikom kao `file://` stranicu za
   prijavu i rad s bazom.
2. U Supabaseu pronađi **Project URL** i javni **Publishable key**
   (ili javni `anon` ključ ako projekt prikazuje stariji format).
3. U Familienplaneru otvori zupčanik **Einstellungen**.
4. U **Familienkonto & Verbindung** unesi URL i javni ključ, pa odaberi
   **Verbindung speichern & prüfen**.

Javni ključ predviđen je za preglednik, ali je siguran samo uz RLS pravila.
Aplikacija odbija ključeve `service_role` i `sb_secret_`. Nikada ih nemoj
lijepiti u aplikaciju, HTML, repozitorij ili poruke.

## 4. Postavi URL za prijavu

U Supabaseu otvori **Authentication → URL Configuration**:

1. Postavi **Site URL** na adresu na kojoj stvarno otvaraš aplikaciju.
2. Dodaj tu adresu u dopuštene **Redirect URLs**.
3. Za lokalni razvoj koristi točan lokalni URL i port svojeg web-poslužitelja.
   Za telefone će trebati HTTPS adresa aplikacije.

Supabaseov ugrađeni način slanja e-pošte može imati ograničenja. Ova početna
verzija ne postavlja plaćeni SMTP servis. Ako potvrda e-pošte ne stigne ili
ograničenje bude dosegnuto, nemoj uključivati plaćenu uslugu bez odluke.

## 5. Ograničenje besplatne potvrde e-pošte

Supabaseov zadani SMTP nije dovoljan za stvarne obiteljske račune: trenutačno
šalje samo na adrese članova Supabase organizacije, uz ograničenje od dvije
poruke na sat. Nemoj isključivati potvrdu e-pošte radi zaobilaženja tog
ograničenja jer pozivnice provjeravaju adresu računa.

Za potvrđene račune članova obitelji treba zaseban SMTP servis. Ako mora ostati
bez naknade, prvo odaberi SMTP servis čiji besplatni paket odgovara tvojim
uvjetima; on nije dio Supabase Free paketa. Ovaj projekt ne aktivira niti
konfigurira takvu uslugu. Dok se to ne riješi, prijavu možeš isprobati samo s
adresom koja je dopuštena u Supabase organizaciji, a ne treba smatrati da su
pozivnice spremne za obiteljsku upotrebu.

## 6. Napravi obitelj i pozovi članove

1. U Familienplaneru odaberi **Konto erstellen** uz svoju e-poštu i lozinku.
2. Potvrdi e-poštu ako Supabase to zatraži, zatim se prijavi.
3. Unesi obiteljski naziv i svoje ime pa odaberi **Familie erstellen**.
   Prvi račun postaje administrator te obitelji.
4. Administrator unosi e-poštu člana i stvara pozivni kod.
5. Pošalji kod privatnim kanalom. Kod vrijedi sedam dana i vezan je uz unesenu
   e-poštu.
6. Pozvani član napravi vlastiti račun s tom e-poštom, potvrdi je, prijavi se i
   prihvati pozivni kod.

Nemoj objavljivati pozivne kodove. Skripta u bazi čuva njihov sažetak, ne
izvorni kod, i ne dopušta izravan pristup tablici pozivnica.

## Što ova početna faza radi, a što još ne

- Postavlja prijavu, stvaranje obitelji i poziv članova.
- Postavlja RLS granice po obitelji te pravila za buduće privatne i zajedničke
  zapise.
- Ne prenosi postojeće stavke iz `localStorage` u oblak. Termini, rođendani,
  fotografije i ostali podaci nastavljaju raditi lokalno dok se njihove
  pojedinačne migracije i sinkronizacija ne provedu i provjere.
- Ne uključuje obavijesti, automatsko slanje e-pošte članovima ni sinkronizaciju
  postojećih podataka u stvarnom vremenu.

Za korištenje na telefonima aplikaciju će trebati objaviti na HTTPS hostingu.
Supabase pruža bazu i prijavu, ali ne poslužuje ovu statičnu HTML aplikaciju.
Hosting i sve eventualne dodatne usluge odaberi zasebno kao besplatne; ne
potvrđuj plaćenu nadogradnju.

## Službeni izvori

- [Supabase Free plan i ograničenja](https://supabase.com/pricing)
- [Dostupne regije i Frankfurt](https://supabase.com/docs/guides/platform/regions)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase zadani SMTP i njegova ograničenja](https://supabase.com/docs/guides/auth/auth-smtp)
