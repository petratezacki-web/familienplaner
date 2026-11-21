(function () {
  "use strict";

  const speicherSchluessel = "familienplanerEinkaufslisteV1";
  const ohneGeschaeftId = "ohne-geschaeft";
  const standardGeschaefte = [
    { id: ohneGeschaeftId, name: "Ohne Geschäft" },
    { id: "aldi", name: "ALDI" },
    { id: "lidl", name: "Lidl" },
    { id: "rewe", name: "REWE" },
    { id: "edeka", name: "EDEKA" },
    { id: "netto", name: "Netto" },
    { id: "kaufland", name: "Kaufland" },
    { id: "penny", name: "PENNY" },
    { id: "dm", name: "dm" },
    { id: "rossmann", name: "Rossmann" },
    { id: "konzum", name: "Konzum" },
    { id: "plodine", name: "Plodine" },
    { id: "spar", name: "SPAR" },
    { id: "mueller", name: "Müller" }
  ];
  const einheiten = {
    kg: "kg",
    g: "g",
    l: "Liter",
    piece: "Stück",
    pack: "Packung"
  };
  const ansicht = document.getElementById("einkaufslisteAnsicht");
  const kartenTaste = document.getElementById("einkaufslisteButton");
  const meldung = document.getElementById("einkaufMeldung");
  const formularPanel = document.getElementById("einkaufFormPanel");
  const artikelListe = document.getElementById("einkaufGeschaefte");
  const filterTasten = Array.from(
    document.querySelectorAll("[data-einkauf-filter]")
  );
  let aktuellerFilter = "all";
  let bearbeiteteArtikelId = null;
  let statusSchluessel = "";
  const offeneGeschaefte = Object.create(null);

  function t(text) {
    return window.familienplanerI18n
      ? window.familienplanerI18n.t(text)
      : text;
  }

  function zeitstempel() {
    return new Date().toISOString();
  }

  function neueId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function neueDaten() {
    return {
      version: 1,
      family_id: null,
      user_id: null,
      items: [],
      favorites: [],
      custom_stores: [],
      updated_at: zeitstempel()
    };
  }

  function zeigeMeldung(schluessel) {
    statusSchluessel = schluessel || "";
    meldung.hidden = !statusSchluessel;
    meldung.textContent = statusSchluessel ? t(statusSchluessel) : "";
  }

  function ladeDaten() {
    let gespeichert;
    try {
      gespeichert = localStorage.getItem(speicherSchluessel);
      if (!gespeichert) return neueDaten();
      const daten = JSON.parse(gespeichert);
      if (
        !daten ||
        typeof daten !== "object" ||
        Array.isArray(daten) ||
        !Array.isArray(daten.items)
      ) {
        throw new Error("Ungültiges Einkaufslistenformat.");
      }
      return {
        ...neueDaten(),
        ...daten,
        items: daten.items,
        favorites: Array.isArray(daten.favorites) ? daten.favorites : [],
        custom_stores: Array.isArray(daten.custom_stores)
          ? daten.custom_stores
          : []
      };
    } catch (fehler) {
      console.error("Einkaufsliste konnte nicht geladen werden.", fehler);
      zeigeMeldung("Die Einkaufsliste konnte nicht geladen werden.");
      return null;
    }
  }

  function speichereDaten(daten) {
    daten.updated_at = zeitstempel();
    try {
      localStorage.setItem(speicherSchluessel, JSON.stringify(daten));
      return true;
    } catch (fehler) {
      console.error("Einkaufsliste konnte nicht gespeichert werden.", fehler);
      zeigeMeldung("Die Einkaufsliste konnte nicht gespeichert werden.");
      return false;
    }
  }

  function aktuellePerson() {
    let einstellungen = {};
    let mitglieder = [];
    try {
      einstellungen = JSON.parse(
        localStorage.getItem("familienSprachEinstellungenV1") || "{}"
      );
      mitglieder = JSON.parse(localStorage.getItem("familieMitglieder") || "[]");
      if (!Array.isArray(mitglieder)) mitglieder = [];
    } catch (fehler) {
      console.error("Familienmitglied für die Einkaufsliste konnte nicht geladen werden.", fehler);
    }
    const mitglied = mitglieder.find(function (eintrag) {
      return einstellungen.activeMemberId &&
        eintrag &&
        eintrag.id === einstellungen.activeMemberId;
    });
    return {
      id: mitglied && typeof mitglied.id === "string" ? mitglied.id : null,
      name: mitglied && typeof mitglied.name === "string"
        ? mitglied.name
        : t("Familie")
    };
  }

  function geschaefte(daten) {
    const eigene = daten.custom_stores
      .filter(function (laden) {
        return laden &&
          typeof laden.id === "string" &&
          typeof laden.name === "string" &&
          laden.name.trim();
      })
      .map(function (laden) {
        return { ...laden, custom: true };
      });
    return standardGeschaefte.map(function (laden) {
      return { ...laden, custom: false };
    }).concat(eigene);
  }

  function geschaeftAnzeigename(laden) {
    return laden.id === ohneGeschaeftId ? t("Ohne Geschäft") : laden.name;
  }

  function geschaeftFuerArtikel(artikel, daten) {
    const vorhanden = geschaefte(daten).some(
      laden => laden.id === artikel.store_id
    );
    return vorhanden ? artikel.store_id : ohneGeschaeftId;
  }

  function isoHeute() {
    const heute = new Date();
    return [
      heute.getFullYear(),
      String(heute.getMonth() + 1).padStart(2, "0"),
      String(heute.getDate()).padStart(2, "0")
    ].join("-");
  }

  function formatDatum(datum) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datum || "")) return "";
    const teile = datum.split("-").map(Number);
    const locale = window.familienplanerI18n
      ? window.familienplanerI18n.locale()
      : "de-DE";
    return new Date(teile[0], teile[1] - 1, teile[2])
      .toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
  }

  function einheitAnzeigen(einheit) {
    return einheiten[einheit] ? t(einheiten[einheit]) : "";
  }

  function normalisiereName(name) {
    return String(name || "").trim().toLocaleLowerCase();
  }

  function istFavorit(artikel, daten) {
    return daten.favorites.some(function (favorit) {
      return favorit &&
        normalisiereName(favorit.name) === normalisiereName(artikel.name) &&
        favorit.store_id === geschaeftFuerArtikel(artikel, daten);
    });
  }

  function aktualisiereGeschaeftsAuswahl(daten, vorauswahl) {
    const auswahl = document.getElementById("einkaufGeschaeft");
    const bisherigerWert = vorauswahl || auswahl.value;
    auswahl.replaceChildren();
    geschaefte(daten).forEach(function (laden) {
      const option = new Option(
        geschaeftAnzeigename(laden),
        laden.id
      );
      if (laden.custom) option.dataset.i18nIgnore = "";
      auswahl.add(option);
    });
    auswahl.value = geschaefte(daten).some(
      laden => laden.id === bisherigerWert
    )
      ? bisherigerWert
      : ohneGeschaeftId;
  }

  function aktualisiereFortschritt(daten) {
    const artikel = daten.items.filter(
      item => item && typeof item === "object"
    );
    const erledigt = artikel.filter(item => item.purchased === true).length;
    const fortschritt = document.getElementById("einkaufFortschritt");
    const text = document.getElementById("einkaufFortschrittText");
    fortschritt.max = Math.max(artikel.length, 1);
    fortschritt.value = erledigt;
    text.textContent = t("{{done}} von {{total}} Artikeln erledigt")
      .replace("{{done}}", String(erledigt))
      .replace("{{total}}", String(artikel.length));
    document.getElementById("einkaufGekauftEntfernen").disabled =
      erledigt === 0;
  }

  function istImFilter(artikel) {
    if (aktuellerFilter === "open") return artikel.purchased !== true;
    if (aktuellerFilter === "bought") return artikel.purchased === true;
    if (aktuellerFilter === "today") {
      return artikel.purchased !== true &&
        Boolean(artikel.due_date) &&
        artikel.due_date <= isoHeute();
    }
    return true;
  }

  function erstelleLeermeldung(text) {
    const element = document.createElement("p");
    element.className = "einkaufLeer";
    element.textContent = t(text);
    return element;
  }

  function erstelleArtikelZeile(artikel, daten) {
    const zeile = document.createElement("article");
    zeile.className = "einkaufArtikel";
    zeile.dataset.gekauft = String(artikel.purchased === true);

    const checkbox = document.createElement("input");
    checkbox.className = "einkaufArtikelKaufen";
    checkbox.type = "checkbox";
    checkbox.checked = artikel.purchased === true;
    checkbox.setAttribute(
      "aria-label",
      t(artikel.purchased ? "Gekauft" : "Als gekauft markieren") +
        ": " + artikel.name
    );
    checkbox.addEventListener("change", function () {
      const aktuell = ladeDaten();
      if (!aktuell) return;
      const gespeichert = aktuell.items.find(item => item.id === artikel.id);
      if (!gespeichert) return;
      gespeichert.purchased = checkbox.checked;
      gespeichert.updated_at = zeitstempel();
      if (!speichereDaten(aktuell)) {
        checkbox.checked = !checkbox.checked;
        return;
      }
      zeigeMeldung(
        gespeichert.purchased ? "Artikel als gekauft markiert." : "Kaufmarkierung aufgehoben."
      );
      render();
    });

    const info = document.createElement("div");
    info.className = "einkaufArtikelInfo";
    const name = document.createElement("strong");
    name.className = "einkaufArtikelName";
    name.dataset.i18nIgnore = "";
    name.textContent = artikel.name;
    info.appendChild(name);

    const details = [];
    if (Number.isFinite(Number(artikel.quantity)) &&
        artikel.quantity !== null &&
        artikel.quantity !== "") {
      details.push(
        new Intl.NumberFormat(
          window.familienplanerI18n
            ? window.familienplanerI18n.locale()
            : "de-DE",
          { maximumFractionDigits: 3 }
        ).format(Number(artikel.quantity))
      );
    }
    if (artikel.unit) details.push(einheitAnzeigen(artikel.unit));
    if (details.length) {
      const menge = document.createElement("span");
      menge.className = "einkaufArtikelDetails";
      menge.textContent = details.join(" ");
      info.appendChild(menge);
    }

    if (artikel.note) {
      const notiz = document.createElement("span");
      notiz.className = "einkaufArtikelDetails";
      const notizLabel = document.createElement("span");
      notizLabel.textContent = t("Notiz:");
      const notizText = document.createElement("span");
      notizText.dataset.i18nIgnore = "";
      notizText.textContent = artikel.note;
      notiz.append(notizLabel, " ", notizText);
      info.appendChild(notiz);
    }

    if (artikel.due_date) {
      const datum = document.createElement("span");
      datum.className = "einkaufArtikelDetails";
      datum.textContent = t("Einkaufen am") + " " + formatDatum(artikel.due_date);
      info.appendChild(datum);
    }

    const hinzugefuegt = document.createElement("small");
    hinzugefuegt.className = "einkaufArtikelHinzugefuegt";
    const hinzugefuegtText = document.createElement("span");
    hinzugefuegtText.textContent = t("Hinzugefügt von");
    const personenName = document.createElement("span");
    personenName.dataset.i18nIgnore = "";
    personenName.textContent = artikel.added_by_name || t("Familie");
    hinzugefuegt.append(hinzugefuegtText, " ", personenName);
    info.appendChild(hinzugefuegt);

    const aktionen = document.createElement("div");
    aktionen.className = "einkaufArtikelAktionen";

    const favoritTaste = document.createElement("button");
    favoritTaste.className = "einkaufFavoritTaste";
    favoritTaste.type = "button";
    favoritTaste.textContent = istFavorit(artikel, daten) ? "★" : "☆";
    favoritTaste.setAttribute(
      "aria-label",
      t(istFavorit(artikel, daten)
        ? "Aus Favoriten entfernen"
        : "Zu Favoriten hinzufügen")
    );
    favoritTaste.setAttribute(
      "aria-pressed",
      String(istFavorit(artikel, daten))
    );
    favoritTaste.title = favoritTaste.getAttribute("aria-label");
    favoritTaste.addEventListener("click", function () {
      const aktuell = ladeDaten();
      if (!aktuell) return;
      const gespeicherterArtikel = aktuell.items.find(
        item => item.id === artikel.id
      );
      if (!gespeicherterArtikel) return;
      const geschaeftId = geschaeftFuerArtikel(gespeicherterArtikel, aktuell);
      const index = aktuell.favorites.findIndex(function (favorit) {
        return normalisiereName(favorit.name) ===
            normalisiereName(gespeicherterArtikel.name) &&
          favorit.store_id === geschaeftId;
      });
      if (index >= 0) {
        aktuell.favorites.splice(index, 1);
        if (!speichereDaten(aktuell)) return;
        zeigeMeldung("Aus Favoriten entfernt.");
      } else {
        const person = aktuellePerson();
        aktuell.favorites.push({
          id: neueId(),
          family_id: aktuell.family_id || null,
          user_id: aktuell.user_id || null,
          name: gespeicherterArtikel.name,
          quantity: gespeicherterArtikel.quantity,
          unit: gespeicherterArtikel.unit || "",
          note: gespeicherterArtikel.note || "",
          store_id: geschaeftId,
          added_by_id: person.id,
          added_by_name: person.name,
          created_at: zeitstempel(),
          updated_at: zeitstempel()
        });
        if (!speichereDaten(aktuell)) return;
        zeigeMeldung("Zu Favoriten hinzugefügt.");
      }
      render();
    });
    aktionen.appendChild(favoritTaste);

    const bearbeiten = document.createElement("button");
    bearbeiten.type = "button";
    bearbeiten.textContent = "✎";
    bearbeiten.setAttribute("aria-label", t("Artikel bearbeiten"));
    bearbeiten.title = bearbeiten.getAttribute("aria-label");
    bearbeiten.addEventListener("click", function () {
      oeffneFormular(artikel, geschaeftFuerArtikel(artikel, daten));
    });
    aktionen.appendChild(bearbeiten);

    const geschaeftAuswahl = document.createElement("select");
    geschaeftAuswahl.className = "einkaufArtikelGeschaeft";
    geschaeftAuswahl.setAttribute(
      "aria-label",
      t("Geschäft ändern") + ": " + artikel.name
    );
    geschaefte(daten).forEach(function (laden) {
      const option = new Option(geschaeftAnzeigename(laden), laden.id);
      if (laden.custom) option.dataset.i18nIgnore = "";
      geschaeftAuswahl.add(option);
    });
    geschaeftAuswahl.value = geschaeftFuerArtikel(artikel, daten);
    geschaeftAuswahl.addEventListener("change", function () {
      verschiebeArtikel(artikel.id, geschaeftAuswahl.value);
    });
    aktionen.appendChild(geschaeftAuswahl);

    const loeschen = document.createElement("button");
    loeschen.type = "button";
    loeschen.textContent = "×";
    loeschen.setAttribute("aria-label", t("Artikel löschen"));
    loeschen.title = loeschen.getAttribute("aria-label");
    loeschen.addEventListener("click", function () {
      if (!window.confirm(t("Diesen Artikel wirklich löschen?"))) return;
      const aktuell = ladeDaten();
      if (!aktuell) return;
      aktuell.items = aktuell.items.filter(item => item.id !== artikel.id);
      if (!speichereDaten(aktuell)) return;
      zeigeMeldung("Artikel gelöscht.");
      render();
    });
    aktionen.appendChild(loeschen);

    zeile.append(checkbox, info, aktionen);
    return zeile;
  }

  function erstelleGeschaeftsKarte(laden, daten, artikel) {
    const karte = document.createElement("section");
    karte.className = "einkaufGeschaeftKarte";

    const kopf = document.createElement("button");
    kopf.className = "einkaufGeschaeftKopf";
    kopf.type = "button";
    const name = document.createElement("strong");
    name.className = "einkaufGeschaeftName";
    if (laden.custom) name.dataset.i18nIgnore = "";
    name.textContent = geschaeftAnzeigename(laden);

    const anzahl = document.createElement("span");
    anzahl.className = "einkaufGeschaeftAnzahl";
    const offen = daten.items.filter(function (item) {
      return item &&
        item.purchased !== true &&
        geschaeftFuerArtikel(item, daten) === laden.id;
    }).length;
    anzahl.textContent = t("{{count}} offen")
      .replace("{{count}}", String(offen));
    const pfeil = document.createElement("span");
    pfeil.className = "einkaufGeschaeftPfeil";
    pfeil.setAttribute("aria-hidden", "true");
    pfeil.textContent = "⌄";
    kopf.append(name, anzahl, pfeil);

    const inhalt = document.createElement("div");
    inhalt.className = "einkaufArtikelListe";
    if (offeneGeschaefte[laden.id] === undefined) {
      offeneGeschaefte[laden.id] = true;
    }
    const istOffen = offeneGeschaefte[laden.id];
    kopf.setAttribute("aria-expanded", String(istOffen));
    inhalt.hidden = !istOffen;
    kopf.setAttribute("aria-controls", "einkaufArtikel_" + laden.id);
    inhalt.id = "einkaufArtikel_" + laden.id;
    kopf.addEventListener("click", function () {
      offeneGeschaefte[laden.id] = !offeneGeschaefte[laden.id];
      render();
    });

    if (artikel.length) {
      artikel.forEach(function (eintrag) {
        inhalt.appendChild(erstelleArtikelZeile(eintrag, daten));
      });
    } else {
      inhalt.appendChild(erstelleLeermeldung(
        daten.items.some(item =>
          item &&
          geschaeftFuerArtikel(item, daten) === laden.id
        )
          ? "Keine Artikel für diesen Filter."
          : "Keine Artikel in diesem Geschäft."
      ));
    }
    karte.append(kopf, inhalt);
    return karte;
  }

  function renderFavoriten(daten) {
    const bereich = document.getElementById("einkaufFavoritenBereich");
    const liste = document.getElementById("einkaufFavoriten");
    liste.replaceChildren();
    bereich.hidden = daten.favorites.length === 0;
    daten.favorites.forEach(function (favorit) {
      const taste = document.createElement("button");
      taste.type = "button";
      const name = document.createElement("span");
      name.dataset.i18nIgnore = "";
      name.textContent = favorit.name;
      const plus = document.createElement("span");
      plus.setAttribute("aria-hidden", "true");
      plus.textContent = "+";
      taste.append(plus, name);
      taste.setAttribute(
        "aria-label",
        t("Favorit erneut hinzufügen") + ": " + favorit.name
      );
      taste.addEventListener("click", function () {
        fuegeFavoritHinzu(favorit.id);
      });
      liste.appendChild(taste);
    });
  }

  function renderEigeneGeschaefte(daten) {
    const liste = document.getElementById("einkaufEigeneGeschaefte");
    liste.replaceChildren();
    if (daten.custom_stores.length === 0) {
      liste.appendChild(erstelleLeermeldung("Noch keine eigenen Geschäfte."));
      return;
    }

    daten.custom_stores.forEach(function (laden) {
      if (!laden || typeof laden.name !== "string") return;
      const zeile = document.createElement("div");
      zeile.className = "einkaufEigenerLaden";
      const name = document.createElement("input");
      name.type = "text";
      name.maxLength = 60;
      name.value = laden.name;
      name.setAttribute("aria-label", t("Geschäftsname"));
      name.dataset.i18nIgnore = "";
      const speichern = document.createElement("button");
      speichern.type = "button";
      speichern.textContent = t("Änderungen speichern");
      speichern.addEventListener("click", function () {
        const aktuell = ladeDaten();
        if (!aktuell) return;
        const neuerName = name.value.trim();
        if (!neuerName) {
          zeigeMeldung("Bitte einen Geschäftsnamen eingeben.");
          name.focus();
          return;
        }
        const duplikat = geschaefte(aktuell).some(function (andererLaden) {
          return andererLaden.id !== laden.id &&
            normalisiereName(andererLaden.name) === normalisiereName(neuerName);
        });
        if (duplikat) {
          zeigeMeldung("Dieses Geschäft gibt es bereits.");
          return;
        }
        const gespeicherterLaden = aktuell.custom_stores.find(
          item => item.id === laden.id
        );
        if (!gespeicherterLaden) return;
        gespeicherterLaden.name = neuerName;
        gespeicherterLaden.updated_at = zeitstempel();
        if (!speichereDaten(aktuell)) return;
        zeigeMeldung("Geschäft gespeichert.");
        render();
      });

      const entfernen = document.createElement("button");
      entfernen.className = "einkaufGeschaeftEntfernen";
      entfernen.type = "button";
      entfernen.textContent = t("Entfernen");
      entfernen.addEventListener("click", function () {
        if (!window.confirm(t(
          "Geschäft wirklich entfernen? Zugeordnete Artikel werden zu „Ohne Geschäft“ verschoben."
        ))) {
          return;
        }
        const aktuell = ladeDaten();
        if (!aktuell) return;
        aktuell.custom_stores = aktuell.custom_stores.filter(
          item => item.id !== laden.id
        );
        aktuell.items.forEach(function (item) {
          if (item.store_id === laden.id) {
            item.store_id = ohneGeschaeftId;
            item.updated_at = zeitstempel();
          }
        });
        aktuell.favorites.forEach(function (favorit) {
          if (favorit.store_id === laden.id) {
            favorit.store_id = ohneGeschaeftId;
            favorit.updated_at = zeitstempel();
          }
        });
        if (!speichereDaten(aktuell)) return;
        zeigeMeldung("Geschäft entfernt.");
        render();
      });

      zeile.append(name, speichern, entfernen);
      liste.appendChild(zeile);
    });
  }

  function render() {
    const daten = ladeDaten();
    if (!daten) return;
    aktualisiereGeschaeftsAuswahl(
      daten,
      document.getElementById("einkaufGeschaeft").value
    );
    aktualisiereFortschritt(daten);
    renderFavoriten(daten);
    renderEigeneGeschaefte(daten);
    filterTasten.forEach(function (taste) {
      taste.setAttribute(
        "aria-pressed",
        String(taste.dataset.einkaufFilter === aktuellerFilter)
      );
    });
    if (statusSchluessel) zeigeMeldung(statusSchluessel);
    artikelListe.replaceChildren();

    const laeden = geschaefte(daten);
    laeden.forEach(function (laden) {
      const hatArtikel = daten.items.some(function (item) {
        return item &&
          geschaeftFuerArtikel(item, daten) === laden.id;
      });
      if (
        laden.id !== ohneGeschaeftId &&
        !laden.custom &&
        !hatArtikel
      ) {
        return;
      }
      const gefiltert = daten.items
        .filter(function (item) {
          return item &&
            geschaeftFuerArtikel(item, daten) === laden.id &&
            istImFilter(item);
        })
        .sort(function (a, b) {
          if (Boolean(a.purchased) !== Boolean(b.purchased)) {
            return a.purchased ? 1 : -1;
          }
          return String(a.created_at || "").localeCompare(
            String(b.created_at || "")
          );
        });
      if (
        aktuellerFilter !== "all" &&
        gefiltert.length === 0 &&
        laden.id !== ohneGeschaeftId &&
        laden.custom
      ) {
        return;
      }
      artikelListe.appendChild(
        erstelleGeschaeftsKarte(laden, daten, gefiltert)
      );
    });
  }

  function resetFormular() {
    document.getElementById("einkaufArtikelName").value = "";
    document.getElementById("einkaufMenge").value = "";
    document.getElementById("einkaufEinheit").value = "";
    document.getElementById("einkaufNotiz").value = "";
    document.getElementById("einkaufDatum").value = "";
    bearbeiteteArtikelId = null;
    document.getElementById("einkaufFormTitel").textContent =
      t("Artikel hinzufügen");
    document.getElementById("einkaufSpeichern").textContent = t("Speichern");
  }

  function oeffneFormular(artikel, storeId) {
    const daten = ladeDaten();
    if (!daten) return;
    resetFormular();
    aktualisiereGeschaeftsAuswahl(daten, storeId || ohneGeschaeftId);
    if (artikel) {
      bearbeiteteArtikelId = artikel.id;
      document.getElementById("einkaufArtikelName").value =
        artikel.name || "";
      document.getElementById("einkaufMenge").value =
        artikel.quantity === null || artikel.quantity === undefined
          ? ""
          : String(artikel.quantity);
      document.getElementById("einkaufEinheit").value = artikel.unit || "";
      document.getElementById("einkaufNotiz").value = artikel.note || "";
      document.getElementById("einkaufDatum").value =
        artikel.due_date || "";
      aktualisiereGeschaeftsAuswahl(
        daten,
        geschaeftFuerArtikel(artikel, daten)
      );
      document.getElementById("einkaufFormTitel").textContent =
        t("Artikel bearbeiten");
      document.getElementById("einkaufSpeichern").textContent =
        t("Änderungen speichern");
    }
    formularPanel.hidden = false;
    window.requestAnimationFrame(function () {
      formularPanel.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById("einkaufArtikelName").focus({
        preventScroll: true
      });
    });
  }

  function schliesseFormular() {
    formularPanel.hidden = true;
    resetFormular();
  }

  function findeOffenenDoppelten(daten, name, storeId, ausserId) {
    return daten.items.find(function (item) {
      return item &&
        item.id !== ausserId &&
        item.purchased !== true &&
        normalisiereName(item.name) === normalisiereName(name) &&
        geschaeftFuerArtikel(item, daten) === storeId;
    });
  }

  function einheitenPassen(ziel, quelle) {
    return !ziel || !quelle || ziel === quelle;
  }

  function erhoeheMenge(ziel, menge, einheit) {
    const bisherigeMenge = Number(ziel.quantity);
    const neueMenge = Number(menge);
    ziel.quantity = (Number.isFinite(bisherigeMenge) && bisherigeMenge > 0
      ? bisherigeMenge
      : 1) + (Number.isFinite(neueMenge) && neueMenge > 0 ? neueMenge : 1);
    if (!ziel.unit) ziel.unit = einheit || "";
    ziel.updated_at = zeitstempel();
  }

  function speichereArtikel(event) {
    event.preventDefault();
    const name = document.getElementById("einkaufArtikelName").value.trim();
    const mengeText = document.getElementById("einkaufMenge").value;
    const menge = mengeText ? Number(mengeText) : null;
    const einheit = document.getElementById("einkaufEinheit").value;
    const geschaeftId = document.getElementById("einkaufGeschaeft").value;
    const notiz = document.getElementById("einkaufNotiz").value.trim();
    const einkaufsDatum = document.getElementById("einkaufDatum").value;

    if (!name) {
      zeigeMeldung("Bitte einen Artikelnamen eingeben.");
      document.getElementById("einkaufArtikelName").focus();
      return;
    }
    if (menge !== null && (!Number.isFinite(menge) || menge <= 0)) {
      zeigeMeldung("Die Menge muss größer als Null sein.");
      document.getElementById("einkaufMenge").focus();
      return;
    }

    const daten = ladeDaten();
    if (!daten) return;
    const laden = geschaefte(daten).find(item => item.id === geschaeftId);
    if (!laden) {
      zeigeMeldung("Bitte ein Geschäft auswählen.");
      return;
    }
    const person = aktuellePerson();
    const bearbeitetIndex = bearbeiteteArtikelId
      ? daten.items.findIndex(item => item.id === bearbeiteteArtikelId)
      : -1;
    if (bearbeiteteArtikelId && bearbeitetIndex < 0) {
      zeigeMeldung("Der Artikel konnte nicht gefunden werden.");
      return;
    }

    const doppelterArtikel = findeOffenenDoppelten(
      daten,
      name,
      geschaeftId,
      bearbeiteteArtikelId
    );
    let duplikatZusammengefuehrt = false;
    if (doppelterArtikel && einheitenPassen(doppelterArtikel.unit, einheit)) {
      if (window.confirm(t(
        "Diesen Artikel gibt es in diesem Geschäft bereits. Menge erhöhen?"
      ))) {
        erhoeheMenge(doppelterArtikel, menge, einheit);
        if (notiz && !doppelterArtikel.note) doppelterArtikel.note = notiz;
        if (einkaufsDatum && !doppelterArtikel.due_date) {
          doppelterArtikel.due_date = einkaufsDatum;
        }
        if (bearbeitetIndex >= 0) {
          daten.items.splice(bearbeitetIndex, 1);
        }
        duplikatZusammengefuehrt = true;
      }
    } else if (doppelterArtikel) {
      zeigeMeldung(
        "Die Einheiten unterscheiden sich. Der Artikel wird separat geführt."
      );
    }

    if (!duplikatZusammengefuehrt) {
      const jetzt = zeitstempel();
      if (bearbeitetIndex >= 0) {
        const bisher = daten.items[bearbeitetIndex];
        daten.items[bearbeitetIndex] = {
          ...bisher,
          name: name,
          quantity: menge,
          unit: einheit,
          store_id: geschaeftId,
          note: notiz,
          due_date: einkaufsDatum || null,
          updated_at: jetzt
        };
      } else {
        daten.items.push({
          id: neueId(),
          family_id: daten.family_id || null,
          user_id: daten.user_id || null,
          name: name,
          quantity: menge,
          unit: einheit,
          store_id: geschaeftId,
          note: notiz,
          due_date: einkaufsDatum || null,
          added_by_id: person.id,
          added_by_name: person.name,
          purchased: false,
          created_at: jetzt,
          updated_at: jetzt
        });
      }
    }

    if (!speichereDaten(daten)) return;
    schliesseFormular();
    if (duplikatZusammengefuehrt) {
      zeigeMeldung("Menge erhöht.");
    } else {
      zeigeMeldung(
        bearbeitetIndex >= 0 ? "Artikel aktualisiert." : "Artikel hinzugefügt."
      );
    }
    render();
  }

  function verschiebeArtikel(artikelId, zielGeschaeftId) {
    const daten = ladeDaten();
    if (!daten) return;
    const artikel = daten.items.find(item => item.id === artikelId);
    if (!artikel) return;
    if (!geschaefte(daten).some(laden => laden.id === zielGeschaeftId)) {
      zeigeMeldung("Bitte ein Geschäft auswählen.");
      render();
      return;
    }
    if (artikel.store_id === zielGeschaeftId) return;
    const doppelterArtikel = findeOffenenDoppelten(
      daten,
      artikel.name,
      zielGeschaeftId,
      artikel.id
    );
    if (doppelterArtikel && einheitenPassen(doppelterArtikel.unit, artikel.unit)) {
      if (window.confirm(t(
        "Diesen Artikel gibt es in diesem Geschäft bereits. Menge erhöhen?"
      ))) {
        erhoeheMenge(
          doppelterArtikel,
          artikel.quantity,
          artikel.unit
        );
        if (artikel.note && !doppelterArtikel.note) {
          doppelterArtikel.note = artikel.note;
        }
        daten.items = daten.items.filter(item => item.id !== artikel.id);
      } else {
        artikel.store_id = zielGeschaeftId;
        artikel.updated_at = zeitstempel();
      }
    } else {
      artikel.store_id = zielGeschaeftId;
      artikel.updated_at = zeitstempel();
    }
    if (!speichereDaten(daten)) return;
    zeigeMeldung("Artikel verschoben.");
    render();
  }

  function fuegeFavoritHinzu(favoritId) {
    const daten = ladeDaten();
    if (!daten) return;
    const favorit = daten.favorites.find(item => item.id === favoritId);
    if (!favorit) return;
    const storeId = geschaefte(daten).some(
      laden => laden.id === favorit.store_id
    )
      ? favorit.store_id
      : ohneGeschaeftId;
    const duplikat = findeOffenenDoppelten(
      daten,
      favorit.name,
      storeId,
      null
    );
    if (duplikat && einheitenPassen(duplikat.unit, favorit.unit)) {
      erhoeheMenge(duplikat, favorit.quantity, favorit.unit);
      if (favorit.note && !duplikat.note) duplikat.note = favorit.note;
    } else {
      const jetzt = zeitstempel();
      const person = aktuellePerson();
      daten.items.push({
        id: neueId(),
        family_id: daten.family_id || null,
        user_id: daten.user_id || null,
        name: favorit.name,
        quantity: favorit.quantity ?? null,
        unit: favorit.unit || "",
        store_id: storeId,
        note: favorit.note || "",
        due_date: null,
        added_by_id: person.id,
        added_by_name: person.name,
        purchased: false,
        created_at: jetzt,
        updated_at: jetzt
      });
    }
    if (!speichereDaten(daten)) return;
    zeigeMeldung("Favorit erneut hinzugefügt.");
    render();
  }

  function fuegeGeschaeftHinzu() {
    const feld = document.getElementById("einkaufNeuesGeschaeftName");
    const name = feld.value.trim();
    if (!name) {
      zeigeMeldung("Bitte einen Geschäftsnamen eingeben.");
      feld.focus();
      return;
    }
    const daten = ladeDaten();
    if (!daten) return;
    if (geschaefte(daten).some(
      laden => normalisiereName(laden.name) === normalisiereName(name)
    )) {
      zeigeMeldung("Dieses Geschäft gibt es bereits.");
      return;
    }
    const person = aktuellePerson();
    const jetzt = zeitstempel();
    daten.custom_stores.push({
      id: "custom_" + neueId(),
      family_id: daten.family_id || null,
      user_id: daten.user_id || null,
      name: name,
      created_by_id: person.id,
      created_at: jetzt,
      updated_at: jetzt
    });
    if (!speichereDaten(daten)) return;
    feld.value = "";
    zeigeMeldung("Geschäft hinzugefügt.");
    render();
  }

  function entferneGekaufteArtikel() {
    const daten = ladeDaten();
    if (!daten) return;
    const gekauft = daten.items.filter(item => item.purchased === true).length;
    if (!gekauft) return;
    if (!window.confirm(t("Alle gekauften Artikel entfernen?"))) return;
    daten.items = daten.items.filter(item => item.purchased !== true);
    if (!speichereDaten(daten)) return;
    zeigeMeldung("Gekaufte Artikel entfernt.");
    render();
  }

  document.getElementById("einkaufHinzufuegen")
    .addEventListener("click", function () {
      const daten = ladeDaten();
      if (!daten) return;
      const zuletztVerwendet = daten.items.length
        ? geschaeftFuerArtikel(daten.items[daten.items.length - 1], daten)
        : ohneGeschaeftId;
      oeffneFormular(null, zuletztVerwendet);
    });

  document.getElementById("einkaufAbbrechen")
    .addEventListener("click", schliesseFormular);
  formularPanel.addEventListener("submit", speichereArtikel);
  document.getElementById("einkaufGeschaeftHinzufuegen")
    .addEventListener("click", fuegeGeschaeftHinzu);
  document.getElementById("einkaufGekauftEntfernen")
    .addEventListener("click", entferneGekaufteArtikel);

  document.getElementById("einkaufGeschaefteUmschalten")
    .addEventListener("click", function () {
      const panel = document.getElementById("einkaufGeschaeftePanel");
      panel.hidden = !panel.hidden;
      this.setAttribute("aria-expanded", String(!panel.hidden));
      if (!panel.hidden) {
        panel.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

  filterTasten.forEach(function (taste) {
    taste.addEventListener("click", function () {
      aktuellerFilter = taste.dataset.einkaufFilter;
      render();
    });
  });

  kartenTaste.addEventListener("click", function () {
    ansicht.hidden = !ansicht.hidden;
    kartenTaste.setAttribute("aria-expanded", String(!ansicht.hidden));
    if (!ansicht.hidden) {
      render();
      ansicht.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      schliesseFormular();
      document.getElementById("einkaufGeschaeftePanel").hidden = true;
      document.getElementById("einkaufGeschaefteUmschalten")
        .setAttribute("aria-expanded", "false");
    }
  });

  kartenTaste.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      kartenTaste.click();
    }
  });

  document.getElementById("einkaufZurueck")
    .addEventListener("click", function () {
      ansicht.hidden = true;
      kartenTaste.setAttribute("aria-expanded", "false");
      schliesseFormular();
      document.getElementById("einkaufGeschaeftePanel").hidden = true;
      document.getElementById("einkaufGeschaefteUmschalten")
        .setAttribute("aria-expanded", "false");
      document.querySelector(".meni").scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    });

  document.addEventListener("familienplaner:languagechange", render);
  render();
})();
