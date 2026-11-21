(function () {
  "use strict";

  const storageKey = "familienplanerStundenplanV1";
  const reminderKey = "familienplanerStundenplanErinnerungenV1";
  const familyKey = "familieMitglieder";
  const languageKey = "familienSprachEinstellungenV1";
  const calendarKey = "termini";
  const weekdays = [1, 2, 3, 4, 5, 6];
  const pastelColors = [
    "#A8C6B1", "#B6C7DF", "#E8C6A7", "#D7B5D9", "#E8C7CE",
    "#C5D6A8", "#A9CFD2", "#E4D78F", "#C9B9A5", "#B7B6DC"
  ];
  const view = document.getElementById("stundenplanAnsicht");
  const card = document.getElementById("stundenplanButton");
  const status = document.getElementById("stundenplanStatus");
  const holidayNotice = document.getElementById("stundenplanFerienHinweis");
  const childButtons = document.getElementById("stundenplanKindAuswahl");
  const countrySelect = document.getElementById("stundenplanSchulland");
  const regionSelect = document.getElementById("stundenplanBundesland");
  const regionLabel = document.getElementById("stundenplanBundeslandFeld");
  const saturdayCheck = document.getElementById("stundenplanSamstag");
  const subjectInput = document.getElementById("stundenplanFach");
  const daySelect = document.getElementById("stundenplanWochentag");
  const lessonForm = document.getElementById("stundenplanForm");
  const homeworkForm = document.getElementById("stundenplanHausaufgabeForm");
  const testForm = document.getElementById("stundenplanTestForm");
  const dutyForm = document.getElementById("stundenplanPflichtForm");
  const overrideForm = document.getElementById("stundenplanAenderungForm");

  let state = null;
  let stateCanBeSaved = true;
  let familyMembers = [];
  let activeChildId = "";
  let selectedDay = weekdayToday();
  let activeTab = "schedule";
  let editingLessonId = "";
  let editingHomeworkId = "";
  let editingTestId = "";
  let editingDutyId = "";
  let schoolEvents = [];
  let holidayRequest = 0;
  let updatingRegionControls = false;
  let reminderSession = new Set();
  let reminderStorage = {};

  function t(text) {
    return window.familienplanerI18n
      ? window.familienplanerI18n.t(text)
      : text;
  }

  function locale() {
    return window.familienplanerI18n
      ? window.familienplanerI18n.locale()
      : "de-DE";
  }

  function todayISO() {
    const now = new Date();
    return dateISO(now);
  }

  function dateISO(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  function dateFromISO(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return null;
    const parts = value.split("-").map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2], 12);
    return date.getFullYear() === parts[0] &&
      date.getMonth() === parts[1] - 1 &&
      date.getDate() === parts[2] ? date : null;
  }

  function datePlusDays(value, amount) {
    const date = dateFromISO(value);
    if (!date) return "";
    date.setDate(date.getDate() + amount);
    return dateISO(date);
  }

  function weekdayToday() {
    const day = new Date().getDay();
    return day === 0 ? 1 : day;
  }

  function mondayOfCurrentWeek() {
    const monday = new Date();
    monday.setHours(12, 0, 0, 0);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return monday;
  }

  function weekDate(day) {
    const date = mondayOfCurrentWeek();
    date.setDate(date.getDate() + day - 1);
    return dateISO(date);
  }

  function formatDate(value, options) {
    const date = dateFromISO(value);
    return date
      ? date.toLocaleDateString(locale(), options || {
        day: "numeric", month: "short", year: "numeric"
      })
      : "";
  }

  function weekdayName(day, style) {
    const date = new Date(2024, 0, 1 + day - 1, 12);
    return date.toLocaleDateString(locale(), { weekday: style || "long" });
  }

  function makeId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return prefix + "_" + window.crypto.randomUUID();
    }
    return prefix + "_" + Date.now().toString(36) + "_" +
      Math.random().toString(36).slice(2, 12);
  }

  function makeRecord(values, memberId, existing) {
    const now = new Date().toISOString();
    return Object.assign({}, existing || {}, values, {
      id: existing && existing.id ? existing.id : makeId("school"),
      family_id: state.family_id || null,
      user_id: state.user_id || null,
      member_id: memberId,
      created_at: existing && existing.created_at ? existing.created_at : now,
      updated_at: now
    });
  }

  function blankState() {
    return {
      version: 1,
      family_id: null,
      user_id: null,
      updated_at: new Date().toISOString(),
      members: {}
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return blankState();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) ||
          parsed.version !== 1 || !parsed.members ||
          typeof parsed.members !== "object" || Array.isArray(parsed.members)) {
        throw new Error("Stored timetable data has an unsupported format.");
      }
      Object.keys(parsed.members).forEach(function (memberId) {
        const member = parsed.members[memberId];
        if (!member || typeof member !== "object" || Array.isArray(member)) {
          throw new Error("A stored school profile has an invalid format.");
        }
        ["schedule", "homework", "tests", "duties", "overrides",
          "deleted_records"].forEach(
          function (key) {
            if (Object.prototype.hasOwnProperty.call(member, key) &&
                !Array.isArray(member[key])) {
              throw new Error("Stored school planner entries are invalid.");
            }
          }
        );
        if (member.subject_colors &&
            (typeof member.subject_colors !== "object" ||
             Array.isArray(member.subject_colors))) {
          throw new Error("Stored subject colors are invalid.");
        }
      });
      return parsed;
    } catch (error) {
      stateCanBeSaved = false;
      console.error("The stored school planner could not be read.", error);
      showStatus(t("Die lokalen Stundenplandaten konnten nicht gelesen werden."));
      return blankState();
    }
  }

  function saveState(message) {
    if (!stateCanBeSaved) {
      showStatus(t("Die lokalen Stundenplandaten konnten nicht gelesen werden."));
      return false;
    }
    state.updated_at = new Date().toISOString();
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      if (message) showStatus(t(message));
      return true;
    } catch (error) {
      console.error("School planner data could not be saved.", error);
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
        if (saved && saved.version === 1 && saved.members) {
          state = saved;
          stateCanBeSaved = true;
        }
      } catch (restoreError) {
        stateCanBeSaved = false;
        console.error(
          "School planner data could not be restored after a save failure.",
          restoreError
        );
      }
      showStatus(t("Die Änderungen konnten nicht gespeichert werden. Prüfe den freien Speicherplatz."));
      return false;
    }
  }

  function loadFamilyMembers() {
    try {
      const entries = JSON.parse(localStorage.getItem(familyKey) || "[]");
      if (!Array.isArray(entries)) {
        throw new Error("The family profile list is not an array.");
      }
      return entries.filter(function (entry) {
        return entry && typeof entry.id === "string" &&
          typeof entry.name === "string";
      });
    } catch (error) {
      console.error("Family profiles could not be read for the school planner.", error);
      showStatus(t("Dieses Kinderprofil wurde in der Familienliste nicht gefunden."));
      return [];
    }
  }

  function profilePreferences() {
    try {
      const data = JSON.parse(localStorage.getItem(languageKey) || "{}");
      return data && typeof data === "object" && !Array.isArray(data)
        ? data
        : {};
    } catch (error) {
      console.error("The active family profile could not be read.", error);
      return {};
    }
  }

  function roleOf(member) {
    const role = member && member.rolle;
    return window.familienplanerI18n
      ? window.familienplanerI18n.normalizeRole(role)
      : role;
  }

  function isChild(member) {
    return roleOf(member) === "Kind";
  }

  function isParent(member) {
    return roleOf(member) === "Mama" || roleOf(member) === "Papa";
  }

  function activeMember() {
    const id = profilePreferences().activeMemberId;
    return familyMembers.find(function (member) {
      return member.id === id;
    }) || null;
  }

  function allowedChildren() {
    const selectedProfile = activeMember();
    if (selectedProfile && isParent(selectedProfile)) {
      return familyMembers.filter(isChild);
    }
    if (selectedProfile && isChild(selectedProfile)) {
      return [selectedProfile];
    }
    return [];
  }

  function getMemberData(memberId) {
    let data = state.members[memberId];
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      data = {
        id: memberId,
        family_id: state.family_id || null,
        user_id: state.user_id || null,
        member_id: memberId,
        visibility: "member_and_parent_profiles",
        updated_at: new Date().toISOString(),
        include_saturday: false,
        school_country: "",
        school_subdivision: "",
        schedule: [],
        subject_colors: {},
        homework: [],
        tests: [],
        duties: [],
        overrides: [],
        deleted_records: []
      };
      state.members[memberId] = data;
    }
    ["schedule", "homework", "tests", "duties", "overrides",
      "deleted_records"].forEach(
      function (key) {
        if (!Array.isArray(data[key])) data[key] = [];
      }
    );
    if (!data.subject_colors || typeof data.subject_colors !== "object" ||
        Array.isArray(data.subject_colors)) {
      data.subject_colors = {};
    }
    if (typeof data.include_saturday !== "boolean") {
      data.include_saturday = false;
    }
    return data;
  }

  function addDeletion(data, recordType, record) {
    data.deleted_records.push({
      id: record.id,
      record_type: recordType,
      family_id: record.family_id || state.family_id || null,
      user_id: record.user_id || state.user_id || null,
      member_id: activeChildId,
      deleted_at: new Date().toISOString()
    });
  }

  function currentChildData() {
    return activeChildId ? getMemberData(activeChildId) : null;
  }

  function showStatus(message, clearAfter) {
    if (!message) {
      status.hidden = true;
      status.textContent = "";
      return;
    }
    status.textContent = message;
    status.hidden = false;
    if (clearAfter) {
      window.setTimeout(function () {
        if (status.textContent === message) {
          status.hidden = true;
          status.textContent = "";
        }
      }, clearAfter);
    }
  }

  function showHolidayStatus(message) {
    holidayNotice.textContent = message;
    holidayNotice.hidden = !message;
  }

  function newButton(label, className, action) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    if (className) button.className = className;
    if (action) button.addEventListener("click", action);
    return button;
  }

  function emptyMessage(container, message) {
    const paragraph = document.createElement("p");
    paragraph.className = "stundenplanLeer";
    paragraph.textContent = t(message);
    container.replaceChildren(paragraph);
  }

  function renderChildButtons() {
    childButtons.replaceChildren();
    const selectedProfile = activeMember();
    const children = allowedChildren();
    if (!selectedProfile) {
      showStatus(t("Wähle ein Eltern- oder Kinderprofil über die Spracheinstellungen aus."));
      activeChildId = "";
      childButtons.appendChild(newButton(
        t("Einstellungen öffnen"),
        "stundenplanSekundaerKnopf",
        function () {
          const settingsButton = document.getElementById("einstellungenButton");
          if (settingsButton) settingsButton.click();
        }
      ));
      return false;
    }
    if (!children.length) {
      showStatus(t("Lege zuerst ein Kinderprofil in „Unsere Familie“ an."));
      activeChildId = "";
      return false;
    }

    if (isParent(selectedProfile)) {
      children.forEach(function (child) {
        const button = newButton(child.name, "stundenplanKindKnopf");
        button.dataset.i18nIgnore = "";
        button.setAttribute("aria-label", t("Kind auswählen") + ": " + child.name);
        button.setAttribute("aria-pressed", String(child.id === activeChildId));
        button.addEventListener("click", function () {
          activeChildId = child.id;
          render();
        });
        childButtons.appendChild(button);
      });
    } else {
      activeChildId = selectedProfile.id;
      const badge = document.createElement("span");
      badge.className = "stundenplanKindKnopf";
      badge.dataset.i18nIgnore = "";
      badge.textContent = selectedProfile.name;
      badge.setAttribute("aria-current", "true");
      childButtons.appendChild(badge);
    }
    return true;
  }

  function fillWeekdaySelect(select, selected) {
    select.replaceChildren();
    weekdays.forEach(function (day) {
      if (day === 6 && !currentChildData().include_saturday) return;
      const option = document.createElement("option");
      option.value = String(day);
      option.textContent = weekdayName(day);
      select.appendChild(option);
    });
    if (selected && Array.from(select.options).some(function (option) {
      return option.value === String(selected);
    })) {
      select.value = String(selected);
    } else if (select.options.length) {
      select.value = select.options[0].value;
    }
  }

  function renderRegionControls(data) {
    updatingRegionControls = true;
    countrySelect.value = data.school_country || "";
    regionSelect.replaceChildren();
    const country = data.school_country || "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = t(country === "HR" ? "Landesweit" : "Bitte auswählen");
    regionSelect.appendChild(placeholder);

    const holidays = window.familienplanerFeiertage;
    const regions = holidays && typeof holidays.schoolRegions === "function"
      ? holidays.schoolRegions()
      : [];
    const choices = regions.filter(function (region) {
      return region.countryCode === country;
    });
    choices.forEach(function (region) {
      const option = document.createElement("option");
      option.value = region.code;
      option.textContent = t(region.name);
      regionSelect.appendChild(option);
    });
    regionSelect.value = data.school_subdivision || "";
    regionLabel.hidden = !country || country === "HR";
    regionSelect.disabled = !country;
    if (country === "HR") {
      regionSelect.value = "";
      regionSelect.disabled = true;
    }
    updatingRegionControls = false;
  }

  function updateRegionOptions() {
    if (updatingRegionControls) return;
    const data = currentChildData();
    if (!data) return;
    data.school_country = countrySelect.value;
    data.school_subdivision = data.school_country === "HR"
      ? ""
      : regionSelect.value;
    data.updated_at = new Date().toISOString();
    if (!saveState("Schulregion wurde gespeichert.")) {
      renderRegionControls(currentChildData());
      return;
    }
    renderRegionControls(currentChildData());
    loadSchoolEvents();
  }

  async function loadSchoolEvents() {
    const request = ++holidayRequest;
    schoolEvents = [];
    const data = currentChildData();
    if (!data || !data.school_country ||
        (data.school_country === "DE" && !data.school_subdivision)) {
      showHolidayStatus(t("Wähle das Land und die Region, in der dieses Kind zur Schule geht."));
      return;
    }
    const holidays = window.familienplanerFeiertage;
    if (!holidays || typeof holidays.schoolEventsForRegion !== "function") {
      showHolidayStatus(t("Keine Ferien- oder Feiertagsdaten für diese Schulregion verfügbar."));
      return;
    }

    showHolidayStatus(t("Ferien- und Feiertagsdaten konnten nicht geladen werden; verfügbare gespeicherte Daten werden verwendet."));
    try {
      const result = await holidays.schoolEventsForRegion(
        data.school_country,
        data.school_subdivision
      );
      if (request !== holidayRequest || data !== currentChildData()) return;
      schoolEvents = Array.isArray(result.events) ? result.events : [];
      if (result.unavailable || result.errors.length) {
        showHolidayStatus(t("Ferien- und Feiertagsdaten konnten nicht geladen werden; verfügbare gespeicherte Daten werden verwendet."));
      } else if (!schoolEvents.length) {
        showHolidayStatus(t("Keine Ferien- oder Feiertagsdaten für diese Schulregion verfügbar."));
      } else {
        showHolidayStatus("");
      }
      renderSchedule();
    } catch (error) {
      console.error("School holiday data could not be loaded.", error);
      if (request === holidayRequest) {
        showHolidayStatus(t("Ferien- und Feiertagsdaten konnten nicht geladen werden; verfügbare gespeicherte Daten werden verwendet."));
      }
    }
  }

  function schoolEventsOn(date) {
    return schoolEvents.filter(function (event) {
      return event.startDate <= date && event.endDate >= date;
    });
  }

  function holidayBanner(date) {
    const matching = schoolEventsOn(date);
    if (!matching.length) return null;
    const banner = document.createElement("p");
    banner.className = "stundenplanMitteilung";
    banner.dataset.i18nIgnore = "";
    const language = window.familienplanerI18n
      ? window.familienplanerI18n.language().toUpperCase()
      : "DE";
    const names = matching.map(function (event) {
      if (event.source === "manual" || event.nameLanguage === language) {
        return event.name;
      }
      const label = event.kind === "schoolHoliday"
        ? "Schulferien"
        : event.kind === "publicHoliday"
          ? "Gesetzlicher Feiertag"
          : "Schulfreier Tag";
      return t(label);
    });
    banner.textContent = t("Kein Unterricht:") + " " + names.join(", ");
    return banner;
  }

  function subjectKey(subject) {
    return String(subject || "").trim().toLocaleLowerCase();
  }

  function validColor(value) {
    return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? value : "#A8C6B1";
  }

  function defaultColor(subject) {
    const key = subjectKey(subject);
    let hash = 0;
    for (let index = 0; index < key.length; index += 1) {
      hash = ((hash << 5) - hash + key.charCodeAt(index)) | 0;
    }
    return pastelColors[Math.abs(hash) % pastelColors.length];
  }

  function colorFor(data, subject) {
    const key = subjectKey(subject);
    return validColor(data.subject_colors[key] || defaultColor(subject));
  }

  function sortedLessons(data, day, date) {
    const changes = date
      ? data.overrides.filter(function (change) {
        return change.date === date;
      })
      : [];
    let lessons = data.schedule.filter(function (lesson) {
      return Number(lesson.day) === Number(day);
    }).map(function (lesson) {
      return Object.assign({}, lesson);
    });

    changes.forEach(function (change) {
      const target = lessons.findIndex(function (lesson) {
        return lesson.id === change.lesson_id;
      });
      if (change.kind === "cancel" && target !== -1) {
        lessons.splice(target, 1);
      } else if (change.kind === "replace" && target !== -1) {
        lessons[target] = Object.assign({}, lessons[target], {
          subject: change.subject,
          notes: [lessons[target].notes, change.notes].filter(Boolean).join("\n"),
          one_time_change: true
        });
      } else if (change.kind === "add") {
        lessons.push({
          id: change.id,
          day: day,
          subject: change.subject,
          order: null,
          start: "",
          end: "",
          room: "",
          teacher: "",
          notes: change.notes,
          one_time_change: true
        });
      }
    });

    return lessons.sort(function (a, b) {
      const orderA = Number(a.order) || 9999;
      const orderB = Number(b.order) || 9999;
      return orderA - orderB ||
        String(a.start || "").localeCompare(String(b.start || "")) ||
        String(a.subject).localeCompare(String(b.subject), locale());
    });
  }

  function lessonMeta(lesson) {
    return [
      lesson.order ? t("Stunde / Reihenfolge") + ": " + lesson.order : "",
      lesson.start || lesson.end
        ? [lesson.start, lesson.end].filter(Boolean).join("–")
        : "",
      lesson.room ? t("Raum") + ": " + lesson.room : "",
      lesson.teacher ? t("Lehrkraft") + ": " + lesson.teacher : ""
    ].filter(Boolean).join(" · ");
  }

  function actionButton(label, title, action) {
    const button = newButton(label, "stundenplanIconKnopf", action);
    button.title = t(title);
    button.setAttribute("aria-label", t(title));
    return button;
  }

  function renderLesson(data, lesson, day) {
    const article = document.createElement("article");
    article.className = "stundenplanUnterricht";
    article.style.setProperty("--stundenplan-farbe", colorFor(data, lesson.subject));
    const heading = document.createElement("div");
    heading.className = "stundenplanEintragKopf";
    const title = document.createElement("strong");
    title.dataset.i18nIgnore = "";
    title.textContent = lesson.subject;
    heading.appendChild(title);

    if (!lesson.one_time_change) {
      const actions = document.createElement("div");
      actions.className = "stundenplanEintragAktionen";
      actions.appendChild(actionButton("✎", "Bearbeiten", function () {
        openLessonForm(lesson, day);
      }));
      actions.appendChild(actionButton("×", "Löschen", function () {
        if (!confirm(t("Möchtest du diese Unterrichtsstunde löschen?"))) return;
        const index = data.schedule.findIndex(function (item) {
          return item.id === lesson.id;
        });
        if (index < 0) return;
        const removed = data.schedule.splice(index, 1)[0];
        addDeletion(data, "school_schedule", removed);
        data.updated_at = new Date().toISOString();
        if (saveState("Unterricht gelöscht.")) render();
      }));
      heading.appendChild(actions);
    }
    article.appendChild(heading);

    const metaText = lessonMeta(lesson);
    if (metaText) {
      const meta = document.createElement("div");
      meta.className = "stundenplanMeta";
      meta.dataset.i18nIgnore = "";
      meta.textContent = metaText;
      article.appendChild(meta);
    }
    if (lesson.notes) {
      const note = document.createElement("p");
      note.className = "stundenplanNotiz";
      note.dataset.i18nIgnore = "";
      note.textContent = lesson.notes;
      article.appendChild(note);
    }
    if (lesson.one_time_change) {
      const changed = document.createElement("small");
      changed.className = "stundenplanMeta";
      changed.textContent = t("Einmalige Planänderungen");
      article.appendChild(changed);
    }
    return article;
  }

  function renderDay(data, day, parent, date) {
    const cardElement = document.createElement("article");
    cardElement.className = "stundenplanTagKarte";
    const heading = document.createElement("h3");
    const dayName = document.createElement("span");
    dayName.textContent = weekdayName(day);
    const dateLabel = document.createElement("small");
    dateLabel.textContent = formatDate(date, { day: "numeric", month: "short" });
    heading.append(dayName, dateLabel);
    cardElement.appendChild(heading);

    const freeDay = holidayBanner(date);
    if (freeDay) cardElement.appendChild(freeDay);
    const content = document.createElement("div");
    content.className = "stundenplanTagInhalt";
    const lessons = sortedLessons(data, day, date);
    if (lessons.length) {
      lessons.forEach(function (lesson) {
        content.appendChild(renderLesson(data, lesson, day));
      });
    } else {
      const empty = document.createElement("p");
      empty.className = "stundenplanLeer";
      empty.textContent = t("Keine Stunden für diesen Tag eingetragen.");
      content.appendChild(empty);
    }
    cardElement.appendChild(content);
    parent.appendChild(cardElement);
  }

  function renderDayButtons(data) {
    const container = document.getElementById("stundenplanSchultagAuswahl");
    container.replaceChildren();
    const days = data.include_saturday ? weekdays : weekdays.slice(0, 5);
    if (!days.includes(selectedDay)) {
      selectedDay = days.includes(weekdayToday()) ? weekdayToday() : 5;
    }
    days.forEach(function (day) {
      const button = newButton(weekdayName(day, "short"), "stundenplanTagKnopf");
      button.setAttribute("aria-pressed", String(day === selectedDay));
      button.setAttribute("aria-label", weekdayName(day));
      button.addEventListener("click", function () {
        selectedDay = day;
        renderSchedule();
      });
      container.appendChild(button);
    });
  }

  function renderSchedule() {
    const data = currentChildData();
    const weekGrid = document.getElementById("stundenplanWochenRaster");
    const dayPanel = document.getElementById("stundenplanTagesbereich");
    const changesSelect = document.getElementById("stundenplanAenderungUnterricht");
    if (!data) {
      weekGrid.replaceChildren();
      dayPanel.replaceChildren();
      return;
    }

    saturdayCheck.checked = data.include_saturday;
    fillWeekdaySelect(daySelect, selectedDay);
    const days = data.include_saturday ? weekdays : weekdays.slice(0, 5);
    weekGrid.replaceChildren();
    days.forEach(function (day) {
      renderDay(data, day, weekGrid, weekDate(day));
    });

    renderDayButtons(data);
    dayPanel.replaceChildren();
    const dayHeading = document.createElement("h3");
    dayHeading.textContent = weekdayName(selectedDay) + " · " +
      formatDate(weekDate(selectedDay), { day: "numeric", month: "long" });
    dayPanel.appendChild(dayHeading);
    const selectedHoliday = holidayBanner(weekDate(selectedDay));
    if (selectedHoliday) dayPanel.appendChild(selectedHoliday);
    const lessons = sortedLessons(data, selectedDay, weekDate(selectedDay));
    if (lessons.length) {
      const list = document.createElement("div");
      list.className = "stundenplanTagInhalt";
      lessons.forEach(function (lesson) {
        list.appendChild(renderLesson(data, lesson, selectedDay));
      });
      dayPanel.appendChild(list);
    } else {
      const empty = document.createElement("p");
      empty.className = "stundenplanLeer";
      empty.textContent = t("Keine Stunden für diesen Tag eingetragen.");
      dayPanel.appendChild(empty);
    }

    changesSelect.replaceChildren();
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = t("Bitte auswählen");
    changesSelect.appendChild(placeholder);
    data.schedule.slice().sort(function (a, b) {
      return Number(a.day) - Number(b.day) ||
        (Number(a.order) || 9999) - (Number(b.order) || 9999);
    }).forEach(function (lesson) {
      const option = document.createElement("option");
      option.value = lesson.id;
      option.textContent = weekdayName(Number(lesson.day), "short") + " · " +
        lesson.subject + (lesson.order ? " · " + lesson.order : "");
      changesSelect.appendChild(option);
    });
    renderOverrides(data);
  }

  function renderOverrides(data) {
    const container = document.getElementById("stundenplanAenderungen");
    container.replaceChildren();
    if (!data.overrides.length) {
      emptyMessage(container, "Keine einmaligen Planänderungen.");
      return;
    }
    data.overrides.slice().sort(function (a, b) {
      return a.date.localeCompare(b.date);
    }).forEach(function (change) {
      const article = document.createElement("article");
      article.className = "stundenplanAenderung";
      const heading = document.createElement("div");
      heading.className = "stundenplanEintragKopf";
      const title = document.createElement("strong");
      title.dataset.i18nIgnore = "";
      const target = data.schedule.find(function (lesson) {
        return lesson.id === change.lesson_id;
      });
      const kind = change.kind === "cancel"
        ? t("Stunde fällt aus")
        : change.kind === "replace"
          ? t("Fach ersetzen")
          : t("Zusätzliche Stunde");
      title.textContent = formatDate(change.date) + " · " + kind +
        (change.subject ? ": " + change.subject : "") +
        (target ? " · " + target.subject : "");
      heading.appendChild(title);
      heading.appendChild(actionButton("×", "Löschen", function () {
        if (!confirm(t("Möchtest du diese Änderung wirklich löschen?"))) return;
        data.overrides = data.overrides.filter(function (item) {
          return item.id !== change.id;
        });
        addDeletion(data, "schedule_override", change);
        data.updated_at = new Date().toISOString();
        if (saveState("Änderung gelöscht.")) render();
      }));
      article.appendChild(heading);
      if (change.notes) {
        const note = document.createElement("p");
        note.className = "stundenplanNotiz";
        note.dataset.i18nIgnore = "";
        note.textContent = change.notes;
        article.appendChild(note);
      }
      container.appendChild(article);
    });
  }

  function renderHomework() {
    const data = currentChildData();
    const container = document.getElementById("stundenplanHausaufgaben");
    container.replaceChildren();
    if (!data) return;
    const filter = document.getElementById("stundenplanHausaufgabenFilter").value;
    const assignments = data.homework.filter(function (item) {
      if (filter === "open") return !item.done;
      if (filter === "done") return Boolean(item.done);
      return true;
    }).slice().sort(function (a, b) {
      return String(a.due_date || "9999-12-31").localeCompare(
        String(b.due_date || "9999-12-31")
      );
    });
    if (!assignments.length) {
      emptyMessage(container, "Keine Hausaufgaben eingetragen.");
      return;
    }
    assignments.forEach(function (item) {
      const article = document.createElement("article");
      article.className = "stundenplanAufgabe" +
        (item.done ? " stundenplanAbgehakt" : "");
      const heading = document.createElement("div");
      heading.className = "stundenplanEintragKopf";
      const title = document.createElement("strong");
      title.dataset.i18nIgnore = "";
      title.textContent = item.subject;
      heading.appendChild(title);
      const actions = document.createElement("div");
      actions.className = "stundenplanEintragAktionen";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "stundenplanCheckbox";
      checkbox.checked = Boolean(item.done);
      checkbox.setAttribute("aria-label", t("Erledigt") + ": " + item.subject);
      checkbox.addEventListener("change", function () {
        item.done = checkbox.checked;
        item.updated_at = new Date().toISOString();
        data.updated_at = item.updated_at;
        if (saveState("Hausaufgabe gelöscht.")) {
          renderHomework();
          checkReminders();
        }
      });
      actions.appendChild(checkbox);
      actions.appendChild(actionButton("✎", "Bearbeiten", function () {
        openHomeworkForm(item);
      }));
      actions.appendChild(actionButton("×", "Löschen", function () {
        if (!confirm(t("Möchtest du diese Hausaufgabe wirklich löschen?"))) return;
        data.homework = data.homework.filter(function (entry) {
          return entry.id !== item.id;
        });
        addDeletion(data, "homework", item);
        data.updated_at = new Date().toISOString();
        if (saveState()) {
          renderHomework();
          checkReminders();
        }
      }));
      heading.appendChild(actions);
      article.appendChild(heading);
      const description = document.createElement("p");
      description.className = "stundenplanNotiz";
      description.dataset.i18nIgnore = "";
      description.textContent = item.description;
      article.appendChild(description);
      if (item.due_date) {
        const due = document.createElement("div");
        due.className = "stundenplanMeta";
        due.textContent = t("Fällig am") + ": " + formatDate(item.due_date);
        article.appendChild(due);
      }
      if (item.notes) {
        const note = document.createElement("p");
        note.className = "stundenplanNotiz";
        note.dataset.i18nIgnore = "";
        note.textContent = item.notes;
        article.appendChild(note);
      }
      container.appendChild(article);
    });
  }

  function renderTests() {
    const data = currentChildData();
    const container = document.getElementById("stundenplanTests");
    container.replaceChildren();
    if (!data) return;
    const tests = data.tests.slice().sort(function (a, b) {
      return a.date.localeCompare(b.date) ||
        String(a.time || "").localeCompare(String(b.time || ""));
    });
    if (!tests.length) {
      emptyMessage(container, "Keine Klassenarbeiten oder Tests eingetragen.");
      return;
    }
    tests.forEach(function (item) {
      const article = document.createElement("article");
      article.className = "stundenplanTest";
      const heading = document.createElement("div");
      heading.className = "stundenplanEintragKopf";
      const title = document.createElement("strong");
      title.dataset.i18nIgnore = "";
      const icon = document.createElement("span");
      icon.className = "stundenplanTestIkona";
      icon.textContent = "📖";
      title.append(icon, document.createTextNode(item.subject));
      heading.appendChild(title);
      const actions = document.createElement("div");
      actions.className = "stundenplanEintragAktionen";
      actions.appendChild(actionButton("✎", "Bearbeiten", function () {
        openTestForm(item);
      }));
      actions.appendChild(actionButton("×", "Löschen", function () {
        if (!confirm(t("Möchtest du diesen Test wirklich löschen?"))) return;
        data.tests = data.tests.filter(function (entry) {
          return entry.id !== item.id;
        });
        addDeletion(data, "school_test", item);
        data.updated_at = new Date().toISOString();
        if (saveState("Test gelöscht.")) {
          syncCalendarTests();
          renderTests();
        }
      }));
      heading.appendChild(actions);
      article.appendChild(heading);
      const meta = document.createElement("div");
      meta.className = "stundenplanMeta";
      meta.textContent = formatDate(item.date) +
        (item.time ? " · " + item.time : "");
      article.appendChild(meta);
      if (item.material) {
        const material = document.createElement("p");
        material.className = "stundenplanNotiz";
        material.dataset.i18nIgnore = "";
        material.textContent = t("Lernstoff") + ": " + item.material;
        article.appendChild(material);
      }
      if (item.notes) {
        const note = document.createElement("p");
        note.className = "stundenplanNotiz";
        note.dataset.i18nIgnore = "";
        note.textContent = item.notes;
        article.appendChild(note);
      }
      container.appendChild(article);
    });
  }

  function renderDuties() {
    const data = currentChildData();
    const container = document.getElementById("stundenplanPflichten");
    container.replaceChildren();
    if (!data) return;
    const duties = data.duties.slice().sort(function (a, b) {
      return a.date.localeCompare(b.date);
    });
    if (!duties.length) {
      emptyMessage(container, "Keine Schulpflichten eingetragen.");
      return;
    }
    duties.forEach(function (item) {
      const article = document.createElement("article");
      article.className = "stundenplanPflicht";
      const heading = document.createElement("div");
      heading.className = "stundenplanEintragKopf";
      const title = document.createElement("strong");
      title.dataset.i18nIgnore = "";
      title.textContent = item.title;
      heading.appendChild(title);
      const actions = document.createElement("div");
      actions.className = "stundenplanEintragAktionen";
      actions.appendChild(actionButton("✎", "Bearbeiten", function () {
        openDutyForm(item);
      }));
      actions.appendChild(actionButton("×", "Löschen", function () {
        if (!confirm(t("Möchtest du diese Schulpflicht wirklich löschen?"))) return;
        data.duties = data.duties.filter(function (entry) {
          return entry.id !== item.id;
        });
        addDeletion(data, "school_obligation", item);
        data.updated_at = new Date().toISOString();
        if (saveState("Schulpflicht gelöscht.")) {
          renderDuties();
          checkReminders();
        }
      }));
      heading.appendChild(actions);
      article.appendChild(heading);
      const meta = document.createElement("div");
      meta.className = "stundenplanMeta";
      meta.textContent = formatDate(item.date);
      article.appendChild(meta);
      if (item.notes) {
        const note = document.createElement("p");
        note.className = "stundenplanNotiz";
        note.dataset.i18nIgnore = "";
        note.textContent = item.notes;
        article.appendChild(note);
      }
      container.appendChild(article);
    });
  }

  function render() {
    familyMembers = loadFamilyMembers();
    const selected = activeMember();
    const allowed = allowedChildren();
    if (!allowed.some(function (child) { return child.id === activeChildId; })) {
      activeChildId = selected && isChild(selected)
        ? selected.id
        : allowed.length ? allowed[0].id : "";
    }
    if (!renderChildButtons()) {
      renderSchedule();
      renderHomework();
      renderTests();
      renderDuties();
      syncCalendarTests();
      return;
    }
    const data = currentChildData();
    renderRegionControls(data);
    renderSchedule();
    renderHomework();
    renderTests();
    renderDuties();
    syncCalendarTests();
    if (data.school_country) loadSchoolEvents();
    else showHolidayStatus(t("Wähle das Land und die Region, in der dieses Kind zur Schule geht."));
    checkReminders();
  }

  function openLessonForm(lesson, day) {
    const data = currentChildData();
    if (!data) return;
    editingLessonId = lesson ? lesson.id : "";
    document.getElementById("stundenplanFormTitel").textContent =
      t(lesson ? "Unterricht bearbeiten" : "Unterricht hinzufügen");
    lessonForm.reset();
    fillWeekdaySelect(daySelect, day || selectedDay);
    if (lesson) {
      subjectInput.value = lesson.subject;
      daySelect.value = String(lesson.day);
      document.getElementById("stundenplanStunde").value =
        lesson.order == null ? "" : lesson.order;
      document.getElementById("stundenplanBeginn").value = lesson.start || "";
      document.getElementById("stundenplanEnde").value = lesson.end || "";
      document.getElementById("stundenplanRaum").value = lesson.room || "";
      document.getElementById("stundenplanLehrkraft").value = lesson.teacher || "";
      document.getElementById("stundenplanUnterrichtNotiz").value =
        lesson.notes || "";
      document.getElementById("stundenplanFachfarbe").value =
        colorFor(data, lesson.subject);
    } else {
      subjectInput.value = "";
      document.getElementById("stundenplanFachfarbe").value =
        defaultColor("");
    }
    lessonForm.hidden = false;
    subjectInput.focus();
  }

  function closeForm(form) {
    form.reset();
    form.hidden = true;
  }

  function openHomeworkForm(item) {
    editingHomeworkId = item ? item.id : "";
    document.getElementById("stundenplanHausaufgabeFormTitel").textContent =
      t(item ? "Hausaufgabe bearbeiten" : "Hausaufgabe hinzufügen");
    homeworkForm.reset();
    if (item) {
      document.getElementById("stundenplanHausaufgabeFach").value = item.subject;
      document.getElementById("stundenplanHausaufgabeText").value =
        item.description;
      document.getElementById("stundenplanHausaufgabeFaellig").value =
        item.due_date || "";
      document.getElementById("stundenplanHausaufgabeNotiz").value =
        item.notes || "";
      document.getElementById("stundenplanHausaufgabeErinnerung").value =
        item.reminder_days == null ? "none" : String(item.reminder_days);
    }
    homeworkForm.hidden = false;
    document.getElementById("stundenplanHausaufgabeFach").focus();
  }

  function openTestForm(item) {
    editingTestId = item ? item.id : "";
    document.getElementById("stundenplanTestFormTitel").textContent =
      t(item ? "Test bearbeiten" : "Klassenarbeit / Test hinzufügen");
    testForm.reset();
    if (item) {
      document.getElementById("stundenplanTestFach").value = item.subject;
      document.getElementById("stundenplanTestDatum").value = item.date;
      document.getElementById("stundenplanTestZeit").value = item.time || "";
      document.getElementById("stundenplanTestStoff").value = item.material || "";
      document.getElementById("stundenplanTestNotiz").value = item.notes || "";
      document.getElementById("stundenplanTestErinnerung").value =
        item.reminder_days == null ? "none" : String(item.reminder_days);
    }
    testForm.hidden = false;
    document.getElementById("stundenplanTestFach").focus();
  }

  function openDutyForm(item) {
    editingDutyId = item ? item.id : "";
    document.getElementById("stundenplanPflichtFormTitel").textContent =
      t(item ? "Schulpflicht bearbeiten" : "Schulpflicht hinzufügen");
    dutyForm.reset();
    if (item) {
      document.getElementById("stundenplanPflichtText").value = item.title;
      document.getElementById("stundenplanPflichtDatum").value = item.date;
      document.getElementById("stundenplanPflichtNotiz").value = item.notes || "";
      document.getElementById("stundenplanPflichtErinnerung").value =
        item.reminder === "none" ? "none" : item.reminder || "evening";
    }
    dutyForm.hidden = false;
    document.getElementById("stundenplanPflichtText").focus();
  }

  function saveLesson(event) {
    event.preventDefault();
    const data = currentChildData();
    if (!data) return;
    const subject = subjectInput.value.trim();
    const day = Number(daySelect.value);
    if (!subject || !weekdays.includes(day)) {
      showStatus(t("Fach und Wochentag sind erforderlich."));
      return;
    }
    const existing = data.schedule.find(function (item) {
      return item.id === editingLessonId;
    });
    const colorInput = document.getElementById("stundenplanFachfarbe");
    const color = validColor(colorInput.value);
    data.subject_colors[subjectKey(subject)] = color;
    const values = {
      record_type: "school_schedule",
      day: day,
      subject: subject,
      order: document.getElementById("stundenplanStunde").value
        ? Number(document.getElementById("stundenplanStunde").value)
        : null,
      start: document.getElementById("stundenplanBeginn").value,
      end: document.getElementById("stundenplanEnde").value,
      room: document.getElementById("stundenplanRaum").value.trim(),
      teacher: document.getElementById("stundenplanLehrkraft").value.trim(),
      notes: document.getElementById("stundenplanUnterrichtNotiz").value.trim()
    };
    const record = makeRecord(values, activeChildId, existing);
    if (existing) {
      data.schedule[data.schedule.indexOf(existing)] = record;
    } else {
      data.schedule.push(record);
    }
    data.updated_at = record.updated_at;
    if (saveState("Unterricht gespeichert.")) {
      closeForm(lessonForm);
      editingLessonId = "";
      render();
    }
  }

  function saveHomework(event) {
    event.preventDefault();
    const data = currentChildData();
    if (!data) return;
    const subject = document.getElementById("stundenplanHausaufgabeFach")
      .value.trim();
    const description = document.getElementById("stundenplanHausaufgabeText")
      .value.trim();
    if (!subject || !description) {
      showStatus(t("Fach und Beschreibung sind erforderlich."));
      return;
    }
    const due = document.getElementById("stundenplanHausaufgabeFaellig").value;
    if (due && !dateFromISO(due)) {
      showStatus(t("Bitte wähle ein gültiges Datum."));
      return;
    }
    const existing = data.homework.find(function (item) {
      return item.id === editingHomeworkId;
    });
    const reminder = document.getElementById("stundenplanHausaufgabeErinnerung")
      .value;
    const record = makeRecord({
      record_type: "homework",
      subject: subject,
      description: description,
      due_date: due,
      notes: document.getElementById("stundenplanHausaufgabeNotiz").value.trim(),
      reminder_days: reminder === "none" ? null : Number(reminder),
      done: existing ? Boolean(existing.done) : false
    }, activeChildId, existing);
    if (existing) {
      data.homework[data.homework.indexOf(existing)] = record;
    } else {
      data.homework.push(record);
    }
    data.updated_at = record.updated_at;
    if (saveState("Hausaufgabe gespeichert.")) {
      closeForm(homeworkForm);
      editingHomeworkId = "";
      renderHomework();
      checkReminders();
    }
  }

  function saveTest(event) {
    event.preventDefault();
    const data = currentChildData();
    if (!data) return;
    const subject = document.getElementById("stundenplanTestFach").value.trim();
    const date = document.getElementById("stundenplanTestDatum").value;
    if (!subject || !dateFromISO(date)) {
      showStatus(t("Fach und Datum sind erforderlich."));
      return;
    }
    const existing = data.tests.find(function (item) {
      return item.id === editingTestId;
    });
    const reminder = document.getElementById("stundenplanTestErinnerung").value;
    const record = makeRecord({
      record_type: "school_test",
      subject: subject,
      date: date,
      time: document.getElementById("stundenplanTestZeit").value,
      material: document.getElementById("stundenplanTestStoff").value.trim(),
      notes: document.getElementById("stundenplanTestNotiz").value.trim(),
      reminder_days: reminder === "none" ? null : Number(reminder),
      member_name: (familyMembers.find(function (member) {
        return member.id === activeChildId;
      }) || {}).name || "",
      member_color: (familyMembers.find(function (member) {
        return member.id === activeChildId;
      }) || {}).farbe || "#A8C6B1"
    }, activeChildId, existing);
    if (existing) {
      data.tests[data.tests.indexOf(existing)] = record;
    } else {
      data.tests.push(record);
    }
    data.updated_at = record.updated_at;
    if (saveState("Test gespeichert.")) {
      closeForm(testForm);
      editingTestId = "";
      syncCalendarTests();
      renderTests();
      checkReminders();
    }
  }

  function saveDuty(event) {
    event.preventDefault();
    const data = currentChildData();
    if (!data) return;
    const title = document.getElementById("stundenplanPflichtText").value.trim();
    const date = document.getElementById("stundenplanPflichtDatum").value;
    if (!title || !dateFromISO(date)) {
      showStatus(t("Aufgabe und Datum sind erforderlich."));
      return;
    }
    const existing = data.duties.find(function (item) {
      return item.id === editingDutyId;
    });
    const record = makeRecord({
      record_type: "school_obligation",
      title: title,
      date: date,
      notes: document.getElementById("stundenplanPflichtNotiz").value.trim(),
      reminder: document.getElementById("stundenplanPflichtErinnerung").value
    }, activeChildId, existing);
    if (existing) {
      data.duties[data.duties.indexOf(existing)] = record;
    } else {
      data.duties.push(record);
    }
    data.updated_at = record.updated_at;
    if (saveState("Schulpflicht gespeichert.")) {
      closeForm(dutyForm);
      editingDutyId = "";
      renderDuties();
      checkReminders();
    }
  }

  function saveOverride(event) {
    event.preventDefault();
    const data = currentChildData();
    if (!data) return;
    const date = document.getElementById("stundenplanAenderungDatum").value;
    const kind = document.getElementById("stundenplanAenderungArt").value;
    const lessonId = document.getElementById("stundenplanAenderungUnterricht")
      .value;
    const subject = document.getElementById("stundenplanAenderungFach").value
      .trim();
    if (!dateFromISO(date)) {
      showStatus(t("Bitte wähle ein gültiges Datum."));
      return;
    }
    if ((kind === "cancel" || kind === "replace") &&
        !data.schedule.some(function (lesson) { return lesson.id === lessonId; })) {
      showStatus(t("Bitte wähle zuerst ein Fach aus dem Wochenplan."));
      return;
    }
    if (kind === "cancel" || kind === "replace") {
      const target = data.schedule.find(function (lesson) {
        return lesson.id === lessonId;
      });
      const overrideDay = ((dateFromISO(date).getDay() + 6) % 7) + 1;
      if (target && Number(target.day) !== overrideDay) {
        showStatus(t("Bitte wähle eine Stunde dieses Wochentags."));
        return;
      }
    }
    if ((kind === "replace" || kind === "add") && !subject) {
      showStatus(t("Fach und Beschreibung sind erforderlich."));
      return;
    }
    const record = makeRecord({
      record_type: "schedule_override",
      date: date,
      kind: kind,
      lesson_id: lessonId || null,
      subject: subject,
      notes: document.getElementById("stundenplanAenderungNotiz").value.trim()
    }, activeChildId);
    data.overrides.push(record);
    data.updated_at = record.updated_at;
    if (saveState("Änderung gespeichert.")) {
      overrideForm.reset();
      document.getElementById("stundenplanAenderungUnterricht").disabled = false;
      renderSchedule();
    }
  }

  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll("[data-stundenplan-tab]").forEach(
      function (button) {
        const selected = button.getAttribute("data-stundenplan-tab") === tab;
        button.setAttribute("aria-selected", String(selected));
      }
    );
    document.querySelectorAll("[data-stundenplan-panel]").forEach(
      function (panel) {
        panel.hidden = panel.getAttribute("data-stundenplan-panel") !== tab;
      }
    );
  }

  function localReminderKeys() {
    try {
      const saved = JSON.parse(localStorage.getItem(reminderKey) || "{}");
      return saved && typeof saved === "object" && !Array.isArray(saved)
        ? saved
        : {};
    } catch (error) {
      console.error("School planner reminder history could not be read.", error);
      return {};
    }
  }

  function accessibleReminderMembers() {
    const selected = activeMember();
    return selected && isParent(selected)
      ? familyMembers.filter(isChild)
      : selected && isChild(selected)
        ? [selected]
        : [];
  }

  function reminderText(category, item, member) {
    const prefix = member && accessibleReminderMembers().length > 1
      ? member.name + " · "
      : "";
    const base = category === "homework"
      ? t("Hausaufgabe fällig:")
      : category === "test"
        ? t("Lernzeit:")
        : t("Schulaufgabe:");
    const title = category === "homework"
      ? item.subject + ": " + item.description
      : category === "test"
        ? item.subject
        : item.title;
    return prefix + base + " " + title +
      (item.date || item.due_date
        ? " · " + formatDate(item.date || item.due_date)
        : "");
  }

  function checkReminders() {
    const today = todayISO();
    const notices = [];
    const members = accessibleReminderMembers();
    members.forEach(function (member) {
      const data = state.members[member.id];
      if (!data) return;
      ["homework", "tests"].forEach(function (kind) {
        (data[kind] || []).forEach(function (item) {
          const date = kind === "homework" ? item.due_date : item.date;
          if (!date || (kind === "homework" && item.done) ||
              item.reminder_days == null) return;
          const trigger = datePlusDays(date, -Number(item.reminder_days));
          if (!trigger || today < trigger ||
              (kind === "tests" && today > date)) return;
          const key = kind + ":" + item.id + ":" + trigger;
          if (reminderStorage[key] || reminderSession.has(key)) return;
          reminderSession.add(key);
          reminderStorage[key] = new Date().toISOString();
          notices.push(reminderText(
            kind === "homework" ? "homework" : "test",
            item,
            member
          ));
        });
      });
      (data.duties || []).forEach(function (item) {
        if (item.reminder === "none") return;
        const trigger = item.reminder === "same"
          ? item.date
          : datePlusDays(item.date, -1);
        if (!trigger || today < trigger || today > item.date) return;
        if (item.reminder === "evening" && today === trigger &&
            new Date().getHours() < 18) return;
        const key = "duty:" + item.id + ":" + trigger;
        if (reminderStorage[key] || reminderSession.has(key)) return;
        reminderSession.add(key);
        reminderStorage[key] = new Date().toISOString();
        notices.push(reminderText("duty", item, member));
      });
    });

    if (!notices.length) return;
    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
    Object.keys(reminderStorage).forEach(function (key) {
      if (Date.parse(reminderStorage[key]) < cutoff) delete reminderStorage[key];
    });
    try {
      localStorage.setItem(reminderKey, JSON.stringify(reminderStorage));
    } catch (error) {
      console.error("School planner reminder history could not be saved.", error);
    }
    showStatus(notices.join(" · "));
    if (typeof window.familienplanerSpieleHinweis === "function") {
      window.familienplanerSpieleHinweis("termin");
    }
  }

  function calendarEventsForProfile(events) {
    const selected = activeMember();
    return events.filter(function (event) {
      if (!event || !event.school_test_id) return true;
      if (!selected) return false;
      if (isParent(selected)) return true;
      return isChild(selected) && event.school_child_id === selected.id;
    });
  }

  function syncCalendarTests() {
    if (!state || !Array.isArray(familyMembers)) return;
    let events;
    try {
      events = JSON.parse(localStorage.getItem(calendarKey) || "[]");
      if (!Array.isArray(events)) {
        throw new Error("Stored calendar data is not an array.");
      }
    } catch (error) {
      console.error("School tests could not be synchronized with the calendar.", error);
      showStatus(t("Die lokalen Stundenplandaten konnten nicht gelesen werden."));
      return;
    }

    const testsById = new Map();
    Object.keys(state.members).forEach(function (memberId) {
      const data = state.members[memberId];
      if (!data || !Array.isArray(data.tests)) return;
      const child = familyMembers.find(function (member) {
        return member.id === memberId;
      }) || { id: memberId, name: "", farbe: "#A8C6B1" };
      data.tests.forEach(function (test) {
        testsById.set(test.id, { test: test, child: child });
      });
    });

    const testEventsSeen = new Set();
    const kept = events.filter(function (event) {
      if (!event || !event.school_test_id) return true;
      if (!testsById.has(event.school_test_id) ||
          testEventsSeen.has(event.school_test_id)) return false;
      testEventsSeen.add(event.school_test_id);
      return true;
    });
    testsById.forEach(function (entry, testId) {
      const test = entry.test;
      const child = entry.child;
      const eventId = "school-test-" + testId;
      const existing = kept.find(function (event) {
        return event && event.school_test_id === testId;
      });
      const title = "📖 " + t("Klassenarbeit") + ": " + test.subject;
      const event = Object.assign({}, existing || {}, {
        id: eventId,
        name: title,
        datum: test.date,
        zeit: test.time || "09:00",
        notiz: [test.material, test.notes].filter(Boolean).join("\n"),
        status: existing && existing.status ? existing.status : "offen",
        prioritaet: "normal",
        erinnerungen: [],
        familienmitglied: child.name || test.member_name || "",
        familienfarbe: child.farbe || test.member_color || "#A8C6B1",
        school_test_id: testId,
        school_child_id: child.id,
        school_test_subject: test.subject,
        family_id: state.family_id || null,
        updated_at: test.updated_at || new Date().toISOString()
      });
      const index = kept.findIndex(function (item) {
        return item && item.school_test_id === testId;
      });
      if (index === -1) kept.push(event);
      else kept[index] = event;
    });

    if (kept.length === events.length &&
        kept.every(function (event, index) {
          return JSON.stringify(event) === JSON.stringify(events[index]);
        })) return;

    try {
      localStorage.setItem(calendarKey, JSON.stringify(kept));
      if (typeof window.familienplanerTermineListenZeichnen === "function") {
        window.familienplanerTermineListenZeichnen(kept);
      }
      if (typeof window.familienplanerAktualisiereWochenTermine === "function") {
        window.familienplanerAktualisiereWochenTermine();
      }
      if (typeof window.familienplanerZeichneKalender === "function") {
        window.familienplanerZeichneKalender();
      }
    } catch (error) {
      console.error("School test calendar events could not be saved.", error);
      showStatus(t("Die Änderungen konnten nicht gespeichert werden. Prüfe den freien Speicherplatz."));
    }
  }

  function bindEvents() {
    card.addEventListener("click", function () {
      view.hidden = !view.hidden;
      card.setAttribute("aria-expanded", String(!view.hidden));
      if (!view.hidden) {
        render();
        view.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        card.click();
      }
    });
    document.getElementById("stundenplanZurueck").addEventListener("click", function () {
      view.hidden = true;
      card.setAttribute("aria-expanded", "false");
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    document.querySelectorAll("[data-stundenplan-tab]").forEach(
      function (button) {
        button.addEventListener("click", function () {
          switchTab(button.getAttribute("data-stundenplan-tab"));
        });
      }
    );
    document.getElementById("stundenplanUnterrichtHinzufuegen")
      .addEventListener("click", function () { openLessonForm(null, selectedDay); });
    document.getElementById("stundenplanHausaufgabeHinzufuegen")
      .addEventListener("click", function () { openHomeworkForm(null); });
    document.getElementById("stundenplanTestHinzufuegen")
      .addEventListener("click", function () { openTestForm(null); });
    document.getElementById("stundenplanPflichtHinzufuegen")
      .addEventListener("click", function () { openDutyForm(null); });
    lessonForm.addEventListener("submit", saveLesson);
    homeworkForm.addEventListener("submit", saveHomework);
    testForm.addEventListener("submit", saveTest);
    dutyForm.addEventListener("submit", saveDuty);
    overrideForm.addEventListener("submit", saveOverride);
    document.getElementById("stundenplanUnterrichtAbbrechen")
      .addEventListener("click", function () { closeForm(lessonForm); });
    document.getElementById("stundenplanHausaufgabeAbbrechen")
      .addEventListener("click", function () { closeForm(homeworkForm); });
    document.getElementById("stundenplanTestAbbrechen")
      .addEventListener("click", function () { closeForm(testForm); });
    document.getElementById("stundenplanPflichtAbbrechen")
      .addEventListener("click", function () { closeForm(dutyForm); });
    saturdayCheck.addEventListener("change", function () {
      const data = currentChildData();
      if (!data) return;
      data.include_saturday = saturdayCheck.checked;
      data.updated_at = new Date().toISOString();
      saveState();
      renderSchedule();
    });
    countrySelect.addEventListener("change", function () {
      updatingRegionControls = true;
      const data = currentChildData();
      if (!data) {
        updatingRegionControls = false;
        return;
      }
      data.school_country = countrySelect.value;
      data.school_subdivision = "";
      renderRegionControls(data);
      updatingRegionControls = false;
      updateRegionOptions();
    });
    regionSelect.addEventListener("change", updateRegionOptions);
    document.getElementById("stundenplanHausaufgabenFilter")
      .addEventListener("change", renderHomework);
    subjectInput.addEventListener("input", function () {
      const data = currentChildData();
      if (!data) return;
      const color = data.subject_colors[subjectKey(subjectInput.value)];
      if (color) {
        document.getElementById("stundenplanFachfarbe").value = validColor(color);
      }
    });
    document.getElementById("stundenplanAenderungArt").addEventListener(
      "change",
      function (event) {
        const isAdd = event.target.value === "add";
        document.getElementById("stundenplanAenderungUnterricht").disabled = isAdd;
      }
    );
    document.addEventListener("familienplaner:languagechange", function () {
      showStatus("");
      render();
      window.setTimeout(function () {
        if (!view.hidden) loadSchoolEvents();
      }, 0);
    });
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) checkReminders();
    });
    window.addEventListener("storage", function (event) {
      if (event.key === storageKey || event.key === familyKey ||
          event.key === languageKey || event.key === calendarKey) {
        stateCanBeSaved = true;
        state = loadState();
        familyMembers = loadFamilyMembers();
        if (!view.hidden) render();
      }
    });
  }

  function initialize() {
    state = loadState();
    familyMembers = loadFamilyMembers();
    reminderStorage = localReminderKeys();
    switchTab(activeTab);
    bindEvents();
    render();
    window.setInterval(checkReminders, 30000);
  }

  window.familienplanerStundenplan = {
    filterCalendarEvents: calendarEventsForProfile,
    syncCalendarTests: syncCalendarTests
  };

  initialize();
})();
