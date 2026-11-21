(function () {
  const configKey = "familienplanerSupabasePublicConfig";
  const urlInput = document.getElementById("supabaseProjektUrl");
  const keyInput = document.getElementById("supabasePublishableKey");
  const status = document.getElementById("supabaseVerbindungsStatus");
  const kontoBereich = document.getElementById("supabaseKontoBereich");
  const anmeldung = document.getElementById("supabaseAnmeldung");
  const angemeldet = document.getElementById("supabaseAngemeldet");
  const kontoStatus = document.getElementById("supabaseKontoStatus");
  const familienAktionen = document.getElementById("supabaseFamilienAktionen");
  const kontoMeldung = document.getElementById("supabaseKontoMeldung");
  const familienAuswahl =
    document.getElementById("supabaseFamilieFuerEinladung");
  let supabaseClient = null;
  let authAbo = null;
  let sdkLadeVorgang = null;

  function zeigeVerbindungsStatus(text, fehler) {
    if (fehler) console.error(text, fehler);
    status.textContent = text;
  }

  function zeigeKontoMeldung(text, fehler) {
    if (fehler) console.error(text, fehler);
    kontoMeldung.textContent = text;
  }

  function leseGespeicherteKonfiguration() {
    try {
      return JSON.parse(localStorage.getItem(configKey) || "null");
    } catch (fehler) {
      zeigeVerbindungsStatus(
        "Die gespeicherte Supabase-Konfiguration ist ungültig.",
        fehler
      );
      return null;
    }
  }

  function istGeheimerSchluessel(schluessel) {
    if (/^(sb_secret_|service_role)/i.test(schluessel)) return true;
    const teile = schluessel.split(".");
    if (teile.length < 2) return false;
    try {
      const payload = JSON.parse(
        atob(teile[1].replace(/-/g, "+").replace(/_/g, "/"))
      );
      return payload.role === "service_role";
    } catch (fehler) {
      return false;
    }
  }

  async function aktualisiereFamilienListe() {
    const antwort = await supabaseClient
      .from("families")
      .select("id, name")
      .order("created_at", { ascending: true });

    if (antwort.error) {
      zeigeKontoMeldung(
        "Angemeldet, aber Familienzugriff fehlgeschlagen. " +
        "Bitte prüfe, ob das SQL-Schema eingerichtet wurde: " +
        antwort.error.message,
        antwort.error
      );
      familienAuswahl.replaceChildren();
      return;
    }

    familienAuswahl.replaceChildren();
    antwort.data.forEach(function (familie) {
      const option = document.createElement("option");
      option.value = familie.id;
      option.textContent = familie.name;
      familienAuswahl.appendChild(option);
    });
    zeigeKontoMeldung(
      antwort.data.length
        ? "Deine Familienmitgliedschaften wurden sicher geladen."
        : "Du bist noch keiner Familie beigetreten."
    );
  }

  async function aktualisiereKonto() {
    if (!supabaseClient) return;
    const antwort = await supabaseClient.auth.getSession();
    if (antwort.error) {
      zeigeKontoMeldung(
        "Der Anmeldestatus konnte nicht geladen werden: " +
        antwort.error.message,
        antwort.error
      );
      return;
    }

    const benutzer = antwort.data.session && antwort.data.session.user;
    anmeldung.hidden = Boolean(benutzer);
    angemeldet.hidden = !benutzer;
    familienAktionen.hidden = !benutzer;
    if (!benutzer) {
      kontoStatus.textContent = "";
      familienAuswahl.replaceChildren();
      return;
    }

    kontoStatus.textContent = "Angemeldet als " + benutzer.email;
    await aktualisiereFamilienListe();
  }

  function ladeSupabaseSDK() {
    if (window.supabase && window.supabase.createClient) {
      return Promise.resolve(true);
    }
    if (sdkLadeVorgang) return sdkLadeVorgang;

    sdkLadeVorgang = new Promise(function (resolve) {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.async = true;
      script.onload = function () {
        const bereit = Boolean(window.supabase && window.supabase.createClient);
        if (!bereit) {
          script.remove();
          sdkLadeVorgang = null;
        }
        resolve(bereit);
      };
      script.onerror = function () {
        script.remove();
        sdkLadeVorgang = null;
        resolve(false);
      };
      document.head.appendChild(script);
    });
    return sdkLadeVorgang;
  }

  async function initialisiereClient(konfiguration) {
    const sdkBereit = await ladeSupabaseSDK();
    if (!sdkBereit) {
      zeigeVerbindungsStatus(
        "Die Supabase-Bibliothek konnte nicht geladen werden. " +
        "Bitte prüfe deine Internetverbindung."
      );
      return false;
    }

    if (authAbo) authAbo.unsubscribe();
    try {
      supabaseClient = window.supabase.createClient(
        konfiguration.url,
        konfiguration.key,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }
      );
    } catch (fehler) {
      supabaseClient = null;
      zeigeVerbindungsStatus(
        "Die Supabase-Verbindung konnte nicht initialisiert werden.",
        fehler
      );
      return false;
    }

    kontoBereich.hidden = false;
    authAbo = supabaseClient.auth.onAuthStateChange(function () {
      window.setTimeout(function () {
        aktualisiereKonto();
      }, 0);
    }).data.subscription;
    await aktualisiereKonto();
    return true;
  }

  async function speichereKonfigurationUndVerbinde() {
    const url = urlInput.value.trim().replace(/\/+$/, "");
    const key = keyInput.value.trim();
    let geparsteUrl;

    try {
      geparsteUrl = new URL(url);
    } catch (fehler) {
      zeigeVerbindungsStatus("Bitte gib eine gültige Projekt-URL ein.");
      return;
    }

    const lokaleEntwicklungsUrl =
      geparsteUrl.hostname === "localhost" ||
      geparsteUrl.hostname === "127.0.0.1";
    if (geparsteUrl.protocol !== "https:" &&
        !(geparsteUrl.protocol === "http:" && lokaleEntwicklungsUrl)) {
      zeigeVerbindungsStatus(
        "Für Supabase muss die Projekt-URL mit https:// beginnen."
      );
      return;
    }
    if (!key) {
      zeigeVerbindungsStatus("Bitte gib den öffentlichen Publishable/anon-Key ein.");
      return;
    }
    if (istGeheimerSchluessel(key)) {
      zeigeVerbindungsStatus(
        "Dieser Schlüssel ist geheim. Verwende ausschließlich den " +
        "Publishable-Key oder öffentlichen anon-Key."
      );
      return;
    }

    const konfiguration = { url: geparsteUrl.origin, key: key };
    try {
      localStorage.setItem(configKey, JSON.stringify(konfiguration));
    } catch (fehler) {
      zeigeVerbindungsStatus(
        "Die Projektkonfiguration konnte nicht lokal gespeichert werden.",
        fehler
      );
      return;
    }

    if (await initialisiereClient(konfiguration)) {
      zeigeVerbindungsStatus(
        "Projektkonfiguration gespeichert. Melde dich an, um den " +
        "geschützten Datenbankzugriff zu prüfen."
      );
    }
  }

  async function registriereKonto() {
    if (!supabaseClient) return;
    const email = document.getElementById("supabaseEmail").value.trim();
    const passwort = document.getElementById("supabasePasswort").value;
    if (!email || !passwort) {
      zeigeKontoMeldung("Bitte gib E-Mail und Passwort ein.");
      return;
    }

    const antwort = await supabaseClient.auth.signUp({ email, password: passwort });
    if (antwort.error) {
      zeigeKontoMeldung(
        "Das Konto konnte nicht erstellt werden: " + antwort.error.message,
        antwort.error
      );
      return;
    }
    document.getElementById("supabasePasswort").value = "";
    zeigeKontoMeldung(
      antwort.data.session
        ? "Konto erstellt und angemeldet."
        : "Konto erstellt. Bitte bestätige deine E-Mail und melde dich danach an."
    );
    await aktualisiereKonto();
  }

  async function meldeKontoAn() {
    if (!supabaseClient) return;
    const email = document.getElementById("supabaseEmail").value.trim();
    const passwort = document.getElementById("supabasePasswort").value;
    if (!email || !passwort) {
      zeigeKontoMeldung("Bitte gib E-Mail und Passwort ein.");
      return;
    }

    const antwort = await supabaseClient.auth.signInWithPassword({
      email,
      password: passwort
    });
    if (antwort.error) {
      zeigeKontoMeldung(
        "Die Anmeldung ist fehlgeschlagen: " + antwort.error.message,
        antwort.error
      );
      return;
    }
    document.getElementById("supabasePasswort").value = "";
    zeigeKontoMeldung("Du bist angemeldet.");
    await aktualisiereKonto();
  }

  async function meldeKontoAb() {
    if (!supabaseClient) return;
    const antwort = await supabaseClient.auth.signOut();
    if (antwort.error) {
      zeigeKontoMeldung(
        "Die Abmeldung ist fehlgeschlagen: " + antwort.error.message,
        antwort.error
      );
      return;
    }
    zeigeKontoMeldung("Du wurdest abgemeldet.");
    await aktualisiereKonto();
  }

  async function erstelleFamilie() {
    if (!supabaseClient) return;
    const familienname =
      document.getElementById("supabaseFamilienName").value.trim();
    const anzeigename =
      document.getElementById("supabaseAnzeigename").value.trim();
    if (!familienname || !anzeigename) {
      zeigeKontoMeldung("Bitte gib Familienname und deinen Namen ein.");
      return;
    }

    const antwort = await supabaseClient.rpc("create_family", {
      p_family_name: familienname,
      p_display_name: anzeigename
    });
    if (antwort.error) {
      zeigeKontoMeldung(
        "Die Familie konnte nicht erstellt werden: " + antwort.error.message,
        antwort.error
      );
      return;
    }
    zeigeKontoMeldung("Familie erstellt. Du bist als Administrator eingetragen.");
    await aktualisiereFamilienListe();
  }

  async function erstelleEinladung() {
    if (!supabaseClient) return;
    const familienId = familienAuswahl.value;
    const email =
      document.getElementById("supabaseEinladungsEmail").value.trim();
    if (!familienId || !email) {
      zeigeKontoMeldung("Bitte wähle eine Familie und gib die E-Mail ein.");
      return;
    }

    const antwort = await supabaseClient.rpc("create_family_invite", {
      p_family_id: familienId,
      p_invited_email: email
    });
    if (antwort.error) {
      zeigeKontoMeldung(
        "Die Einladung konnte nicht erstellt werden: " +
        antwort.error.message,
        antwort.error
      );
      return;
    }
    document.getElementById("supabaseErstellterCode").value = antwort.data;
    document.getElementById("supabaseEinladungErgebnis").hidden = false;
    zeigeKontoMeldung(
      "Einladungscode erstellt. Teile ihn nur sicher mit der eingeladenen Person."
    );
  }

  async function nimmEinladungAn() {
    if (!supabaseClient) return;
    const token =
      document.getElementById("supabaseEinladungscode").value.trim();
    const anzeigename =
      document.getElementById("supabaseEinladungsName").value.trim();
    if (!token || !anzeigename) {
      zeigeKontoMeldung("Bitte gib Einladungscode und deinen Namen ein.");
      return;
    }

    const antwort = await supabaseClient.rpc("accept_family_invite", {
      p_token: token,
      p_display_name: anzeigename
    });
    if (antwort.error) {
      zeigeKontoMeldung(
        "Die Einladung konnte nicht angenommen werden: " +
        antwort.error.message,
        antwort.error
      );
      return;
    }
    document.getElementById("supabaseEinladungscode").value = "";
    zeigeKontoMeldung("Du bist der Familie beigetreten.");
    await aktualisiereFamilienListe();
  }

  async function kopiereEinladungscode() {
    const feld = document.getElementById("supabaseErstellterCode");
    try {
      await navigator.clipboard.writeText(feld.value);
      zeigeKontoMeldung("Einladungscode wurde kopiert.");
    } catch (fehler) {
      feld.focus();
      feld.select();
      zeigeKontoMeldung(
        "Automatisches Kopieren nicht möglich. Markiere den Code und kopiere ihn manuell."
      );
    }
  }

  document.getElementById("supabaseVerbinden")
    .addEventListener("click", speichereKonfigurationUndVerbinde);
  document.getElementById("supabaseRegistrieren")
    .addEventListener("click", registriereKonto);
  document.getElementById("supabaseAnmelden")
    .addEventListener("click", meldeKontoAn);
  document.getElementById("supabaseAbmelden")
    .addEventListener("click", meldeKontoAb);
  document.getElementById("supabaseFamilieErstellen")
    .addEventListener("click", erstelleFamilie);
  document.getElementById("supabaseEinladungErstellen")
    .addEventListener("click", erstelleEinladung);
  document.getElementById("supabaseEinladungAnnehmen")
    .addEventListener("click", nimmEinladungAn);
  document.getElementById("supabaseCodeKopieren")
    .addEventListener("click", kopiereEinladungscode);

  document.getElementById("einstellungenButton")
    .addEventListener("click", async function () {
      if (document.getElementById("einstellungenAnsicht").hidden) return;
      const konfiguration = leseGespeicherteKonfiguration();
      if (konfiguration && konfiguration.url && konfiguration.key) {
        urlInput.value = konfiguration.url;
        keyInput.value = konfiguration.key;
        kontoBereich.hidden = false;
        await initialisiereClient(konfiguration);
      }
    });

  const gespeicherteKonfiguration = leseGespeicherteKonfiguration();
  if (gespeicherteKonfiguration) {
    urlInput.value = gespeicherteKonfiguration.url || "";
    keyInput.value = gespeicherteKonfiguration.key || "";
  }
})();
