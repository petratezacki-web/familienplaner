(function () {
  const apiBasis = "https://openholidaysapi.org";
  const einstellungsSchluessel = "familienFerienEinstellungenV1";
  const datenSchluessel = "familienFerienApiCacheV1";
  const gesendetSchluessel = "familienFerienErinnerungenGesendetV1";
  const cacheDauer = 24 * 60 * 60 * 1000;
  const tageInMillisekunden = 24 * 60 * 60 * 1000;
  const jahreszeit = new Date().getFullYear();
  const gueltigVon = jahreszeit + "-01-01";
  const gueltigBis = (jahreszeit + 2) + "-12-31";
  const deutscheBundeslaender = [
    { code: "DE-BW", name: "Baden-Württemberg" },
    { code: "DE-BY", name: "Bayern" },
    { code: "DE-BE", name: "Berlin" },
    { code: "DE-BB", name: "Brandenburg" },
    { code: "DE-HB", name: "Bremen" },
    { code: "DE-HH", name: "Hamburg" },
    { code: "DE-HE", name: "Hessen" },
    { code: "DE-MV", name: "Mecklenburg-Vorpommern" },
    { code: "DE-NI", name: "Niedersachsen" },
    { code: "DE-NW", name: "Nordrhein-Westfalen" },
    { code: "DE-RP", name: "Rheinland-Pfalz" },
    { code: "DE-SL", name: "Saarland" },
    { code: "DE-SN", name: "Sachsen" },
    { code: "DE-ST", name: "Sachsen-Anhalt" },
    { code: "DE-SH", name: "Schleswig-Holstein" },
    { code: "DE-TH", name: "Thüringen" }
  ];
  const laender = {
    DE: { name: "Deutschland", subdivision: true },
    HR: { name: "Kroatien", subdivision: false }
  };
  const farbSchluessel = {
    schulferien: "school",
    feiertag: "public",
    schulfrei: "schoolFree",
    weitere: "other",
    bruecke: "bridge"
  };
  const standardFarben = {
    school: "#DFE8DC",
    public: "#EBCBD3",
    schoolFree: "#F1E4B7",
    other: "#D8E3F0",
    bridge: "#E9DFC0"
  };
  const standardEinstellungen = {
    countries: {
      DE: { enabled: true, subdivisionCode: "DE-BY" },
      HR: { enabled: false, subdivisionCode: "" }
    },
    categories: {
      school: true,
      public: true,
      schoolFree: true,
      other: false
    },
    colors: { ...standardFarben },
    reminders: {
      enabled: true,
      days: [14, 7, 3, 2, 1, 0],
      schoolStart: true
    },
    bridgeDays: true,
    manualDays: []
  };
  const elemente = {
    landDE: document.getElementById("ferienLandDE"),
    landHR: document.getElementById("ferienLandHR"),
    bundeslandFeld: document.getElementById("ferienBundeslandFeld"),
    bundesland: document.getElementById("ferienBundesland"),
    kroatienHinweis: document.getElementById("ferienKroatienHinweis"),
    kategorieSchulferien: document.getElementById("ferienKategorieSchulferien"),
    kategorieFeiertage: document.getElementById("ferienKategorieFeiertage"),
    kategorieSchulfrei: document.getElementById("ferienKategorieSchulfrei"),
    kategorieWeitere: document.getElementById("ferienKategorieWeitere"),
    brueckentage: document.getElementById("ferienBrueckentage"),
    erinnerungenAktiv: document.getElementById("ferienErinnerungenAktiv"),
    schulbeginnErinnerung: document.getElementById("ferienSchulbeginnErinnerung"),
    farbeSchulferien: document.getElementById("ferienFarbeSchulferien"),
    farbeFeiertage: document.getElementById("ferienFarbeFeiertage"),
    farbeSchulfrei: document.getElementById("ferienFarbeSchulfrei"),
    farbeWeitere: document.getElementById("ferienFarbeWeitere"),
    farbeBruecke: document.getElementById("ferienFarbeBruecke"),
    status: document.getElementById("ferienStatus"),
    aktualisieren: document.getElementById("ferienAktualisieren"),
    manuellName: document.getElementById("ferienManuellName"),
    manuellDatum: document.getElementById("ferienManuellDatum"),
    manuellHinzufuegen: document.getElementById("ferienManuellHinzufuegen"),
    manuellListe: document.getElementById("ferienManuellListe"),
    woche: document.getElementById("ferienWoche"),
    erinnerungsBox: document.getElementById("ferienErinnerungen"),
    erinnerungsListe: document.getElementById("ferienErinnerungenListe"),
    kalenderStatus: document.getElementById("ferienKalenderStatus"),
    details: document.getElementById("ferienTagDetails"),
    detailDatum: document.getElementById("ferienDetailDatum"),
    detailEintraege: document.getElementById("ferienDetailEintraege"),
    detailSchliessen: document.getElementById("ferienDetailSchliessen"),
    terminHinzufuegen: document.getElementById("ferienTerminHinzufuegen")
  };
  const erinnerungsTage = Array.from(
    document.querySelectorAll("[data-ferien-erinnerung]")
  );
  let einstellungen = leseEinstellungen();
  let cache = leseCache();
  let statusMeldungen = [];
  let aktualisierungLaeuft = null;
  let aktualisierungErneut = false;
  const gespeicherteErinnerungen = leseGesendeteErinnerungen();
  const sitzungsErinnerungen = new Set();
  let displayLanguage = (document.documentElement.lang || "de")
    .slice(0, 2)
    .toUpperCase();

  function leseEinstellungen() {
    let gespeichert = null;
    try {
      gespeichert = JSON.parse(
        localStorage.getItem(einstellungsSchluessel) || "null"
      );
    } catch (fehler) {
      console.error("Ferieneinstellungen konnten nicht gelesen werden.", fehler);
    }

    const daten = gespeichert && typeof gespeichert === "object"
      ? gespeichert
      : {};
    const laenderEinstellungen = { ...standardEinstellungen.countries };
    Object.keys(laender).forEach(function (code) {
      const land = daten.countries && daten.countries[code];
      if (land && typeof land === "object") {
        laenderEinstellungen[code] = {
          enabled: Boolean(land.enabled),
          subdivisionCode: typeof land.subdivisionCode === "string"
            ? land.subdivisionCode
            : ""
        };
      }
    });

    const kategorien = { ...standardEinstellungen.categories };
    if (daten.categories && typeof daten.categories === "object") {
      Object.keys(kategorien).forEach(function (key) {
        if (typeof daten.categories[key] === "boolean") {
          kategorien[key] = daten.categories[key];
        }
      });
    }

    const farben = { ...standardFarben };
    if (daten.colors && typeof daten.colors === "object") {
      Object.keys(farben).forEach(function (key) {
        if (/^#[0-9a-f]{6}$/i.test(daten.colors[key] || "")) {
          farben[key] = daten.colors[key];
        }
      });
    }

    const erinnerungen = daten.reminders &&
      typeof daten.reminders === "object"
      ? daten.reminders
      : {};
    const erinnerungstage = Array.isArray(erinnerungen.days)
      ? erinnerungen.days.map(Number).filter(function (tag) {
        return [14, 7, 3, 2, 1, 0].includes(tag);
      })
      : standardEinstellungen.reminders.days.slice();

    return {
      countries: laenderEinstellungen,
      categories: kategorien,
      colors: farben,
      reminders: {
        enabled: typeof erinnerungen.enabled === "boolean"
          ? erinnerungen.enabled
          : true,
        days: Array.from(new Set(erinnerungstage)),
        schoolStart: typeof erinnerungen.schoolStart === "boolean"
          ? erinnerungen.schoolStart
          : true
      },
      bridgeDays: typeof daten.bridgeDays === "boolean"
        ? daten.bridgeDays
        : true,
      manualDays: Array.isArray(daten.manualDays)
        ? daten.manualDays.filter(function (tag) {
          return tag && typeof tag.id === "string" &&
            typeof tag.name === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(tag.date);
        })
        : []
    };
  }

  function leseCache() {
    try {
      const daten = JSON.parse(localStorage.getItem(datenSchluessel) || "{}");
      if (!daten || Array.isArray(daten) || typeof daten !== "object") {
        throw new Error("Ungültiges Cache-Format.");
      }
      return daten;
    } catch (fehler) {
      console.error("Feriencache konnte nicht gelesen werden.", fehler);
      return {};
    }
  }

  function leseGesendeteErinnerungen() {
    try {
      const daten = JSON.parse(
        localStorage.getItem(gesendetSchluessel) || "{}"
      );
      return daten && typeof daten === "object" && !Array.isArray(daten)
        ? daten
        : {};
    } catch (fehler) {
      console.error("Gesendete Ferienerinnerungen konnten nicht gelesen werden.", fehler);
      return {};
    }
  }

  function lokalDatum(datum) {
    return [
      datum.getFullYear(),
      String(datum.getMonth() + 1).padStart(2, "0"),
      String(datum.getDate()).padStart(2, "0")
    ].join("-");
  }

  function datumAlsUTC(isoDatum) {
    const teile = isoDatum.split("-").map(Number);
    return Date.UTC(teile[0], teile[1] - 1, teile[2]);
  }

  function datumPlusTage(isoDatum, anzahl) {
    return new Date(datumAlsUTC(isoDatum) + anzahl * tageInMillisekunden)
      .toISOString()
      .slice(0, 10);
  }

  function tageZwischen(von, bis) {
    return Math.round((datumAlsUTC(bis) - datumAlsUTC(von)) /
      tageInMillisekunden);
  }

  function gueltigesDatum(isoDatum) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDatum || "")) return false;
    const datum = new Date(isoDatum + "T00:00:00Z");
    return !Number.isNaN(datum.getTime()) &&
      datum.toISOString().slice(0, 10) === isoDatum;
  }

  function formatiereDatum(isoDatum, optionen) {
    if (!gueltigesDatum(isoDatum)) return isoDatum;
    const sprache = window.familienplanerI18n
      ? window.familienplanerI18n.locale()
      : "de-DE";
    return new Date(isoDatum + "T00:00:00").toLocaleDateString(
      sprache,
      optionen || { day: "numeric", month: "long", year: "numeric" }
    );
  }

  function uebersetze(text) {
    return window.familienplanerI18n
      ? window.familienplanerI18n.t(text)
      : text;
  }

  function nameInSprache(texte, sprache) {
    if (!Array.isArray(texte)) return "";
    const gesucht = sprache || displayLanguage;
    const treffer = texte.find(function (eintrag) {
      return eintrag && (eintrag.language || "").toUpperCase() === gesucht;
    });
    const deutsch = texte.find(function (eintrag) {
      return eintrag && (eintrag.language || "").toUpperCase() === "DE";
    });
    const englisch = texte.find(function (eintrag) {
      return eintrag && (eintrag.language || "").toUpperCase() === "EN";
    });
    return (treffer || deutsch || englisch || texte[0] || {}).text || "";
  }

  function landName(code) {
    return laender[code] ? uebersetze(laender[code].name) : code;
  }

  function bundeslandName(code) {
    const land = deutscheBundeslaender.find(function (eintrag) {
      return eintrag.code === code;
    });
    return land ? uebersetze(land.name) : code || uebersetze("Landesweit");
  }

  function regionName(landCode, subdivisions) {
    if (landCode === "DE") {
      return bundeslandName(subdivisions || einstellungen.countries.DE.subdivisionCode);
    }
    return uebersetze("Landesweit");
  }

  function cacheKey(landCode, subdivision, typ) {
    return [
      landCode,
      subdivision || "national",
      typ,
      gueltigVon,
      gueltigBis,
      displayLanguage
    ].join(":");
  }

  function cacheEintrag(landCode, subdivision, typ) {
    const direkt = cache[cacheKey(landCode, subdivision, typ)];
    if (direkt) return direkt;
    const prefix = [
      landCode,
      subdivision || "national",
      typ,
      gueltigVon,
      gueltigBis
    ].join(":") + ":";
    const alternative = Object.keys(cache).find(function (schluessel) {
      return schluessel.indexOf(prefix) === 0;
    });
    return alternative ? cache[alternative] : null;
  }

  function laenderAuswahl() {
    return Object.keys(laender).filter(function (code) {
      return einstellungen.countries[code].enabled;
    }).map(function (code) {
      return {
        code: code,
        subdivisionCode: code === "DE"
          ? einstellungen.countries.DE.subdivisionCode
          : ""
      };
    });
  }

  function erstelleApiUrl(land, typ) {
    const parameter = new URLSearchParams({
      countryIsoCode: land.code,
      languageIsoCode: displayLanguage,
      validFrom: gueltigVon,
      validTo: gueltigBis
    });
    if (land.subdivisionCode) {
      parameter.set("subdivisionCode", land.subdivisionCode);
    }
    return apiBasis + "/" +
      (typ === "school" ? "SchoolHolidays" : "PublicHolidays") +
      "?" + parameter.toString();
  }

  function gueltigeApiDaten(daten) {
    return Array.isArray(daten) && daten.every(function (eintrag) {
      return eintrag && typeof eintrag.id === "string" &&
        typeof eintrag.startDate === "string" &&
        typeof eintrag.endDate === "string" &&
        gueltigesDatum(eintrag.startDate) &&
        gueltigesDatum(eintrag.endDate) &&
        Array.isArray(eintrag.name);
    });
  }

  function speichereCacheEintrag(schluessel, eintrag) {
    const neu = { ...cache, [schluessel]: eintrag };
    try {
      localStorage.setItem(datenSchluessel, JSON.stringify(neu));
      cache = neu;
      return true;
    } catch (fehler) {
      console.error("Ferieninformationen konnten nicht lokal gespeichert werden.", fehler);
      cache = neu;
      statusMeldungen.push(
        "Die aktuellen Daten bleiben bis zum Schließen dieser Seite verfügbar, konnten aber nicht offline gespeichert werden."
      );
      return false;
    }
  }

  async function ladeDatensatz(land, typ, erzwingen) {
    const schluessel = cacheKey(land.code, land.subdivisionCode, typ);
    const vorhandener = cacheEintrag(land.code, land.subdivisionCode, typ);
    const zeit = vorhandener && Date.parse(vorhandener.fetchedAt);
    if (!erzwingen && vorhandener && Array.isArray(vorhandener.data) &&
        Number.isFinite(zeit) && Date.now() - zeit < cacheDauer) {
      return { data: vorhandener.data, cached: true, error: null };
    }
    if (navigator.onLine === false) {
      return {
        data: vorhandener && Array.isArray(vorhandener.data)
          ? vorhandener.data
          : null,
        cached: Boolean(vorhandener),
        error: "offline"
      };
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(function () {
      controller.abort();
    }, 12000);
    try {
      const antwort = await fetch(erstelleApiUrl(land, typ), {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "omit",
        signal: controller.signal
      });
      if (!antwort.ok) {
        throw new Error("OpenHolidays antwortete mit HTTP " + antwort.status);
      }
      const daten = await antwort.json();
      if (!gueltigeApiDaten(daten)) {
        throw new Error("OpenHolidays lieferte ein ungültiges Datenformat.");
      }
      const vorhandeneDaten = vorhandener &&
        gueltigeApiDaten(vorhandener.data)
        ? vorhandener.data
        : [];
      if (daten.length === 0 && vorhandeneDaten.length > 0) {
        return { data: vorhandeneDaten, cached: true, error: "noData" };
      }
      const gelieferteJahre = new Set();
      daten.forEach(function (ereignis) {
        for (let jahr = Number(ereignis.startDate.slice(0, 4));
          jahr <= Number(ereignis.endDate.slice(0, 4)); jahr++) {
          gelieferteJahre.add(jahr);
        }
      });
      const zusammengefuehrt = new Map(
        daten.map(function (ereignis) {
          return [ereignis.id, ereignis];
        })
      );
      vorhandeneDaten.forEach(function (ereignis) {
        const von = Number(ereignis.startDate.slice(0, 4));
        const bis = Number(ereignis.endDate.slice(0, 4));
        let hatUnbedecktesJahr = false;
        for (let jahr = von; jahr <= bis; jahr++) {
          if (!gelieferteJahre.has(jahr)) {
            hatUnbedecktesJahr = true;
            break;
          }
        }
        if (hatUnbedecktesJahr && !zusammengefuehrt.has(ereignis.id)) {
          zusammengefuehrt.set(ereignis.id, ereignis);
        }
      });
      const eintrag = {
        fetchedAt: new Date().toISOString(),
        country: land.code,
        subdivisionCode: land.subdivisionCode,
        type: typ,
        data: Array.from(zusammengefuehrt.values())
      };
      speichereCacheEintrag(schluessel, eintrag);
      return {
        data: Array.from(zusammengefuehrt.values()),
        cached: false,
        error: null
      };
    } catch (fehler) {
      console.error("OpenHolidays-Daten konnten nicht geladen werden.", fehler);
      return {
        data: vorhandener && Array.isArray(vorhandener.data)
          ? vorhandener.data
          : null,
        cached: Boolean(vorhandener),
        error: fehler.name === "AbortError" ? "timeout" : "network"
      };
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function zeigeStatus() {
    const auswahl = laenderAuswahl();
    if (auswahl.length === 0) {
      elemente.status.textContent =
        "Wähle mindestens ein Land aus, um Ferien und Feiertage zu laden.";
      elemente.kalenderStatus.hidden = false;
      elemente.kalenderStatus.textContent = elemente.status.textContent;
      return;
    }

    const text = statusMeldungen.length
      ? statusMeldungen.join(" ")
      : "OpenHolidays-Daten werden täglich geprüft. Letzte verfügbare Daten bleiben offline abrufbar.";
    elemente.status.textContent = text;
    elemente.kalenderStatus.textContent = text;
    elemente.kalenderStatus.hidden = statusMeldungen.length === 0;
  }

  function jahreOhneDaten(daten, jahr) {
    return !daten.some(function (eintrag) {
      const start = Number(eintrag.startDate.slice(0, 4));
      const ende = Number(eintrag.endDate.slice(0, 4));
      return start <= jahr && ende >= jahr;
    });
  }

  function pruefeVerfuegbarkeit() {
    const meldungen = statusMeldungen.slice();
    laenderAuswahl().forEach(function (land) {
      const ferien = cacheEintrag(
        land.code,
        land.subdivisionCode,
        "school"
      );
      if (!ferien || !Array.isArray(ferien.data)) return;
      const fehlendeJahre = [];
      for (let jahr = jahreszeit + 1; jahr <= jahreszeit + 2; jahr++) {
        if (jahreOhneDaten(ferien.data, jahr)) fehlendeJahre.push(jahr);
      }
      if (fehlendeJahre.length) {
        meldungen.push(
          "Für " + landName(land.code) + " liegen bei OpenHolidays derzeit keine Schulferiendaten für " +
          fehlendeJahre.join(" und ") + " vor."
        );
      }
    });
    statusMeldungen = Array.from(new Set(meldungen));
  }

  async function aktualisiereDaten(erzwingen) {
    if (aktualisierungLaeuft) {
      aktualisierungErneut = aktualisierungErneut || Boolean(erzwingen);
      return aktualisierungLaeuft;
    }

    aktualisierungLaeuft = (async function () {
      statusMeldungen = [];
      const auswahl = laenderAuswahl();
      if (auswahl.length === 0) {
        zeigeStatus();
        zeichneAlles();
        return;
      }
      elemente.status.textContent = erzwingen
        ? "Ferieninformationen werden aktualisiert …"
        : "Ferieninformationen werden geladen …";

      const anfragen = [];
      auswahl.forEach(function (land) {
        anfragen.push(ladeDatensatz(land, "school", erzwingen));
        anfragen.push(ladeDatensatz(land, "public", erzwingen));
      });
      const ergebnisse = await Promise.all(anfragen);
      const fehlgeschlagen = ergebnisse.some(function (ergebnis) {
        return ergebnis.error === "offline" ||
          ergebnis.error === "timeout" ||
          ergebnis.error === "network";
      });
      const keineAktualisierung = ergebnisse.some(function (ergebnis) {
        return ergebnis.error === "noData";
      });
      const keinDatensatz = ergebnisse.some(function (ergebnis) {
        return !Array.isArray(ergebnis.data);
      });
      if (fehlgeschlagen) {
        statusMeldungen.push(
          navigator.onLine === false
            ? "Offline: Es werden die zuletzt gespeicherten Daten angezeigt."
            : "OpenHolidays ist momentan nicht erreichbar. Vorhandene gespeicherte Daten wurden beibehalten."
        );
      }
      if (keineAktualisierung) {
        statusMeldungen.push(
          "OpenHolidays lieferte leere Daten; zuletzt gespeicherte Einträge wurden beibehalten."
        );
      }
      if (keinDatensatz) {
        statusMeldungen.push(
          "Für mindestens einen Abruf sind noch keine gespeicherten Daten vorhanden."
        );
      }
      pruefeVerfuegbarkeit();
      zeigeStatus();
      zeichneAlles();
      pruefeErinnerungen();
    })();

    try {
      await aktualisierungLaeuft;
    } finally {
      aktualisierungLaeuft = null;
      if (aktualisierungErneut) {
        aktualisierungErneut = false;
        void aktualisiereDaten(true);
      }
    }
  }

  function ereignisName(eintrag) {
    return nameInSprache(eintrag.name, displayLanguage) || "Feiertag";
  }

  function istInAuswahl(landCode, eintrag, subdivisionCode) {
    if (landCode === "HR") return true;
    if (eintrag.nationwide === true) return true;
    return Array.isArray(eintrag.subdivisions) &&
      eintrag.subdivisions.some(function (gebiet) {
        return gebiet && gebiet.code === subdivisionCode;
      });
  }

  function apiEreignisse() {
    const ergebnis = [];
    laenderAuswahl().forEach(function (land) {
      ["school", "public"].forEach(function (typ) {
        const eintrag = cacheEintrag(
          land.code,
          land.subdivisionCode,
          typ
        );
        if (!eintrag || !Array.isArray(eintrag.data)) return;
        eintrag.data.forEach(function (daten) {
          if (!gueltigesDatum(daten.startDate) ||
              !gueltigesDatum(daten.endDate) ||
              daten.startDate > daten.endDate) return;

          if (typ === "school") {
            const schulfrei = daten.startDate === daten.endDate;
            const art = schulfrei ? "schulfrei" : "schulferien";
            if (!einstellungen.categories[schulfrei ? "schoolFree" : "school"]) {
              return;
            }
            ergebnis.push({
              id: land.code + ":" + land.subdivisionCode + ":" + daten.id,
              sourceId: daten.id,
              source: "api",
              countryCode: land.code,
              subdivisionCode: land.subdivisionCode,
              name: ereignisName(daten),
              startDate: daten.startDate,
              endDate: daten.endDate,
              kind: art,
              officialDayOff: false,
              type: daten.type || "School",
              api: daten
            });
            return;
          }

          if (!istInAuswahl(land.code, daten, land.subdivisionCode)) return;
          const gesetzlich = daten.type === "Public";
          const art = gesetzlich ? "feiertag" : "weitere";
          if (!einstellungen.categories[gesetzlich ? "public" : "other"]) {
            return;
          }
          ergebnis.push({
            id: land.code + ":" + land.subdivisionCode + ":" + daten.id,
            sourceId: daten.id,
            source: "api",
            countryCode: land.code,
            subdivisionCode: land.subdivisionCode,
            name: ereignisName(daten),
            startDate: daten.startDate,
            endDate: daten.endDate,
            kind: art,
            officialDayOff: gesetzlich,
            type: daten.type || "Public",
            api: daten
          });
        });
      });
    });

    einstellungen.manualDays.forEach(function (tag) {
      if (!einstellungen.categories.schoolFree) return;
      ergebnis.push({
        id: tag.id,
        sourceId: tag.id,
        source: "manual",
        countryCode: "",
        subdivisionCode: "",
        name: tag.name,
        startDate: tag.date,
        endDate: tag.date,
        kind: "schulfrei",
        officialDayOff: false,
        type: "Manual"
      });
    });

    const eindeutig = new Map();
    ergebnis.forEach(function (ereignis) {
      eindeutig.set(ereignis.id, ereignis);
    });
    return Array.from(eindeutig.values());
  }

  function brueckentage(baseEvents) {
    if (!einstellungen.bridgeDays) return [];
    const ergebnis = [];
    baseEvents.filter(function (ereignis) {
      return ereignis.officialDayOff &&
        ereignis.startDate === ereignis.endDate;
    }).forEach(function (feiertag) {
      const wochentag = new Date(
        datumAlsUTC(feiertag.startDate)
      ).getUTCDay();
      let vorschlagsDatum = "";
      if (wochentag === 2) vorschlagsDatum = datumPlusTage(feiertag.startDate, -1);
      if (wochentag === 4) vorschlagsDatum = datumPlusTage(feiertag.startDate, 1);
      if (!vorschlagsDatum) return;

      const istSchonFrei = baseEvents.some(function (ereignis) {
        return ereignis.startDate <= vorschlagsDatum &&
          ereignis.endDate >= vorschlagsDatum &&
          (ereignis.officialDayOff ||
            ereignis.kind === "schulferien" ||
            ereignis.kind === "schulfrei");
      });
      if (istSchonFrei) return;
      ergebnis.push({
        id: "bridge:" + feiertag.id + ":" + vorschlagsDatum,
        sourceId: feiertag.id,
        source: "suggestion",
        countryCode: feiertag.countryCode,
        subdivisionCode: feiertag.subdivisionCode,
        name: "Brückentag-Vorschlag zu " + feiertag.name,
        startDate: vorschlagsDatum,
        endDate: vorschlagsDatum,
        kind: "bruecke",
        officialDayOff: false,
        type: "Suggestion"
      });
    });
    return ergebnis;
  }

  function alleEreignisse() {
    const basis = apiEreignisse();
    return basis.concat(brueckentage(basis));
  }

  function ereignisseAmDatum(datum, ereignisse) {
    return (ereignisse || alleEreignisse()).filter(function (ereignis) {
      return ereignis.startDate <= datum && ereignis.endDate >= datum;
    });
  }

  function anzahlTage(ereignis) {
    return tageZwischen(ereignis.startDate, ereignis.endDate) + 1;
  }

  function farbeFuerArt(art) {
    const schluessel = farbSchluessel[art];
    return einstellungen.colors[schluessel] || standardFarben[schluessel];
  }

  function farbeMitAlpha(hex, alpha) {
    const wert = hex.slice(1);
    const r = parseInt(wert.slice(0, 2), 16);
    const g = parseInt(wert.slice(2, 4), 16);
    const b = parseInt(wert.slice(4, 6), 16);
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  }

  function aktualisiereLegende() {
    const paare = [
      [".ferienLegendeSchulferien", "school"],
      [".ferienLegendeFeiertag", "public"],
      [".ferienLegendeSchulfrei", "schoolFree"],
      [".ferienLegendeWeitere", "other"],
      [".ferienLegendeBruecke", "bridge"]
    ];
    paare.forEach(function (paar) {
      const farbfeld = document.querySelector(paar[0]);
      if (farbfeld) farbfeld.style.backgroundColor = einstellungen.colors[paar[1]];
    });
  }

  function renderKalenderTag(feld, datum) {
    const ereignisse = ereignisseAmDatum(datum);
    if (ereignisse.length === 0) return;
    feld.classList.add("ferienKalenderTag");
    const farben = Array.from(new Set(ereignisse.map(function (ereignis) {
      return farbeFuerArt(ereignis.kind);
    })));
    const verlauf = farben.slice(0, 3).map(function (farbe, index) {
      const start = Math.round(index / Math.max(farben.length, 1) * 100);
      const ende = Math.round((index + 1) / Math.max(farben.length, 1) * 100);
      return farbeMitAlpha(farbe, 0.62) + " " + start + "% " + ende + "%";
    });
    feld.style.backgroundImage = "linear-gradient(135deg, " +
      verlauf.join(", ") + ")";
    feld.title = ereignisse.map(function (ereignis) {
      return ereignis.name + " · " + landName(ereignis.countryCode);
    }).join("\n");

    const sichtbar = ereignisse.slice(0, 2);
    sichtbar.forEach(function (ereignis) {
      const knopf = document.createElement("button");
      knopf.type = "button";
      knopf.className = "ferienKalenderEintrag";
      knopf.dataset.i18nIgnore = "";
      if (ereignis.kind === "bruecke") {
        knopf.classList.add("ferienBrueckeEintrag");
      }
      knopf.textContent = ereignis.name;
      knopf.title = ereignis.name;
      knopf.style.setProperty(
        "--ferienEintragFarbe",
        farbeMitAlpha(farbeFuerArt(ereignis.kind), 0.82)
      );
      knopf.addEventListener("click", function (event) {
        event.stopPropagation();
        zeigeDetails(datum);
      });
      feld.appendChild(knopf);
    });
    if (ereignisse.length > sichtbar.length) {
      const mehr = document.createElement("span");
      mehr.className = "ferienKalenderEintrag";
      mehr.textContent = "+" + (ereignisse.length - sichtbar.length);
      mehr.setAttribute("aria-label", "Weitere Feiertage an diesem Tag");
      feld.appendChild(mehr);
    }
  }

  function ortText(ereignis) {
    const land = landName(ereignis.countryCode);
    if (ereignis.countryCode === "DE") {
      const region = regionName("DE", ereignis.subdivisionCode);
      return land + " · " + region;
    }
    return land + " · Landesweit";
  }

  function artText(ereignis) {
    if (ereignis.kind === "schulferien") return "Schulferien";
    if (ereignis.kind === "schulfrei") return "Schulfreier Tag";
    if (ereignis.kind === "feiertag") return "Gesetzlicher Feiertag";
    if (ereignis.kind === "bruecke") return "Brückentag-Vorschlag";
    return "Weiterer Feiertag";
  }

  function zeigeDetails(datum) {
    const ereignisse = ereignisseAmDatum(datum);
    if (ereignisse.length === 0) return false;
    elemente.detailDatum.textContent = formatiereDatum(datum);
    elemente.details.dataset.date = datum;
    elemente.detailEintraege.replaceChildren();
    ereignisse.forEach(function (ereignis) {
      const karte = document.createElement("article");
      karte.className = "ferienDetailEintrag";
      karte.style.setProperty(
        "--ferienEintragFarbe",
        farbeFuerArt(ereignis.kind)
      );
      const name = document.createElement("h4");
      name.dataset.i18nIgnore = "";
      name.textContent = ereignis.name;
      const zeitraum = document.createElement("p");
      zeitraum.textContent = "Zeitraum: " +
        formatiereDatum(ereignis.startDate) +
        (ereignis.endDate !== ereignis.startDate
          ? " – " + formatiereDatum(ereignis.endDate)
          : "");
      const ort = document.createElement("p");
      ort.textContent = "Land/Region: " + ortText(ereignis);
      const dauer = document.createElement("p");
      dauer.textContent = "Dauer: " + anzahlTage(ereignis) +
        (anzahlTage(ereignis) === 1 ? " Tag" : " Tage");
      const kategorie = document.createElement("p");
      kategorie.textContent = "Art: " + artText(ereignis);
      const arbeitsfrei = document.createElement("p");
      arbeitsfrei.textContent = "Gesetzlicher arbeitsfreier Tag: " +
        (ereignis.officialDayOff ? "Ja" : "Nein");
      if (ereignis.kind === "bruecke") {
        arbeitsfrei.textContent =
          "Hinweis: Nur ein Vorschlag, kein bestätigter arbeitsfreier Tag.";
      }
      karte.append(name, zeitraum, ort, dauer, kategorie, arbeitsfrei);
      elemente.detailEintraege.appendChild(karte);
    });
    elemente.details.hidden = false;
    elemente.details.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return true;
  }

  function zeigeTerminFormular(datum) {
    const formular = document.getElementById("terminForm");
    const datumsfeld = document.getElementById("terminDatum");
    if (!formular || !datumsfeld) return;
    formular.hidden = false;
    datumsfeld.value = datum;
    formular.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("terminName").focus();
  }

  function renderWoche() {
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    const heuteIso = lokalDatum(heute);
    const montag = new Date(heute);
    montag.setDate(heute.getDate() - ((heute.getDay() + 6) % 7));
    const sonntagIso = lokalDatum(new Date(
      montag.getFullYear(),
      montag.getMonth(),
      montag.getDate() + 6
    ));
    const ereignisse = alleEreignisse();
    let woche = ereignisse.filter(function (ereignis) {
      return ereignis.startDate <= sonntagIso &&
        ereignis.endDate >= lokalDatum(montag);
    });

    const naechste14Tage = datumPlusTage(heuteIso, 14);
    if (woche.length === 0) {
      woche = ereignisse.filter(function (ereignis) {
        return ereignis.startDate >= heuteIso &&
          ereignis.startDate <= naechste14Tage;
      }).slice(0, 3);
    }

    elemente.woche.replaceChildren();
    if (woche.length === 0) {
      elemente.woche.hidden = true;
      return;
    }
    elemente.woche.hidden = false;
    woche.slice(0, 5).forEach(function (ereignis) {
      const zeile = document.createElement("div");
      zeile.className = "ferienWocheEintrag";
      const datum = document.createElement("strong");
      datum.textContent = formatiereDatum(ereignis.startDate, {
        weekday: "short",
        day: "2-digit",
        month: "2-digit"
      });
      const name = document.createElement("span");
      name.dataset.i18nIgnore = "";
      name.textContent = ereignis.name + " · " + ortText(ereignis);
      name.style.borderBottom =
        "2px solid " + farbeFuerArt(ereignis.kind);
      zeile.append(datum, name);
      elemente.woche.appendChild(zeile);
    });

    const laengeWoche = woche.find(function (ereignis) {
      return ereignis.officialDayOff &&
        ["1", "5"].includes(String(
          new Date(datumAlsUTC(ereignis.startDate)).getUTCDay()
        ));
    });
    if (laengeWoche) {
      const hinweis = document.createElement("strong");
      hinweis.textContent = "Langes Wochenende rund um " + laengeWoche.name;
      elemente.woche.appendChild(hinweis);
    }
  }

  function renderManuelleTage() {
    elemente.manuellListe.replaceChildren();
    einstellungen.manualDays
      .slice()
      .sort(function (a, b) {
        return a.date.localeCompare(b.date);
      })
      .forEach(function (tag) {
        const zeile = document.createElement("div");
        zeile.className = "ferienManuellEintrag";
        const beschreibung = document.createElement("span");
        beschreibung.dataset.i18nIgnore = "";
        beschreibung.textContent =
          formatiereDatum(tag.date) + " · " + tag.name;
        const loeschen = document.createElement("button");
        loeschen.type = "button";
        loeschen.textContent = "Löschen";
        loeschen.addEventListener("click", function () {
          einstellungen.manualDays = einstellungen.manualDays.filter(
            function (eintrag) {
              return eintrag.id !== tag.id;
            }
          );
          speichereEinstellungen(false);
          zeichneAlles();
        });
        zeile.append(beschreibung, loeschen);
        elemente.manuellListe.appendChild(zeile);
      });
  }

  function zeichneAlles() {
    aktualisiereLegende();
    renderManuelleTage();
    renderWoche();
    if (typeof window.familienplanerZeichneKalender === "function") {
      window.familienplanerZeichneKalender();
    }
  }

  function aktualisiereLaenderfelder() {
    const deutschlandAktiv = elemente.landDE.checked;
    const kroatienAktiv = elemente.landHR.checked;
    elemente.bundeslandFeld.hidden = !deutschlandAktiv;
    elemente.kroatienHinweis.hidden = !kroatienAktiv;
  }

  function aktualisiereErinnerungsfelder() {
    const deaktiviert = !elemente.erinnerungenAktiv.checked;
    erinnerungsTage.forEach(function (feld) {
      feld.disabled = deaktiviert;
    });
    elemente.schulbeginnErinnerung.disabled = deaktiviert;
  }

  function fuelleFormular() {
    elemente.landDE.checked = einstellungen.countries.DE.enabled;
    elemente.landHR.checked = einstellungen.countries.HR.enabled;
    elemente.bundesland.value =
      einstellungen.countries.DE.subdivisionCode || "DE-BY";
    elemente.kategorieSchulferien.checked = einstellungen.categories.school;
    elemente.kategorieFeiertage.checked = einstellungen.categories.public;
    elemente.kategorieSchulfrei.checked = einstellungen.categories.schoolFree;
    elemente.kategorieWeitere.checked = einstellungen.categories.other;
    elemente.brueckentage.checked = einstellungen.bridgeDays;
    elemente.farbeSchulferien.value = einstellungen.colors.school;
    elemente.farbeFeiertage.value = einstellungen.colors.public;
    elemente.farbeSchulfrei.value = einstellungen.colors.schoolFree;
    elemente.farbeWeitere.value = einstellungen.colors.other;
    elemente.farbeBruecke.value = einstellungen.colors.bridge;
    elemente.erinnerungenAktiv.checked = einstellungen.reminders.enabled;
    elemente.schulbeginnErinnerung.checked =
      einstellungen.reminders.schoolStart;
    erinnerungsTage.forEach(function (feld) {
      feld.checked = einstellungen.reminders.days.includes(Number(feld.value));
    });
    aktualisiereLaenderfelder();
    aktualisiereErinnerungsfelder();
  }

  function leseFormular() {
    einstellungen.countries.DE = {
      enabled: elemente.landDE.checked,
      subdivisionCode: elemente.bundesland.value
    };
    einstellungen.countries.HR = {
      enabled: elemente.landHR.checked,
      subdivisionCode: ""
    };
    einstellungen.categories = {
      school: elemente.kategorieSchulferien.checked,
      public: elemente.kategorieFeiertage.checked,
      schoolFree: elemente.kategorieSchulfrei.checked,
      other: elemente.kategorieWeitere.checked
    };
    einstellungen.colors = {
      school: elemente.farbeSchulferien.value,
      public: elemente.farbeFeiertage.value,
      schoolFree: elemente.farbeSchulfrei.value,
      other: elemente.farbeWeitere.value,
      bridge: elemente.farbeBruecke.value
    };
    einstellungen.bridgeDays = elemente.brueckentage.checked;
    einstellungen.reminders = {
      enabled: elemente.erinnerungenAktiv.checked,
      days: erinnerungsTage.filter(function (feld) {
        return feld.checked;
      }).map(function (feld) {
        return Number(feld.value);
      }),
      schoolStart: elemente.schulbeginnErinnerung.checked
    };
  }

  function speichereEinstellungen(datenAbrufen) {
    leseFormular();
    try {
      localStorage.setItem(
        einstellungsSchluessel,
        JSON.stringify(einstellungen)
      );
      elemente.status.textContent =
        "Einstellungen auf diesem Gerät gespeichert.";
      zeichneAlles();
      pruefeErinnerungen();
      if (datenAbrufen) void aktualisiereDaten(false);
    } catch (fehler) {
      console.error("Ferieneinstellungen konnten nicht gespeichert werden.", fehler);
      elemente.status.textContent =
        "Ferieneinstellungen konnten nicht gespeichert werden.";
    }
  }

  function regionenAusApiLaden() {
    fetch(apiBasis + "/Subdivisions?countryIsoCode=DE&languageIsoCode=DE", {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "omit"
    }).then(function (antwort) {
      if (!antwort.ok) throw new Error("HTTP " + antwort.status);
      return antwort.json();
    }).then(function (regionen) {
      if (!Array.isArray(regionen) || regionen.length === 0) return;
      const passende = regionen.filter(function (region) {
        return /^DE-[A-Z]{2}$/.test(region.code || "");
      });
      if (passende.length !== 16) return;
      const vorherigeAuswahl = elemente.bundesland.value;
      elemente.bundesland.replaceChildren();
      passende.sort(function (a, b) {
        return nameInSprache(a.name, displayLanguage).localeCompare(
          nameInSprache(b.name, displayLanguage),
          displayLanguage.toLowerCase()
        );
      }).forEach(function (region) {
        const option = document.createElement("option");
        option.value = region.code;
        option.dataset.i18nIgnore = "";
        option.textContent = nameInSprache(region.name, displayLanguage);
        elemente.bundesland.appendChild(option);
      });
      elemente.bundesland.value = passende.some(function (region) {
        return region.code === vorherigeAuswahl;
      }) ? vorherigeAuswahl : "DE-BY";
      if (einstellungen.countries.DE.subdivisionCode !== elemente.bundesland.value) {
        einstellungen.countries.DE.subdivisionCode = elemente.bundesland.value;
        speichereEinstellungen(false);
      }
    }).catch(function (fehler) {
      console.warn("Bundesländer konnten nicht aktualisiert werden; die lokale Liste bleibt verfügbar.", fehler);
    });
  }

  function fuegeManuellenTagHinzu() {
    const name = elemente.manuellName.value.trim();
    const datum = elemente.manuellDatum.value;
    if (!name || !gueltigesDatum(datum)) {
      elemente.status.textContent =
        "Bitte gib eine Bezeichnung und ein gültiges Datum ein.";
      return;
    }
    einstellungen.manualDays.push({
      id: "manual-" + Date.now().toString(36) +
        "-" + Math.random().toString(36).slice(2, 8),
      name: name,
      date: datum
    });
    elemente.manuellName.value = "";
    elemente.manuellDatum.value = "";
    speichereEinstellungen(false);
  }

  function erinnerungsSchluessel(ereignis, art, bezugsDatum, tage) {
    return [
      ereignis.id,
      art,
      bezugsDatum,
      tage,
      lokalDatum(new Date())
    ].join(":");
  }

  function erinnerungstext(ereignis, tage) {
    const anzahl = tage;
    if (ereignis.kind === "schulferien") {
      if (anzahl === 0) {
        return "Heute beginnen die " + ereignis.name +
          ". Wir wünschen euch eine wunderschöne Ferienzeit!";
      }
      return "In " + anzahl + " " +
        (anzahl === 1 ? "Tag" : "Tagen") +
        " beginnen die " + ereignis.name + "!";
    }
    if (ereignis.officialDayOff) {
      if (anzahl === 0) {
        return "Heute ist ein gesetzlicher Feiertag: " + ereignis.name + ".";
      }
      if (anzahl === 1) {
        return "Morgen ist ein gesetzlicher Feiertag: " + ereignis.name + ".";
      }
      return "In " + anzahl + " Tagen ist ein gesetzlicher Feiertag: " +
        ereignis.name + ".";
    }
    if (anzahl === 0) return "Heute ist schulfrei: " + ereignis.name + ".";
    if (anzahl === 1) return "Morgen ist schulfrei: " + ereignis.name + ".";
    return "In " + anzahl + " Tagen ist schulfrei: " + ereignis.name + ".";
  }

  function zeigeErinnerungen(nachrichten) {
    if (nachrichten.length === 0) return;
    elemente.erinnerungsListe.replaceChildren();
    nachrichten.forEach(function (nachricht) {
      const zeile = document.createElement("div");
      zeile.className = "ferienErinnerungenNachricht";
      zeile.textContent = "🌿 " + nachricht;
      elemente.erinnerungsListe.appendChild(zeile);
    });
    elemente.erinnerungsBox.hidden = false;
    if (typeof window.familienplanerSpieleHinweis === "function") {
      window.familienplanerSpieleHinweis("termin");
    }
  }

  function pruefeErinnerungen() {
    if (!einstellungen.reminders.enabled) return;
    const heute = lokalDatum(new Date());
    const aktiveTage = einstellungen.reminders.days;
    const neueNachrichten = [];
    const ereignisse = apiEreignisse().filter(function (ereignis) {
      return ["schulferien", "schulfrei", "feiertag", "weitere"]
        .includes(ereignis.kind);
    });

    ereignisse.forEach(function (ereignis) {
      const tageBisStart = tageZwischen(heute, ereignis.startDate);
      if (tageBisStart >= 0 && aktiveTage.includes(tageBisStart)) {
        const schluessel = erinnerungsSchluessel(
          ereignis,
          "start",
          ereignis.startDate,
          tageBisStart
        );
        if (!gespeicherteErinnerungen[schluessel] &&
            !sitzungsErinnerungen.has(schluessel)) {
          neueNachrichten.push(erinnerungstext(ereignis, tageBisStart));
          sitzungsErinnerungen.add(schluessel);
          gespeicherteErinnerungen[schluessel] = Date.now();
        }
      }

      if (ereignis.kind === "schulferien" &&
          einstellungen.reminders.schoolStart) {
        const schulbeginn = datumPlusTage(ereignis.endDate, 1);
        const tageBisSchulbeginn = tageZwischen(heute, schulbeginn);
        if (tageBisSchulbeginn === 2) {
          const schluessel = erinnerungsSchluessel(
            ereignis,
            "school-start",
            schulbeginn,
            tageBisSchulbeginn
          );
          if (!gespeicherteErinnerungen[schluessel] &&
              !sitzungsErinnerungen.has(schluessel)) {
            neueNachrichten.push("In 2 Tagen beginnt die Schule wieder.");
            sitzungsErinnerungen.add(schluessel);
            gespeicherteErinnerungen[schluessel] = Date.now();
          }
        }
      }
    });

    if (neueNachrichten.length > 0) {
      const cutoff = Date.now() - 30 * tageInMillisekunden;
      Object.keys(gespeicherteErinnerungen).forEach(function (key) {
        if (Number(gespeicherteErinnerungen[key]) < cutoff) {
          delete gespeicherteErinnerungen[key];
        }
      });
      try {
        localStorage.setItem(
          gesendetSchluessel,
          JSON.stringify(gespeicherteErinnerungen)
        );
      } catch (fehler) {
        console.error("Ferienerinnerungen konnten nicht als gesendet gespeichert werden.", fehler);
      }
      zeigeErinnerungen(neueNachrichten);
    }
  }

  function aktualisiereFormularMitglieder() {
    leseFormular();
    aktualisiereLaenderfelder();
    aktualisiereErinnerungsfelder();
    speichereEinstellungen(true);
  }

  window.familienplanerFeiertage = {
    renderKalenderTag: renderKalenderTag,
    hatEreignisse: function (datum) {
      return ereignisseAmDatum(datum).length > 0;
    },
    zeigeDetails: zeigeDetails,
    schliesseDetails: function () {
      elemente.details.hidden = true;
    },
    zeigeTerminFormular: zeigeTerminFormular,
    aktualisiere: function () {
      return aktualisiereDaten(true);
    },
    setLanguage: function (language) {
      const code = String(language || "").slice(0, 2).toUpperCase();
      if (!["DE", "HR", "EN"].includes(code)) {
        throw new Error("Unsupported application language: " + language);
      }
      if (displayLanguage === code) {
        zeichneAlles();
        return Promise.resolve();
      }
      displayLanguage = code;
      zeichneAlles();
      return aktualisiereDaten(true);
    },
    ereignisse: alleEreignisse
  };

  [
    elemente.landDE,
    elemente.landHR,
    elemente.bundesland
  ].forEach(function (feld) {
    feld.addEventListener("change", aktualisiereFormularMitglieder);
  });
  [
    elemente.kategorieSchulferien,
    elemente.kategorieFeiertage,
    elemente.kategorieSchulfrei,
    elemente.kategorieWeitere,
    elemente.brueckentage,
    elemente.farbeSchulferien,
    elemente.farbeFeiertage,
    elemente.farbeSchulfrei,
    elemente.farbeWeitere,
    elemente.farbeBruecke,
    elemente.erinnerungenAktiv,
    elemente.schulbeginnErinnerung
  ].forEach(function (feld) {
    feld.addEventListener("change", function () {
      aktualisiereErinnerungsfelder();
      speichereEinstellungen(false);
    });
  });
  erinnerungsTage.forEach(function (feld) {
    feld.addEventListener("change", function () {
      speichereEinstellungen(false);
    });
  });

  elemente.manuellHinzufuegen.addEventListener("click", fuegeManuellenTagHinzu);
  elemente.aktualisieren.addEventListener("click", function () {
    void aktualisiereDaten(true);
  });
  elemente.detailSchliessen.addEventListener("click", function () {
    elemente.details.hidden = true;
  });
  elemente.terminHinzufuegen.addEventListener("click", function () {
    const datum = elemente.details.dataset.date;
    if (gueltigesDatum(datum)) zeigeTerminFormular(datum);
  });
  document.getElementById("ferienErinnerungenSchliessen")
    .addEventListener("click", function () {
      elemente.erinnerungsBox.hidden = true;
    });

  window.addEventListener("online", function () {
    void aktualisiereDaten(false);
  });
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      void aktualisiereDaten(false);
      pruefeErinnerungen();
    }
  });

  fuelleFormular();
  regionenAusApiLaden();
  zeichneAlles();
  void aktualisiereDaten(false);
  window.setInterval(pruefeErinnerungen, 60000);
})();
